"use client";

import { useEffect, useState } from "react";
import { getPortalSession, type PortalSessionUser } from "@/lib/portal/session";
import { portalTheme } from "@/lib/portal/theme";
import { CAPITAL_CIRCLES } from "@/lib/portal/content";
import { deletePortalUser, listAllPortalUsers, type ManagedUser } from "@/lib/portal/adminAuth";
import { approveMemberRequest, listMemberRequests, rejectMemberRequest, type MemberRequest } from "@/lib/portal/memberAuth";

const selectStyle: React.CSSProperties = {
  padding: "7px 10px",
  borderRadius: 6,
  border: `1px solid ${portalTheme.inputBorder}`,
  background: portalTheme.inputBackground,
  color: portalTheme.textPrimary,
  fontSize: 12,
};

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

export default function MemberRequestsPage() {
  const [user, setUser] = useState<PortalSessionUser | null>(null);
  const [requests, setRequests] = useState<MemberRequest[]>([]);
  const [advisors, setAdvisors] = useState<ManagedUser[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [chosenAdvisor, setChosenAdvisor] = useState<Record<string, string>>({});
  const [chosenCircle, setChosenCircle] = useState<Record<string, string>>({});
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const [reqs, users] = await Promise.all([listMemberRequests(), listAllPortalUsers()]);
      setRequests(reqs);
      setAdvisors(users.filter((u) => u.role === "admin" || u.role === "super_admin"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load requests");
    }
  }

  useEffect(() => {
    setUser(getPortalSession());
    load();
  }, []);

  async function handleApprove(r: MemberRequest) {
    if (!user) return;
    const advisorId = chosenAdvisor[r.id];
    if (!advisorId) {
      setError("Please select an Assigned Advisor before approving.");
      return;
    }
    try {
      await approveMemberRequest(r.id, user.id, advisorId, chosenCircle[r.id] ?? r.capital_circle);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve request");
    }
  }

  async function handleReject(id: string) {
    if (!user) return;
    try {
      await rejectMemberRequest(id, user.id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reject request");
    }
  }

  async function handleDeleteAccount(accountId: string) {
    if (!user) return;
    try {
      await deletePortalUser(accountId, user.id);
      setConfirmingDeleteId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete account");
    }
  }

  if (!user) return null;

  return (
    <div>
      <h1 style={{ color: portalTheme.textPrimary, fontSize: 20, fontWeight: 700, margin: "0 0 4px" }}>
        Circle Member Registration Requests
      </h1>
      <p style={{ color: portalTheme.textMuted, fontSize: 13, marginBottom: 20 }}>
        Review submitted registrations. Approving assigns a Capital Advisor and creates the member&apos;s account.
      </p>

      {error && <div style={{ color: portalTheme.danger, fontSize: 13, marginBottom: 14 }}>{error}</div>}
      {requests.length === 0 && <div style={{ color: portalTheme.textMuted, fontSize: 13 }}>No requests yet.</div>}

      <div style={{ display: "grid", gap: 12 }}>
        {requests.map((r) => {
          const expanded = expandedId === r.id;
          return (
            <div
              key={r.id}
              style={{
                background: portalTheme.panel,
                border: `1px solid ${portalTheme.panelBorder}`,
                borderRadius: 12,
                padding: "16px 20px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <div style={{ color: portalTheme.textPrimary, fontWeight: 700, fontSize: 14 }}>{r.name}</div>
                  <div style={{ color: portalTheme.textMuted, fontSize: 12 }}>
                    {r.email} &middot; {r.capital_circle} &middot; requested {new Date(r.requested_at).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: "capitalize",
                      color:
                        r.status === "approved" && !r.created_user_id
                          ? portalTheme.textMuted
                          : r.status === "approved"
                          ? "#34D399"
                          : r.status === "rejected"
                          ? portalTheme.danger
                          : "#FBBF24",
                    }}
                  >
                    {r.status === "approved" && !r.created_user_id ? "Approved · Account Deleted" : r.status}
                  </span>
                  <button
                    onClick={() => setExpandedId(expanded ? null : r.id)}
                    style={{ padding: "6px 12px", borderRadius: 6, border: `1px solid ${portalTheme.panelBorder}`, background: "transparent", color: portalTheme.textMuted, fontSize: 12, cursor: "pointer" }}
                  >
                    {expanded ? "Hide Details" : "Review Details"}
                  </button>
                </div>
              </div>

              {expanded && (
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${portalTheme.panelBorder}`, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                  <div>
                    <DetailRow label="Phone" value={r.phone} />
                    <DetailRow label="Organisation" value={r.organisation} />
                    <DetailRow label="Role / Title" value={r.role_title} />
                    <DetailRow label="Location" value={[r.city, r.country].filter(Boolean).join(", ")} />
                    <DetailRow label="LinkedIn / Website" value={r.linkedin_or_website} />
                    <DetailRow label="Sector Interest" value={r.sector_interests?.join(" · ")} />
                    <DetailRow label="Invitation Code" value={r.invitation_code} />
                    <DetailRow label="Invited At" value={r.invited_at ? new Date(r.invited_at).toLocaleString() : null} />
                  </div>
                  <div>
                    <DetailRow label="Family / Group Category" value={r.family_or_group_background} />
                    <DetailRow label="Geography Focus" value={r.geography_focus?.join(" · ")} />
                    <DetailRow label="Capital & Participation Interests" value={r.capital_participation_interests?.join(" · ")} />
                    <DetailRow label="Investment Horizon" value={r.investment_horizon} />
                    <DetailRow label="Indicative Investment Orientation" value={r.risk_preference} />
                    <DetailRow label="ESG Alignment" value={r.esg_alignment_interests?.join(" · ")} />
                    <DetailRow label="Strategic & Impact Objectives" value={r.strategic_impact_objectives?.join(" · ")} />
                    <DetailRow label="Additional Circle Relevance" value={r.additional_circle_relevance?.join(" · ")} />
                    <DetailRow label="Additional Notes" value={r.additional_notes} />
                  </div>
                </div>
              )}

              {r.status === "pending" && (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${portalTheme.panelBorder}`, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <select
                    style={selectStyle}
                    value={chosenAdvisor[r.id] ?? ""}
                    onChange={(e) => setChosenAdvisor((prev) => ({ ...prev, [r.id]: e.target.value }))}
                  >
                    <option value="">Assign Advisor...</option>
                    {advisors.map((a) => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                  <select
                    style={selectStyle}
                    value={chosenCircle[r.id] ?? r.capital_circle}
                    onChange={(e) => setChosenCircle((prev) => ({ ...prev, [r.id]: e.target.value }))}
                  >
                    {CAPITAL_CIRCLES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleApprove(r)}
                    style={{ padding: "7px 14px", borderRadius: 6, border: "none", background: portalTheme.gold, color: portalTheme.goldText, fontWeight: 700, fontSize: 12, cursor: "pointer" }}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(r.id)}
                    style={{ padding: "7px 14px", borderRadius: 6, border: `1px solid ${portalTheme.panelBorder}`, background: "transparent", color: portalTheme.textMuted, fontSize: 12, cursor: "pointer" }}
                  >
                    Reject
                  </button>
                </div>
              )}

              {r.status === "approved" && r.created_user_id && (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${portalTheme.panelBorder}`, display: "flex", alignItems: "center", gap: 10 }}>
                  {confirmingDeleteId === r.id ? (
                    <>
                      <span style={{ color: portalTheme.textMuted, fontSize: 12 }}>Delete this Circle Member&apos;s account?</span>
                      <button
                        onClick={() => handleDeleteAccount(r.created_user_id as string)}
                        style={{ padding: "6px 12px", borderRadius: 6, border: "none", background: portalTheme.danger, color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer" }}
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setConfirmingDeleteId(null)}
                        style={{ padding: "6px 12px", borderRadius: 6, border: `1px solid ${portalTheme.panelBorder}`, background: "transparent", color: portalTheme.textMuted, fontSize: 12, cursor: "pointer" }}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setConfirmingDeleteId(r.id)}
                      style={{ padding: "6px 12px", borderRadius: 6, border: `1px solid ${portalTheme.panelBorder}`, background: "transparent", color: portalTheme.danger, fontSize: 12, cursor: "pointer" }}
                    >
                      Delete Account
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
