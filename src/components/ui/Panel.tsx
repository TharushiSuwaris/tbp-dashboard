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
        background: "#fff",
        border: "1px solid #E2E8F0",
        borderRadius: 12,
        overflow: "hidden",
        ...style,
      }}
    >
      {(title || action) && (
        <div
          style={{
            padding: "14px 20px",
            borderBottom: "1px solid #E2E8F0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            {title && <div style={{ fontSize: 13, fontWeight: 700, color: "#1A2B45" }}>{title}</div>}
            {subtitle && <div style={{ fontSize: 11, color: "#8899AA", marginTop: 1 }}>{subtitle}</div>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div style={{ padding: "18px 20px", ...bodyStyle }}>{children}</div>
    </div>
  );
}
