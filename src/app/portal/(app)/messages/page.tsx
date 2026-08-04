"use client";

import { useEffect, useRef, useState } from "react";
import { getPortalSession, isStaffRole, type PortalSessionUser } from "@/lib/portal/session";
import { portalTheme } from "@/lib/portal/theme";
import { getMessages, listCircleMembers, sendMessage, type CircleMember, type PortalMessage } from "@/lib/portal/content";

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

export default function MessagesPage() {
  const [user, setUser] = useState<PortalSessionUser | null>(null);
  const [members, setMembers] = useState<CircleMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [messages, setMessages] = useState<PortalMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const session = getPortalSession();
    if (!session) return;
    setUser(session);
    if (isStaffRole(session.role)) {
      listCircleMembers()
        .then((m) => {
          setMembers(m);
          if (m.length > 0) setSelectedMember(m[0].id);
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
      await sendMessage(selectedMember, user.id, draft.trim());
      setDraft("");
      setMessages(await getMessages(selectedMember));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    }
  }

  if (!user) return null;

  return (
    <div>
      <h1 style={{ color: portalTheme.textPrimary, fontSize: 20, fontWeight: 700, margin: "0 0 4px" }}>Messages</h1>
      <p style={{ color: portalTheme.textMuted, fontSize: 13, marginBottom: 20 }}>
        {isStaffRole(user.role) ? "Communicate with Circle Members." : "Communicate with TBP Advisory."}
      </p>

      {error && <div style={{ color: portalTheme.danger, fontSize: 13, marginBottom: 14 }}>{error}</div>}

      <div style={{ display: "flex", gap: 16 }}>
        {isStaffRole(user.role) && (
          <div
            style={{
              width: 200,
              flexShrink: 0,
              background: portalTheme.panel,
              border: `1px solid ${portalTheme.panelBorder}`,
              borderRadius: 12,
              padding: 8,
            }}
          >
            {members.length === 0 && (
              <div style={{ color: portalTheme.textMuted, fontSize: 12.5, padding: 10 }}>No Circle Members yet.</div>
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
                  background: selectedMember === m.id ? "rgba(196,153,42,0.14)" : "transparent",
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
            height: 480,
          }}
        >
          <div style={{ flex: 1, overflowY: "auto", padding: 18, display: "flex", flexDirection: "column", gap: 10 }}>
            {messages.length === 0 && (
              <div style={{ color: portalTheme.textMuted, fontSize: 13 }}>No messages yet — say hello.</div>
            )}
            {messages.map((m) => {
              const isMine = m.sender_id === user.id;
              return (
                <div
                  key={m.id}
                  style={{
                    alignSelf: isMine ? "flex-end" : "flex-start",
                    maxWidth: "70%",
                    background: isMine ? "rgba(196,153,42,0.16)" : "rgba(255,255,255,0.05)",
                    color: portalTheme.textPrimary,
                    borderRadius: 10,
                    padding: "9px 12px",
                    fontSize: 13,
                  }}
                >
                  {m.content}
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
          <div style={{ display: "flex", gap: 8, padding: 14, borderTop: `1px solid ${portalTheme.panelBorder}` }}>
            <input
              style={inputStyle}
              placeholder="Type a message..."
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
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
              }}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
