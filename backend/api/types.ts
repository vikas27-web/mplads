/**
 * MPLAD SENTINEL — Phase 9 API Types & Data Contracts
 * Defines standard response envelopes, query parameter schemas, and endpoint responses.
 *
 * Reuses canonical domain types from backend/types/project.ts and backend/anomaly/types.ts.
 */

import type {
  ProjectRecord,
  PaymentRecord,
  PhysicalProgressRecord,
  DocumentRecord,
} from "../types/project.ts";
import type {
  AnomalyResult,
  AnomalySignal,
  Severity,
} from "../anomaly/types.ts";
import type { DashboardData } from "../../src/types/dashboard.ts";
import type { ProjectInvestigation } from "../../src/types/project-investigation.ts";

/**
 * Standard API envelope
 */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
    total?: number;
    page?: number;
    pageSize?: number;
    totalPages?: number;
    [key: string]: unknown;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Query parameters for project listing and exploration
 */
export interface ProjectQueryParams {
  search?: string;
  state?: string;
  district?: string;
  sector?: string;
  severity?: string;
  signalType?: string;
  status?: string;
  sort?: string;
  sortBy?: "projectCode" | "recommendedAmount" | "lastUpdated" | "severity";
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
  limit?: number;
  [key: string]: string | number | boolean | undefined;
}

/**
 * Unified project list item decorated with backend anomaly severity
 */
export interface ProjectListItem {
  projectCode: string;
  title: string;
  constituency: string;
  district: string;
  state: string;
  sector: string;
  implementingAgency: string;
  contractorName: string;
  recommendedAmount: number;
  severity: Severity;
  signal: string;
  status: string;
  sanctionDate: string;
  lastUpdated: string;
  anomalyScore: number;
  signalsCount: number;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ProjectListResponse {
  projects: ProjectListItem[];
  pagination: PaginationMeta;
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  availableStates?: string[];
  availableDistricts: string[];
  availableSectors: string[];
  availableStatuses: string[];
  availableSeverities: string[];
  availableSignalTypes?: string[];
}

export interface ProjectDetailResponse {
  project: ProjectRecord;
  signals: AnomalySignal[];
  anomalyResult: AnomalyResult | null;
  payments?: PaymentRecord[];
  progress?: PhysicalProgressRecord[];
  physicalProgress?: PhysicalProgressRecord[];
  documents?: DocumentRecord[];
  summary: {
    severity: Severity;
    signalCount: number;
    overallSignalScore: number;
    reviewPriority: string;
    primaryExplanation: string;
  };
}

export interface ProjectPaymentsResponse {
  projectCode: string;
  totalPayments: number;
  payments: PaymentRecord[];
}

export interface ProjectProgressResponse {
  projectCode: string;
  totalEvents: number;
  progressEvents: PhysicalProgressRecord[];
}

export interface ProjectDocumentsResponse {
  projectCode: string;
  totalDocuments: number;
  documents: DocumentRecord[];
}

export interface AnomalyListResponse {
  total: number;
  results: AnomalyResult[];
  pagination?: PaginationMeta;
}

export interface AnomalyResultResponse {
  result: AnomalyResult;
}

export interface AnomalyResponse {
  projectCode: string;
  anomalyResult: AnomalyResult;
}

export type DashboardResponse = DashboardData;

export interface InvestigationItem {
  id: string;
  projectCode: string;
  title: string;
  constituency: string;
  district: string;
  sector: string;
  severity: Severity;
  signalType: string;
  signalSummary: string;
  explanation: string;
  evidenceCount: number;
  overallSignalScore: number;
  reviewPriority: string;
  status: string;
  createdDate: string;
  lastUpdated: string;
  assignedReviewer: string;
  signals: AnomalySignal[];
}

export interface InvestigationResponse {
  total: number;
  investigations: InvestigationItem[];
}

export interface InvestigationDetailResponse {
  investigation: InvestigationItem;
  dossier: ProjectInvestigation | null;
}

export interface HealthResponse {
  status: "ok" | "healthy" | "degraded" | "unhealthy";
  service: string;
  database: "connected" | "error";
  anomalyEngine: "available" | "unavailable";
  projectCount?: number;
  timestamp: string;
  version: string;
}
