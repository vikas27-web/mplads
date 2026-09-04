import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { DistrictRiskSignal } from "@/types/dashboard";

interface DistrictRiskSectionProps {
  signals: DistrictRiskSignal[];
}

export const DistrictRiskSection: React.FC<DistrictRiskSectionProps> = ({ signals }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Districts by Signal Count</CardTitle>
      </CardHeader>
      <CardContent style={{ padding: "0" }}>
        {signals.slice(0, 8).map((sig, idx) => (
          <div
            key={sig.districtCode}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "8px 16px",
              borderBottom: idx < 7 ? "1px solid #F1F3F7" : "none",
              gap: "8px",
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: "12px", fontWeight: 500, color: "#0F1724" }}>
                {sig.districtName}
              </div>
              <div style={{ fontSize: "10px", color: "#9BA8B5" }}>{sig.state}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "#3D4B5C" }}>
                {sig.anomalyCount}
              </span>
              <SeverityBadge severity={sig.severity} />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
