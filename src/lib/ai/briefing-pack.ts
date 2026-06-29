import type { Prospect, BriefingPack } from "@/types";
import { REQUIRED_DISCLAIMER } from "./governance";

export function generateBriefingPack(prospect: Prospect): BriefingPack {
  const tierLabel =
    prospect.classification === "Priority Founding Steward Prospect"
      ? "Priority Founding Steward"
      : prospect.classification === "Strong Potential Prospect"
      ? "Strong Potential Prospect"
      : "Secondary Prospect";

  const backgroundNote = `${prospect.prospect_name} is a ${prospect.prospect_type.replace(/-/g, " ")} headquartered in ${prospect.city}, ${prospect.country}. ${prospect.family_or_group_background} This profile has been developed from publicly available and ethically sourced information only.`;

  const whyFitsTBP = `${prospect.prospect_name} demonstrates strong alignment with TBP's Founding Strategic Family Office Circle thesis for the following reasons: (1) ${prospect.long_horizon_capital_indicators ? "Clear long-horizon capital indicators are evident from public sources." : "Capital orientation shows some long-horizon characteristics."} (2) ${prospect.permanent_capital_indicators ? "Permanent-capital indicators are present in the group's publicly stated investment philosophy." : "Capital permanence is partially evidenced in public materials."} (3) The group's exposure to ${prospect.sector_interests.slice(0, 3).join(", ")} creates direct strategic adjacency with TBP's corridor and infrastructure formation thesis. (4) The overall suitability score of ${prospect.suitability_score}/100 classifies this prospect as a ${tierLabel}. This assessment is for internal TBP review only and subject to further diligence.`;

  const relevantTBPThemes = [
    `${prospect.best_tbp_entry_point} — primary corridor alignment`,
    prospect.infrastructure_exposure !== "None" ? "Long-duration infrastructure formation" : "",
    prospect.permanent_capital_indicators ? "Permanent-capital ecosystem partnership" : "",
    prospect.governance_stewardship_language ? "Governance stewardship layer" : "",
    "Protocol Establishment Round — Founding Stewardship Commitment",
    prospect.sector_interests.includes("Trade") ? "Neutral global trade architecture" : "",
  ].filter(Boolean) as string[];

  const likelyQuestions = [
    ...prospect.likely_diligence_questions,
    "What are the governance safeguards in the Protocol Establishment Round?",
    "How is the stewardship commitment structured?",
    "What is the relationship between stewardship and future project-level opportunities?",
    "What legal and regulatory framework applies to the round?",
  ];

  const draftIntroEmail = `Dear [Principal / Decision-Maker],

I hope this note finds you well.

I am reaching out on behalf of The Borderless Project (TBP), a neutral global trade infrastructure and governance initiative, to introduce an early institutional formation opportunity that may be of interest to ${prospect.prospect_name}.

TBP is currently convening a limited group of aligned family offices and private capital groups for the Protocol Establishment Round — an institutional formation layer designed to support the development of TBP's neutral global trade infrastructure protocol and governance architecture.

Given ${prospect.prospect_name}'s publicly known interest in ${prospect.sector_interests.slice(0, 2).join(" and ")}, and the group's long-horizon capital orientation, TBP's Capital Advisory & Coordination Office believes there may be a meaningful basis for a governance dialogue.

This is an internal discussion only, and does not constitute a solicitation, offer, or invitation to invest. All materials are subject to TBP's governance, legal, and compliance review.

I would welcome the opportunity to schedule a brief introductory call at your convenience to share further background on the Protocol Establishment Round and explore whether there is a basis for a governance dialogue.

${REQUIRED_DISCLAIMER}

Yours sincerely,
[TBP Capital Advisory Representative]
The Borderless Project | Capital Advisory & Coordination Office
[For internal TBP discussion purposes only — not approved for external distribution]`;

  const draftFollowUpEmail = `Dear [Principal / Decision-Maker],

Thank you for taking the time to speak with us regarding the TBP Protocol Establishment Round.

As discussed, I am pleased to share further context on TBP's Founding Strategic Family Office Circle and the institutional formation framework. I have attached the TBP Founding Strategic Family Office Circle Brief for your internal review.

As a reminder, participation in the Protocol Establishment Round is structured as a Founding Stewardship Commitment — a governance-aligned, long-duration institutional formation opportunity. Future project-level opportunities remain subject to separate documentation, eligibility criteria, due diligence, and applicable legal and regulatory requirements.

TBP's Capital Advisory & Coordination Office would be pleased to arrange a further discussion at your convenience, or to provide a tailored briefing note aligned with ${prospect.prospect_name}'s specific areas of interest.

${REQUIRED_DISCLAIMER}

Yours sincerely,
[TBP Capital Advisory Representative]
The Borderless Project | Capital Advisory & Coordination Office
[For internal TBP discussion purposes only — not approved for external distribution]`;

  const suggestedMeetingAgenda = [
    "Welcome and introductions (5 minutes)",
    "TBP overview: neutral global trade infrastructure and governance architecture (10 minutes)",
    "Protocol Establishment Round: Founding Strategic Family Office Circle structure (10 minutes)",
    `${prospect.best_tbp_entry_point} — specific corridor relevance for ${prospect.prospect_name} (10 minutes)`,
    "Governance safeguards and compliance framework (5 minutes)",
    "Questions and dialogue (15 minutes)",
    "Agreed next steps and documentation (5 minutes)",
  ];

  const postMeetingActionTemplate = [
    "Send follow-up email with TBP Founding Strategic Family Office Circle Brief within 24 hours",
    "Pass meeting notes through TBP Governance Language Checker before distributing",
    "Submit meeting summary to TBP Capital Advisory Lead for review and approval",
    "Update pipeline stage in TBP Family Office Intelligence Engine",
    "Schedule diligence review if prospect has expressed interest",
    "Note any specific questions raised for follow-up research",
    "Identify any adviser or introducer relationships referenced during the meeting",
  ];

  const governanceWarning = `GOVERNANCE NOTICE: This briefing pack is for internal TBP use only and has not been approved for external distribution. All outreach communications must be reviewed through the TBP Governance Language Checker before any external use. TBP Leadership and Capital Advisory Lead approval is required before any prospect is approached externally. ${REQUIRED_DISCLAIMER}`;

  return {
    prospectId: prospect.id,
    prospectName: prospect.prospect_name,
    generatedAt: new Date().toISOString(),
    sections: {
      backgroundNote,
      whyFitsTBP,
      relevantTBPThemes,
      suggestedConversationAngle: prospect.suggested_conversation_angle,
      potentialTBPEntryPoint: prospect.best_tbp_entry_point,
      likelyQuestions,
      recommendedContactRoute: prospect.recommended_contact_route,
      draftIntroEmail,
      draftFollowUpEmail,
      suggestedMeetingAgenda,
      postMeetingActionTemplate,
      governanceWarning,
    },
    governanceStatus: "Needs Review",
  };
}
