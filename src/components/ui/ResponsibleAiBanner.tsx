import React from "react";

/**
 * Persistent responsible AI notice — institutional style.
 * Never uses accusatory language.
 */
export const ResponsibleAiBanner: React.FC<{ compact?: boolean }> = ({ compact }) => {
  if (compact) {
    return (
      <span
        style={{
          fontSize: "10px",
          padding: "2px 8px",
          background: "rgba(0,128,255,0.06)",
          border: "1px solid rgba(0,128,255,0.18)",
          color: "#1a5fa8",
          borderRadius: "4px",
          whiteSpace: "nowrap",
        }}
      >
        Anomaly signal does not equal fraud. Evidence requires human verification.
      </span>
    );
  }

  return (
    <div
      role="note"
      style={{
        padding: "8px 14px",
        background: "rgba(0,128,255,0.04)",
        border: "1px solid rgba(0,128,255,0.16)",
        borderRadius: "6px",
        display: "flex",
        alignItems: "center",
        gap: "10px",
      }}
    >
      <svg
        viewBox="0 0 20 20"
        fill="none"
        style={{ width: "15px", height: "15px", color: "#0080FF", flexShrink: 0 }}
        aria-hidden="true"
      >
        <path
          d="M9 9h2v5H9zm0-3h2v2H9zM10 2a8 8 0 100 16A8 8 0 0010 2z"
          fill="currentColor"
        />
      </svg>
      <p style={{ fontSize: "12px", color: "#1a5fa8", margin: 0, lineHeight: 1.4 }}>
        <strong>Responsible AI Notice:</strong> Anomaly signal does not equal fraud. Evidence requires human verification.
      </p>
    </div>
  );
};
