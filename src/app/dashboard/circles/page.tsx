"use client";

import { useState, Fragment } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { Panel } from "@/components/ui/Panel";
import { ScoreBadge, ClassificationBadge } from "@/components/ui/Badge";
import { useCircleProspects } from "@/lib/hooks/useSupabaseData";

export default function CirclesPage() {
  const { circleProspects, loading } = useCircleProspects();
  const [circleFilter, setCircleFilter] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const circles = Array.from(new Set(circleProspects.map((p) => p.circle))).sort();
  const countries = Array.from(new Set(circleProspects.map((p) => p.country))).sort();
  const priorities = Array.from(new Set(circleProspects.map((p) => p.priority))).sort();

  const filtered = circleProspects.filter((p) => {
    if (circleFilter && p.circle !== circleFilter) return false;
    if (countryFilter && p.country !== countryFilter) return false;
    if (priorityFilter && p.priority !== priorityFilter) return false;
    return true;
  });

  const inputStyle: React.CSSProperties = {
    padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(27,42,61,0.12)",
    fontSize: 12, color: "#1B2A3D", background: "#FFFFFF", outline: "none",
  };

  if (loading) return (
    <div style={{ padding: 28, color: "#756E5D", fontSize: 13 }}>Loading multi-circle prospects from database...</div>
  );

  return (
    <>
      <Topbar title="Multi-Circle Prospects" subtitle={`${circleProspects.length} prospects across ${circles.length} circles — Family Office, Angel Investor, Institutional/Sovereign, Strategic Operational Partner, Capital Advisory/Introducer`} />
      <div style={{ padding: "24px 28px 40px" }}>

        <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
          <select style={inputStyle} value={circleFilter} onChange={(e) => setCircleFilter(e.target.value)}>
            <option value="">All Circles</option>
            {circles.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select style={inputStyle} value={countryFilter} onChange={(e) => setCountryFilter(e.target.value)}>
            <option value="">All Countries</option>
            {countries.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select style={inputStyle} value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
            <option value="">All Priorities</option>
            {priorities.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <div style={{ marginLeft: "auto", fontSize: 12, color: "#756E5D", display: "flex", alignItems: "center" }}>
            Showing <strong style={{ margin: "0 4px", color: "#1B2A3D" }}>{filtered.length}</strong> of {circleProspects.length} prospects
          </div>
        </div>

        <Panel>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Prospect", "Circle", "Country", "Score", "Classification", "Sectors", "Contact"].map((h) => (
                  <th key={h} style={{ textAlign: "left", fontSize: 10, textTransform: "uppercase", letterSpacing: ".8px", color: "#5C5648", padding: "0 8px 10px 0", borderBottom: "1px solid rgba(27,42,61,0.07)", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const rowKey = `${p.id}::${p.circle}`;
                const expanded = expandedId === rowKey;
                return (
                  <Fragment key={rowKey}>
                    <tr style={{ cursor: "pointer" }}
                      onClick={() => setExpandedId(expanded ? null : rowKey)}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(27,42,61,0.04)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <td style={{ padding: "10px 8px 10px 0", borderBottom: "1px solid rgba(27,42,61,0.06)", minWidth: 200 }}>
                        <div style={{ fontWeight: 600, color: "#1B2A3D", fontSize: 13 }}>{p.prospect_name}</div>
                      </td>
                      <td style={{ padding: "10px 8px 10px 0", borderBottom: "1px solid rgba(27,42,61,0.06)", fontSize: 11, color: "#756E5D", whiteSpace: "nowrap" }}>{p.circle}</td>
                      <td style={{ padding: "10px 8px 10px 0", borderBottom: "1px solid rgba(27,42,61,0.06)", fontSize: 12, color: "#756E5D", whiteSpace: "nowrap" }}>{p.country}</td>
                      <td style={{ padding: "10px 8px 10px 0", borderBottom: "1px solid rgba(27,42,61,0.06)" }}>
                        <ScoreBadge score={Math.round(p.totalScore)} />
                      </td>
                      <td style={{ padding: "10px 8px 10px 0", borderBottom: "1px solid rgba(27,42,61,0.06)" }}>
                        <ClassificationBadge classification={p.classification} />
                      </td>
                      <td style={{ padding: "10px 8px 10px 0", borderBottom: "1px solid rgba(27,42,61,0.06)", fontSize: 11, color: "#5C5648", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {p.sectors.slice(0, 3).join(", ")}
                      </td>
                      <td style={{ padding: "10px 8px 10px 0", borderBottom: "1px solid rgba(27,42,61,0.06)" }}>
                        {p.email ? (
                          <a href={`mailto:${p.email}`}
                            style={{ fontSize: 11, color: "#756E5D", textDecoration: "none" }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {p.email}
                          </a>
                        ) : (
                          <span style={{ fontSize: 11, color: "#847D6C" }}>Needs Verification</span>
                        )}
                      </td>
                    </tr>
                    {expanded && (
                      <tr key={`${rowKey}-detail`}>
                        <td colSpan={7} style={{ padding: "6px 8px 18px 0", borderBottom: "1px solid rgba(27,42,61,0.06)" }}>
                          <div style={{ background: "#FFFFFF", borderRadius: 8, padding: "14px 16px", display: "grid", gap: 8 }}>
                            {p.categories.map((c) => (
                              <div key={c.categoryName} style={{ display: "flex", gap: 10, fontSize: 12 }}>
                                <div style={{ minWidth: 220, color: "#1B2A3D", fontWeight: 600 }}>
                                  {c.categoryName} ({c.score}/{c.maxPoints})
                                </div>
                                <div style={{ color: "#756E5D" }}>{c.explanation || "—"}</div>
                              </div>
                            ))}
                            {p.address && (
                              <div style={{ fontSize: 11, color: "#5C5648", marginTop: 4 }}>Address: {p.address}</div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </Panel>
      </div>
    </>
  );
}
