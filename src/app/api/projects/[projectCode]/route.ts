import { NextRequest } from "next/server.js";
import { getProjectByCode } from "../../../../../backend/api/services/projectService.ts";
import { jsonSuccess, jsonError } from "../../../../../backend/api/response.ts";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: {
    projectCode: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { projectCode } = params;

    if (!projectCode || !projectCode.trim()) {
      return jsonError("INVALID_PROJECT_CODE", "Project code parameter is required.", 400);
    }

    const detail = getProjectByCode(projectCode);
    if (!detail) {
      return jsonError(
        "PROJECT_NOT_FOUND",
        `Project with code "${projectCode}" was not found in the database.`,
        404
      );
    }

    return jsonSuccess(detail);
  } catch (err) {
    return jsonError(
      "PROJECT_DETAIL_ERROR",
      "Failed to retrieve project detail.",
      500
    );
  }
}
