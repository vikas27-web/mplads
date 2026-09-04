import { NextRequest } from "next/server.js";
import { getInvestigations } from "../../../../backend/api/services/investigationService.ts";
import { jsonSuccess, jsonError } from "../../../../backend/api/response.ts";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const severity = searchParams.get("severity") || undefined;
    const search = searchParams.get("search") || undefined;

    const result = getInvestigations({ severity, search });
    return jsonSuccess(result);
  } catch (err) {
    return jsonError("INVESTIGATIONS_ERROR", "Failed to retrieve investigation cases.", 500);
  }
}
