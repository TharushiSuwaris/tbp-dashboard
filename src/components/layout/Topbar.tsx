"use client";

interface TopbarProps {
  title: string;
  subtitle?: string;
}

export function Topbar({ title, subtitle }: TopbarProps) {
  return (
    <header
      style={{
        background: "#0C1929",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "14px 28px",
        position: "sticky",
        top: 64,
        zIndex: 10,
      }}
    >
      <h1 style={{ fontSize: 16, fontWeight: 700, color: "#E8EFF8", margin: 0, lineHeight: 1.2 }}>{title}</h1>
      {subtitle && (
        <p style={{ fontSize: 11, color: "#4A5C70", margin: "3px 0 0", lineHeight: 1.4 }}>{subtitle}</p>
      )}
    </header>
  );
}
