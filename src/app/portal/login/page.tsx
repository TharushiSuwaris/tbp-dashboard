"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginPortalUser } from "@/lib/portal/auth";
import { savePortalSession } from "@/lib/portal/session";
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
};

export default function PortalLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const user = await loginPortalUser(email.trim(), password);
      savePortalSession(user);
      // Everyone lands in the Circle Portal first - staff reach the
      // internal FO tool via the "Internal Dashboard" link in the portal
      // sidebar (see PortalSidebar.tsx) rather than being dropped straight
      // into it on login.
      router.push("/portal");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
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
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 10,
              background: portalTheme.gold,
              color: portalTheme.goldText,
              fontWeight: 800,
              fontSize: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 14px",
            }}
          >
            TBP
          </div>
          <h1 style={{ color: portalTheme.textPrimary, fontSize: 20, fontWeight: 700, margin: 0 }}>
            TBP Capital Circles
          </h1>
          <p style={{ color: portalTheme.textMuted, fontSize: 12.5, marginTop: 6 }}>
            Bringing Different Classes of Capital into One Curated Global Project Ecosystem
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            background: portalTheme.panel,
            border: `1px solid ${portalTheme.panelBorder}`,
            borderRadius: 12,
            padding: "28px 26px",
          }}
        >
          <label style={labelStyle}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@tbp.dev"
            autoFocus
            style={{ ...inputStyle, marginBottom: 14 }}
          />

          <label style={labelStyle}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Leave blank only if your account predates password login"
            style={inputStyle}
          />

          {error && <div style={{ color: portalTheme.danger, fontSize: 12.5, marginTop: 10 }}>{error}</div>}

          <button
            type="submit"
            disabled={loading || !email.trim()}
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
              cursor: loading || !email.trim() ? "not-allowed" : "pointer",
              opacity: loading || !email.trim() ? 0.7 : 1,
            }}
          >
            {loading ? "Logging in..." : "Log In"}
          </button>

          <p style={{ fontSize: 11, textAlign: "center", marginTop: 16 }}>
            <a href="/portal/register-admin" style={{ color: portalTheme.textMuted, textDecoration: "none" }}>
              Request an Admin account &rarr;
            </a>
          </p>
        </form>
      </div>
    </main>
  );
}
