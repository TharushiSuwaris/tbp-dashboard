import { GoogleGenAI } from "@google/genai";
import { CIRCLES } from "./circles";

// Server-only. Ported from discovery/discover.py build_query/build_prompt/call_gemini/extract_json.

export interface SourceUrl {
  url: string;
  title: string | null;
}

export interface DiscoveredProspect {
  name: string;
  brief_description: string;
  sectors: string[];
  geography: string;
  email: string | null;
  email_status: "Found" | "Needs Verification";
  location: string;
  source_urls: SourceUrl[];
  introduced_by: string | null;
  scoring_signals: Record<string, string>;
}

const MODEL_NAME = "gemini-2.5-flash";

function buildQuery(country: string, circleKey: string, sector?: string, category?: string): string {
  const circle = CIRCLES[circleKey];
  let query = `Identify ${category || circle.discoveryCategories} headquartered in or primarily active in ${country}`;
  query += sector ? `, with a focus on ${sector}` : `, with exposure to ${circle.discoverySectors}`;
  query += ". Prioritize entities showing evidence of patient capital, long-horizon stewardship, and governance discipline.";
  return query;
}

function buildPrompt(query: string, maxResults: number, categoryDescription: string): string {
  return `You are a research assistant identifying capital and strategic-partnership prospects for a capital-advisory intelligence project.

TASK: ${query}

Use web search to find real, currently active organizations. Return at most ${maxResults} distinct prospects.

STRICT RULES:
- Use only information you can verify through your search results. Never invent or guess a detail.
- If a field cannot be confirmed from a public source, set it to null (for email) or the exact string "Needs Verification" (for text fields) - do not guess a plausible-sounding value.
- Do not include duplicate organizations.
- Only include organizations that plausibly fit: ${categoryDescription}.
- When looking for a contact email, prefer official public-facing channels (e.g. an investorrelations@ or ir@ address) over a generic info@ address, and prefer either of those over a personal individual's email.

For each prospect, also fill "scoring_signals" - one short, specific evidence snippet per question below (a phrase or clause, not a paragraph). If your search results contain no evidence for a question, write "No evidence found" rather than a generic or hedged guess:
- core_fit: does the organization explicitly self-describe in terms matching its target category (stated type, structure, or role)?
- capital_or_operational_orientation: is there explicit language about long-term commitment, patient capital, or operational/strategic capability relevant to its role?
- sector_alignment: which specific target sectors are a stated core focus (not just listed)?
- governance_institutional_mindset: is there explicit governance/credibility language, or any speculative/short-term red flags?
- strategic_adjacency_tbp: does geography and/or sector plausibly overlap a global trade, infrastructure, energy, or digital-infrastructure corridor thesis?
- engagement_readiness: is there a named decision-maker and/or a direct (non-generic) contact route?

OUTPUT FORMAT: respond with ONLY a single JSON object inside a \`\`\`json fenced code block, no text before or after it, matching exactly this shape:

\`\`\`json
{
  "prospects": [
    {
      "name": "string",
      "brief_description": "string, 1-3 sentences",
      "sectors": ["string", "..."],
      "geography": "string",
      "email": "string or null",
      "email_status": "Found or Needs Verification",
      "location": "string",
      "source_urls": ["string", "..."],
      "introduced_by": "string or null",
      "scoring_signals": {
        "core_fit": "string",
        "capital_or_operational_orientation": "string",
        "sector_alignment": "string",
        "governance_institutional_mindset": "string",
        "strategic_adjacency_tbp": "string",
        "engagement_readiness": "string"
      }
    }
  ]
}
\`\`\``;
}

function extractJson(responseText: string): { prospects?: DiscoveredProspect[] } {
  const fenced = responseText.match(/```json\s*(\{[\s\S]*?\})\s*```/);
  const candidate = fenced ? fenced[1] : responseText.slice(responseText.indexOf("{"), responseText.lastIndexOf("}") + 1);
  return JSON.parse(candidate);
}

export interface SearchResult {
  query: string;
  webSearchQueries: string[];
  prospects: DiscoveredProspect[];
}

export async function searchProspects(
  circleKey: string,
  country: string,
  maxResults: number,
  sector?: string,
  category?: string
): Promise<SearchResult> {
  if (!CIRCLES[circleKey]) throw new Error(`Unknown circle: ${circleKey}`);
  const circle = CIRCLES[circleKey];
  const query = buildQuery(country, circleKey, sector, category);
  const prompt = buildPrompt(query, maxResults, category || circle.discoveryCategories);

  const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  let parsed: { prospects?: DiscoveredProspect[] } | null = null;
  let lastText = "";
  let response: Awaited<ReturnType<typeof client.models.generateContent>> | null = null;

  for (let attempt = 0; attempt < 2; attempt++) {
    response = await client.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: { tools: [{ googleSearch: {} }] },
    });
    lastText = response.text ?? "";
    try {
      parsed = extractJson(lastText);
      break;
    } catch {
      if (attempt === 0) continue;
    }
  }

  if (!parsed) {
    throw new Error(`Could not parse JSON from Gemini's response after retry. Raw response: ${lastText.slice(0, 500)}`);
  }

  const groundingMetadata = response?.candidates?.[0]?.groundingMetadata;
  const webSearchQueries = groundingMetadata?.webSearchQueries ?? [];
  const titleLookup: Record<string, string | null> = {};
  for (const chunk of groundingMetadata?.groundingChunks ?? []) {
    if (chunk.web?.uri) titleLookup[chunk.web.uri] = chunk.web.title ?? null;
  }

  const prospects = (parsed.prospects ?? []).map((p) => ({
    ...p,
    source_urls: ((p.source_urls as unknown as string[]) ?? []).map((url) => ({
      url,
      title: titleLookup[url] ?? null,
    })),
  }));

  return { query, webSearchQueries, prospects };
}
