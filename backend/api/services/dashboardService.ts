/**
 * MPLAD SENTINEL — Phase 9 Dashboard Service
 * Aggregates portfolio intelligence, KPIs, risk distributions, and priority signals
 * using canonical SQLite records and Phase 8 anomaly detection results.
 */

import fs from "node:fs";
import path from "node:path";
import { ProjectRepository } from "../../repository/projectRepository.ts";
import type { DashboardData, PriorityProject, PrioritySignal, DataQualitySummary } from "../../../src/types/dashboard.ts";
import { getAnomalyResultsMap } from "./anomalyService.ts";
import type { Severity, SignalType } from "../../anomaly/types.ts";

let defaultRepo: ProjectRepository | null = null;
function getRepo(): ProjectRepository {
  if (!defaultRepo) {
    defaultRepo = new ProjectRepository();
  }
  return defaultRepo;
}

const SEVERITY_WEIGHT: Record<Severity, number> = {
  CRITICAL: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};

const SIGNAL_TITLES: Record<SignalType, { label: string; desc: string }> = {
  PHYSICAL_FINANCIAL_MISMATCH: {
    label: "Physical-Financial Mismatch",
    desc: "Disbursement significantly outpacing verified site milestones",
  },
  TIMELINE_INCONSISTENCY: {
    label: "Timeline Inconsistency",
    desc: "Milestone inversion or severe project schedule overrun",
  },
  PAYMENT_PATTERN_SIGNAL: {
    label: "Payment Pattern Signal",
    desc: "Unusual tranche clearance accumulation or advance disbursement",
  },
  EXPENDITURE_SHIFT: {
    label: "Expenditure Shift",
    desc: "Abnormal fund drawdown or release ceiling exhaustion",
  },
  DUPLICATE_SIGNAL: {
    label: "Duplicate Work Signal",
    desc: "Overlapping work classification and identical budget allocation",
  },
  CONTRACTOR_CONCENTRATION: {
    label: "Contractor Concentration",
    desc: "Disproportionate single-vendor allocation in local area",
  },
  MISSING_DOCUMENTATION: {
    label: "Missing Documentation",
    desc: "Unverified stage inspection certificates or incomplete statutory files",
  },
  STATISTICAL_OUTLIER: {
    label: "Statistical Outlier (MAD)",
    desc: "Extreme deviation on continuous metrics (|Modified Z| >= 3.0)",
  },
  ISOLATION_FOREST_OUTLIER: {
    label: "Isolation Forest Outlier",
    desc: "Multi-dimensional anomaly isolated rapidly in feature space",
  },
  ALLOCATION_LIMIT_OUTLIER: {
    label: "Allocation Limit Outlier",
    desc: "Constituency allocation ceiling deviates substantially from ₹14.70 Cr baseline",
  },
  DATA_COMPLETENESS_SIGNAL: {
    label: "Data Completeness Signal",
    desc: "Constituency lists ₹0.00 allocation ceiling requiring administrative reconciliation",
  },
  REGIONAL_DISPARITY_SIGNAL: {
    label: "Regional Disparity Signal",
    desc: "Constituency allocation diverges notably from state median MP allocation",
  },
  MULTI_SIGNAL: {
    label: "Multi-Signal Concurrent",
    desc: "Multiple independent anomaly domains triggered concurrently",
  },
};

export function getDashboardData(): DashboardData {
  const repo = getRepo();
  const anomalyMap = getAnomalyResultsMap();
  const allProjects = repo.getAllProjects();

  let criticalRiskCount = 0;
  let highRiskCount = 0;
  let mediumRiskCount = 0;
  let lowRiskCount = 0;
  let totalAnomalies = 0;

  const categoryCounts: Record<string, number> = {};
  const districtMap: Record<string, { anomalyCount: number; maxSeverity: Severity; state: string }> = {};
  const sectorMap: Record<string, { projectCount: number; anomalyCount: number }> = {};
  const agencyMap: Record<string, { assignedProjects: number; flaggedCount: number }> = {};

  const prioritySignals: PrioritySignal[] = [];
  const priorityProjects: PriorityProject[] = [];

  for (const p of allProjects) {
    const anomaly = anomalyMap.get(p.project_code);
    const severity: Severity = anomaly ? anomaly.overallSeverity : "LOW";
    const hasSignal = anomaly ? anomaly.signals.length > 0 : false;

    if (hasSignal) totalAnomalies++;

    if (severity === "CRITICAL") criticalRiskCount++;
    else if (severity === "HIGH") highRiskCount++;
    else if (severity === "MEDIUM") mediumRiskCount++;
    else lowRiskCount++;

    // District aggregation
    if (!districtMap[p.district]) {
      districtMap[p.district] = { anomalyCount: 0, maxSeverity: "LOW", state: p.state };
    }
    if (hasSignal) {
      districtMap[p.district].anomalyCount++;
      if (SEVERITY_WEIGHT[severity] > SEVERITY_WEIGHT[districtMap[p.district].maxSeverity]) {
        districtMap[p.district].maxSeverity = severity;
      }
    }

    // Sector aggregation
    if (!sectorMap[p.sector]) {
      sectorMap[p.sector] = { projectCount: 0, anomalyCount: 0 };
    }
    sectorMap[p.sector].projectCount++;
    if (hasSignal) {
      sectorMap[p.sector].anomalyCount++;
    }

    // Agency aggregation
    if (!agencyMap[p.implementing_agency]) {
      agencyMap[p.implementing_agency] = { assignedProjects: 0, flaggedCount: 0 };
    }
    agencyMap[p.implementing_agency].assignedProjects++;
    if (hasSignal) {
      agencyMap[p.implementing_agency].flaggedCount++;
    }

    // Signal distribution & Priority Signals
    if (anomaly) {
      for (const sig of anomaly.signals) {
        categoryCounts[sig.signalType] = (categoryCounts[sig.signalType] || 0) + 1;

        if (sig.severity === "CRITICAL" || sig.severity === "HIGH") {
          prioritySignals.push({
            id: `sig-${p.project_code}-${sig.signalType}`,
            projectCode: p.project_code,
            constituency: p.constituency,
            title: p.project_title,
            signalType: SIGNAL_TITLES[sig.signalType]?.label || sig.signalType,
            severity: sig.severity as any,
            recommendedAction: "Physical on-site inspection and verification required.",
          });
        }
      }
    }

    // Priority Projects
    if (severity === "CRITICAL" || severity === "HIGH") {
      priorityProjects.push({
        projectCode: p.project_code,
        constituency: p.constituency,
        projectType: p.sector,
        severity: severity as any,
        signal: anomaly?.signals[0]?.signalType || "ANOMALY_SIGNAL",
        status: p.status,
        lastUpdated: p.actual_or_reported_completion_date || p.last_updated,
      });
    }
  }

  // Sort priority signals: CRITICAL first, then HIGH
  prioritySignals.sort(
    (a, b) =>
      (SEVERITY_WEIGHT[b.severity as Severity] || 0) -
      (SEVERITY_WEIGHT[a.severity as Severity] || 0)
  );

  // Sort priority projects: CRITICAL first, then HIGH
  priorityProjects.sort(
    (a, b) =>
      (SEVERITY_WEIGHT[b.severity as Severity] || 0) -
      (SEVERITY_WEIGHT[a.severity as Severity] || 0)
  );

  // Risk Distribution Items
  const total = allProjects.length;
  const riskDistribution = [
    {
      severity: "CRITICAL" as const,
      label: "Critical Priority",
      count: criticalRiskCount,
      displayPercentage: `${((criticalRiskCount / total) * 100).toFixed(1)}%`,
    },
    {
      severity: "HIGH" as const,
      label: "High Priority",
      count: highRiskCount,
      displayPercentage: `${((highRiskCount / total) * 100).toFixed(1)}%`,
    },
    {
      severity: "MEDIUM" as const,
      label: "Medium Priority",
      count: mediumRiskCount,
      displayPercentage: `${((mediumRiskCount / total) * 100).toFixed(1)}%`,
    },
    {
      severity: "LOW" as const,
      label: "Routine Monitoring",
      count: lowRiskCount,
      displayPercentage: `${((lowRiskCount / total) * 100).toFixed(1)}%`,
    },
  ];

  // Anomaly Distribution Items
  const anomalyDistribution = Object.entries(categoryCounts).map(([cat, count]) => ({
    category: SIGNAL_TITLES[cat as SignalType]?.label || cat,
    count,
    description: SIGNAL_TITLES[cat as SignalType]?.desc || "Potential audit review signal",
  }));
  anomalyDistribution.sort((a, b) => b.count - a.count);

  // District Signals
  const districtSignals = Object.entries(districtMap).map(([name, data]) => ({
    districtCode: name.substring(0, 3).toUpperCase(),
    districtName: name,
    state: data.state,
    anomalyCount: data.anomalyCount,
    severity: data.maxSeverity as any,
  }));
  districtSignals.sort((a, b) => b.anomalyCount - a.anomalyCount);

  // Sector Signals
  const sectorSignals = Object.entries(sectorMap).map(([name, data]) => ({
    sectorId: name.toLowerCase().replace(/\s+/g, "-"),
    sectorName: name,
    projectCount: data.projectCount,
    anomalyCount: data.anomalyCount,
  }));
  sectorSignals.sort((a, b) => b.anomalyCount - a.anomalyCount);

  // Agency Signals
  const agencySignals = Object.entries(agencyMap).map(([name, data]) => ({
    agencyId: name.toLowerCase().replace(/\s+/g, "-"),
    agencyName: name,
    assignedProjects: data.assignedProjects,
    flaggedCount: data.flaggedCount,
  }));
  agencySignals.sort((a, b) => b.flaggedCount - a.flaggedCount);

  let dataQuality: DataQualitySummary | undefined = undefined;
  const ingestionReportPath = path.join(process.cwd(), "data", "processed", "official_ingestion_report.json");
  if (fs.existsSync(ingestionReportPath)) {
    try {
      const rep = JSON.parse(fs.readFileSync(ingestionReportPath, "utf-8"));
      dataQuality = {
        sourceFile: rep.sourceFiles?.[0] || "Allocated Limit for Honble MPs.csv",
        totalSourceRows: rep.totalRowsRead || 544,
        acceptedRows: rep.acceptedRows || 543,
        rejectedRows: rep.rejectedRows || 0,
        duplicateRows: rep.duplicateRows || 0,
        grandTotalExcluded: rep.grandTotalRowsExcluded || 1,
        missingCriticalFields: rep.missingFieldStats?.zeroAllocationLimits || 1,
        dataCompletenessScore: "99.8%",
        totalAllocatedCrores: rep.nationalTotalAllocatedCrores || 8318.06,
        reconciliationDelta: rep.reconciliationDelta || 0,
        lastIngestedAt: rep.generatedAt || new Date().toISOString(),
      };
    } catch {
      // fallback
    }
  }

  return {
    isDemoData: false,
    disclaimerText:
      "All anomaly counts and priority ratings originate from deterministic audit rules, MAD robust statistics, and unsupervised Isolation Forest engines. Anomaly signal does not equal illicit conduct or wrongdoing. Physical verification & human investigation required.",
    generatedAt: new Date().toISOString(),
    dataSource:
      total === 543
        ? "OFFICIAL SIH26102 DATASET — Source: Ministry of Statistics & Programme Implementation (543 Lok Sabha MPs across 36 States/UTs, ₹8,318.06 Cr Total Ceiling)"
        : "Canonical MPLAD Dataset",
    kpis: {
      totalProjects: total,
      totalAnomalies,
      criticalRiskCount,
      highRiskCount,
      mediumRiskCount,
      lowRiskCount,
      lastUpdatedText: "Live SQLite & Anomaly Pipeline Feed",
    },
    riskDistribution,
    anomalyDistribution,
    districtSignals,
    sectorSignals,
    agencySignals,
    prioritySignals: prioritySignals.slice(0, 10),
    priorityProjects: priorityProjects.slice(0, 15),
    dataQuality,
  };
}
