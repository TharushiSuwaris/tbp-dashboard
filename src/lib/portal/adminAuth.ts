import { supabase } from "@/lib/supabase/client";
import type { PortalSessionUser } from "./session";
import { friendlyDbError } from "./errors";

export type AdminRequest = {
  id: string;
  name: string;
  email: string;
  status: "pending" | "approved" | "rejected";
  requested_at: string;
};

export async function requestAdminSignup(name: string, email: string, password: string): Promise<void> {
  const { error } = await supabase.rpc("request_admin_signup", {
    p_name: name,
    p_email: email,
    p_password: password,
  });
  if (error) throw new Error(friendlyDbError(error));
}

// Explicitly select only non-secret columns - password_hash is never fetched here.
export async function listAdminRequests(): Promise<AdminRequest[]> {
  const { data, error } = await supabase
    .from("admin_requests")
    .select("id, name, email, status, requested_at")
    .order("requested_at", { ascending: false });
  if (error) throw new Error(friendlyDbError(error));
  return data ?? [];
}

export async function approveAdminRequest(requestId: string, reviewerId: string): Promise<void> {
  const { error } = await supabase.rpc("approve_admin_request", {
    p_request_id: requestId,
    p_reviewer_id: reviewerId,
  });
  if (error) throw new Error(friendlyDbError(error));
}

export async function rejectAdminRequest(requestId: string, reviewerId: string): Promise<void> {
  const { error } = await supabase.rpc("reject_admin_request", {
    p_request_id: requestId,
    p_reviewer_id: reviewerId,
  });
  if (error) throw new Error(friendlyDbError(error));
}

export async function loginWithPassword(email: string, password: string): Promise<PortalSessionUser | null> {
  const { data, error } = await supabase.rpc("login_with_password", { p_email: email, p_password: password });
  if (error) throw new Error(friendlyDbError(error));
  const row = Array.isArray(data) ? data[0] : data;
  return row ?? null;
}

// Checks whether an account has a password set, without ever returning
// the hash itself to the client. See migration_member_requests.sql.
export async function emailRequiresPassword(email: string): Promise<boolean> {
  const { data, error } = await supabase.rpc("email_requires_password", { p_email: email });
  if (error) throw new Error(friendlyDbError(error));
  return !!data;
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
  const { error } = await supabase.rpc("change_password", {
    p_user_id: userId,
    p_current_password: currentPassword,
    p_new_password: newPassword,
  });
  if (error) throw new Error(friendlyDbError(error));
}

export type ManagedUser = {
  id: string;
  name: string;
  email: string;
  role: PortalSessionUser["role"];
  created_at: string;
  assigned_admin_id: string | null;
};

// Explicitly select only non-secret columns - password_hash is never fetched here.
export async function listAllPortalUsers(): Promise<ManagedUser[]> {
  const { data, error } = await supabase
    .from("portal_users")
    .select("id, name, email, role, created_at, assigned_admin_id")
    .order("created_at", { ascending: false });
  if (error) throw new Error(friendlyDbError(error));
  return data ?? [];
}

// Assigns (or clears, with adminId = null) the Admin who handles a given
// Circle Member's enquiries and correspondence. Non-secret field, so a
// plain update is fine under the existing MVP-open RLS policy - no RPC
// needed (unlike password/role changes elsewhere in this file).
export async function assignAdvisor(memberId: string, adminId: string | null): Promise<void> {
  const { error } = await supabase.from("portal_users").update({ assigned_admin_id: adminId }).eq("id", memberId);
  if (error) throw new Error(friendlyDbError(error));
}

export async function deletePortalUser(targetId: string, actorId: string): Promise<void> {
  const { error } = await supabase.rpc("delete_portal_user", { p_target_id: targetId, p_actor_id: actorId });
  if (error) throw new Error(friendlyDbError(error));
}
