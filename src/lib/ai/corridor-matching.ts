import type { Prospect, CorridorMatchResult, CorridorMatch } from "@/types";

export const TBP_CORRIDORS = [
  "TBP New York/Newark North America Neutral Trade Corridor",
  "TBP London Canary Wharf Neutral Trade City / Corridor",
  "TBP Indonesia Southeast Asia Neutral Trade Corridor",
  "TBP Saudi Red Sea Corridor",
  "TBP Global Nomadic Trader Ecosystem",
  "ASMOFP™ Offshore Energy / Data Infrastructure",
  "TBP Capital Advisory & Coordination Office",
  "TBP Corridor Trust Bank concept",
  "TBP Neutral Trade Cities",
  "TBP Global Offshore Energy Corridor",
];

function scoreCorridorFit(prospect: Prospect, corridor: string): number {
  let score = 0;
  const region = prospect.region;
  const sectors = prospect.sector_interests;
  const infraExp = prospect.infrastructure_exposure;
  const energyExp = prospect.energy_exposure;
  const logisticsExp = prospect.logistics_transport_exposure;
  const techExp = prospect.technology_digital_infrastructure_exposure;
  const emergingExp = prospect.emerging_markets_exposure;

  if (corridor === "TBP New York/Newark North America Neutral Trade Corridor") {
    if (region === "North America") score += 40;
    if (sectors.includes("Trade")) score += 20;
    if (sectors.includes("Logistics") || sectors.includes("Ports")) score += 20;
    if (infraExp === "High") score += 20;
  } else if (corridor === "TBP London Canary Wharf Neutral Trade City / Corridor") {
    if (region === "United Kingdom & Europe") score += 40;
    if (sectors.includes("Trade")) score += 20;
    if (sectors.includes("Financial Services")) score += 15;
    if (sectors.includes("Maritime") || sectors.includes("Logistics")) score += 15;
    if (infraExp === "High") score += 10;
  } else if (corridor === "TBP Indonesia Southeast Asia Neutral Trade Corridor") {
    if (region === "Southeast Asia") score += 40;
    if (sectors.includes("Trade") || sectors.includes("Logistics")) score += 20;
    if (sectors.includes("Ports") || sectors.includes("Maritime")) score += 20;
    if (logisticsExp === "High") score += 10;
    if (emergingExp === "High") score += 10;
  } else if (corridor === "TBP Saudi Red Sea Corridor") {
    if (region === "Gulf & Middle East") score += 40;
    if (sectors.includes("Ports") || sectors.includes("Energy")) score += 25;
    if (sectors.includes("Infrastructure")) score += 20;
    if (logisticsExp === "High") score += 15;
  } else if (corridor === "TBP Global Nomadic Trader Ecosystem") {
    if (sectors.includes("Trade")) score += 25;
    if (emergingExp === "High") score += 20;
    if (logisticsExp === "High") score += 15;
    if (prospect.direct_investment_activity) score += 10;
    if (prospect.long_horizon_capital_indicators) score += 10;
    if (["Africa", "South Asia", "Latin America", "Central Asia"].includes(region)) score += 20;
  } else if (corridor === "ASMOFP™ Offshore Energy / Data Infrastructure") {
    if (energyExp === "High") score += 35;
    if (techExp === "High") score += 25;
    if (sectors.includes("Data Infrastructure") || sectors.includes("Technology")) score += 20;
    if (sectors.includes("Energy")) score += 20;
  } else if (corridor === "TBP Capital Advisory & Coordination Office") {
    if (prospect.governance_stewardship_language) score += 20;
    if (prospect.permanent_capital_indicators) score += 20;
    if (prospect.long_horizon_capital_indicators) score += 20;
    if (infraExp === "High") score += 15;
    if (sectors.includes("Financial Services")) score += 15;
    score += 10;
  } else if (corridor === "TBP Corridor Trust Bank concept") {
    if (sectors.includes("Financial Services")) score += 40;
    if (prospect.governance_stewardship_language) score += 20;
    if (sectors.includes("Trade")) score += 20;
    if (infraExp !== "None") score += 10;
  } else if (corridor === "TBP Neutral Trade Cities") {
    if (prospect.direct_investment_activity) score += 20;
    if (sectors.includes("Infrastructure") || sectors.includes("Real Estate")) score += 20;
    if (sectors.includes("Trade")) score += 20;
    if (infraExp === "High") score += 20;
    if (prospect.long_horizon_capital_indicators) score += 20;
  } else if (corridor === "TBP Global Offshore Energy Corridor") {
    if (energyExp === "High") score += 35;
    if (sectors.includes("Maritime") || sectors.includes("Ports")) score += 25;
    if (sectors.includes("Energy")) score += 20;
    if (logisticsExp === "High") score += 10;
    if (emergingExp === "High") score += 10;
  }

  return Math.min(100, score);
}

function buildCorridorReasoning(prospect: Prospect, corridor: string, score: number): string {
  if (score >= 80) return `Exceptional alignment with ${corridor}. ${prospect.sector_interests.slice(0, 3).join(", ")} exposure and ${prospect.region} base create direct strategic adjacency.`;
  if (score >= 60) return `Strong alignment with ${corridor}. Key sector themes and geography create relevant touchpoints for institutional formation dialogue.`;
  if (score >= 40) return `Moderate alignment with ${corridor}. Secondary or thematic connection — may be relevant as the corridor develops.`;
  return `Limited direct alignment with ${corridor}. Could be explored as a secondary corridor reference.`;
}

export function matchProspectToCorridor(prospect: Prospect): CorridorMatchResult {
  const corridorScores: Array<{ corridor: string; score: number }> = TBP_CORRIDORS.map((corridor) => ({
    corridor,
    score: scoreCorridorFit(prospect, corridor),
  })).sort((a, b) => b.score - a.score);

  const best = corridorScores[0];
  const secondary = corridorScores.slice(1, 4).filter((c) => c.score > 30);

  const bestMatch: CorridorMatch = {
    corridorName: best.corridor,
    relevanceScore: best.score,
    reasoning: buildCorridorReasoning(prospect, best.corridor, best.score),
    investorRelevance: `${prospect.prospect_name} shows ${best.score >= 70 ? "strong" : "moderate"} relevance for ${best.corridor} based on ${prospect.sector_interests.slice(0, 2).join(" and ")} exposure.`,
    suggestedConversationAngle: prospect.suggested_conversation_angle,
  };

  const secondaryMatches: CorridorMatch[] = secondary.map((s) => ({
    corridorName: s.corridor,
    relevanceScore: s.score,
    reasoning: buildCorridorReasoning(prospect, s.corridor, s.score),
    investorRelevance: `Secondary corridor relevance based on thematic overlap.`,
    suggestedConversationAngle: `Explore ${s.corridor} as a secondary entry point in later-stage conversations.`,
  }));

  return {
    prospectId: prospect.id,
    bestEntryPoint: bestMatch,
    secondaryEntryPoints: secondaryMatches,
  };
}
