import React from "react";
import { ShieldCheck } from "lucide-react";

/**
 * Official SIH Dataset & Audit Prototype indicator
 * Replaces old demo disclaimer with clear official source attribution
 */
export const DemoDisclaimer: React.FC = () => {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        padding: "3px 9px",
        fontSize: "11px",
        fontWeight: 600,
        background: "#F0F7FF",
        border: "1px solid #B3D7FF",
        color: "#0052B3",
        borderRadius: "4px",
        letterSpacing: "0.02em",
        whiteSpace: "nowrap",
      }}
    >
      <ShieldCheck style={{ width: "13px", height: "13px", color: "#0080FF" }} />
      OFFICIAL SIH DATASET • AUDIT PROTOTYPE
    </span>
  );
};
