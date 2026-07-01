"use client";

import { useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { ScoreBadge, ClassificationBadge } from "@/components/ui/Badge";
import { useProspects } from "@/lib/hooks/useSupabaseData";
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

const kanbanStages: PipelineStage[] = [
  "Identified", "Profiled", "Scored", "Reviewed",
  "Approved for Approach", "Contacted", "Meeting Scheduled",
  "Joined Circle", "Not Suitable / Parked",
];

export default function PipelinePage() {
  const { prospects, loading } = useProspects();
  const [view, setView] = useState<"kanban" | "list">("kanban");

  if (loading) return (
    <div style={{ padding: 28, color: "#7B8EAA", fontSize: 13 }}>Loading pipeline from database...</div>
  );

  const byStage = (stage: PipelineStage) => prospects.filter((p) => p.pipeline_stage === stage);
  const progressCount = prospects.filter((p) => p.pipeline_stage === "Joined Circle").length;

  return (
    <>
      <Topbar title="Pipeline Tracker" subtitle={`${prospects.length} prospects across all stages · ${progressCount} of 20 Founding Stewards secured`} />
      <div style={{ padding: "24px 28px 40px" }}>

        {/* Progress bar */}
        <div style={{ background: "#132037", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "18px 24px", marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#E8EFF8" }}>Founding Strategic Steward Progress</div>
              <div style={{ fontSize: 11, color: "#4A5C70" }}>Target: 20 Founding Strategic Stewards globally</div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: "#C4992A" }}>{progressCount}<span style={{ fontSize: 14, color: "#4A5C70", fontWeight: 400 }}> / 20</span></div>
          </div>
          <div style={{ height: 10, background: "rgba(255,255,255,0.08)", borderRadius: 5, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(progressCount / 20) * 100}%`, background: "#C4992A", borderRadius: 5, transition: "width 0.5s" }} />
          </div>
        </div>

        {/* View toggle */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {(["kanban", "list"] as const).map((v) => (
            <button key={v} onClick={() => setView(v)}
              style={{
                padding: "7px 16px", borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.1)",
                fontSize: 12, fontWeight: 600, cursor: "pointer",
                background: view === v ? "#C4992A" : "rgba(255,255,255,0.06)",
                color: view === v ? "#0C1929" : "#7B8EAA",
              }}
            >
              {v === "kanban" ? "⊞ Kanban View" : "☰ List View"}
            </button>
          ))}
        </div>

        {view === "kanban" ? (
          <div className="kanban-scroll" style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 12 }}>
            {kanbanStages.map((stage) => {
              const cards = byStage(stage);
              return (
                <div key={stage}
                  style={{
                    minWidth: 240,
                    background: "#132037",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 12,
                    overflow: "hidden",
                    flexShrink: 0,
                  }}
                >
                  <div style={{ padding: "10px 14px", borderBottom: `2px solid ${stageColors[stage]}`, background: "rgba(255,255,255,0.03)" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#7B8EAA", textTransform: "uppercase", letterSpacing: ".8px" }}>{stage}</div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: stageColors[stage], marginTop: 2 }}>{cards.length}</div>
                  </div>

                  <div style={{ padding: 8, display: "flex", flexDirection: "column", gap: 8, maxHeight: 600, overflowY: "auto" }}>
                    {cards.length === 0 && (
                      <div style={{ padding: "20px 10px", textAlign: "center", fontSize: 11, color: "#4A5C70" }}>No prospects</div>
                    )}
                    {cards.map((p) => (
                      <div key={p.id}
                        style={{
                          background: "#0C1929", border: "1px solid rgba(255,255,255,0.07)",
                          borderRadius: 8, padding: "10px 12px",
                          cursor: "pointer", transition: "border-color 0.15s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(196,153,42,0.4)")}
                        onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)")}
                      >
                        <div style={{ fontWeight: 600, fontSize: 12, color: "#E8EFF8", marginBottom: 4 }}>{p.prospect_name}</div>
                        <div style={{ fontSize: 10, color: "#4A5C70", marginBottom: 8 }}>{p.city}, {p.country}</div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <ScoreBadge score={p.suitability_score} />
                          <span style={{ fontSize: 10, color: "#4A5C70" }}>{p.assigned_owner}</span>
                        </div>
                        {p.diligence_flags.length > 0 && (
                          <div style={{ marginTop: 6, fontSize: 10, color: "#F87171" }}>⚠ {p.diligence_flags.length} flag{p.diligence_flags.length > 1 ? "s" : ""}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ background: "#132037", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Prospect", "Stage", "Score", "Classification", "Owner", "Next Action", "Due"].map((h) => (
                    <th key={h} style={{ textAlign: "left", fontSize: 10, textTransform: "uppercase", letterSpacing: ".8px", color: "#4A5C70", padding: "12px 12px 10px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stages.flatMap((stage) =>
                  byStage(stage).map((p) => (
                    <tr key={p.id}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <td style={{ padding: "10px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                        <div style={{ fontWeight: 600, color: "#E8EFF8", fontSize: 13 }}>{p.prospect_name}</div>
                        <div style={{ fontSize: 11, color: "#4A5C70" }}>{p.city}, {p.country}</div>
                      </td>
                      <td style={{ padding: "10px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                        <span style={{ fontSize: 11, padding: "3px 9px", borderRadius: 6, background: stageColors[stage] + "20", color: stageColors[stage], fontWeight: 700 }}>{stage}</span>
                      </td>
                      <td style={{ padding: "10px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}><ScoreBadge score={p.suitability_score} /></td>
                      <td style={{ padding: "10px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}><ClassificationBadge classification={p.classification} /></td>
                      <td style={{ padding: "10px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: 12, color: "#7B8EAA" }}>{p.assigned_owner}</td>
                      <td style={{ padding: "10px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: 11, color: "#7B8EAA", maxWidth: 180 }}>{p.next_action}</td>
                      <td style={{ padding: "10px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: 11, color: new Date(p.next_action_date) < new Date() ? "#F87171" : "#7B8EAA", fontWeight: new Date(p.next_action_date) < new Date() ? 700 : 400 }}>
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
