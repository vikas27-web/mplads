import { NextRequest } from "next/server.js";
import { getInvestigationById } from "../../../../../backend/api/services/investigationService.ts";
import { jsonSuccess, jsonError } from "../../../../../backend/api/response.ts";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;

    if (!id || !id.trim()) {
      return jsonError("INVALID_INVESTIGATION_ID", "Investigation identifier is required.", 400);
    }

    const result = getInvestigationById(id);
    if (!result) {
      return jsonError(
        "INVESTIGATION_NOT_FOUND",
        `Investigation case "${id}" was not found.`,
        404
      );
    }

    return jsonSuccess(result);
  } catch (err) {
    return jsonError(
      "INVESTIGATION_DETAIL_ERROR",
      "Failed to retrieve investigation case details.",
      500
    );
  }
}
