import React from "react";
import { Badge } from "@/components/ui/Badge";
import { ShieldCheck, Database } from "lucide-react";

interface DashboardHeaderProps {
  isDemoData?: boolean;
  lastUpdatedText?: string;
  dataSource?: string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  isDemoData,
  lastUpdatedText,
  dataSource,
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
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
            MPLAD scheme anomaly intelligence · Phase 8 & 12 Detection Pipeline
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Badge variant="success" size="md">
            <ShieldCheck style={{ width: "13px", height: "13px", marginRight: "5px" }} />
            Official SIH26102 Dataset Active
          </Badge>
          {lastUpdatedText && (
            <span style={{ fontSize: "11px", color: "#6B7A8E", fontFamily: "JetBrains Mono, monospace" }}>
              {lastUpdatedText}
            </span>
          )}
        </div>
      </div>

      {/* Official Dataset Provenance Banner */}
      <div
        style={{
          padding: "10px 14px",
          borderRadius: "6px",
          background: "#F0F7FF",
          border: "1px solid #B3D7FF",
          fontSize: "12px",
          color: "#004799",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Database style={{ width: "15px", height: "15px", color: "#0080FF", flexShrink: 0 }} />
          <span>
            <strong>OFFICIAL DATASET:</strong> {dataSource || "Supplied SIH26102 official dataset (543 Lok Sabha MPs across 36 States/UTs, ₹8,318.06 Cr)"}
          </span>
        </div>
        <span
          style={{
            fontSize: "11px",
            fontWeight: 600,
            background: "#FFFFFF",
            padding: "2px 8px",
            borderRadius: "4px",
            border: "1px solid #CCE4FF",
            color: "#0066CC",
          }}
        >
          Primary Application Data Source
        </span>
      </div>
    </div>
  );
};
