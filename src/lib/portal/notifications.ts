import { supabase } from "@/lib/supabase/client";

// Notifications are computed live from real data, not stored in their own
// table - "pending approval" counts are just the current pending count,
// and "new since I last looked" counts use a per-browser localStorage
// timestamp (not synced across devices - acceptable for this stub-auth
// stage, same tradeoff as the rest of the portal session).

const LAST_SEEN_MESSAGES_KEY = "tbp_portal_last_seen_messages";
const LAST_SEEN_OPPORTUNITIES_KEY = "tbp_portal_last_seen_opportunities";
const EPOCH = new Date(0).toISOString();

function getLastSeen(key: string, userId: string): string {
  if (typeof window === "undefined") return EPOCH;
  return localStorage.getItem(`${key}_${userId}`) ?? EPOCH;
}

export function markMessagesSeen(userId: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(`${LAST_SEEN_MESSAGES_KEY}_${userId}`, new Date().toISOString());
}

export function markOpportunitiesSeen(userId: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(`${LAST_SEEN_OPPORTUNITIES_KEY}_${userId}`, new Date().toISOString());
}

export type NotificationItem = { label: string; count: number; href: string };

export async function getStaffNotifications(userId: string, role: string): Promise<NotificationItem[]> {
  const items: NotificationItem[] = [];

  if (role === "super_admin") {
    const { count } = await supabase
      .from("admin_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending");
    if (count && count > 0) items.push({ label: "Pending Admin Requests", count, href: "/portal/admin-requests" });

    const { count: memberReqCount } = await supabase
      .from("member_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending");
    if (memberReqCount && memberReqCount > 0) {
      items.push({ label: "Pending Circle Member Requests", count: memberReqCount, href: "/portal/member-requests" });
    }

    const { count: invitationReqCount } = await supabase
      .from("invitation_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending");
    if (invitationReqCount && invitationReqCount > 0) {
      items.push({ label: "Pending Invitation Requests", count: invitationReqCount, href: "/portal/invitations?tab=requests" });
    }
  }

  const { count: profileCount } = await supabase
    .from("member_profiles")
    .select("portal_user_id", { count: "exact", head: true })
    .eq("status", "submitted");
  if (profileCount && profileCount > 0) {
    items.push({ label: "Pending Profile Reviews", count: profileCount, href: "/portal/profiles/review" });
  }

  const { count: appCount } = await supabase
    .from("opportunity_applications")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");
  if (appCount && appCount > 0) {
    items.push({ label: "Pending Application Reviews", count: appCount, href: "/portal/applications" });
  }

  const lastSeen = getLastSeen(LAST_SEEN_MESSAGES_KEY, userId);
  let messageQuery = supabase
    .from("portal_messages")
    .select("id", { count: "exact", head: true })
    .neq("sender_id", userId)
    .gt("created_at", lastSeen);

  // Correspondence notifications are private to whoever is actually
  // assigned as a member's advisor - super_admin does NOT get a blanket
  // override here (matches messages/page.tsx), unlike the admin/member
  // request counts above which are intentionally global for super_admin.
  {
    const { data: assigned } = await supabase
      .from("portal_users")
      .select("id")
      .eq("role", "circle_member")
      .eq("assigned_admin_id", userId);
    const memberIds = (assigned ?? []).map((r) => r.id);
    if (memberIds.length === 0) {
      return items;
    }
    messageQuery = messageQuery.in("member_id", memberIds);
  }

  const { count: msgCount } = await messageQuery;
  if (msgCount && msgCount > 0) items.push({ label: "New Correspondence", count: msgCount, href: "/portal/messages" });

  return items;
}

export async function getMemberNotifications(userId: string): Promise<NotificationItem[]> {
  const items: NotificationItem[] = [];

  const lastSeenMsg = getLastSeen(LAST_SEEN_MESSAGES_KEY, userId);
  const { count: msgCount } = await supabase
    .from("portal_messages")
    .select("id", { count: "exact", head: true })
    .eq("member_id", userId)
    .neq("sender_id", userId)
    .gt("created_at", lastSeenMsg);
  if (msgCount && msgCount > 0) items.push({ label: "New Correspondence", count: msgCount, href: "/portal/messages" });

  const lastSeenOpp = getLastSeen(LAST_SEEN_OPPORTUNITIES_KEY, userId);
  const { count: oppCount } = await supabase
    .from("investment_opportunities")
    .select("id", { count: "exact", head: true })
    .eq("status", "published")
    .gt("created_at", lastSeenOpp);
  if (oppCount && oppCount > 0) {
    items.push({ label: "New Project Opportunities", count: oppCount, href: "/portal/opportunities" });
  }

  return items;
}
