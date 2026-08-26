import { supabase } from "@/lib/supabase/client";
import { friendlyDbError } from "./errors";

export type Invitation = {
  id: string;
  invitee_name: string;
  invitee_email: string;
  organisation: string | null;
  capital_circle: string;
  code: string;
  invited_by: string;
  invited_at: string;
  expires_at: string;
};

export type CreateInvitationInput = {
  invitee_name: string;
  invitee_email: string;
  organisation?: string;
  capital_circle: string;
};

export type CreatedInvitation = {
  id: string;
  code: string;
  expires_at: string;
};

export async function createInvitation(actorId: string, input: CreateInvitationInput): Promise<CreatedInvitation> {
  const { data, error } = await supabase.rpc("create_invitation", {
    p_actor_id: actorId,
    p_invitee_name: input.invitee_name,
    p_invitee_email: input.invitee_email,
    p_organisation: input.organisation || null,
    p_capital_circle: input.capital_circle,
  });
  if (error) throw new Error(friendlyDbError(error));
  const row = Array.isArray(data) ? data[0] : data;
  return row;
}

// Explicitly excludes nothing sensitive here — the code itself is the
// thing a super_admin needs to see/copy into the invitation email.
export async function listInvitations(): Promise<Invitation[]> {
  const { data, error } = await supabase
    .from("invitations")
    .select("id, invitee_name, invitee_email, organisation, capital_circle, code, invited_by, invited_at, expires_at")
    .order("invited_at", { ascending: false });
  if (error) throw new Error(friendlyDbError(error));
  return data ?? [];
}

export async function revokeInvitation(invitationId: string, actorId: string): Promise<void> {
  const { error } = await supabase.rpc("revoke_invitation", {
    p_invitation_id: invitationId,
    p_actor_id: actorId,
  });
  if (error) throw new Error(friendlyDbError(error));
}

export async function deleteExpiredInvitations(): Promise<void> {
  const { error } = await supabase.rpc("delete_expired_invitations");
  if (error) throw new Error(friendlyDbError(error));
}

export type InvitationPreview = {
  invitee_name: string;
  organisation: string | null;
  capital_circle: string;
  expires_at: string;
};

export async function previewInvitation(code: string): Promise<InvitationPreview> {
  const { data, error } = await supabase.rpc("preview_invitation", { p_code: code });
  if (error) throw new Error(friendlyDbError(error));
  const row = Array.isArray(data) ? data[0] : data;
  return row;
}

export async function checkInvitationEmail(code: string, email: string): Promise<boolean> {
  const { data, error } = await supabase.rpc("check_invitation_email", { p_code: code, p_email: email });
  if (error) throw new Error(friendlyDbError(error));
  return !!data;
}
