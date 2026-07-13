"""
TBP Family Office Discovery Engine.

Input: a country (and optionally a sector / prospect category).
Output: a raw JSON file in discovery/raw/, never touching Master_List.csv or Supabase.

Usage:
    python discover.py --country Singapore
    python discover.py --country Indonesia --sector "digital infrastructure" --max-results 10
"""

import argparse
import json
import re
from datetime import datetime
from pathlib import Path

from dotenv import load_dotenv
from google import genai
from google.genai import types

SCRIPT_DIR = Path(__file__).parent
RAW_DIR = SCRIPT_DIR / "raw"
MODEL_NAME = "gemini-2.5-flash"

TARGET_CATEGORIES = (
    "single-family offices, multi-family offices, family-controlled investment "
    "companies, family holding companies, qualified HNWI investment entities, "
    "and permanent-capital private investment groups"
)
TARGET_SECTORS = (
    "trade, infrastructure, energy, logistics, digital infrastructure, real "
    "estate, ports, technology, industrial platforms, or emerging markets"
)


def build_query(country: str, sector: str | None = None, category: str | None = None) -> str:
    query = f"Identify {category or TARGET_CATEGORIES} headquartered in or primarily active in {country}"
    query += f", with a focus on {sector}" if sector else f", with exposure to {TARGET_SECTORS}"
    query += ". Prioritize entities showing evidence of patient capital, long-horizon stewardship, and governance discipline."
    return query


def build_prompt(query: str, max_results: int) -> str:
    return f"""You are a research assistant identifying family office and private-capital \
investment prospects for a capital-advisory intelligence project.

TASK: {query}

Use web search to find real, currently active organizations. Return at most {max_results} \
distinct prospects.

STRICT RULES:
- Use only information you can verify through your search results. Never invent or guess a detail.
- If a field cannot be confirmed from a public source, set it to null (for email) or the exact \
string "Needs Verification" (for text fields) — do not guess a plausible-sounding value.
- Do not include duplicate organizations.
- Only include organizations that plausibly fit: single-family offices, multi-family offices, \
family-controlled investment companies, family holding companies, qualified HNWI investment \
entities, permanent-capital private investment groups, or strategic private capital groups.

For each prospect, also fill "scoring_signals" — one short, specific evidence snippet per \
question below (a phrase or clause, not a paragraph). If your search results contain no evidence \
for a question, write "No evidence found" rather than a generic or hedged guess:
- family_office_fit: does the organization explicitly self-describe as a family office, holding \
company, or family-controlled/HNWI investment entity?
- permanent_capital_orientation: is there explicit long-term, multi-generational, or \
stewardship-oriented language?
- sector_alignment: which specific target sectors are a stated core focus (not just listed)?
- governance_institutional_mindset: is there explicit governance/stewardship language, or any \
speculative/short-term red flags?
- strategic_adjacency_tbp: does geography and/or sector plausibly overlap a global trade, \
infrastructure, energy, or digital-infrastructure corridor thesis?
- engagement_readiness: is there a named decision-maker and/or a direct (non-generic) contact route?

OUTPUT FORMAT: respond with ONLY a single JSON object inside a ```json fenced code block, no \
text before or after it, matching exactly this shape:

```json
{{
  "prospects": [
    {{
      "name": "string",
      "brief_description": "string, 1-3 sentences",
      "sectors": ["string", "..."],
      "geography": "string",
      "email": "string or null",
      "email_status": "Found or Needs Verification",
      "location": "string",
      "source_urls": ["string", "..."],
      "scoring_signals": {{
        "family_office_fit": "string",
        "permanent_capital_orientation": "string",
        "sector_alignment": "string",
        "governance_institutional_mindset": "string",
        "strategic_adjacency_tbp": "string",
        "engagement_readiness": "string"
      }}
    }}
  ]
}}
```"""


def call_gemini(client: genai.Client, prompt: str):
    grounding_tool = types.Tool(google_search=types.GoogleSearch())
    config = types.GenerateContentConfig(tools=[grounding_tool])
    return client.models.generate_content(model=MODEL_NAME, contents=prompt, config=config)


def extract_json(response_text: str) -> dict:
    fenced = re.search(r"```json\s*(\{.*?\})\s*```", response_text, re.DOTALL)
    candidate = fenced.group(1) if fenced else response_text[response_text.find("{"): response_text.rfind("}") + 1]
    return json.loads(candidate)


def build_source_title_lookup(grounding_metadata) -> dict:
    lookup = {}
    if not grounding_metadata or not grounding_metadata.grounding_chunks:
        return lookup
    for chunk in grounding_metadata.grounding_chunks:
        web = getattr(chunk, "web", None)
        if web and web.uri:
            lookup[web.uri] = web.title
    return lookup


def attach_source_titles(prospects: list, title_lookup: dict) -> list:
    for prospect in prospects:
        urls = prospect.get("source_urls", [])
        prospect["source_urls"] = [{"url": url, "title": title_lookup.get(url)} for url in urls]
    return prospects


def save_raw_text(country_slug: str, timestamp: str, text: str) -> Path:
    path = unique_path(country_slug, timestamp, suffix=".raw.txt")
    path.write_text(text, encoding="utf-8")
    return path


def unique_path(country_slug: str, timestamp: str, suffix: str) -> Path:
    path = RAW_DIR / f"{country_slug}_{timestamp}{suffix}"
    counter = 2
    while path.exists():
        path = RAW_DIR / f"{country_slug}_{timestamp}_{counter}{suffix}"
        counter += 1
    return path


def run(country: str, sector: str | None, category: str | None, max_results: int) -> Path:
    load_dotenv(SCRIPT_DIR / ".env")
    client = genai.Client()

    query = build_query(country, sector, category)
    prompt = build_prompt(query, max_results)

    print(f"Searching: {query}")

    country_slug = country.strip().lower().replace(" ", "_")
    timestamp = datetime.now().strftime("%Y-%m-%d_%H%M")

    response = None
    parsed = None
    last_error = None
    for attempt in range(2):
        response = call_gemini(client, prompt)
        try:
            parsed = extract_json(response.text)
            break
        except (json.JSONDecodeError, ValueError) as exc:
            last_error = exc
            if attempt == 0:
                print("  Response wasn't valid JSON (likely a model glitch) - retrying once...")

    if parsed is None:
        raw_path = save_raw_text(country_slug, timestamp, response.text)
        raise RuntimeError(
            f"Could not parse JSON from Gemini's response after retry ({last_error}). "
            f"Raw response saved to {raw_path} for manual review."
        ) from last_error

    grounding_metadata = response.candidates[0].grounding_metadata
    web_search_queries = list(grounding_metadata.web_search_queries or []) if grounding_metadata else []
    title_lookup = build_source_title_lookup(grounding_metadata)
    prospects = attach_source_titles(parsed.get("prospects", []), title_lookup)

    output = {
        "run_metadata": {
            "country": country,
            "sector": sector,
            "category": category,
            "query": query,
            "date": timestamp,
            "model": MODEL_NAME,
            "web_search_queries_executed": web_search_queries,
        },
        "prospects": prospects,
    }

    RAW_DIR.mkdir(exist_ok=True)
    out_path = unique_path(country_slug, timestamp, suffix=".json")
    out_path.write_text(json.dumps(output, indent=2), encoding="utf-8")

    prospect_count = len(output["prospects"])
    needs_verification = sum(
        1 for p in output["prospects"] if p.get("email_status") == "Needs Verification"
    )
    print(f"Saved {prospect_count} prospects to {out_path}")
    print(f"  ({needs_verification}/{prospect_count} flagged Needs Verification for email)")
    if prospect_count < max_results:
        print(f"  Note: requested up to {max_results}, model returned {prospect_count}")

    return out_path


def interactive_loop(sector: str | None, category: str | None, max_results: int):
    print("TBP Family Office Discovery - interactive mode. Press Enter with no input to stop.\n")
    while True:
        country = input("Country to search: ").strip()
        if not country:
            print("Stopped.")
            break
        try:
            run(country, sector, category, max_results)
        except RuntimeError as exc:
            print(f"  Error: {exc}")
        print()


def main():
    parser = argparse.ArgumentParser(description="TBP Family Office Discovery Engine")
    parser.add_argument("--country", default=None, help='e.g. "Singapore" (omit for interactive mode)')
    parser.add_argument("--sector", default=None, help='optional, e.g. "digital infrastructure"')
    parser.add_argument("--category", default=None, help='optional, e.g. "multi-family offices"')
    parser.add_argument("--max-results", type=int, default=12)
    args = parser.parse_args()

    if args.country:
        run(args.country, args.sector, args.category, args.max_results)
    else:
        interactive_loop(args.sector, args.category, args.max_results)


if __name__ == "__main__":
    main()
