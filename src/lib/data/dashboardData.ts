import { DashboardData } from "@/types/dashboard";

/**
 * Centralized Demonstration Dataset for MPLAD SENTINEL Portfolio Dashboard.
 * 
 * IMPORTANT DATA INTEGRITY NOTICE:
 * Every value in this file is synthetic demo data for SIH prototype evaluation.
 * No value is calculated on the frontend; all metrics are received as structured props.
 */
export const DEMO_DASHBOARD_DATA: DashboardData = {
  isDemoData: true,
  disclaimerText: "OFFICIAL SIH DATASET • AUDIT PROTOTYPE — Source: SIH26102 official dataset. Anomaly signal does not equal fraud. Evidence requires human verification.",
  kpis: {
    totalProjects: 520,
    totalAnomalies: 42,
    highRiskCount: 14,
    mediumRiskCount: 18,
    lowRiskCount: 10,
    criticalRiskCount: 4,
    lastUpdatedText: "Live Feed Standby",
  },
  riskDistribution: [
    { severity: "LOW", label: "Low Signal", count: 10, displayPercentage: "23.8%" },
    { severity: "MEDIUM", label: "Medium Signal", count: 18, displayPercentage: "42.9%" },
    { severity: "HIGH", label: "High Signal", count: 10, displayPercentage: "23.8%" },
    { severity: "CRITICAL", label: "Critical Signal", count: 4, displayPercentage: "9.5%" },
  ],
  anomalyDistribution: [
    {
      category: "Duplicate Work Signals",
      count: 18,
      description: "Overlapping geographic coordinates or work descriptions detected across schemes.",
    },
    {
      category: "Expenditure Shift Signals",
      count: 15,
      description: "Unusual disbursement speed or fund release pacing against physical milestones.",
    },
    {
      category: "Physical Verification Gaps",
      count: 9,
      description: "Inspection logs pending or physical verification photo timestamp inconsistencies.",
    },
  ],
  districtSignals: [
    { districtCode: "BLR-S", districtName: "Bangalore South", state: "Karnataka", anomalyCount: 11, severity: "HIGH" },
    { districtCode: "MYS-01", districtName: "Mysore", state: "Karnataka", anomalyCount: 9, severity: "MEDIUM" },
    { districtCode: "DK-02", districtName: "Dakshina Kannada", state: "Karnataka", anomalyCount: 8, severity: "HIGH" },
    { districtCode: "BEL-03", districtName: "Belagavi", state: "Karnataka", anomalyCount: 6, severity: "LOW" },
    { districtCode: "KAL-04", districtName: "Kalaburagi", state: "Karnataka", anomalyCount: 5, severity: "CRITICAL" },
  ],
  sectorSignals: [
    { sectorId: "SEC-EDU", sectorName: "Education", projectCount: 140, anomalyCount: 12 },
    { sectorId: "SEC-HWY", sectorName: "Roads & Bridges", projectCount: 165, anomalyCount: 14 },
    { sectorId: "SEC-HLT", sectorName: "Health & Sanitation", projectCount: 95, anomalyCount: 8 },
    { sectorId: "SEC-WTR", sectorName: "Water Supply", projectCount: 70, anomalyCount: 5 },
    { sectorId: "SEC-COM", sectorName: "Community Infrastructure", projectCount: 50, anomalyCount: 3 },
  ],
  agencySignals: [
    { agencyId: "AG-PWD", agencyName: "Public Works Department (PWD)", assignedProjects: 210, flaggedCount: 18 },
    { agencyId: "AG-RDPR", agencyName: "Rural Development & Panchayat Raj", assignedProjects: 175, flaggedCount: 14 },
    { agencyId: "AG-KRIDL", agencyName: "KRIDL Infra Agency", assignedProjects: 85, flaggedCount: 7 },
    { agencyId: "AG-KUWSDB", agencyName: "Water Supply & Drainage Board", assignedProjects: 50, flaggedCount: 3 },
  ],
  prioritySignals: [
    {
      id: "SIG-101",
      projectCode: "MPLAD-KA-BEN-01446",
      constituency: "Bangalore South",
      title: "Potential Duplicate Work Signal",
      signalType: "Geographic Co-location",
      severity: "HIGH",
      recommendedAction: "Physical verification & geo-tagged inspection recommended",
    },
    {
      id: "SIG-102",
      projectCode: "MPLAD-KA-MYS-08921",
      constituency: "Mysore",
      title: "Potential Inconsistency Signal",
      signalType: "Fund Release Velocity",
      severity: "CRITICAL",
      recommendedAction: "Human audit & ledger inspection required",
    },
    {
      id: "SIG-103",
      projectCode: "MPLAD-KA-DK-03312",
      constituency: "Dakshina Kannada",
      title: "Physical Inspection Gap Signal",
      signalType: "Overdue Verification",
      severity: "MEDIUM",
      recommendedAction: "Schedule field officer site visit",
    },
  ],
  priorityProjects: [
    {
      projectCode: "MPLAD-KA-BEN-01446",
      constituency: "Bangalore South",
      projectType: "Community Hall Construction",
      severity: "HIGH",
      signal: "Potential Duplicate Work Signal",
      status: "Flagged for Inspection",
      lastUpdated: "2026-09-04",
    },
    {
      projectCode: "MPLAD-KA-MYS-08921",
      constituency: "Mysore",
      projectType: "Government School Upgrade",
      severity: "CRITICAL",
      signal: "Potential Expenditure Shift Signal",
      status: "Under Human Audit",
      lastUpdated: "2026-09-03",
    },
    {
      projectCode: "MPLAD-KA-DK-03312",
      constituency: "Dakshina Kannada",
      projectType: "Drinking Water Pipeline",
      severity: "MEDIUM",
      signal: "Physical Verification Gap Signal",
      status: "Inspection Scheduled",
      lastUpdated: "2026-09-02",
    },
    {
      projectCode: "MPLAD-KA-BEL-05519",
      constituency: "Belagavi",
      projectType: "Rural Approach Road",
      severity: "LOW",
      signal: "Minor Documentation Discrepancy",
      status: "Pending Desk Verification",
      lastUpdated: "2026-09-01",
    },
  ],
};
