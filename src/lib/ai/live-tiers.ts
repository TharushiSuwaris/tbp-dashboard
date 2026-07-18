import { GoogleGenAI, Type } from "@google/genai";
import { CIRCLES } from "./circles";
import type { DiscoveredProspect } from "./live-search";

// Server-only. Ported from discovery/score_*.py judge_tiers() - generalized across circles
// using each circle's tierCategories config instead of a hardcoded Pydantic model per circle.

const MODEL_NAME = "gemini-2.5-flash";
const MAX_RETRIES = 3;

export interface TierJudgment {
  key: string;
  label: string;
  tier: string;
  points: number;
  maxPoints: number;
  reason: string;
}

function buildResponseSchema(categoryKeys: string[]) {
  const properties: Record<string, unknown> = {};
  for (const key of categoryKeys) {
    properties[key] = {
      type: Type.OBJECT,
      properties: {
        tier: { type: Type.STRING },
        points: { type: Type.INTEGER },
        reason: { type: Type.STRING },
      },
      required: ["tier", "points", "reason"],
    };
  }
  return { type: Type.OBJECT, properties, required: categoryKeys };
}

export async function judgeTiers(circleKey: string, p: DiscoveredProspect): Promise<TierJudgment[]> {
  const circle = CIRCLES[circleKey];
  if (!circle) throw new Error(`Unknown circle: ${circleKey}`);

  const signals = p.scoring_signals ?? {};
  const evidenceLines = Object.entries(signals)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");

  const prompt = `${circle.tierRubric}

PROSPECT EVIDENCE:
Name: ${p.name}
Description: ${p.brief_description}
${evidenceLines}`;

  const categoryKeys = circle.tierCategories.map((c) => c.key);
  const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  let lastError: unknown;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await client.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: buildResponseSchema(categoryKeys),
        },
      });
      const parsed = JSON.parse(response.text ?? "{}") as Record<string, { tier: string; points: number; reason: string }>;
      return circle.tierCategories.map((cat) => ({
        key: cat.key,
        label: cat.label,
        maxPoints: cat.maxPoints,
        tier: parsed[cat.key]?.tier ?? "Unclear",
        points: parsed[cat.key]?.points ?? 0,
        reason: parsed[cat.key]?.reason ?? "",
      }));
    } catch (exc) {
      lastError = exc;
      if (attempt === MAX_RETRIES - 1) break;
      await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Failed to judge tiers");
}
