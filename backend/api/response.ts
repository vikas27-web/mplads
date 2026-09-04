/**
 * MPLAD SENTINEL — Standard Next.js API Response Helpers
 */

import { NextResponse } from "next/server.js";
import type { ApiSuccessResponse, ApiErrorResponse } from "./types.ts";

export function jsonSuccess<T>(
  data: T,
  meta: Record<string, unknown> = {},
  status = 200,
  pagination?: { page: number; pageSize: number; total: number; totalPages: number }
) {
  const body: ApiSuccessResponse<T> = {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  };

  if (pagination) {
    body.pagination = pagination;
  } else if (typeof meta.page === "number" && typeof meta.total === "number") {
    body.pagination = {
      page: meta.page,
      pageSize: typeof meta.pageSize === "number" ? meta.pageSize : 10,
      total: meta.total,
      totalPages: typeof meta.totalPages === "number" ? meta.totalPages : Math.ceil(meta.total / (typeof meta.pageSize === "number" ? meta.pageSize : 10)),
    };
  }

  return NextResponse.json(body, { status });
}

export function jsonError(
  code: string,
  message: string,
  status = 400,
  details?: unknown
) {
  const body: ApiErrorResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details !== undefined ? { details } : {}),
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  };
  return NextResponse.json(body, { status });
}
