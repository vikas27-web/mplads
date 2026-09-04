import React from "react";

/**
 * Demo data disclaimer — always visible as required by Phase 9 spec.
 */
export const DemoDisclaimer: React.FC = () => {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 8px",
        fontSize: "10px",
        fontWeight: 600,
        background: "#FFFBEB",
        border: "1px solid #FDE68A",
        color: "#92400E",
        borderRadius: "4px",
        letterSpacing: "0.04em",
        whiteSpace: "nowrap",
      }}
    >
      DEMO DATA — NOT OFFICIAL GOVERNMENT DATA
    </span>
  );
};
