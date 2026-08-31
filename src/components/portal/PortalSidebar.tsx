"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { portalTheme } from "@/lib/portal/theme";
import { portalPagesForRole } from "@/lib/portal/pages";
import { isStaffRole } from "@/lib/portal/session";

export function PortalSidebar({ role }: { role: string }) {
  const pathname = usePathname();
  const navItems = [
    { path: "/portal", label: "Overview", section: undefined as string | undefined },
    ...portalPagesForRole(role),
  ];

  function isActive(path: string) {
    if (path === "/portal") return pathname === "/portal";
    return pathname === path || pathname.startsWith(path + "/");
  }

  return (
    <aside
      style={{
        width: 220,
        flexShrink: 0,
        background: portalTheme.sidebarBackground,
        borderRight: `1px solid ${portalTheme.panelBorder}`,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Link
        href="/portal"
        style={{ display: "flex", alignItems: "center", gap: 10, padding: "20px 18px", textDecoration: "none" }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 7,
            background: portalTheme.gold,
            color: portalTheme.goldText,
            fontWeight: 800,
            fontSize: 11,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          TBP
        </div>
        <span style={{ color: portalTheme.textPrimary, fontWeight: 700, fontSize: 13.5 }}>Circle Portal</span>
      </Link>

      <nav style={{ flex: 1, padding: "6px 10px" }}>
        {(() => {
          let previousSection: string | undefined;
          return navItems.map((item) => {
            const active = isActive(item.path);
            const showHeading = Boolean(item.section) && item.section !== previousSection;
            previousSection = item.section;
            return (
              <div key={item.path}>
                {showHeading && (
                  <div
                    style={{
                      fontSize: 10.5,
                      fontWeight: 700,
                      color: portalTheme.gold,
                      textTransform: "uppercase",
                      letterSpacing: ".6px",
                      padding: "16px 12px 6px",
                    }}
                  >
                    {item.section}
                  </div>
                )}
                <Link
                  href={item.path}
                  style={{
                    display: "block",
                    padding: "9px 12px",
                    marginBottom: 2,
                    borderRadius: 8,
                    textDecoration: "none",
                    fontSize: 13,
                    fontWeight: active ? 700 : 500,
                    color: active ? portalTheme.textPrimary : portalTheme.textSecondary,
                    background: active ? "rgba(58,159,192,0.14)" : "transparent",
                    borderLeft: active ? `3px solid ${portalTheme.gold}` : "3px solid transparent",
                  }}
                >
                  {item.label}
                </Link>
              </div>
            );
          });
        })()}
      </nav>

      {isStaffRole(role) && (
        <div style={{ padding: "10px 10px 18px" }}>
          <Link
            href="/dashboard"
            style={{
              display: "block",
              padding: "9px 12px",
              borderRadius: 8,
              fontSize: 12.5,
              color: portalTheme.textMuted,
              textDecoration: "none",
              border: `1px solid ${portalTheme.panelBorder}`,
            }}
          >
            &larr; Internal Dashboard
          </Link>
        </div>
      )}
    </aside>
  );
}
