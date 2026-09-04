import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { AnomalyDistributionItem } from "@/types/dashboard";

interface AnomalyDistributionChartProps {
  data: AnomalyDistributionItem[];
}

export const AnomalyDistributionChart: React.FC<AnomalyDistributionChartProps> = ({ data }) => {
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Anomaly Signal Categories</CardTitle>
        <p style={{ fontSize: "11px", color: "#9BA8B5", marginTop: "2px" }}>
          Distribution of detected signal types across portfolio
        </p>
      </CardHeader>
      <CardContent>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {data.slice(0, 8).map((item, idx) => {
            const pct = Math.round((item.count / max) * 100);
            return (
              <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "12px", color: "#3D4B5C", fontWeight: 500, lineHeight: 1.3 }}>
                    {item.category}
                  </span>
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#0F1724",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {item.count}
                  </span>
                </div>
                <div
                  style={{
                    height: "4px",
                    background: "#F1F3F7",
                    borderRadius: "2px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${pct}%`,
                      background: "#0080FF",
                      borderRadius: "2px",
                      opacity: 0.7 + idx * 0.04 * -1,
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
