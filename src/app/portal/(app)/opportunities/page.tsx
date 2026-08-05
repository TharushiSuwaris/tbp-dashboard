"use client";

import { useEffect, useMemo, useState } from "react";
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

const selectStyle: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 8,
  border: `1px solid ${portalTheme.inputBorder}`,
  background: portalTheme.inputBackground,
  color: portalTheme.textPrimary,
  fontSize: 12.5,
};

export default function OpportunitiesPage() {
  const [user, setUser] = useState<PortalSessionUser | null>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [regionFilter, setRegionFilter] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
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

  const regions = useMemo(
    () => Array.from(new Set(opportunities.map((o) => o.region).filter((r): r is string => !!r))).sort(),
    [opportunities]
  );
  const filtered = regionFilter ? opportunities.filter((o) => o.region === regionFilter) : opportunities;

  async function handleApply(opportunityId: string) {
    if (!user) return;
    try {
      await applyToOpportunity(opportunityId, user.id, applyMessage);
      setApplyingTo(null);
      setApplyMessage("");
      await load(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit request");
    }
  }

  function applicationFor(opportunityId: string) {
    return applications.find((a) => a.opportunity_id === opportunityId);
  }

  if (!user) return null;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ color: portalTheme.textPrimary, fontSize: 20, fontWeight: 700, margin: "0 0 4px" }}>
            Investment Opportunities
          </h1>
          <p style={{ color: portalTheme.textMuted, fontSize: 13, margin: 0 }}>
            {user.role === "circle_member"
              ? "Browse published opportunities and request a partnership."
              : "Published opportunities visible to Circle Members."}
          </p>
        </div>
        {regions.length > 0 && (
          <select style={selectStyle} value={regionFilter} onChange={(e) => setRegionFilter(e.target.value)}>
            <option value="">All Regions</option>
            {regions.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        )}
      </div>

      {error && <div style={{ color: portalTheme.danger, fontSize: 13, marginBottom: 14 }}>{error}</div>}
      {loading && <div style={{ color: portalTheme.textMuted, fontSize: 13 }}>Loading...</div>}
      {!loading && filtered.length === 0 && (
        <div style={{ color: portalTheme.textMuted, fontSize: 13 }}>No published opportunities match this filter.</div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
        {filtered.map((opp) => {
          const application = applicationFor(opp.id);
          const expanded = expandedId === opp.id;
          return (
            <div
              key={opp.id}
              style={{
                background: portalTheme.panel,
                border: `1px solid ${portalTheme.panelBorder}`,
                borderRadius: 12,
                padding: "20px 22px",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                {opp.region && (
                  <span style={{ fontSize: 10, fontWeight: 700, color: portalTheme.gold, background: "rgba(196,153,42,0.12)", padding: "3px 9px", borderRadius: 20 }}>
                    {opp.region}
                  </span>
                )}
                <span style={{ fontSize: 10, fontWeight: 600, color: portalTheme.textMuted, textTransform: "uppercase", letterSpacing: ".5px", padding: "3px 0" }}>
                  {opp.category}
                </span>
              </div>

              <div style={{ color: portalTheme.textPrimary, fontWeight: 700, fontSize: 15, marginBottom: 10 }}>
                {opp.title}
              </div>

              <p
                style={{
                  color: portalTheme.textSecondary,
                  fontSize: 13,
                  lineHeight: 1.6,
                  margin: "0 0 14px",
                  flex: 1,
                  ...(expanded ? {} : { display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }),
                }}
              >
                {opp.description}
              </p>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginTop: "auto" }}>
                <button
                  onClick={() => setExpandedId(expanded ? null : opp.id)}
                  style={{ background: "none", border: "none", color: portalTheme.gold, fontSize: 12.5, fontWeight: 600, cursor: "pointer", padding: 0 }}
                >
                  {expanded ? "Show Less" : "Learn More"}
                </button>

                {user.role === "circle_member" && (
                  application ? (
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "5px 10px",
                        borderRadius: 20,
                        textTransform: "capitalize",
                        color: application.status === "approved" ? "#34D399" : application.status === "rejected" ? portalTheme.danger : "#FBBF24",
                        background: "rgba(255,255,255,0.06)",
                      }}
                    >
                      {application.status}
                    </span>
                  ) : (
                    <button
                      onClick={() => setApplyingTo(applyingTo === opp.id ? null : opp.id)}
                      style={{ padding: "7px 14px", borderRadius: 8, border: "none", background: portalTheme.gold, color: portalTheme.goldText, fontWeight: 700, fontSize: 12.5, cursor: "pointer" }}
                    >
                      Request Partnership
                    </button>
                  )
                )}
              </div>

              {applyingTo === opp.id && (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${portalTheme.panelBorder}` }}>
                  <textarea
                    value={applyMessage}
                    onChange={(e) => setApplyMessage(e.target.value)}
                    placeholder="Why are you interested in partnering on this project?"
                    rows={3}
                    style={{
                      width: "100%",
                      padding: 8,
                      borderRadius: 6,
                      border: `1px solid ${portalTheme.inputBorder}`,
                      background: portalTheme.inputBackground,
                      color: portalTheme.textPrimary,
                      fontSize: 12.5,
                      marginBottom: 8,
                      boxSizing: "border-box",
                    }}
                  />
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      onClick={() => handleApply(opp.id)}
                      style={{ padding: "6px 12px", borderRadius: 6, border: "none", background: portalTheme.gold, color: portalTheme.goldText, fontWeight: 700, fontSize: 12, cursor: "pointer" }}
                    >
                      Submit Request
                    </button>
                    <button
                      onClick={() => setApplyingTo(null)}
                      style={{ padding: "6px 12px", borderRadius: 6, border: `1px solid ${portalTheme.panelBorder}`, background: "transparent", color: portalTheme.textMuted, fontSize: 12, cursor: "pointer" }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
