import React from "react";

// Severity levels
export type SeverityLevel = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

const SEVERITY_STYLES: Record<SeverityLevel, { bg: string; color: string; border: string; label: string }> = {
  CRITICAL: {
    bg: "#FEF2F2",
    color: "#C0392B",
    border: "#FECACA",
    label: "Critical",
  },
  HIGH: {
    bg: "#FFF7ED",
    color: "#D35400",
    border: "#FED7AA",
    label: "High",
  },
  MEDIUM: {
    bg: "#FFFBEB",
    color: "#B7791F",
    border: "#FDE68A",
    label: "Medium",
  },
  LOW: {
    bg: "#F0FFF4",
    color: "#276749",
    border: "#A7F3D0",
    label: "Low",
  },
};

interface SeverityBadgeProps {
  severity: SeverityLevel | string;
  size?: "sm" | "md" | "lg";
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity, size = "sm" }) => {
  const key = (severity as SeverityLevel) || "LOW";
  const styles = SEVERITY_STYLES[key] || SEVERITY_STYLES.LOW;

  const fontSize = size === "lg" ? "12px" : size === "md" ? "11px" : "10px";
  const padding = size === "lg" ? "3px 10px" : size === "md" ? "2px 8px" : "2px 6px";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding,
        fontSize,
        fontWeight: 600,
        color: styles.color,
        background: styles.bg,
        border: `1px solid ${styles.border}`,
        borderRadius: "4px",
        letterSpacing: "0.03em",
        whiteSpace: "nowrap",
      }}
    >
      {styles.label}
    </span>
  );
};
