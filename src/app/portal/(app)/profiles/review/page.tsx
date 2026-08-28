"use client";

import { useEffect, useState } from "react";
import { portalTheme } from "@/lib/portal/theme";
import { listProfilesForReview, reviewProfile, updateMemberTier, MEMBER_TIERS, type MemberProfile } from "@/lib/portal/content";

const selectStyle: React.CSSProperties = {
  padding: "7px 10px",
  borderRadius: 6,
  border: `1px solid ${portalTheme.inputBorder}`,
  background: portalTheme.inputBackground,
  color: portalTheme.textPrimary,
  fontSize: 12,
};

type ProfileRow = MemberProfile & { name: string; email: string };

const fieldLabels: { key: keyof MemberProfile; label: string }[] = [
  { key: "family_or_group_background", label: "Family / Group Background" },
  { key: "geography", label: "Geography" },
  { key: "sector_preferences", label: "Sector Preferences" },
  { key: "capital_appetite", label: "Capital Appetite" },
  { key: "investment_horizon", label: "Investment Horizon" },
  { key: "risk_preference", label: "Risk Preference" },
  { key: "esg_alignment", label: "ESG Alignment" },
  { key: "legacy_objectives", label: "Legacy Objectives" },
];

export default function ProfileReviewPage() {
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  async function load() {
    try {
      setProfiles(await listProfilesForReview());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profiles");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleReview(id: string, status: "approved" | "rejected") {
    try {
      await reviewProfile(id, status);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    }
  }

  async function handleSetTier(id: string, tier: string) {
    try {
      await updateMemberTier(id, tier);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update membership access");
    }
  }

  return (
    <div>
      <h1 style={{ color: portalTheme.textPrimary, fontSize: 20, fontWeight: 700, margin: "0 0 4px" }}>Profile Review</h1>
      <p style={{ color: portalTheme.textMuted, fontSize: 13, marginBottom: 20 }}>
        Approve or reject submitted member profiles.
      </p>

      {error && <div style={{ color: portalTheme.danger, fontSize: 13, marginBottom: 14 }}>{error}</div>}

      {profiles.length === 0 && <div style={{ color: portalTheme.textMuted, fontSize: 13 }}>No profiles yet.</div>}

      <div style={{ display: "grid", gap: 12 }}>
        {profiles.map((p) => {
          const isExpanded = expanded === p.portal_user_id;
          return (
            <div
              key={p.portal_user_id}
              style={{ background: portalTheme.panel, border: `1px solid ${portalTheme.panelBorder}`, borderRadius: 12, padding: "16px 20px" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }} onClick={() => setExpanded(isExpanded ? null : p.portal_user_id)}>
                <div>
                  <div style={{ color: portalTheme.textPrimary, fontWeight: 700, fontSize: 14 }}>{p.name}</div>
                  <div style={{ color: portalTheme.textMuted, fontSize: 12 }}>{p.email}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: "capitalize",
                      color:
                        p.status === "approved" ? "#34D399" : p.status === "rejected" ? portalTheme.danger : p.status === "submitted" ? "#FBBF24" : portalTheme.textMuted,
                    }}
                  >
                    {p.status}
                  </span>
                  {p.status === "submitted" && (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleReview(p.portal_user_id, "approved"); }}
                        style={{ padding: "6px 12px", borderRadius: 6, border: "none", background: portalTheme.gold, color: portalTheme.goldText, fontWeight: 700, fontSize: 12, cursor: "pointer" }}
                      >
                        Approve
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleReview(p.portal_user_id, "rejected"); }}
                        style={{ padding: "6px 12px", borderRadius: 6, border: `1px solid ${portalTheme.panelBorder}`, background: "transparent", color: portalTheme.textMuted, fontSize: 12, cursor: "pointer" }}
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>

              {isExpanded && (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${portalTheme.panelBorder}`, display: "grid", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12.5, marginBottom: 4 }} onClick={(e) => e.stopPropagation()}>
                    <div style={{ minWidth: 180, color: portalTheme.textMuted }}>Membership Access</div>
                    <select
                      style={selectStyle}
                      value={p.member_tier ?? ""}
                      onChange={(e) => handleSetTier(p.portal_user_id, e.target.value)}
                    >
                      <option value="" disabled>
                        Not yet assigned
                      </option>
                      {MEMBER_TIERS.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  {fieldLabels.map((f) => (
                    <div key={f.key} style={{ display: "flex", gap: 10, fontSize: 12.5 }}>
                      <div style={{ minWidth: 180, color: portalTheme.textMuted }}>{f.label}</div>
                      <div style={{ color: portalTheme.textSecondary }}>{(p[f.key] as string) || "—"}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
