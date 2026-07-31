import { supabase } from "@/lib/supabase/client";

// ── Types ──────────────────────────────────────────────────────
export type OpportunityStatus = "draft" | "published" | "closed";
export type ApplicationStatus = "pending" | "approved" | "rejected";
export type ProfileStatus = "draft" | "submitted" | "approved" | "rejected";

export type Opportunity = {
  id: string;
  title: string;
  category: string;
  description: string;
  status: OpportunityStatus;
  created_at: string;
};

export type Application = {
  id: string;
  opportunity_id: string;
  applicant_id: string;
  message: string | null;
  status: ApplicationStatus;
  created_at: string;
};

export type ApplicationWithDetails = Application & {
  opportunity_title: string;
  applicant_name: string;
  applicant_email: string;
};

export type MemberProfile = {
  portal_user_id: string;
  family_or_group_background: string | null;
  geography: string | null;
  sector_preferences: string | null;
  capital_appetite: string | null;
  investment_horizon: string | null;
  risk_preference: string | null;
  esg_alignment: string | null;
  legacy_objectives: string | null;
  status: ProfileStatus;
  submitted_at: string | null;
  reviewed_at: string | null;
};

export type PortalMessage = {
  id: string;
  member_id: string;
  sender_id: string;
  content: string;
  created_at: string;
};

export type CircleMember = { id: string; name: string; email: string };

// ── Opportunities ──────────────────────────────────────────────
export async function listPublishedOpportunities(): Promise<Opportunity[]> {
  const { data, error } = await supabase
    .from("investment_opportunities")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listAllOpportunities(): Promise<Opportunity[]> {
  const { data, error } = await supabase
    .from("investment_opportunities")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createOpportunity(input: {
  title: string;
  category: string;
  description: string;
  status: OpportunityStatus;
  created_by: string;
}): Promise<void> {
  const { error } = await supabase.from("investment_opportunities").insert(input);
  if (error) throw new Error(error.message);
}

export async function updateOpportunityStatus(id: string, status: OpportunityStatus): Promise<void> {
  const { error } = await supabase
    .from("investment_opportunities")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

// ── Applications ───────────────────────────────────────────────
export async function getMyApplications(applicantId: string): Promise<Application[]> {
  const { data, error } = await supabase
    .from("opportunity_applications")
    .select("*")
    .eq("applicant_id", applicantId);
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function applyToOpportunity(opportunityId: string, applicantId: string, message: string): Promise<void> {
  const { error } = await supabase
    .from("opportunity_applications")
    .insert({ opportunity_id: opportunityId, applicant_id: applicantId, message });
  if (error) throw new Error(error.message);
}

export async function listApplicationsWithDetails(): Promise<ApplicationWithDetails[]> {
  const { data, error } = await supabase
    .from("opportunity_applications")
    .select("*, investment_opportunities(title), portal_users(name, email)")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((row: any) => ({
    id: row.id,
    opportunity_id: row.opportunity_id,
    applicant_id: row.applicant_id,
    message: row.message,
    status: row.status,
    created_at: row.created_at,
    opportunity_title: row.investment_opportunities?.title ?? "—",
    applicant_name: row.portal_users?.name ?? "—",
    applicant_email: row.portal_users?.email ?? "—",
  }));
}

export async function reviewApplication(id: string, status: ApplicationStatus): Promise<void> {
  const { error } = await supabase
    .from("opportunity_applications")
    .update({ status, reviewed_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

// ── Profiles ───────────────────────────────────────────────────
export async function getMyProfile(portalUserId: string): Promise<MemberProfile | null> {
  const { data, error } = await supabase
    .from("member_profiles")
    .select("*")
    .eq("portal_user_id", portalUserId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function saveMyProfile(
  portalUserId: string,
  fields: Partial<MemberProfile>,
  submit: boolean
): Promise<void> {
  const payload = {
    portal_user_id: portalUserId,
    ...fields,
    status: submit ? "submitted" : "draft",
    submitted_at: submit ? new Date().toISOString() : null,
  };
  const { error } = await supabase.from("member_profiles").upsert(payload, { onConflict: "portal_user_id" });
  if (error) throw new Error(error.message);
}

export async function listProfilesForReview(): Promise<(MemberProfile & { name: string; email: string })[]> {
  const { data, error } = await supabase
    .from("member_profiles")
    .select("*, portal_users(name, email)")
    .order("submitted_at", { ascending: false });
  if (error) throw new Error(error.message);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((row: any) => ({
    ...row,
    name: row.portal_users?.name ?? "—",
    email: row.portal_users?.email ?? "—",
  }));
}

export async function reviewProfile(portalUserId: string, status: "approved" | "rejected"): Promise<void> {
  const { error } = await supabase
    .from("member_profiles")
    .update({ status, reviewed_at: new Date().toISOString() })
    .eq("portal_user_id", portalUserId);
  if (error) throw new Error(error.message);
}

// ── Messages ───────────────────────────────────────────────────
export async function listCircleMembers(): Promise<CircleMember[]> {
  const { data, error } = await supabase.from("portal_users").select("id, name, email").eq("role", "circle_member");
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getMessages(memberId: string): Promise<PortalMessage[]> {
  const { data, error } = await supabase
    .from("portal_messages")
    .select("*")
    .eq("member_id", memberId)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function sendMessage(memberId: string, senderId: string, content: string): Promise<void> {
  const { error } = await supabase.from("portal_messages").insert({ member_id: memberId, sender_id: senderId, content });
  if (error) throw new Error(error.message);
}
