"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getPortalSession, isStaffRole, type PortalSessionUser } from "@/lib/portal/session";
import { portalTheme } from "@/lib/portal/theme";
import {
  getMyEventInvitationRequests,
  listPublishedEvents,
  type EventInvitationRequest,
  type UpcomingEvent,
} from "@/lib/portal/content";

// Only *granted* event invitations show here - pending/declined requests
// stay visible inline on Events & Roundtables (where they were made), so
// this page reads as "the events you're actually invited to," not another
// copy of the request queue.
export default function MyInvitationsPage() {
  const [user, setUser] = useState<PortalSessionUser | null>(null);
  const [granted, setGranted] = useState<{ request: EventInvitationRequest; event: UpcomingEvent }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getPortalSession();
    if (!session) return;
    setUser(session);

    if (session.role !== "circle_member") {
      setLoading(false);
      return;
    }

    Promise.all([getMyEventInvitationRequests(session.id), listPublishedEvents()])
      .then(([requests, events]) => {
        const eventById = new Map(events.map((e) => [e.id, e]));
        const approved = requests
          .filter((r) => r.status === "approved")
          .map((r) => ({ request: r, event: eventById.get(r.event_id) }))
          .filter((x): x is { request: EventInvitationRequest; event: UpcomingEvent } => !!x.event);
        setGranted(approved);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load invitations"))
      .finally(() => setLoading(false));
  }, []);

  if (!user) return null;

  return (
    <div>
      <h1 style={{ color: portalTheme.textPrimary, fontSize: 20, fontWeight: 700, margin: "0 0 4px" }}>
        My Invitations
      </h1>
      <p style={{ color: portalTheme.textMuted, fontSize: 13, marginBottom: 20 }}>
        {user.role === "circle_member"
          ? "Events TBP Capital Advisory has confirmed you're invited to."
          : "Circle Members' confirmed event invitations."}
      </p>

      {isStaffRole(user.role) ? (
        <div
          style={{
            background: portalTheme.panel,
            border: `1px solid ${portalTheme.panelBorder}`,
            borderRadius: 12,
            padding: "22px 24px",
          }}
        >
          <p style={{ color: portalTheme.textSecondary, fontSize: 13, lineHeight: 1.7, margin: "0 0 16px" }}>
            Circle Members request event invitations from Events &amp; Roundtables. Approve or decline those
            requests in Application Review — approved ones appear on the member&apos;s own My Invitations
            automatically.
          </p>
          <Link
            href="/portal/applications"
            style={{
              display: "inline-block",
              padding: "9px 18px",
              borderRadius: 8,
              border: "none",
              background: portalTheme.gold,
              color: portalTheme.goldText,
              fontWeight: 700,
              fontSize: 12.5,
              textDecoration: "none",
            }}
          >
            Go to Application Review &rarr;
          </Link>
        </div>
      ) : (
        <>
          {error && <div style={{ color: portalTheme.danger, fontSize: 13, marginBottom: 14 }}>{error}</div>}
          {loading && <div style={{ color: portalTheme.textMuted, fontSize: 13 }}>Loading...</div>}

          {!loading && granted.length === 0 && (
            <div
              style={{
                background: portalTheme.panel,
                border: `1px solid ${portalTheme.panelBorder}`,
                borderRadius: 12,
                padding: "22px 24px",
              }}
            >
              <p style={{ color: portalTheme.textSecondary, fontSize: 13, lineHeight: 1.7, margin: 0 }}>
                No confirmed invitations yet. Request one from{" "}
                <Link href="/portal/events" style={{ color: portalTheme.gold, textDecoration: "none" }}>
                  Events &amp; Roundtables
                </Link>{" "}
                — you&apos;ll see it here once TBP Capital Advisory grants it.
              </p>
            </div>
          )}

          {!loading && granted.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
              {granted.map(({ request, event }) => (
                <div
                  key={request.id}
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
                    <div style={{ position: "relative", width: "100%", height: 140 }}>
                      <Image src={event.image_path} alt={event.title} fill sizes="(max-width: 768px) 100vw, 33vw" style={{ objectFit: "cover" }} />
                    </div>
                  )}
                  <div style={{ padding: "16px 18px" }}>
                    <span
                      style={{
                        display: "inline-block",
                        fontSize: 10,
                        fontWeight: 700,
                        color: "#34D399",
                        background: "rgba(52,211,153,0.12)",
                        padding: "3px 9px",
                        borderRadius: 20,
                        marginBottom: 8,
                      }}
                    >
                      Invitation Granted ✓
                    </span>
                    <div style={{ color: portalTheme.textPrimary, fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{event.title}</div>
                    <div style={{ color: portalTheme.textMuted, fontSize: 12 }}>
                      {event.venue ?? "Venue to be confirmed"} &middot; {event.event_date ?? "Date to be confirmed"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
