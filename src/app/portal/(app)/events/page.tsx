"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { portalTheme } from "@/lib/portal/theme";
import { getPortalSession, type PortalSessionUser } from "@/lib/portal/session";
import {
  listPublishedEvents,
  getMyEventInvitationRequests,
  requestEventInvitation,
  type UpcomingEvent,
  type EventInvitationRequest,
} from "@/lib/portal/content";

const selectStyle: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 8,
  border: `1px solid ${portalTheme.inputBorder}`,
  background: portalTheme.inputBackground,
  color: portalTheme.textPrimary,
  fontSize: 12.5,
};

export default function EventsPage() {
  const [user, setUser] = useState<PortalSessionUser | null>(null);
  const [events, setEvents] = useState<UpcomingEvent[]>([]);
  const [invitationRequests, setInvitationRequests] = useState<EventInvitationRequest[]>([]);
  const [regionFilter, setRegionFilter] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [requestingId, setRequestingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getPortalSession();
    setUser(session);

    listPublishedEvents()
      .then(async (evts) => {
        setEvents(evts);
        if (session?.role === "circle_member") {
          setInvitationRequests(await getMyEventInvitationRequests(session.id));
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load events"))
      .finally(() => setLoading(false));
  }, []);

  function requestFor(eventId: string) {
    return invitationRequests.find((r) => r.event_id === eventId);
  }

  async function handleRequestInvitation(event: UpcomingEvent) {
    if (!user) return;
    setRequestingId(event.id);
    try {
      await requestEventInvitation(event.id, event.title, user.id, "");
      setInvitationRequests(await getMyEventInvitationRequests(user.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to request invitation");
    } finally {
      setRequestingId(null);
    }
  }

  const regions = useMemo(
    () => Array.from(new Set(events.map((e) => e.region).filter((r): r is string => !!r))).sort(),
    [events]
  );
  const filtered = regionFilter ? events.filter((e) => e.region === regionFilter) : events;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ color: portalTheme.textPrimary, fontSize: 20, fontWeight: 700, margin: "0 0 4px" }}>
            Events &amp; Roundtables
          </h1>
          <p style={{ color: portalTheme.textMuted, fontSize: 13, margin: 0 }}>
            Private briefings and roundtables from TBP Capital Advisory.
          </p>
        </div>
        {regions.length > 0 && (
          <select style={selectStyle} value={regionFilter} onChange={(e) => setRegionFilter(e.target.value)}>
            <option value="">All Regions</option>
            {regions.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        )}
      </div>

      {error && <div style={{ color: portalTheme.danger, fontSize: 13, marginBottom: 14 }}>{error}</div>}
      {loading && <div style={{ color: portalTheme.textMuted, fontSize: 13 }}>Loading...</div>}
      {!loading && filtered.length === 0 && (
        <div style={{ color: portalTheme.textMuted, fontSize: 13 }}>No upcoming events match this filter.</div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
        {filtered.map((event) => {
          const expanded = expandedId === event.id;
          const invitation = requestFor(event.id);
          return (
            <div
              key={event.id}
              style={{
                background: portalTheme.panel,
                border: `1px solid ${portalTheme.panelBorder}`,
                borderRadius: 12,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {event.image_path && (
                <div style={{ position: "relative", width: "100%", height: 160 }}>
                  <Image src={event.image_path} alt={event.title} fill style={{ objectFit: "cover" }} />
                </div>
              )}

              <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", flex: 1 }}>
                {event.region && (
                  <span
                    style={{
                      alignSelf: "flex-start",
                      fontSize: 10,
                      fontWeight: 700,
                      color: portalTheme.gold,
                      background: "rgba(196,153,42,0.12)",
                      padding: "3px 9px",
                      borderRadius: 20,
                      marginBottom: 8,
                    }}
                  >
                    {event.region}
                  </span>
                )}

                <div style={{ color: portalTheme.textPrimary, fontWeight: 700, fontSize: 15, marginBottom: 8 }}>
                  {event.title}
                </div>

                <div style={{ color: portalTheme.textMuted, fontSize: 12, marginBottom: 10 }}>
                  {event.venue ?? "Venue to be confirmed"} &middot; {event.event_date ?? "Date to be confirmed"}
                </div>

                <p
                  style={{
                    color: portalTheme.textSecondary,
                    fontSize: 13,
                    lineHeight: 1.6,
                    margin: "0 0 14px",
                    flex: 1,
                    whiteSpace: "pre-line",
                    ...(expanded ? {} : { display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }),
                  }}
                >
                  {event.description}
                </p>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                  <button
                    onClick={() => setExpandedId(expanded ? null : event.id)}
                    style={{ background: "none", border: "none", color: portalTheme.gold, fontSize: 12.5, fontWeight: 600, cursor: "pointer", padding: 0 }}
                  >
                    {expanded ? "Show Less" : "Learn More"}
                  </button>

                  {user?.role === "circle_member" && (
                    invitation ? (
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: "5px 10px",
                          borderRadius: 20,
                          textTransform: "capitalize",
                          color: invitation.status === "approved" ? "#34D399" : invitation.status === "rejected" ? portalTheme.danger : "#FBBF24",
                          background: "rgba(27,42,61,0.06)",
                        }}
                      >
                        {invitation.status === "approved" ? "Invitation Granted ✓" : invitation.status === "rejected" ? "Declined" : "Requested"}
                      </span>
                    ) : (
                      <button
                        onClick={() => handleRequestInvitation(event)}
                        disabled={requestingId === event.id}
                        style={{
                          padding: "7px 14px",
                          borderRadius: 8,
                          border: "none",
                          background: portalTheme.gold,
                          color: portalTheme.goldText,
                          fontWeight: 700,
                          fontSize: 12.5,
                          cursor: requestingId === event.id ? "default" : "pointer",
                          opacity: requestingId === event.id ? 0.6 : 1,
                        }}
                      >
                        Request Invitation
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
