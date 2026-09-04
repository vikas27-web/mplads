import { NextRequest } from "next/server";
import { getAllAnomalyResults } from "../../../../backend/api/services/anomalyService.ts";
import { jsonSuccess, jsonError } from "../../../../backend/api/response.ts";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const severity = searchParams.get("severity");

    let results = getAllAnomalyResults();

    if (severity && severity !== "ALL") {
      results = results.filter((r) => r.overallSeverity === severity);
    }

    return jsonSuccess({
      total: results.length,
      results,
    });
  } catch (err) {
    return jsonError("ANOMALY_RETRIEVAL_FAILED", "Failed to retrieve anomaly results.", 500);
  }
}
