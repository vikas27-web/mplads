/**
 * MPLAD SENTINEL — Phase 9A HTTP Router & Request Dispatcher
 * Dispatches requests to backend services with CORS, validation, and centralized error handling.
 */

import type { IncomingMessage, ServerResponse } from "node:http";
import { URL } from "node:url";
import { getHealthStatus } from "./services/healthService.ts";
import {
  getProjects,
  getProjectByCode,
  getProjectPayments,
  getProjectProgress,
  getProjectDocuments,
} from "./services/projectService.ts";
import {
  getAnomalies,
  getAnomalyResultByCode,
} from "./services/anomalyService.ts";
import { getDashboardData } from "./services/dashboardService.ts";
import {
  getInvestigations,
  getInvestigationById,
} from "./services/investigationService.ts";
import {
  ApiError,
  BadRequestError,
  NotFoundError,
  formatErrorResponse,
} from "./errors.ts";
import type { ProjectQueryParams } from "./types.ts";

/**
 * Resolves allowed CORS origins from environment or defaults to local Next.js ports.
 */
function getAllowedOrigins(): string[] {
  const envOrigins = process.env.CORS_ORIGIN;
  if (envOrigins) {
    return envOrigins.split(",").map((o) => o.trim());
  }
  return ["http://localhost:3000", "http://localhost:3005", "http://127.0.0.1:3000"];
}

function handleCors(req: IncomingMessage, res: ServerResponse): boolean {
  const origin = req.headers.origin;
  const envOrigins = process.env.CORS_ORIGIN;
  const allowedOrigins = getAllowedOrigins();

  if (envOrigins === "*" || !origin || allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
    res.setHeader("Access-Control-Allow-Origin", origin || "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept, Authorization");
    res.setHeader("Access-Control-Max-Age", "86400");
  }

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return true;
  }

  return false;
}

function sendJson(res: ServerResponse, statusCode: number, data: unknown) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(data));
}

/**
 * Main HTTP request handler for the standalone API server.
 */
export async function handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (handleCors(req, res)) {
    return;
  }

  if (req.method !== "GET") {
    sendJson(res, 405, {
      success: false,
      error: { code: "METHOD_NOT_ALLOWED", message: "Only GET and OPTIONS requests are supported." },
    });
    return;
  }

  const port = process.env.PORT || "4000";
  const host = req.headers.host || `0.0.0.0:${port}`;
  const protocol = req.headers["x-forwarded-proto"] ? String(req.headers["x-forwarded-proto"]) : "http";
  const reqUrl = new URL(req.url || "/", `${protocol}://${host}`);
  const pathname = reqUrl.pathname.replace(/\/+$/, "") || "/";
  const searchParams = reqUrl.searchParams;

  try {
    // 1. GET /api/health or /health
    if (pathname === "/api/health" || pathname === "/health") {
      const health = getHealthStatus();
      sendJson(res, health.status === "healthy" || health.status === "ok" ? 200 : 503, {
        success: true,
        data: health,
        meta: { timestamp: new Date().toISOString() },
      });
      return;
    }

    // 2. GET /api/dashboard
    if (pathname === "/api/dashboard") {
      const data = getDashboardData();
      sendJson(res, 200, {
        success: true,
        data,
        meta: { timestamp: new Date().toISOString() },
      });
      return;
    }

    // 3. GET /api/projects
    if (pathname === "/api/projects") {
      const pageRaw = searchParams.get("page");
      const pageSizeRaw = searchParams.get("pageSize") || searchParams.get("limit");
      const page = pageRaw ? parseInt(pageRaw, 10) : 1;
      const pageSize = pageSizeRaw ? parseInt(pageSizeRaw, 10) : 25;

      if (Number.isNaN(page) || page < 1) {
        throw new BadRequestError("Page parameter must be a positive integer.", "INVALID_PAGE");
      }
      if (Number.isNaN(pageSize) || pageSize < 1 || pageSize > 100) {
        throw new BadRequestError("PageSize parameter must be between 1 and 100.", "INVALID_PAGE_SIZE");
      }

      const params: ProjectQueryParams = {
        search: searchParams.get("search") || undefined,
        district: searchParams.get("district") || undefined,
        sector: searchParams.get("sector") || undefined,
        severity: searchParams.get("severity") || undefined,
        status: searchParams.get("status") || undefined,
        sortBy: (searchParams.get("sortBy") || searchParams.get("sort") || undefined) as any,
        sortOrder: (searchParams.get("sortOrder") as any) || undefined,
        page,
        pageSize,
      };

      const result = getProjects(params);
      sendJson(res, 200, {
        success: true,
        data: result,
        pagination: result.pagination,
        meta: {
          timestamp: new Date().toISOString(),
          total: result.totalCount,
          page: result.page,
          pageSize: result.pageSize,
          totalPages: result.totalPages,
        },
      });
      return;
    }

    // 4. Subresources under /api/projects/:projectCode
    const projectSubMatch = pathname.match(/^\/api\/projects\/([^/]+)\/(payments|progress|documents|anomalies|signals)$/);
    if (projectSubMatch) {
      const projectCode = decodeURIComponent(projectSubMatch[1]);
      const sub = projectSubMatch[2];

      const exists = getProjectByCode(projectCode);
      if (!exists) {
        throw new NotFoundError(`Project "${projectCode}" was not found.`, "PROJECT_NOT_FOUND");
      }

      if (sub === "payments") {
        const payments = getProjectPayments(projectCode);
        sendJson(res, 200, { success: true, data: payments, meta: { timestamp: new Date().toISOString() } });
        return;
      }
      if (sub === "progress") {
        const progress = getProjectProgress(projectCode);
        sendJson(res, 200, { success: true, data: progress, meta: { timestamp: new Date().toISOString() } });
        return;
      }
      if (sub === "documents") {
        const documents = getProjectDocuments(projectCode);
        sendJson(res, 200, { success: true, data: documents, meta: { timestamp: new Date().toISOString() } });
        return;
      }
      if (sub === "anomalies" || sub === "signals") {
        const anomaly = getAnomalyResultByCode(projectCode);
        if (!anomaly) {
          throw new NotFoundError(`No anomaly signals recorded for project "${projectCode}".`, "ANOMALY_NOT_FOUND");
        }
        sendJson(res, 200, {
          success: true,
          data: { projectCode, signals: anomaly.signals, anomalyResult: anomaly },
          meta: { timestamp: new Date().toISOString() },
        });
        return;
      }
    }

    // 5. GET /api/projects/:projectCode
    const projectDetailMatch = pathname.match(/^\/api\/projects\/([^/]+)$/);
    if (projectDetailMatch) {
      const projectCode = decodeURIComponent(projectDetailMatch[1]);
      const detail = getProjectByCode(projectCode);
      if (!detail) {
        throw new NotFoundError(`Project "${projectCode}" was not found.`, "PROJECT_NOT_FOUND");
      }
      sendJson(res, 200, {
        success: true,
        data: detail,
        meta: { timestamp: new Date().toISOString() },
      });
      return;
    }

    // 6. GET /api/anomalies
    if (pathname === "/api/anomalies") {
      const limitRaw = searchParams.get("limit") || searchParams.get("pageSize");
      const offsetRaw = searchParams.get("offset");
      const pageRaw = searchParams.get("page");

      const limit = limitRaw ? parseInt(limitRaw, 10) : undefined;
      const offset = offsetRaw ? parseInt(offsetRaw, 10) : undefined;
      const page = pageRaw ? parseInt(pageRaw, 10) : undefined;

      if (limit !== undefined && (Number.isNaN(limit) || limit < 1 || limit > 100)) {
        throw new BadRequestError("Limit parameter must be between 1 and 100.", "INVALID_LIMIT");
      }
      if (offset !== undefined && (Number.isNaN(offset) || offset < 0)) {
        throw new BadRequestError("Offset parameter must be non-negative.", "INVALID_OFFSET");
      }

      const result = getAnomalies({
        projectCode: searchParams.get("projectCode") || undefined,
        severity: searchParams.get("severity") || undefined,
        signalType: searchParams.get("signalType") || undefined,
        limit,
        offset,
        page,
      });

      sendJson(res, 200, {
        success: true,
        data: result,
        pagination: result.pagination,
        meta: { timestamp: new Date().toISOString() },
      });
      return;
    }

    // 7. GET /api/anomalies/:projectCode
    const anomalyDetailMatch = pathname.match(/^\/api\/anomalies\/([^/]+)$/);
    if (anomalyDetailMatch) {
      const projectCode = decodeURIComponent(anomalyDetailMatch[1]);
      const anomalyResult = getAnomalyResultByCode(projectCode);
      if (!anomalyResult) {
        throw new NotFoundError(
          `No anomaly evaluation record found for project "${projectCode}".`,
          "ANOMALY_NOT_FOUND"
        );
      }

      sendJson(res, 200, {
        success: true,
        data: {
          projectCode,
          anomalyResult,
        },
        meta: { timestamp: new Date().toISOString() },
      });
      return;
    }

    // 8. GET /api/investigations
    if (pathname === "/api/investigations") {
      const severity = searchParams.get("severity") || undefined;
      const search = searchParams.get("search") || undefined;
      const result = getInvestigations({ severity, search });
      sendJson(res, 200, {
        success: true,
        data: result,
        meta: { timestamp: new Date().toISOString() },
      });
      return;
    }

    // 9. GET /api/investigations/:id
    const investigationDetailMatch = pathname.match(/^\/api\/investigations\/([^/]+)$/);
    if (investigationDetailMatch) {
      const id = decodeURIComponent(investigationDetailMatch[1]);
      const result = getInvestigationById(id);
      if (!result) {
        throw new NotFoundError(`Investigation case "${id}" was not found.`, "INVESTIGATION_NOT_FOUND");
      }
      sendJson(res, 200, {
        success: true,
        data: result,
        meta: { timestamp: new Date().toISOString() },
      });
      return;
    }

    // 404 Route Not Found
    throw new NotFoundError(`Route "${req.method} ${pathname}" was not found.`, "ROUTE_NOT_FOUND");
  } catch (error) {
    const { statusCode, body } = formatErrorResponse(error);
    sendJson(res, statusCode, body);
  }
}
