"use client";

import { useEffect, useState } from "react";
import { getPortalSession, type PortalSessionUser } from "@/lib/portal/session";
import { portalTheme } from "@/lib/portal/theme";
import { approveAdminRequest, listAdminRequests, rejectAdminRequest, type AdminRequest } from "@/lib/portal/adminAuth";

export default function AdminRequestsPage() {
  const [user, setUser] = useState<PortalSessionUser | null>(null);
  const [requests, setRequests] = useState<AdminRequest[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setRequests(await listAdminRequests());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load requests");
    }
  }

  useEffect(() => {
    setUser(getPortalSession());
    load();
  }, []);

  async function handleApprove(id: string) {
    if (!user) return;
    try {
      await approveAdminRequest(id, user.id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve request");
    }
  }

  async function handleReject(id: string) {
    if (!user) return;
    try {
      await rejectAdminRequest(id, user.id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reject request");
    }
  }

  if (!user) return null;

  return (
    <div>
      <h1 style={{ color: portalTheme.textPrimary, fontSize: 20, fontWeight: 700, margin: "0 0 4px" }}>
        Admin Account Requests
      </h1>
      <p style={{ color: portalTheme.textMuted, fontSize: 13, marginBottom: 20 }}>
        Approve or reject requests for new Admin accounts.
      </p>

      {error && <div style={{ color: portalTheme.danger, fontSize: 13, marginBottom: 14 }}>{error}</div>}

      {requests.length === 0 && <div style={{ color: portalTheme.textMuted, fontSize: 13 }}>No requests yet.</div>}

      <div style={{ display: "grid", gap: 12 }}>
        {requests.map((r) => (
          <div
            key={r.id}
            style={{
              background: portalTheme.panel,
              border: `1px solid ${portalTheme.panelBorder}`,
              borderRadius: 12,
              padding: "14px 20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div>
              <div style={{ color: portalTheme.textPrimary, fontWeight: 700, fontSize: 14 }}>{r.name}</div>
              <div style={{ color: portalTheme.textMuted, fontSize: 12 }}>
                {r.email} &middot; requested {new Date(r.requested_at).toLocaleDateString()}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "capitalize",
                  color:
                    r.status === "approved" ? "#34D399" : r.status === "rejected" ? portalTheme.danger : "#FBBF24",
                }}
              >
                {r.status}
              </span>
              {r.status === "pending" && (
                <>
                  <button
                    onClick={() => handleApprove(r.id)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 6,
                      border: "none",
                      background: portalTheme.gold,
                      color: portalTheme.goldText,
                      fontWeight: 700,
                      fontSize: 12,
                      cursor: "pointer",
                    }}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(r.id)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 6,
                      border: `1px solid ${portalTheme.panelBorder}`,
                      background: "transparent",
                      color: portalTheme.textMuted,
                      fontSize: 12,
                      cursor: "pointer",
                    }}
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
