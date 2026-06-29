import type { Prospect, ScoringResult, ScoringBreakdown, Classification } from "@/types";

function classify(score: number): Classification {
  if (score >= 80) return "Priority Founding Steward Prospect";
  if (score >= 65) return "Strong Potential Prospect";
  if (score >= 50) return "Monitor / Secondary Prospect";
  return "Not Currently Suitable";
}

function confidenceLevel(missingFlags: string[]): "High" | "Medium" | "Low" {
  if (missingFlags.length === 0) return "High";
  if (missingFlags.length <= 2) return "Medium";
  return "Low";
}

export function scoreProspect(prospect: Prospect): ScoringResult {
  const missingInfoFlags: string[] = [];

  // If the prospect already has a pre-computed breakdown, return it
  const bd = prospect.scoring_breakdown;
  const total =
    bd.familyOfficeFit +
    bd.permanentCapitalOrientation +
    bd.sectorAlignment +
    bd.governanceInstitutionalMindset +
    bd.strategicAdjacencyTBP +
    bd.engagementReadiness;

  if (!prospect.key_public_contacts) missingInfoFlags.push("Key public contacts not identified");
  if (!prospect.website) missingInfoFlags.push("Website / public source not confirmed");
  if (prospect.diligence_flags.length > 0)
    prospect.diligence_flags.forEach((f) => missingInfoFlags.push(f));

  const explanation = buildExplanation(bd, prospect);

  return {
    totalScore: total,
    classification: classify(total),
    breakdown: bd,
    confidenceLevel: confidenceLevel(missingInfoFlags),
    missingInfoFlags,
    explanation,
  };
}

function buildExplanation(bd: ScoringBreakdown, prospect: Prospect): string {
  const lines: string[] = [];

  lines.push(`Family Office Fit (${bd.familyOfficeFit}/20): ${bd.familyOfficeFit >= 17 ? "Strong match" : bd.familyOfficeFit >= 14 ? "Good match" : "Partial match"} with family office, HNWI or family-controlled investment group profile.`);
  lines.push(`Permanent-Capital Orientation (${bd.permanentCapitalOrientation}/20): ${prospect.long_horizon_capital_indicators && prospect.permanent_capital_indicators ? "Clear evidence of long-term, patient, multi-generational capital." : "Partial evidence of long-horizon orientation."}`);
  lines.push(`Sector Alignment (${bd.sectorAlignment}/20): ${prospect.sector_interests.length >= 4 ? "Strong multi-sector alignment with TBP's corridor and infrastructure thesis." : "Moderate sector alignment — some TBP-relevant interests identified."}`);
  lines.push(`Governance & Institutional Mindset (${bd.governanceInstitutionalMindset}/15): ${prospect.governance_stewardship_language ? "Governance-safe language evident in public materials." : "Governance language not yet confirmed — requires internal verification."}`);
  lines.push(`Strategic Adjacency to TBP (${bd.strategicAdjacencyTBP}/15): Best entry point identified as ${prospect.best_tbp_entry_point}.`);
  lines.push(`Engagement Readiness (${bd.engagementReadiness}/10): ${bd.engagementReadiness >= 7 ? "Clear engagement pathway available." : bd.engagementReadiness >= 5 ? "Moderate engagement pathway — warm introduction may be required." : "Engagement pathway limited — contact intelligence research needed."}`);

  return lines.join(" | ");
}

export function computeScore(input: {
  prospectType: string;
  hasLongHorizon: boolean;
  hasPermanentCapital: boolean;
  sectorCount: number;
  hasGovernanceLanguage: boolean;
  hasDirectInvestment: boolean;
  infrastructureExposure: string;
  hasPublicContacts: boolean;
}): ScoringBreakdown {
  const foFit = Math.min(20, (input.prospectType === "single-family-office" ? 20 : input.prospectType === "multi-family-office" ? 18 : 15));
  const permCap = Math.min(20, (input.hasLongHorizon ? 12 : 5) + (input.hasPermanentCapital ? 8 : 0));
  const sectorAlign = Math.min(20, input.sectorCount * 4);
  const govMindset = Math.min(15, (input.hasGovernanceLanguage ? 12 : 7) + (input.hasDirectInvestment ? 3 : 0));
  const tbpAdj = Math.min(15, (input.infrastructureExposure === "High" ? 13 : input.infrastructureExposure === "Medium" ? 10 : 6));
  const engReady = Math.min(10, input.hasPublicContacts ? 7 : 4);

  return {
    familyOfficeFit: foFit,
    permanentCapitalOrientation: permCap,
    sectorAlignment: sectorAlign,
    governanceInstitutionalMindset: govMindset,
    strategicAdjacencyTBP: tbpAdj,
    engagementReadiness: engReady,
  };
}
