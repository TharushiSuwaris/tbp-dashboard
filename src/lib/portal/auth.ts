import { supabase } from "@/lib/supabase/client";
import type { PortalSessionUser } from "./session";
import { loginWithPassword, emailRequiresPassword } from "./adminAuth";

// Legacy Circle Members (seeded before password auth existed, or before
// self-registration via migration_member_requests.sql) still log in by
// email only. Anyone with a password_hash set - all Admins, and any
// Circle Member who registered through /portal/register-member - must
// use it; blank-password login is refused for them via
// email_requires_password() rather than trusting the client not to skip it.
async function loginByEmailOnly(email: string): Promise<PortalSessionUser> {
  if (await emailRequiresPassword(email)) {
    throw new Error("This account requires a password");
  }

  const { data, error } = await supabase
    .from("portal_users")
    .select("id, name, email, role")
    .ilike("email", email.trim())
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("No account found for that email");
  return data as PortalSessionUser;
}

export async function loginPortalUser(email: string, password: string): Promise<PortalSessionUser> {
  if (password.trim()) {
    const user = await loginWithPassword(email, password);
    if (user) return user;
    throw new Error("Incorrect email or password");
  }

  return loginByEmailOnly(email);
}
