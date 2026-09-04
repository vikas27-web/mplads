import { NextRequest } from "next/server";
import { getProjectProgress, getProjectByCode } from "../../../../../../backend/api/services/projectService.ts";
import { jsonSuccess, jsonError } from "../../../../../../backend/api/response.ts";

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

    const exists = getProjectByCode(projectCode);
    if (!exists) {
      return jsonError("PROJECT_NOT_FOUND", `Project "${projectCode}" was not found.`, 404);
    }

    const data = getProjectProgress(projectCode);
    return jsonSuccess(data);
  } catch (err) {
    return jsonError("PROGRESS_ERROR", "Failed to retrieve project physical progress events.", 500);
  }
}
