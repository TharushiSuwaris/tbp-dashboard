"use client";

interface TopbarProps {
  title: string;
  subtitle?: string;
}

export function Topbar({ title, subtitle }: TopbarProps) {
  return (
    <header
      style={{
        background: "#F7F4EC",
        borderBottom: "1px solid rgba(27,42,61,0.06)",
        padding: "14px 28px",
        position: "sticky",
        top: 64,
        zIndex: 10,
      }}
    >
      <h1 style={{ fontSize: 16, fontWeight: 700, color: "#1B2A3D", margin: 0, lineHeight: 1.2 }}>{title}</h1>
      {subtitle && (
        <p style={{ fontSize: 11, color: "#5C5648", margin: "3px 0 0", lineHeight: 1.4 }}>{subtitle}</p>
      )}
    </header>
  );
}
