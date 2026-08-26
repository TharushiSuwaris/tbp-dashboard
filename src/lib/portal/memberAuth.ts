import { supabase } from "@/lib/supabase/client";
import { friendlyDbError } from "./errors";

export type MemberRequestInput = {
  name: string;
  email: string;
  password: string;
  phone?: string;
  organisation?: string;
  roleTitle?: string;
  city?: string;
  country?: string;
  linkedinOrWebsite?: string;
  capitalCircle: string;
  sectorInterests: string[];
  invitationCode: string;
  familyOrGroupBackground?: string;
  geographyFocus: string[];
  capitalParticipationInterests: string[];
  investmentHorizon?: string;
  riskPreference?: string;
  esgAlignmentInterests: string[];
  strategicImpactObjectives: string[];
  additionalNotes?: string;
  additionalCircleRelevance?: string[];
};

export async function requestMemberSignup(input: MemberRequestInput): Promise<void> {
  const { error } = await supabase.rpc("request_member_signup", {
    p_name: input.name,
    p_email: input.email,
    p_password: input.password,
    p_phone: input.phone || null,
    p_organisation: input.organisation || null,
    p_role_title: input.roleTitle || null,
    p_city: input.city || null,
    p_country: input.country || null,
    p_linkedin_or_website: input.linkedinOrWebsite || null,
    p_capital_circle: input.capitalCircle,
    p_sector_interests: input.sectorInterests,
    p_invitation_code: input.invitationCode,
    p_family_or_group_background: input.familyOrGroupBackground || null,
    p_geography_focus: input.geographyFocus,
    p_capital_participation_interests: input.capitalParticipationInterests,
    p_investment_horizon: input.investmentHorizon || null,
    p_risk_preference: input.riskPreference || null,
    p_esg_alignment_interests: input.esgAlignmentInterests,
    p_strategic_impact_objectives: input.strategicImpactObjectives,
    p_additional_notes: input.additionalNotes || null,
    p_additional_circle_relevance: input.additionalCircleRelevance || [],
  });
  if (error) throw new Error(friendlyDbError(error));
}

export type MemberRequest = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  organisation: string | null;
  role_title: string | null;
  city: string | null;
  country: string | null;
  linkedin_or_website: string | null;
  capital_circle: string;
  sector_interests: string[];
  invitation_code: string | null;
  invited_by: string | null;
  invited_at: string | null;
  family_or_group_background: string | null;
  geography_focus: string[];
  capital_participation_interests: string[];
  investment_horizon: string | null;
  risk_preference: string | null;
  esg_alignment_interests: string[];
  strategic_impact_objectives: string[];
  additional_notes: string | null;
  additional_circle_relevance: string[];
  status: "pending" | "approved" | "rejected";
  requested_at: string;
  created_user_id: string | null;
};

// Explicitly excludes password_hash - non-secret columns only.
export async function listMemberRequests(): Promise<MemberRequest[]> {
  const { data, error } = await supabase
    .from("member_requests")
    .select(
      "id, name, email, phone, organisation, role_title, city, country, linkedin_or_website, capital_circle, sector_interests, invitation_code, invited_by, invited_at, family_or_group_background, geography_focus, capital_participation_interests, investment_horizon, risk_preference, esg_alignment_interests, strategic_impact_objectives, additional_notes, additional_circle_relevance, status, requested_at, created_user_id"
    )
    .order("requested_at", { ascending: false });
  if (error) throw new Error(friendlyDbError(error));
  return data ?? [];
}

export async function approveMemberRequest(
  requestId: string,
  reviewerId: string,
  assignedAdminId: string,
  capitalCircle: string
): Promise<void> {
  const { error } = await supabase.rpc("approve_member_request", {
    p_request_id: requestId,
    p_reviewer_id: reviewerId,
    p_assigned_admin_id: assignedAdminId,
    p_capital_circle: capitalCircle,
  });
  if (error) throw new Error(friendlyDbError(error));
}

export async function rejectMemberRequest(requestId: string, reviewerId: string): Promise<void> {
  const { error } = await supabase.rpc("reject_member_request", {
    p_request_id: requestId,
    p_reviewer_id: reviewerId,
  });
  if (error) throw new Error(friendlyDbError(error));
}
