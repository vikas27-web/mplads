import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { RiskDistributionItem } from "@/types/dashboard";

const SEVERITY_COLORS: Record<string, { bar: string; label: string }> = {
  CRITICAL: { bar: "#C0392B", label: "Critical" },
  HIGH:     { bar: "#D35400", label: "High" },
  MEDIUM:   { bar: "#B7791F", label: "Medium" },
  LOW:      { bar: "#276749", label: "Routine" },
};

interface RiskDistributionChartProps {
  data: RiskDistributionItem[];
}

export const RiskDistributionChart: React.FC<RiskDistributionChartProps> = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.count, 0) || 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Review Priority Distribution</CardTitle>
        <p style={{ fontSize: "11px", color: "#9BA8B5", marginTop: "2px" }}>
          Based on Phase 8 anomaly engine classification
        </p>
      </CardHeader>
      <CardContent>
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {data.map((item) => {
            const cfg = SEVERITY_COLORS[item.severity] || { bar: "#9BA8B5", label: item.label };
            const pct = Math.round((item.count / total) * 100);
            return (
              <div key={item.severity} style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: "12px",
                  }}
                >
                  <span style={{ fontWeight: 500, color: "#3D4B5C" }}>{cfg.label}</span>
                  <span style={{ fontWeight: 600, color: "#0F1724", fontVariantNumeric: "tabular-nums" }}>
                    {item.count.toLocaleString()}
                    <span style={{ fontWeight: 400, color: "#9BA8B5", marginLeft: "4px" }}>
                      ({item.displayPercentage ?? `${pct}%`})
                    </span>
                  </span>
                </div>
                <div
                  style={{
                    height: "6px",
                    background: "#F1F3F7",
                    borderRadius: "3px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${pct}%`,
                      background: cfg.bar,
                      borderRadius: "3px",
                      transition: "width 0.4s ease",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
