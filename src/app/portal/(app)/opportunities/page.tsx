"use client";

import { useEffect, useState } from "react";
import { getPortalSession, type PortalSessionUser } from "@/lib/portal/session";
import { portalTheme } from "@/lib/portal/theme";
import {
  applyToOpportunity,
  getMyApplications,
  listPublishedOpportunities,
  type Application,
  type Opportunity,
} from "@/lib/portal/content";
import { markOpportunitiesSeen } from "@/lib/portal/notifications";

const panelStyle: React.CSSProperties = {
  background: portalTheme.panel,
  border: `1px solid ${portalTheme.panelBorder}`,
  borderRadius: 12,
  padding: "20px 22px",
};

export default function OpportunitiesPage() {
  const [user, setUser] = useState<PortalSessionUser | null>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [applyingTo, setApplyingTo] = useState<string | null>(null);
  const [applyMessage, setApplyMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load(u: PortalSessionUser) {
    setLoading(true);
    try {
      const opps = await listPublishedOpportunities();
      setOpportunities(opps);
      if (u.role === "circle_member") {
        setApplications(await getMyApplications(u.id));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load opportunities");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const session = getPortalSession();
    if (!session) return;
    setUser(session);
    if (session.role === "circle_member") markOpportunitiesSeen(session.id);
    load(session);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleApply(opportunityId: string) {
    if (!user) return;
    try {
      await applyToOpportunity(opportunityId, user.id, applyMessage);
      setApplyingTo(null);
      setApplyMessage("");
      await load(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to apply");
    }
  }

  function applicationFor(opportunityId: string) {
    return applications.find((a) => a.opportunity_id === opportunityId);
  }

  if (!user) return null;

  return (
    <div>
      <h1 style={{ color: portalTheme.textPrimary, fontSize: 20, fontWeight: 700, margin: "0 0 4px" }}>
        Investment Opportunities
      </h1>
      <p style={{ color: portalTheme.textMuted, fontSize: 13, marginBottom: 20 }}>
        {user.role === "circle_member"
          ? "Browse published opportunities and apply."
          : "Published opportunities visible to Circle Members."}
      </p>

      {error && <div style={{ color: portalTheme.danger, fontSize: 13, marginBottom: 14 }}>{error}</div>}
      {loading && <div style={{ color: portalTheme.textMuted, fontSize: 13 }}>Loading...</div>}

      {!loading && opportunities.length === 0 && (
        <div style={{ color: portalTheme.textMuted, fontSize: 13 }}>No published opportunities yet.</div>
      )}

      <div style={{ display: "grid", gap: 14 }}>
        {opportunities.map((opp) => {
          const application = applicationFor(opp.id);
          return (
            <div key={opp.id} style={panelStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                <div>
                  <div style={{ color: portalTheme.textMuted, fontSize: 11, textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 4 }}>
                    {opp.category}
                  </div>
                  <div style={{ color: portalTheme.textPrimary, fontWeight: 700, fontSize: 14.5, marginBottom: 8 }}>
                    {opp.title}
                  </div>
                  <p style={{ color: portalTheme.textSecondary, fontSize: 13, lineHeight: 1.6, margin: 0, maxWidth: 640 }}>
                    {opp.description}
                  </p>
                </div>

                {user.role === "circle_member" && (
                  <div style={{ flexShrink: 0 }}>
                    {application ? (
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: "5px 10px",
                          borderRadius: 20,
                          textTransform: "capitalize",
                          color:
                            application.status === "approved"
                              ? "#34D399"
                              : application.status === "rejected"
                              ? portalTheme.danger
                              : "#FBBF24",
                          background: "rgba(255,255,255,0.06)",
                        }}
                      >
                        {application.status}
                      </span>
                    ) : applyingTo === opp.id ? (
                      <div style={{ minWidth: 220 }}>
                        <textarea
                          value={applyMessage}
                          onChange={(e) => setApplyMessage(e.target.value)}
                          placeholder="Why are you interested?"
                          rows={3}
                          style={{
                            width: "100%",
                            padding: 8,
                            borderRadius: 6,
                            border: `1px solid ${portalTheme.inputBorder}`,
                            background: portalTheme.inputBackground,
                            color: portalTheme.textPrimary,
                            fontSize: 12.5,
                            marginBottom: 6,
                            boxSizing: "border-box",
                          }}
                        />
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            onClick={() => handleApply(opp.id)}
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
                            Submit
                          </button>
                          <button
                            onClick={() => setApplyingTo(null)}
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
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setApplyingTo(opp.id)}
                        style={{
                          padding: "7px 14px",
                          borderRadius: 8,
                          border: "none",
                          background: portalTheme.gold,
                          color: portalTheme.goldText,
                          fontWeight: 700,
                          fontSize: 12.5,
                          cursor: "pointer",
                        }}
                      >
                        Apply
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
