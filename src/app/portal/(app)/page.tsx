"use client";

import { useEffect, useState } from "react";
import { getPortalSession, type PortalSessionUser } from "@/lib/portal/session";
import { portalTheme } from "@/lib/portal/theme";

const statCardStyle: React.CSSProperties = {
  background: portalTheme.panel,
  border: `1px solid ${portalTheme.panelBorder}`,
  borderRadius: 12,
  padding: "18px 20px",
};

export default function PortalOverviewPage() {
  const [user, setUser] = useState<PortalSessionUser | null>(null);

  useEffect(() => {
    setUser(getPortalSession());
  }, []);

  if (!user) return null;

  return (
    <div>
      <h1 style={{ color: portalTheme.textPrimary, fontSize: 20, fontWeight: 700, margin: "0 0 4px" }}>Overview</h1>
      <p style={{ color: portalTheme.textMuted, fontSize: 13, marginBottom: 24 }}>
        Welcome back, {user.name.split(" ")[0]}.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 14,
          marginBottom: 24,
        }}
      >
        <div style={statCardStyle}>
          <div style={{ color: portalTheme.textMuted, fontSize: 11, textTransform: "uppercase", letterSpacing: ".6px", marginBottom: 6 }}>
            Applications
          </div>
          <div style={{ color: portalTheme.textMuted, fontSize: 13 }}>Available once the opportunity catalogue is live</div>
        </div>
        <div style={statCardStyle}>
          <div style={{ color: portalTheme.textMuted, fontSize: 11, textTransform: "uppercase", letterSpacing: ".6px", marginBottom: 6 }}>
            Profile Status
          </div>
          <div style={{ color: portalTheme.textMuted, fontSize: 13 }}>Available once profile intake is live</div>
        </div>
        <div style={statCardStyle}>
          <div style={{ color: portalTheme.textMuted, fontSize: 11, textTransform: "uppercase", letterSpacing: ".6px", marginBottom: 6 }}>
            Activity Level
          </div>
          <div style={{ color: portalTheme.textMuted, fontSize: 13 }}>Available once activity tracking is surfaced here</div>
        </div>
      </div>

      <div style={{ ...statCardStyle, padding: "22px 24px" }}>
        <div style={{ color: portalTheme.textPrimary, fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
          Recommended Project Opportunities
        </div>
        <p style={{ color: portalTheme.textMuted, fontSize: 13, margin: 0 }}>
          Coming soon — this will surface opportunities matched to your profile once opportunity-matching is built.
        </p>
      </div>
    </div>
  );
}
