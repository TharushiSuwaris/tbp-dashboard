"use client";

interface TopbarProps {
  title: string;
  subtitle?: string;
}

export function Topbar({ title, subtitle }: TopbarProps) {
  return (
    <header
      style={{
        background: "#fff",
        borderBottom: "1px solid #E2E8F0",
        padding: "0 28px",
        height: 62,
        display: "flex",
        alignItems: "center",
        gap: 14,
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      <div>
        <h1 style={{ fontSize: 17, fontWeight: 700, color: "#1A2B45", margin: 0 }}>{title}</h1>
        {subtitle && (
          <p style={{ fontSize: 11, color: "#8899AA", margin: 0 }}>{subtitle}</p>
        )}
      </div>

      <div style={{ flex: 1 }} />

      {/* Search */}
      <div
        style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "#F4F6FA", border: "1px solid #E2E8F0",
          borderRadius: 8, padding: "7px 14px", fontSize: 12, color: "#8899AA", width: 210,
        }}
      >
        🔍&nbsp; Search family offices...
      </div>

      {/* Notifications */}
      <div
        style={{
          width: 36, height: 36, background: "#F4F6FA",
          border: "1px solid #E2E8F0", borderRadius: 8,
          cursor: "pointer", display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 15, position: "relative",
        }}
      >
        🔔
        <div
          style={{
            position: "absolute", top: 7, right: 7,
            width: 7, height: 7, background: "#EF4444",
            borderRadius: "50%", border: "2px solid #fff",
          }}
        />
      </div>

      {/* Action button */}
      <button
        style={{
          display: "flex", alignItems: "center", gap: 6,
          background: "#C4992A", color: "#1A2B45",
          fontSize: 12, fontWeight: 700, padding: "8px 16px",
          borderRadius: 8, border: "none", cursor: "pointer", whiteSpace: "nowrap",
        }}
      >
        ＋ Add Family Office
      </button>
    </header>
  );
}
