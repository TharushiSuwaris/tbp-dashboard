import { supabase } from "@/lib/supabase/client";
import type { PortalSessionUser } from "./session";

// Stub login (email only, no password) - matches the same pattern used for
// the R&D Engine's /auth/login. Looks the user up directly in portal_users
// via the existing Supabase client.
export async function loginPortalUser(email: string): Promise<PortalSessionUser> {
  const { data, error } = await supabase
    .from("portal_users")
    .select("id, name, email, role")
    .ilike("email", email.trim())
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("No account found for that email");

  return data as PortalSessionUser;
}
