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

export const MEMBER_TIERS = [
  "Circle Member",
  "Full Member",
  "Founding Stewardship Candidate",
  "Project-Level Candidate",
  "Strategic Partner Candidate",
] as const;

// The full enquiry-type set from the "TBP Investor Circle Member's Portal"
// brief's Briefings & Enquiries section. Only "Private briefing request"
// and "Roundtable participation request" are ever set automatically today
// (Request Briefing / Request Roundtable / Request Invitation buttons) -
// the rest are only reachable through the free-form submission form on
// the Briefings & Enquiries page itself.
export const ENQUIRY_TYPES = [
  "Project information request",
  "Private briefing request",
  "Roundtable participation request",
  "Strategic partnership enquiry",
  "Capital participation enquiry",
  "Regional opportunity enquiry",
  "Protocol Establishment Round briefing",
  "ASMOFP™ / offshore infrastructure briefing",
  "Corridor Trust Bank™ / trust finance briefing",
  "Other confidential enquiry",
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

export type EventInvitationStatus = "pending" | "approved" | "rejected";

export type EventInvitationRequest = {
  id: string;
  event_id: string;
  member_id: string;
  message: string | null;
  status: EventInvitationStatus;
  created_at: string;
  reviewed_at: string | null;
};

export type EventInvitationWithDetails = EventInvitationRequest & {
  event_title: string;
  member_name: string;
  member_email: string;
  member_assigned_admin_id: string | null;
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
  capital_circle: string | null;
  member_tier: string | null;
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
  enquiry_type: string | null;
  related_opportunity_id: string | null;
  related_event_id: string | null;
  created_at: string;
};

export type CircleMember = { id: string; name: string; email: string; assigned_admin_id: string | null };

export type SavedOpportunity = { id: string; member_id: string; opportunity_id: string; created_at: string };

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

// Structured requests (Request Briefing, Request Roundtable Invitation) -
// same as applyToOpportunity's auto-created message, just user-initiated
// with an enquiry_type tag rather than a by-product of an application.
export async function submitEnquiry(input: {
  memberId: string;
  enquiryType: string;
  subject: string;
  message: string;
  relatedOpportunityId?: string;
  relatedEventId?: string;
}): Promise<void> {
  const { error } = await supabase.from("portal_messages").insert({
    member_id: input.memberId,
    sender_id: input.memberId,
    subject: input.subject,
    content: input.message,
    enquiry_type: input.enquiryType,
    related_opportunity_id: input.relatedOpportunityId ?? null,
    related_event_id: input.relatedEventId ?? null,
  });
  if (error) throw new Error(error.message);
}

// Posted automatically whenever an admin/super_admin approves, rejects or
// grants something (application, event invitation, profile, membership
// tier) - shows up in the member's Correspondence as coming from whichever
// staff member actually reviewed it, so approvals/declines don't only
// exist as a status pill the member has to go looking for.
async function postSystemNotification(memberId: string, reviewerId: string, subject: string, content: string): Promise<void> {
  const { error } = await supabase.from("portal_messages").insert({
    member_id: memberId,
    sender_id: reviewerId,
    subject,
    content,
  });
  if (error) throw new Error(error.message);
}

// Save Interest - a private bookmark, no correspondence side-effect.
export async function listSavedOpportunities(memberId: string): Promise<SavedOpportunity[]> {
  const { data, error } = await supabase.from("saved_opportunities").select("*").eq("member_id", memberId);
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function saveOpportunityInterest(memberId: string, opportunityId: string): Promise<void> {
  const { error } = await supabase.from("saved_opportunities").insert({ member_id: memberId, opportunity_id: opportunityId });
  if (error) throw new Error(error.message);
}

export async function unsaveOpportunityInterest(memberId: string, opportunityId: string): Promise<void> {
  const { error } = await supabase
    .from("saved_opportunities")
    .delete()
    .eq("member_id", memberId)
    .eq("opportunity_id", opportunityId);
  if (error) throw new Error(error.message);
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

export async function reviewApplication(
  id: string,
  status: ApplicationStatus,
  reviewerId: string,
  applicantId: string,
  opportunityTitle: string
): Promise<void> {
  const { error } = await supabase
    .from("opportunity_applications")
    .update({ status, reviewed_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);

  await postSystemNotification(
    applicantId,
    reviewerId,
    `Application Update: ${opportunityTitle}`,
    status === "approved"
      ? `Your application for "${opportunityTitle}" has been approved. TBP Capital Advisory will be in touch with next steps.`
      : `Your application for "${opportunityTitle}" was not taken forward at this time.`
  );
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

export async function reviewProfile(portalUserId: string, status: "approved" | "rejected", reviewerId: string): Promise<void> {
  const { error } = await supabase
    .from("member_profiles")
    .update({ status, reviewed_at: new Date().toISOString() })
    .eq("portal_user_id", portalUserId);
  if (error) throw new Error(error.message);

  await postSystemNotification(
    portalUserId,
    reviewerId,
    "Membership Status Update",
    status === "approved"
      ? "Your Circle membership profile has been approved. Welcome to the TBP Capital Circle."
      : "Your Circle membership profile was not approved at this time. Please contact TBP Capital Advisory for more information."
  );
}

export async function updateMemberTier(portalUserId: string, memberTier: string, reviewerId: string): Promise<void> {
  const { error } = await supabase
    .from("member_profiles")
    .update({ member_tier: memberTier })
    .eq("portal_user_id", portalUserId);
  if (error) throw new Error(error.message);

  await postSystemNotification(
    portalUserId,
    reviewerId,
    "Membership Access Update",
    `Your membership access has been updated to ${memberTier}.`
  );
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

// The Briefings & Enquiries page's list of a member's own structured
// requests - a filtered view over the same portal_messages table
// Correspondence reads, not a separate inbox.
export async function listMyEnquiries(memberId: string): Promise<PortalMessage[]> {
  const { data, error } = await supabase
    .from("portal_messages")
    .select("*")
    .eq("member_id", memberId)
    .not("enquiry_type", "is", null)
    .order("created_at", { ascending: false });
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

// ── Event Invitation Requests ─────────────────────────────────
// Mirrors opportunity_applications' shape/pattern: a member requests an
// invitation, an admin/super_admin approves or rejects it (Application
// Review), and only approved ones surface on My Invitations.
export async function getMyEventInvitationRequests(memberId: string): Promise<EventInvitationRequest[]> {
  const { data, error } = await supabase
    .from("event_invitation_requests")
    .select("*")
    .eq("member_id", memberId);
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function requestEventInvitation(
  eventId: string,
  eventTitle: string,
  memberId: string,
  message: string
): Promise<void> {
  const { error } = await supabase
    .from("event_invitation_requests")
    .insert({ event_id: eventId, member_id: memberId, message });
  if (error) throw new Error(error.message);

  // Same dual-write as applyToOpportunity - the request also lands in the
  // member's Correspondence thread immediately, tagged so it also shows on
  // Briefings & Enquiries, rather than only surfacing once reviewed.
  await submitEnquiry({
    memberId,
    enquiryType: "Roundtable participation request",
    subject: `Invitation Request: ${eventTitle}`,
    message: message.trim() || `I would like to request an invitation to ${eventTitle}.`,
    relatedEventId: eventId,
  });
}

export async function listEventInvitationRequestsWithDetails(): Promise<EventInvitationWithDetails[]> {
  const { data, error } = await supabase
    .from("event_invitation_requests")
    .select("*, upcoming_events(title), portal_users(name, email, assigned_admin_id)")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((row: any) => ({
    id: row.id,
    event_id: row.event_id,
    member_id: row.member_id,
    message: row.message,
    status: row.status,
    created_at: row.created_at,
    reviewed_at: row.reviewed_at,
    event_title: row.upcoming_events?.title ?? "—",
    member_name: row.portal_users?.name ?? "—",
    member_email: row.portal_users?.email ?? "—",
    member_assigned_admin_id: row.portal_users?.assigned_admin_id ?? null,
  }));
}

export async function reviewEventInvitationRequest(
  id: string,
  status: "approved" | "rejected",
  reviewerId: string,
  memberId: string,
  eventTitle: string
): Promise<void> {
  const { error } = await supabase
    .from("event_invitation_requests")
    .update({ status, reviewed_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);

  await postSystemNotification(
    memberId,
    reviewerId,
    `Invitation Update: ${eventTitle}`,
    status === "approved"
      ? `You have been granted an invitation to "${eventTitle}". You can view it in My Invitations.`
      : `Your invitation request for "${eventTitle}" was declined at this time.`
  );
}
