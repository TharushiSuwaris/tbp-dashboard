"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navGroups = [
  {
    label: "Intelligence",
    items: [
      { href: "/dashboard", icon: "⊞", label: "Executive Overview" },
      { href: "/dashboard/discovery", icon: "🔍", label: "Global Discovery", badge: null },
      { href: "/dashboard/prospects", icon: "📋", label: "Prospect Longlist" },
      { href: "/dashboard/shortlist", icon: "⭐", label: "Scored Shortlist" },
      { href: "/dashboard/regional-mapping", icon: "🗺️", label: "Regional Mapping" },
      { href: "/dashboard/corridor-matching", icon: "🔗", label: "Corridor Matching" },
    ],
  },
  {
    label: "Execution",
    items: [
      { href: "/dashboard/briefing-packs", icon: "📄", label: "Briefing Packs" },
      { href: "/dashboard/pipeline", icon: "📊", label: "Pipeline Tracker" },
      { href: "/dashboard/documents", icon: "🗂️", label: "Data Room" },
    ],
  },
  {
    label: "AI Tools",
    items: [
      { href: "/dashboard/governance", icon: "🛡️", label: "Language Guard", warn: true },
      { href: "/dashboard/agents", icon: "🤖", label: "AI Agents" },
    ],
  },
  {
    label: "Operations",
    items: [
      { href: "/dashboard/tasks", icon: "✅", label: "Task Board" },
      { href: "/dashboard/settings", icon: "⚙️", label: "Settings" },
    ],
  },
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
        width: 244,
        background: "#1A2B45",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        top: 0,
        left: 0,
        height: "100vh",
        overflowY: "auto",
        zIndex: 20,
        flexShrink: 0,
      }}
    >
      {/* Brand */}
      <div style={{ padding: "20px 16px 14px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <div
            style={{
              width: 34, height: 34,
              background: "#C4992A",
              borderRadius: 8,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 800, fontSize: 12, color: "#1A2B45", flexShrink: 0,
            }}
          >
            TBP
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>TBP Capital Advisory</div>
            <div style={{ fontSize: 10, color: "#C4992A", letterSpacing: "1.2px", textTransform: "uppercase" }}>
              Family Office Circle
            </div>
          </div>
        </div>
        <div
          style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "rgba(196,153,42,0.12)",
            border: "1px solid rgba(196,153,42,0.35)",
            borderRadius: 20, padding: "5px 10px",
            fontSize: 10, color: "#C4992A", letterSpacing: ".8px", textTransform: "uppercase",
          }}
        >
          <div
            className="animate-pulse-dot"
            style={{ width: 6, height: 6, background: "#C4992A", borderRadius: "50%" }}
          />
          Protocol Establishment Round
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 10px" }}>
        {navGroups.map((group) => (
          <div key={group.label}>
            <div
              style={{
                fontSize: 10, textTransform: "uppercase", letterSpacing: "1.2px",
                color: "#4A6080", padding: "10px 10px 4px",
              }}
            >
              {group.label}
            </div>
            {group.items.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "9px 12px", borderRadius: 8, cursor: "pointer",
                    color: active ? "#C4992A" : "#7A99BC",
                    background: active ? "rgba(196,153,42,0.14)" : "transparent",
                    fontSize: 13, fontWeight: 500, marginBottom: 2,
                    textDecoration: "none", transition: "all 0.15s",
                    border: "none",
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)";
                      (e.currentTarget as HTMLElement).style.color = "#fff";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                      (e.currentTarget as HTMLElement).style.color = "#7A99BC";
                    }
                  }}
                >
                  <span style={{ fontSize: 15, width: 20, textAlign: "center" }}>{item.icon}</span>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {"warn" in item && item.warn && (
                    <span
                      style={{
                        marginLeft: "auto", background: "#EF4444", color: "#fff",
                        fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 10,
                      }}
                    >
                      2
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div
        style={{
          padding: 14, borderTop: "1px solid rgba(255,255,255,0.07)",
          display: "flex", alignItems: "center", gap: 10,
        }}
      >
        <div
          style={{
            width: 34, height: 34, background: "#C4992A", borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 800, fontSize: 12, color: "#1A2B45", flexShrink: 0,
          }}
        >
          RJ
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>Ribi Jayasinghe</div>
          <div style={{ fontSize: 11, color: "#4A6080" }}>TBP Leadership</div>
        </div>
      </div>
    </aside>
  );
}
