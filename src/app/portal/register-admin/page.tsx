"use client";

import { useState } from "react";
import { requestAdminSignup } from "@/lib/portal/adminAuth";
import { portalTheme } from "@/lib/portal/theme";

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  fontWeight: 600,
  color: portalTheme.textSecondary,
  textTransform: "uppercase",
  letterSpacing: ".6px",
  marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: `1px solid ${portalTheme.inputBorder}`,
  background: portalTheme.inputBackground,
  color: portalTheme.textPrimary,
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
  marginBottom: 14,
};

export default function RegisterAdminPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await requestAdminSignup(name.trim(), email.trim(), password);
      setSubmitted(true);
      // Fire-and-forget: the request is already saved regardless of whether
      // the notification email succeeds, so this never blocks the user.
      fetch("/api/portal/notify-admin-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      }).catch(() => {});
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit request");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: portalTheme.background,
        fontFamily: "sans-serif",
        padding: 24,
      }}
    >
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <h1 style={{ color: portalTheme.textPrimary, fontSize: 20, fontWeight: 700, margin: 0 }}>
            Request an Admin Account
          </h1>
          <p style={{ color: portalTheme.textMuted, fontSize: 12.5, marginTop: 6 }}>
            Requires approval by an existing TBP Advisory Admin before you can log in.
          </p>
        </div>

        <div
          style={{
            background: portalTheme.panel,
            border: `1px solid ${portalTheme.panelBorder}`,
            borderRadius: 12,
            padding: "28px 26px",
          }}
        >
          {submitted ? (
            <div style={{ textAlign: "center" }}>
              <p style={{ color: portalTheme.textPrimary, fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                Request submitted.
              </p>
              <p style={{ color: portalTheme.textMuted, fontSize: 13 }}>
                An existing Admin needs to approve your request before you can log in. You&apos;ll use the email and
                password you just set once approved.
              </p>
              <a href="/portal/login" style={{ color: portalTheme.gold, fontSize: 12.5, textDecoration: "none" }}>
                &larr; Back to Log In
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <label style={labelStyle}>Full Name</label>
              <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} required />

              <label style={labelStyle}>Email</label>
              <input
                type="email"
                style={inputStyle}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <label style={labelStyle}>Password</label>
              <input
                type="password"
                style={inputStyle}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <label style={labelStyle}>Confirm Password</label>
              <input
                type="password"
                style={{ ...inputStyle, marginBottom: 0 }}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />

              {error && <div style={{ color: portalTheme.danger, fontSize: 12.5, marginTop: 12 }}>{error}</div>}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  marginTop: 18,
                  padding: "11px 0",
                  borderRadius: 8,
                  border: "none",
                  background: portalTheme.gold,
                  color: portalTheme.goldText,
                  fontWeight: 700,
                  fontSize: 13.5,
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? "Submitting..." : "Submit Request"}
              </button>

              <p style={{ fontSize: 11, textAlign: "center", marginTop: 14 }}>
                <a href="/portal/login" style={{ color: portalTheme.textMuted, textDecoration: "none" }}>
                  &larr; Back to Log In
                </a>
              </p>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
