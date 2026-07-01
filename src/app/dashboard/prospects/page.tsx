"use client";

import { useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { Panel } from "@/components/ui/Panel";
import { ScoreBadge, ClassificationBadge, StageBadge } from "@/components/ui/Badge";
import { useProspects } from "@/lib/hooks/useSupabaseData";
import type { Region } from "@/types";

const regions: Region[] = ["North America", "United Kingdom & Europe", "Southeast Asia", "South Asia", "Central Asia", "Gulf & Middle East", "Africa", "East Asia", "Latin America"];

export default function ProspectsPage() {
  const { prospects, loading } = useProspects();
  const [regionFilter, setRegionFilter] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [search, setSearch] = useState("");

  const filtered = prospects.filter((p) => {
    if (regionFilter && p.region !== regionFilter) return false;
    if (classFilter && p.classification !== classFilter) return false;
    if (stageFilter && p.pipeline_stage !== stageFilter) return false;
    if (search && !p.prospect_name.toLowerCase().includes(search.toLowerCase()) && !p.country.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }).sort((a, b) => b.suitability_score - a.suitability_score);

  const inputStyle: React.CSSProperties = {
    padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.12)",
    fontSize: 12, color: "#E8EFF8", background: "#0A1624", outline: "none",
  };

  if (loading) return (
    <div style={{ padding: 28, color: "#7B8EAA", fontSize: 13 }}>Loading prospects from database...</div>
  );

  return (
    <>
      <Topbar title="Prospect Longlist" subtitle={`${prospects.length} prospects across all regions — sorted by suitability score`} />
      <div style={{ padding: "24px 28px 40px" }}>

        <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
          <input style={{ ...inputStyle, width: 220 }} placeholder="🔍 Search name or country..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <select style={inputStyle} value={regionFilter} onChange={(e) => setRegionFilter(e.target.value)}>
            <option value="">All Regions</option>
            {regions.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <select style={inputStyle} value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
            <option value="">All Classifications</option>
            <option value="Priority Founding Steward Prospect">Priority Founding Steward</option>
            <option value="Strong Potential Prospect">Strong Potential</option>
            <option value="Monitor / Secondary Prospect">Monitor / Secondary</option>
            <option value="Not Currently Suitable">Not Currently Suitable</option>
          </select>
          <select style={inputStyle} value={stageFilter} onChange={(e) => setStageFilter(e.target.value)}>
            <option value="">All Stages</option>
            {["Identified","Profiled","Scored","Reviewed","Approved for Approach","Contacted","Meeting Proposed","Meeting Scheduled","Joined Circle","Not Suitable / Parked"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <div style={{ marginLeft: "auto", fontSize: 12, color: "#7B8EAA", display: "flex", alignItems: "center" }}>
            Showing <strong style={{ margin: "0 4px", color: "#E8EFF8" }}>{filtered.length}</strong> of {prospects.length} prospects
          </div>
        </div>

        <Panel>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["#", "Prospect", "Country", "Region", "Type", "Score", "Classification", "Stage", "Owner", "Pack", "Next Action"].map((h) => (
                  <th key={h} style={{ textAlign: "left", fontSize: 10, textTransform: "uppercase", letterSpacing: ".8px", color: "#4A5C70", padding: "0 8px 10px 0", borderBottom: "1px solid rgba(255,255,255,0.07)", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr key={p.id} style={{ cursor: "pointer" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ padding: "10px 8px 10px 0", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: 12, color: "#4A5C70" }}>{i + 1}</td>
                  <td style={{ padding: "10px 8px 10px 0", borderBottom: "1px solid rgba(255,255,255,0.06)", minWidth: 200 }}>
                    <div style={{ fontWeight: 600, color: "#E8EFF8", fontSize: 13 }}>{p.prospect_name}</div>
                    <div style={{ fontSize: 11, color: "#4A5C70" }}>{p.city} · {p.sector_interests.slice(0, 2).join(", ")}</div>
                  </td>
                  <td style={{ padding: "10px 8px 10px 0", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: 12, color: "#7B8EAA", whiteSpace: "nowrap" }}>{p.country}</td>
                  <td style={{ padding: "10px 8px 10px 0", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: 11, color: "#4A5C70", whiteSpace: "nowrap" }}>{p.region}</td>
                  <td style={{ padding: "10px 8px 10px 0", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: 11, color: "#7B8EAA", whiteSpace: "nowrap" }}>
                    {p.prospect_type.split("-").map(w => w[0].toUpperCase()).join("")}
                  </td>
                  <td style={{ padding: "10px 8px 10px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <ScoreBadge score={p.suitability_score} />
                  </td>
                  <td style={{ padding: "10px 8px 10px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <ClassificationBadge classification={p.classification} />
                  </td>
                  <td style={{ padding: "10px 8px 10px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <StageBadge stage={p.pipeline_stage} />
                  </td>
                  <td style={{ padding: "10px 8px 10px 0", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: 11, color: "#7B8EAA", whiteSpace: "nowrap" }}>{p.assigned_owner}</td>
                  <td style={{ padding: "10px 8px 10px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 6, background: p.briefing_pack_status === "Generated" ? "rgba(16,185,129,0.18)" : "rgba(255,255,255,0.06)", color: p.briefing_pack_status === "Generated" ? "#34D399" : "#4A5C70" }}>
                      {p.briefing_pack_status}
                    </span>
                  </td>
                  <td style={{ padding: "10px 8px 10px 0", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: 11, color: "#7B8EAA", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {p.next_action}
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
