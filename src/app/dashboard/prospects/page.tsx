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
    padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(27,42,61,0.12)",
    fontSize: 12, color: "#1B2A3D", background: "#FFFFFF", outline: "none",
  };

  if (loading) return (
    <div style={{ padding: 28, color: "#756E5D", fontSize: 13 }}>Loading prospects from database...</div>
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
          <div style={{ marginLeft: "auto", fontSize: 12, color: "#756E5D", display: "flex", alignItems: "center" }}>
            Showing <strong style={{ margin: "0 4px", color: "#1B2A3D" }}>{filtered.length}</strong> of {prospects.length} prospects
          </div>
        </div>

        <Panel>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["#", "Prospect", "Country / Location", "Region", "Type", "Score", "Classification", "Stage", "Owner", "Pack", "Email", "Next Action"].map((h) => (
                  <th key={h} style={{ textAlign: "left", fontSize: 10, textTransform: "uppercase", letterSpacing: ".8px", color: "#5C5648", padding: "0 8px 10px 0", borderBottom: "1px solid rgba(27,42,61,0.07)", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr key={p.id} style={{ cursor: "pointer" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(27,42,61,0.04)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ padding: "10px 8px 10px 0", borderBottom: "1px solid rgba(27,42,61,0.06)", fontSize: 12, color: "#5C5648" }}>{i + 1}</td>
                  <td style={{ padding: "10px 8px 10px 0", borderBottom: "1px solid rgba(27,42,61,0.06)", minWidth: 200 }}>
                    <div style={{ fontWeight: 600, color: "#1B2A3D", fontSize: 13 }}>{p.prospect_name}</div>
                    <div style={{ fontSize: 11, color: "#5C5648" }}>{p.city} · {p.sector_interests.slice(0, 2).join(", ")}</div>
                  </td>
                  <td style={{ padding: "10px 8px 10px 0", borderBottom: "1px solid rgba(27,42,61,0.06)", minWidth: 120 }}>
                    <div style={{ fontSize: 12, color: "#756E5D" }}>{p.country}</div>
                    {p.address && <div style={{ fontSize: 10, color: "#5C5648", marginTop: 2 }}>{p.address}</div>}
                  </td>
                  <td style={{ padding: "10px 8px 10px 0", borderBottom: "1px solid rgba(27,42,61,0.06)", fontSize: 11, color: "#5C5648", whiteSpace: "nowrap" }}>{p.region}</td>
                  <td style={{ padding: "10px 8px 10px 0", borderBottom: "1px solid rgba(27,42,61,0.06)", fontSize: 11, color: "#756E5D", whiteSpace: "nowrap" }}>
                    {p.prospect_type.split("-").map(w => w[0].toUpperCase()).join("")}
                  </td>
                  <td style={{ padding: "10px 8px 10px 0", borderBottom: "1px solid rgba(27,42,61,0.06)" }}>
                    <ScoreBadge score={p.suitability_score} />
                  </td>
                  <td style={{ padding: "10px 8px 10px 0", borderBottom: "1px solid rgba(27,42,61,0.06)" }}>
                    <ClassificationBadge classification={p.classification} />
                  </td>
                  <td style={{ padding: "10px 8px 10px 0", borderBottom: "1px solid rgba(27,42,61,0.06)" }}>
                    <StageBadge stage={p.pipeline_stage} />
                  </td>
                  <td style={{ padding: "10px 8px 10px 0", borderBottom: "1px solid rgba(27,42,61,0.06)", fontSize: 11, color: "#756E5D", whiteSpace: "nowrap" }}>{p.assigned_owner}</td>
                  <td style={{ padding: "10px 8px 10px 0", borderBottom: "1px solid rgba(27,42,61,0.06)" }}>
                    <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 6, background: p.briefing_pack_status === "Generated" ? "rgba(16,185,129,0.18)" : "rgba(27,42,61,0.06)", color: p.briefing_pack_status === "Generated" ? "#34D399" : "#5C5648" }}>
                      {p.briefing_pack_status}
                    </span>
                  </td>
                  <td style={{ padding: "10px 8px 10px 0", borderBottom: "1px solid rgba(27,42,61,0.06)", minWidth: 180 }}>
                    {p.email ? (
                      <a href={`mailto:${p.email.split(";")[0].trim()}`}
                        style={{ fontSize: 11, color: "#756E5D", textDecoration: "none", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 200 }}
                        onClick={(e) => e.stopPropagation()}
                        title={p.email}
                      >
                        {p.email.split(";")[0].trim()}
                      </a>
                    ) : (
                      <span style={{ fontSize: 11, color: "#847D6C" }}>—</span>
                    )}
                  </td>
                  <td style={{ padding: "10px 8px 10px 0", borderBottom: "1px solid rgba(27,42,61,0.06)", fontSize: 11, color: "#756E5D", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
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
