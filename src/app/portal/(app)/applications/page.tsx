"use client";

import { useEffect, useState } from "react";
import { portalTheme } from "@/lib/portal/theme";
import { getPortalSession, type PortalSessionUser } from "@/lib/portal/session";
import {
  listApplicationsWithDetails,
  reviewApplication,
  listEventInvitationRequestsWithDetails,
  reviewEventInvitationRequest,
  type ApplicationWithDetails,
  type EventInvitationWithDetails,
} from "@/lib/portal/content";

function statusColor(status: string): string {
  return status === "approved" ? "#34D399" : status === "rejected" ? portalTheme.danger : "#FBBF24";
}

export default function ApplicationsPage() {
  const [user, setUser] = useState<PortalSessionUser | null>(null);
  const [applications, setApplications] = useState<ApplicationWithDetails[]>([]);
  const [invitationRequests, setInvitationRequests] = useState<EventInvitationWithDetails[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const [apps, invites] = await Promise.all([listApplicationsWithDetails(), listEventInvitationRequestsWithDetails()]);
      setApplications(apps);
      setInvitationRequests(invites);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load applications");
    }
  }

  useEffect(() => {
    setUser(getPortalSession());
    load();
  }, []);

  // A plain Admin only sees enquiries from Circle Members assigned to them;
  // super_admin sees every enquiry regardless of assignment.
  const visibleApplications =
    user?.role === "admin" ? applications.filter((a) => a.applicant_assigned_admin_id === user.id) : applications;
  const visibleInvitationRequests =
    user?.role === "admin" ? invitationRequests.filter((r) => r.member_assigned_admin_id === user.id) : invitationRequests;

  async function handleReview(app: ApplicationWithDetails, status: "approved" | "rejected") {
    if (!user) return;
    try {
      await reviewApplication(app.id, status, user.id, app.applicant_id, app.opportunity_title);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update application");
    }
  }

  async function handleReviewInvitation(req: EventInvitationWithDetails, status: "approved" | "rejected") {
    if (!user) return;
    try {
      await reviewEventInvitationRequest(req.id, status, user.id, req.member_id, req.event_title);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update invitation request");
    }
  }

  return (
    <div>
      <h1 style={{ color: portalTheme.textPrimary, fontSize: 20, fontWeight: 700, margin: "0 0 4px" }}>Application Review</h1>
      <p style={{ color: portalTheme.textMuted, fontSize: 13, marginBottom: 20 }}>
        See who applied to which opportunity, and who&apos;s requested an event invitation.
      </p>

      {error && <div style={{ color: portalTheme.danger, fontSize: 13, marginBottom: 14 }}>{error}</div>}

      <div style={{ color: portalTheme.textPrimary, fontWeight: 700, fontSize: 14, marginBottom: 10 }}>
        Project Applications
      </div>
      {visibleApplications.length === 0 && (
        <div style={{ color: portalTheme.textMuted, fontSize: 13, marginBottom: 24 }}>No applications yet.</div>
      )}
      {visibleApplications.length > 0 && (
        <div
          style={{
            background: portalTheme.panel,
            border: `1px solid ${portalTheme.panelBorder}`,
            borderRadius: 12,
            overflow: "hidden",
            marginBottom: 28,
          }}
        >
          {visibleApplications.map((app) => (
            <div
              key={app.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
                padding: "14px 20px",
                borderBottom: `1px solid ${portalTheme.panelBorder}`,
              }}
            >
              <div>
                <div style={{ color: portalTheme.textPrimary, fontWeight: 700, fontSize: 13.5 }}>{app.opportunity_title}</div>
                <div style={{ color: portalTheme.textMuted, fontSize: 12 }}>
                  {app.applicant_name} &middot; {app.applicant_email}
                </div>
                {app.message && <div style={{ color: portalTheme.textSecondary, fontSize: 12.5, marginTop: 4, maxWidth: 480 }}>&ldquo;{app.message}&rdquo;</div>}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: "capitalize", color: statusColor(app.status) }}>
                  {app.status}
                </span>
                {app.status === "pending" && (
                  <>
                    <button
                      onClick={() => handleReview(app, "approved")}
                      style={{ padding: "6px 12px", borderRadius: 6, border: "none", background: portalTheme.gold, color: portalTheme.goldText, fontWeight: 700, fontSize: 12, cursor: "pointer" }}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReview(app, "rejected")}
                      style={{ padding: "6px 12px", borderRadius: 6, border: `1px solid ${portalTheme.panelBorder}`, background: "transparent", color: portalTheme.textMuted, fontSize: 12, cursor: "pointer" }}
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ color: portalTheme.textPrimary, fontWeight: 700, fontSize: 14, marginBottom: 10 }}>
        Event Invitation Requests
      </div>
      {visibleInvitationRequests.length === 0 && (
        <div style={{ color: portalTheme.textMuted, fontSize: 13 }}>No invitation requests yet.</div>
      )}
      {visibleInvitationRequests.length > 0 && (
        <div
          style={{
            background: portalTheme.panel,
            border: `1px solid ${portalTheme.panelBorder}`,
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          {visibleInvitationRequests.map((req) => (
            <div
              key={req.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
                padding: "14px 20px",
                borderBottom: `1px solid ${portalTheme.panelBorder}`,
              }}
            >
              <div>
                <div style={{ color: portalTheme.textPrimary, fontWeight: 700, fontSize: 13.5 }}>{req.event_title}</div>
                <div style={{ color: portalTheme.textMuted, fontSize: 12 }}>
                  {req.member_name} &middot; {req.member_email}
                </div>
                {req.message && <div style={{ color: portalTheme.textSecondary, fontSize: 12.5, marginTop: 4, maxWidth: 480 }}>&ldquo;{req.message}&rdquo;</div>}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: "capitalize", color: statusColor(req.status) }}>
                  {req.status}
                </span>
                {req.status === "pending" && (
                  <>
                    <button
                      onClick={() => handleReviewInvitation(req, "approved")}
                      style={{ padding: "6px 12px", borderRadius: 6, border: "none", background: portalTheme.gold, color: portalTheme.goldText, fontWeight: 700, fontSize: 12, cursor: "pointer" }}
                    >
                      Grant
                    </button>
                    <button
                      onClick={() => handleReviewInvitation(req, "rejected")}
                      style={{ padding: "6px 12px", borderRadius: 6, border: `1px solid ${portalTheme.panelBorder}`, background: "transparent", color: portalTheme.textMuted, fontSize: 12, cursor: "pointer" }}
                    >
                      Decline
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
