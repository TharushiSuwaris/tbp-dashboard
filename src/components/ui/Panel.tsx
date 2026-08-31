import type { ReactNode, CSSProperties } from "react";

interface PanelProps {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  style?: CSSProperties;
  bodyStyle?: CSSProperties;
}

export function Panel({ title, subtitle, action, children, style, bodyStyle }: PanelProps) {
  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid rgba(27,42,61,0.07)",
        borderRadius: 12,
        overflow: "hidden",
        ...style,
      }}
    >
      {(title || action) && (
        <div
          style={{
            padding: "13px 18px",
            borderBottom: "1px solid rgba(27,42,61,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            {title && <div style={{ fontSize: 12.5, fontWeight: 700, color: "#1B2A3D", textTransform: "uppercase", letterSpacing: ".6px" }}>{title}</div>}
            {subtitle && <div style={{ fontSize: 11, color: "#5C5648", marginTop: 2 }}>{subtitle}</div>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div style={{ padding: "16px 18px", ...bodyStyle }}>{children}</div>
    </div>
  );
}
