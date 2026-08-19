"use client";

import { Topbar } from "@/components/layout/Topbar";
import { mockAgents } from "@/lib/mock-data/agents";

function StatusChip({ status }: { status: string }) {
  const style =
    status === "Active" ? { background: "rgba(16,185,129,0.18)", color: "#34D399" }
    : status === "Mock" ? { background: "rgba(59,130,246,0.18)", color: "#60A5FA" }
    : { background: "rgba(245,158,11,0.18)", color: "#FBBF24" };
  return (
    <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700, ...style }}>
      {status}
    </span>
  );
}

export default function AgentsPage() {
  return (
    <>
      <Topbar title="AI Automation" subtitle="TBP Family Office Circle Intelligence & Coordination Engine — 12 AI agents" />
      <div style={{ padding: "24px 28px 40px" }}>

        <div style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 12, padding: "12px 18px", marginBottom: 20, fontSize: 12, color: "#93C5FD" }}>
          ℹ️ <strong>MVP Mode.</strong> All agents are currently in Mock status. Connect real APIs (Tavily, Claude, Brave Search, Supabase) to activate individual agents. Human approval is required before any agent sends external communications.
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14 }}>
          {mockAgents.map((agent) => (
            <div
              key={agent.id}
              style={{
                background: "#F1EDE1", border: "1px solid rgba(27,42,61,0.07)",
                borderRadius: 12, padding: 20,
                transition: "border-color 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(196,153,42,0.35)")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(27,42,61,0.07)")}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ fontSize: 22 }}>{agent.icon}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "#1B2A3D" }}>{agent.name}</div>
                    <StatusChip status={agent.status} />
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 10, color: "#5C5648" }}>Human Approval</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: agent.humanApprovalRequired ? "#F87171" : "#34D399" }}>
                    {agent.humanApprovalRequired ? "Required" : "Not Required"}
                  </div>
                </div>
              </div>

              <div style={{ fontSize: 12, color: "#756E5D", lineHeight: 1.6, marginBottom: 12 }}>
                {agent.purpose}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                <div style={{ background: "rgba(27,42,61,0.04)", borderRadius: 8, padding: "8px 10px", border: "1px solid rgba(27,42,61,0.06)" }}>
                  <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: ".8px", color: "#5C5648", marginBottom: 3 }}>Input</div>
                  <div style={{ fontSize: 11, color: "#1B2A3D", lineHeight: 1.4 }}>{agent.input}</div>
                </div>
                <div style={{ background: "rgba(27,42,61,0.04)", borderRadius: 8, padding: "8px 10px", border: "1px solid rgba(27,42,61,0.06)" }}>
                  <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: ".8px", color: "#5C5648", marginBottom: 3 }}>Output</div>
                  <div style={{ fontSize: 11, color: "#1B2A3D", lineHeight: 1.4 }}>{agent.output}</div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontSize: 11, color: "#5C5648" }}>
                  {agent.lastRun ? `Last run: ${new Date(agent.lastRun).toLocaleDateString()}` : "Never run"}
                </div>
                <button
                  style={{
                    padding: "6px 14px", borderRadius: 7,
                    border: "1px solid rgba(27,42,61,0.1)",
                    fontSize: 11, fontWeight: 600, cursor: "pointer",
                    background: agent.status === "Active" ? "#C4992A" : "rgba(27,42,61,0.06)",
                    color: agent.status === "Active" ? "#F7F4EC" : "#756E5D",
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
