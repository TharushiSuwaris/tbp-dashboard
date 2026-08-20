"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { clearPortalSession, getPortalSession, type PortalSessionUser } from "@/lib/portal/session";
import { portalTheme } from "@/lib/portal/theme";
import { PORTAL_PAGES } from "@/lib/portal/pages";
import { PortalSidebar } from "@/components/portal/PortalSidebar";
import { NotificationBell } from "@/components/portal/NotificationBell";

export default function PortalAppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<PortalSessionUser | null>(null);

  useEffect(() => {
    const session = getPortalSession();
    if (!session) {
      router.replace("/portal/login");
      return;
    }
    setUser(session);
  }, [router]);

  // Nav-hiding alone isn't real access control - anyone who knows (or is
  // still holding a stale localStorage session for) a restricted URL could
  // otherwise load it directly. "/portal" itself is the shared Overview and
  // isn't in the registry, so it's always allowed once logged in.
  useEffect(() => {
    if (!user || pathname === "/portal") return;
    const pageDef = PORTAL_PAGES.find((p) => p.path === pathname);
    if (pageDef && !pageDef.roles.includes(user.role)) {
      router.replace("/portal");
    }
  }, [user, pathname, router]);

  if (!user) return null;
  if (pathname !== "/portal") {
    const pageDef = PORTAL_PAGES.find((p) => p.path === pathname);
    if (pageDef && !pageDef.roles.includes(user.role)) return null;
  }

  function handleLogout() {
    clearPortalSession();
    router.push("/portal/login");
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: portalTheme.background, fontFamily: "sans-serif" }}>
      <PortalSidebar role={user.role} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 14,
            padding: "16px 28px",
            borderBottom: `1px solid ${portalTheme.panelBorder}`,
          }}
        >
          <NotificationBell userId={user.id} role={user.role} />
          <div style={{ textAlign: "right" }}>
            <div style={{ color: portalTheme.textPrimary, fontSize: 13, fontWeight: 700 }}>{user.name}</div>
            <div style={{ color: portalTheme.textMuted, fontSize: 11 }}>{user.role.replace(/_/g, " ")}</div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: `1px solid ${portalTheme.panelBorder}`,
              background: portalTheme.panel,
              color: portalTheme.textSecondary,
              fontSize: 12.5,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Log Out
          </button>
        </div>
        <div style={{ flex: 1, padding: 28 }}>{children}</div>
      </div>
    </div>
  );
}
