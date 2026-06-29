"use client";

import { Topbar } from "@/components/layout/Topbar";
import { mockAgents } from "@/lib/mock-data/agents";

function StatusChip({ status }: { status: string }) {
  const style =
    status === "Active" ? { background: "rgba(16,185,129,0.1)", color: "#059669" }
    : status === "Mock" ? { background: "rgba(59,130,246,0.1)", color: "#2563EB" }
    : { background: "rgba(245,158,11,0.1)", color: "#D97706" };
  return (
    <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700, ...style }}>
      {status}
    </span>
  );
}

export default function AgentsPage() {
  return (
    <>
      <Topbar title="AI Agents" subtitle="TBP Family Office Circle Intelligence & Coordination Engine — 12 AI agents" />
      <div style={{ padding: "24px 28px 40px" }}>

        <div style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 12, padding: "12px 18px", marginBottom: 20, fontSize: 12, color: "#1e40af" }}>
          ℹ️ <strong>MVP Mode.</strong> All agents are currently in Mock status. Connect real APIs (Tavily, Claude, Brave Search, Supabase) to activate individual agents. Human approval is required before any agent sends external communications.
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14 }}>
          {mockAgents.map((agent) => (
            <div
              key={agent.id}
              style={{
                background: "#fff", border: "1px solid #E2E8F0",
                borderRadius: 12, padding: 20,
                transition: "box-shadow 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)")}
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ fontSize: 22 }}>{agent.icon}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "#1A2B45" }}>{agent.name}</div>
                    <StatusChip status={agent.status} />
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 10, color: "#8899AA" }}>Human Approval</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: agent.humanApprovalRequired ? "#DC2626" : "#059669" }}>
                    {agent.humanApprovalRequired ? "Required" : "Not Required"}
                  </div>
                </div>
              </div>

              <div style={{ fontSize: 12, color: "#5A6B7F", lineHeight: 1.6, marginBottom: 12 }}>
                {agent.purpose}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                <div style={{ background: "#F4F6FA", borderRadius: 8, padding: "8px 10px" }}>
                  <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: ".8px", color: "#8899AA", marginBottom: 3 }}>Input</div>
                  <div style={{ fontSize: 11, color: "#1A2B45", lineHeight: 1.4 }}>{agent.input}</div>
                </div>
                <div style={{ background: "#F4F6FA", borderRadius: 8, padding: "8px 10px" }}>
                  <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: ".8px", color: "#8899AA", marginBottom: 3 }}>Output</div>
                  <div style={{ fontSize: 11, color: "#1A2B45", lineHeight: 1.4 }}>{agent.output}</div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontSize: 11, color: "#8899AA" }}>
                  {agent.lastRun ? `Last run: ${new Date(agent.lastRun).toLocaleDateString()}` : "Never run"}
                </div>
                <button
                  style={{
                    padding: "6px 14px", borderRadius: 7, border: "1px solid #E2E8F0",
                    fontSize: 11, fontWeight: 600, cursor: "pointer",
                    background: agent.status === "Active" ? "#1A2B45" : "#F4F6FA",
                    color: agent.status === "Active" ? "#fff" : "#5A6B7F",
                  }}
                >
                  {agent.status === "Active" ? "▶ Run" : agent.status === "Needs API" ? "🔌 Connect API" : "⚙ Configure"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
