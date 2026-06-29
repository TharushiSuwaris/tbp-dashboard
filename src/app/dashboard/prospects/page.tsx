"use client";

import { useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { Panel } from "@/components/ui/Panel";
import { ScoreBadge, ClassificationBadge, StageBadge } from "@/components/ui/Badge";
import { mockProspects } from "@/lib/mock-data/prospects";
import type { Region } from "@/types";

const regions: Region[] = ["North America", "United Kingdom & Europe", "Southeast Asia", "South Asia", "Central Asia", "Gulf & Middle East", "Africa", "East Asia", "Latin America"];

export default function ProspectsPage() {
  const [regionFilter, setRegionFilter] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [search, setSearch] = useState("");

  const filtered = mockProspects.filter((p) => {
    if (regionFilter && p.region !== regionFilter) return false;
    if (classFilter && p.classification !== classFilter) return false;
    if (stageFilter && p.pipeline_stage !== stageFilter) return false;
    if (search && !p.prospect_name.toLowerCase().includes(search.toLowerCase()) && !p.country.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }).sort((a, b) => b.suitability_score - a.suitability_score);

  const inputStyle: React.CSSProperties = {
    padding: "8px 12px", borderRadius: 8, border: "1px solid #E2E8F0",
    fontSize: 12, color: "#1A2B45", background: "#F4F6FA", outline: "none",
  };

  return (
    <>
      <Topbar title="Prospect Longlist" subtitle={`${mockProspects.length} prospects across all regions — sorted by suitability score`} />
      <div style={{ padding: "24px 28px 40px" }}>

        {/* Filters */}
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
          <div style={{ marginLeft: "auto", fontSize: 12, color: "#5A6B7F", display: "flex", alignItems: "center" }}>
            Showing <strong style={{ margin: "0 4px" }}>{filtered.length}</strong> of {mockProspects.length} prospects
          </div>
        </div>

        <Panel>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["#", "Prospect", "Country", "Region", "Type", "Score", "Classification", "Stage", "Owner", "Pack", "Next Action"].map((h) => (
                  <th key={h} style={{ textAlign: "left", fontSize: 10, textTransform: "uppercase", letterSpacing: ".8px", color: "#8899AA", padding: "0 8px 10px 0", borderBottom: "1px solid #E2E8F0", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr key={p.id} style={{ cursor: "pointer" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#F4F6FA")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ padding: "10px 8px 10px 0", borderBottom: "1px solid #E2E8F0", fontSize: 12, color: "#8899AA" }}>{i + 1}</td>
                  <td style={{ padding: "10px 8px 10px 0", borderBottom: "1px solid #E2E8F0", minWidth: 200 }}>
                    <div style={{ fontWeight: 600, color: "#1A2B45", fontSize: 13 }}>{p.prospect_name}</div>
                    <div style={{ fontSize: 11, color: "#8899AA" }}>{p.city} · {p.sector_interests.slice(0, 2).join(", ")}</div>
                  </td>
                  <td style={{ padding: "10px 8px 10px 0", borderBottom: "1px solid #E2E8F0", fontSize: 12, color: "#5A6B7F", whiteSpace: "nowrap" }}>{p.country}</td>
                  <td style={{ padding: "10px 8px 10px 0", borderBottom: "1px solid #E2E8F0", fontSize: 11, color: "#8899AA", whiteSpace: "nowrap" }}>{p.region}</td>
                  <td style={{ padding: "10px 8px 10px 0", borderBottom: "1px solid #E2E8F0", fontSize: 11, color: "#5A6B7F", whiteSpace: "nowrap" }}>
                    {p.prospect_type.split("-").map(w => w[0].toUpperCase()).join("")}
                  </td>
                  <td style={{ padding: "10px 8px 10px 0", borderBottom: "1px solid #E2E8F0" }}>
                    <ScoreBadge score={p.suitability_score} />
                  </td>
                  <td style={{ padding: "10px 8px 10px 0", borderBottom: "1px solid #E2E8F0" }}>
                    <ClassificationBadge classification={p.classification} />
                  </td>
                  <td style={{ padding: "10px 8px 10px 0", borderBottom: "1px solid #E2E8F0" }}>
                    <StageBadge stage={p.pipeline_stage} />
                  </td>
                  <td style={{ padding: "10px 8px 10px 0", borderBottom: "1px solid #E2E8F0", fontSize: 11, color: "#5A6B7F", whiteSpace: "nowrap" }}>{p.assigned_owner}</td>
                  <td style={{ padding: "10px 8px 10px 0", borderBottom: "1px solid #E2E8F0" }}>
                    <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 6, background: p.briefing_pack_status === "Generated" ? "rgba(16,185,129,0.1)" : "rgba(0,0,0,0.04)", color: p.briefing_pack_status === "Generated" ? "#059669" : "#8899AA" }}>
                      {p.briefing_pack_status}
                    </span>
                  </td>
                  <td style={{ padding: "10px 8px 10px 0", borderBottom: "1px solid #E2E8F0", fontSize: 11, color: "#5A6B7F", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
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
