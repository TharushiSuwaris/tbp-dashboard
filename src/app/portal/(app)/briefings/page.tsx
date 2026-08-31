"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getPortalSession, isStaffRole, type PortalSessionUser } from "@/lib/portal/session";
import { portalTheme } from "@/lib/portal/theme";
import {
  getMessages,
  submitEnquiry,
  listPublishedOpportunities,
  ENQUIRY_TYPES,
  type PortalMessage,
  type Opportunity,
} from "@/lib/portal/content";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

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
  fontSize: 13,
  outline: "none",
  boxSizing: "border-box",
};

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
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [enquiryType, setEnquiryType] = useState("");
  const [relatedOpportunityId, setRelatedOpportunityId] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function reload(session: PortalSessionUser) {
    const all = await getMessages(session.id);
    setThreads(buildEnquiryThreads(all, session.id));
  }

  useEffect(() => {
    const session = getPortalSession();
    if (!session) return;
    setUser(session);

    if (session.role !== "circle_member") {
      setLoading(false);
      return;
    }

    Promise.all([reload(session), listPublishedOpportunities().then(setOpportunities)])
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load enquiries"))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit() {
    if (!user) return;
    if (!enquiryType) {
      setFormError("Please select an enquiry type.");
      return;
    }
    if (!message.trim()) {
      setFormError("Please add a short message.");
      return;
    }
    setFormError(null);
    setSubmitting(true);
    try {
      const relatedProject = opportunities.find((o) => o.id === relatedOpportunityId);
      await submitEnquiry({
        memberId: user.id,
        enquiryType,
        subject: relatedProject ? `${enquiryType}: ${relatedProject.title}` : enquiryType,
        message: message.trim(),
        relatedOpportunityId: relatedOpportunityId || undefined,
      });
      setEnquiryType("");
      setRelatedOpportunityId("");
      setMessage("");
      setShowForm(false);
      await reload(user);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to submit enquiry");
    } finally {
      setSubmitting(false);
    }
  }

  if (!user) return null;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ color: portalTheme.textPrimary, fontSize: 20, fontWeight: 700, margin: "0 0 4px" }}>
            Briefings &amp; Enquiries
          </h1>
          <p style={{ color: portalTheme.textMuted, fontSize: 13, margin: 0 }}>
            {user.role === "circle_member"
              ? "Structured requests you've sent to TBP Capital Advisory, and their replies."
              : "Structured requests submitted by Circle Members."}
          </p>
        </div>
        {user.role === "circle_member" && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            style={{ padding: "9px 18px", borderRadius: 8, border: "none", background: portalTheme.gold, color: portalTheme.goldText, fontWeight: 700, fontSize: 12.5, cursor: "pointer" }}
          >
            + New Enquiry
          </button>
        )}
      </div>

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

          {showForm && (
            <div
              style={{
                background: portalTheme.panel,
                border: `1px solid ${portalTheme.panelBorder}`,
                borderRadius: 12,
                padding: "20px 22px",
                marginBottom: 20,
              }}
            >
              <div style={{ color: portalTheme.textPrimary, fontWeight: 700, fontSize: 14, marginBottom: 16 }}>
                Submit a New Enquiry
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Enquiry Type *</label>
                <select style={inputStyle} value={enquiryType} onChange={(e) => setEnquiryType(e.target.value)}>
                  <option value="" disabled>Select...</option>
                  {ENQUIRY_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {opportunities.length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>Related Project (Optional)</label>
                  <select style={inputStyle} value={relatedOpportunityId} onChange={(e) => setRelatedOpportunityId(e.target.value)}>
                    <option value="">None</option>
                    {opportunities.map((o) => (
                      <option key={o.id} value={o.id}>{o.title}</option>
                    ))}
                  </select>
                </div>
              )}

              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Message *</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Share the details of your enquiry..."
                  rows={4}
                  style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
                />
              </div>

              {formError && <div style={{ color: portalTheme.danger, fontSize: 12.5, marginBottom: 12 }}>{formError}</div>}

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  style={{ padding: "9px 18px", borderRadius: 8, border: "none", background: portalTheme.gold, color: portalTheme.goldText, fontWeight: 700, fontSize: 12.5, cursor: submitting ? "default" : "pointer", opacity: submitting ? 0.6 : 1 }}
                >
                  {submitting ? "Submitting..." : "Submit Enquiry"}
                </button>
                <button
                  onClick={() => { setShowForm(false); setFormError(null); }}
                  style={{ padding: "9px 18px", borderRadius: 8, border: `1px solid ${portalTheme.panelBorder}`, background: "transparent", color: portalTheme.textMuted, fontSize: 12.5, cursor: "pointer" }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {loading && <div style={{ color: portalTheme.textMuted, fontSize: 13 }}>Loading...</div>}

          {!loading && threads.length === 0 && !showForm && (
            <div
              style={{
                background: portalTheme.panel,
                border: `1px solid ${portalTheme.panelBorder}`,
                borderRadius: 12,
                padding: "22px 24px",
              }}
            >
              <p style={{ color: portalTheme.textSecondary, fontSize: 13, lineHeight: 1.7, margin: 0 }}>
                You haven&apos;t submitted any briefing or enquiry requests yet. Use{" "}
                <strong>+ New Enquiry</strong> above, or <strong>Request Briefing</strong> /{" "}
                <strong>Request Roundtable</strong> on a project in{" "}
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
                          background: "rgba(58,159,192,0.12)",
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
