"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getPortalSession, isStaffRole, type PortalSessionUser } from "@/lib/portal/session";
import { portalTheme } from "@/lib/portal/theme";
import { getMessages, type PortalMessage } from "@/lib/portal/content";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

type EnquiryThread = { enquiry: PortalMessage; replies: PortalMessage[] };

// Groups the member's flat portal_messages history (the same table/order
// Correspondence reads) into one "thread" per enquiry they sent, with any
// messages TBP Capital Advisory sent afterward attached as replies - there's
// no explicit reply-to link in the schema, so a reply is attributed to
// whichever enquiry was most recently sent before it. Plain, non-enquiry
// messages the member sent themselves (ordinary Correspondence chatter) are
// not part of any thread here - this page is specifically about the
// structured requests, not a duplicate of the full inbox.
function buildEnquiryThreads(messages: PortalMessage[], memberId: string): EnquiryThread[] {
  const threads: EnquiryThread[] = [];
  let current: EnquiryThread | null = null;
  for (const m of messages) {
    if (m.enquiry_type && m.sender_id === memberId) {
      current = { enquiry: m, replies: [] };
      threads.push(current);
    } else if (current && m.sender_id !== memberId) {
      current.replies.push(m);
    }
  }
  return threads;
}

export default function BriefingsPage() {
  const [user, setUser] = useState<PortalSessionUser | null>(null);
  const [threads, setThreads] = useState<EnquiryThread[]>([]);
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

    getMessages(session.id)
      .then((all) => setThreads(buildEnquiryThreads(all, session.id)))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load enquiries"))
      .finally(() => setLoading(false));
  }, []);

  if (!user) return null;

  return (
    <div>
      <h1 style={{ color: portalTheme.textPrimary, fontSize: 20, fontWeight: 700, margin: "0 0 4px" }}>
        Briefings &amp; Enquiries
      </h1>
      <p style={{ color: portalTheme.textMuted, fontSize: 13, marginBottom: 20 }}>
        {user.role === "circle_member"
          ? "Structured requests you've sent to TBP Capital Advisory, and their replies."
          : "Structured requests submitted by Circle Members."}
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
            Briefing and roundtable requests from your assigned Circle Members arrive as tagged messages in
            Correspondence, alongside everything else they send — reply there and it shows up on the member&apos;s
            side here automatically.
          </p>
          <Link
            href="/portal/messages"
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
            Go to Correspondence &rarr;
          </Link>
        </div>
      ) : (
        <>
          {error && <div style={{ color: portalTheme.danger, fontSize: 13, marginBottom: 14 }}>{error}</div>}
          {loading && <div style={{ color: portalTheme.textMuted, fontSize: 13 }}>Loading...</div>}

          {!loading && threads.length === 0 && (
            <div
              style={{
                background: portalTheme.panel,
                border: `1px solid ${portalTheme.panelBorder}`,
                borderRadius: 12,
                padding: "22px 24px",
              }}
            >
              <p style={{ color: portalTheme.textSecondary, fontSize: 13, lineHeight: 1.7, margin: 0 }}>
                You haven&apos;t submitted any briefing or roundtable requests yet. Use{" "}
                <strong>Request Briefing</strong> or <strong>Request Roundtable</strong> on a project in{" "}
                <Link href="/portal/opportunities" style={{ color: portalTheme.gold, textDecoration: "none" }}>
                  Curated Opportunities
                </Link>{" "}
                to get started.
              </p>
            </div>
          )}

          {!loading && threads.length > 0 && (
            <div style={{ display: "grid", gap: 12 }}>
              {[...threads].reverse().map(({ enquiry, replies }) => (
                <div
                  key={enquiry.id}
                  style={{
                    background: portalTheme.panel,
                    border: `1px solid ${portalTheme.panelBorder}`,
                    borderRadius: 12,
                    padding: "16px 20px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
                    {enquiry.enquiry_type && (
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: portalTheme.gold,
                          background: "rgba(196,153,42,0.12)",
                          padding: "3px 9px",
                          borderRadius: 20,
                          textTransform: "uppercase",
                          letterSpacing: ".4px",
                        }}
                      >
                        {enquiry.enquiry_type}
                      </span>
                    )}
                    <span style={{ color: portalTheme.textMuted, fontSize: 11.5 }}>{formatDate(enquiry.created_at)}</span>
                  </div>
                  {enquiry.subject && (
                    <div style={{ color: portalTheme.textPrimary, fontWeight: 700, fontSize: 13.5, marginBottom: 4 }}>{enquiry.subject}</div>
                  )}
                  <p style={{ color: portalTheme.textSecondary, fontSize: 12.5, lineHeight: 1.6, margin: 0 }}>{enquiry.content}</p>

                  {replies.length > 0 && (
                    <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${portalTheme.panelBorder}`, display: "grid", gap: 10 }}>
                      {replies.map((r) => (
                        <div key={r.id} style={{ background: "rgba(27,42,61,0.03)", borderRadius: 8, padding: "10px 12px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 4 }}>
                            <span style={{ fontSize: 10.5, fontWeight: 700, color: portalTheme.textMuted, textTransform: "uppercase", letterSpacing: ".4px" }}>
                              Reply from TBP Capital Advisory
                            </span>
                            <span style={{ color: portalTheme.textMuted, fontSize: 11 }}>{formatDate(r.created_at)}</span>
                          </div>
                          <p style={{ color: portalTheme.textSecondary, fontSize: 12.5, lineHeight: 1.6, margin: 0 }}>{r.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <Link href="/portal/messages" style={{ color: portalTheme.gold, fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
                Continue the conversation in Correspondence &rarr;
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
