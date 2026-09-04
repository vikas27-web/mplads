import { ApiResponse } from "@/types/api";
import type { DashboardData } from "@/types/dashboard";
import { getDashboard } from "@/lib/api-client";

/**
 * Data provider function for MPLAD SENTINEL Portfolio Dashboard.
 *
 * In Phase 9, delegates directly to live backend endpoint: GET /api/dashboard.
 */
export async function getDashboardData(): Promise<ApiResponse<DashboardData>> {
  return getDashboard();
}
