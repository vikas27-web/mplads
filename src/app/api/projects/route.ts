import { NextRequest } from "next/server.js";
import { getProjects } from "../../../../backend/api/services/projectService.ts";
import { jsonSuccess, jsonError } from "../../../../backend/api/response.ts";
import type { ProjectQueryParams } from "../../../../backend/api/types.ts";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const pageRaw = searchParams.get("page");
    const pageSizeRaw = searchParams.get("pageSize") || searchParams.get("limit");
    const page = pageRaw ? parseInt(pageRaw, 10) : 1;
    const pageSize = pageSizeRaw ? parseInt(pageSizeRaw, 10) : 10;

    if (Number.isNaN(page) || page < 1) {
      return jsonError("INVALID_PAGE", "Page parameter must be a positive integer.", 400);
    }
    if (Number.isNaN(pageSize) || pageSize < 1 || pageSize > 100) {
      return jsonError("INVALID_PAGE_SIZE", "PageSize parameter must be between 1 and 100.", 400);
    }

    const params: ProjectQueryParams = {
      search: searchParams.get("search") || undefined,
      state: searchParams.get("state") || undefined,
      district: searchParams.get("district") || undefined,
      sector: searchParams.get("sector") || undefined,
      severity: searchParams.get("severity") || undefined,
      signalType: searchParams.get("signalType") || undefined,
      status: searchParams.get("status") || undefined,
      sortBy: (searchParams.get("sortBy") || searchParams.get("sort") || undefined) as any,
      sortOrder: (searchParams.get("sortOrder") as any) || undefined,
      page,
      pageSize,
    };

    const result = getProjects(params);

    return jsonSuccess(result, {
      total: result.totalCount,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
    });
  } catch (err) {
    return jsonError(
      "PROJECTS_RETRIEVAL_FAILED",
      "Failed to query project catalog.",
      500
    );
  }
}
