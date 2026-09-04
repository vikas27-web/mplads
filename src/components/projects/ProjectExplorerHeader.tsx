import React from "react";
import { DemoDisclaimer } from "@/components/ui/DemoDisclaimer";
import { Badge } from "@/components/ui/Badge";

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
            Project Explorer
          </h1>
          <Badge variant="info">{totalCount.toLocaleString()} projects</Badge>
        </div>
        <p style={{ fontSize: "13px", color: "#6B7A8E", margin: "4px 0 0" }}>
          Multi-parameter filter and search catalog for MPLAD scheme work recommendations and anomaly signals
        </p>
      </div>
      <div style={{ flexShrink: 0 }}>
        <DemoDisclaimer />
      </div>
    </div>
  );
};
