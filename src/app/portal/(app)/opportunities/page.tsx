"use client";

import { useEffect, useMemo, useState } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { getPortalSession, type PortalSessionUser } from "@/lib/portal/session";
import { portalTheme } from "@/lib/portal/theme";
import {
  applyToOpportunity,
  getMyApplications,
  listPublishedOpportunities,
  listSavedOpportunities,
  saveOpportunityInterest,
  unsaveOpportunityInterest,
  submitEnquiry,
  OPPORTUNITY_SECTORS,
  CAPITAL_CIRCLES,
  PARTICIPATION_TYPES,
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

const searchStyle: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 8,
  border: `1px solid ${portalTheme.inputBorder}`,
  background: portalTheme.inputBackground,
  color: portalTheme.textPrimary,
  fontSize: 12.5,
  flex: 1,
  minWidth: 200,
};

const tagStyle = (bg: string, color: string): React.CSSProperties => ({
  fontSize: 10,
  fontWeight: 700,
  color,
  background: bg,
  padding: "3px 9px",
  borderRadius: 20,
});

const actionButtonStyle: React.CSSProperties = {
  flex: 1,
  padding: "8px 10px",
  borderRadius: 7,
  border: `1px solid ${portalTheme.panelBorder}`,
  background: "transparent",
  color: portalTheme.textSecondary,
  fontSize: 11.5,
  fontWeight: 600,
  cursor: "pointer",
  textAlign: "center",
};

export default function OpportunitiesPage() {
  const [user, setUser] = useState<PortalSessionUser | null>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [regionFilter, setRegionFilter] = useState("");
  const [sectorFilter, setSectorFilter] = useState("");
  const [circleFilter, setCircleFilter] = useState("");
  const [participationFilter, setParticipationFilter] = useState("");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [applyingTo, setApplyingTo] = useState<string | null>(null);
  const [applyMessage, setApplyMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [requestedActions, setRequestedActions] = useState<Set<string>>(new Set());

  async function load(u: PortalSessionUser) {
    setLoading(true);
    try {
      const opps = await listPublishedOpportunities();
      setOpportunities(opps);
      if (u.role === "circle_member") {
        setApplications(await getMyApplications(u.id));
        const saved = await listSavedOpportunities(u.id);
        setSavedIds(new Set(saved.map((s) => s.opportunity_id)));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load opportunities");
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleSave(opportunityId: string) {
    if (!user) return;
    const alreadySaved = savedIds.has(opportunityId);
    try {
      if (alreadySaved) {
        await unsaveOpportunityInterest(user.id, opportunityId);
        setSavedIds((prev) => { const next = new Set(prev); next.delete(opportunityId); return next; });
      } else {
        await saveOpportunityInterest(user.id, opportunityId);
        setSavedIds((prev) => new Set(prev).add(opportunityId));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update saved interest");
    }
  }

  async function handleRequest(opp: Opportunity, kind: "briefing" | "roundtable") {
    if (!user) return;
    const key = `${opp.id}:${kind}`;
    try {
      if (kind === "briefing") {
        await submitEnquiry({
          memberId: user.id,
          enquiryType: "Private briefing request",
          subject: `Private Briefing Request: ${opp.title}`,
          message: `I would like to request a private briefing on ${opp.title}.`,
          relatedOpportunityId: opp.id,
        });
      } else {
        await submitEnquiry({
          memberId: user.id,
          enquiryType: "Roundtable participation request",
          subject: `Roundtable Invitation Request: ${opp.title}`,
          message: `I would like to request a roundtable invitation relating to ${opp.title}.`,
          relatedOpportunityId: opp.id,
        });
      }
      setRequestedActions((prev) => new Set(prev).add(key));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit request");
    }
  }

  useEffect(() => {
    const session = getPortalSession();
    if (!session) return;
    setUser(session);
    if (session.role === "circle_member") markOpportunitiesSeen(session.id);
    load(session);
  }, []);

  const regions = useMemo(
    () => Array.from(new Set(opportunities.map((o) => o.region).filter((r): r is string => !!r))).sort(),
    [opportunities]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return opportunities.filter((o) => {
      if (regionFilter && o.region !== regionFilter) return false;
      if (sectorFilter && !(o.sector ?? []).includes(sectorFilter)) return false;
      if (circleFilter && !(o.eligible_circles ?? []).includes(circleFilter)) return false;
      if (participationFilter && !(o.participation_types ?? []).includes(participationFilter)) return false;
      if (q) {
        const haystack = [o.title, o.category, o.description, ...(o.sector ?? [])].join(" ").toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [opportunities, regionFilter, sectorFilter, circleFilter, participationFilter, search]);

  async function handleApply(opportunityId: string, opportunityTitle: string) {
    if (!user) return;
    try {
      await applyToOpportunity(opportunityId, opportunityTitle, user.id, applyMessage);
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
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ color: portalTheme.textPrimary, fontSize: 20, fontWeight: 700, margin: "0 0 4px" }}>
          Curated Opportunities
        </h1>
        <p style={{ color: portalTheme.textMuted, fontSize: 13, margin: 0 }}>
          {user.role === "circle_member"
            ? "Explore curated TBP projects and request a partnership."
            : "Published opportunities visible to Circle Members."}
        </p>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
        <input
          style={searchStyle}
          placeholder="Search by project, geography, sector or keyword..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select style={selectStyle} value={regionFilter} onChange={(e) => setRegionFilter(e.target.value)}>
          <option value="">All Regions</option>
          {regions.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <select style={selectStyle} value={sectorFilter} onChange={(e) => setSectorFilter(e.target.value)}>
          <option value="">All Sectors</option>
          {OPPORTUNITY_SECTORS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select style={selectStyle} value={circleFilter} onChange={(e) => setCircleFilter(e.target.value)}>
          <option value="">All Eligible Circles</option>
          {CAPITAL_CIRCLES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select style={selectStyle} value={participationFilter} onChange={(e) => setParticipationFilter(e.target.value)}>
          <option value="">All Participation Types</option>
          {PARTICIPATION_TYPES.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
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
          const briefingRequested = requestedActions.has(`${opp.id}:briefing`);
          const roundtableRequested = requestedActions.has(`${opp.id}:roundtable`);
          const saved = savedIds.has(opp.id);
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
                position: "relative",
              }}
            >
              {user.role === "circle_member" && (
                <button
                  onClick={() => handleToggleSave(opp.id)}
                  aria-label={saved ? "Remove saved interest" : "Save interest"}
                  title={saved ? "Remove saved interest" : "Save interest"}
                  style={{
                    position: "absolute",
                    top: 14,
                    right: 14,
                    width: 28,
                    height: 28,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 6,
                    border: "none",
                    background: saved ? "rgba(58,159,192,0.14)" : "transparent",
                    color: saved ? portalTheme.gold : portalTheme.textMuted,
                    cursor: "pointer",
                  }}
                >
                  {saved ? <BookmarkCheck size={17} strokeWidth={1.8} /> : <Bookmark size={17} strokeWidth={1.8} />}
                </button>
              )}

              <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap", paddingRight: user.role === "circle_member" ? 30 : 0 }}>
                {opp.region && <span style={tagStyle("rgba(58,159,192,0.12)", portalTheme.gold)}>{opp.region}</span>}
                {(opp.sector ?? []).map((s) => (
                  <span key={s} style={tagStyle("rgba(27,42,61,0.06)", portalTheme.textMuted)}>{s}</span>
                ))}
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

              {(opp.eligible_circles?.length || opp.participation_types?.length) ? (
                <div style={{ fontSize: 11.5, color: portalTheme.textMuted, lineHeight: 1.9, marginBottom: 12 }}>
                  {!!opp.eligible_circles?.length && (
                    <div><strong style={{ color: portalTheme.textSecondary }}>Available to:</strong> {opp.eligible_circles.join(" · ")}</div>
                  )}
                  {!!opp.participation_types?.length && (
                    <div><strong style={{ color: portalTheme.textSecondary }}>Opportunities:</strong> {opp.participation_types.join(" · ")}</div>
                  )}
                </div>
              ) : null}

              <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 10, marginTop: "auto" }}>
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
                        background: "rgba(27,42,61,0.06)",
                      }}
                    >
                      {application.status}
                    </span>
                  ) : (
                    <button
                      onClick={() => setApplyingTo(applyingTo === opp.id ? null : opp.id)}
                      style={{ padding: "7px 14px", borderRadius: 8, border: "none", background: portalTheme.gold, color: portalTheme.goldText, fontWeight: 700, fontSize: 12.5, cursor: "pointer" }}
                    >
                      Express Interest
                    </button>
                  )
                )}
              </div>

              {user.role === "circle_member" && (
                <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                  <button onClick={() => setExpandedId(expanded ? null : opp.id)} style={actionButtonStyle}>
                    {expanded ? "Hide Details" : "View Details"}
                  </button>
                  <button
                    onClick={() => handleRequest(opp, "briefing")}
                    disabled={briefingRequested}
                    style={{ ...actionButtonStyle, opacity: briefingRequested ? 0.55 : 1, cursor: briefingRequested ? "default" : "pointer" }}
                  >
                    {briefingRequested ? "Briefing Requested ✓" : "Request Briefing"}
                  </button>
                  <button
                    onClick={() => handleRequest(opp, "roundtable")}
                    disabled={roundtableRequested}
                    style={{ ...actionButtonStyle, opacity: roundtableRequested ? 0.55 : 1, cursor: roundtableRequested ? "default" : "pointer" }}
                  >
                    {roundtableRequested ? "Roundtable Requested ✓" : "Request Roundtable"}
                  </button>
                </div>
              )}

              {applyingTo === opp.id && (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${portalTheme.panelBorder}` }}>
                  <textarea
                    value={applyMessage}
                    onChange={(e) => setApplyMessage(e.target.value)}
                    placeholder="What aspect of this project interests you?"
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
                      onClick={() => handleApply(opp.id, opp.title)}
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
