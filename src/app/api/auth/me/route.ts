import { NextRequest, NextResponse } from "next/server";
import {
  verifySessionToken,
  SESSION_COOKIE_NAME,
} from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = verifySessionToken(token);

  if (!session) {
    return NextResponse.json(
      { authenticated: false, error: "No active auditor session." },
      { status: 401 }
    );
  }

  return NextResponse.json({
    authenticated: true,
    user: session,
  });
}
