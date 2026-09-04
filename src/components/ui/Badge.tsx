import React from "react";

type BadgeVariant = "default" | "info" | "warning" | "danger" | "success" | "outline" | "anomaly";
type BadgeSize = "sm" | "md";

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const BADGE_STYLES: Record<BadgeVariant, { bg: string; color: string; border: string }> = {
  default: { bg: "#F1F3F7", color: "#3D4B5C", border: "#DDE2EA" },
  info:    { bg: "rgba(0,128,255,0.08)", color: "#1a5fa8", border: "rgba(0,128,255,0.20)" },
  warning: { bg: "#FFFBEB", color: "#B7791F", border: "#FDE68A" },
  danger:  { bg: "#FEF2F2", color: "#C0392B", border: "#FECACA" },
  success: { bg: "#F0FFF4", color: "#276749", border: "#A7F3D0" },
  outline: { bg: "transparent", color: "#3D4B5C", border: "#DDE2EA" },
  anomaly: { bg: "#FFF7ED", color: "#D35400", border: "#FED7AA" },
};

export const Badge: React.FC<BadgeProps> = ({
  variant = "default",
  size = "sm",
  dot,
  children,
  className,
  style,
}) => {
  const s = BADGE_STYLES[variant];
  const fontSize = size === "md" ? "11px" : "10px";
  const padding = size === "md" ? "2px 8px" : "2px 6px";

  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: dot ? "5px" : undefined,
        padding,
        fontSize,
        fontWeight: 500,
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
        borderRadius: "4px",
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {dot && (
        <span
          style={{
            width: "5px",
            height: "5px",
            borderRadius: "50%",
            background: s.color,
            flexShrink: 0,
          }}
        />
      )}
      {children}
    </span>
  );
};
