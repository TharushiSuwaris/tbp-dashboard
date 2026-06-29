import type { Classification, PipelineStage } from "@/types";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "green" | "amber" | "blue" | "purple" | "pink" | "red" | "gray" | "gold";
}

export function Badge({ children, variant = "gray" }: BadgeProps) {
  const styles: Record<string, React.CSSProperties> = {
    green: { background: "rgba(16,185,129,0.1)", color: "#059669" },
    amber: { background: "rgba(245,158,11,0.1)", color: "#D97706" },
    blue: { background: "rgba(59,130,246,0.1)", color: "#2563EB" },
    purple: { background: "rgba(139,92,246,0.1)", color: "#7C3AED" },
    pink: { background: "rgba(236,72,153,0.1)", color: "#BE185D" },
    red: { background: "rgba(239,68,68,0.1)", color: "#DC2626" },
    gray: { background: "rgba(0,0,0,0.05)", color: "#5A6B7F" },
    gold: { background: "rgba(196,153,42,0.12)", color: "#92711A" },
  };

  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 9px",
        borderRadius: 20,
        fontSize: 10,
        fontWeight: 700,
        whiteSpace: "nowrap",
        ...styles[variant],
      }}
    >
      {children}
    </span>
  );
}

export function ScoreBadge({ score }: { score: number }) {
  const style: React.CSSProperties =
    score >= 80
      ? { background: "rgba(16,185,129,0.1)", color: "#059669" }
      : score >= 65
      ? { background: "rgba(245,158,11,0.1)", color: "#D97706" }
      : { background: "rgba(239,68,68,0.1)", color: "#DC2626" };

  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center",
        padding: "3px 8px", borderRadius: 6,
        fontSize: 12, fontWeight: 800,
        ...style,
      }}
    >
      {score}
    </span>
  );
}

export function ClassificationBadge({ classification }: { classification: Classification }) {
  if (classification === "Priority Founding Steward Prospect")
    return <Badge variant="green">Priority ⭐</Badge>;
  if (classification === "Strong Potential Prospect")
    return <Badge variant="amber">Strong Potential</Badge>;
  if (classification === "Monitor / Secondary Prospect")
    return <Badge variant="blue">Monitor</Badge>;
  return <Badge variant="gray">Not Suitable</Badge>;
}

export function StageBadge({ stage }: { stage: PipelineStage }) {
  const stageColors: Record<string, "blue" | "purple" | "amber" | "green" | "red" | "gray"> = {
    Identified: "blue",
    Profiled: "purple",
    Scored: "purple",
    Reviewed: "amber",
    "Approved for Approach": "green",
    "Warm Introduction Sought": "green",
    Contacted: "green",
    "Meeting Proposed": "amber",
    "Meeting Scheduled": "amber",
    "Briefing Pack Sent": "amber",
    "Follow-Up Required": "amber",
    "Diligence / Review": "red",
    "Commitment Discussion": "green",
    "Joined Circle": "green",
    "Not Suitable / Parked": "gray",
  };
  return <Badge variant={stageColors[stage] ?? "gray"}>{stage}</Badge>;
}
