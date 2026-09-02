import { supabase } from "@/lib/supabase/client";
import { friendlyDbError } from "./errors";

export type InvitationRequestStatus = "pending" | "approved" | "rejected";

export type InvitationRequest = {
  id: string;
  name: string;
  organisation: string;
  email: string;
  country: string;
  family_group_category: string;
  primary_interest: string;
  message: string | null;
  status: InvitationRequestStatus;
  requested_at: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  invitation_code: string | null;
  invitation_expires_at: string | null;
  capital_circle: string | null;
};

export type RequestInvitationInput = {
  name: string;
  organisation: string;
  email: string;
  country: string;
  familyGroupCategory: string;
  primaryInterest: string;
  message?: string;
};

export async function requestInvitation(input: RequestInvitationInput): Promise<void> {
  const { error } = await supabase.rpc("request_invitation", {
    p_name: input.name,
    p_organisation: input.organisation,
    p_email: input.email,
    p_country: input.country,
    p_family_group_category: input.familyGroupCategory,
    p_primary_interest: input.primaryInterest,
    p_message: input.message || null,
  });
  if (error) throw new Error(friendlyDbError(error));
}

export async function listInvitationRequests(): Promise<InvitationRequest[]> {
  const { data, error } = await supabase
    .from("invitation_requests")
    .select(
      "id, name, organisation, email, country, family_group_category, primary_interest, message, status, requested_at, reviewed_by, reviewed_at, invitation_code, invitation_expires_at, capital_circle"
    )
    .order("requested_at", { ascending: false });
  if (error) throw new Error(friendlyDbError(error));
  return data ?? [];
}

export type ApprovedInvitationRequest = { id: string; code: string; expires_at: string };

export async function approveInvitationRequest(
  requestId: string,
  reviewerId: string,
  capitalCircle: string
): Promise<ApprovedInvitationRequest> {
  const { data, error } = await supabase.rpc("approve_invitation_request", {
    p_request_id: requestId,
    p_reviewer_id: reviewerId,
    p_capital_circle: capitalCircle,
  });
  if (error) throw new Error(friendlyDbError(error));
  const row = Array.isArray(data) ? data[0] : data;
  return row;
}

export async function rejectInvitationRequest(requestId: string, reviewerId: string): Promise<void> {
  const { error } = await supabase.rpc("reject_invitation_request", {
    p_request_id: requestId,
    p_reviewer_id: reviewerId,
  });
  if (error) throw new Error(friendlyDbError(error));
}
