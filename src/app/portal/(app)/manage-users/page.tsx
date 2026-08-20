"use client";

import { useEffect, useState } from "react";
import { getPortalSession, type PortalSessionUser } from "@/lib/portal/session";
import { assignAdvisor, deletePortalUser, listAllPortalUsers, type ManagedUser } from "@/lib/portal/adminAuth";
import { portalTheme } from "@/lib/portal/theme";

const roleColor: Record<string, string> = {
  super_admin: portalTheme.gold,
  admin: "#60A5FA",
  circle_member: portalTheme.textMuted,
};

export default function ManageUsersPage() {
  const [user, setUser] = useState<PortalSessionUser | null>(null);
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  async function load() {
    try {
      setUsers(await listAllPortalUsers());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load accounts");
    }
  }

  useEffect(() => {
    setUser(getPortalSession());
    load();
  }, []);

  async function handleDelete(targetId: string) {
    if (!user) return;
    try {
      await deletePortalUser(targetId, user.id);
      setConfirmingId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete account");
    }
  }

  async function handleAssign(memberId: string, adminId: string) {
    try {
      await assignAdvisor(memberId, adminId || null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign advisor");
    }
  }

  if (!user) return null;

  const advisors = users.filter((u) => u.role === "admin" || u.role === "super_admin");

  return (
    <div>
      <h1 style={{ color: portalTheme.textPrimary, fontSize: 20, fontWeight: 700, margin: "0 0 4px" }}>
        Manage User Accounts
      </h1>
      <p style={{ color: portalTheme.textMuted, fontSize: 13, marginBottom: 20 }}>
        Delete Admin or Circle Member accounts. Super Admin accounts and your own account cannot be deleted here.
      </p>

      {error && <div style={{ color: portalTheme.danger, fontSize: 13, marginBottom: 14 }}>{error}</div>}

      <div
        style={{
          background: portalTheme.panel,
          border: `1px solid ${portalTheme.panelBorder}`,
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        {users.map((u) => {
          const isSelf = u.id === user.id;
          const isSuperAdmin = u.role === "super_admin";
          const isConfirming = confirmingId === u.id;
          return (
            <div
              key={u.id}
              style={{
                padding: "14px 20px",
                borderBottom: `1px solid ${portalTheme.panelBorder}`,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                <div>
                  <div style={{ color: portalTheme.textPrimary, fontWeight: 700, fontSize: 13.5 }}>
                    {u.name} {isSelf && <span style={{ color: portalTheme.textMuted, fontWeight: 400 }}>(you)</span>}
                  </div>
                  <div style={{ color: portalTheme.textMuted, fontSize: 12 }}>{u.email}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: "capitalize",
                      color: roleColor[u.role] ?? portalTheme.textMuted,
                    }}
                  >
                    {u.role.replace(/_/g, " ")}
                  </span>
                  {!isSelf && !isSuperAdmin && (
                  isConfirming ? (
                    <>
                      <span style={{ color: portalTheme.textMuted, fontSize: 12 }}>Delete this account?</span>
                      <button
                        onClick={() => handleDelete(u.id)}
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
                      onClick={() => setConfirmingId(u.id)}
                      style={{ padding: "6px 12px", borderRadius: 6, border: `1px solid ${portalTheme.panelBorder}`, background: "transparent", color: portalTheme.danger, fontSize: 12, cursor: "pointer" }}
                    >
                      Delete
                    </button>
                  )
                  )}
                </div>
              </div>

              {u.role === "circle_member" && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: portalTheme.textMuted, textTransform: "uppercase", letterSpacing: ".5px" }}>
                    Assigned Advisor
                  </span>
                  <select
                    value={u.assigned_admin_id ?? ""}
                    onChange={(e) => handleAssign(u.id, e.target.value)}
                    style={{
                      padding: "5px 8px",
                      borderRadius: 6,
                      border: `1px solid ${portalTheme.inputBorder}`,
                      background: portalTheme.inputBackground,
                      color: portalTheme.textPrimary,
                      fontSize: 11.5,
                    }}
                  >
                    <option value="">Unassigned</option>
                    {advisors.map((a) => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
