import React from "react";
import { Badge } from "@/components/ui/Badge";
import { ShieldCheck } from "lucide-react";

export interface ProjectExplorerHeaderProps {
  totalCount: number;
}

export const ProjectExplorerHeader: React.FC<ProjectExplorerHeaderProps> = ({ totalCount }) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: "12px",
        flexWrap: "wrap",
        paddingBottom: "16px",
        borderBottom: "1px solid #DDE2EA",
      }}
    >
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#0F1724", margin: 0 }}>
            Parliamentary Allocation Explorer
          </h1>
          <Badge variant="info">{totalCount.toLocaleString()} Parliamentary Records</Badge>
        </div>
        <p style={{ fontSize: "13px", color: "#6B7A8E", margin: "4px 0 0" }}>
          Official parliamentary allocation catalog for 543 Lok Sabha Members of Parliament across 36 States/UTs with automated audit anomaly detection
        </p>
      </div>

    </div>
  );
};
