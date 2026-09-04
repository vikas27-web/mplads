import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { SectorRiskSignal } from "@/types/dashboard";

interface SectorRiskSectionProps {
  sectors: SectorRiskSignal[];
}

export const SectorRiskSection: React.FC<SectorRiskSectionProps> = ({ sectors }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sectors by Anomaly Rate</CardTitle>
      </CardHeader>
      <CardContent style={{ padding: "0" }}>
        {sectors.slice(0, 8).map((sector, idx) => {
          const rate = sector.projectCount > 0
            ? Math.round((sector.anomalyCount / sector.projectCount) * 100)
            : 0;
          return (
            <div
              key={sector.sectorId}
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
                  {sector.sectorName}
                </div>
                <div style={{ fontSize: "10px", color: "#9BA8B5" }}>
                  {sector.projectCount} projects
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                <span style={{ fontSize: "12px", fontWeight: 600, color: "#3D4B5C" }}>
                  {sector.anomalyCount}
                </span>
                <span
                  style={{
                    fontSize: "10px",
                    padding: "1px 5px",
                    background: rate > 50 ? "#FEF2F2" : rate > 30 ? "#FFFBEB" : "#F0FFF4",
                    color: rate > 50 ? "#C0392B" : rate > 30 ? "#B7791F" : "#276749",
                    border: `1px solid ${rate > 50 ? "#FECACA" : rate > 30 ? "#FDE68A" : "#A7F3D0"}`,
                    borderRadius: "3px",
                    fontWeight: 600,
                  }}
                >
                  {rate}%
                </span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
