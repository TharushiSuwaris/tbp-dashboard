"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getPortalSession, isStaffRole, type PortalSessionUser } from "@/lib/portal/session";
import { changePassword } from "@/lib/portal/adminAuth";
import { portalTheme } from "@/lib/portal/theme";

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

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  fontWeight: 600,
  color: portalTheme.textSecondary,
  textTransform: "uppercase",
  letterSpacing: ".5px",
  marginBottom: 6,
};

export default function AccountPage() {
  const [user, setUser] = useState<PortalSessionUser | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setUser(getPortalSession());
  }, []);

  if (!user) return null;

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError(null);
    setSuccess(false);

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setSaving(true);
    try {
      await changePassword(user.id, currentPassword, newPassword);
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to change password");
    } finally {
      setSaving(false);
    }
  }

  const homePath = isStaffRole(user.role) ? "/dashboard" : "/portal";
  const homeLabel = isStaffRole(user.role) ? "Main Dashboard" : "Overview";

  return (
    <div>
      <Link
        href={homePath}
        style={{
          display: "inline-block",
          fontSize: 12.5,
          color: portalTheme.gold,
          textDecoration: "none",
          marginBottom: 16,
        }}
      >
        &larr; Back to {homeLabel}
      </Link>

      <h1 style={{ color: portalTheme.textPrimary, fontSize: 20, fontWeight: 700, margin: "0 0 4px" }}>My Account</h1>
      <p style={{ color: portalTheme.textMuted, fontSize: 13, marginBottom: 20 }}>
        Your profile details{isStaffRole(user.role) ? " and password" : ""}.
      </p>

      <div
        style={{
          background: portalTheme.panel,
          border: `1px solid ${portalTheme.panelBorder}`,
          borderRadius: 12,
          padding: "22px 24px",
          marginBottom: 16,
        }}
      >
        <div style={{ display: "grid", gap: 12 }}>
          <div style={{ display: "flex", gap: 10, fontSize: 13 }}>
            <div style={{ minWidth: 100, color: portalTheme.textMuted }}>Name</div>
            <div style={{ color: portalTheme.textPrimary, fontWeight: 600 }}>{user.name}</div>
          </div>
          <div style={{ display: "flex", gap: 10, fontSize: 13 }}>
            <div style={{ minWidth: 100, color: portalTheme.textMuted }}>Email</div>
            <div style={{ color: portalTheme.textPrimary }}>{user.email}</div>
          </div>
          <div style={{ display: "flex", gap: 10, fontSize: 13 }}>
            <div style={{ minWidth: 100, color: portalTheme.textMuted }}>Role</div>
            <div style={{ color: portalTheme.textPrimary, textTransform: "capitalize" }}>
              {user.role.replace(/_/g, " ")}
            </div>
          </div>
        </div>
      </div>

      {isStaffRole(user.role) ? (
        <form
          onSubmit={handleChangePassword}
          style={{
            background: portalTheme.panel,
            border: `1px solid ${portalTheme.panelBorder}`,
            borderRadius: 12,
            padding: "22px 24px",
          }}
        >
          <div style={{ color: portalTheme.textPrimary, fontWeight: 700, fontSize: 14, marginBottom: 14 }}>
            Change Password
          </div>

          <label style={labelStyle}>Current Password</label>
          <input
            type="password"
            style={{ ...inputStyle, marginBottom: 12 }}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />

          <label style={labelStyle}>New Password</label>
          <input
            type="password"
            style={{ ...inputStyle, marginBottom: 12 }}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />

          <label style={labelStyle}>Confirm New Password</label>
          <input
            type="password"
            style={inputStyle}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          {error && <div style={{ color: portalTheme.danger, fontSize: 12.5, marginTop: 12 }}>{error}</div>}
          {success && <div style={{ color: "#34D399", fontSize: 12.5, marginTop: 12 }}>Password updated.</div>}

          <button
            type="submit"
            disabled={saving}
            style={{
              marginTop: 16,
              padding: "9px 18px",
              borderRadius: 8,
              border: "none",
              background: portalTheme.gold,
              color: portalTheme.goldText,
              fontWeight: 700,
              fontSize: 12.5,
              cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            {saving ? "Saving..." : "Update Password"}
          </button>
        </form>
      ) : (
        <div style={{ color: portalTheme.textMuted, fontSize: 13 }}>
          Circle Members log in with email only — there&apos;s no password to change.
        </div>
      )}
    </div>
  );
}
