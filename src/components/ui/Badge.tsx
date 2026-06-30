import type { Classification, PipelineStage } from "@/types";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "green" | "amber" | "blue" | "purple" | "pink" | "red" | "gray" | "gold";
}

export function Badge({ children, variant = "gray" }: BadgeProps) {
  const styles: Record<string, React.CSSProperties> = {
    green:  { background: "rgba(16,185,129,0.18)",  color: "#34D399" },
    amber:  { background: "rgba(245,158,11,0.18)",  color: "#FBBF24" },
    blue:   { background: "rgba(59,130,246,0.18)",  color: "#60A5FA" },
    purple: { background: "rgba(139,92,246,0.18)",  color: "#A78BFA" },
    pink:   { background: "rgba(236,72,153,0.18)",  color: "#F472B6" },
    red:    { background: "rgba(239,68,68,0.18)",   color: "#F87171" },
    gray:   { background: "rgba(255,255,255,0.08)", color: "#9CA3AF" },
    gold:   { background: "rgba(196,153,42,0.18)",  color: "#D4AA3A" },
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
      ? { background: "rgba(16,185,129,0.18)",  color: "#34D399" }
      : score >= 65
      ? { background: "rgba(245,158,11,0.18)",  color: "#FBBF24" }
      : { background: "rgba(239,68,68,0.18)",   color: "#F87171" };

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
    return <Badge variant="gold">Priority ⭐</Badge>;
  if (classification === "Strong Potential Prospect")
    return <Badge variant="blue">Strong Potential</Badge>;
  if (classification === "Monitor / Secondary Prospect")
    return <Badge variant="gray">Monitor</Badge>;
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
