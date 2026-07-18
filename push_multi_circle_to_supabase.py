"""
Populate the live Supabase database with the 41 scored prospects from the multi-circle
discovery/scoring pipeline (discovery/raw/, discovery/intermediate/).

Writes to both:
  - data/database_files/*.csv (extends the existing local pipeline files, .backup.csv
    kept before any overwrite, matching the existing repo convention)
  - the live Supabase tables (upsert, safe to rerun)

New prospect IDs use circle-based prefixes (fo-, ang-, ins-, sop-, cai-) to avoid any
collision with the 203 existing prospects, which all use 2-letter country-code prefixes.

Known limitation: ID assignment is deterministic for a given input (sorted by Country,
then Name) but this script does not yet track "already assigned" IDs across reruns the
way the score_*.py scripts do - if this becomes a recurring sync as more countries are
gathered, it needs the same resumability treatment. Tracked in discovery/KNOWN_ISSUES.md.

Usage:
    python push_multi_circle_to_supabase.py
"""

import json
import shutil
from pathlib import Path

import pandas as pd
from supabase import create_client

ROOT = Path(__file__).parent
DISCOVERY_DIR = ROOT / "discovery"
RAW_DIR = DISCOVERY_DIR / "raw"
INTERMEDIATE_DIR = DISCOVERY_DIR / "intermediate"
DB_DIR = ROOT / "data" / "database_files"

CIRCLE_PREFIX = {
    "family-office": "fo",
    "angel-investor": "ang",
    "institutional-sovereign": "ins",
    "strategic-operational-partner": "sop",
    "capital-advisory-introducer": "cai",
}

CIRCLE_LABELS = {
    "family-office": "Family Office",
    "angel-investor": "Angel Investor",
    "institutional-sovereign": "Institutional / Sovereign",
    "strategic-operational-partner": "Strategic Operational Partner",
    "capital-advisory-introducer": "Capital Advisory / Introducer",
}

CIRCLE_CATEGORIES = {
    "family-office": [
        ("Family Office Fit Score", "Family Office Fit", 20),
        ("Permanent-Capital Orientation Score", "Permanent-Capital Orientation", 20),
        ("Governance & Institutional Mindset Score", "Governance & Institutional Mindset", 15),
        ("Engagement Readiness Score", "Engagement Readiness", 10),
        ("Sector Alignment Score", "Sector Alignment", 20),
        ("Strategic Adjacency Score", "Strategic Adjacency to TBP", 15),
    ],
    "angel-investor": [
        ("Capital Connector Value Score", "Capital Connector Value", 20),
        ("Network Quality Score", "Network Quality", 15),
        ("Early Visibility Score", "Ability to Support Early Visibility", 10),
        ("Governance Suitability Score", "Governance Suitability", 10),
        ("Sector Relevance Score", "Sector Relevance", 20),
        ("Strategic Relevance to TBP Score", "Strategic Relevance to TBP", 25),
    ],
    "institutional-sovereign": [
        ("Institutional Credibility Score", "Institutional Credibility", 20),
        ("Capital Scale Score", "Capital Scale", 20),
        ("Platform Validation Value Score", "Platform Validation Value", 10),
        ("Engagement Route Quality Score", "Engagement Route Quality", 10),
        ("Infrastructure/Energy/Trade Alignment Score", "Infrastructure/Energy/Trade Alignment", 25),
        ("Strategic Geography Score", "Strategic Geography", 15),
    ],
    "strategic-operational-partner": [
        ("Asset/Infrastructure Control Score", "Asset/Infrastructure Control", 20),
        ("Technical/Delivery Capability Score", "Technical/Delivery Capability", 15),
        ("Strategic Partnership Value Score", "Strategic Partnership Value", 10),
        ("Governance and Execution Readiness Score", "Governance and Execution Readiness", 10),
        ("Operational Relevance Score", "Operational Relevance", 25),
        ("Corridor Activation Potential Score", "Corridor Activation Potential", 20),
    ],
    "capital-advisory-introducer": [
        ("Investor Network Quality Score", "Investor Network Quality", 25),
        ("Private-Market Experience Score", "Private-Market Experience", 20),
        ("Ability to Bring Qualified Investors Score", "Ability to Bring Qualified Investors", 15),
        ("Mandate Clarity Score", "Mandate Clarity", 15),
        ("Conflict-Management Suitability Score", "Conflict-Management Suitability", 10),
        ("Sector Relevance Score", "Sector Relevance", 15),
    ],
}


def load_env_local(path=".env.local"):
    env = {}
    for line in Path(path).read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, val = line.split("=", 1)
        env[key.strip()] = val.strip().strip('"').strip("'")
    return env


def load_raw_index(circle_key: str) -> dict[tuple[str, str], dict]:
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
            if key not in index:
                index[key] = p
    return index


def build_records():
    prospects, sources, circle_scores, category_scores, sectors, pipeline = [], [], [], [], [], []

    for circle_key, categories in CIRCLE_CATEGORIES.items():
        csv_path = INTERMEDIATE_DIR / f"{circle_key}.csv"
        if not csv_path.exists():
            continue
        df = pd.read_csv(csv_path).sort_values(["Country", "Name"]).reset_index(drop=True)
        raw_index = load_raw_index(circle_key)
        prefix = CIRCLE_PREFIX[circle_key]

        for i, r in df.iterrows():
            pid = f"{prefix}-{i + 1:03d}"
            country = str(r["Country"]).strip()
            name = str(r["Name"]).strip()
            raw = raw_index.get((country.lower(), name.lower()), {})

            prospects.append({
                "id": pid,
                "prospect_name": name,
                "prospect_type": CIRCLE_LABELS[circle_key],
                "country": country,
                "city": "",
                "region": "",
            })

            source_urls = [s.get("url") if isinstance(s, dict) else s for s in raw.get("source_urls", [])]
            source_urls = [u for u in source_urls if u]
            sources.append({
                "prospect_id": pid,
                "website": None,
                "public_source_url": source_urls[0] if source_urls else None,
                "source_quality": "Medium",
                "key_public_contacts": None,
                "email": raw.get("email") or None,
                "address": raw.get("location") or None,
            })

            total_score = float(r["Total Score"])
            classification = str(r["Classification"]) if "Classification" in r else None
            priority = str(r["Priority"]) if "Priority" in r else None
            if classification is None or pd.isna(total_score):
                if total_score >= 80:
                    classification, priority = "Priority Founding Steward Prospect", "Priority"
                elif total_score >= 65:
                    classification, priority = "Strong Potential Prospect", "Strong"
                elif total_score >= 50:
                    classification, priority = "Monitor / Secondary Prospect", "Monitor"
                else:
                    classification, priority = "Not Currently Suitable", "Low"

            circle_scores.append({
                "prospect_id": pid,
                "circle": CIRCLE_LABELS[circle_key],
                "total_score": total_score,
                "classification": classification,
                "priority": priority,
            })

            for col, display, max_pts in categories:
                explanation_col = col.replace(" Score", " Explanation")
                explanation = str(r[explanation_col]) if explanation_col in r and pd.notna(r[explanation_col]) else ""
                category_scores.append({
                    "prospect_id": pid,
                    "circle": CIRCLE_LABELS[circle_key],
                    "category_name": display,
                    "score": float(r[col]),
                    "max_points": max_pts,
                    "explanation": explanation,
                })

            for sector in raw.get("sectors", []):
                sectors.append({"prospect_id": pid, "sector": sector})

            pipeline.append({
                "prospect_id": pid,
                "pipeline_stage": "Identified",
                "assigned_owner": "TBP Advisory",
                "next_action": "",
                "next_action_date": "2026-07-31",
                "briefing_pack_status": "Not Generated",
            })

    return (
        pd.DataFrame(prospects), pd.DataFrame(sources), pd.DataFrame(circle_scores),
        pd.DataFrame(category_scores), pd.DataFrame(sectors), pd.DataFrame(pipeline),
    )


def backup_and_append(filename: str, new_df: pd.DataFrame):
    path = DB_DIR / filename
    if path.exists():
        backup_path = path.with_name(path.stem + ".backup.csv")
        shutil.copy(path, backup_path)
        existing = pd.read_csv(path)
        combined = pd.concat([existing, new_df], ignore_index=True)
    else:
        combined = new_df
    combined.to_csv(path, index=False)
    print(f"  {filename}: {len(new_df)} new rows appended, {len(combined)} total")
    return combined


def write_new_file(filename: str, df: pd.DataFrame):
    path = DB_DIR / filename
    df.to_csv(path, index=False)
    print(f"  {filename}: {len(df)} rows written (new file)")


def to_records(df: pd.DataFrame) -> list[dict]:
    records = df.to_dict("records")
    for r in records:
        for k, v in r.items():
            if isinstance(v, float) and pd.isna(v):
                r[k] = None
    return records


def chunked(seq, size=200):
    for i in range(0, len(seq), size):
        yield seq[i:i + size]


def upsert_table(client, table_name, records, on_conflict):
    total = 0
    for batch in chunked(records):
        client.table(table_name).upsert(batch, on_conflict=on_conflict).execute()
        total += len(batch)
    print(f"  upserted {total} rows into {table_name}")


def main():
    print("Building records from discovery + scoring output...")
    prospects_df, sources_df, circle_scores_df, category_scores_df, sectors_df, pipeline_df = build_records()
    print(f"  {len(prospects_df)} new prospects across {prospects_df['prospect_type'].nunique()} circles")

    print("\nUpdating local database_files/ ...")
    prospects_all = backup_and_append("01_prospects.csv", prospects_df)
    sources_all = backup_and_append("03_prospect_sources.csv", sources_df)
    pipeline_all = backup_and_append("06_prospect_pipeline.csv", pipeline_df)
    sectors_all = backup_and_append("07_prospect_sectors.csv", sectors_df)
    write_new_file("09_prospect_circle_scores.csv", circle_scores_df)
    write_new_file("10_prospect_category_scores.csv", category_scores_df)

    print("\nPushing to Supabase...")
    env = load_env_local()
    client = create_client(env["NEXT_PUBLIC_SUPABASE_URL"], env["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"])

    upsert_table(client, "prospects", to_records(prospects_df), on_conflict="id")
    upsert_table(client, "prospect_sources", to_records(sources_df), on_conflict="prospect_id")
    upsert_table(client, "prospect_pipeline", to_records(pipeline_df), on_conflict="prospect_id")
    upsert_table(client, "prospect_sectors", to_records(sectors_df), on_conflict="prospect_id,sector")
    upsert_table(client, "prospect_circle_scores", to_records(circle_scores_df), on_conflict="prospect_id,circle")
    upsert_table(client, "prospect_category_scores", to_records(category_scores_df), on_conflict="prospect_id,circle,category_name")

    print("\nVerifying...")
    for table, local_count in [
        ("prospects", len(prospects_all)), ("prospect_sources", len(sources_all)),
        ("prospect_pipeline", len(pipeline_all)), ("prospect_sectors", len(sectors_all)),
    ]:
        resp = client.table(table).select("*", count="exact", head=True).execute()
        status = "OK" if resp.count == local_count else "MISMATCH"
        print(f"  {table}: local={local_count} remote={resp.count} [{status}]")

    for table, expected in [
        ("prospect_circle_scores", len(circle_scores_df)),
        ("prospect_category_scores", len(category_scores_df)),
    ]:
        resp = client.table(table).select("*", count="exact", head=True).execute()
        status = "OK" if resp.count == expected else "MISMATCH"
        print(f"  {table}: expected>= {expected} remote={resp.count} [{status}]")

    sample_id = prospects_df.iloc[0]["id"]
    print(f"\nSpot check: {sample_id}")
    print(" prospects:", client.table("prospects").select("*").eq("id", sample_id).execute().data)
    print(" circle_scores:", client.table("prospect_circle_scores").select("*").eq("prospect_id", sample_id).execute().data)


if __name__ == "__main__":
    main()
