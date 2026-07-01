export type ProspectType =
  | "single-family-office"
  | "multi-family-office"
  | "family-controlled-investment-company"
  | "family-holding-company"
  | "founder-led-conglomerate"
  | "private-investment-group"
  | "hnwi-investment-entity"
  | "permanent-capital-private-group"
  | "strategic-private-capital-group"
  | "private-bank-family-office-desk"
  | "adviser-introducer-channel"
  | "family-business-network"
  | "family-office-event-forum";

export type PipelineStage =
  | "Identified"
  | "Profiled"
  | "Scored"
  | "Reviewed"
  | "Approved for Approach"
  | "Warm Introduction Sought"
  | "Contacted"
  | "Meeting Proposed"
  | "Meeting Scheduled"
  | "Briefing Pack Sent"
  | "Follow-Up Required"
  | "Diligence / Review"
  | "Commitment Discussion"
  | "Joined Circle"
  | "Not Suitable / Parked";

export type Classification =
  | "Priority Founding Steward Prospect"
  | "Strong Potential Prospect"
  | "Monitor / Secondary Prospect"
  | "Not Currently Suitable";

export type Region =
  | "North America"
  | "United Kingdom & Europe"
  | "Southeast Asia"
  | "South Asia"
  | "Central Asia"
  | "Gulf & Middle East"
  | "Africa"
  | "East Asia"
  | "Oceania"
  | "Latin America";

export type SectorFocus =
  | "Trade"
  | "Logistics"
  | "Ports"
  | "Maritime"
  | "Energy"
  | "Infrastructure"
  | "Real Estate"
  | "Data Infrastructure"
  | "Technology"
  | "Manufacturing"
  | "Food / Agribusiness"
  | "Healthcare"
  | "Financial Services"
  | "Emerging Markets"
  | "Industrial Platforms";

export type BriefingPackStatus = "Not Generated" | "In Progress" | "Generated" | "Approved" | "Sent";

export interface ScoringBreakdown {
  familyOfficeFit: number;        // max 20
  permanentCapitalOrientation: number;  // max 20
  sectorAlignment: number;        // max 20
  governanceInstitutionalMindset: number; // max 15
  strategicAdjacencyTBP: number;  // max 15
  engagementReadiness: number;    // max 10
}

export interface ScoringResult {
  totalScore: number;
  classification: Classification;
  breakdown: ScoringBreakdown;
  confidenceLevel: "High" | "Medium" | "Low";
  missingInfoFlags: string[];
  explanation: string;
}

export interface Prospect {
  id: string;
  prospect_name: string;
  prospect_type: ProspectType;
  country: string;
  city: string;
  region: Region;
  website?: string;
  public_source_url?: string;
  source_quality: "High" | "Medium" | "Low";
  key_public_contacts?: string;
  email?: string;
  address?: string;
  family_or_group_background: string;
  investment_philosophy: string;
  known_investment_themes: string[];
  sector_interests: SectorFocus[];
  long_horizon_capital_indicators: boolean;
  permanent_capital_indicators: boolean;
  direct_investment_activity: boolean;
  infrastructure_exposure: "High" | "Medium" | "Low" | "None";
  energy_exposure: "High" | "Medium" | "Low" | "None";
  logistics_transport_exposure: "High" | "Medium" | "Low" | "None";
  real_estate_exposure: "High" | "Medium" | "Low" | "None";
  technology_digital_infrastructure_exposure: "High" | "Medium" | "Low" | "None";
  emerging_markets_exposure: "High" | "Medium" | "Low" | "None";
  governance_stewardship_language: boolean;
  tbp_relevance_summary: string;
  best_tbp_entry_point: string;
  suggested_conversation_angle: string;
  recommended_contact_route: string;
  likely_diligence_questions: string[];
  diligence_flags: string[];
  suitability_score: number;
  scoring_breakdown: ScoringBreakdown;
  classification: Classification;
  pipeline_stage: PipelineStage;
  assigned_owner: string;
  next_action: string;
  next_action_date: string;
  briefing_pack_status: BriefingPackStatus;
  created_at: string;
  updated_at: string;
}

export interface CorridorMatch {
  corridorName: string;
  relevanceScore: number;
  reasoning: string;
  investorRelevance: string;
  suggestedConversationAngle: string;
}

export interface CorridorMatchResult {
  prospectId: string;
  bestEntryPoint: CorridorMatch;
  secondaryEntryPoints: CorridorMatch[];
}

export interface GovernanceCheckResult {
  riskScore: number;
  flaggedPhrases: Array<{ phrase: string; replacement: string; severity: "blocked" | "needs-review" }>;
  saferReplacements: Record<string, string>;
  recommendedDisclaimer: string;
  approvalStatus: "Safe" | "Needs Review" | "Blocked";
  summary: string;
}

export interface BriefingPackSection {
  title: string;
  content: string;
}

export interface BriefingPack {
  prospectId: string;
  prospectName: string;
  generatedAt: string;
  sections: {
    backgroundNote: string;
    whyFitsTBP: string;
    relevantTBPThemes: string[];
    suggestedConversationAngle: string;
    potentialTBPEntryPoint: string;
    likelyQuestions: string[];
    recommendedContactRoute: string;
    draftIntroEmail: string;
    draftFollowUpEmail: string;
    suggestedMeetingAgenda: string[];
    postMeetingActionTemplate: string[];
    governanceWarning: string;
  };
  governanceStatus: "Safe" | "Needs Review";
}

export type AgentStatus = "Mock" | "Active" | "Needs API";

export interface AIAgent {
  id: string;
  name: string;
  purpose: string;
  input: string;
  output: string;
  status: AgentStatus;
  lastRun?: string;
  humanApprovalRequired: boolean;
  icon: string;
}

export type DocumentStatus = "Draft" | "In Review" | "Approved (Internal)" | "Approved (External)" | "Archived";

export interface Document {
  id: string;
  title: string;
  status: DocumentStatus;
  owner: string;
  version: string;
  lastUpdated: string;
  approvedInternal: boolean;
  approvedExternal: boolean;
  linkedProspects: string[];
  notes: string;
  category: string;
}

export type TaskStatus = "Todo" | "In Progress" | "Review" | "Done";
export type TaskPriority = "High" | "Medium" | "Low";

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  linkedProspects: string[];
  tags: string[];
}

export type UserRole =
  | "TBP Leadership"
  | "Capital Advisory Lead"
  | "Global Strategist"
  | "AI / Data Intern"
  | "Reviewer"
  | "Read-only Adviser";

export interface DiscoverySearchParams {
  region?: string;
  country?: string;
  city?: string;
  prospectCategory?: string;
  sectorFocus?: string;
  minimumSuitabilityScore?: number;
  sourceType?: string;
  searchDepth?: "Quick" | "Standard" | "Deep";
}

export interface KPISummary {
  totalProspects: number;
  profiled: number;
  scored: number;
  priorityFoundingSteward: number;
  strongPotential: number;
  requiresDiligenceReview: number;
  briefingPacksGenerated: number;
  meetingOpportunities: number;
  foundingStewardsSecured: number;
  targetFoundingStewards: number;
}
