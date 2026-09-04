import { getHealthStatus } from "../../../../backend/api/services/healthService.ts";
import { jsonSuccess, jsonError } from "../../../../backend/api/response.ts";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = getHealthStatus();
    return jsonSuccess(data, {}, (data.status === "ok" || data.status === "healthy") ? 200 : 503);
  } catch (err) {
    return jsonError(
      "HEALTH_CHECK_FAILED",
      "Health inspection failed due to internal error.",
      500
    );
  }
}
