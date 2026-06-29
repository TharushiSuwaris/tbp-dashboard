"use client";

import { useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { Panel } from "@/components/ui/Panel";
import { checkGovernanceLanguage, APPROVED_LANGUAGE, REQUIRED_DISCLAIMER } from "@/lib/ai/governance";
import type { GovernanceCheckResult } from "@/types";

const SAMPLE_TEXT = `We are pleased to offer guaranteed allocation to Founding Strategic Stewards who pay the access fee before end of Q3. As a steward you will receive guaranteed returns and exclusive entitlement to control rights over the infrastructure protocol layer.`;

export default function GovernancePage() {
  const [text, setText] = useState(SAMPLE_TEXT);
  const [result, setResult] = useState<GovernanceCheckResult | null>(null);
  const [checked, setChecked] = useState(false);

  function handleCheck() {
    const res = checkGovernanceLanguage(text);
    setResult(res);
    setChecked(true);
  }

  function handleClear() {
    setText("");
    setResult(null);
    setChecked(false);
  }

  const statusColor = result?.approvalStatus === "Safe" ? "#059669" : result?.approvalStatus === "Needs Review" ? "#D97706" : "#DC2626";
  const statusBg = result?.approvalStatus === "Safe" ? "rgba(16,185,129,0.08)" : result?.approvalStatus === "Needs Review" ? "rgba(245,158,11,0.08)" : "rgba(239,68,68,0.06)";

  return (
    <>
      <Topbar title="Governance Language Checker" subtitle="AI compliance tool — checks all draft materials for governance-safe TBP language" />
      <div style={{ padding: "24px 28px 40px" }}>

        <div style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, padding: "12px 18px", marginBottom: 20, fontSize: 12, color: "#7f1d1d" }}>
          ⚠️ <strong>Required:</strong> All outreach emails, briefing note introductions, deck copy, and follow-up templates must pass this check before any external use. Human approval is required before sending any communication externally.
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>

          {/* Approved language */}
          <Panel title="✅ Approved Terminology" subtitle="Use these phrases in all outreach, emails, decks, and briefing notes">
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {APPROVED_LANGUAGE.map((item) => (
                <div key={item.phrase} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 8, fontSize: 13 }}>
                  <span>✅</span>
                  <span style={{ fontWeight: 600, color: "#059669", flex: 1 }}>"{item.phrase}"</span>
                  <span style={{ fontSize: 11, color: "#5A6B7F", marginLeft: "auto" }}>{item.note}</span>
                </div>
              ))}
            </div>
          </Panel>

          {/* Forbidden */}
          <Panel title="🚫 Forbidden Phrases" subtitle="Strictly prohibited in all TBP communications — zero exceptions">
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                "guaranteed return", "control rights", "exclusive entitlement", "access fee",
                "guaranteed allocation", "investment returns", "ownership stake",
                "guaranteed project access", "guaranteed liquidity", "risk-free opportunity",
              ].map((phrase) => (
                <div key={phrase} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, fontSize: 13 }}>
                  <span>🚫</span>
                  <span style={{ fontWeight: 600, color: "#DC2626" }}>"{phrase}"</span>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        {/* Live checker */}
        <Panel title="Live Text Checker" subtitle="Paste any email draft, deck copy, or briefing note — AI flags issues and suggests approved alternatives">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <div>
              <div style={{ fontSize: 11, color: "#8899AA", textTransform: "uppercase", letterSpacing: ".8px", marginBottom: 8 }}>Input — Paste text here</div>
              <textarea
                style={{ width: "100%", minHeight: 160, resize: "vertical", border: "1px solid #E2E8F0", borderRadius: 8, padding: "10px 12px", fontSize: 13, fontFamily: "inherit", background: "#F4F6FA", color: "#1A2B45", outline: "none" }}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste your draft email, briefing note, or deck copy here..."
              />
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button
                  onClick={handleCheck}
                  style={{ background: "#C4992A", color: "#1A2B45", fontWeight: 700, fontSize: 13, padding: "9px 20px", borderRadius: 8, border: "none", cursor: "pointer" }}
                >
                  Check Language →
                </button>
                <button
                  onClick={handleClear}
                  style={{ background: "#F4F6FA", color: "#5A6B7F", fontWeight: 600, fontSize: 13, padding: "9px 16px", borderRadius: 8, border: "1px solid #E2E8F0", cursor: "pointer" }}
                >
                  Clear
                </button>
              </div>
              <div style={{ marginTop: 10, fontSize: 11, color: "#8899AA" }}>
                Source compliance: Use publicly available and ethically sourced information only. Do not include confidential employer or client data.
              </div>
            </div>

            <div>
              <div style={{ fontSize: 11, color: "#8899AA", textTransform: "uppercase", letterSpacing: ".8px", marginBottom: 8 }}>
                {checked && result ? `Results — ${result.flaggedPhrases.length} Issue${result.flaggedPhrases.length !== 1 ? "s" : ""} Found` : "Results"}
              </div>

              {checked && result ? (
                <div>
                  {/* Status banner */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: statusBg, border: `1px solid ${statusColor}40`, borderRadius: 8, marginBottom: 12 }}>
                    <span style={{ fontSize: 18 }}>{result.approvalStatus === "Safe" ? "✅" : result.approvalStatus === "Needs Review" ? "⚠️" : "🚫"}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: statusColor }}>{result.approvalStatus}</div>
                      <div style={{ fontSize: 11, color: "#5A6B7F" }}>Risk Score: {result.riskScore}/100</div>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {result.flaggedPhrases.map((f, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 12px", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, fontSize: 12 }}>
                        <span style={{ fontSize: 15, flexShrink: 0 }}>🚫</span>
                        <div>
                          <div><span style={{ fontWeight: 700, color: "#DC2626" }}>"{f.phrase}"</span> — {f.severity === "blocked" ? "Blocked" : "Needs Review"}</div>
                          <div style={{ color: "#5A6B7F", marginTop: 2 }}>→ Replace with: <em>"{f.replacement}"</em></div>
                        </div>
                      </div>
                    ))}
                    {result.flaggedPhrases.length === 0 && (
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 12px", background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 8, fontSize: 12 }}>
                        <span>✅</span>
                        <div style={{ color: "#059669" }}>No governance language issues detected. Human review still recommended before any external use.</div>
                      </div>
                    )}
                  </div>

                  <div style={{ marginTop: 14, padding: "10px 12px", background: "#F4F6FA", border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 11, color: "#5A6B7F" }}>
                    <strong style={{ color: "#1A2B45" }}>Summary:</strong> {result.summary}
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "40px 0", color: "#8899AA", fontSize: 13 }}>
                  Enter text above and click "Check Language" to run the compliance check.
                </div>
              )}
            </div>
          </div>
        </Panel>

        {/* Disclaimer */}
        <Panel title="📋 Required Disclaimer" subtitle="Must be included in all materials referencing the Protocol Establishment Round" style={{ marginTop: 14 }}>
          <div style={{ padding: "14px 16px", background: "rgba(196,153,42,0.06)", border: "1px solid rgba(196,153,42,0.25)", borderRadius: 8, fontSize: 13, color: "#1A2B45", lineHeight: 1.7 }}>
            <em>"{REQUIRED_DISCLAIMER}"</em>
          </div>
        </Panel>

      </div>
    </>
  );
}
