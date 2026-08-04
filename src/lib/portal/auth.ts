import { supabase } from "@/lib/supabase/client";
import { isStaffRole, type PortalSessionUser } from "./session";
import { loginWithPassword } from "./adminAuth";

// Circle Members: email-only stub login (unchanged). Admins: real password
// login (see migration_admin_requests.sql) - an admin-role account must
// never be reachable through the password-less path below, even if the
// caller leaves the password blank.
async function loginByEmailOnly(email: string): Promise<PortalSessionUser> {
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

  const user = await loginByEmailOnly(email);
  if (isStaffRole(user.role)) {
    throw new Error("Admin accounts require a password");
  }
  return user;
}
