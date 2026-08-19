"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearPortalSession, getPortalSession, type PortalSessionUser } from "@/lib/portal/session";
import { NotificationBell } from "@/components/portal/NotificationBell";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

export function AppHeader() {
  const router = useRouter();
  const [user, setUser] = useState<PortalSessionUser | null>(null);

  useEffect(() => {
    setUser(getPortalSession());
  }, []);

  function handleLogout() {
    clearPortalSession();
    router.push("/portal/login");
  }

  return (
    <header
      style={{
        background: "#FBF8F1",
        borderBottom: "1px solid rgba(27,42,61,0.06)",
        height: 64,
        display: "flex",
        alignItems: "center",
        padding: "0 24px 0 0",
        position: "sticky",
        top: 0,
        zIndex: 30,
        flexShrink: 0,
      }}
    >
      {/* Logo slot — matches sidebar width */}
      <div
        style={{
          width: 200,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "0 16px",
          borderRight: "1px solid rgba(27,42,61,0.06)",
          height: "100%",
        }}
      >
        <div
          style={{
            width: 34, height: 34,
            background: "#C4992A",
            borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 900, fontSize: 11, color: "#1B2A3D", flexShrink: 0,
            letterSpacing: ".5px",
          }}
        >
          TBP
        </div>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#1B2A3D", textTransform: "uppercase", letterSpacing: "1px", lineHeight: 1.2 }}>
            The Borderless
          </div>
          <div style={{ fontSize: 9, color: "#5C5648", letterSpacing: ".5px" }}>Project</div>
        </div>
      </div>

      {/* Title */}
      <div style={{ flex: 1, padding: "0 24px" }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: "#1B2A3D", letterSpacing: ".3px" }}>
          TBP CAPITAL ADVISORY &amp; FAMILY OFFICE CIRCLE
        </div>
        <div style={{ fontSize: 10, color: "#C4992A", letterSpacing: "1.4px", textTransform: "uppercase", marginTop: 2 }}>
          Intelligence &amp; Coordination Dashboard
        </div>
      </div>

      {/* Right controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {/* Status badge */}
        <div
          style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "rgba(196,153,42,0.12)",
            border: "1px solid rgba(196,153,42,0.25)",
            borderRadius: 20, padding: "5px 12px",
          }}
        >
          <div
            className="animate-pulse-dot"
            style={{ width: 6, height: 6, background: "#C4992A", borderRadius: "50%", flexShrink: 0 }}
          />
          <span style={{ fontSize: 11, color: "#C4992A", fontWeight: 600, whiteSpace: "nowrap" }}>
            Protocol Establishment Round
          </span>
        </div>

        {/* Notifications */}
        {user && <NotificationBell userId={user.id} role={user.role} />}

        {/* Avatar */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 36, height: 36, background: "#C4992A", borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 900, fontSize: 13, color: "#1B2A3D", flexShrink: 0,
            }}
          >
            {user ? initials(user.name) : "?"}
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#1B2A3D" }}>
              {user ? user.name : "Not logged in"}
            </div>
            <div style={{ fontSize: 10, color: "#5C5648" }}>
              {user ? user.role.replace(/_/g, " ") : "—"}
            </div>
          </div>
        </div>

        {user ? (
          <button
            onClick={handleLogout}
            style={{
              padding: "7px 14px",
              borderRadius: 8,
              border: "1px solid rgba(27,42,61,0.1)",
              background: "rgba(27,42,61,0.04)",
              color: "#756E5D",
              fontSize: 11.5,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Log Out
          </button>
        ) : (
          <a
            href="/portal/login"
            style={{
              padding: "7px 14px",
              borderRadius: 8,
              border: "1px solid rgba(196,153,42,0.3)",
              background: "rgba(196,153,42,0.12)",
              color: "#C4992A",
              fontSize: 11.5,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Log In
          </a>
        )}
      </div>
    </header>
  );
}
