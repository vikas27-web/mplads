import { NextRequest, NextResponse } from "next/server";
import {
  validateAuditorCredentials,
  createSessionToken,
  SESSION_COOKIE_NAME,
} from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid request payload." },
        { status: 400 }
      );
    }

    const { auditorId, password, remember } = body as {
      auditorId?: string;
      password?: string;
      remember?: boolean;
    };

    if (!auditorId || !password) {
      return NextResponse.json(
        { success: false, error: "Official Email / Auditor ID and password are required." },
        { status: 400 }
      );
    }

    const isValid = validateAuditorCredentials(auditorId, password);

    if (!isValid) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid Auditor ID or password. Please verify credentials.",
        },
        { status: 401 }
      );
    }

    const token = createSessionToken(auditorId, !!remember);
    const maxAge = remember ? 7 * 24 * 60 * 60 : 12 * 60 * 60; // seconds

    const response = NextResponse.json({
      success: true,
      redirect: "/dashboard",
      message: "Auditor authentication successful.",
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge,
    });

    return response;
  } catch {
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred during authentication." },
      { status: 500 }
    );
  }
}
