import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { DemoDisclaimer } from "@/components/ui/DemoDisclaimer";

interface DashboardHeaderProps {
  isDemoData?: boolean;
  lastUpdatedText?: string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  isDemoData,
  lastUpdatedText,
}) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "12px",
      }}
    >
      <div>
        <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#0F1724", margin: 0, lineHeight: 1.2 }}>
          Audit Portfolio Dashboard
        </h1>
        <p style={{ fontSize: "13px", color: "#6B7A8E", margin: "4px 0 0" }}>
          MPLAD scheme anomaly signals · Phase 8 Detection Engine
        </p>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
        {isDemoData !== false && <DemoDisclaimer />}
        {lastUpdatedText && (
          <span style={{ fontSize: "11px", color: "#9BA8B5" }}>
            Source: {lastUpdatedText}
          </span>
        )}
      </div>
    </div>
  );
};
