import { supabase } from "@/lib/supabase/client";

// ── Types ──────────────────────────────────────────────────────
export type OpportunityStatus = "draft" | "published" | "closed";
export type ApplicationStatus = "pending" | "approved" | "rejected";
export type ProfileStatus = "draft" | "submitted" | "approved" | "rejected";

// Fixed taxonomies from the "Tharushi TBP Capital Circle Task" doc's
// proposed filtering architecture — kept as const arrays (not DB enums)
// so Opportunity Management can offer them as checkboxes without a migration
// every time the list changes.
export const OPPORTUNITY_SECTORS = [
  "Global Trade",
  "Infrastructure",
  "Energy",
  "Maritime",
  "Technology & AI",
  "Logistics",
  "Cities & Built Environment",
  "Sustainability",
] as const;

export const CAPITAL_CIRCLES = [
  "Family Office & Private Capital",
  "Institutional Investors",
  "Angel Investors",
] as const;

export const PARTICIPATION_TYPES = [
  "Investment",
  "Co-Investment",
  "Project Partnership",
  "Technology / Innovation",
  "Development",
  "Operating Partnership",
  "Strategic Partnership",
] as const;

export type Opportunity = {
  id: string;
  title: string;
  category: string;
  region: string | null;
  sector: string[] | null;
  eligible_circles: string[] | null;
  participation_types: string[] | null;
  description: string;
  status: OpportunityStatus;
  created_at: string;
};

export type UpcomingEvent = {
  id: string;
  title: string;
  description: string;
  region: string | null;
  image_path: string | null;
  event_date: string | null;
  venue: string | null;
  status: "draft" | "published";
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
  applicant_assigned_admin_id: string | null;
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
  subject: string | null;
  content: string;
  created_at: string;
};

export type CircleMember = { id: string; name: string; email: string; assigned_admin_id: string | null };

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
  region?: string;
  sector?: string[];
  eligible_circles?: string[];
  participation_types?: string[];
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

export async function applyToOpportunity(
  opportunityId: string,
  opportunityTitle: string,
  applicantId: string,
  message: string
): Promise<void> {
  const { error } = await supabase
    .from("opportunity_applications")
    .insert({ opportunity_id: opportunityId, applicant_id: applicantId, message });
  if (error) throw new Error(error.message);

  // Every enquiry also lands in the member's correspondence thread, so
  // their assigned advisor (see portal_users.assigned_admin_id) sees it
  // as an incoming item rather than only in the Application Review list.
  const { error: msgError } = await supabase.from("portal_messages").insert({
    member_id: applicantId,
    sender_id: applicantId,
    subject: `Enquiry: ${opportunityTitle}`,
    content: message.trim() || `I would like to express interest in ${opportunityTitle}.`,
  });
  if (msgError) throw new Error(msgError.message);
}

export async function listApplicationsWithDetails(): Promise<ApplicationWithDetails[]> {
  const { data, error } = await supabase
    .from("opportunity_applications")
    .select("*, investment_opportunities(title), portal_users(name, email, assigned_admin_id)")
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
    applicant_assigned_admin_id: row.portal_users?.assigned_admin_id ?? null,
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
  const { data, error } = await supabase
    .from("portal_users")
    .select("id, name, email, assigned_admin_id")
    .eq("role", "circle_member");
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

export async function sendMessage(memberId: string, senderId: string, content: string, subject?: string): Promise<void> {
  const { error } = await supabase
    .from("portal_messages")
    .insert({ member_id: memberId, sender_id: senderId, content, subject: subject?.trim() || null });
  if (error) throw new Error(error.message);
}

// ── Upcoming Events ────────────────────────────────────────────
export async function listPublishedEvents(): Promise<UpcomingEvent[]> {
  const { data, error } = await supabase
    .from("upcoming_events")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}
