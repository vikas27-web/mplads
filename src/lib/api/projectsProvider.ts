import { ApiResponse } from "@/types/api";
import type { ProjectFilterParams, ProjectListResponse } from "@/types/project";
import { getProjects as fetchProjectsFromApi } from "@/lib/api-client";
import type { ProjectQueryParams } from "../../../backend/api/types.ts";

/**
 * Data provider abstraction for MPLAD SENTINEL Project Explorer.
 *
 * In Phase 9, delegates directly to live backend REST API (GET /api/projects).
 */
export async function getProjects(
  params: ProjectFilterParams = {}
): Promise<ApiResponse<ProjectListResponse>> {
  const queryParams: ProjectQueryParams = {
    search: params.search,
    district: params.district,
    sector: params.sector,
    severity: params.severity,
    status: params.status,
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
    page: params.page,
    pageSize: params.limit,
  };

  const res = await fetchProjectsFromApi(queryParams);
  if (!res.success || !res.data) {
    return {
      success: false,
      data: null,
      error: res.error,
      meta: res.meta,
    };
  }

  // Cast ProjectListItem[] into UI ProjectRecord[]
  const uiProjects = res.data.projects.map((p) => ({
    projectCode: p.projectCode,
    title: p.title,
    constituency: p.constituency,
    district: p.district,
    state: p.state,
    sector: p.sector,
    implementingAgency: p.implementingAgency,
    contractorName: p.contractorName,
    recommendedAmount: p.recommendedAmount,
    severity: p.severity as any,
    signal: p.signal,
    status: p.status,
    sanctionDate: p.sanctionDate,
    lastUpdated: p.lastUpdated,
  }));

  return {
    success: true,
    data: {
      projects: uiProjects,
      totalCount: res.data.totalCount,
      page: res.data.page,
      limit: res.data.pageSize,
      totalPages: res.data.totalPages,
      availableDistricts: res.data.availableDistricts,
      availableSectors: res.data.availableSectors,
      availableStatuses: res.data.availableStatuses,
    },
    meta: res.meta,
  };
}
