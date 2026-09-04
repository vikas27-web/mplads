"use client";

import React, { useEffect, useState, useMemo } from "react";
import { DashboardData } from "@/types/dashboard";
import { getDashboardData } from "@/lib/api/dashboardProvider";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/States";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardKpiGrid } from "@/components/dashboard/DashboardKpiGrid";
import { RiskDistributionChart } from "@/components/dashboard/RiskDistributionChart";
import { AnomalyDistributionChart } from "@/components/dashboard/AnomalyDistributionChart";
import { DistrictRiskSection } from "@/components/dashboard/DistrictRiskSection";
import { SectorRiskSection } from "@/components/dashboard/SectorRiskSection";
import { AgencyConcentrationSection } from "@/components/dashboard/AgencyConcentrationSection";
import { PrioritySignalsPanel } from "@/components/dashboard/PrioritySignalsPanel";
import { PriorityProjectsTable } from "@/components/dashboard/PriorityProjectsTable";
import { DashboardFilterBar } from "@/components/dashboard/DashboardFilterBar";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Presentational filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState("ALL");

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getDashboardData();
        if (response.success && response.data) {
          setData(response.data);
        } else {
          setError(response.error?.message || "Failed to load dashboard data.");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unexpected error occurred.");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Filter priority projects without calculating business metrics
  const filteredProjects = useMemo(() => {
    if (!data) return [];
    return data.priorityProjects.filter((p) => {
      const matchesSearch =
        searchQuery === "" ||
        p.projectCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.constituency.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSeverity =
        selectedSeverity === "ALL" || p.severity === selectedSeverity;

      return matchesSearch && matchesSeverity;
    });
  }, [data, searchQuery, selectedSeverity]);

  if (isLoading) {
    return (
      <div className="py-12">
        <LoadingState title="Loading MPLAD Portfolio Intelligence..." description="Retrieving monitored project records and anomaly signals." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12">
        <ErrorState title="Dashboard Connection Issue" description={error} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="py-12">
        <EmptyState title="No Portfolio Data Available" description="No scheme monitoring feeds were found." />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 1. Header Section */}
      <DashboardHeader isDemoData={data.isDemoData} lastUpdatedText={data.kpis.lastUpdatedText} />

      {/* 2. KPI Overview */}
      <DashboardKpiGrid kpis={data.kpis} />

      {/* 3. Filter Controls */}
      <DashboardFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedSeverity={selectedSeverity}
        onSeverityChange={setSelectedSeverity}
        onReset={() => {
          setSearchQuery("");
          setSelectedSeverity("ALL");
        }}
      />

      {/* 4. Charts Section (Risk Distribution + Anomaly Categories) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RiskDistributionChart data={data.riskDistribution} />
        <AnomalyDistributionChart data={data.anomalyDistribution} />
      </div>

      {/* 5. Priority Review Signals Panel */}
      <PrioritySignalsPanel signals={data.prioritySignals} />

      {/* 6. Signals Grid (District, Sector, Agency) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DistrictRiskSection signals={data.districtSignals} />
        <SectorRiskSection sectors={data.sectorSignals} />
        <AgencyConcentrationSection agencies={data.agencySignals} />
      </div>

      {/* 7. Priority Projects Table */}
      <PriorityProjectsTable projects={filteredProjects} />
    </div>
  );
}
