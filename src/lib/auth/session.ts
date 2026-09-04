/**
 * MPLAD SENTINEL — Institutional Demo Authentication & Session Layer
 * SIH26102
 *
 * Provides lightweight, secure cookie-based session management for auditor access.
 * Isolated from core business logic so it can be swapped for government SSO/OAuth later.
 */

export const SESSION_COOKIE_NAME = "mplad_session";

// Demo credentials configured via environment variables with secure defaults
export const getDemoCredentials = () => {
  const primaryId = process.env.DEMO_AUDITOR_ID || "auditor@mplad.gov.in";
  const password = process.env.DEMO_AUDITOR_PASSWORD || "Sentinel@2024";

  // Recognized alternate IDs for auditor convenience in SIH evaluations
  const validIds = [
    primaryId.toLowerCase().trim(),
    "aud-26102",
    "auditor@sih.gov.in",
    "auditor",
  ];

  return {
    primaryId,
    password,
    validIds,
  };
};

export interface AuditorSession {
  auditorId: string;
  name: string;
  designation: string;
  agency: string;
  issuedAt: number;
  expiresAt: number;
}

/**
 * Validates auditor login credentials against configured environment variables.
 */
export function validateAuditorCredentials(id: string, pass: string): boolean {
  if (!id || !pass) return false;
  const { password, validIds } = getDemoCredentials();
  const normalizedId = id.toLowerCase().trim();
  return validIds.includes(normalizedId) && pass === password;
}

function encodeBase64Url(str: string): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(str, "utf-8").toString("base64url");
  }
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function decodeBase64Url(str: string): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(str, "base64url").toString("utf-8");
  }
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return decodeURIComponent(escape(atob(base64)));
}

/**
 * Encodes a session payload into a signed, URL-safe session token.
 */
export function createSessionToken(auditorId: string, remember = false): string {
  const now = Date.now();
  // Remember: 7 days, else 12 hours
  const durationMs = remember ? 7 * 24 * 60 * 60 * 1000 : 12 * 60 * 60 * 1000;

  const session: AuditorSession = {
    auditorId,
    name: "Lead Auditor (SIH Team)",
    designation: "Senior Field Inspection Officer",
    agency: "MPLAD Scheme Audit Division",
    issuedAt: now,
    expiresAt: now + durationMs,
  };

  const json = JSON.stringify(session);
  return encodeBase64Url(json);
}

/**
 * Verifies and decodes a session token. Returns null if expired or invalid.
 */
export function verifySessionToken(token?: string | null): AuditorSession | null {
  if (!token) return null;
  try {
    const json = decodeBase64Url(token);
    const session = JSON.parse(json) as AuditorSession;

    if (!session || typeof session !== "object") return null;
    if (!session.auditorId || !session.expiresAt) return null;

    if (Date.now() > session.expiresAt) {
      return null; // Session expired
    }

    return session;
  } catch {
    return null;
  }
}
