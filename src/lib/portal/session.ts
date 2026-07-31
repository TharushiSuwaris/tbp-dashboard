// Stub session for the new portal login (Admin vs Circle Member). Additive
// only - this has no effect on the existing /dashboard/* app, which still
// has no login wall. Storage-only, swap for a real session once this rolls
// out beyond the additive phase.

export type PortalRole = "admin" | "circle_member";

export type PortalSessionUser = {
  id: string;
  name: string;
  email: string;
  role: PortalRole;
};

const STORAGE_KEY = "tbp_portal_session";

export function savePortalSession(user: PortalSessionUser) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function getPortalSession(): PortalSessionUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PortalSessionUser;
  } catch {
    return null;
  }
}

export function clearPortalSession() {
  localStorage.removeItem(STORAGE_KEY);
}
