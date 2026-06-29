"use client";

import { Topbar } from "@/components/layout/Topbar";
import { Panel } from "@/components/ui/Panel";
import { ScoreBadge, ClassificationBadge } from "@/components/ui/Badge";
import { mockProspects } from "@/lib/mock-data/prospects";

const shortlist = mockProspects
  .filter((p) => p.suitability_score >= 65)
  .sort((a, b) => b.suitability_score - a.suitability_score)
  .slice(0, 15);

const dimLabels = ["FO Fit /20", "Perm Cap /20", "Sector /20", "Gov /15", "TBP Adj /15", "Engage /10", "Total /100"];

function DimVal({ v, max }: { v: number; max: number }) {
  const pct = v / max;
  const style: React.CSSProperties =
    pct >= 0.8 ? { background: "rgba(16,185,129,0.1)", color: "#059669" }
    : pct >= 0.6 ? { background: "rgba(245,158,11,0.1)", color: "#D97706" }
    : { background: "rgba(239,68,68,0.1)", color: "#DC2626" };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 32, height: 24, borderRadius: 6, fontWeight: 700, fontSize: 12, ...style }}>
      {v}
    </span>
  );
}

export default function ShortlistPage() {
  const priorityCount = shortlist.filter((p) => p.classification === "Priority Founding Steward Prospect").length;
  const strongCount = shortlist.filter((p) => p.classification === "Strong Potential Prospect").length;
  const avg = Math.round(shortlist.reduce((s, p) => s + p.suitability_score, 0) / shortlist.length);

  return (
    <>
      <Topbar title="Scored Shortlist" subtitle={`Top ${shortlist.length} prospects by suitability score — ready for TBP Leadership review`} />
      <div style={{ padding: "24px 28px 40px" }}>

        {/* Summary row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 20 }}>
          {[
            { label: "Shortlisted Prospects", value: shortlist.length, color: "#C4992A" },
            { label: "Priority Founding Stewards", value: priorityCount, color: "#10B981" },
            { label: "Strong Potential", value: strongCount, color: "#F59E0B" },
            { label: "Average Score", value: `${avg}/100`, color: "#3B82F6" },
          ].map((c, i) => (
            <div key={i} style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, padding: "16px 20px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: c.color }} />
              <div style={{ fontSize: 26, fontWeight: 900, color: "#1A2B45", marginBottom: 4 }}>{c.value}</div>
              <div style={{ fontSize: 12, color: "#5A6B7F" }}>{c.label}</div>
            </div>
          ))}
        </div>

        <Panel title="TBP Suitability Scoring Matrix" subtitle="All shortlisted prospects scored across 6 dimensions · Sorted by total score">
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", fontSize: 10, textTransform: "uppercase", letterSpacing: ".7px", color: "#8899AA", padding: "6px 8px", borderBottom: "1px solid #E2E8F0" }}>Family Office</th>
                  {dimLabels.map((h) => (
                    <th key={h} style={{ textAlign: "center", fontSize: 10, textTransform: "uppercase", letterSpacing: ".7px", color: "#8899AA", padding: "6px 8px", borderBottom: "1px solid #E2E8F0", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                  <th style={{ textAlign: "left", fontSize: 10, textTransform: "uppercase", letterSpacing: ".7px", color: "#8899AA", padding: "6px 8px", borderBottom: "1px solid #E2E8F0" }}>Classification</th>
                  <th style={{ textAlign: "left", fontSize: 10, textTransform: "uppercase", letterSpacing: ".7px", color: "#8899AA", padding: "6px 8px", borderBottom: "1px solid #E2E8F0" }}>Region</th>
                </tr>
              </thead>
              <tbody>
                {shortlist.map((p, i) => {
                  const bd = p.scoring_breakdown;
                  return (
                    <tr key={p.id} style={{ background: i % 2 === 0 ? "transparent" : "#FAFBFC" }}>
                      <td style={{ padding: "8px 8px", borderBottom: "1px solid #E2E8F0" }}>
                        <div style={{ fontWeight: 600, color: "#1A2B45" }}>{p.prospect_name}</div>
                        <div style={{ fontSize: 10, color: "#8899AA" }}>{p.city}, {p.country}</div>
                      </td>
                      <td style={{ textAlign: "center", padding: "8px", borderBottom: "1px solid #E2E8F0" }}><DimVal v={bd.familyOfficeFit} max={20} /></td>
                      <td style={{ textAlign: "center", padding: "8px", borderBottom: "1px solid #E2E8F0" }}><DimVal v={bd.permanentCapitalOrientation} max={20} /></td>
                      <td style={{ textAlign: "center", padding: "8px", borderBottom: "1px solid #E2E8F0" }}><DimVal v={bd.sectorAlignment} max={20} /></td>
                      <td style={{ textAlign: "center", padding: "8px", borderBottom: "1px solid #E2E8F0" }}><DimVal v={bd.governanceInstitutionalMindset} max={15} /></td>
                      <td style={{ textAlign: "center", padding: "8px", borderBottom: "1px solid #E2E8F0" }}><DimVal v={bd.strategicAdjacencyTBP} max={15} /></td>
                      <td style={{ textAlign: "center", padding: "8px", borderBottom: "1px solid #E2E8F0" }}><DimVal v={bd.engagementReadiness} max={10} /></td>
                      <td style={{ textAlign: "center", padding: "8px", borderBottom: "1px solid #E2E8F0" }}><ScoreBadge score={p.suitability_score} /></td>
                      <td style={{ padding: "8px", borderBottom: "1px solid #E2E8F0" }}><ClassificationBadge classification={p.classification} /></td>
                      <td style={{ padding: "8px", borderBottom: "1px solid #E2E8F0", fontSize: 11, color: "#5A6B7F", whiteSpace: "nowrap" }}>{p.region}</td>
                    </tr>
                  );
                })}
                <tr style={{ background: "#F4F6FA", fontWeight: 700, fontSize: 11 }}>
                  <td style={{ padding: "8px" }}>Average (top {shortlist.length})</td>
                  {[
                    Math.round(shortlist.reduce((s, p) => s + p.scoring_breakdown.familyOfficeFit, 0) / shortlist.length),
                    Math.round(shortlist.reduce((s, p) => s + p.scoring_breakdown.permanentCapitalOrientation, 0) / shortlist.length),
                    Math.round(shortlist.reduce((s, p) => s + p.scoring_breakdown.sectorAlignment, 0) / shortlist.length),
                    Math.round(shortlist.reduce((s, p) => s + p.scoring_breakdown.governanceInstitutionalMindset, 0) / shortlist.length),
                    Math.round(shortlist.reduce((s, p) => s + p.scoring_breakdown.strategicAdjacencyTBP, 0) / shortlist.length),
                    Math.round(shortlist.reduce((s, p) => s + p.scoring_breakdown.engagementReadiness, 0) / shortlist.length),
                    avg,
                  ].map((v, i) => (
                    <td key={i} style={{ padding: "8px", textAlign: "center", color: "#1A2B45" }}>{v}</td>
                  ))}
                  <td colSpan={2} />
                </tr>
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </>
  );
}
