"use client";

import { Topbar } from "@/components/layout/Topbar";
import { Panel } from "@/components/ui/Panel";
import { mockProspects } from "@/lib/mock-data/prospects";
import type { Region } from "@/types";

const REGIONS: { key: Region; label: string; emoji: string; color: string }[] = [
  { key: "North America" as Region, label: "North America", emoji: "🇺🇸", color: "#3B82F6" },
  { key: "United Kingdom & Europe" as Region, label: "UK & Europe", emoji: "🇬🇧", color: "#8B5CF6" },
  { key: "Southeast Asia" as Region, label: "Southeast Asia", emoji: "🌏", color: "#10B981" },
  { key: "South Asia" as Region, label: "South Asia", emoji: "🌏", color: "#F59E0B" },
  { key: "Gulf & Middle East" as Region, label: "Gulf & Middle East", emoji: "🌍", color: "#EF4444" },
  { key: "Africa" as Region, label: "Africa", emoji: "🌍", color: "#F97316" },
  { key: "Central Asia" as Region, label: "Central Asia", emoji: "🌍", color: "#EC4899" },
  { key: "East Asia" as Region, label: "East Asia", emoji: "🌏", color: "#06B6D4" },
  { key: "Latin America" as Region, label: "Latin America", emoji: "🌎", color: "#84CC16" },
];

export default function RegionalMappingPage() {
  const byRegion = (region: Region) => mockProspects.filter((p) => p.region === region);
  const avgScore = (region: Region) => {
    const ps = byRegion(region);
    if (!ps.length) return 0;
    return Math.round(ps.reduce((a, b) => a + b.suitability_score, 0) / ps.length);
  };

  return (
    <>
      <Topbar title="Regional Mapping" subtitle="Global prospect distribution across TBP target geographies — 30 prospects tracked" />
      <div style={{ padding: "24px 28px 40px" }}>

        {/* Global summary row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12, marginBottom: 20 }}>
          {[
            { label: "Total Prospects", value: mockProspects.length, color: "#C4992A" },
            { label: "Regions Covered", value: REGIONS.filter(r => byRegion(r.key).length > 0).length, color: "#3B82F6" },
            { label: "Priority Prospects", value: mockProspects.filter(p => p.classification === "Priority Founding Steward Prospect").length, color: "#10B981" },
            { label: "Avg Suitability", value: Math.round(mockProspects.reduce((a, b) => a + b.suitability_score, 0) / mockProspects.length), color: "#8B5CF6" },
            { label: "Joined Circle", value: mockProspects.filter(p => p.pipeline_stage === "Joined Circle").length, color: "#059669" },
          ].map((c, i) => (
            <div key={i} style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 10, padding: "14px 16px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: c.color }} />
              <div style={{ fontSize: 26, fontWeight: 900, color: "#1A2B45" }}>{c.value}</div>
              <div style={{ fontSize: 11, color: "#5A6B7F" }}>{c.label}</div>
            </div>
          ))}
        </div>

        {/* Region grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 14 }}>
          {REGIONS.map(({ key, label, emoji, color }) => {
            const prospects = byRegion(key);
            const priority = prospects.filter(p => p.classification === "Priority Founding Steward Prospect");
            const strong = prospects.filter(p => p.classification === "Strong Potential Prospect");
            if (prospects.length === 0) return null;
            return (
              <Panel
                key={key}
                title={`${emoji} ${label}`}
                subtitle={`${prospects.length} prospect${prospects.length !== 1 ? "s" : ""} · Avg score ${avgScore(key)}`}
                style={{ borderTop: `3px solid ${color}` }}
              >
                {/* Bar */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ height: 8, background: "#F4F6FA", borderRadius: 4, overflow: "hidden", display: "flex" }}>
                    <div style={{ width: `${(priority.length / prospects.length) * 100}%`, background: "#10B981" }} />
                    <div style={{ width: `${(strong.length / prospects.length) * 100}%`, background: "#F59E0B" }} />
                    <div style={{ flex: 1, background: "#E2E8F0" }} />
                  </div>
                  <div style={{ display: "flex", gap: 12, marginTop: 6, fontSize: 10, color: "#5A6B7F" }}>
                    <span><span style={{ color: "#10B981", fontWeight: 700 }}>{priority.length}</span> Priority</span>
                    <span><span style={{ color: "#F59E0B", fontWeight: 700 }}>{strong.length}</span> Strong</span>
                    <span><span style={{ color: "#8899AA", fontWeight: 700 }}>{prospects.length - priority.length - strong.length}</span> Monitor/Other</span>
                  </div>
                </div>

                {/* Prospect list */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {prospects.slice(0, 4).map((p) => (
                    <div key={p.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 10px", background: "#F4F6FA", borderRadius: 6 }}>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "#1A2B45" }}>{p.prospect_name}</div>
                        <div style={{ fontSize: 10, color: "#8899AA" }}>{p.city} · {p.pipeline_stage}</div>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 900, color: p.suitability_score >= 80 ? "#059669" : p.suitability_score >= 65 ? "#D97706" : "#5A6B7F" }}>
                        {p.suitability_score}
                      </div>
                    </div>
                  ))}
                  {prospects.length > 4 && (
                    <div style={{ textAlign: "center", fontSize: 11, color: "#8899AA", padding: "4px 0" }}>
                      +{prospects.length - 4} more
                    </div>
                  )}
                </div>
              </Panel>
            );
          })}
        </div>
      </div>
    </>
  );
}
