"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getPortalSession, type PortalSessionUser } from "@/lib/portal/session";
import { portalTheme } from "@/lib/portal/theme";
import { CAPITAL_CIRCLES } from "@/lib/portal/content";
import {
  createInvitation,
  deleteExpiredInvitations,
  listInvitations,
  revokeInvitation,
  type CreatedInvitation,
  type Invitation,
} from "@/lib/portal/invitations";
import {
  approveInvitationRequest,
  listInvitationRequests,
  rejectInvitationRequest,
  type InvitationRequest,
} from "@/lib/portal/invitationRequests";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  borderRadius: 6,
  border: `1px solid ${portalTheme.inputBorder}`,
  background: portalTheme.inputBackground,
  color: portalTheme.textPrimary,
  fontSize: 12.5,
  outline: "none",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 10.5,
  fontWeight: 700,
  color: portalTheme.textMuted,
  textTransform: "uppercase",
  letterSpacing: ".5px",
  marginBottom: 5,
};

const selectStyle: React.CSSProperties = { ...inputStyle, padding: "7px 10px", fontSize: 12 };

function timeRemaining(expiresAt: string): { label: string; expired: boolean } {
  const diffMs = new Date(expiresAt).getTime() - Date.now();
  if (diffMs <= 0) return { label: "Expired", expired: true };
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  if (hours >= 1) return { label: `Expires in ${hours}h ${minutes}m`, expired: false };
  return { label: `Expires in ${minutes}m`, expired: false };
}

function buildEmailContent(invitee: { invitee_name: string; capital_circle: string }, created: CreatedInvitation): {
  subject: string;
  body: string;
} {
  const deadline = new Date(created.expires_at).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
  const subject = "Your Private Invitation to TBP Capital Circles™";
  const body = `Dear ${invitee.invitee_name},

You have been invited to apply for membership of the TBP Capital Circles™ — a private, invitation-only community connecting Family Offices, institutional investors and strategic capital participants with curated TBP project opportunities.

You have been invited to the ${invitee.capital_circle} Circle™.

To begin your registration, visit the TBP Capital Circles registration page and enter your personal invitation code:

Invitation Code: ${created.code}

This code is personal to you, should not be shared, and is valid until ${deadline} (72 hours from issue). It can only be used once.

If you have any questions, please contact TBP Capital Advisory.

Warm regards,
TBP Capital Advisory & Coordination Office`;
  return { subject, body };
}

function GenerateInvitationsTab({ user }: { user: PortalSessionUser }) {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [inviteeName, setInviteeName] = useState("");
  const [inviteeEmail, setInviteeEmail] = useState("");
  const [organisation, setOrganisation] = useState("");
  const [capitalCircle, setCapitalCircle] = useState("");
  const [lastCreated, setLastCreated] = useState<{ invitee_name: string; capital_circle: string; created: CreatedInvitation } | null>(null);
  const [copied, setCopied] = useState(false);

  async function load() {
    try {
      await deleteExpiredInvitations();
    } catch {
      // non-fatal — the list query below still filters visually if this fails
    }
    try {
      setInvitations(await listInvitations());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load invitations");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate() {
    if (!inviteeName.trim() || !inviteeEmail.trim() || !capitalCircle) {
      setError("Please fill in name, email and Capital Circle.");
      return;
    }
    setError(null);
    setCreating(true);
    try {
      const created = await createInvitation(user.id, {
        invitee_name: inviteeName.trim(),
        invitee_email: inviteeEmail.trim(),
        organisation: organisation.trim(),
        capital_circle: capitalCircle,
      });
      setLastCreated({ invitee_name: inviteeName.trim(), capital_circle: capitalCircle, created });
      setInviteeName("");
      setInviteeEmail("");
      setOrganisation("");
      setCapitalCircle("");
      setShowCreateForm(false);
      setCopied(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create invitation");
    } finally {
      setCreating(false);
    }
  }

  async function handleRevoke(id: string) {
    try {
      await revokeInvitation(id, user.id);
      setConfirmingId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to revoke invitation");
    }
  }

  async function handleCopy() {
    if (!lastCreated) return;
    const { subject, body } = buildEmailContent(lastCreated, lastCreated.created);
    try {
      await navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
      setCopied(true);
    } catch {
      setError("Could not copy to clipboard — please select and copy the text manually.");
    }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 4 }}>
        <p style={{ color: portalTheme.textMuted, fontSize: 13, maxWidth: 560 }}>
          Generate private invitation codes for prospective Capital Circle members. Codes are valid for 72 hours
          and are removed automatically once used or expired.
        </p>
        {!showCreateForm && (
          <button
            onClick={() => {
              setShowCreateForm(true);
              setLastCreated(null);
            }}
            style={{
              padding: "9px 16px",
              borderRadius: 8,
              border: "none",
              background: portalTheme.gold,
              color: portalTheme.goldText,
              fontWeight: 700,
              fontSize: 12.5,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            + Create Invitation
          </button>
        )}
      </div>

      {error && <div style={{ color: portalTheme.danger, fontSize: 13, margin: "14px 0" }}>{error}</div>}

      {showCreateForm && (
        <div
          style={{
            background: portalTheme.panel,
            border: `1px solid ${portalTheme.panelBorder}`,
            borderRadius: 12,
            padding: "20px 22px",
            marginTop: 18,
            marginBottom: 20,
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, color: portalTheme.gold, textTransform: "uppercase", letterSpacing: ".6px", marginBottom: 14 }}>
            New Invitation
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div>
              <label style={labelStyle}>Name *</label>
              <input style={inputStyle} value={inviteeName} onChange={(e) => setInviteeName(e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Email *</label>
              <input style={inputStyle} type="email" value={inviteeEmail} onChange={(e) => setInviteeEmail(e.target.value)} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>Organisation</label>
              <input style={inputStyle} value={organisation} onChange={(e) => setOrganisation(e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Capital Circle *</label>
              <select style={inputStyle} value={capitalCircle} onChange={(e) => setCapitalCircle(e.target.value)}>
                <option value="" disabled>
                  Select...
                </option>
                {CAPITAL_CIRCLES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={handleCreate}
              disabled={creating}
              style={{
                padding: "9px 18px",
                borderRadius: 8,
                border: "none",
                background: portalTheme.gold,
                color: portalTheme.goldText,
                fontWeight: 700,
                fontSize: 12.5,
                cursor: creating ? "not-allowed" : "pointer",
                opacity: creating ? 0.7 : 1,
              }}
            >
              {creating ? "Generating..." : "Generate Private Invitation"}
            </button>
            <button
              onClick={() => setShowCreateForm(false)}
              style={{
                padding: "9px 18px",
                borderRadius: 8,
                border: `1px solid ${portalTheme.panelBorder}`,
                background: "transparent",
                color: portalTheme.textMuted,
                fontSize: 12.5,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {lastCreated && (
        <div
          style={{
            background: "rgba(58,159,192,0.06)",
            border: `1px solid ${portalTheme.panelBorder}`,
            borderRadius: 12,
            padding: "20px 22px",
            marginBottom: 20,
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, color: portalTheme.gold, textTransform: "uppercase", letterSpacing: ".6px", marginBottom: 10 }}>
            Invitation Generated — Code Shown Once
          </div>
          <div style={{ color: portalTheme.textPrimary, fontSize: 15, fontWeight: 700, marginBottom: 4 }}>
            {lastCreated.created.code}
          </div>
          <div style={{ color: portalTheme.textMuted, fontSize: 12, marginBottom: 14 }}>
            For {lastCreated.invitee_name} &middot; {lastCreated.capital_circle} Circle™ &middot; expires{" "}
            {new Date(lastCreated.created.expires_at).toLocaleString()}
          </div>
          <label style={labelStyle}>Ready-to-Send Email (copy and send from your own inbox)</label>
          <textarea
            readOnly
            rows={10}
            value={(() => {
              const { subject, body } = buildEmailContent(lastCreated, lastCreated.created);
              return `Subject: ${subject}\n\n${body}`;
            })()}
            style={{ ...inputStyle, fontFamily: "inherit", resize: "vertical", marginBottom: 10 }}
          />
          <button
            onClick={handleCopy}
            style={{
              padding: "8px 16px",
              borderRadius: 6,
              border: `1px solid ${portalTheme.panelBorder}`,
              background: "transparent",
              color: portalTheme.textPrimary,
              fontWeight: 700,
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            {copied ? "Copied ✓" : "Copy Email Content"}
          </button>
        </div>
      )}

      {invitations.length === 0 && !showCreateForm && (
        <div style={{ color: portalTheme.textMuted, fontSize: 13 }}>No pending invitations.</div>
      )}

      <div style={{ display: "grid", gap: 12 }}>
        {invitations.map((inv) => {
          const remaining = timeRemaining(inv.expires_at);
          const isConfirming = confirmingId === inv.id;
          return (
            <div
              key={inv.id}
              style={{
                background: portalTheme.panel,
                border: `1px solid ${portalTheme.panelBorder}`,
                borderRadius: 12,
                padding: "14px 20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <div>
                <div style={{ color: portalTheme.textPrimary, fontWeight: 700, fontSize: 14 }}>
                  {inv.invitee_name} {inv.organisation && <span style={{ color: portalTheme.textMuted, fontWeight: 400 }}>&middot; {inv.organisation}</span>}
                </div>
                <div style={{ color: portalTheme.textMuted, fontSize: 12 }}>
                  {inv.invitee_email} &middot; {inv.capital_circle} Circle™
                </div>
                <div style={{ color: portalTheme.textMuted, fontSize: 11.5, marginTop: 4, fontFamily: "monospace" }}>{inv.code}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: remaining.expired ? portalTheme.danger : "#FBBF24" }}>
                  {remaining.label}
                </span>
                {isConfirming ? (
                  <>
                    <span style={{ color: portalTheme.textMuted, fontSize: 12 }}>Revoke this invitation?</span>
                    <button
                      onClick={() => handleRevoke(inv.id)}
                      style={{ padding: "6px 12px", borderRadius: 6, border: "none", background: portalTheme.danger, color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer" }}
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setConfirmingId(null)}
                      style={{ padding: "6px 12px", borderRadius: 6, border: `1px solid ${portalTheme.panelBorder}`, background: "transparent", color: portalTheme.textMuted, fontSize: 12, cursor: "pointer" }}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setConfirmingId(inv.id)}
                    style={{ padding: "6px 12px", borderRadius: 6, border: `1px solid ${portalTheme.panelBorder}`, background: "transparent", color: portalTheme.danger, fontSize: 12, cursor: "pointer" }}
                  >
                    Revoke
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: portalTheme.textMuted, textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 2 }}>
        {label}
      </div>
      <div style={{ fontSize: 12.5, color: portalTheme.textSecondary, lineHeight: 1.6 }}>{value}</div>
    </div>
  );
}

function buildRequestEmailContent(r: InvitationRequest, capitalCircle: string): { subject: string; body: string } {
  const deadline = r.invitation_expires_at
    ? new Date(r.invitation_expires_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
    : "";
  const subject = "Your Private Invitation to TBP Capital Circles™";
  const body = `Dear ${r.name},

Thank you for your interest in the TBP Capital Circles™. Following review of your request, you have been invited to apply for membership.

You have been invited to the ${capitalCircle} Circle™.

To begin your registration, visit the TBP Capital Circles registration page and enter your personal invitation code:

Invitation Code: ${r.invitation_code}

This code is personal to you, should not be shared, and is valid until ${deadline} (72 hours from issue). It can only be used once.

If you have any questions, please contact TBP Capital Advisory.

Warm regards,
TBP Capital Advisory & Coordination Office`;
  return { subject, body };
}

function InvitationRequestsTab({ user }: { user: PortalSessionUser }) {
  const [requests, setRequests] = useState<InvitationRequest[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [chosenCircle, setChosenCircle] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function load() {
    try {
      setRequests(await listInvitationRequests());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load invitation requests");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleApprove(r: InvitationRequest) {
    const capitalCircle = chosenCircle[r.id];
    if (!capitalCircle) {
      setError("Please select a Capital Circle before approving.");
      return;
    }
    setError(null);
    try {
      await approveInvitationRequest(r.id, user.id, capitalCircle);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve request");
    }
  }

  async function handleReject(id: string) {
    try {
      await rejectInvitationRequest(id, user.id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reject request");
    }
  }

  async function handleCopy(r: InvitationRequest, capitalCircle: string) {
    const { subject, body } = buildRequestEmailContent(r, capitalCircle);
    try {
      await navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
      setCopiedId(r.id);
    } catch {
      setError("Could not copy to clipboard — please select and copy the text manually.");
    }
  }

  return (
    <div>
      <p style={{ color: portalTheme.textMuted, fontSize: 13, marginBottom: 20, maxWidth: 560 }}>
        Review requests from people who don&apos;t yet have an invitation code. Approving generates a real
        invitation code you can copy and send.
      </p>

      {error && <div style={{ color: portalTheme.danger, fontSize: 13, marginBottom: 14 }}>{error}</div>}

      {requests.length === 0 && <div style={{ color: portalTheme.textMuted, fontSize: 13 }}>No requests yet.</div>}

      <div style={{ display: "grid", gap: 12 }}>
        {requests.map((r) => {
          const isExpanded = expandedId === r.id;
          return (
            <div
              key={r.id}
              style={{ background: portalTheme.panel, border: `1px solid ${portalTheme.panelBorder}`, borderRadius: 12, padding: "16px 20px" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", cursor: "pointer" }} onClick={() => setExpandedId(isExpanded ? null : r.id)}>
                <div>
                  <div style={{ color: portalTheme.textPrimary, fontWeight: 700, fontSize: 14 }}>
                    {r.name} <span style={{ color: portalTheme.textMuted, fontWeight: 400 }}>&middot; {r.organisation}</span>
                  </div>
                  <div style={{ color: portalTheme.textMuted, fontSize: 12 }}>
                    {r.email} &middot; {r.country} &middot; requested {new Date(r.requested_at).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: "capitalize",
                      color: r.status === "approved" ? "#34D399" : r.status === "rejected" ? portalTheme.danger : "#FBBF24",
                    }}
                  >
                    {r.status}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); setExpandedId(isExpanded ? null : r.id); }}
                    style={{ padding: "6px 12px", borderRadius: 6, border: `1px solid ${portalTheme.panelBorder}`, background: "transparent", color: portalTheme.textMuted, fontSize: 12, cursor: "pointer" }}
                  >
                    {isExpanded ? "Hide Details" : "Review Details"}
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${portalTheme.panelBorder}`, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                  <div>
                    <DetailRow label="Organisation / Family / Group Name" value={r.organisation} />
                    <DetailRow label="Country / Region" value={r.country} />
                    <DetailRow label="Family / Group Category" value={r.family_group_category} />
                  </div>
                  <div>
                    <DetailRow label="Primary Interest" value={r.primary_interest} />
                    <DetailRow label="Short Message" value={r.message} />
                    {r.status === "approved" && <DetailRow label="Invited Capital Circle" value={r.capital_circle} />}
                    {r.status === "approved" && <DetailRow label="Invitation Code" value={r.invitation_code} />}
                  </div>
                </div>
              )}

              {r.status === "pending" && (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${portalTheme.panelBorder}`, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }} onClick={(e) => e.stopPropagation()}>
                  <div>
                    <label style={labelStyle}>Capital Circle *</label>
                    <select
                      style={selectStyle}
                      value={chosenCircle[r.id] ?? ""}
                      onChange={(e) => setChosenCircle((prev) => ({ ...prev, [r.id]: e.target.value }))}
                    >
                      <option value="" disabled>
                        Select...
                      </option>
                      {CAPITAL_CIRCLES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={() => handleApprove(r)}
                    style={{ padding: "7px 14px", borderRadius: 6, border: "none", background: portalTheme.gold, color: portalTheme.goldText, fontWeight: 700, fontSize: 12, cursor: "pointer", alignSelf: "flex-end" }}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(r.id)}
                    style={{ padding: "7px 14px", borderRadius: 6, border: `1px solid ${portalTheme.panelBorder}`, background: "transparent", color: portalTheme.textMuted, fontSize: 12, cursor: "pointer", alignSelf: "flex-end" }}
                  >
                    Reject
                  </button>
                </div>
              )}

              {r.status === "approved" && r.invitation_code && r.capital_circle && (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${portalTheme.panelBorder}` }} onClick={(e) => e.stopPropagation()}>
                  <div style={{ color: portalTheme.textPrimary, fontSize: 13, fontWeight: 700, marginBottom: 8, fontFamily: "monospace" }}>
                    {r.invitation_code}
                  </div>
                  <button
                    onClick={() => handleCopy(r, r.capital_circle as string)}
                    style={{ padding: "6px 12px", borderRadius: 6, border: `1px solid ${portalTheme.panelBorder}`, background: "transparent", color: portalTheme.textPrimary, fontWeight: 700, fontSize: 12, cursor: "pointer" }}
                  >
                    {copiedId === r.id ? "Copied ✓" : "Copy Ready-to-Send Email"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function InvitationsPageInner() {
  const searchParams = useSearchParams();
  const [user, setUser] = useState<PortalSessionUser | null>(null);
  const [tab, setTab] = useState<"generate" | "requests">(searchParams.get("tab") === "requests" ? "requests" : "generate");

  useEffect(() => {
    setUser(getPortalSession());
  }, []);

  if (!user) return null;

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: "9px 4px",
    marginRight: 24,
    border: "none",
    borderBottom: active ? `2px solid ${portalTheme.gold}` : "2px solid transparent",
    background: "transparent",
    color: active ? portalTheme.textPrimary : portalTheme.textMuted,
    fontWeight: active ? 700 : 600,
    fontSize: 13,
    cursor: "pointer",
  });

  return (
    <div>
      <h1 style={{ color: portalTheme.textPrimary, fontSize: 20, fontWeight: 700, margin: "0 0 4px" }}>
        Invitations
      </h1>

      <div style={{ display: "flex", borderBottom: `1px solid ${portalTheme.panelBorder}`, marginTop: 16, marginBottom: 20 }}>
        <button style={tabStyle(tab === "generate")} onClick={() => setTab("generate")}>
          Generate Invitations
        </button>
        <button style={tabStyle(tab === "requests")} onClick={() => setTab("requests")}>
          Invitation Requests
        </button>
      </div>

      {tab === "generate" ? <GenerateInvitationsTab user={user} /> : <InvitationRequestsTab user={user} />}
    </div>
  );
}

export default function InvitationsPage() {
  return (
    <Suspense fallback={null}>
      <InvitationsPageInner />
    </Suspense>
  );
}
