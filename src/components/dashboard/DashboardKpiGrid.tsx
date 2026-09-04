import React from "react";
import { DashboardKpi } from "@/types/dashboard";
import { Card, CardContent } from "@/components/ui/Card";
import {
  FolderSearch,
  AlertTriangle,
  ShieldAlert,
  Activity,
  CheckCircle2,
} from "lucide-react";

export interface DashboardKpiGridProps {
  kpis: DashboardKpi;
}

export const DashboardKpiGrid: React.FC<DashboardKpiGridProps> = ({ kpis }) => {
  const cards = [
    {
      title: "Total Projects",
      value: kpis.totalProjects.toLocaleString(),
      subtitle: "Active MPLAD scheme works",
      icon: <FolderSearch style={{ width: "18px", height: "18px", color: "#0080FF" }} />,
      accent: "#0080FF",
      accentBg: "rgba(0,128,255,0.08)",
    },
    {
      title: "Anomaly Signals",
      value: kpis.totalAnomalies.toLocaleString(),
      subtitle: "Require physical verification",
      icon: <AlertTriangle style={{ width: "18px", height: "18px", color: "#B7791F" }} />,
      accent: "#B7791F",
      accentBg: "#FFFBEB",
    },
    {
      title: "Critical Priority",
      value: (kpis.criticalRiskCount ?? 0).toLocaleString(),
      subtitle: "Immediate inspection required",
      icon: <ShieldAlert style={{ width: "18px", height: "18px", color: "#C0392B" }} />,
      accent: "#C0392B",
      accentBg: "#FEF2F2",
    },
    {
      title: "High Priority",
      value: kpis.highRiskCount.toLocaleString(),
      subtitle: "Field audit verification",
      icon: <Activity style={{ width: "18px", height: "18px", color: "#D35400" }} />,
      accent: "#D35400",
      accentBg: "#FFF7ED",
    },
    {
      title: "Routine Monitoring",
      value: kpis.lowRiskCount.toLocaleString(),
      subtitle: "Within standard thresholds",
      icon: <CheckCircle2 style={{ width: "18px", height: "18px", color: "#276749" }} />,
      accent: "#276749",
      accentBg: "#F0FFF4",
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: "12px",
      }}
    >
      {cards.map((card, idx) => (
        <Card key={idx}>
          <CardContent style={{ padding: "16px 18px" }}>
            {/* Icon row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "12px",
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#6B7A8E",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                {card.title}
              </span>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "6px",
                  background: card.accentBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {card.icon}
              </div>
            </div>
            {/* Value */}
            <div
              style={{
                fontSize: "28px",
                fontWeight: 700,
                color: card.accent,
                lineHeight: 1,
                marginBottom: "4px",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {card.value}
            </div>
            <div style={{ fontSize: "11px", color: "#9BA8B5" }}>{card.subtitle}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
