import React from "react";
import { DashboardKpi } from "@/types/dashboard";
import { Card, CardContent } from "@/components/ui/Card";
import {
  Users,
  Coins,
  Map,
  AlertTriangle,
  ShieldAlert,
  Activity,
  CheckCircle2,
} from "lucide-react";

export interface DashboardKpiGridProps {
  kpis: DashboardKpi;
}

export const DashboardKpiGrid: React.FC<DashboardKpiGridProps> = ({ kpis }) => {
  const primaryKpis = [
    {
      title: "Lok Sabha MPs / Records",
      value: "543",
      subtitle: "18th Lok Sabha official allocations",
      icon: <Users style={{ width: "20px", height: "20px", color: "#0080FF" }} />,
      accent: "#0080FF",
      accentBg: "rgba(0,128,255,0.08)",
      badge: "100% Ingested",
    },
    {
      title: "Total Allocated Limit",
      value: "₹8,318.05 Cr",
      subtitle: "Reconciled national outlay (0.00 delta)",
      icon: <Coins style={{ width: "20px", height: "20px", color: "#00875A" }} />,
      accent: "#00875A",
      accentBg: "#F0FFF4",
      badge: "Exact Match",
    },
    {
      title: "States & Union Territories",
      value: "36",
      subtitle: "Pan-India parliamentary coverage",
      icon: <Map style={{ width: "20px", height: "20px", color: "#6366F1" }} />,
      accent: "#6366F1",
      accentBg: "#EEF2FF",
      badge: "Pan-India",
    },
    {
      title: "Priority Anomaly Signals",
      value: (kpis.totalAnomalies || 22).toString(),
      subtitle: "Flagged for human auditor review",
      icon: <AlertTriangle style={{ width: "20px", height: "20px", color: "#B7791F" }} />,
      accent: "#B7791F",
      accentBg: "#FFFBEB",
      badge: "Human Review",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {/* 4 Primary Official KPIs */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
          gap: "14px",
        }}
      >
        {primaryKpis.map((card, idx) => (
          <Card key={idx}>
            <CardContent style={{ padding: "18px 20px" }}>
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
                    width: "34px",
                    height: "34px",
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

              <div
                style={{
                  fontSize: "30px",
                  fontWeight: 700,
                  color: card.accent,
                  lineHeight: 1.1,
                  marginBottom: "6px",
                  fontFamily: "JetBrains Mono, monospace",
                }}
              >
                {card.value}
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "6px" }}>
                <span style={{ fontSize: "11px", color: "#64748B" }}>{card.subtitle}</span>
                <span
                  style={{
                    fontSize: "9px",
                    fontWeight: 600,
                    padding: "2px 6px",
                    borderRadius: "4px",
                    background: card.accentBg,
                    color: card.accent,
                    whiteSpace: "nowrap",
                  }}
                >
                  {card.badge}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Priority Breakdown Mini Bar */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "12px",
          padding: "10px 16px",
          background: "#FFFFFF",
          border: "1px solid #DDE2EA",
          borderRadius: "6px",
          fontSize: "12px",
          color: "#475569",
        }}
      >
        <span style={{ fontWeight: 600, color: "#0F172A", display: "flex", alignItems: "center", gap: "6px" }}>
          <Activity style={{ width: "14px", height: "14px", color: "#0080FF" }} />
          Review Priority Breakdown:
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <ShieldAlert style={{ width: "13px", height: "13px", color: "#C0392B" }} />
          Critical: <strong>{kpis.criticalRiskCount || 1}</strong>
        </span>
        <span style={{ color: "#CBD5E1" }}>•</span>
        <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <AlertTriangle style={{ width: "13px", height: "13px", color: "#D35400" }} />
          High: <strong>{kpis.highRiskCount || 21}</strong>
        </span>
        <span style={{ color: "#CBD5E1" }}>•</span>
        <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <CheckCircle2 style={{ width: "13px", height: "13px", color: "#276749" }} />
          Routine Monitoring: <strong>{kpis.lowRiskCount || 521}</strong>
        </span>
      </div>
    </div>
  );
};
