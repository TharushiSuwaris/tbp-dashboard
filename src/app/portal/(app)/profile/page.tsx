"use client";

import { useEffect, useState } from "react";
import { getPortalSession, type PortalSessionUser } from "@/lib/portal/session";
import { portalTheme } from "@/lib/portal/theme";
import { getMyProfile, saveMyProfile, type MemberProfile, type ProfileStatus } from "@/lib/portal/content";

const fields: { key: keyof MemberProfile; label: string; multiline?: boolean }[] = [
  { key: "family_or_group_background", label: "Family / Group Background", multiline: true },
  { key: "geography", label: "Geography & Market Interests" },
  { key: "sector_preferences", label: "Sector Preferences" },
  { key: "capital_appetite", label: "Capital Appetite" },
  { key: "investment_horizon", label: "Investment Horizon" },
  { key: "risk_preference", label: "Risk Preference" },
  { key: "esg_alignment", label: "ESG & Impact Alignment" },
  { key: "legacy_objectives", label: "Legacy & Generational Objectives", multiline: true },
];

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "9px 11px",
  borderRadius: 7,
  border: `1px solid ${portalTheme.inputBorder}`,
  background: portalTheme.inputBackground,
  color: portalTheme.textPrimary,
  fontSize: 13,
  boxSizing: "border-box",
};

const statusColor: Record<ProfileStatus, string> = {
  draft: portalTheme.textMuted,
  submitted: "#FBBF24",
  approved: "#34D399",
  rejected: portalTheme.danger,
};

export default function ProfilePage() {
  const [user, setUser] = useState<PortalSessionUser | null>(null);
  const [values, setValues] = useState<Partial<MemberProfile>>({});
  const [status, setStatus] = useState<ProfileStatus>("draft");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<"draft" | "submit" | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getPortalSession();
    if (!session) return;
    setUser(session);
    getMyProfile(session.id)
      .then((profile) => {
        if (profile) {
          setValues(profile);
          setStatus(profile.status);
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(submit: boolean) {
    if (!user) return;
    setSaving(submit ? "submit" : "draft");
    setError(null);
    try {
      await saveMyProfile(user.id, values, submit);
      setStatus(submit ? "submitted" : "draft");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setSaving(null);
    }
  }

  if (!user || loading) return null;

  const locked = status === "submitted" || status === "approved";

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ color: portalTheme.textPrimary, fontSize: 20, fontWeight: 700, margin: "0 0 4px" }}>My Profile</h1>
          <p style={{ color: portalTheme.textMuted, fontSize: 13, margin: 0 }}>
            Your intake profile and approval status.
          </p>
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: "capitalize", color: statusColor[status] }}>
          {status}
        </span>
      </div>

      {error && <div style={{ color: portalTheme.danger, fontSize: 13, marginBottom: 14 }}>{error}</div>}

      {locked && (
        <div style={{ color: portalTheme.textMuted, fontSize: 12.5, marginBottom: 16 }}>
          Your profile is {status} and can no longer be edited{status === "submitted" ? " while under review" : ""}.
        </div>
      )}

      <div
        style={{
          background: portalTheme.panel,
          border: `1px solid ${portalTheme.panelBorder}`,
          borderRadius: 12,
          padding: "22px 24px",
          display: "grid",
          gap: 14,
        }}
      >
        {fields.map((f) => (
          <div key={f.key}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: portalTheme.textSecondary, textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 6 }}>
              {f.label}
            </label>
            {f.multiline ? (
              <textarea
                style={{ ...inputStyle, resize: "vertical" }}
                rows={3}
                disabled={locked}
                value={(values[f.key] as string) ?? ""}
                onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
              />
            ) : (
              <input
                style={inputStyle}
                disabled={locked}
                value={(values[f.key] as string) ?? ""}
                onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
              />
            )}
          </div>
        ))}

        {!locked && (
          <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
            <button
              onClick={() => handleSave(false)}
              disabled={saving !== null}
              style={{
                padding: "9px 16px",
                borderRadius: 8,
                border: `1px solid ${portalTheme.panelBorder}`,
                background: "transparent",
                color: portalTheme.textSecondary,
                fontWeight: 600,
                fontSize: 12.5,
                cursor: saving ? "not-allowed" : "pointer",
              }}
            >
              {saving === "draft" ? "Saving..." : "Save Draft"}
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={saving !== null}
              style={{
                padding: "9px 16px",
                borderRadius: 8,
                border: "none",
                background: portalTheme.gold,
                color: portalTheme.goldText,
                fontWeight: 700,
                fontSize: 12.5,
                cursor: saving ? "not-allowed" : "pointer",
              }}
            >
              {saving === "submit" ? "Submitting..." : "Submit for Review"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
