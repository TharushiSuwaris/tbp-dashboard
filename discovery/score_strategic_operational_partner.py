"""
Score Strategic Operational Partner prospects: 4 categories via Gemini tier-judgment, 2 via
SBERT similarity.

Reads discovery/raw/strategic-operational-partner/*.json (deduplicated), writes
discovery/intermediate/strategic-operational-partner.csv.
Resumable: reruns skip prospects already present in the output CSV, results saved incrementally.

Calibration note: floor-ceiling values reused from the Family Office calibration (v1, 29 real
prospects) as a placeholder - see KNOWN_ISSUES.md.

Usage:
    python score_strategic_operational_partner.py
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
RAW_DIR = SCRIPT_DIR / "raw" / "strategic-operational-partner"
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

1. asset_infrastructure_control (max 20) - "Is there evidence they genuinely own or control \
relevant physical assets/infrastructure?"
   Clear=20: Explicit, specific ownership/operation of relevant infrastructure (e.g. named port, energy facility, logistics network)
   Reasonably Clear=14: Plausible control implied, not explicitly documented
   Ambiguous=8: Vague or unclear control claims
   Unclear=0: No evidence of asset control

2. technical_delivery_capability (max 15) - "Is there evidence of genuine technical/operational \
delivery capability?"
   Clear=15: Explicit, specific track record of technical execution/delivery
   Reasonably Clear=11: General operational capability implied, no specific track record
   Ambiguous=5: Vague or generic capability claims
   Unclear=0: No evidence

3. strategic_partnership_value (max 10) - "Is there evidence of value as a long-term strategic \
partner beyond a single transaction?"
   Clear=10: Explicit long-term partnership orientation or track record
   Reasonably Clear=7: Plausible based on positioning, not explicitly evidenced
   Ambiguous=3: Weak or indirect basis
   Unclear=0: No evidence

4. governance_execution_readiness (max 10) - "Does the prospect show sound governance combined \
with operational readiness, rather than execution risk?"
   Clear=10: Explicit governance/compliance language and no execution-risk red flags
   Reasonably Clear=7: Some positive signals, no red flags
   Ambiguous=3: Signals absent or mixed
   Unclear=0: Red flags present (execution risk, governance concerns)"""

FIELDNAMES = [
    "Country", "Name", "Comparison Text",
    "Asset/Infrastructure Control Score", "Asset/Infrastructure Control Explanation",
    "Technical/Delivery Capability Score", "Technical/Delivery Capability Explanation",
    "Strategic Partnership Value Score", "Strategic Partnership Value Explanation",
    "Governance and Execution Readiness Score", "Governance and Execution Readiness Explanation",
    "Operational Relevance Cosine", "Operational Relevance Score",
    "Corridor Activation Potential Cosine", "Corridor Activation Potential Score",
    "Total Score",
]

OPERATIONAL_RELEVANCE_FLOOR = 0.2165
OPERATIONAL_RELEVANCE_CEILING = 0.3341
OPERATIONAL_RELEVANCE_MAX_POINTS = 25
CORRIDOR_ACTIVATION_FLOOR = 0.0875
CORRIDOR_ACTIVATION_CEILING = 0.2346
CORRIDOR_ACTIVATION_MAX_POINTS = 20


class TierJudgment(BaseModel):
    tier: str
    points: int
    reason: str


class StrategicOperationalPartnerTiers(BaseModel):
    asset_infrastructure_control: TierJudgment
    technical_delivery_capability: TierJudgment
    strategic_partnership_value: TierJudgment
    governance_execution_readiness: TierJudgment


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


def judge_tiers(client: genai.Client, p: dict) -> StrategicOperationalPartnerTiers:
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
                    response_schema=StrategicOperationalPartnerTiers,
                ),
            )
            return StrategicOperationalPartnerTiers.model_validate_json(response.text)
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
    out_path = INTERMEDIATE_DIR / "strategic-operational-partner.csv"

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
            operational_sim = compute_similarity(sbert_model, SECTOR_REFERENCE_TEXT, comparison_text)
            corridor_sim = compute_similarity(sbert_model, STRATEGIC_ADJACENCY_REFERENCE_TEXT, comparison_text)
            operational_score = calibrated_score(operational_sim, OPERATIONAL_RELEVANCE_FLOOR, OPERATIONAL_RELEVANCE_CEILING, OPERATIONAL_RELEVANCE_MAX_POINTS)
            corridor_score = calibrated_score(corridor_sim, CORRIDOR_ACTIVATION_FLOOR, CORRIDOR_ACTIVATION_CEILING, CORRIDOR_ACTIVATION_MAX_POINTS)
            total_score = round(
                tiers.asset_infrastructure_control.points
                + tiers.technical_delivery_capability.points
                + tiers.strategic_partnership_value.points
                + tiers.governance_execution_readiness.points
                + operational_score
                + corridor_score,
                2,
            )

            writer.writerow({
                "Country": p["_country"],
                "Name": p["name"],
                "Comparison Text": comparison_text,
                "Asset/Infrastructure Control Score": tiers.asset_infrastructure_control.points,
                "Asset/Infrastructure Control Explanation": f"{tiers.asset_infrastructure_control.tier} - {tiers.asset_infrastructure_control.reason}",
                "Technical/Delivery Capability Score": tiers.technical_delivery_capability.points,
                "Technical/Delivery Capability Explanation": f"{tiers.technical_delivery_capability.tier} - {tiers.technical_delivery_capability.reason}",
                "Strategic Partnership Value Score": tiers.strategic_partnership_value.points,
                "Strategic Partnership Value Explanation": f"{tiers.strategic_partnership_value.tier} - {tiers.strategic_partnership_value.reason}",
                "Governance and Execution Readiness Score": tiers.governance_execution_readiness.points,
                "Governance and Execution Readiness Explanation": f"{tiers.governance_execution_readiness.tier} - {tiers.governance_execution_readiness.reason}",
                "Operational Relevance Cosine": round(operational_sim, 4),
                "Operational Relevance Score": operational_score,
                "Corridor Activation Potential Cosine": round(corridor_sim, 4),
                "Corridor Activation Potential Score": corridor_score,
                "Total Score": total_score,
            })
            f.flush()

    print(f"Done. See {out_path}")


if __name__ == "__main__":
    main()
