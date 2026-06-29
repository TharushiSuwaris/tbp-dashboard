import type { GovernanceCheckResult } from "@/types";

const FORBIDDEN_PHRASES: Array<{ phrase: string; replacement: string; severity: "blocked" | "needs-review" }> = [
  { phrase: "access fee", replacement: "formation stewardship contribution", severity: "blocked" },
  { phrase: "guaranteed return", replacement: "long-horizon stewardship capital outcomes", severity: "blocked" },
  { phrase: "guaranteed returns", replacement: "long-horizon stewardship capital outcomes", severity: "blocked" },
  { phrase: "guaranteed allocation", replacement: "prioritised participation opportunity", severity: "blocked" },
  { phrase: "control rights", replacement: "founding strategic steward adjacency", severity: "blocked" },
  { phrase: "exclusive entitlement", replacement: "founding strategic steward adjacency", severity: "blocked" },
  { phrase: "guaranteed project access", replacement: "subject to eligibility and due diligence", severity: "blocked" },
  { phrase: "guaranteed liquidity", replacement: "subject to applicable liquidity and exit provisions", severity: "blocked" },
  { phrase: "investment certainty", replacement: "subject to governance and due diligence review", severity: "blocked" },
  { phrase: "risk-free opportunity", replacement: "governance-safe institutional formation opportunity", severity: "blocked" },
  { phrase: "guaranteed upside", replacement: "subject to project-level documentation and governance approval", severity: "blocked" },
  { phrase: "exclusive investment rights", replacement: "founding strategic steward adjacency", severity: "blocked" },
  { phrase: "assured exit", replacement: "subject to applicable liquidity provisions", severity: "blocked" },
  { phrase: "guaranteed yield", replacement: "long-horizon stewardship capital outcomes", severity: "blocked" },
  { phrase: "no-risk participation", replacement: "governance-safe institutional formation opportunity", severity: "blocked" },
  { phrase: "ownership stake", replacement: "founding strategic steward participation", severity: "blocked" },
  { phrase: "investment returns", replacement: "long-horizon stewardship capital outcomes", severity: "needs-review" },
  { phrase: "exclusive access", replacement: "priority consideration subject to eligibility and due diligence", severity: "needs-review" },
  { phrase: "guaranteed access", replacement: "subject to eligibility and due diligence", severity: "blocked" },
];

export const REQUIRED_DISCLAIMER =
  "Participation does not guarantee future project allocation, returns, liquidity, exclusivity or control rights. Future opportunities remain subject to eligibility, due diligence, governance approval, project-level documentation and applicable legal and regulatory requirements.";

export function checkGovernanceLanguage(text: string): GovernanceCheckResult {
  const lowerText = text.toLowerCase();
  const flaggedPhrases: GovernanceCheckResult["flaggedPhrases"] = [];
  const saferReplacements: Record<string, string> = {};

  for (const item of FORBIDDEN_PHRASES) {
    if (lowerText.includes(item.phrase.toLowerCase())) {
      flaggedPhrases.push({
        phrase: item.phrase,
        replacement: item.replacement,
        severity: item.severity,
      });
      saferReplacements[item.phrase] = item.replacement;
    }
  }

  const blockedCount = flaggedPhrases.filter((f) => f.severity === "blocked").length;
  const reviewCount = flaggedPhrases.filter((f) => f.severity === "needs-review").length;

  let approvalStatus: "Safe" | "Needs Review" | "Blocked";
  let riskScore: number;

  if (blockedCount > 0) {
    approvalStatus = "Blocked";
    riskScore = Math.min(100, 40 + blockedCount * 15 + reviewCount * 5);
  } else if (reviewCount > 0) {
    approvalStatus = "Needs Review";
    riskScore = Math.min(60, 20 + reviewCount * 10);
  } else {
    approvalStatus = "Safe";
    riskScore = 0;
  }

  const summary =
    blockedCount > 0
      ? `${blockedCount} blocked phrase${blockedCount > 1 ? "s" : ""} detected. This text cannot be used in any external communication until all flagged phrases are replaced. ${reviewCount > 0 ? `Additionally, ${reviewCount} phrase${reviewCount > 1 ? "s" : ""} require review.` : ""}`
      : reviewCount > 0
      ? `${reviewCount} phrase${reviewCount > 1 ? "s" : ""} require review before this text is approved for external use.`
      : "No governance language issues detected. Text appears compliant with TBP's approved language framework. Recommend human review before any external use.";

  return {
    riskScore,
    flaggedPhrases,
    saferReplacements,
    recommendedDisclaimer: REQUIRED_DISCLAIMER,
    approvalStatus,
    summary,
  };
}

export const APPROVED_LANGUAGE = [
  { phrase: "Founding Stewardship Commitment", note: "Primary engagement term" },
  { phrase: "Institutional formation round", note: "Replaces 'access round'" },
  { phrase: "Governance dialogue", note: "For initial engagement framing" },
  { phrase: "Strategic adjacency", note: "For sector fit conversations" },
  { phrase: "Priority consideration subject to eligibility and due diligence", note: "Replaces 'guaranteed allocation'" },
  { phrase: "Permanent-capital alignment", note: "For long-horizon capital framing" },
  { phrase: "Long-duration infrastructure formation", note: "For infrastructure conversations" },
  { phrase: "Family-office stewardship layer", note: "For steward role description" },
  { phrase: "Project-level opportunities subject to separate documentation", note: "When referencing future projects" },
  { phrase: "Subject to legal, regulatory, tax, governance and diligence review", note: "Standard qualifier" },
  { phrase: "Internal discussion purposes only", note: "For all draft materials" },
  { phrase: "Protocol Establishment Round", note: "Official round name" },
  { phrase: "Permanent-capital ecosystem partner", note: "For steward role description" },
  { phrase: "Formation stewardship contribution", note: "Replaces 'access fee'" },
  { phrase: "Prioritised participation opportunity", note: "Replaces 'guaranteed allocation'" },
];
