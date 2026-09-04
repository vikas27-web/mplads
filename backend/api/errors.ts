/**
 * MPLAD SENTINEL — Phase 9A Centralized API Error Handling
 * Defines structured API exceptions and error serialization.
 *
 * CRITICAL SECURITY & RESPONSIBLE AI RULE:
 * Never exposes stack traces, SQL internals, filesystem paths, or accusatory language in responses.
 */

import type { ApiErrorResponse } from "./types.ts";

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(statusCode: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class BadRequestError extends ApiError {
  constructor(message = "Invalid request parameters.", code = "BAD_REQUEST", details?: unknown) {
    super(400, code, message, details);
    this.name = "BadRequestError";
  }
}

export class NotFoundError extends ApiError {
  constructor(message = "Requested resource was not found.", code = "NOT_FOUND", details?: unknown) {
    super(404, code, message, details);
    this.name = "NotFoundError";
  }
}

export class InternalServerError extends ApiError {
  constructor(message = "An unexpected internal server error occurred.", code = "INTERNAL_SERVER_ERROR") {
    super(500, code, message);
    this.name = "InternalServerError";
  }
}

/**
 * Serializes any caught error into a safe, uniform ApiErrorResponse.
 */
export function formatErrorResponse(error: unknown): { statusCode: number; body: ApiErrorResponse } {
  if (error instanceof ApiError) {
    return {
      statusCode: error.statusCode,
      body: {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          ...(error.details !== undefined ? { details: error.details } : {}),
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      },
    };
  }

  // Safe fallback for unexpected errors: never expose internal stack or SQL traces
  return {
    statusCode: 500,
    body: {
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An internal server error occurred while processing the request.",
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    },
  };
}
