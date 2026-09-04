import React from "react";
import { Badge } from "@/components/ui/Badge";
import { ShieldCheck, Database, Info } from "lucide-react";

interface DashboardHeaderProps {
  isDemoData?: boolean;
  lastUpdatedText?: string;
  dataSource?: string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
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
            Source: SIH26102 official dataset · 543 Lok Sabha Parliamentary Constituencies
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          {lastUpdatedText && (
            <span style={{ fontSize: "11px", color: "#6B7A8E", fontFamily: "JetBrains Mono, monospace" }}>
              {lastUpdatedText}
            </span>
          )}
        </div>
      </div>

      {/* Responsible AI Callout */}
      <div
        style={{
          padding: "10px 14px",
          borderRadius: "6px",
          background: "#F8FAFC",
          border: "1px solid #E2E8F0",
          fontSize: "12px",
          color: "#334155",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Info style={{ width: "15px", height: "15px", color: "#0080FF", flexShrink: 0 }} />
          <span>
            <strong>Responsible AI Notice:</strong> Anomaly signal does not equal fraud. Evidence requires human verification.
          </span>
        </div>
        <span style={{ fontSize: "11px", color: "#64748B" }}>
          {dataSource || "Source: SIH26102 official dataset (₹8,318.05 Cr)"}
        </span>
      </div>
    </div>
  );
};
