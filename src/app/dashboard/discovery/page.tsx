"use client";

import { useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { Panel } from "@/components/ui/Panel";
import { ScoreBadge, ClassificationBadge } from "@/components/ui/Badge";
import { runProspectDiscovery } from "@/lib/ai/discovery";
import type { Prospect, DiscoverySearchParams } from "@/types";

const regions = ["North America", "United Kingdom & Europe", "Southeast Asia", "South Asia", "Central Asia", "Gulf & Middle East", "Africa", "East Asia", "Latin America"];
const categories = ["Single-family office", "Multi-family office", "Family-controlled investment company", "Family holding company", "Founder-led conglomerate", "Private investment group", "HNWI investment entity", "Permanent-capital private group", "Strategic private capital group", "Private bank family office desk", "Adviser / introducer channel"];
const sectors = ["Trade", "Logistics", "Ports", "Maritime", "Energy", "Infrastructure", "Real Estate", "Data Infrastructure", "Technology", "Manufacturing", "Food / Agribusiness", "Healthcare", "Financial Services", "Emerging Markets", "Industrial Platforms"];
const depths = ["Quick", "Standard", "Deep"] as const;

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "9px 12px", borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.12)", fontSize: 13, color: "#E8EFF8",
  background: "#0A1624", outline: "none",
};

const labelStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 600, color: "#4A5C70",
  textTransform: "uppercase", letterSpacing: ".8px", marginBottom: 6, display: "block",
};

export default function DiscoveryPage() {
  const [params, setParams] = useState<DiscoverySearchParams>({});
  const [results, setResults] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  function set(key: keyof DiscoverySearchParams, value: string | number) {
    setParams((prev) => ({ ...prev, [key]: value || undefined }));
  }

  async function handleSearch() {
    setLoading(true);
    setSearched(false);
    const res = await runProspectDiscovery(params);
    setResults(res);
    setLoading(false);
    setSearched(true);
  }

  function handleClear() {
    setParams({});
    setResults([]);
    setSearched(false);
  }

  return (
    <>
      <Topbar title="Global Prospect Discovery" subtitle="Search and identify family offices and private capital groups globally" />
      <div style={{ padding: "24px 28px 40px" }}>

        <div style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 12, padding: "12px 18px", marginBottom: 20, fontSize: 12, color: "#93C5FD" }}>
          ℹ️ <strong>Mock Discovery Mode.</strong> This search uses structured mock data. In production, connect <code>runProspectDiscovery()</code> to Tavily, Brave Search, SerpAPI or approved internal databases. All results are from publicly sourced and ethically compiled data only.
        </div>

        <Panel title="Discovery Search Parameters" subtitle="Configure your search to identify aligned prospects globally" style={{ marginBottom: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
            <div>
              <label style={labelStyle}>Region</label>
              <select style={inputStyle} value={params.region ?? ""} onChange={(e) => set("region", e.target.value)}>
                <option value="">All Regions</option>
                {regions.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Country</label>
              <input style={inputStyle} placeholder="e.g. Singapore, UAE..." value={params.country ?? ""} onChange={(e) => set("country", e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>City</label>
              <input style={inputStyle} placeholder="e.g. London, Dubai..." value={params.city ?? ""} onChange={(e) => set("city", e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Prospect Category</label>
              <select style={inputStyle} value={params.prospectCategory ?? ""} onChange={(e) => set("prospectCategory", e.target.value)}>
                <option value="">All Categories</option>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Sector Focus</label>
              <select style={inputStyle} value={params.sectorFocus ?? ""} onChange={(e) => set("sectorFocus", e.target.value)}>
                <option value="">All Sectors</option>
                {sectors.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Minimum Suitability Score</label>
              <select style={inputStyle} value={params.minimumSuitabilityScore ?? ""} onChange={(e) => set("minimumSuitabilityScore", Number(e.target.value))}>
                <option value="">No Minimum</option>
                <option value={80}>80+ (Priority Tier)</option>
                <option value={65}>65+ (Strong Potential)</option>
                <option value={50}>50+ (Monitor)</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Search Depth</label>
              <select style={inputStyle} value={params.searchDepth ?? "Standard"} onChange={(e) => set("searchDepth", e.target.value)}>
                {depths.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <button
              onClick={handleSearch}
              disabled={loading}
              style={{
                background: "#C4992A", color: "#0C1929",
                fontWeight: 700, fontSize: 13, padding: "10px 24px",
                borderRadius: 8, border: "none", cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Searching..." : "🔍 Run Discovery Search"}
            </button>
            <button
              onClick={handleClear}
              style={{
                background: "rgba(255,255,255,0.06)", color: "#7B8EAA",
                fontWeight: 600, fontSize: 13, padding: "10px 20px",
                borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer",
              }}
            >
              Clear
            </button>
          </div>
        </Panel>

        {loading && (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#7B8EAA", fontSize: 13 }}>
            🔍 Running discovery search across global databases...
          </div>
        )}

        {searched && !loading && (
          <Panel
            title={`Discovery Results — ${results.length} prospect${results.length !== 1 ? "s" : ""} found`}
            subtitle="Results from mock database. Connect real APIs to expand coverage."
          >
            {results.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: "#4A5C70", fontSize: 13 }}>
                No prospects found matching your search criteria. Try broadening your filters.
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["Prospect", "Country", "Type", "Score", "Classification", "Best Entry Point", "Action"].map((h) => (
                      <th key={h} style={{ textAlign: "left", fontSize: 10, textTransform: "uppercase", letterSpacing: ".8px", color: "#4A5C70", padding: "0 8px 10px 0", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.map((p) => (
                    <tr key={p.id}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <td style={{ padding: "10px 8px 10px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                        <div style={{ fontWeight: 600, color: "#E8EFF8", fontSize: 13 }}>{p.prospect_name}</div>
                        <div style={{ fontSize: 11, color: "#4A5C70" }}>{p.city}</div>
                      </td>
                      <td style={{ padding: "10px 8px 10px 0", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: 12, color: "#7B8EAA" }}>{p.country}</td>
                      <td style={{ padding: "10px 8px 10px 0", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: 11, color: "#7B8EAA" }}>
                        {p.prospect_type.split("-").slice(0, 2).join(" ")}
                      </td>
                      <td style={{ padding: "10px 8px 10px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                        <ScoreBadge score={p.suitability_score} />
                      </td>
                      <td style={{ padding: "10px 8px 10px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                        <ClassificationBadge classification={p.classification} />
                      </td>
                      <td style={{ padding: "10px 8px 10px 0", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: 11, color: "#7B8EAA", maxWidth: 180 }}>
                        {p.best_tbp_entry_point}
                      </td>
                      <td style={{ padding: "10px 8px 10px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                        <button style={{ padding: "5px 11px", borderRadius: 7, fontSize: 11, fontWeight: 600, cursor: "pointer", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.06)", color: "#7B8EAA" }}>
                          Add to Longlist
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Panel>
        )}

        {!searched && !loading && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#4A5C70", fontSize: 13 }}>
            Configure your search parameters above and run a discovery search to identify aligned prospects.
          </div>
        )}
      </div>
    </>
  );
}
