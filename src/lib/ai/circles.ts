// Ported from discovery/discover.py CIRCLES and discovery/score_*.py - one entry per circle.
// Kept in sync by hand; if the Python rubrics/calibration change, mirror the change here too.

export interface TierCategoryDef {
  key: string;
  label: string;
  maxPoints: number;
}

export interface SimilarityCategoryDef {
  key: string;
  label: string;
  referenceText: string;
  floor: number;
  ceiling: number;
  maxPoints: number;
}

export interface CircleDef {
  key: string;
  label: string;
  discoveryCategories: string; // for the search prompt ("Identify {categories} headquartered in...")
  discoverySectors: string;
  tierRubric: string; // full rubric text sent to Gemini
  tierCategories: TierCategoryDef[]; // order matches the rubric's numbering
  similarityCategories: SimilarityCategoryDef[];
}

// Reused across circles as-is: these describe TBP's own sector interests and corridor thesis,
// not "what makes an ideal prospect" - so they don't need to vary per circle. See
// discovery/score_family_office.py for the origin of this reasoning.
const SECTOR_REFERENCE_TEXT =
  "Trade, infrastructure, energy, logistics, digital infrastructure, real estate, " +
  "ports, technology, industrial platforms, and emerging markets investment activity.";

const STRATEGIC_ADJACENCY_REFERENCE_TEXT =
  "TBP's neutral global trade infrastructure and corridor-formation thesis, including " +
  "the Protocol Establishment Round and future corridor, city, port, energy, data and " +
  "digital-infrastructure opportunities such as the New York/Newark North America corridor, " +
  "London Canary Wharf, the Southeast Asia/Indonesia corridor, the Saudi Red Sea corridor, " +
  "and Central Asia trade corridors.";

// v1 calibration - quartiles from the first 29 real Family Office prospects. Not frozen -
// revisit once more countries/prospects have been gathered. Reused as a placeholder for the
// other 4 circles too (see discovery/KNOWN_ISSUES.md item 11 - not yet independently calibrated).
const SECTOR_ALIGNMENT_FLOOR = 0.2165;
const SECTOR_ALIGNMENT_CEILING = 0.3341;
const STRATEGIC_ADJACENCY_FLOOR = 0.0875;
const STRATEGIC_ADJACENCY_CEILING = 0.2346;

export const CIRCLES: Record<string, CircleDef> = {
  "family-office": {
    key: "family-office",
    label: "Family Office",
    discoveryCategories:
      "single-family offices, multi-family offices, family-controlled investment " +
      "companies, family holding companies, qualified HNWI investment entities, " +
      "and permanent-capital private investment groups",
    discoverySectors:
      "trade, infrastructure, energy, logistics, digital infrastructure, real " +
      "estate, ports, technology, industrial platforms, or emerging markets",
    tierRubric: `For each category below, judge which ONE tier the evidence supports, and give a one-sentence reason. Base your judgment ONLY on the evidence given, do not guess beyond it.

1. family_office_fit (max 20) - "How clearly does the prospect fit the family office, private capital, HNWI or family-controlled investment group profile?"
   Clear=20: Explicitly self-described as one of these categories
   Reasonably Clear=14: Strongly implied by name/structure, not self-labeled
   Ambiguous=8: Mixed signals - could plausibly be something else
   Unclear=0: No basis to classify this way

2. permanent_capital_orientation (max 20) - "Does the prospect show evidence of long-term, patient, multi-generational or stewardship-oriented capital?"
   Clear=20: Explicit long-term AND multi-generational/stewardship language
   Reasonably Clear=14: One of the two present, not both
   Ambiguous=8: No explicit language either way
   Unclear=0: Evidence suggests short-term/fund-cycle orientation

3. governance_institutional_mindset (max 15) - "Does the prospect appear suitable for a governance-aware institutional formation opportunity rather than a speculative or short-term investment?"
   Clear=15: Explicit governance/stewardship language, no red flags
   Reasonably Clear=10: Some institutional-mindset signals, no red flags
   Ambiguous=5: Signals absent or mixed
   Unclear=0: Speculative/short-term language present

4. engagement_readiness (max 10) - "Is there a realistic pathway to engage the prospect through public contacts, advisers, networks, introductions, events or known relationships?"
   Clear=10: Named decision-maker AND direct contact route
   Reasonably Clear=7: One of the two present
   Ambiguous=3: Only generic/indirect route
   Unclear=0: No pathway found`,
    tierCategories: [
      { key: "family_office_fit", label: "Family Office Fit", maxPoints: 20 },
      { key: "permanent_capital_orientation", label: "Permanent-Capital Orientation", maxPoints: 20 },
      { key: "governance_institutional_mindset", label: "Governance & Institutional Mindset", maxPoints: 15 },
      { key: "engagement_readiness", label: "Engagement Readiness", maxPoints: 10 },
    ],
    similarityCategories: [
      { key: "sector_alignment", label: "Sector Alignment", referenceText: SECTOR_REFERENCE_TEXT, floor: SECTOR_ALIGNMENT_FLOOR, ceiling: SECTOR_ALIGNMENT_CEILING, maxPoints: 20 },
      { key: "strategic_adjacency", label: "Strategic Adjacency to TBP", referenceText: STRATEGIC_ADJACENCY_REFERENCE_TEXT, floor: STRATEGIC_ADJACENCY_FLOOR, ceiling: STRATEGIC_ADJACENCY_CEILING, maxPoints: 15 },
    ],
  },

  "angel-investor": {
    key: "angel-investor",
    label: "Angel Investor",
    discoveryCategories:
      "angel investors, strategic capital connectors, private-market advisers, " +
      "and ecosystem partners with early-stage or emerging-opportunity investment interest",
    discoverySectors:
      "trade, infrastructure, energy, logistics, digital infrastructure, fintech, " +
      "technology, or emerging markets, valued for network quality and ability to " +
      "support early visibility rather than capital scale alone",
    tierRubric: `For each category below, judge which ONE tier the evidence supports, and give a one-sentence reason. Base your judgment ONLY on the evidence given, do not guess beyond it.

1. capital_connector_value (max 20) - "Does the prospect show evidence of ability to connect or bring other investors/capital into opportunities?"
   Clear=20: Explicit track record or stated role as a capital connector/introducer of other investors
   Reasonably Clear=14: Implied connector role (e.g. described as well-networked investor/adviser), no explicit track record
   Ambiguous=8: Some investment activity mentioned, no clear connector role
   Unclear=0: No evidence of connector capability

2. network_quality (max 15) - "Is there evidence of a reputable, relevant professional network?"
   Clear=15: Named affiliations/networks or explicit reputation signals
   Reasonably Clear=10: General implied credibility, no specific network evidence
   Ambiguous=5: Minimal or vague signals
   Unclear=0: No evidence

3. early_visibility (max 10) - "Could the prospect realistically help generate early visibility or introductions for TBP?"
   Clear=10: Explicit history of introducing/promoting opportunities, or a public visibility role
   Reasonably Clear=7: Plausible given their role/position, not explicitly evidenced
   Ambiguous=3: Weak or indirect basis
   Unclear=0: No evidence

4. governance_suitability (max 10) - "Does the prospect show sound governance/ethical conduct rather than speculative or reputationally risky behavior?"
   Clear=10: Explicit governance/professional-conduct language, no red flags
   Reasonably Clear=7: Some positive signals, no red flags
   Ambiguous=3: Signals absent or mixed
   Unclear=0: Speculative or red-flag language present`,
    tierCategories: [
      { key: "capital_connector_value", label: "Capital Connector Value", maxPoints: 20 },
      { key: "network_quality", label: "Network Quality", maxPoints: 15 },
      { key: "early_visibility", label: "Ability to Support Early Visibility", maxPoints: 10 },
      { key: "governance_suitability", label: "Governance Suitability", maxPoints: 10 },
    ],
    similarityCategories: [
      { key: "sector_relevance", label: "Sector Relevance", referenceText: SECTOR_REFERENCE_TEXT, floor: SECTOR_ALIGNMENT_FLOOR, ceiling: SECTOR_ALIGNMENT_CEILING, maxPoints: 20 },
      { key: "strategic_relevance", label: "Strategic Relevance to TBP", referenceText: STRATEGIC_ADJACENCY_REFERENCE_TEXT, floor: STRATEGIC_ADJACENCY_FLOOR, ceiling: STRATEGIC_ADJACENCY_CEILING, maxPoints: 25 },
    ],
  },

  "institutional-sovereign": {
    key: "institutional-sovereign",
    label: "Institutional / Sovereign",
    discoveryCategories:
      "sovereign wealth funds, infrastructure investment funds, pension funds, " +
      "asset management firms, and large institutional investment platforms",
    discoverySectors:
      "infrastructure, energy, trade, ports, and large-scale institutional " +
      "investment platforms with significant capital scale",
    tierRubric: `For each category below, judge which ONE tier the evidence supports, and give a one-sentence reason. Base your judgment ONLY on the evidence given, do not guess beyond it.

1. institutional_credibility (max 20) - "Is there evidence this is a real, established, credible institution?"
   Clear=20: Well-documented, established institution with clear public track record (e.g. state-backed fund, major regulated entity)
   Reasonably Clear=14: Plausibly credible based on structure/positioning, limited specific verification
   Ambiguous=8: Mixed or unclear signals about institutional standing
   Unclear=0: No basis to assess credibility

2. capital_scale (max 20) - "Is there evidence of significant capital scale (AUM, fund size, deployment capacity)?"
   Clear=20: Explicit large capital figures stated (e.g. specific AUM/fund size)
   Reasonably Clear=14: General indication of scale without specific figures
   Ambiguous=8: Vague or unclear scale indicators
   Unclear=0: No evidence of capital scale

3. platform_validation_value (max 10) - "Would this institution's involvement lend meaningful credibility/validation to TBP's platform?"
   Clear=10: High-profile, widely recognized institution whose involvement would be a clear credibility signal
   Reasonably Clear=7: Reasonably well-regarded, moderate validation value
   Ambiguous=3: Limited or unclear validation value
   Unclear=0: No basis to assess

4. engagement_route_quality (max 10) - "Is there a realistic pathway to engage this institution (public contacts, official channels, advisers)?"
   Clear=10: Named decision-maker and/or direct official contact route
   Reasonably Clear=7: One of the two present
   Ambiguous=3: Only generic/indirect route
   Unclear=0: No pathway found`,
    tierCategories: [
      { key: "institutional_credibility", label: "Institutional Credibility", maxPoints: 20 },
      { key: "capital_scale", label: "Capital Scale", maxPoints: 20 },
      { key: "platform_validation_value", label: "Platform Validation Value", maxPoints: 10 },
      { key: "engagement_route_quality", label: "Engagement Route Quality", maxPoints: 10 },
    ],
    similarityCategories: [
      { key: "sector_alignment", label: "Infrastructure/Energy/Trade Alignment", referenceText: SECTOR_REFERENCE_TEXT, floor: SECTOR_ALIGNMENT_FLOOR, ceiling: SECTOR_ALIGNMENT_CEILING, maxPoints: 25 },
      { key: "strategic_geography", label: "Strategic Geography", referenceText: STRATEGIC_ADJACENCY_REFERENCE_TEXT, floor: STRATEGIC_ADJACENCY_FLOOR, ceiling: STRATEGIC_ADJACENCY_CEILING, maxPoints: 15 },
    ],
  },

  "strategic-operational-partner": {
    key: "strategic-operational-partner",
    label: "Strategic Operational Partner",
    discoveryCategories:
      "asset owners, port operators, logistics and freight companies, energy " +
      "infrastructure firms, and data-centre or digital-infrastructure operators",
    discoverySectors:
      "ports, logistics, energy infrastructure, digital infrastructure, and real " +
      "estate development capable of activating physical assets, corridors, cities, " +
      "or infrastructure",
    tierRubric: `For each category below, judge which ONE tier the evidence supports, and give a one-sentence reason. Base your judgment ONLY on the evidence given, do not guess beyond it.

1. asset_infrastructure_control (max 20) - "Is there evidence they genuinely own or control relevant physical assets/infrastructure?"
   Clear=20: Explicit, specific ownership/operation of relevant infrastructure (e.g. named port, energy facility, logistics network)
   Reasonably Clear=14: Plausible control implied, not explicitly documented
   Ambiguous=8: Vague or unclear control claims
   Unclear=0: No evidence of asset control

2. technical_delivery_capability (max 15) - "Is there evidence of genuine technical/operational delivery capability?"
   Clear=15: Explicit, specific track record of technical execution/delivery
   Reasonably Clear=11: General operational capability implied, no specific track record
   Ambiguous=5: Vague or generic capability claims
   Unclear=0: No evidence

3. strategic_partnership_value (max 10) - "Is there evidence of value as a long-term strategic partner beyond a single transaction?"
   Clear=10: Explicit long-term partnership orientation or track record
   Reasonably Clear=7: Plausible based on positioning, not explicitly evidenced
   Ambiguous=3: Weak or indirect basis
   Unclear=0: No evidence

4. governance_execution_readiness (max 10) - "Does the prospect show sound governance combined with operational readiness, rather than execution risk?"
   Clear=10: Explicit governance/compliance language and no execution-risk red flags
   Reasonably Clear=7: Some positive signals, no red flags
   Ambiguous=3: Signals absent or mixed
   Unclear=0: Red flags present (execution risk, governance concerns)`,
    tierCategories: [
      { key: "asset_infrastructure_control", label: "Asset/Infrastructure Control", maxPoints: 20 },
      { key: "technical_delivery_capability", label: "Technical/Delivery Capability", maxPoints: 15 },
      { key: "strategic_partnership_value", label: "Strategic Partnership Value", maxPoints: 10 },
      { key: "governance_execution_readiness", label: "Governance and Execution Readiness", maxPoints: 10 },
    ],
    similarityCategories: [
      { key: "operational_relevance", label: "Operational Relevance", referenceText: SECTOR_REFERENCE_TEXT, floor: SECTOR_ALIGNMENT_FLOOR, ceiling: SECTOR_ALIGNMENT_CEILING, maxPoints: 25 },
      { key: "corridor_activation_potential", label: "Corridor Activation Potential", referenceText: STRATEGIC_ADJACENCY_REFERENCE_TEXT, floor: STRATEGIC_ADJACENCY_FLOOR, ceiling: STRATEGIC_ADJACENCY_CEILING, maxPoints: 20 },
    ],
  },

  "capital-advisory-introducer": {
    key: "capital-advisory-introducer",
    label: "Capital Advisory / Introducer",
    discoveryCategories:
      "third-party capital advisers, private-market advisory firms, placement " +
      "agents, private banks, investment banks, and family-office introducers",
    discoverySectors:
      "capital introduction, private-market advisory, and investor placement " +
      "services who may bring qualified investors into opportunities, subject to " +
      "separate mandates",
    // No "Strategic Adjacency to TBP" category here - an introducer's fit is about their own
    // track record/credibility, not thesis alignment. See discovery/score_capital_advisory_introducer.py.
    tierRubric: `For each category below, judge which ONE tier the evidence supports, and give a one-sentence reason. Base your judgment ONLY on the evidence given, do not guess beyond it.

1. investor_network_quality (max 25) - "Is there evidence of a genuinely strong, relevant investor network?"
   Clear=25: Named significant investor relationships/client base, or specific strong-network evidence
   Reasonably Clear=18: General implied strong network, no specifics
   Ambiguous=10: Vague or unverifiable network claims
   Unclear=0: No evidence

2. private_market_experience (max 20) - "Is there evidence of genuine private-market capital advisory track record?"
   Clear=20: Specific track record (years, deals, notable transactions)
   Reasonably Clear=14: General private-market positioning, no specific detail
   Ambiguous=8: Vague or generic experience claims
   Unclear=0: No evidence

3. ability_to_bring_qualified_investors (max 15) - "Can they demonstrate real capability to deliver qualified, investment-ready capital, not just contacts?"
   Clear=15: Specific evidence of placing qualified investors into real transactions
   Reasonably Clear=11: Plausible given role/positioning, not explicitly evidenced
   Ambiguous=5: Vague claims of investor access
   Unclear=0: No evidence

4. mandate_clarity (max 15) - "Is there clarity around how this prospect would engage with TBP - role, fee structure, or relationship terms?"
   Clear=15: Explicit, structured advisory/introducer service offering
   Reasonably Clear=11: General advisory positioning, terms not detailed
   Ambiguous=5: Ambiguous or mixed role description
   Unclear=0: No basis to assess

5. conflict_management_suitability (max 10) - "Does the prospect show sound conflict-of-interest management appropriate to an intermediary role?"
   Clear=10: Explicit conflict-management/compliance language, no red flags
   Reasonably Clear=7: Licensed/regulated positioning, no explicit conflict language
   Ambiguous=3: Signals absent or mixed
   Unclear=0: Red flags present (undisclosed interest, opaque fees)`,
    tierCategories: [
      { key: "investor_network_quality", label: "Investor Network Quality", maxPoints: 25 },
      { key: "private_market_experience", label: "Private-Market Experience", maxPoints: 20 },
      { key: "ability_to_bring_qualified_investors", label: "Ability to Bring Qualified Investors", maxPoints: 15 },
      { key: "mandate_clarity", label: "Mandate Clarity", maxPoints: 15 },
      { key: "conflict_management_suitability", label: "Conflict-Management Suitability", maxPoints: 10 },
    ],
    similarityCategories: [
      { key: "sector_relevance", label: "Sector Relevance", referenceText: SECTOR_REFERENCE_TEXT, floor: SECTOR_ALIGNMENT_FLOOR, ceiling: SECTOR_ALIGNMENT_CEILING, maxPoints: 15 },
    ],
  },
};

export const CIRCLE_KEYS = Object.keys(CIRCLES);

export function classify(totalScore: number): { classification: "Priority Founding Steward Prospect" | "Strong Potential Prospect" | "Monitor / Secondary Prospect" | "Not Currently Suitable"; priority: string } {
  if (totalScore >= 80) return { classification: "Priority Founding Steward Prospect", priority: "Priority" };
  if (totalScore >= 65) return { classification: "Strong Potential Prospect", priority: "Strong" };
  if (totalScore >= 50) return { classification: "Monitor / Secondary Prospect", priority: "Monitor" };
  return { classification: "Not Currently Suitable", priority: "Low" };
}

export function calibratedScore(cosine: number, floor: number, ceiling: number, maxPoints: number): number {
  const normalized = Math.max(0, Math.min(1, (cosine - floor) / (ceiling - floor)));
  return Math.round(maxPoints * normalized * 100) / 100;
}
