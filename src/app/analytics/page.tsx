import { getDashboardData } from "../../../backend/api/services/dashboardService.ts";
import { PageContainer } from "@/components/ui/PageContainer";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { RiskDistributionChart } from "@/components/dashboard/RiskDistributionChart";
import { AnomalyDistributionChart } from "@/components/dashboard/AnomalyDistributionChart";
import { SectorRiskSection } from "@/components/dashboard/SectorRiskSection";
import { AgencyConcentrationSection } from "@/components/dashboard/AgencyConcentrationSection";
import { DistrictRiskSection } from "@/components/dashboard/DistrictRiskSection";
import { ResponsibleAiBanner } from "@/components/ui/ResponsibleAiBanner";

export const dynamic = "force-dynamic";

export default function AnalyticsPage() {
  const data = getDashboardData();

  const totalProjectsWithSignals = data.kpis.totalAnomalies;
  const detectionRate = Math.round((totalProjectsWithSignals / data.kpis.totalProjects) * 100);

  return (
    <PageContainer
      title="Statistical Analytics"
      subtitle="Scheme-wide distributions, statistical allocation baselines, and anomaly signal detections"
    >
      {/* Responsible AI Notice */}
      <ResponsibleAiBanner />

      {/* Summary Strip */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "12px",
        }}
      >
        {[
          { label: "Official Records", value: "543 MPs", sub: "18th Lok Sabha allocations" },
          { label: "Total Allocation", value: "₹8,318.05 Cr", sub: "Reconciled national outlay" },
          { label: "Geographic Coverage", value: "36 States / UTs", sub: "Pan-India parliamentary coverage" },
          { label: "Priority Review Signals", value: `${totalProjectsWithSignals}`, sub: "Prioritized for human verification" },
        ].map((kpi, idx) => (
          <Card key={idx}>
            <CardContent style={{ padding: "14px 16px" }}>
              <div style={{ fontSize: "10px", fontWeight: 600, color: "#9BA8B5", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {kpi.label}
              </div>
              <div style={{ fontSize: "24px", fontWeight: 700, color: "#0080FF", marginTop: "4px", fontVariantNumeric: "tabular-nums" }}>
                {kpi.value}
              </div>
              <div style={{ fontSize: "11px", color: "#6B7A8E", marginTop: "2px" }}>{kpi.sub}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }} className="grid-cols-1 md:grid-cols-2">
        <RiskDistributionChart data={data.riskDistribution} />
        <AnomalyDistributionChart data={data.anomalyDistribution} />
      </div>

      {/* Sector + District + Agency Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }} className="grid-cols-1 md:grid-cols-3">
        <SectorRiskSection sectors={data.sectorSignals} />
        <DistrictRiskSection signals={data.districtSignals} />
        <AgencyConcentrationSection agencies={data.agencySignals} />
      </div>

      {/* Methodology note */}
      <Card>
        <CardHeader>
          <CardTitle>Detection Methodology</CardTitle>
          <CardDescription>Phase 8 anomaly engine — multi-detector ensemble</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "12px",
            }}
          >
            {[
              { name: "Rule-Based Detectors", desc: "7 domain-specific rules: physical-financial mismatch, timeline inconsistency, payment pattern, expenditure shift, duplicate work, contractor concentration, missing documentation." },
              { name: "MAD Statistical Detection", desc: "Median Absolute Deviation applied to 65 feature dimensions. Robust to outliers, deterministic." },
              { name: "Isolation Forest (IForest)", desc: "Pure TypeScript implementation with seed 26102. Score range [0,1]. Higher score = more anomalous path average depth." },
            ].map((m, idx) => (
              <div
                key={idx}
                style={{
                  padding: "12px",
                  background: "#F8F9FB",
                  border: "1px solid #DDE2EA",
                  borderRadius: "6px",
                }}
              >
                <div style={{ fontSize: "12px", fontWeight: 600, color: "#0F1724", marginBottom: "6px" }}>{m.name}</div>
                <p style={{ fontSize: "11px", color: "#6B7A8E", margin: 0, lineHeight: 1.5 }}>{m.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
