"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
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
  { href: "/dashboard/settings", icon: "⚙️", label: "Settings" },
];

export function Sidebar() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  return (
    <aside
      className="sidebar-scroll"
      style={{
        width: 200,
        background: "#091524",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        top: 64,
        left: 0,
        height: "calc(100vh - 64px)",
        overflowY: "auto",
        zIndex: 20,
        borderRight: "1px solid rgba(255,255,255,0.05)",
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
                color: active ? "#E8EFF8" : "#6B7F96",
                background: active ? "rgba(255,255,255,0.06)" : "transparent",
                borderLeft: active ? "3px solid #C4992A" : "3px solid transparent",
                fontSize: 12.5,
                fontWeight: active ? 600 : 400,
                textDecoration: "none",
                transition: "all 0.12s",
                position: "relative",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
                  (e.currentTarget as HTMLElement).style.color = "#B0C0D4";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                  (e.currentTarget as HTMLElement).style.color = "#6B7F96";
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

      {/* Mission section */}
      <div
        style={{
          padding: "14px 16px",
          borderTop: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "1.4px", color: "#3A4E62", marginBottom: 6, fontWeight: 700 }}>
          TBP Mission
        </div>
        <div style={{ fontSize: 10, color: "#3A4E62", lineHeight: 1.6 }}>
          To build neutral, borderless trade infrastructure and permanent-capital ecosystems that enable global prosperity, opportunity and inclusion.
        </div>
      </div>
    </aside>
  );
}
