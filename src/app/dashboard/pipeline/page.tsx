"use client";

import { useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { ScoreBadge, ClassificationBadge } from "@/components/ui/Badge";
import { mockProspects } from "@/lib/mock-data/prospects";
import type { PipelineStage } from "@/types";

const stages: PipelineStage[] = [
  "Identified", "Profiled", "Scored", "Reviewed",
  "Approved for Approach", "Warm Introduction Sought", "Contacted",
  "Meeting Proposed", "Meeting Scheduled", "Briefing Pack Sent",
  "Follow-Up Required", "Diligence / Review", "Commitment Discussion",
  "Joined Circle", "Not Suitable / Parked",
];

const stageColors: Record<string, string> = {
  "Identified": "#3B82F6",
  "Profiled": "#6366F1",
  "Scored": "#8B5CF6",
  "Reviewed": "#EC4899",
  "Approved for Approach": "#F59E0B",
  "Warm Introduction Sought": "#F59E0B",
  "Contacted": "#10B981",
  "Meeting Proposed": "#10B981",
  "Meeting Scheduled": "#10B981",
  "Briefing Pack Sent": "#10B981",
  "Follow-Up Required": "#F59E0B",
  "Diligence / Review": "#EF4444",
  "Commitment Discussion": "#059669",
  "Joined Circle": "#047857",
  "Not Suitable / Parked": "#9CA3AF",
};

// Only show active stages in kanban
const kanbanStages: PipelineStage[] = [
  "Identified", "Profiled", "Scored", "Reviewed",
  "Approved for Approach", "Contacted", "Meeting Scheduled",
  "Joined Circle", "Not Suitable / Parked",
];

export default function PipelinePage() {
  const [prospects, setProspects] = useState(mockProspects);
  const [view, setView] = useState<"kanban" | "list">("kanban");

  const byStage = (stage: PipelineStage) => prospects.filter((p) => p.pipeline_stage === stage);

  const progressCount = prospects.filter((p) => p.pipeline_stage === "Joined Circle").length;

  return (
    <>
      <Topbar title="Pipeline Tracker" subtitle={`${prospects.length} prospects across all stages · ${progressCount} of 20 Founding Stewards secured`} />
      <div style={{ padding: "24px 28px 40px" }}>

        {/* Progress bar */}
        <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, padding: "18px 24px", marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#1A2B45" }}>Founding Strategic Steward Progress</div>
              <div style={{ fontSize: 11, color: "#8899AA" }}>Target: 20 Founding Strategic Stewards globally</div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: "#C4992A" }}>{progressCount}<span style={{ fontSize: 14, color: "#8899AA", fontWeight: 400 }}> / 20</span></div>
          </div>
          <div style={{ height: 10, background: "#F4F6FA", borderRadius: 5, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(progressCount / 20) * 100}%`, background: "#C4992A", borderRadius: 5, transition: "width 0.5s" }} />
          </div>
        </div>

        {/* View toggle */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {(["kanban", "list"] as const).map((v) => (
            <button key={v} onClick={() => setView(v)}
              style={{
                padding: "7px 16px", borderRadius: 8, border: "1px solid #E2E8F0",
                fontSize: 12, fontWeight: 600, cursor: "pointer",
                background: view === v ? "#1A2B45" : "#fff",
                color: view === v ? "#fff" : "#5A6B7F",
              }}
            >
              {v === "kanban" ? "⊞ Kanban View" : "☰ List View"}
            </button>
          ))}
        </div>

        {view === "kanban" ? (
          /* KANBAN */
          <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 12 }}>
            {kanbanStages.map((stage) => {
              const cards = byStage(stage);
              return (
                <div key={stage}
                  style={{
                    minWidth: 240, background: "#fff",
                    border: "1px solid #E2E8F0", borderRadius: 12,
                    overflow: "hidden", flexShrink: 0,
                  }}
                >
                  {/* Column header */}
                  <div style={{ padding: "10px 14px", borderBottom: "3px solid " + stageColors[stage], background: "#FAFBFC" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#1A2B45", textTransform: "uppercase", letterSpacing: ".8px" }}>{stage}</div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: stageColors[stage], marginTop: 2 }}>{cards.length}</div>
                  </div>

                  {/* Cards */}
                  <div style={{ padding: 8, display: "flex", flexDirection: "column", gap: 8, maxHeight: 600, overflowY: "auto" }}>
                    {cards.length === 0 && (
                      <div style={{ padding: "20px 10px", textAlign: "center", fontSize: 11, color: "#8899AA" }}>No prospects</div>
                    )}
                    {cards.map((p) => (
                      <div key={p.id}
                        style={{
                          background: "#fff", border: "1px solid #E2E8F0",
                          borderRadius: 8, padding: "10px 12px",
                          cursor: "pointer", transition: "box-shadow 0.15s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)")}
                        onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
                      >
                        <div style={{ fontWeight: 600, fontSize: 12, color: "#1A2B45", marginBottom: 4 }}>{p.prospect_name}</div>
                        <div style={{ fontSize: 10, color: "#8899AA", marginBottom: 8 }}>{p.city}, {p.country}</div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <ScoreBadge score={p.suitability_score} />
                          <span style={{ fontSize: 10, color: "#8899AA" }}>{p.assigned_owner}</span>
                        </div>
                        {p.diligence_flags.length > 0 && (
                          <div style={{ marginTop: 6, fontSize: 10, color: "#DC2626" }}>⚠ {p.diligence_flags.length} flag{p.diligence_flags.length > 1 ? "s" : ""}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* LIST VIEW */
          <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Prospect", "Stage", "Score", "Classification", "Owner", "Next Action", "Due"].map((h) => (
                    <th key={h} style={{ textAlign: "left", fontSize: 10, textTransform: "uppercase", letterSpacing: ".8px", color: "#8899AA", padding: "12px 12px 10px", borderBottom: "1px solid #E2E8F0" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stages.flatMap((stage) =>
                  byStage(stage).map((p) => (
                    <tr key={p.id}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#F4F6FA")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <td style={{ padding: "10px 12px", borderBottom: "1px solid #E2E8F0" }}>
                        <div style={{ fontWeight: 600, color: "#1A2B45", fontSize: 13 }}>{p.prospect_name}</div>
                        <div style={{ fontSize: 11, color: "#8899AA" }}>{p.city}, {p.country}</div>
                      </td>
                      <td style={{ padding: "10px 12px", borderBottom: "1px solid #E2E8F0" }}>
                        <span style={{ fontSize: 11, padding: "3px 9px", borderRadius: 6, background: stageColors[stage] + "18", color: stageColors[stage], fontWeight: 700 }}>{stage}</span>
                      </td>
                      <td style={{ padding: "10px 12px", borderBottom: "1px solid #E2E8F0" }}><ScoreBadge score={p.suitability_score} /></td>
                      <td style={{ padding: "10px 12px", borderBottom: "1px solid #E2E8F0" }}><ClassificationBadge classification={p.classification} /></td>
                      <td style={{ padding: "10px 12px", borderBottom: "1px solid #E2E8F0", fontSize: 12, color: "#5A6B7F" }}>{p.assigned_owner}</td>
                      <td style={{ padding: "10px 12px", borderBottom: "1px solid #E2E8F0", fontSize: 11, color: "#5A6B7F", maxWidth: 180 }}>{p.next_action}</td>
                      <td style={{ padding: "10px 12px", borderBottom: "1px solid #E2E8F0", fontSize: 11, color: new Date(p.next_action_date) < new Date() ? "#DC2626" : "#5A6B7F", fontWeight: new Date(p.next_action_date) < new Date() ? 700 : 400 }}>
                        {p.next_action_date}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
