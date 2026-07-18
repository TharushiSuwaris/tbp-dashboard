"""
Score Family Office prospects: 4 categories via Gemini tier-judgment, 2 via SBERT similarity.

Reads discovery/raw/family-office/*.json (deduplicated), writes discovery/intermediate/family-office.csv.
Resumable: reruns skip prospects already present in the output CSV, and results are saved
incrementally so a crash partway through doesn't lose prior progress.

Usage:
    python score_family_office.py
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
RAW_DIR = SCRIPT_DIR / "raw" / "family-office"
INTERMEDIATE_DIR = SCRIPT_DIR / "intermediate"
MODEL_NAME = "gemini-2.5-flash"
SBERT_MODEL_NAME = "all-MiniLM-L6-v2"
SECONDS_BETWEEN_CALLS = 13  # free tier: 5 requests/minute for gemini-2.5-flash
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

1. family_office_fit (max 20) - "How clearly does the prospect fit the family office, private \
capital, HNWI or family-controlled investment group profile?"
   Clear=20: Explicitly self-described as one of these categories
   Reasonably Clear=14: Strongly implied by name/structure, not self-labeled
   Ambiguous=8: Mixed signals - could plausibly be something else
   Unclear=0: No basis to classify this way

2. permanent_capital_orientation (max 20) - "Does the prospect show evidence of long-term, \
patient, multi-generational or stewardship-oriented capital?"
   Clear=20: Explicit long-term AND multi-generational/stewardship language
   Reasonably Clear=14: One of the two present, not both
   Ambiguous=8: No explicit language either way
   Unclear=0: Evidence suggests short-term/fund-cycle orientation

3. governance_institutional_mindset (max 15) - "Does the prospect appear suitable for a \
governance-aware institutional formation opportunity rather than a speculative or short-term \
investment?"
   Clear=15: Explicit governance/stewardship language, no red flags
   Reasonably Clear=10: Some institutional-mindset signals, no red flags
   Ambiguous=5: Signals absent or mixed
   Unclear=0: Speculative/short-term language present

4. engagement_readiness (max 10) - "Is there a realistic pathway to engage the prospect through \
public contacts, advisers, networks, introductions, events or known relationships?"
   Clear=10: Named decision-maker AND direct contact route
   Reasonably Clear=7: One of the two present
   Ambiguous=3: Only generic/indirect route
   Unclear=0: No pathway found"""

FIELDNAMES = [
    "Country", "Name", "Comparison Text",
    "Family Office Fit Score", "Family Office Fit Explanation",
    "Permanent-Capital Orientation Score", "Permanent-Capital Orientation Explanation",
    "Governance & Institutional Mindset Score", "Governance & Institutional Mindset Explanation",
    "Engagement Readiness Score", "Engagement Readiness Explanation",
    "Sector Alignment Cosine", "Sector Alignment Score",
    "Strategic Adjacency Cosine", "Strategic Adjacency Score",
    "Total Score",
]

# v1 calibration - quartiles from the first 29 real Family Office prospects (Singapore,
# Luxembourg, Qatar, UAE, Switzerland). NOT frozen yet - revisit once more countries/prospects
# have been gathered, per the decision to calibrate against a larger sample before locking in.
SECTOR_ALIGNMENT_FLOOR = 0.2165
SECTOR_ALIGNMENT_CEILING = 0.3341
STRATEGIC_ADJACENCY_FLOOR = 0.0875
STRATEGIC_ADJACENCY_CEILING = 0.2346
SECTOR_ALIGNMENT_MAX_POINTS = 20
STRATEGIC_ADJACENCY_MAX_POINTS = 15


def calibrated_score(cosine: float, floor: float, ceiling: float, max_points: int) -> float:
    normalized = max(0.0, min(1.0, (cosine - floor) / (ceiling - floor)))
    return round(max_points * normalized, 2)


class TierJudgment(BaseModel):
    tier: str
    points: int
    reason: str


class FamilyOfficeTiers(BaseModel):
    family_office_fit: TierJudgment
    permanent_capital_orientation: TierJudgment
    governance_institutional_mindset: TierJudgment
    engagement_readiness: TierJudgment


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


def judge_tiers(client: genai.Client, p: dict) -> FamilyOfficeTiers:
    signals = p.get("scoring_signals", {})
    prompt = f"""{TIER_RUBRIC}

PROSPECT EVIDENCE:
Name: {p.get('name')}
Description: {p.get('brief_description')}
Core fit evidence: {signals.get('core_fit')}
Capital orientation evidence: {signals.get('capital_or_operational_orientation')}
Governance evidence: {signals.get('governance_institutional_mindset')}
Engagement readiness evidence: {signals.get('engagement_readiness')}"""

    for attempt in range(MAX_RETRIES):
        try:
            response = client.models.generate_content(
                model=MODEL_NAME,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=FamilyOfficeTiers,
                ),
            )
            return FamilyOfficeTiers.model_validate_json(response.text)
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
    out_path = INTERMEDIATE_DIR / "family-office.csv"

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
            adjacency_sim = compute_similarity(sbert_model, STRATEGIC_ADJACENCY_REFERENCE_TEXT, comparison_text)
            sector_score = calibrated_score(sector_sim, SECTOR_ALIGNMENT_FLOOR, SECTOR_ALIGNMENT_CEILING, SECTOR_ALIGNMENT_MAX_POINTS)
            adjacency_score = calibrated_score(adjacency_sim, STRATEGIC_ADJACENCY_FLOOR, STRATEGIC_ADJACENCY_CEILING, STRATEGIC_ADJACENCY_MAX_POINTS)
            total_score = round(
                tiers.family_office_fit.points
                + tiers.permanent_capital_orientation.points
                + tiers.governance_institutional_mindset.points
                + tiers.engagement_readiness.points
                + sector_score
                + adjacency_score,
                2,
            )

            writer.writerow({
                "Country": p["_country"],
                "Name": p["name"],
                "Comparison Text": comparison_text,
                "Family Office Fit Score": tiers.family_office_fit.points,
                "Family Office Fit Explanation": f"{tiers.family_office_fit.tier} - {tiers.family_office_fit.reason}",
                "Permanent-Capital Orientation Score": tiers.permanent_capital_orientation.points,
                "Permanent-Capital Orientation Explanation": f"{tiers.permanent_capital_orientation.tier} - {tiers.permanent_capital_orientation.reason}",
                "Governance & Institutional Mindset Score": tiers.governance_institutional_mindset.points,
                "Governance & Institutional Mindset Explanation": f"{tiers.governance_institutional_mindset.tier} - {tiers.governance_institutional_mindset.reason}",
                "Engagement Readiness Score": tiers.engagement_readiness.points,
                "Engagement Readiness Explanation": f"{tiers.engagement_readiness.tier} - {tiers.engagement_readiness.reason}",
                "Sector Alignment Cosine": round(sector_sim, 4),
                "Sector Alignment Score": sector_score,
                "Strategic Adjacency Cosine": round(adjacency_sim, 4),
                "Strategic Adjacency Score": adjacency_score,
                "Total Score": total_score,
            })
            f.flush()

    print(f"Done. See {out_path}")


if __name__ == "__main__":
    main()
