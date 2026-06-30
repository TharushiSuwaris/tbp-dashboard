"use client";

import { useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { Panel } from "@/components/ui/Panel";
import { ScoreBadge } from "@/components/ui/Badge";
import { mockProspects } from "@/lib/mock-data/prospects";
import { matchProspectToCorridor, TBP_CORRIDORS } from "@/lib/ai/corridor-matching";

export default function CorridorMatchingPage() {
  const [selectedCorridor, setSelectedCorridor] = useState<string>("");

  const allMatches = mockProspects
    .filter((p) => p.suitability_score >= 50)
    .map((p) => ({ prospect: p, result: matchProspectToCorridor(p) }));

  const corridorProspects = selectedCorridor
    ? allMatches.filter((m) =>
        m.result.bestEntryPoint.corridorName === selectedCorridor ||
        m.result.secondaryEntryPoints.some((s) => s.corridorName === selectedCorridor)
      )
    : allMatches;

  const corridorCounts = TBP_CORRIDORS.map((c) => ({
    corridor: c,
    count: allMatches.filter((m) =>
      m.result.bestEntryPoint.corridorName === c ||
      m.result.secondaryEntryPoints.some((s) => s.corridorName === c)
    ).length,
  })).sort((a, b) => b.count - a.count);

  return (
    <>
      <Topbar title="Corridor Opportunities" subtitle="Match prospects to TBP strategic corridors based on geography, sector, and infrastructure exposure" />
      <div style={{ padding: "24px 28px 40px" }}>

        <Panel title="TBP Corridors — Prospect Distribution" subtitle="Filter by corridor to see matched prospects" style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              onClick={() => setSelectedCorridor("")}
              style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", fontSize: 11, fontWeight: 600, cursor: "pointer", background: selectedCorridor === "" ? "#C4992A" : "rgba(255,255,255,0.06)", color: selectedCorridor === "" ? "#0C1929" : "#7B8EAA" }}
            >
              All Corridors ({allMatches.length})
            </button>
            {corridorCounts.map(({ corridor, count }) => (
              <button
                key={corridor}
                onClick={() => setSelectedCorridor(corridor)}
                style={{
                  padding: "6px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)",
                  fontSize: 11, fontWeight: 600, cursor: "pointer",
                  background: selectedCorridor === corridor ? "#C4992A" : "rgba(255,255,255,0.06)",
                  color: selectedCorridor === corridor ? "#0C1929" : "#7B8EAA",
                }}
              >
                {corridor.replace("TBP ", "").replace("ASMOFP™ ", "")} ({count})
              </button>
            ))}
          </div>
        </Panel>

        <Panel title="Corridor Strength" subtitle="Number of prospects matched per corridor" style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {corridorCounts.map(({ corridor, count }) => (
              <div key={corridor} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ fontSize: 11, color: "#7B8EAA", width: 260, flexShrink: 0, lineHeight: 1.3 }}>
                  {corridor.replace("TBP ", "").replace("ASMOFP™ ", "")}
                </div>
                <div style={{ flex: 1, height: 22, background: "rgba(255,255,255,0.06)", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(count / allMatches.length) * 100}%`, background: "#C4992A", borderRadius: 4, minWidth: count > 0 ? 4 : 0, transition: "width 0.4s" }} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#E8EFF8", width: 24, textAlign: "right" }}>{count}</div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel
          title={selectedCorridor ? `Prospects — ${selectedCorridor.replace("TBP ", "")}` : "All Corridor Matches"}
          subtitle={`${corridorProspects.length} prospects · Showing best entry point corridor and relevance score`}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Prospect", "Score", "Best Corridor Match", "Relevance", "Secondary Corridors", "Conversation Angle"].map((h) => (
                  <th key={h} style={{ textAlign: "left", fontSize: 10, textTransform: "uppercase", letterSpacing: ".8px", color: "#4A5C70", padding: "0 10px 8px 0", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {corridorProspects.map(({ prospect: p, result }) => (
                <tr key={p.id}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ padding: "10px 10px 10px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <div style={{ fontWeight: 600, color: "#E8EFF8", fontSize: 13 }}>{p.prospect_name}</div>
                    <div style={{ fontSize: 10, color: "#4A5C70" }}>{p.city}, {p.country}</div>
                  </td>
                  <td style={{ padding: "10px 10px 10px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <ScoreBadge score={p.suitability_score} />
                  </td>
                  <td style={{ padding: "10px 10px 10px 0", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: 11, color: "#E8EFF8", maxWidth: 180 }}>
                    {result.bestEntryPoint.corridorName.replace("TBP ", "").replace("ASMOFP™ ", "")}
                  </td>
                  <td style={{ padding: "10px 10px 10px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 60, height: 8, background: "rgba(255,255,255,0.08)", borderRadius: 4, overflow: "hidden" }}>
                        <div style={{
                          height: "100%",
                          width: `${result.bestEntryPoint.relevanceScore}%`,
                          background: result.bestEntryPoint.relevanceScore >= 70 ? "#10B981" : result.bestEntryPoint.relevanceScore >= 50 ? "#F59E0B" : "#6B7F96",
                        }} />
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#E8EFF8" }}>{result.bestEntryPoint.relevanceScore}%</span>
                    </div>
                  </td>
                  <td style={{ padding: "10px 10px 10px 0", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: 11, color: "#7B8EAA" }}>
                    {result.secondaryEntryPoints
                      .slice(0, 2)
                      .map((s) => s.corridorName.replace("TBP ", "").replace("ASMOFP™ ", "").split(" ").slice(0, 3).join(" "))
                      .join(", ")}
                  </td>
                  <td style={{ padding: "10px 10px 10px 0", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: 11, color: "#C4992A", fontWeight: 600, maxWidth: 200 }}>
                    {result.bestEntryPoint.suggestedConversationAngle.slice(0, 80)}…
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </div>
    </>
  );
}
