import { getDashboardData } from "../../../../backend/api/services/dashboardService.ts";
import { jsonSuccess, jsonError } from "../../../../backend/api/response.ts";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = getDashboardData();
    return jsonSuccess(data);
  } catch (err) {
    return jsonError("DASHBOARD_ERROR", "Failed to retrieve portfolio dashboard intelligence.", 500);
  }
}
