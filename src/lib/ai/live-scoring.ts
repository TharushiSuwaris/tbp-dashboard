import { CIRCLES, calibratedScore, classify } from "./circles";
import { judgeTiers, type TierJudgment } from "./live-tiers";
import { computeSimilarity } from "./embedding-client";
import type { DiscoveredProspect } from "./live-search";
import type { Classification } from "@/types";

// Server-only. Combines judgeTiers() + computeSimilarity() + calibratedScore() into one total,
// same combination discovery/score_*.py's main() loop does per prospect.

export interface SimilarityResult {
  key: string;
  label: string;
  cosine: number;
  score: number;
  maxPoints: number;
}

export interface ScoredProspect {
  country: string;
  circle: string;
  name: string;
  comparisonText: string;
  tierCategories: TierJudgment[];
  similarityCategories: SimilarityResult[];
  totalScore: number;
  classification: Classification;
  priority: string;
}

function buildComparisonText(p: DiscoveredProspect): string {
  const parts = [p.brief_description, ...(p.sectors ?? []), ...Object.values(p.scoring_signals ?? {})];
  return parts.filter(Boolean).join(" ");
}

export async function scoreProspect(circleKey: string, country: string, prospect: DiscoveredProspect): Promise<ScoredProspect> {
  const circle = CIRCLES[circleKey];
  if (!circle) throw new Error(`Unknown circle: ${circleKey}`);

  const comparisonText = buildComparisonText(prospect);

  const tierCategories = await judgeTiers(circleKey, prospect);

  const similarityCategories: SimilarityResult[] = [];
  for (const simCat of circle.similarityCategories) {
    const cosine = await computeSimilarity(simCat.referenceText, comparisonText);
    similarityCategories.push({
      key: simCat.key,
      label: simCat.label,
      cosine,
      score: calibratedScore(cosine, simCat.floor, simCat.ceiling, simCat.maxPoints),
      maxPoints: simCat.maxPoints,
    });
  }

  const totalScore =
    Math.round(
      (tierCategories.reduce((sum, t) => sum + t.points, 0) +
        similarityCategories.reduce((sum, s) => sum + s.score, 0)) *
        100
    ) / 100;

  const { classification, priority } = classify(totalScore);

  return {
    country,
    circle: circle.label,
    name: prospect.name,
    comparisonText,
    tierCategories,
    similarityCategories,
    totalScore,
    classification,
    priority,
  };
}
