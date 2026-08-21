"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getPortalSession, type PortalSessionUser } from "@/lib/portal/session";
import { portalTheme } from "@/lib/portal/theme";
import {
  getMyApplications,
  getMyProfile,
  listPublishedOpportunities,
  type Application,
  type MemberProfile,
  type Opportunity,
} from "@/lib/portal/content";

const statCardStyle: React.CSSProperties = {
  background: portalTheme.panel,
  border: `1px solid ${portalTheme.panelBorder}`,
  borderRadius: 12,
  padding: "18px 20px",
};

const statusColor: Record<string, string> = {
  draft: portalTheme.textMuted,
  submitted: "#FBBF24",
  approved: "#34D399",
  rejected: portalTheme.danger,
  pending: "#FBBF24",
};

function parseSectors(sectorPreferences: string | null): string[] {
  if (!sectorPreferences) return [];
  return sectorPreferences.split(",").map((s) => s.trim()).filter(Boolean);
}

export default function PortalOverviewPage() {
  const [user, setUser] = useState<PortalSessionUser | null>(null);
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [matches, setMatches] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getPortalSession();
    if (!session) return;
    setUser(session);

    if (session.role !== "circle_member") {
      setLoading(false);
      return;
    }

    Promise.all([getMyProfile(session.id), getMyApplications(session.id), listPublishedOpportunities()])
      .then(([p, apps, opps]) => {
        setProfile(p);
        setApplications(apps);
        const mySectors = parseSectors(p?.sector_preferences ?? null);
        if (mySectors.length > 0) {
          setMatches(opps.filter((o) => (o.sector ?? []).some((s) => mySectors.includes(s))));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (!user) return null;

  const mySectors = parseSectors(profile?.sector_preferences ?? null);

  return (
    <div>
      <h1 style={{ color: portalTheme.textPrimary, fontSize: 20, fontWeight: 700, margin: "0 0 4px" }}>Overview</h1>
      <p style={{ color: portalTheme.textMuted, fontSize: 13, marginBottom: 24 }}>
        Welcome back, {user.name.split(" ")[0]}.
      </p>

      {user.role === "circle_member" && (
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
            <div style={{ color: portalTheme.textPrimary, fontSize: 20, fontWeight: 700 }}>{applications.length}</div>
          </div>
          <div style={statCardStyle}>
            <div style={{ color: portalTheme.textMuted, fontSize: 11, textTransform: "uppercase", letterSpacing: ".6px", marginBottom: 6 }}>
              Profile Status
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, textTransform: "capitalize", color: profile ? statusColor[profile.status] : portalTheme.textMuted }}>
              {profile?.status ?? "Not started"}
            </div>
          </div>
          <div style={statCardStyle}>
            <div style={{ color: portalTheme.textMuted, fontSize: 11, textTransform: "uppercase", letterSpacing: ".6px", marginBottom: 6 }}>
              Sector Interests
            </div>
            <div style={{ color: portalTheme.textPrimary, fontSize: 13, lineHeight: 1.5 }}>
              {mySectors.length > 0 ? mySectors.join(" · ") : "None on file"}
            </div>
          </div>
        </div>
      )}

      {user.role === "circle_member" && (
        <div style={{ ...statCardStyle, padding: "22px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ color: portalTheme.textPrimary, fontWeight: 700, fontSize: 14 }}>
              Recommended Project Opportunities
            </div>
            <Link href="/portal/opportunities" style={{ color: portalTheme.gold, fontSize: 12, textDecoration: "none" }}>
              View All &rarr;
            </Link>
          </div>

          {loading && <p style={{ color: portalTheme.textMuted, fontSize: 13, margin: 0 }}>Loading...</p>}

          {!loading && mySectors.length === 0 && (
            <p style={{ color: portalTheme.textMuted, fontSize: 13, margin: 0 }}>
              No sector interests on file — recommendations will appear once your profile lists a Sector Interest.
            </p>
          )}

          {!loading && mySectors.length > 0 && matches.length === 0 && (
            <p style={{ color: portalTheme.textMuted, fontSize: 13, margin: 0 }}>
              No published projects currently match your sector interests ({mySectors.join(" · ")}).
            </p>
          )}

          {!loading && matches.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
              {matches.slice(0, 6).map((opp) => (
                <Link
                  key={opp.id}
                  href="/portal/opportunities"
                  style={{
                    display: "block",
                    border: `1px solid ${portalTheme.panelBorder}`,
                    borderRadius: 10,
                    padding: "14px 16px",
                    textDecoration: "none",
                  }}
                >
                  <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
                    {opp.region && (
                      <span style={{ fontSize: 10, fontWeight: 700, color: portalTheme.gold, background: "rgba(196,153,42,0.12)", padding: "2px 8px", borderRadius: 20 }}>
                        {opp.region}
                      </span>
                    )}
                    {(opp.sector ?? [])
                      .filter((s) => mySectors.includes(s))
                      .map((s) => (
                        <span key={s} style={{ fontSize: 10, fontWeight: 700, color: "#34D399", background: "rgba(16,185,129,0.12)", padding: "2px 8px", borderRadius: 20 }}>
                          {s}
                        </span>
                      ))}
                  </div>
                  <div style={{ color: portalTheme.textPrimary, fontWeight: 700, fontSize: 13.5, marginBottom: 4 }}>{opp.title}</div>
                  <div style={{ color: portalTheme.textMuted, fontSize: 11.5 }}>{opp.category}</div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
