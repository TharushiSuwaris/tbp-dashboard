"""
Build one Master_List.csv-formatted export per circle.

Joins each circle's raw discovery data (geography, location, email, sectors, sources) with its
scored intermediate data, computes Classification/Priority using the same bands as the original
Task Brief, and writes one file per circle to discovery/processed/ - each file keeps that
circle's own real, named score columns (not collapsed into a shared generic column), since the
five circles score genuinely different things and forcing them into one shared column set would
either misrepresent categories that don't apply or blur what's actually being measured.

These are NEW, separate files - none of this reads from, writes to, or merges with the real
tbp-dashboard/data/Master_List.csv. Column format follows that file for familiarity, with a few
columns intentionally left blank where we don't yet compute that data (printed in a summary
after each run).

Usage:
    python build_processed_master.py
"""

import json
from pathlib import Path

import pandas as pd

SCRIPT_DIR = Path(__file__).parent
RAW_DIR = SCRIPT_DIR / "raw"
INTERMEDIATE_DIR = SCRIPT_DIR / "intermediate"
PROCESSED_DIR = SCRIPT_DIR / "processed"

CIRCLE_LABELS = {
    "family-office": "Family Office",
    "angel-investor": "Angel Investor",
    "institutional-sovereign": "Institutional / Sovereign",
    "strategic-operational-partner": "Strategic Operational Partner",
    "capital-advisory-introducer": "Capital Advisory / Introducer",
}

# (CSV column name in intermediate/<circle>.csv, output column name, max points) per circle.
CIRCLE_CATEGORIES = {
    "family-office": [
        ("Family Office Fit Score", "Family Office Fit (20)", 20),
        ("Permanent-Capital Orientation Score", "Permanent-Capital Orientation (20)", 20),
        ("Governance & Institutional Mindset Score", "Governance & Institutional Mindset (15)", 15),
        ("Engagement Readiness Score", "Engagement Readiness (10)", 10),
        ("Sector Alignment Score", "Sector Alignment (20)", 20),
        ("Strategic Adjacency Score", "Strategic Adjacency to TBP (15)", 15),
    ],
    "angel-investor": [
        ("Capital Connector Value Score", "Capital Connector Value (20)", 20),
        ("Network Quality Score", "Network Quality (15)", 15),
        ("Early Visibility Score", "Ability to Support Early Visibility (10)", 10),
        ("Governance Suitability Score", "Governance Suitability (10)", 10),
        ("Sector Relevance Score", "Sector Relevance (20)", 20),
        ("Strategic Relevance to TBP Score", "Strategic Relevance to TBP (25)", 25),
    ],
    "institutional-sovereign": [
        ("Institutional Credibility Score", "Institutional Credibility (20)", 20),
        ("Capital Scale Score", "Capital Scale (20)", 20),
        ("Platform Validation Value Score", "Platform Validation Value (10)", 10),
        ("Engagement Route Quality Score", "Engagement Route Quality (10)", 10),
        ("Infrastructure/Energy/Trade Alignment Score", "Infrastructure/Energy/Trade Alignment (25)", 25),
        ("Strategic Geography Score", "Strategic Geography (15)", 15),
    ],
    "strategic-operational-partner": [
        ("Asset/Infrastructure Control Score", "Asset/Infrastructure Control (20)", 20),
        ("Technical/Delivery Capability Score", "Technical/Delivery Capability (15)", 15),
        ("Strategic Partnership Value Score", "Strategic Partnership Value (10)", 10),
        ("Governance and Execution Readiness Score", "Governance and Execution Readiness (10)", 10),
        ("Operational Relevance Score", "Operational Relevance (25)", 25),
        ("Corridor Activation Potential Score", "Corridor Activation Potential (20)", 20),
    ],
    "capital-advisory-introducer": [
        ("Investor Network Quality Score", "Investor Network Quality (25)", 25),
        ("Private-Market Experience Score", "Private-Market Experience (20)", 20),
        ("Ability to Bring Qualified Investors Score", "Ability to Bring Qualified Investors (15)", 15),
        ("Mandate Clarity Score", "Mandate Clarity (15)", 15),
        ("Conflict-Management Suitability Score", "Conflict-Management Suitability (10)", 10),
        ("Sector Relevance Score", "Sector Relevance (15)", 15),
    ],
}

BASE_COLUMNS_BEFORE_SCORES = [
    "Circle", "Region", "Country", "City", "Organisation", "Prospect Category",
    "HQ / Primary Geography", "Address / Office Location", "Family / Founder / Strategic Nature",
    "Known Sector Themes", "TBP / Regional Corridor Relevance", "Possible TBP Entry Point",
    "Recommended Contact Route", "Assigned Lead",
]

BASE_COLUMNS_AFTER_SCORES = [
    "Total Score", "Classification", "Priority", "Pipeline Stage", "Scoring Status",
    "Public Source URLs", "Notes / Diligence Flags", "Email address", "Contact Email Status",
    "Contact Email Source URLs", "Contact Email Notes", "Contact Enrichment Date",
    "Source File", "Alternate Names",
]

BLANK_COLUMNS = [
    "Region", "City", "Prospect Category", "Family / Founder / Strategic Nature",
    "TBP / Regional Corridor Relevance", "Possible TBP Entry Point", "Recommended Contact Route",
    "Assigned Lead", "Contact Email Notes", "Alternate Names",
]


def classify(total_score: float) -> tuple[str, str]:
    if total_score >= 80:
        return "Priority Founding Steward Prospect", "Priority"
    if total_score >= 65:
        return "Strong Potential Prospect", "Strong"
    if total_score >= 50:
        return "Monitor / Secondary Prospect", "Monitor"
    return "Not currently suitable", "Low"


def load_raw_index(circle_key: str) -> dict[tuple[str, str], dict]:
    """Key: (country_lower, name_lower) -> raw prospect dict + provenance fields."""
    index = {}
    circle_dir = RAW_DIR / circle_key
    if not circle_dir.exists():
        return index
    for json_path in sorted(circle_dir.glob("*.json")):
        data = json.loads(json_path.read_text(encoding="utf-8"))
        meta = data.get("run_metadata", {})
        country = (meta.get("country") or "").strip()
        for p in data.get("prospects", []):
            key = (country.lower(), p["name"].strip().lower())
            if key not in index:  # first occurrence wins - matches the scoring scripts' own dedupe
                index[key] = {**p, "_source_file": json_path.name, "_run_date": meta.get("date", "")}
    return index


def build_circle_file(circle_key: str, categories: list[tuple[str, str, int]]) -> pd.DataFrame | None:
    csv_path = INTERMEDIATE_DIR / f"{circle_key}.csv"
    if not csv_path.exists():
        print(f"Skipping {circle_key} - no intermediate CSV found yet")
        return None

    df = pd.read_csv(csv_path)
    raw_index = load_raw_index(circle_key)
    score_columns = [display for _, display, _ in categories]
    columns = BASE_COLUMNS_BEFORE_SCORES + score_columns + BASE_COLUMNS_AFTER_SCORES

    rows = []
    for _, r in df.iterrows():
        country = str(r["Country"]).strip()
        name = str(r["Name"]).strip()
        raw = raw_index.get((country.lower(), name.lower()), {})

        sources = [s.get("url") if isinstance(s, dict) else s for s in raw.get("source_urls", [])]
        sources_text = "; ".join(u for u in sources if u)

        total_score = float(r["Total Score"])
        classification, priority = classify(total_score)

        row = {
            "Circle": CIRCLE_LABELS[circle_key],
            "Region": "",
            "Country": country,
            "City": "",
            "Organisation": name,
            "Prospect Category": "",
            "HQ / Primary Geography": raw.get("geography", ""),
            "Address / Office Location": raw.get("location", ""),
            "Family / Founder / Strategic Nature": "",
            "Known Sector Themes": "; ".join(raw.get("sectors", [])),
            "TBP / Regional Corridor Relevance": "",
            "Possible TBP Entry Point": "",
            "Recommended Contact Route": "",
            "Assigned Lead": "",
            "Total Score": total_score,
            "Classification": classification,
            "Priority": priority,
            "Pipeline Stage": "Identified",
            "Scoring Status": "Indicative scored - AI generated, review required",
            "Public Source URLs": sources_text,
            "Notes / Diligence Flags": "Not yet reviewed - AI discovery/scoring only, no due-diligence screen performed",
            "Email address": raw.get("email") or "",
            "Contact Email Status": raw.get("email_status", ""),
            "Contact Email Source URLs": sources_text,
            "Contact Email Notes": "",
            "Contact Enrichment Date": raw.get("_run_date", ""),
            "Source File": raw.get("_source_file", ""),
            "Alternate Names": "",
        }
        for col, display, _ in categories:
            row[display] = r[col]
        rows.append(row)

    out_df = pd.DataFrame(rows, columns=columns)
    return out_df.sort_values("Total Score", ascending=False)


def main():
    PROCESSED_DIR.mkdir(exist_ok=True)

    for circle_key, categories in CIRCLE_CATEGORIES.items():
        out_df = build_circle_file(circle_key, categories)
        if out_df is None:
            continue
        out_path = PROCESSED_DIR / f"{circle_key.replace('-', '_')}_master_list.csv"
        out_df.to_csv(out_path, index=False)
        print(f"Wrote {len(out_df)} rows to {out_path}")

    print()
    print("Left blank in every file (no data source computed yet):")
    print(" ", ", ".join(BLANK_COLUMNS))


if __name__ == "__main__":
    main()
