"use client";

import { useEffect, useRef, useState } from "react";
import { getPortalSession, isStaffRole, type PortalSessionUser } from "@/lib/portal/session";
import { portalTheme } from "@/lib/portal/theme";
import { getMessages, listCircleMembers, sendMessage, type CircleMember, type PortalMessage } from "@/lib/portal/content";
import { markMessagesSeen } from "@/lib/portal/notifications";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: `1px solid ${portalTheme.inputBorder}`,
  background: portalTheme.inputBackground,
  color: portalTheme.textPrimary,
  fontSize: 13,
  boxSizing: "border-box",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MessagesPage() {
  const [user, setUser] = useState<PortalSessionUser | null>(null);
  const [members, setMembers] = useState<CircleMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [messages, setMessages] = useState<PortalMessage[]>([]);
  const [subject, setSubject] = useState("");
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const session = getPortalSession();
    if (!session) return;
    setUser(session);
    markMessagesSeen(session.id);
    if (isStaffRole(session.role)) {
      listCircleMembers()
        .then((m) => {
          // Correspondence is private to whoever is actually assigned as a
          // member's advisor - super_admin does NOT get a blanket override
          // here (unlike account approvals/deletion elsewhere in the
          // portal). A super_admin only sees threads for members assigned
          // to them personally, same as any other Admin.
          const scoped = m.filter((c) => c.assigned_admin_id === session.id);
          setMembers(scoped);
          if (scoped.length > 0) setSelectedMember(scoped[0].id);
        })
        .catch((err) => setError(err instanceof Error ? err.message : "Failed to load members"));
    } else {
      setSelectedMember(session.id);
    }
  }, []);

  useEffect(() => {
    if (!selectedMember) return;
    getMessages(selectedMember)
      .then(setMessages)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load messages"));
  }, [selectedMember]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!user || !selectedMember || !draft.trim()) return;
    try {
      await sendMessage(selectedMember, user.id, draft.trim(), subject);
      setDraft("");
      setSubject("");
      setMessages(await getMessages(selectedMember));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    }
  }

  if (!user) return null;

  const selectedMemberRecord = members.find((m) => m.id === selectedMember);

  return (
    <div>
      <h1 style={{ color: portalTheme.textPrimary, fontSize: 20, fontWeight: 700, margin: "0 0 4px" }}>
        Correspondence
      </h1>
      <p style={{ color: portalTheme.textMuted, fontSize: 13, marginBottom: 20 }}>
        {isStaffRole(user.role)
          ? "Your assigned Circle Members' enquiries and correspondence."
          : "Correspondence with your assigned TBP Capital Advisor."}
      </p>

      {error && <div style={{ color: portalTheme.danger, fontSize: 13, marginBottom: 14 }}>{error}</div>}

      <div style={{ display: "flex", gap: 16 }}>
        {isStaffRole(user.role) && (
          <div
            style={{
              width: 220,
              flexShrink: 0,
              background: portalTheme.panel,
              border: `1px solid ${portalTheme.panelBorder}`,
              borderRadius: 12,
              padding: 8,
              alignSelf: "flex-start",
            }}
          >
            {members.length === 0 && (
              <div style={{ color: portalTheme.textMuted, fontSize: 12.5, padding: 10 }}>
                No Circle Members assigned to you yet.
              </div>
            )}
            {members.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedMember(m.id)}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "9px 10px",
                  borderRadius: 8,
                  border: "none",
                  background: selectedMember === m.id ? "rgba(58,159,192,0.14)" : "transparent",
                  color: selectedMember === m.id ? portalTheme.textPrimary : portalTheme.textSecondary,
                  fontSize: 12.5,
                  fontWeight: selectedMember === m.id ? 700 : 500,
                  cursor: "pointer",
                  marginBottom: 2,
                }}
              >
                {m.name}
              </button>
            ))}
          </div>
        )}

        <div
          style={{
            flex: 1,
            background: portalTheme.panel,
            border: `1px solid ${portalTheme.panelBorder}`,
            borderRadius: 12,
            display: "flex",
            flexDirection: "column",
            minHeight: 520,
          }}
        >
          {isStaffRole(user.role) && selectedMemberRecord && (
            <div style={{ padding: "14px 18px", borderBottom: `1px solid ${portalTheme.panelBorder}` }}>
              <div style={{ color: portalTheme.textPrimary, fontWeight: 700, fontSize: 13.5 }}>{selectedMemberRecord.name}</div>
              <div style={{ color: portalTheme.textMuted, fontSize: 12 }}>{selectedMemberRecord.email}</div>
            </div>
          )}

          <div style={{ flex: 1, overflowY: "auto", padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
            {messages.length === 0 && (
              <div style={{ color: portalTheme.textMuted, fontSize: 13 }}>No correspondence yet.</div>
            )}
            {messages.map((m) => {
              const isMine = m.sender_id === user.id;
              return (
                <div
                  key={m.id}
                  style={{
                    border: `1px solid ${portalTheme.panelBorder}`,
                    borderLeft: `3px solid ${isMine ? portalTheme.gold : portalTheme.panelBorder}`,
                    borderRadius: 8,
                    padding: "12px 16px",
                    background: isMine ? "rgba(58,159,192,0.04)" : "transparent",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6, flexWrap: "wrap", gap: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: isMine ? portalTheme.gold : portalTheme.textSecondary, textTransform: "uppercase", letterSpacing: ".4px" }}>
                      {isMine ? "Sent" : "Received"}
                    </span>
                    <span style={{ fontSize: 11, color: portalTheme.textMuted }}>{formatDate(m.created_at)}</span>
                  </div>
                  {m.subject && (
                    <div style={{ fontSize: 13, fontWeight: 700, color: portalTheme.textPrimary, marginBottom: 6 }}>
                      {m.subject}
                    </div>
                  )}
                  <div style={{ color: portalTheme.textSecondary, fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-line" }}>
                    {m.content}
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          <div style={{ padding: 14, borderTop: `1px solid ${portalTheme.panelBorder}`, display: "grid", gap: 8 }}>
            <input
              style={inputStyle}
              placeholder="Subject (optional)"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={!selectedMember}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <textarea
                style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
                placeholder="Compose your message..."
                rows={3}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                disabled={!selectedMember}
              />
              <button
                onClick={handleSend}
                disabled={!draft.trim() || !selectedMember}
                style={{
                  padding: "9px 18px",
                  borderRadius: 8,
                  border: "none",
                  background: portalTheme.gold,
                  color: portalTheme.goldText,
                  fontWeight: 700,
                  fontSize: 12.5,
                  cursor: draft.trim() ? "pointer" : "not-allowed",
                  alignSelf: "flex-start",
                }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
