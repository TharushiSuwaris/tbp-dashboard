"use client";

import { useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { Panel } from "@/components/ui/Panel";
import { ScoreBadge } from "@/components/ui/Badge";
import { mockProspects } from "@/lib/mock-data/prospects";
import { generateBriefingPack } from "@/lib/ai/briefing-pack";
import type { BriefingPack, Prospect } from "@/types";

export default function BriefingPacksPage() {
  const [selectedId, setSelectedId] = useState<string>("");
  const [pack, setPack] = useState<BriefingPack | null>(null);
  const [generating, setGenerating] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("backgroundNote");

  const eligible = mockProspects.filter((p) => p.suitability_score >= 65).sort((a, b) => b.suitability_score - a.suitability_score);
  const selected = eligible.find((p) => p.id === selectedId);

  async function handleGenerate() {
    if (!selected) return;
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 1000));
    const bp = generateBriefingPack(selected);
    setPack(bp);
    setGenerating(false);
    setActiveSection("backgroundNote");
  }

  const sectionNav = [
    { key: "backgroundNote", label: "1. Background Note" },
    { key: "whyFitsTBP", label: "2. Why Fits TBP" },
    { key: "relevantTBPThemes", label: "3. TBP Themes" },
    { key: "suggestedConversationAngle", label: "4. Conversation Angle" },
    { key: "potentialTBPEntryPoint", label: "5. TBP Entry Point" },
    { key: "likelyQuestions", label: "6. Likely Questions" },
    { key: "recommendedContactRoute", label: "7. Contact Route" },
    { key: "draftIntroEmail", label: "8. Intro Email" },
    { key: "draftFollowUpEmail", label: "9. Follow-Up Email" },
    { key: "suggestedMeetingAgenda", label: "10. Meeting Agenda" },
    { key: "postMeetingActionTemplate", label: "11. Post-Meeting Actions" },
    { key: "governanceWarning", label: "⚠ Governance Notice" },
  ];

  function renderSection() {
    if (!pack) return null;
    const s = pack.sections;
    switch (activeSection) {
      case "backgroundNote": return <div style={{ lineHeight: 1.8, fontSize: 13, color: "#1A2B45" }}>{s.backgroundNote}</div>;
      case "whyFitsTBP": return <div style={{ lineHeight: 1.8, fontSize: 13, color: "#1A2B45" }}>{s.whyFitsTBP}</div>;
      case "relevantTBPThemes": return <ul style={{ margin: 0, paddingLeft: 20 }}>{s.relevantTBPThemes.map((t, i) => <li key={i} style={{ fontSize: 13, color: "#1A2B45", marginBottom: 8 }}>{t}</li>)}</ul>;
      case "suggestedConversationAngle": return <div style={{ lineHeight: 1.8, fontSize: 13, color: "#1A2B45" }}>{s.suggestedConversationAngle}</div>;
      case "potentialTBPEntryPoint": return <div style={{ padding: "12px 16px", background: "rgba(196,153,42,0.06)", border: "1px solid rgba(196,153,42,0.25)", borderRadius: 8, fontSize: 13, color: "#1A2B45", fontWeight: 600 }}>{s.potentialTBPEntryPoint}</div>;
      case "likelyQuestions": return <ol style={{ margin: 0, paddingLeft: 20 }}>{s.likelyQuestions.map((q, i) => <li key={i} style={{ fontSize: 13, color: "#1A2B45", marginBottom: 8 }}>{q}</li>)}</ol>;
      case "recommendedContactRoute": return <div style={{ lineHeight: 1.8, fontSize: 13, color: "#1A2B45" }}>{s.recommendedContactRoute}</div>;
      case "draftIntroEmail": return <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit", fontSize: 12, color: "#1A2B45", background: "#F4F6FA", padding: 16, borderRadius: 8, lineHeight: 1.7 }}>{s.draftIntroEmail}</pre>;
      case "draftFollowUpEmail": return <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit", fontSize: 12, color: "#1A2B45", background: "#F4F6FA", padding: 16, borderRadius: 8, lineHeight: 1.7 }}>{s.draftFollowUpEmail}</pre>;
      case "suggestedMeetingAgenda": return <ol style={{ margin: 0, paddingLeft: 20 }}>{s.suggestedMeetingAgenda.map((item, i) => <li key={i} style={{ fontSize: 13, color: "#1A2B45", marginBottom: 8 }}>{item}</li>)}</ol>;
      case "postMeetingActionTemplate": return <ul style={{ margin: 0, paddingLeft: 20 }}>{s.postMeetingActionTemplate.map((item, i) => <li key={i} style={{ fontSize: 13, color: "#1A2B45", marginBottom: 8 }}>{item}</li>)}</ul>;
      case "governanceWarning": return <div style={{ padding: "14px 16px", background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, fontSize: 13, color: "#7f1d1d", lineHeight: 1.7 }}>{s.governanceWarning}</div>;
      default: return null;
    }
  }

  return (
    <>
      <Topbar title="Briefing Pack Generator" subtitle="Generate internal briefing packs for selected prospects — all packs require human review before any external use" />
      <div style={{ padding: "24px 28px 40px" }}>

        <div style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 12, padding: "12px 18px", marginBottom: 20, fontSize: 12, color: "#92400E" }}>
          ⚠️ All briefing packs are for <strong>internal TBP use only</strong>. All outreach drafts generated here must pass the Governance Language Checker and receive TBP Leadership approval before any external distribution.
        </div>

        {/* Prospect selector */}
        <Panel title="Select Prospect" subtitle="Choose a scored prospect to generate an internal briefing pack" style={{ marginBottom: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "end" }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#5A6B7F", textTransform: "uppercase", letterSpacing: ".8px", marginBottom: 6, display: "block" }}>
                Eligible Prospects (Score 65+)
              </label>
              <select
                style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 13, color: "#1A2B45", background: "#F4F6FA", outline: "none" }}
                value={selectedId}
                onChange={(e) => { setSelectedId(e.target.value); setPack(null); }}
              >
                <option value="">— Select a prospect —</option>
                {eligible.map((p) => (
                  <option key={p.id} value={p.id}>[{p.suitability_score}] {p.prospect_name} · {p.city}, {p.country}</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleGenerate}
              disabled={!selectedId || generating}
              style={{
                background: selectedId && !generating ? "#C4992A" : "#E2E8F0",
                color: selectedId && !generating ? "#1A2B45" : "#8899AA",
                fontWeight: 700, fontSize: 13, padding: "10px 24px",
                borderRadius: 8, border: "none",
                cursor: selectedId && !generating ? "pointer" : "not-allowed",
              }}
            >
              {generating ? "Generating..." : "📄 Generate Briefing Pack"}
            </button>
          </div>

          {selected && (
            <div style={{ marginTop: 16, padding: "14px 16px", background: "#F4F6FA", borderRadius: 8, display: "flex", gap: 20 }}>
              <div>
                <div style={{ fontSize: 11, color: "#8899AA", marginBottom: 2 }}>PROSPECT</div>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#1A2B45" }}>{selected.prospect_name}</div>
                <div style={{ fontSize: 12, color: "#5A6B7F" }}>{selected.city}, {selected.country} · {selected.region}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "#8899AA", marginBottom: 2 }}>SCORE</div>
                <ScoreBadge score={selected.suitability_score} />
              </div>
              <div>
                <div style={{ fontSize: 11, color: "#8899AA", marginBottom: 2 }}>BEST ENTRY POINT</div>
                <div style={{ fontSize: 12, color: "#1A2B45" }}>{selected.best_tbp_entry_point}</div>
              </div>
            </div>
          )}
        </Panel>

        {/* Pack viewer */}
        {pack && (
          <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 14 }}>
            {/* Nav */}
            <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, overflow: "hidden", alignSelf: "start" }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid #E2E8F0", fontSize: 12, fontWeight: 700, color: "#1A2B45" }}>Pack Sections</div>
              <div style={{ padding: 8 }}>
                {sectionNav.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => setActiveSection(s.key)}
                    style={{
                      display: "block", width: "100%", textAlign: "left",
                      padding: "8px 12px", borderRadius: 6, border: "none",
                      fontSize: 12, cursor: "pointer", marginBottom: 2,
                      background: activeSection === s.key ? "rgba(196,153,42,0.14)" : "transparent",
                      color: activeSection === s.key ? "#C4992A" : "#5A6B7F",
                      fontWeight: activeSection === s.key ? 700 : 400,
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <Panel
              title={sectionNav.find((s) => s.key === activeSection)?.label ?? ""}
              subtitle={`Internal briefing pack for ${pack.prospectName} · Generated ${new Date(pack.generatedAt).toLocaleDateString()}`}
              action={
                <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "rgba(245,158,11,0.1)", color: "#D97706", fontWeight: 700 }}>
                  {pack.governanceStatus} — Awaiting Human Review
                </span>
              }
            >
              {renderSection()}
            </Panel>
          </div>
        )}
      </div>
    </>
  );
}
