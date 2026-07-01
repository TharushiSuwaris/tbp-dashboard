import { supabase } from "./client";
import type { Prospect, Task, Document } from "@/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function flattenProspect(row: any): Prospect {
  const profile  = row.prospect_profiles  ?? {};
  const source   = row.prospect_sources   ?? {};
  const scores   = row.prospect_scores    ?? {};
  const analysis = row.prospect_analysis  ?? {};
  const pipeline = row.prospect_pipeline  ?? {};
  const sectors  = (row.prospect_sectors  ?? []).map((s: { sector: string }) => s.sector);
  const themes   = (row.prospect_themes   ?? []).map((t: { theme: string }) => t.theme);
  const flags    = (row.prospect_diligence ?? [])
    .filter((d: { type: string }) => d.type === "flag")
    .map((d: { content: string }) => d.content);
  const questions = (row.prospect_diligence ?? [])
    .filter((d: { type: string }) => d.type === "question")
    .map((d: { content: string }) => d.content);

  return {
    id:                                    row.id,
    prospect_name:                         row.prospect_name,
    prospect_type:                         row.prospect_type,
    country:                               row.country,
    city:                                  row.city,
    region:                                row.region,
    website:                               source.website            ?? undefined,
    public_source_url:                     source.public_source_url  ?? undefined,
    source_quality:                        source.source_quality     ?? "Medium",
    key_public_contacts:                   source.key_public_contacts ?? undefined,
    family_or_group_background:            profile.family_or_group_background  ?? "",
    investment_philosophy:                 profile.investment_philosophy       ?? "",
    known_investment_themes:               themes,
    sector_interests:                      sectors,
    long_horizon_capital_indicators:       profile.long_horizon_capital_indicators  ?? false,
    permanent_capital_indicators:          profile.permanent_capital_indicators     ?? false,
    direct_investment_activity:            profile.direct_investment_activity       ?? false,
    infrastructure_exposure:               profile.infrastructure_exposure          ?? "None",
    energy_exposure:                       profile.energy_exposure                  ?? "None",
    logistics_transport_exposure:          profile.logistics_transport_exposure     ?? "None",
    real_estate_exposure:                  profile.real_estate_exposure             ?? "None",
    technology_digital_infrastructure_exposure: profile.technology_digital_exposure ?? "None",
    emerging_markets_exposure:             profile.emerging_markets_exposure        ?? "None",
    governance_stewardship_language:       profile.governance_stewardship_language  ?? false,
    tbp_relevance_summary:                 analysis.tbp_relevance_summary        ?? "",
    best_tbp_entry_point:                  analysis.best_tbp_entry_point         ?? "",
    suggested_conversation_angle:          analysis.suggested_conversation_angle ?? "",
    recommended_contact_route:             analysis.recommended_contact_route    ?? "",
    likely_diligence_questions:            questions,
    diligence_flags:                       flags,
    suitability_score:                     scores.suitability_score ?? 0,
    scoring_breakdown: {
      familyOfficeFit:               scores.family_office_fit                ?? 0,
      permanentCapitalOrientation:   scores.permanent_capital_orientation    ?? 0,
      sectorAlignment:               scores.sector_alignment                 ?? 0,
      governanceInstitutionalMindset: scores.governance_institutional_mindset ?? 0,
      strategicAdjacencyTBP:         scores.strategic_adjacency_tbp          ?? 0,
      engagementReadiness:           scores.engagement_readiness             ?? 0,
    },
    classification:       scores.classification        ?? "Monitor / Secondary Prospect",
    pipeline_stage:       pipeline.pipeline_stage      ?? "Identified",
    assigned_owner:       pipeline.assigned_owner      ?? "",
    next_action:          pipeline.next_action         ?? "",
    next_action_date:     pipeline.next_action_date    ?? "",
    briefing_pack_status: pipeline.briefing_pack_status ?? "Not Generated",
    created_at:           row.created_at,
    updated_at:           row.updated_at,
  };
}

const PROSPECT_SELECT = `
  *,
  prospect_profiles(*),
  prospect_sources(*),
  prospect_scores(*),
  prospect_analysis(*),
  prospect_pipeline(*),
  prospect_sectors(sector),
  prospect_themes(theme),
  prospect_diligence(type, content, sort_order)
`;

// ── PROSPECTS ─────────────────────────────────────────────────
export async function getProspects(): Promise<Prospect[]> {
  const { data, error } = await supabase
    .from("prospects")
    .select(PROSPECT_SELECT);
  if (error) throw new Error(error.message);
  return (data ?? [])
    .map(flattenProspect)
    .sort((a, b) => b.suitability_score - a.suitability_score);
}

export async function updateProspectStage(
  id: string,
  stage: string,
  nextAction: string,
  nextActionDate: string
) {
  const { error } = await supabase
    .from("prospect_pipeline")
    .update({
      pipeline_stage:    stage,
      next_action:       nextAction,
      next_action_date:  nextActionDate,
      updated_at:        new Date().toISOString(),
    })
    .eq("prospect_id", id);
  if (error) throw new Error(error.message);
}

// ── TASKS ──────────────────────────────────────────────────────
export async function getTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from("tasks")
    .select(`*, task_prospects(prospect_id)`)
    .order("due_date", { ascending: true });
  if (error) throw new Error(error.message);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((row: any) => ({
    id:              row.id,
    title:           row.title,
    description:     row.description,
    assignedTo:      row.assigned_to,
    status:          row.status,
    priority:        row.priority,
    dueDate:         row.due_date,
    linkedProspects: (row.task_prospects ?? []).map((tp: { prospect_id: string }) => tp.prospect_id),
    tags:            row.tags ?? [],
  })) as Task[];
}

export async function updateTaskStatus(id: string, status: string) {
  const { error } = await supabase
    .from("tasks")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

// ── DOCUMENTS ─────────────────────────────────────────────────
export async function getDocuments(): Promise<Document[]> {
  const { data, error } = await supabase
    .from("documents")
    .select(`*, document_prospects(prospect_id)`)
    .order("last_updated", { ascending: false });
  if (error) throw new Error(error.message);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((row: any) => ({
    id:               row.id,
    title:            row.title,
    status:           row.status,
    owner:            row.owner,
    version:          row.version,
    lastUpdated:      row.last_updated,
    approvedInternal: row.approved_internal,
    approvedExternal: row.approved_external,
    linkedProspects:  (row.document_prospects ?? []).map((dp: { prospect_id: string }) => dp.prospect_id),
    notes:            row.notes,
    category:         row.category,
  })) as Document[];
}
