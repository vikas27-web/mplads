"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardData } from "@/types/dashboard";
import { getDashboardData } from "@/lib/api/dashboardProvider";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/States";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardKpiGrid } from "@/components/dashboard/DashboardKpiGrid";
import { ExecutivePortfolioSummary } from "@/components/dashboard/ExecutivePortfolioSummary";
import { DataProvenanceCard } from "@/components/ui/DataProvenanceCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import {
  AlertTriangle,
  ClipboardList,
  FolderSearch,
  BarChart3,
  ArrowRight,
  ShieldCheck,
  Compass,
} from "lucide-react";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setError(null);
      try {
        const dashRes = await getDashboardData();
        if (dashRes.success && dashRes.data) {
          setData(dashRes.data);
        } else {
          setError(dashRes.error?.message || "Failed to load dashboard data.");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unexpected error occurred.");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="py-12">
        <LoadingState
          title="Loading MPLAD Portfolio Intelligence..."
          description="Retrieving monitored project records and anomaly signals."
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12">
        <ErrorState
          title="Dashboard Connection Issue"
          description={error}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="py-12">
        <EmptyState
          title="No Portfolio Data Available"
          description="No scheme monitoring feeds were found."
        />
      </div>
    );
  }

  const workspacePortals = [
    {
      title: "Audit Signals",
      subtitle: `${data.prioritySignals.length} Critical & High anomalies flagged for inspection`,
      href: "/signals",
      icon: <AlertTriangle style={{ width: "18px", height: "18px", color: "#C0392B" }} />,
      tag: `${data.prioritySignals.length} Signals`,
      accent: "#FEF2F2",
      badgeColor: "#991B1B",
      actionText: "View all signals",
    },
    {
      title: "Investigations",
      subtitle: `${data.kpis.totalAnomalies} Priority review cases with human auditor workflow`,
      href: "/investigations",
      icon: <ClipboardList style={{ width: "18px", height: "18px", color: "#0080FF" }} />,
      tag: `${data.kpis.totalAnomalies} Cases`,
      accent: "#EBF5FF",
      badgeColor: "#0052B3",
      actionText: "View investigations",
    },
    {
      title: "Project Explorer",
      subtitle: "Catalog of 543 Lok Sabha MPs with allocation limits across 36 States/UTs",
      href: "/projects",
      icon: <FolderSearch style={{ width: "18px", height: "18px", color: "#276749" }} />,
      tag: "543 MP Records",
      accent: "#F0FFF4",
      badgeColor: "#166534",
      actionText: "Open Project Explorer",
    },
    {
      title: "Analytics",
      subtitle: "State-wise distributions, sector anomaly rates, and agency concentrations",
      href: "/analytics",
      icon: <BarChart3 style={{ width: "18px", height: "18px", color: "#6366F1" }} />,
      tag: "36 States / UTs",
      accent: "#EEF2FF",
      badgeColor: "#4338CA",
      actionText: "Open analytics",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* 1. Header Section */}
      <DashboardHeader
        isDemoData={data.isDemoData}
        lastUpdatedText={data.kpis.lastUpdatedText}
        dataSource={data.dataSource}
      />

      {/* 2. Official Dataset Provenance */}
      <DataProvenanceCard />

      {/* 3. Primary Official KPIs */}
      <DashboardKpiGrid kpis={data.kpis} />

      {/* 4. Compact Executive Portfolio Summary */}
      <ExecutivePortfolioSummary
        riskData={data.riskDistribution}
        totalRecords={data.kpis.totalProjects}
      />

      {/* 5. Clean Institutional Workspace Gateway (Replaces clumsy stacked lists) */}
      <Card variant="default">
        <CardHeader style={{ paddingBottom: "12px", borderBottom: "1px solid #EDF1F6" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  padding: "5px",
                  borderRadius: "5px",
                  background: "#EBF5FF",
                  color: "#0080FF",
                  display: "flex",
                }}
              >
                <Compass style={{ width: "16px", height: "16px" }} />
              </div>
              <div>
                <CardTitle style={{ fontSize: "14px", fontWeight: 700, color: "#0F1724" }}>
                  Institutional Audit Workspaces
                </CardTitle>
                <p style={{ fontSize: "11px", color: "#64748B", margin: "2px 0 0" }}>
                  Access dedicated auditor views via the left navigation or quick links below
                </p>
              </div>
            </div>
            <span
              style={{
                fontSize: "10px",
                fontWeight: 600,
                padding: "2px 8px",
                borderRadius: "4px",
                background: "#F1F5F9",
                color: "#475569",
              }}
            >
              Auditor Workspaces
            </span>
          </div>
        </CardHeader>
        <CardContent style={{ padding: "18px 20px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "16px",
            }}
          >
            {workspacePortals.map((item, idx) => (
              <div
                key={idx}
                style={{
                  padding: "16px",
                  borderRadius: "8px",
                  background: "#FFFFFF",
                  border: "1px solid #DDE2EA",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "12px",
                  transition: "border-color 0.15s ease",
                }}
              >
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "10px",
                    }}
                  >
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "6px",
                        background: item.accent,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {item.icon}
                    </div>
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: 600,
                        padding: "2px 6px",
                        borderRadius: "4px",
                        background: item.accent,
                        color: item.badgeColor,
                      }}
                    >
                      {item.tag}
                    </span>
                  </div>
                  <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#0F1724", margin: 0 }}>
                    {item.title}
                  </h4>
                  <p style={{ fontSize: "11px", color: "#64748B", margin: "4px 0 0", lineHeight: 1.4 }}>
                    {item.subtitle}
                  </p>
                </div>

                <Link
                  href={item.href}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#0080FF",
                    textDecoration: "none",
                    paddingTop: "6px",
                    borderTop: "1px solid #F1F5F9",
                  }}
                >
                  {item.actionText}
                  <ArrowRight style={{ width: "13px", height: "13px" }} />
                </Link>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
