"use client";

import { useEffect, useState } from "react";
import { portalTheme } from "@/lib/portal/theme";
import { listApplicationsWithDetails, reviewApplication, type ApplicationWithDetails } from "@/lib/portal/content";

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationWithDetails[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setApplications(await listApplicationsWithDetails());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load applications");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleReview(id: string, status: "approved" | "rejected") {
    try {
      await reviewApplication(id, status);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update application");
    }
  }

  return (
    <div>
      <h1 style={{ color: portalTheme.textPrimary, fontSize: 20, fontWeight: 700, margin: "0 0 4px" }}>Application Review</h1>
      <p style={{ color: portalTheme.textMuted, fontSize: 13, marginBottom: 20 }}>
        See who applied to which opportunity.
      </p>

      {error && <div style={{ color: portalTheme.danger, fontSize: 13, marginBottom: 14 }}>{error}</div>}

      {applications.length === 0 && <div style={{ color: portalTheme.textMuted, fontSize: 13 }}>No applications yet.</div>}

      <div
        style={{
          background: portalTheme.panel,
          border: `1px solid ${portalTheme.panelBorder}`,
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        {applications.map((app) => (
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
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "capitalize",
                  color: app.status === "approved" ? "#34D399" : app.status === "rejected" ? portalTheme.danger : "#FBBF24",
                }}
              >
                {app.status}
              </span>
              {app.status === "pending" && (
                <>
                  <button
                    onClick={() => handleReview(app.id, "approved")}
                    style={{ padding: "6px 12px", borderRadius: 6, border: "none", background: portalTheme.gold, color: portalTheme.goldText, fontWeight: 700, fontSize: 12, cursor: "pointer" }}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReview(app.id, "rejected")}
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
    </div>
  );
}
