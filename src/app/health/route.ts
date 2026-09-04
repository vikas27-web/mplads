import { NextResponse } from "next/server";
import { getHealthStatus } from "../../../backend/api/services/healthService.ts";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = getHealthStatus();
    const isOk = data.status === "ok" || data.status === "healthy";
    return NextResponse.json(
      {
        status: isOk ? "ok" : "degraded",
        service: "mplad-sentinel",
        timestamp: new Date().toISOString(),
        checks: data,
      },
      { status: isOk ? 200 : 503 }
    );
  } catch (err) {
    return NextResponse.json(
      {
        status: "error",
        service: "mplad-sentinel",
        timestamp: new Date().toISOString(),
        error: "Health inspection failed due to internal error.",
      },
      { status: 500 }
    );
  }
}
