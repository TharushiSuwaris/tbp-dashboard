"use client";

import { Topbar } from "@/components/layout/Topbar";
import { Panel } from "@/components/ui/Panel";
import { ScoreBadge, ClassificationBadge, StageBadge } from "@/components/ui/Badge";
import { useProspects } from "@/lib/hooks/useSupabaseData";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";

const regionData = [
  { name: "Gulf", count: 5 },
  { name: "SE Asia", count: 6 },
  { name: "Europe", count: 5 },
  { name: "N America", count: 2 },
  { name: "S Asia", count: 2 },
  { name: "Africa", count: 3 },
  { name: "C Asia", count: 2 },
  { name: "Lat Am", count: 2 },
  { name: "E Asia", count: 1 },
  { name: "Channel", count: 2 },
];

const sectorData = [
  { name: "Trade", count: 22 },
  { name: "Infrastructure", count: 20 },
  { name: "Logistics", count: 18 },
  { name: "Energy", count: 15 },
  { name: "Ports", count: 12 },
  { name: "Maritime", count: 8 },
  { name: "Data Infra", count: 7 },
  { name: "Real Estate", count: 9 },
];

const funnelData = [
  { name: "Identified", value: 30, fill: "#3B82F6" },
  { name: "Profiled", value: 22, fill: "#6366F1" },
  { name: "Scored", value: 18, fill: "#8B5CF6" },
  { name: "Reviewed", value: 5, fill: "#EC4899" },
  { name: "Approved", value: 3, fill: "#F59E0B" },
  { name: "Contacted", value: 1, fill: "#10B981" },
];

const scoreDistribution = [
  { name: "80–100 Priority", count: 16, fill: "#10B981" },
  { name: "65–79 Strong", count: 8, fill: "#F59E0B" },
  { name: "50–64 Monitor", count: 4, fill: "#3B82F6" },
  { name: "Below 50", count: 2, fill: "#EF4444" },
];

const circumference = 2 * Math.PI * 56;
const tooltipStyle = { background: "#F1EDE1", border: "1px solid rgba(27,42,61,0.12)", borderRadius: 8, fontSize: 12, color: "#1B2A3D" };

export default function OverviewPage() {
  const { prospects, loading } = useProspects();

  const kpi = {
    totalProspects:          prospects.length,
    targetFoundingStewards:  20,
    foundingStewardsSecured: prospects.filter(p => p.pipeline_stage === "Joined Circle").length,
    priorityFoundingSteward: prospects.filter(p => p.classification === "Priority Founding Steward Prospect").length,
    strongPotential:         prospects.filter(p => p.classification === "Strong Potential Prospect").length,
    profiled:                prospects.filter(p => p.pipeline_stage !== "Identified").length,
    scored:                  prospects.filter(p => !["Identified", "Profiled"].includes(p.pipeline_stage)).length,
    briefingPacksGenerated:  prospects.filter(p => ["Generated", "Approved", "Sent"].includes(p.briefing_pack_status)).length,
    requiresDiligenceReview: prospects.filter(p => p.diligence_flags.length > 0).length,
    meetingOpportunities:    prospects.filter(p => ["Meeting Proposed", "Meeting Scheduled"].includes(p.pipeline_stage)).length,
  };

  const topProspects = prospects
    .filter((p) => p.classification === "Priority Founding Steward Prospect")
    .sort((a, b) => b.suitability_score - a.suitability_score)
    .slice(0, 5);

  const progressPct = kpi.targetFoundingStewards
    ? Math.round((kpi.foundingStewardsSecured / kpi.targetFoundingStewards) * 100)
    : 0;
  const dashOffset = circumference * (1 - progressPct / 100);

  if (loading) return (
    <div style={{ padding: 28, color: "#756E5D", fontSize: 13 }}>Loading dashboard data...</div>
  );

  return (
    <>
      <Topbar
        title="Intelligence Dashboard"
        subtitle="Family Office Circle · Protocol Establishment Round · Global Campaign Active"
      />
      <div style={{ padding: "24px 28px 40px" }}>

        {/* HERO BANNER */}
        <div
          style={{
            background: "linear-gradient(130deg,#F1EDE1 0%,#EFE8D9 60%,#EFE8D9 100%)",
            borderRadius: 16, padding: "28px 32px", marginBottom: 20,
            display: "flex", alignItems: "center", gap: 36,
            position: "relative", overflow: "hidden",
            border: "1px solid rgba(27,42,61,0.08)",
          }}
        >
          <div style={{ position: "absolute", top: -60, right: 180, width: 300, height: 300, background: "radial-gradient(circle,rgba(196,153,42,0.08) 0%,transparent 70%)", pointerEvents: "none" }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 2, color: "#C4992A", marginBottom: 8 }}>
              Founding Strategic Stewards Programme
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", marginBottom: 6 }}>
              Protocol Establishment Round — Global Pipeline Active
            </div>
            <div style={{ fontSize: 12, color: "#847D6C", maxWidth: 440, lineHeight: 1.7, marginBottom: 22 }}>
              {kpi.totalProspects} prospects identified across {regionData.length} regions. {kpi.priorityFoundingSteward} Priority Founding Steward candidates scored. Briefing pack generation is the critical next step before any external engagement begins.
            </div>
            <div style={{ display: "flex", gap: 28 }}>
              {[
                { n: kpi.totalProspects, l: "Identified" },
                { n: kpi.scored, l: "Scored" },
                { n: kpi.priorityFoundingSteward, l: "Priority Tier" },
                { n: kpi.foundingStewardsSecured, l: "Committed", gold: true },
              ].map((s, i) => (
                <div key={i}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: s.gold ? "#C4992A" : "#fff", lineHeight: 1 }}>{s.n}</div>
                  <div style={{ fontSize: 10, color: "#6B6455", textTransform: "uppercase", letterSpacing: ".8px", marginTop: 2 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <div style={{ position: "relative", width: 138, height: 138 }}>
              <svg width="138" height="138" viewBox="0 0 138 138" style={{ transform: "rotate(-90deg)" }}>
                <circle cx="69" cy="69" r="56" fill="none" stroke="rgba(27,42,61,0.07)" strokeWidth="12" />
                <circle cx="69" cy="69" r="56" fill="none" stroke="#C4992A" strokeWidth="12"
                  strokeDasharray={circumference} strokeDashoffset={dashOffset} strokeLinecap="round" />
              </svg>
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
                <div style={{ fontSize: 34, fontWeight: 900, color: "#fff", lineHeight: 1 }}>{kpi.foundingStewardsSecured}</div>
                <div style={{ fontSize: 12, color: "#6B6455", marginTop: 1 }}>of {kpi.targetFoundingStewards}</div>
              </div>
            </div>
            <div style={{ fontSize: 10, color: "#C4992A", textTransform: "uppercase", letterSpacing: "1.2px" }}>
              Global Target — {kpi.foundingStewardsSecured === 0 ? "Not Yet Secured" : "In Progress"}
            </div>
          </div>
        </div>

        {/* KPI CARDS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 14 }}>
          {[
            { icon: "🏛", value: kpi.totalProspects, label: "Total Prospects Discovered", trend: "↑ Across 10 global regions", color: "#C4992A", trendColor: "#34D399" },
            { icon: "⭐", value: kpi.priorityFoundingSteward, label: "Priority Founding Stewards", trend: `Score 80–100 · Target: ${kpi.targetFoundingStewards}`, color: "#10B981", trendColor: "#34D399" },
            { icon: "🎯", value: kpi.strongPotential, label: "Strong Potential Prospects", trend: "Score 65–79 · Nurture track", color: "#F59E0B", trendColor: "#FBBF24" },
            { icon: "📄", value: kpi.briefingPacksGenerated, label: "Briefing Packs Generated", trend: `⚠ ${kpi.priorityFoundingSteward - kpi.briefingPacksGenerated} packs needed`, color: "#EF4444", trendColor: "#F87171" },
            { icon: "🔬", value: kpi.profiled, label: "Prospects Profiled", trend: `${kpi.totalProspects - kpi.profiled} pending profiling`, color: "#6366F1", trendColor: "#756E5D" },
            { icon: "📊", value: kpi.scored, label: "Prospects Scored", trend: `${kpi.profiled - kpi.scored} awaiting scoring`, color: "#8B5CF6", trendColor: "#756E5D" },
            { icon: "⚠️", value: kpi.requiresDiligenceReview, label: "Require Diligence Review", trend: "Diligence flags raised", color: "#F59E0B", trendColor: "#FBBF24" },
            { icon: "🤝", value: kpi.meetingOpportunities, label: "Meeting Opportunities", trend: "Meetings proposed or scheduled", color: "#3B82F6", trendColor: "#60A5FA" },
          ].map((card, i) => (
            <div
              key={i}
              style={{
                background: "#F1EDE1", border: "1px solid rgba(27,42,61,0.07)", borderRadius: 12,
                padding: "18px 20px", position: "relative", overflow: "hidden",
              }}
            >
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: card.color }} />
              <div style={{ width: 38, height: 38, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, marginBottom: 12, background: `${card.color}20` }}>
                {card.icon}
              </div>
              <div style={{ fontSize: 28, fontWeight: 900, color: "#1B2A3D", lineHeight: 1, marginBottom: 3 }}>{card.value}</div>
              <div style={{ fontSize: 12, color: "#756E5D", marginBottom: 8 }}>{card.label}</div>
              <div style={{ fontSize: 11, color: card.trendColor }}>{card.trend}</div>
            </div>
          ))}
        </div>

        {/* ALERT */}
        <div
          style={{
            display: "flex", alignItems: "center", gap: 12,
            background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)",
            borderRadius: 12, padding: "14px 18px", marginBottom: 14,
          }}
        >
          <span style={{ fontSize: 20 }}>⚠️</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#FBBF24" }}>
              Pipeline Bottleneck — {kpi.priorityFoundingSteward} priority prospects scored but only {kpi.briefingPacksGenerated} briefing packs generated
            </div>
            <div style={{ fontSize: 12, color: "#D97706", marginTop: 2 }}>
              External engagement cannot begin until briefing packs are generated and reviewed. Generate packs for the highest-scoring Priority Founding Steward prospects first.
            </div>
          </div>
          <button
            style={{
              padding: "7px 14px", background: "#F59E0B", color: "#1B2A3D",
              border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700,
              cursor: "pointer", whiteSpace: "nowrap",
            }}
          >
            Generate Packs →
          </button>
        </div>

        {/* CHARTS ROW */}
        <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 14, marginBottom: 14 }}>
          <Panel title="Prospects by Region" subtitle="All identified prospects across global regions">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={regionData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#5C5648" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#5C5648" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(196,153,42,0.08)" }} />
                <Bar dataKey="count" fill="#C4992A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Panel>

          <Panel title="Suitability Tiers">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={scoreDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="count">
                  {scoreDistribution.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
              {scoreDistribution.map((d) => (
                <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: d.fill }} />
                  <span style={{ color: "#756E5D" }}>{d.name}: <strong style={{ color: "#1B2A3D" }}>{d.count}</strong></span>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        {/* PIPELINE FUNNEL + SECTOR */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
          <Panel title="Prospect Pipeline Funnel" subtitle="All prospects by stage">
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {funnelData.map((stage) => (
                <div key={stage.name} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 90, fontSize: 12, color: "#756E5D", flexShrink: 0 }}>{stage.name}</div>
                  <div style={{ flex: 1, height: 26, background: "rgba(27,42,61,0.05)", borderRadius: 6, overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%", borderRadius: 6,
                        width: `${Math.round((stage.value / 30) * 100)}%`,
                        background: stage.fill,
                        display: "flex", alignItems: "center", padding: "0 10px",
                        fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.9)",
                      }}
                    >
                      {stage.value}
                    </div>
                  </div>
                  <div style={{ width: 26, textAlign: "right", fontSize: 13, fontWeight: 700, color: "#1B2A3D" }}>{stage.value}</div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Prospects by Sector Focus" subtitle="Top sectors across identified prospects">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={sectorData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <XAxis type="number" tick={{ fontSize: 10, fill: "#5C5648" }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 11, fill: "#756E5D" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(196,153,42,0.08)" }} />
                <Bar dataKey="count" fill="#3B82F6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Panel>
        </div>

        {/* TOP PROSPECTS TABLE */}
        <Panel title="Priority Founding Steward Candidates" subtitle="Top 5 by suitability score — briefing packs required before outreach"
          action={<a href="/dashboard/shortlist" style={{ fontSize: 12, color: "#C4992A", cursor: "pointer", textDecoration: "none" }}>All prospects →</a>}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Family Office", "Region", "Type", "Score", "Classification", "Stage", "Pack"].map((h) => (
                  <th key={h} style={{ textAlign: "left", fontSize: 10, textTransform: "uppercase", letterSpacing: ".8px", color: "#5C5648", padding: "0 8px 10px 0", borderBottom: "1px solid rgba(27,42,61,0.07)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topProspects.map((p) => (
                <tr key={p.id}>
                  <td style={{ padding: "10px 8px 10px 0", borderBottom: "1px solid rgba(27,42,61,0.06)", verticalAlign: "middle" }}>
                    <div style={{ fontWeight: 600, color: "#1B2A3D", fontSize: 13 }}>{p.prospect_name}</div>
                    <div style={{ fontSize: 11, color: "#5C5648" }}>{p.city}, {p.country}</div>
                  </td>
                  <td style={{ padding: "10px 8px 10px 0", borderBottom: "1px solid rgba(27,42,61,0.06)", fontSize: 12, color: "#756E5D" }}>{p.region}</td>
                  <td style={{ padding: "10px 8px 10px 0", borderBottom: "1px solid rgba(27,42,61,0.06)" }}>
                    <span style={{ background: "rgba(59,130,246,0.18)", color: "#60A5FA", padding: "3px 9px", borderRadius: 20, fontSize: 10, fontWeight: 700 }}>
                      {p.prospect_type.split("-").map(w => w[0].toUpperCase() + w.slice(1)).join(" ").slice(0, 12)}
                    </span>
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
                  <td style={{ padding: "10px 8px 10px 0", borderBottom: "1px solid rgba(27,42,61,0.06)" }}>
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 4,
                      fontSize: 11, color: p.briefing_pack_status === "Generated" ? "#34D399" : "#5C5648",
                      background: p.briefing_pack_status === "Generated" ? "rgba(16,185,129,0.14)" : "rgba(27,42,61,0.05)",
                      border: `1px ${p.briefing_pack_status === "Generated" ? "solid rgba(16,185,129,0.25)" : "dashed rgba(27,42,61,0.1)"}`,
                      borderRadius: 6, padding: "2px 8px",
                    }}>
                      {p.briefing_pack_status === "Generated" ? "✅ Generated" : "📄 Needed"}
                    </span>
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
