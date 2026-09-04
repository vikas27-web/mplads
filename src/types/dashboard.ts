import { SeverityLevel } from "@/components/ui/SeverityBadge";

export interface DashboardKpi {
  totalProjects: number;
  totalAnomalies: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
  criticalRiskCount?: number;
  lastUpdatedText?: string;
}

export interface RiskDistributionItem {
  severity: SeverityLevel;
  label: string;
  count: number;
  displayPercentage?: string;
}

export interface AnomalyDistributionItem {
  category: string;
  count: number;
  description: string;
}

export interface DistrictRiskSignal {
  districtCode: string;
  districtName: string;
  state: string;
  anomalyCount: number;
  severity: SeverityLevel;
}

export interface SectorRiskSignal {
  sectorId: string;
  sectorName: string;
  projectCount: number;
  anomalyCount: number;
}

export interface AgencySignal {
  agencyId: string;
  agencyName: string;
  assignedProjects: number;
  flaggedCount: number;
}

export interface PrioritySignal {
  id: string;
  projectCode: string;
  constituency: string;
  title: string;
  signalType: string;
  severity: SeverityLevel;
  recommendedAction: string;
}

export interface PriorityProject {
  projectCode: string;
  constituency: string;
  projectType: string;
  severity: SeverityLevel;
  signal: string;
  status: string;
  lastUpdated: string;
}

export interface DashboardData {
  isDemoData: boolean;
  disclaimerText: string;
  generatedAt?: string;
  dataSource?: string;
  kpis: DashboardKpi;
  riskDistribution: RiskDistributionItem[];
  anomalyDistribution: AnomalyDistributionItem[];
  districtSignals: DistrictRiskSignal[];
  sectorSignals: SectorRiskSignal[];
  agencySignals: AgencySignal[];
  prioritySignals: PrioritySignal[];
  priorityProjects: PriorityProject[];
}
