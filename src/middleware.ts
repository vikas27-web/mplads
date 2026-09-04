import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  SESSION_COOKIE_NAME,
  verifySessionToken,
} from "@/lib/auth/session";

/**
 * Routes requiring active auditor authentication.
 */
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/projects",
  "/signals",
  "/analytics",
  "/investigations",
  "/dev",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Bypass API endpoints, health checks, and static Next.js assets
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/health") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".") // favicon, images, fonts
  ) {
    return NextResponse.next();
  }

  // 2. Read session cookie
  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = verifySessionToken(sessionToken);
  const isAuthenticated = !!session;

  // 3. Authenticated user visiting /login -> redirect to /dashboard
  if (pathname === "/login") {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // 4. Root / entry point:
  // If authenticated, forward to dashboard; if unauthenticated, forward to login
  if (pathname === "/") {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 5. Protected route inspection
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - health endpoint
     */
    "/((?!api|health|_next/static|_next/image|favicon.ico).*)",
  ],
};
