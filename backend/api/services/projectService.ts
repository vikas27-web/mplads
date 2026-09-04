/**
 * MPLAD SENTINEL — Phase 9 Project Service
 * Coordinates database retrieval from ProjectRepository and merges anomaly metadata.
 */

import { ProjectRepository } from "../../repository/projectRepository.ts";
import type {
  ProjectRecord,
  PaymentRecord,
  PhysicalProgressRecord,
  DocumentRecord,
} from "../../types/project.ts";
import type {
  ProjectQueryParams,
  ProjectListItem,
  ProjectListResponse,
  ProjectDetailResponse,
  ProjectPaymentsResponse,
  ProjectProgressResponse,
  ProjectDocumentsResponse,
} from "../types.ts";
import { getAnomalyResultByCode, getAnomalyResultsMap } from "./anomalyService.ts";
import type { Severity } from "../../anomaly/types.ts";

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

/**
 * Retrieves paginated, filtered, and sorted projects with backend anomaly metadata.
 */
export function getProjects(params: ProjectQueryParams = {}): ProjectListResponse {
  const repo = getRepo();
  const anomalyMap = getAnomalyResultsMap();

  const allProjects = repo.getAllProjects();

  // 1. Map all projects to ProjectListItem with backend anomaly details
  let items: ProjectListItem[] = allProjects.map((p) => {
    const anomaly = anomalyMap.get(p.project_code);
    const severity: Severity = anomaly ? anomaly.overallSeverity : "LOW";
    const primarySignal =
      anomaly && anomaly.signals.length > 0
        ? anomaly.signals[0].signalType
        : "Standard Baseline";

    return {
      projectCode: p.project_code,
      title: p.project_title,
      constituency: p.constituency,
      district: p.district,
      state: p.state,
      sector: p.sector,
      implementingAgency: p.implementing_agency,
      contractorName: p.contractor_name,
      recommendedAmount: p.sanctioned_amount,
      severity,
      signal: primarySignal,
      status: p.status,
      sanctionDate: p.sanction_date,
      lastUpdated: p.actual_or_reported_completion_date || p.last_updated,
      anomalyScore: anomaly ? anomaly.overallSignalScore : 0.0,
      signalsCount: anomaly ? anomaly.signals.length : 0,
    };
  });

  // 2. Filter: Search Query
  if (params.search && params.search.trim()) {
    const q = params.search.trim().toLowerCase();
    items = items.filter(
      (item) =>
        item.projectCode.toLowerCase().includes(q) ||
        item.title.toLowerCase().includes(q) ||
        item.constituency.toLowerCase().includes(q) ||
        item.district.toLowerCase().includes(q) ||
        item.implementingAgency.toLowerCase().includes(q) ||
        item.contractorName.toLowerCase().includes(q)
    );
  }

  // 3. Filter: District
  if (params.district && params.district !== "ALL") {
    items = items.filter((item) => item.district === params.district);
  }

  // 4. Filter: Sector
  if (params.sector && params.sector !== "ALL") {
    items = items.filter((item) => item.sector === params.sector);
  }

  // 5. Filter: Severity (STRICT BACKEND ANOMALY RESULT SEVERITY)
  if (params.severity && params.severity !== "ALL") {
    items = items.filter((item) => item.severity === params.severity);
  }

  // 6. Filter: Status
  if (params.status && params.status !== "ALL") {
    items = items.filter((item) => item.status === params.status);
  }

  // 7. Sort
  const sortBy = params.sortBy || (params.sort as any) || "projectCode";
  const sortOrder = params.sortOrder || "asc";

  items.sort((a, b) => {
    let cmp = 0;
    if (sortBy === "recommendedAmount") {
      cmp = a.recommendedAmount - b.recommendedAmount;
    } else if (sortBy === "lastUpdated") {
      cmp = a.lastUpdated.localeCompare(b.lastUpdated);
    } else if (sortBy === "severity") {
      cmp = (SEVERITY_WEIGHT[a.severity] || 0) - (SEVERITY_WEIGHT[b.severity] || 0);
    } else {
      cmp = a.projectCode.localeCompare(b.projectCode);
    }
    return sortOrder === "desc" ? -cmp : cmp;
  });

  // 8. Pagination
  const page = Math.max(1, Number(params.page) || 1);
  const pageSize = Math.max(1, Math.min(100, Number(params.pageSize || params.limit) || 10));
  const totalCount = items.length;
  const totalPages = Math.ceil(totalCount / pageSize) || 1;
  const validPage = Math.min(page, totalPages);
  const startIndex = (validPage - 1) * pageSize;
  const paginatedProjects = items.slice(startIndex, startIndex + pageSize);

  // Available filter options extracted from canonical database
  const availableDistricts = repo.getDistinctDistricts();
  const availableSectors = repo.getDistinctSectors();
  const availableStatuses = Array.from(new Set(allProjects.map((p) => p.status))).sort();
  const availableSeverities = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];

  return {
    projects: paginatedProjects,
    pagination: {
      page: validPage,
      pageSize,
      total: totalCount,
      totalPages,
    },
    totalCount,
    page: validPage,
    pageSize,
    totalPages,
    availableDistricts,
    availableSectors,
    availableStatuses,
    availableSeverities,
  };
}

/**
 * Retrieves a single project detail with its complete anomaly signals and related records.
 */
export function getProjectByCode(projectCode: string): ProjectDetailResponse | null {
  const repo = getRepo();
  const project = repo.getProjectByCode(projectCode);
  if (!project) return null;

  const anomalyResult = getAnomalyResultByCode(projectCode);
  const payments = repo.getProjectPayments(projectCode);
  const physicalProgress = repo.getProjectProgress(projectCode);
  const documents = repo.getProjectDocuments(projectCode);

  const severity: Severity = anomalyResult ? anomalyResult.overallSeverity : "LOW";
  const signalCount = anomalyResult ? anomalyResult.signals.length : 0;
  const overallSignalScore = anomalyResult ? anomalyResult.overallSignalScore : 0.0;
  const reviewPriority =
    severity === "CRITICAL" || severity === "HIGH"
      ? "Immediate Inspection Required"
      : severity === "MEDIUM"
      ? "Desk Verification Recommended"
      : "Standard Routine Monitoring";

  const primaryExplanation = anomalyResult
    ? anomalyResult.explanation
    : "No anomalous conditions detected. Progress and milestones adhere to standard baselines.";

  return {
    project,
    signals: anomalyResult ? anomalyResult.signals : [],
    anomalyResult,
    payments,
    progress: physicalProgress,
    physicalProgress,
    documents,
    summary: {
      severity,
      signalCount,
      overallSignalScore,
      reviewPriority,
      primaryExplanation,
    },
  };
}

/**
 * Retrieves project payment records.
 */
export function getProjectPayments(projectCode: string): ProjectPaymentsResponse {
  const repo = getRepo();
  const payments = repo.getProjectPayments(projectCode);
  return {
    projectCode,
    totalPayments: payments.length,
    payments,
  };
}

/**
 * Retrieves project physical progress events.
 */
export function getProjectProgress(projectCode: string): ProjectProgressResponse {
  const repo = getRepo();
  const progressEvents = repo.getProjectProgress(projectCode);
  return {
    projectCode,
    totalEvents: progressEvents.length,
    progressEvents,
  };
}

/**
 * Retrieves project statutory documents.
 */
export function getProjectDocuments(projectCode: string): ProjectDocumentsResponse {
  const repo = getRepo();
  const documents = repo.getProjectDocuments(projectCode);
  return {
    projectCode,
    totalDocuments: documents.length,
    documents,
  };
}
