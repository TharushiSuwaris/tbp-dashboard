import { portalTheme } from "@/lib/portal/theme";

export function PortalPagePlaceholder({ title, description }: { title: string; description: string }) {
  return (
    <div
      style={{
        background: portalTheme.panel,
        border: `1px solid ${portalTheme.panelBorder}`,
        borderRadius: 12,
        padding: "40px 32px",
        textAlign: "center",
      }}
    >
      <h2 style={{ color: portalTheme.textPrimary, fontSize: 20, margin: "0 0 8px" }}>{title}</h2>
      <p style={{ color: portalTheme.textSecondary, fontSize: 13, marginBottom: 20 }}>{description}</p>
      <p style={{ color: portalTheme.textMuted, fontSize: 13 }}>Not built yet - additive scaffold only.</p>
    </div>
  );
}
