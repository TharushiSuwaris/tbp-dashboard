"use client";

import { Topbar } from "@/components/layout/Topbar";
import { Panel } from "@/components/ui/Panel";

export default function SettingsPage() {
  return (
    <>
      <Topbar title="Settings" subtitle="TBP Family Office Intelligence Engine — configuration, API connections, and user access" />
      <div style={{ padding: "24px 28px 40px" }}>

        <div style={{ background: "rgba(196,153,42,0.06)", border: "1px solid rgba(196,153,42,0.3)", borderRadius: 12, padding: "12px 18px", marginBottom: 20, fontSize: 12, color: "#92400E" }}>
          ⚙️ <strong>MVP Configuration.</strong> This platform is currently running on mock data. Connect real APIs below to activate live prospect discovery, AI scoring, and corridor matching. All external outreach features remain gated behind human approval.
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>

          {/* API Connections */}
          <Panel title="API Connections" subtitle="Connect external data providers to activate live intelligence">
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { name: "Tavily Search API", purpose: "Live prospect discovery and web intelligence", status: "Not Connected", docs: "Required for Global Prospect Discovery" },
                { name: "Brave Search API", purpose: "Alternative web search for prospect enrichment", status: "Not Connected", docs: "Fallback for Tavily" },
                { name: "SerpAPI", purpose: "Google search integration for entity research", status: "Not Connected", docs: "Optional enrichment layer" },
                { name: "Supabase", purpose: "Production database for all prospect and pipeline data", status: "Not Connected", docs: "Required for multi-user / production" },
                { name: "Claude API (Anthropic)", purpose: "AI scoring, governance check, and briefing generation", status: "Not Connected", docs: "Required for live AI agent mode" },
              ].map((api) => (
                <div key={api.name} style={{ padding: "12px 14px", background: "#F4F6FA", border: "1px solid #E2E8F0", borderRadius: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: "#1A2B45" }}>{api.name}</div>
                    <span style={{ fontSize: 10, padding: "2px 9px", borderRadius: 20, background: "rgba(239,68,68,0.08)", color: "#DC2626", fontWeight: 700 }}>
                      {api.status}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: "#5A6B7F", marginBottom: 4 }}>{api.purpose}</div>
                  <div style={{ fontSize: 10, color: "#8899AA" }}>{api.docs}</div>
                  <div style={{ marginTop: 8 }}>
                    <input
                      type="password"
                      placeholder="Paste API key..."
                      disabled
                      style={{ width: "100%", padding: "6px 10px", border: "1px solid #E2E8F0", borderRadius: 6, fontSize: 12, background: "#fff", color: "#1A2B45", cursor: "not-allowed", opacity: 0.6 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* User access */}
            <Panel title="User Access & Roles" subtitle="TBP team members with access to this platform">
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["Name", "Role", "Access Level"].map(h => (
                      <th key={h} style={{ textAlign: "left", fontSize: 10, textTransform: "uppercase", letterSpacing: ".8px", color: "#8899AA", paddingBottom: 8, borderBottom: "1px solid #E2E8F0" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: "Ribi Jayasinghe", role: "TBP Leadership", access: "Full Admin" },
                    { name: "Global Strategist", role: "Senior Strategist", access: "Read + Write" },
                    { name: "Tharushi", role: "AI Automation Intern", access: "Read + Write" },
                  ].map((u) => (
                    <tr key={u.name}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#F4F6FA")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <td style={{ padding: "9px 0", borderBottom: "1px solid #E2E8F0", fontSize: 13, fontWeight: 600, color: "#1A2B45" }}>{u.name}</td>
                      <td style={{ padding: "9px 0", borderBottom: "1px solid #E2E8F0", fontSize: 12, color: "#5A6B7F" }}>{u.role}</td>
                      <td style={{ padding: "9px 0", borderBottom: "1px solid #E2E8F0" }}>
                        <span style={{ fontSize: 10, padding: "2px 9px", borderRadius: 20, background: u.access === "Full Admin" ? "rgba(196,153,42,0.12)" : "rgba(59,130,246,0.1)", color: u.access === "Full Admin" ? "#92711A" : "#2563EB", fontWeight: 700 }}>{u.access}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Panel>

            {/* Governance controls */}
            <Panel title="Governance Controls" subtitle="Core compliance guardrails — cannot be disabled">
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { label: "Governance Language Checker", status: "Always Active", note: "Scans all text for forbidden phrases before outreach" },
                  { label: "Human Approval Gate", status: "Always Active", note: "No external outreach can be sent without TBP Leadership approval" },
                  { label: "No Investment Recommendations", status: "Always Active", note: "Platform will never generate investment advice or recommendations" },
                  { label: "Public Sources Only", status: "Always Active", note: "Prospect discovery uses only publicly available, ethically sourced information" },
                  { label: "No Real Contact Details", status: "Always Active", note: "MVP contains no real personal contact information" },
                ].map((g) => (
                  <div key={g.label} style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "10px 12px", background: "rgba(16,185,129,0.04)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 8 }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#1A2B45" }}>{g.label}</div>
                      <div style={{ fontSize: 10, color: "#5A6B7F", marginTop: 2 }}>{g.note}</div>
                    </div>
                    <span style={{ fontSize: 10, padding: "2px 9px", borderRadius: 20, background: "rgba(16,185,129,0.12)", color: "#059669", fontWeight: 700, flexShrink: 0, marginLeft: 12 }}>
                      {g.status}
                    </span>
                  </div>
                ))}
              </div>
            </Panel>

            {/* Tech stack */}
            <Panel title="Tech Stack" subtitle="Current MVP configuration">
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[
                  ["Frontend", "Next.js 16 · TypeScript · Tailwind CSS v4 · Recharts"],
                  ["Backend / DB", "Supabase (schema ready, not yet connected)"],
                  ["AI / Scoring", "Mock functions — Claude API integration pending"],
                  ["Auth", "Not configured — MVP single-user mode"],
                  ["Discovery", "Mock mode — Tavily / Brave / SerpAPI pending"],
                  ["Deployment", "Not deployed — run locally with npm run dev"],
                ].map(([label, value]) => (
                  <div key={label} style={{ display: "flex", gap: 12, padding: "7px 0", borderBottom: "1px solid #E2E8F0", fontSize: 12 }}>
                    <div style={{ width: 120, color: "#8899AA", flexShrink: 0 }}>{label}</div>
                    <div style={{ color: "#1A2B45" }}>{value}</div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </>
  );
}
