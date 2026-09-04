import { NextRequest } from "next/server.js";
import { getAnomalyResultByCode } from "../../../../../../backend/api/services/anomalyService.ts";
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

    const anomalyResult = getAnomalyResultByCode(projectCode);
    if (!anomalyResult) {
      return jsonError(
        "ANOMALY_RESULT_NOT_FOUND",
        `No anomaly evaluation record found for project "${projectCode}".`,
        404
      );
    }

    return jsonSuccess({
      projectCode,
      anomalyResult,
    });
  } catch (err) {
    return jsonError(
      "ANOMALY_DETAIL_ERROR",
      "Failed to retrieve project anomaly signals.",
      500
    );
  }
}
