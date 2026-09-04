import { SeverityLevel } from "@/components/ui/SeverityBadge";

export interface ProjectRecord {
  projectCode: string;
  title: string;
  constituency: string;
  district: string;
  state: string;
  sector: string;
  implementingAgency: string;
  contractorName: string;
  recommendedAmount: number; // Raw currency number, formatted at presentation boundary
  severity: SeverityLevel;
  signal: string;
  status: string;
  sanctionDate: string; // ISO date string (YYYY-MM-DD)
  lastUpdated: string; // ISO date string (YYYY-MM-DD)
}

export type SortField = "projectCode" | "severity" | "recommendedAmount" | "lastUpdated";
export type SortDirection = "asc" | "desc";

export interface ProjectFilterParams {
  search?: string;
  state?: string;
  district?: string;
  sector?: string;
  severity?: string;
  signalType?: string;
  status?: string;
  sortBy?: SortField;
  sortOrder?: SortDirection;
  page?: number;
  limit?: number;
}

export interface ProjectListResponse {
  projects: ProjectRecord[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
  availableStates?: string[];
  availableDistricts: string[];
  availableSectors: string[];
  availableStatuses: string[];
  availableSignalTypes?: string[];
}
