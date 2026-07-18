"""
Score Institutional/Sovereign prospects: 4 categories via Gemini tier-judgment, 2 via SBERT similarity.

Reads discovery/raw/institutional-sovereign/*.json (deduplicated), writes
discovery/intermediate/institutional-sovereign.csv.
Resumable: reruns skip prospects already present in the output CSV, results saved incrementally.

Calibration note: floor-ceiling values reused from the Family Office calibration (v1, 29 real
prospects) as a placeholder - see KNOWN_ISSUES.md.

Usage:
    python score_institutional_sovereign.py
"""

import csv
import json
import time
from pathlib import Path

from dotenv import load_dotenv
from google import genai
from google.genai import errors, types
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer, util

SCRIPT_DIR = Path(__file__).parent
RAW_DIR = SCRIPT_DIR / "raw" / "institutional-sovereign"
INTERMEDIATE_DIR = SCRIPT_DIR / "intermediate"
MODEL_NAME = "gemini-2.5-flash"
SBERT_MODEL_NAME = "all-MiniLM-L6-v2"
SECONDS_BETWEEN_CALLS = 13
MAX_RETRIES = 4

SECTOR_REFERENCE_TEXT = (
    "Trade, infrastructure, energy, logistics, digital infrastructure, real estate, "
    "ports, technology, industrial platforms, and emerging markets investment activity."
)

STRATEGIC_ADJACENCY_REFERENCE_TEXT = (
    "TBP's neutral global trade infrastructure and corridor-formation thesis, including "
    "the Protocol Establishment Round and future corridor, city, port, energy, data and "
    "digital-infrastructure opportunities such as the New York/Newark North America corridor, "
    "London Canary Wharf, the Southeast Asia/Indonesia corridor, the Saudi Red Sea corridor, "
    "and Central Asia trade corridors."
)

TIER_RUBRIC = """For each category below, judge which ONE tier the evidence supports, and give a \
one-sentence reason. Base your judgment ONLY on the evidence given, do not guess beyond it.

1. institutional_credibility (max 20) - "Is there evidence this is a real, established, credible \
institution?"
   Clear=20: Well-documented, established institution with clear public track record (e.g. state-backed fund, major regulated entity)
   Reasonably Clear=14: Plausibly credible based on structure/positioning, limited specific verification
   Ambiguous=8: Mixed or unclear signals about institutional standing
   Unclear=0: No basis to assess credibility

2. capital_scale (max 20) - "Is there evidence of significant capital scale (AUM, fund size, \
deployment capacity)?"
   Clear=20: Explicit large capital figures stated (e.g. specific AUM/fund size)
   Reasonably Clear=14: General indication of scale without specific figures
   Ambiguous=8: Vague or unclear scale indicators
   Unclear=0: No evidence of capital scale

3. platform_validation_value (max 10) - "Would this institution's involvement lend meaningful \
credibility/validation to TBP's platform?"
   Clear=10: High-profile, widely recognized institution whose involvement would be a clear credibility signal
   Reasonably Clear=7: Reasonably well-regarded, moderate validation value
   Ambiguous=3: Limited or unclear validation value
   Unclear=0: No basis to assess

4. engagement_route_quality (max 10) - "Is there a realistic pathway to engage this institution \
(public contacts, official channels, advisers)?"
   Clear=10: Named decision-maker and/or direct official contact route
   Reasonably Clear=7: One of the two present
   Ambiguous=3: Only generic/indirect route
   Unclear=0: No pathway found"""

FIELDNAMES = [
    "Country", "Name", "Comparison Text",
    "Institutional Credibility Score", "Institutional Credibility Explanation",
    "Capital Scale Score", "Capital Scale Explanation",
    "Platform Validation Value Score", "Platform Validation Value Explanation",
    "Engagement Route Quality Score", "Engagement Route Quality Explanation",
    "Infrastructure/Energy/Trade Alignment Cosine", "Infrastructure/Energy/Trade Alignment Score",
    "Strategic Geography Cosine", "Strategic Geography Score",
    "Total Score",
]

SECTOR_FLOOR = 0.2165
SECTOR_CEILING = 0.3341
SECTOR_MAX_POINTS = 25
GEOGRAPHY_FLOOR = 0.0875
GEOGRAPHY_CEILING = 0.2346
GEOGRAPHY_MAX_POINTS = 15


class TierJudgment(BaseModel):
    tier: str
    points: int
    reason: str


class InstitutionalSovereignTiers(BaseModel):
    institutional_credibility: TierJudgment
    capital_scale: TierJudgment
    platform_validation_value: TierJudgment
    engagement_route_quality: TierJudgment


def calibrated_score(cosine: float, floor: float, ceiling: float, max_points: int) -> float:
    normalized = max(0.0, min(1.0, (cosine - floor) / (ceiling - floor)))
    return round(max_points * normalized, 2)


def load_prospects() -> list[dict]:
    prospects = []
    for json_path in sorted(RAW_DIR.glob("*.json")):
        data = json.loads(json_path.read_text(encoding="utf-8"))
        meta = data.get("run_metadata", {})
        for p in data.get("prospects", []):
            p["_country"] = (meta.get("country") or "").strip().title()
            prospects.append(p)
    return prospects


def dedupe(prospects: list[dict]) -> list[dict]:
    seen = set()
    result = []
    for p in prospects:
        key = (p["_country"].lower(), p["name"].strip().lower())
        if key in seen:
            continue
        seen.add(key)
        result.append(p)
    return result


def load_already_scored(csv_path: Path) -> set[tuple[str, str]]:
    if not csv_path.exists():
        return set()
    with csv_path.open(encoding="utf-8") as f:
        return {(row["Country"].lower(), row["Name"].strip().lower()) for row in csv.DictReader(f)}


def build_comparison_text(p: dict) -> str:
    parts = [p.get("brief_description", "")]
    parts += p.get("sectors", [])
    signals = p.get("scoring_signals", {})
    parts += [v for v in signals.values() if v]
    return " ".join(str(x) for x in parts if x)


def judge_tiers(client: genai.Client, p: dict) -> InstitutionalSovereignTiers:
    signals = p.get("scoring_signals", {})
    evidence_lines = "\n".join(f"{k}: {v}" for k, v in signals.items() if v)
    prompt = f"""{TIER_RUBRIC}

PROSPECT EVIDENCE:
Name: {p.get('name')}
Description: {p.get('brief_description')}
{evidence_lines}"""

    for attempt in range(MAX_RETRIES):
        try:
            response = client.models.generate_content(
                model=MODEL_NAME,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=InstitutionalSovereignTiers,
                ),
            )
            return InstitutionalSovereignTiers.model_validate_json(response.text)
        except errors.APIError as exc:
            if attempt == MAX_RETRIES - 1:
                raise
            wait = 15 * (attempt + 1)
            print(f"    API error ({exc}), retrying in {wait}s...")
            time.sleep(wait)


def compute_similarity(sbert_model: SentenceTransformer, reference_text: str, comparison_text: str) -> float:
    emb_ref, emb_comp = sbert_model.encode([reference_text, comparison_text])
    return float(util.cos_sim(emb_ref, emb_comp).item())


def main():
    load_dotenv(SCRIPT_DIR / ".env")
    client = genai.Client()
    sbert_model = SentenceTransformer(SBERT_MODEL_NAME)

    INTERMEDIATE_DIR.mkdir(exist_ok=True)
    out_path = INTERMEDIATE_DIR / "institutional-sovereign.csv"

    prospects = dedupe(load_prospects())
    already_scored = load_already_scored(out_path)
    remaining = [
        p for p in prospects
        if (p["_country"].lower(), p["name"].strip().lower()) not in already_scored
    ]

    print(f"{len(prospects)} deduplicated prospects total, {len(already_scored)} already scored, {len(remaining)} to go.")
    if not remaining:
        print("Nothing to do.")
        return

    write_header = not out_path.exists()
    with out_path.open("a", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=FIELDNAMES)
        if write_header:
            writer.writeheader()

        for i, p in enumerate(remaining, 1):
            print(f"  [{i}/{len(remaining)}] {p['name']}")
            if i > 1:
                time.sleep(SECONDS_BETWEEN_CALLS)

            comparison_text = build_comparison_text(p)
            tiers = judge_tiers(client, p)
            sector_sim = compute_similarity(sbert_model, SECTOR_REFERENCE_TEXT, comparison_text)
            geography_sim = compute_similarity(sbert_model, STRATEGIC_ADJACENCY_REFERENCE_TEXT, comparison_text)
            sector_score = calibrated_score(sector_sim, SECTOR_FLOOR, SECTOR_CEILING, SECTOR_MAX_POINTS)
            geography_score = calibrated_score(geography_sim, GEOGRAPHY_FLOOR, GEOGRAPHY_CEILING, GEOGRAPHY_MAX_POINTS)
            total_score = round(
                tiers.institutional_credibility.points
                + tiers.capital_scale.points
                + tiers.platform_validation_value.points
                + tiers.engagement_route_quality.points
                + sector_score
                + geography_score,
                2,
            )

            writer.writerow({
                "Country": p["_country"],
                "Name": p["name"],
                "Comparison Text": comparison_text,
                "Institutional Credibility Score": tiers.institutional_credibility.points,
                "Institutional Credibility Explanation": f"{tiers.institutional_credibility.tier} - {tiers.institutional_credibility.reason}",
                "Capital Scale Score": tiers.capital_scale.points,
                "Capital Scale Explanation": f"{tiers.capital_scale.tier} - {tiers.capital_scale.reason}",
                "Platform Validation Value Score": tiers.platform_validation_value.points,
                "Platform Validation Value Explanation": f"{tiers.platform_validation_value.tier} - {tiers.platform_validation_value.reason}",
                "Engagement Route Quality Score": tiers.engagement_route_quality.points,
                "Engagement Route Quality Explanation": f"{tiers.engagement_route_quality.tier} - {tiers.engagement_route_quality.reason}",
                "Infrastructure/Energy/Trade Alignment Cosine": round(sector_sim, 4),
                "Infrastructure/Energy/Trade Alignment Score": sector_score,
                "Strategic Geography Cosine": round(geography_sim, 4),
                "Strategic Geography Score": geography_score,
                "Total Score": total_score,
            })
            f.flush()

    print(f"Done. See {out_path}")


if __name__ == "__main__":
    main()
