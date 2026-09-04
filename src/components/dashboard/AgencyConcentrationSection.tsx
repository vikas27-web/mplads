import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { AgencySignal } from "@/types/dashboard";

interface AgencyConcentrationSectionProps {
  agencies: AgencySignal[];
}

export const AgencyConcentrationSection: React.FC<AgencyConcentrationSectionProps> = ({ agencies }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Agencies by Flagged Works</CardTitle>
      </CardHeader>
      <CardContent style={{ padding: "0" }}>
        {agencies.slice(0, 8).map((agency, idx) => (
          <div
            key={agency.agencyId}
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
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 500,
                  color: "#0F1724",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: "160px",
                }}
                title={agency.agencyName}
              >
                {agency.agencyName}
              </div>
              <div style={{ fontSize: "10px", color: "#9BA8B5" }}>
                {agency.assignedProjects} assigned
              </div>
            </div>
            <span style={{ fontSize: "12px", fontWeight: 600, color: "#3D4B5C", flexShrink: 0 }}>
              {agency.flaggedCount} flagged
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
