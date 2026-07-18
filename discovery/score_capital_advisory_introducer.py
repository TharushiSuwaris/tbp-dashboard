"""
Score Capital Advisory / Introducer prospects: 5 categories via Gemini tier-judgment,
1 via SBERT similarity (this circle has no "Strategic Adjacency to TBP" category - an
introducer's fit is about their own track record/credibility, not thesis alignment).

Reads discovery/raw/capital-advisory-introducer/*.json (deduplicated), writes
discovery/intermediate/capital-advisory-introducer.csv.
Resumable: reruns skip prospects already present in the output CSV, results saved incrementally.

Calibration note: the Sector Relevance floor-ceiling values are reused from the Family Office
calibration (v1, 29 real prospects) as a placeholder - see KNOWN_ISSUES.md.

Usage:
    python score_capital_advisory_introducer.py
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
RAW_DIR = SCRIPT_DIR / "raw" / "capital-advisory-introducer"
INTERMEDIATE_DIR = SCRIPT_DIR / "intermediate"
MODEL_NAME = "gemini-2.5-flash"
SBERT_MODEL_NAME = "all-MiniLM-L6-v2"
SECONDS_BETWEEN_CALLS = 13  # free tier: 5 requests/minute for gemini-2.5-flash
MAX_RETRIES = 4

# Reused as-is from Family Office: describes TBP's own sector interests, not "what makes an
# ideal prospect" - so it doesn't need to vary per circle.
SECTOR_REFERENCE_TEXT = (
    "Trade, infrastructure, energy, logistics, digital infrastructure, real estate, "
    "ports, technology, industrial platforms, and emerging markets investment activity."
)

TIER_RUBRIC = """For each category below, judge which ONE tier the evidence supports, and give a \
one-sentence reason. Base your judgment ONLY on the evidence given, do not guess beyond it.

1. investor_network_quality (max 25) - "Is there evidence of a genuinely strong, relevant \
investor network?"
   Clear=25: Named significant investor relationships/client base, or specific strong-network evidence
   Reasonably Clear=18: General implied strong network, no specifics
   Ambiguous=10: Vague or unverifiable network claims
   Unclear=0: No evidence

2. private_market_experience (max 20) - "Is there evidence of genuine private-market capital \
advisory track record?"
   Clear=20: Specific track record (years, deals, notable transactions)
   Reasonably Clear=14: General private-market positioning, no specific detail
   Ambiguous=8: Vague or generic experience claims
   Unclear=0: No evidence

3. ability_to_bring_qualified_investors (max 15) - "Can they demonstrate real capability to \
deliver qualified, investment-ready capital, not just contacts?"
   Clear=15: Specific evidence of placing qualified investors into real transactions
   Reasonably Clear=11: Plausible given role/positioning, not explicitly evidenced
   Ambiguous=5: Vague claims of investor access
   Unclear=0: No evidence

4. mandate_clarity (max 15) - "Is there clarity around how this prospect would engage with TBP \
- role, fee structure, or relationship terms?"
   Clear=15: Explicit, structured advisory/introducer service offering
   Reasonably Clear=11: General advisory positioning, terms not detailed
   Ambiguous=5: Ambiguous or mixed role description
   Unclear=0: No basis to assess

5. conflict_management_suitability (max 10) - "Does the prospect show sound conflict-of-interest \
management appropriate to an intermediary role?"
   Clear=10: Explicit conflict-management/compliance language, no red flags
   Reasonably Clear=7: Licensed/regulated positioning, no explicit conflict language
   Ambiguous=3: Signals absent or mixed
   Unclear=0: Red flags present (undisclosed interest, opaque fees)"""

FIELDNAMES = [
    "Country", "Name", "Comparison Text",
    "Investor Network Quality Score", "Investor Network Quality Explanation",
    "Private-Market Experience Score", "Private-Market Experience Explanation",
    "Ability to Bring Qualified Investors Score", "Ability to Bring Qualified Investors Explanation",
    "Mandate Clarity Score", "Mandate Clarity Explanation",
    "Conflict-Management Suitability Score", "Conflict-Management Suitability Explanation",
    "Sector Relevance Cosine", "Sector Relevance Score",
    "Total Score",
]

# v1 calibration - REUSED from Family Office (29 real prospects), not yet calibrated on this
# circle's own data. See KNOWN_ISSUES.md.
SECTOR_RELEVANCE_FLOOR = 0.2165
SECTOR_RELEVANCE_CEILING = 0.3341
SECTOR_RELEVANCE_MAX_POINTS = 15


class TierJudgment(BaseModel):
    tier: str
    points: int
    reason: str


class CapitalAdvisoryTiers(BaseModel):
    investor_network_quality: TierJudgment
    private_market_experience: TierJudgment
    ability_to_bring_qualified_investors: TierJudgment
    mandate_clarity: TierJudgment
    conflict_management_suitability: TierJudgment


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


def judge_tiers(client: genai.Client, p: dict) -> CapitalAdvisoryTiers:
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
                    response_schema=CapitalAdvisoryTiers,
                ),
            )
            return CapitalAdvisoryTiers.model_validate_json(response.text)
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
    out_path = INTERMEDIATE_DIR / "capital-advisory-introducer.csv"

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
            sector_score = calibrated_score(sector_sim, SECTOR_RELEVANCE_FLOOR, SECTOR_RELEVANCE_CEILING, SECTOR_RELEVANCE_MAX_POINTS)
            total_score = round(
                tiers.investor_network_quality.points
                + tiers.private_market_experience.points
                + tiers.ability_to_bring_qualified_investors.points
                + tiers.mandate_clarity.points
                + tiers.conflict_management_suitability.points
                + sector_score,
                2,
            )

            writer.writerow({
                "Country": p["_country"],
                "Name": p["name"],
                "Comparison Text": comparison_text,
                "Investor Network Quality Score": tiers.investor_network_quality.points,
                "Investor Network Quality Explanation": f"{tiers.investor_network_quality.tier} - {tiers.investor_network_quality.reason}",
                "Private-Market Experience Score": tiers.private_market_experience.points,
                "Private-Market Experience Explanation": f"{tiers.private_market_experience.tier} - {tiers.private_market_experience.reason}",
                "Ability to Bring Qualified Investors Score": tiers.ability_to_bring_qualified_investors.points,
                "Ability to Bring Qualified Investors Explanation": f"{tiers.ability_to_bring_qualified_investors.tier} - {tiers.ability_to_bring_qualified_investors.reason}",
                "Mandate Clarity Score": tiers.mandate_clarity.points,
                "Mandate Clarity Explanation": f"{tiers.mandate_clarity.tier} - {tiers.mandate_clarity.reason}",
                "Conflict-Management Suitability Score": tiers.conflict_management_suitability.points,
                "Conflict-Management Suitability Explanation": f"{tiers.conflict_management_suitability.tier} - {tiers.conflict_management_suitability.reason}",
                "Sector Relevance Cosine": round(sector_sim, 4),
                "Sector Relevance Score": sector_score,
                "Total Score": total_score,
            })
            f.flush()

    print(f"Done. See {out_path}")


if __name__ == "__main__":
    main()
