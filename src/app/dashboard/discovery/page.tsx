"use client";

import { Fragment, useRef, useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { Panel } from "@/components/ui/Panel";
import { ScoreBadge, ClassificationBadge } from "@/components/ui/Badge";
import { CIRCLES, CIRCLE_KEYS } from "@/lib/ai/circles";
import type { DiscoveredProspect } from "@/lib/ai/live-search";
import type { ScoredProspect } from "@/lib/ai/live-scoring";

const SECONDS_BETWEEN_CALLS = 13; // matches discovery/score_*.py - Gemini free tier: 5 requests/minute

type RowState = { status: "pending" } | { status: "scoring" } | { status: "done"; result: ScoredProspect } | { status: "error"; message: string };

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "9px 12px", borderRadius: 8,
  border: "1px solid rgba(27,42,61,0.12)", fontSize: 13, color: "#1B2A3D",
  background: "#FFFFFF", outline: "none",
};

const labelStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 600, color: "#5C5648",
  textTransform: "uppercase", letterSpacing: ".8px", marginBottom: 6, display: "block",
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export default function DiscoveryPage() {
  const [circleKey, setCircleKey] = useState("family-office");
  const [country, setCountry] = useState("");
  const [maxResults, setMaxResults] = useState(5);

  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [prospects, setProspects] = useState<DiscoveredProspect[]>([]);
  const [rows, setRows] = useState<RowState[]>([]);
  const [scoringActive, setScoringActive] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const cancelRef = useRef(false);

  const circle = CIRCLES[circleKey];

  async function handleSearch() {
    if (!country.trim()) return;
    cancelRef.current = false;
    setSearching(true);
    setSearchError(null);
    setProspects([]);
    setRows([]);
    setScoringActive(false);

    // Fire-and-forget: gives a cold Render embedding-service instance a head start waking up
    // while the search call (which takes ~20-30s on its own) is still running.
    fetch("/api/discovery/warm").catch(() => {});

    try {
      const res = await fetch("/api/discovery/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ circle: circleKey, country: country.trim(), maxResults }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Search failed");

      const found: DiscoveredProspect[] = data.prospects ?? [];
      setProspects(found);
      setRows(found.map(() => ({ status: "pending" })));
      setSearching(false);

      if (found.length > 0) runScoringSequence(found);
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : "Search failed");
      setSearching(false);
    }
  }

  async function runScoringSequence(found: DiscoveredProspect[]) {
    setScoringActive(true);
    for (let i = 0; i < found.length; i++) {
      if (cancelRef.current) break;
      if (i > 0) await sleep(SECONDS_BETWEEN_CALLS * 1000);
      if (cancelRef.current) break;

      setRows((prev) => prev.map((r, idx) => (idx === i ? { status: "scoring" } : r)));
      try {
        const res = await fetch("/api/discovery/score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ circle: circleKey, country: country.trim(), prospect: found[i] }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Scoring failed");
        setRows((prev) => prev.map((r, idx) => (idx === i ? { status: "done", result: data } : r)));
      } catch (err) {
        setRows((prev) =>
          prev.map((r, idx) => (idx === i ? { status: "error", message: err instanceof Error ? err.message : "Scoring failed" } : r))
        );
      }
    }
    setScoringActive(false);
  }

  function handleCancel() {
    cancelRef.current = true;
    setScoringActive(false);
  }

  function handleExportCsv() {
    const scoreLabels = [...circle.tierCategories.map((c) => c.label), ...circle.similarityCategories.map((c) => c.label)];
    const headers = ["Circle", "Country", "Name", "Description", "Sectors", "Email", "Email Status", "Location", "Source URLs", ...scoreLabels, "Total Score", "Classification", "Priority"];

    const lines = [headers.map(csvEscape).join(",")];
    prospects.forEach((p, i) => {
      const row = rows[i];
      const scored = row?.status === "done" ? row.result : null;
      const scoreValues = scored
        ? [...scored.tierCategories.map((c) => String(c.points)), ...scored.similarityCategories.map((c) => String(c.score))]
        : scoreLabels.map(() => "");
      const cells = [
        circle.label,
        country,
        p.name,
        p.brief_description,
        (p.sectors ?? []).join("; "),
        p.email ?? "",
        p.email_status,
        p.location,
        (p.source_urls ?? []).map((s) => s.url).join("; "),
        ...scoreValues,
        scored ? String(scored.totalScore) : "",
        scored ? scored.classification : "",
        scored ? scored.priority : "",
      ];
      lines.push(cells.map((c) => csvEscape(String(c))).join(","));
    });

    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${circleKey}_${country.trim().toLowerCase().replace(/\s+/g, "_")}_live_discovery.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const doneCount = rows.filter((r) => r.status === "done" || r.status === "error").length;

  return (
    <>
      <Topbar title="Global Prospect Discovery" subtitle="Live web search and AI scoring across all 5 circles" />
      <div style={{ padding: "24px 28px 40px" }}>

        <div style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 12, padding: "12px 18px", marginBottom: 20, fontSize: 12, color: "#6EE7B7" }}>
          🔴 <strong>Live Discovery Mode.</strong> Runs a real Gemini web search and scores each result with the same tier-judgment + SBERT similarity pipeline as the batch scoring scripts. Nothing here is written to the database — results exist only in this browser session. Use <strong>Download CSV</strong> below to save them. Scoring is paced ~{SECONDS_BETWEEN_CALLS}s per prospect to respect Gemini&apos;s free-tier rate limit, and shares the same daily quota as the batch scripts — keep result counts small while testing.
        </div>

        <Panel title="Live Search Parameters" subtitle="Runs discovery/discover.py's search logic natively, then scores each result live" style={{ marginBottom: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
            <div>
              <label style={labelStyle}>Circle</label>
              <select style={inputStyle} value={circleKey} onChange={(e) => setCircleKey(e.target.value)}>
                {CIRCLE_KEYS.map((k) => <option key={k} value={k}>{CIRCLES[k].label}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Country</label>
              <input style={inputStyle} placeholder="e.g. Switzerland, UAE..." value={country} onChange={(e) => setCountry(e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Max Results</label>
              <select style={inputStyle} value={maxResults} onChange={(e) => setMaxResults(Number(e.target.value))}>
                {[3, 5, 8, 12].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 20, alignItems: "center" }}>
            <button
              onClick={handleSearch}
              disabled={searching || scoringActive || !country.trim()}
              style={{
                background: "#C4992A", color: "#1B2A3D",
                fontWeight: 700, fontSize: 13, padding: "10px 24px",
                borderRadius: 8, border: "none", cursor: searching || scoringActive || !country.trim() ? "not-allowed" : "pointer",
                opacity: searching || scoringActive || !country.trim() ? 0.7 : 1,
              }}
            >
              {searching ? "Searching..." : "🔍 Run Live Discovery"}
            </button>
            {scoringActive && (
              <button
                onClick={handleCancel}
                style={{ background: "rgba(239,68,68,0.15)", color: "#F87171", fontWeight: 600, fontSize: 13, padding: "10px 20px", borderRadius: 8, border: "1px solid rgba(239,68,68,0.3)", cursor: "pointer" }}
              >
                Cancel Remaining
              </button>
            )}
            {prospects.length > 0 && (
              <button
                onClick={handleExportCsv}
                style={{ background: "rgba(27,42,61,0.06)", color: "#756E5D", fontWeight: 600, fontSize: 13, padding: "10px 20px", borderRadius: 8, border: "1px solid rgba(27,42,61,0.1)", cursor: "pointer" }}
              >
                ⬇ Download CSV
              </button>
            )}
            {searchError && <span style={{ color: "#F87171", fontSize: 12 }}>{searchError}</span>}
          </div>
        </Panel>

        {searching && (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#756E5D", fontSize: 13 }}>
            🔍 Searching the web for {circle.label} prospects in {country}...
          </div>
        )}

        {prospects.length > 0 && (
          <Panel
            title={`Live Results — ${prospects.length} prospect${prospects.length !== 1 ? "s" : ""} found`}
            subtitle={scoringActive ? `Scoring ${doneCount}/${prospects.length}... next call in up to ${SECONDS_BETWEEN_CALLS}s (Gemini rate limit)` : `${doneCount}/${prospects.length} scored`}
          >
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Prospect", "Sectors", "Score", "Classification", "Email", "Status"].map((h) => (
                    <th key={h} style={{ textAlign: "left", fontSize: 10, textTransform: "uppercase", letterSpacing: ".8px", color: "#5C5648", padding: "0 8px 10px 0", borderBottom: "1px solid rgba(27,42,61,0.07)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {prospects.map((p, i) => {
                  const row = rows[i];
                  const expanded = expandedIndex === i;
                  const clickable = row?.status === "done";
                  return (
                    <Fragment key={i}>
                      <tr
                        onClick={() => clickable && setExpandedIndex(expanded ? null : i)}
                        style={{ cursor: clickable ? "pointer" : "default" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(27,42,61,0.04)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <td style={{ padding: "10px 8px 10px 0", borderBottom: "1px solid rgba(27,42,61,0.06)", minWidth: 200 }}>
                          <div style={{ fontWeight: 600, color: "#1B2A3D", fontSize: 13 }}>{p.name}</div>
                          <div style={{ fontSize: 11, color: "#5C5648", maxWidth: 320 }}>{p.brief_description}</div>
                        </td>
                        <td style={{ padding: "10px 8px 10px 0", borderBottom: "1px solid rgba(27,42,61,0.06)", fontSize: 11, color: "#756E5D", maxWidth: 180 }}>
                          {(p.sectors ?? []).slice(0, 3).join(", ")}
                        </td>
                        <td style={{ padding: "10px 8px 10px 0", borderBottom: "1px solid rgba(27,42,61,0.06)" }}>
                          {row?.status === "done" ? <ScoreBadge score={Math.round(row.result.totalScore)} /> : <span style={{ fontSize: 11, color: "#5C5648" }}>—</span>}
                        </td>
                        <td style={{ padding: "10px 8px 10px 0", borderBottom: "1px solid rgba(27,42,61,0.06)" }}>
                          {row?.status === "done" ? <ClassificationBadge classification={row.result.classification} /> : <span style={{ fontSize: 11, color: "#5C5648" }}>—</span>}
                        </td>
                        <td style={{ padding: "10px 8px 10px 0", borderBottom: "1px solid rgba(27,42,61,0.06)", fontSize: 11 }}>
                          {p.email ? <a href={`mailto:${p.email}`} style={{ color: "#756E5D" }} onClick={(e) => e.stopPropagation()}>{p.email}</a> : <span style={{ color: "#847D6C" }}>Needs Verification</span>}
                        </td>
                        <td style={{ padding: "10px 8px 10px 0", borderBottom: "1px solid rgba(27,42,61,0.06)", fontSize: 11 }}>
                          {row?.status === "pending" && <span style={{ color: "#5C5648" }}>Queued</span>}
                          {row?.status === "scoring" && <span style={{ color: "#FBBF24" }}>Scoring...</span>}
                          {row?.status === "done" && <span style={{ color: "#34D399" }}>Scored ▾</span>}
                          {row?.status === "error" && <span style={{ color: "#F87171" }} title={row.message}>Failed</span>}
                        </td>
                      </tr>
                      {expanded && row?.status === "done" && (
                        <tr>
                          <td colSpan={6} style={{ padding: "6px 8px 18px 0", borderBottom: "1px solid rgba(27,42,61,0.06)" }}>
                            <div style={{ background: "#FFFFFF", borderRadius: 8, padding: "14px 16px", display: "grid", gap: 8 }}>
                              {row.result.tierCategories.map((c) => (
                                <div key={c.key} style={{ display: "flex", gap: 10, fontSize: 12 }}>
                                  <div style={{ minWidth: 260, color: "#1B2A3D", fontWeight: 600 }}>{c.label} ({c.points}/{c.maxPoints})</div>
                                  <div style={{ color: "#756E5D" }}>{c.tier} — {c.reason}</div>
                                </div>
                              ))}
                              {row.result.similarityCategories.map((c) => (
                                <div key={c.key} style={{ display: "flex", gap: 10, fontSize: 12 }}>
                                  <div style={{ minWidth: 260, color: "#1B2A3D", fontWeight: 600 }}>{c.label} ({c.score}/{c.maxPoints})</div>
                                  <div style={{ color: "#756E5D" }}>cosine similarity {c.cosine.toFixed(4)}</div>
                                </div>
                              ))}
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
        )}

        {!searching && prospects.length === 0 && !searchError && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#5C5648", fontSize: 13 }}>
            Pick a circle and country above and run a live discovery search.
          </div>
        )}
      </div>
    </>
  );
}
