"""
Score Angel Investor prospects: 4 categories via Gemini tier-judgment, 2 via SBERT similarity.

Reads discovery/raw/angel-investor/*.json (deduplicated), writes discovery/intermediate/angel-investor.csv.
Resumable: reruns skip prospects already present in the output CSV, results saved incrementally.

Calibration note: the Sector Relevance / Strategic Relevance floor-ceiling values are reused
from the Family Office calibration (v1, 29 real prospects) as a placeholder, since Angel Investor
doesn't yet have enough real gathered data of its own to calibrate independently. Revisit once
more Angel Investor prospects have been scored.

Usage:
    python score_angel_investor.py
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
RAW_DIR = SCRIPT_DIR / "raw" / "angel-investor"
INTERMEDIATE_DIR = SCRIPT_DIR / "intermediate"
MODEL_NAME = "gemini-2.5-flash"
SBERT_MODEL_NAME = "all-MiniLM-L6-v2"
SECONDS_BETWEEN_CALLS = 13  # free tier: 5 requests/minute for gemini-2.5-flash
MAX_RETRIES = 4

# Reused as-is from Family Office: these describe TBP's own sector interests and corridor
# thesis, not "what makes an ideal prospect" - so they don't need to vary per circle.
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

1. capital_connector_value (max 20) - "Does the prospect show evidence of ability to connect or \
bring other investors/capital into opportunities?"
   Clear=20: Explicit track record or stated role as a capital connector/introducer of other investors
   Reasonably Clear=14: Implied connector role (e.g. described as well-networked investor/adviser), no explicit track record
   Ambiguous=8: Some investment activity mentioned, no clear connector role
   Unclear=0: No evidence of connector capability

2. network_quality (max 15) - "Is there evidence of a reputable, relevant professional network?"
   Clear=15: Named affiliations/networks or explicit reputation signals
   Reasonably Clear=10: General implied credibility, no specific network evidence
   Ambiguous=5: Minimal or vague signals
   Unclear=0: No evidence

3. early_visibility (max 10) - "Could the prospect realistically help generate early visibility \
or introductions for TBP?"
   Clear=10: Explicit history of introducing/promoting opportunities, or a public visibility role
   Reasonably Clear=7: Plausible given their role/position, not explicitly evidenced
   Ambiguous=3: Weak or indirect basis
   Unclear=0: No evidence

4. governance_suitability (max 10) - "Does the prospect show sound governance/ethical conduct \
rather than speculative or reputationally risky behavior?"
   Clear=10: Explicit governance/professional-conduct language, no red flags
   Reasonably Clear=7: Some positive signals, no red flags
   Ambiguous=3: Signals absent or mixed
   Unclear=0: Speculative or red-flag language present"""

FIELDNAMES = [
    "Country", "Name", "Comparison Text",
    "Capital Connector Value Score", "Capital Connector Value Explanation",
    "Network Quality Score", "Network Quality Explanation",
    "Early Visibility Score", "Early Visibility Explanation",
    "Governance Suitability Score", "Governance Suitability Explanation",
    "Sector Relevance Cosine", "Sector Relevance Score",
    "Strategic Relevance to TBP Cosine", "Strategic Relevance to TBP Score",
    "Total Score",
]

# v1 calibration - REUSED from Family Office (29 real prospects), not yet calibrated on
# Angel Investor's own data. Revisit once enough real Angel Investor prospects are gathered.
SECTOR_RELEVANCE_FLOOR = 0.2165
SECTOR_RELEVANCE_CEILING = 0.3341
STRATEGIC_RELEVANCE_FLOOR = 0.0875
STRATEGIC_RELEVANCE_CEILING = 0.2346
SECTOR_RELEVANCE_MAX_POINTS = 20
STRATEGIC_RELEVANCE_MAX_POINTS = 25


class TierJudgment(BaseModel):
    tier: str
    points: int
    reason: str


class AngelInvestorTiers(BaseModel):
    capital_connector_value: TierJudgment
    network_quality: TierJudgment
    early_visibility: TierJudgment
    governance_suitability: TierJudgment


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


def judge_tiers(client: genai.Client, p: dict) -> AngelInvestorTiers:
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
                    response_schema=AngelInvestorTiers,
                ),
            )
            return AngelInvestorTiers.model_validate_json(response.text)
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
    out_path = INTERMEDIATE_DIR / "angel-investor.csv"

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
            strategic_sim = compute_similarity(sbert_model, STRATEGIC_ADJACENCY_REFERENCE_TEXT, comparison_text)
            sector_score = calibrated_score(sector_sim, SECTOR_RELEVANCE_FLOOR, SECTOR_RELEVANCE_CEILING, SECTOR_RELEVANCE_MAX_POINTS)
            strategic_score = calibrated_score(strategic_sim, STRATEGIC_RELEVANCE_FLOOR, STRATEGIC_RELEVANCE_CEILING, STRATEGIC_RELEVANCE_MAX_POINTS)
            total_score = round(
                tiers.capital_connector_value.points
                + tiers.network_quality.points
                + tiers.early_visibility.points
                + tiers.governance_suitability.points
                + sector_score
                + strategic_score,
                2,
            )

            writer.writerow({
                "Country": p["_country"],
                "Name": p["name"],
                "Comparison Text": comparison_text,
                "Capital Connector Value Score": tiers.capital_connector_value.points,
                "Capital Connector Value Explanation": f"{tiers.capital_connector_value.tier} - {tiers.capital_connector_value.reason}",
                "Network Quality Score": tiers.network_quality.points,
                "Network Quality Explanation": f"{tiers.network_quality.tier} - {tiers.network_quality.reason}",
                "Early Visibility Score": tiers.early_visibility.points,
                "Early Visibility Explanation": f"{tiers.early_visibility.tier} - {tiers.early_visibility.reason}",
                "Governance Suitability Score": tiers.governance_suitability.points,
                "Governance Suitability Explanation": f"{tiers.governance_suitability.tier} - {tiers.governance_suitability.reason}",
                "Sector Relevance Cosine": round(sector_sim, 4),
                "Sector Relevance Score": sector_score,
                "Strategic Relevance to TBP Cosine": round(strategic_sim, 4),
                "Strategic Relevance to TBP Score": strategic_score,
                "Total Score": total_score,
            })
            f.flush()

    print(f"Done. See {out_path}")


if __name__ == "__main__":
    main()
