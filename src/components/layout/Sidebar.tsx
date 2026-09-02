"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getPortalSession, isStaffRole } from "@/lib/portal/session";
import { portalPagesForRole } from "@/lib/portal/pages";

type NavItem = { href: string; icon: string; label: string; warn?: boolean };

const baseNavItems: NavItem[] = [
  { href: "/dashboard", icon: "⊞", label: "Executive Overview" },
  { href: "/dashboard/prospects", icon: "📋", label: "Prospect Longlist" },
  { href: "/dashboard/circles", icon: "🌐", label: "Multi-Circle Prospects" },
  { href: "/dashboard/shortlist", icon: "⭐", label: "Scored Shortlist" },
  { href: "/dashboard/pipeline", icon: "📊", label: "Family Office Pipeline" },
  { href: "/dashboard/regional-mapping", icon: "🗺️", label: "Regional Mapping" },
  { href: "/dashboard/corridor-matching", icon: "🔗", label: "Corridor Opportunities" },
  { href: "/dashboard/discovery", icon: "🔍", label: "Global Discovery" },
  { href: "/dashboard/briefing-packs", icon: "📄", label: "Briefing Pack Tracker" },
  { href: "/dashboard/documents", icon: "🗂️", label: "Document Library" },
  { href: "/dashboard/governance", icon: "🛡️", label: "Governance Language", warn: true },
  { href: "/dashboard/tasks", icon: "✅", label: "Task Board" },
  { href: "/dashboard/agents", icon: "🤖", label: "AI Automation" },
];

// Icons for the FO Circle Portal pages, appended to the main dashboard
// sidebar for staff roles so admin/super_admin can reach them without
// switching into /portal. Registry-driven from PORTAL_PAGES (see
// src/lib/portal/pages.ts) so this list can't drift out of sync with
// the portal's own sidebar.
const portalIconByPath: Record<string, string> = {
  "/portal/account": "👤",
  "/portal/opportunities": "💼",
  "/portal/events": "📅",
  "/portal/messages": "💬",
  "/portal/opportunities/manage": "🗃️",
  "/portal/profiles/review": "📝",
  "/portal/applications": "📥",
  "/portal/member-requests": "🧾",
  "/portal/invitations": "✉️",
  "/portal/admin-requests": "🛂",
  "/portal/manage-users": "👥",
};

const settingsItem: NavItem = { href: "/dashboard/settings", icon: "⚙️", label: "Settings" };

export function Sidebar() {
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    setRole(getPortalSession()?.role ?? null);
  }, []);

  const portalItems: NavItem[] =
    role && isStaffRole(role)
      ? portalPagesForRole(role).map((p) => ({
          href: p.path,
          icon: portalIconByPath[p.path] ?? "•",
          label: p.label,
        }))
      : [];

  const navItems = [...baseNavItems, ...portalItems, settingsItem];

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  return (
    <aside
      className="sidebar-scroll"
      style={{
        width: 200,
        background: "#EAF6FA",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        top: 64,
        left: 0,
        height: "calc(100vh - 64px)",
        overflowY: "auto",
        zIndex: 20,
        borderRight: "1px solid rgba(27,42,61,0.05)",
      }}
    >
      {/* Nav */}
      <nav style={{ flex: 1, padding: "10px 0" }}>
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 14px",
                cursor: "pointer",
                color: active ? "#1B2A3D" : "#6B6455",
                background: active ? "rgba(27,42,61,0.06)" : "transparent",
                borderLeft: active ? "3px solid #3A9FC0" : "3px solid transparent",
                fontSize: 12.5,
                fontWeight: active ? 600 : 400,
                textDecoration: "none",
                transition: "all 0.12s",
                position: "relative",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = "rgba(27,42,61,0.04)";
                  (e.currentTarget as HTMLElement).style.color = "#33465E";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                  (e.currentTarget as HTMLElement).style.color = "#6B6455";
                }
              }}
            >
              <span style={{ fontSize: 14, width: 18, textAlign: "center", flexShrink: 0 }}>{item.icon}</span>
              <span style={{ flex: 1, lineHeight: 1.35 }}>{item.label}</span>
              {"warn" in item && item.warn && (
                <span
                  style={{
                    background: "#EF4444", color: "#fff",
                    fontSize: 9, fontWeight: 800, padding: "1px 6px", borderRadius: 10,
                  }}
                >
                  2
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {role && isStaffRole(role) && (
        <div style={{ padding: "10px 10px 0" }}>
          <Link
            href="/portal"
            style={{
              display: "block",
              padding: "9px 12px",
              borderRadius: 8,
              fontSize: 12.5,
              color: "#6B6455",
              textDecoration: "none",
              border: "1px solid rgba(27,42,61,0.1)",
            }}
          >
            Circle Portal
          </Link>
        </div>
      )}

      {/* Mission section */}
      <div
        style={{
          padding: "14px 16px",
          borderTop: "1px solid rgba(27,42,61,0.05)",
        }}
      >
        <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "1.4px", color: "#847D6C", marginBottom: 6, fontWeight: 700 }}>
          TBP Mission
        </div>
        <div style={{ fontSize: 10, color: "#847D6C", lineHeight: 1.6 }}>
          To build neutral, borderless trade infrastructure and permanent-capital ecosystems that enable global prosperity, opportunity and inclusion.
        </div>
      </div>
    </aside>
  );
}
