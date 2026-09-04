import React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { RiskDistributionItem } from "@/types/dashboard";
import { ArrowRight, ShieldCheck, BarChart2 } from "lucide-react";

const SEVERITY_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; dot: string }
> = {
  CRITICAL: {
    label: "Critical Review",
    color: "#C0392B",
    bg: "#FEF2F2",
    dot: "#DC2626",
  },
  HIGH: {
    label: "High Priority",
    color: "#D97706",
    bg: "#FFFBEB",
    dot: "#F59E0B",
  },
  MEDIUM: {
    label: "Medium Priority",
    color: "#4B5563",
    bg: "#F3F4F6",
    dot: "#6B7280",
  },
  LOW: {
    label: "Routine Baseline",
    color: "#166534",
    bg: "#F0FDF4",
    dot: "#16A34A",
  },
};

interface ExecutivePortfolioSummaryProps {
  riskData: RiskDistributionItem[];
  totalRecords?: number;
}

export const ExecutivePortfolioSummary: React.FC<ExecutivePortfolioSummaryProps> = ({
  riskData,
  totalRecords = 543,
}) => {
  const total = riskData.reduce((sum, item) => sum + item.count, 0) || totalRecords;

  const criticalCount = riskData.find((d) => d.severity === "CRITICAL")?.count || 0;
  const highCount = riskData.find((d) => d.severity === "HIGH")?.count || 0;
  const mediumCount = riskData.find((d) => d.severity === "MEDIUM")?.count || 0;
  const lowCount = riskData.find((d) => d.severity === "LOW")?.count || (total - criticalCount - highCount - mediumCount);

  const flaggedCount = criticalCount + highCount + mediumCount;
  const baselinePct = ((lowCount / total) * 100).toFixed(1);

  return (
    <Card variant="default">
      <CardHeader style={{ paddingBottom: "12px", borderBottom: "1px solid #EDF1F6" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "6px",
                background: "#F0F7FF",
                color: "#0080FF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <BarChart2 style={{ width: "16px", height: "16px" }} />
            </div>
            <div>
              <CardTitle style={{ fontSize: "14px", fontWeight: 700, color: "#0F1724" }}>
                Executive Portfolio Baseline & Review Priority Distribution
              </CardTitle>
              <p style={{ fontSize: "11px", color: "#64748B", margin: "2px 0 0" }}>
                Aggregate risk assessment of 543 official Lok Sabha MP records (Source: SIH26102)
              </p>
            </div>
          </div>
          <Link
            href="/analytics"
            style={{
              fontSize: "11px",
              fontWeight: 600,
              color: "#0080FF",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              textDecoration: "none",
            }}
          >
            Open deep analytics
            <ArrowRight style={{ width: "12px", height: "12px" }} />
          </Link>
        </div>
      </CardHeader>

      <CardContent style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* Multi-segment distribution bar */}
        <div>
          <div
            style={{
              height: "10px",
              borderRadius: "5px",
              background: "#E2E8F0",
              overflow: "hidden",
              display: "flex",
              width: "100%",
            }}
          >
            {riskData.map((item) => {
              const cfg = SEVERITY_CONFIG[item.severity] || { dot: "#94A3B8" };
              const widthPct = (item.count / total) * 100;
              if (widthPct <= 0) return null;
              return (
                <div
                  key={item.severity}
                  title={`${item.label}: ${item.count} (${widthPct.toFixed(1)}%)`}
                  style={{
                    width: `${widthPct}%`,
                    height: "100%",
                    background: cfg.dot,
                    transition: "width 0.3s ease",
                  }}
                />
              );
            })}
          </div>

          {/* Legend and stats */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
              gap: "12px",
              marginTop: "14px",
            }}
          >
            {riskData.map((item) => {
              const cfg = SEVERITY_CONFIG[item.severity] || {
                label: item.label,
                color: "#334155",
                dot: "#94A3B8",
              };
              const pct = ((item.count / total) * 100).toFixed(1);
              return (
                <div
                  key={item.severity}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "8px",
                  }}
                >
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: cfg.dot,
                      marginTop: "5px",
                      flexShrink: 0,
                    }}
                  />
                  <div>
                    <div style={{ fontSize: "11px", color: "#64748B", fontWeight: 500 }}>
                      {cfg.label}
                    </div>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: "#0F1724" }}>
                      {item.count}{" "}
                      <span style={{ fontSize: "11px", fontWeight: 400, color: "#94A3B8" }}>
                        ({pct}%)
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* High-Level Institutional Baseline Callout */}
        <div
          style={{
            padding: "12px 14px",
            borderRadius: "6px",
            background: "#F8FAFC",
            border: "1px solid #E2E8F0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <ShieldCheck style={{ width: "18px", height: "18px", color: "#16A34A", flexShrink: 0 }} />
            <div style={{ fontSize: "12px", color: "#334155" }}>
              <strong>95.9% of parliamentary allocations ({lowCount} MPs)</strong> operate within standard statistical thresholds.
              Only <strong>4.1% ({flaggedCount} MP allocations)</strong> are prioritized for auditor review.
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                fontSize: "11px",
                fontFamily: "JetBrains Mono, monospace",
                fontWeight: 600,
                color: "#475569",
                background: "#FFFFFF",
                border: "1px solid #CBD5E1",
                padding: "3px 8px",
                borderRadius: "4px",
              }}
            >
              {lowCount} Baseline • {flaggedCount} Flagged
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
