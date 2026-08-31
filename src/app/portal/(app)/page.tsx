"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FileText, UserCheck, Globe2, BadgeCheck, MapPin, Calendar } from "lucide-react";
import { getPortalSession, type PortalSessionUser } from "@/lib/portal/session";
import { portalTheme } from "@/lib/portal/theme";
import {
  getMyApplications,
  getMyProfile,
  listPublishedOpportunities,
  listPublishedEvents,
  type Application,
  type MemberProfile,
  type Opportunity,
  type UpcomingEvent,
} from "@/lib/portal/content";

const panelStyle: React.CSSProperties = {
  background: portalTheme.panel,
  border: `1px solid ${portalTheme.panelBorder}`,
  borderRadius: 12,
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

function StatCard({
  icon: Icon,
  label,
  value,
  valueColor,
  caption,
}: {
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  label: string;
  value: React.ReactNode;
  valueColor?: string;
  caption: string;
}) {
  return (
    <div style={{ ...panelStyle, padding: "18px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            background: "rgba(58,159,192,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon size={17} color={portalTheme.gold} strokeWidth={1.8} />
        </div>
        <div style={{ color: portalTheme.textSecondary, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".5px" }}>{label}</div>
      </div>
      <div style={{ fontSize: 17, fontWeight: 700, color: valueColor ?? portalTheme.textPrimary, marginBottom: 3, lineHeight: 1.35 }}>
        {value}
      </div>
      <div style={{ color: portalTheme.textMuted, fontSize: 11.5 }}>{caption}</div>
    </div>
  );
}

function SectionHeader({ title, viewAllHref, viewAllLabel }: { title: string; viewAllHref: string; viewAllLabel: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
      <div
        style={{
          color: portalTheme.textPrimary,
          fontWeight: 700,
          fontSize: 16,
          fontFamily: "var(--font-serif), Georgia, serif",
        }}
      >
        {title}
      </div>
      <Link href={viewAllHref} style={{ color: portalTheme.gold, fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
        {viewAllLabel} &rarr;
      </Link>
    </div>
  );
}

export default function PortalOverviewPage() {
  const [user, setUser] = useState<PortalSessionUser | null>(null);
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [matches, setMatches] = useState<Opportunity[]>([]);
  const [events, setEvents] = useState<UpcomingEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getPortalSession();
    if (!session) return;
    setUser(session);

    if (session.role !== "circle_member") {
      setLoading(false);
      return;
    }

    Promise.all([getMyProfile(session.id), getMyApplications(session.id), listPublishedOpportunities(), listPublishedEvents()])
      .then(([p, apps, opps, evts]) => {
        setProfile(p);
        setApplications(apps);
        setEvents(evts);
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
  const membershipAccessLabel = !profile
    ? "Not a member yet"
    : profile.status !== "approved"
    ? "Pending Approval"
    : profile.member_tier ?? "Circle Member";

  return (
    <div>
      <h1
        style={{
          color: portalTheme.textPrimary,
          fontFamily: "var(--font-serif), Georgia, serif",
          fontSize: 26,
          fontWeight: 700,
          margin: "0 0 6px",
        }}
      >
        Welcome back, {user.name.split(" ")[0]}.
      </h1>
      <p style={{ color: portalTheme.textMuted, fontSize: 13, marginBottom: 24 }}>
        Here&apos;s your overview of access, opportunities and engagements.
      </p>

      {user.role === "circle_member" && (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 14,
              marginBottom: 24,
            }}
          >
            <StatCard icon={FileText} label="Applications" value={applications.length} caption="Active submissions" />
            <StatCard
              icon={UserCheck}
              label="Profile Status"
              value={profile?.status ?? "Not started"}
              valueColor={profile ? statusColor[profile.status] : portalTheme.textMuted}
              caption={profile ? "Profile submitted" : "Get started in My Account"}
            />
            <StatCard
              icon={Globe2}
              label="Sector Interests"
              value={mySectors.length > 0 ? mySectors.join(" · ") : "None on file"}
              caption={mySectors.length > 0 ? `${mySectors.length} sector${mySectors.length === 1 ? "" : "s"} selected` : "Add interests in My Account"}
            />
            <StatCard
              icon={BadgeCheck}
              label="Membership Access"
              value={membershipAccessLabel}
              valueColor={profile?.status === "approved" ? portalTheme.gold : portalTheme.textMuted}
              caption={profile?.status === "approved" ? "All access categories" : "Awaiting TBP review"}
            />
          </div>

          <div style={{ ...panelStyle, padding: "22px 24px", marginBottom: 20 }}>
            <SectionHeader title="Curated Project Opportunities" viewAllHref="/portal/opportunities" viewAllLabel="View all opportunities" />

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
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14 }}>
                {matches.slice(0, 4).map((opp) => (
                  <div
                    key={opp.id}
                    style={{
                      border: `1px solid ${portalTheme.panelBorder}`,
                      borderRadius: 10,
                      padding: "14px 16px",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
                      {opp.region && (
                        <span style={{ fontSize: 10, fontWeight: 700, color: portalTheme.gold, background: "rgba(58,159,192,0.12)", padding: "2px 8px", borderRadius: 20 }}>
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
                    <div style={{ color: portalTheme.textMuted, fontSize: 11.5, marginBottom: 12 }}>{opp.category}</div>
                    <Link
                      href="/portal/opportunities"
                      style={{
                        marginTop: "auto",
                        paddingTop: 10,
                        borderTop: `1px solid ${portalTheme.panelBorder}`,
                        color: portalTheme.gold,
                        fontSize: 11.5,
                        fontWeight: 700,
                        textDecoration: "none",
                      }}
                    >
                      View Details &rsaquo;
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {!loading && events.length > 0 && (
            <div style={{ ...panelStyle, padding: "22px 24px" }}>
              <SectionHeader title="Upcoming Events & Roundtables" viewAllHref="/portal/events" viewAllLabel="View all events" />

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14 }}>
                {events.slice(0, 3).map((event) => (
                  <Link
                    key={event.id}
                    href="/portal/events"
                    style={{
                      display: "block",
                      border: `1px solid ${portalTheme.panelBorder}`,
                      borderRadius: 10,
                      overflow: "hidden",
                      textDecoration: "none",
                    }}
                  >
                    {event.image_path && (
                      <div style={{ position: "relative", width: "100%", height: 130 }}>
                        <Image src={event.image_path} alt={event.title} fill sizes="(max-width: 768px) 100vw, 33vw" style={{ objectFit: "cover" }} />
                        <div
                          style={{
                            position: "absolute",
                            top: 10,
                            left: 10,
                            width: 30,
                            height: 30,
                            borderRadius: "50%",
                            background: "rgba(11,21,38,0.72)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Calendar size={14} color="#fff" strokeWidth={1.8} />
                        </div>
                      </div>
                    )}
                    <div style={{ padding: "14px 16px" }}>
                      <div style={{ color: portalTheme.textPrimary, fontWeight: 700, fontSize: 13.5, marginBottom: 6, lineHeight: 1.35 }}>
                        {event.title}
                      </div>
                      {event.region && (
                        <div style={{ display: "flex", alignItems: "center", gap: 5, color: portalTheme.textMuted, fontSize: 11.5, marginBottom: 4 }}>
                          <MapPin size={12} strokeWidth={1.8} />
                          {event.region}
                        </div>
                      )}
                      <div style={{ color: portalTheme.textMuted, fontSize: 11 }}>
                        {event.venue ?? "Venue to be confirmed"} &middot; {event.event_date ?? "Date to be confirmed"}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
