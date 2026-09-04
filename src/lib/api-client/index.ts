import { ApiResponse } from "@/types/api";
import type {
  ProjectListResponse,
  ProjectDetailResponse,
  ProjectPaymentsResponse,
  ProjectProgressResponse,
  ProjectDocumentsResponse,
  AnomalyResultResponse,
  InvestigationResponse,
  HealthResponse,
  ProjectQueryParams,
} from "../../../backend/api/types.ts";
import type { DashboardData } from "@/types/dashboard";

export interface RequestOptions extends Omit<RequestInit, "body"> {
  params?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  timeoutMs?: number;
}

function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (process.env.API_BASE_URL) {
    return process.env.API_BASE_URL;
  }
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  const port = process.env.PORT || "3000";
  return `http://localhost:${port}`;
}

/**
 * Centralized API client for MPLAD SENTINEL backend communication.
 */
export async function apiFetch<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { params, body, headers, timeoutMs = 15000, ...customConfig } = options;

  const base = getBaseUrl();
  const rawUrl = endpoint.startsWith("http")
    ? endpoint
    : `${base}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  const url = new URL(rawUrl);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.append(key, String(value));
      }
    });
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const config: RequestInit = {
      method: options.method || "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...headers,
      },
      signal: controller.signal,
      cache: "no-store",
      ...customConfig,
    };

    if (body !== undefined) {
      config.body = JSON.stringify(body);
    }

    const response = await fetch(url.toString(), config);
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      let errorData: any;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText || response.statusText };
      }

      return {
        success: false,
        data: null,
        error: {
          code: errorData.error?.code || `HTTP_${response.status}`,
          message: errorData.error?.message || errorData.message || "API Request Failed",
          details: errorData,
        },
      };
    }

    const data: ApiResponse<T> = await response.json();
    return data;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === "AbortError") {
      return {
        success: false,
        data: null,
        error: {
          code: "TIMEOUT",
          message: `Request timed out after ${timeoutMs}ms`,
        },
      };
    }

    return {
      success: false,
      data: null,
      error: {
        code: "NETWORK_ERROR",
        message: error instanceof Error ? error.message : "Network error occurred",
      },
    };
  }
}

// Typed API Client Methods
export async function getProjects(params: ProjectQueryParams = {}): Promise<ApiResponse<ProjectListResponse>> {
  return apiFetch<ProjectListResponse>("/api/projects", { params });
}

export async function getProject(projectCode: string): Promise<ApiResponse<ProjectDetailResponse>> {
  return apiFetch<ProjectDetailResponse>(`/api/projects/${encodeURIComponent(projectCode)}`);
}

export async function getProjectPayments(projectCode: string): Promise<ApiResponse<ProjectPaymentsResponse>> {
  return apiFetch<ProjectPaymentsResponse>(`/api/projects/${encodeURIComponent(projectCode)}/payments`);
}

export async function getProjectProgress(projectCode: string): Promise<ApiResponse<ProjectProgressResponse>> {
  return apiFetch<ProjectProgressResponse>(`/api/projects/${encodeURIComponent(projectCode)}/progress`);
}

export async function getProjectDocuments(projectCode: string): Promise<ApiResponse<ProjectDocumentsResponse>> {
  return apiFetch<ProjectDocumentsResponse>(`/api/projects/${encodeURIComponent(projectCode)}/documents`);
}

export async function getAnomalyResult(projectCode: string): Promise<ApiResponse<AnomalyResultResponse>> {
  return apiFetch<AnomalyResultResponse>(`/api/anomalies/${encodeURIComponent(projectCode)}`);
}

export async function getProjectAnomalies(projectCode: string): Promise<ApiResponse<AnomalyResultResponse>> {
  return apiFetch<AnomalyResultResponse>(`/api/projects/${encodeURIComponent(projectCode)}/anomalies`);
}

export async function getProjectSignals(projectCode: string): Promise<ApiResponse<{ projectCode: string; signals: any[] }>> {
  return apiFetch<{ projectCode: string; signals: any[] }>(`/api/projects/${encodeURIComponent(projectCode)}/signals`);
}

export async function getDashboard(): Promise<ApiResponse<DashboardData>> {
  return apiFetch<DashboardData>("/api/dashboard");
}

export async function getInvestigations(params?: { severity?: string; search?: string }): Promise<ApiResponse<InvestigationResponse>> {
  return apiFetch<InvestigationResponse>("/api/investigations", { params });
}

export async function getInvestigation(id: string): Promise<ApiResponse<any>> {
  return apiFetch<any>(`/api/investigations/${encodeURIComponent(id)}`);
}

export async function getHealth(): Promise<ApiResponse<HealthResponse>> {
  return apiFetch<HealthResponse>("/api/health");
}

export async function saveProjectAuditorNote(
  projectCode: string,
  data: { author?: string; note: string }
): Promise<ApiResponse<{ note: any }>> {
  return apiFetch<{ note: any }>(`/api/projects/${encodeURIComponent(projectCode)}/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: data,
  });
}

export async function saveProjectAuditorReview(
  projectCode: string,
  data: { status: string; actionType: string; actionLabel: string; notes?: string; actor?: string }
): Promise<ApiResponse<{ review: any }>> {
  return apiFetch<{ review: any }>(`/api/projects/${encodeURIComponent(projectCode)}/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: data,
  });
}

export async function getProjectAuditorReviews(
  projectCode: string
): Promise<ApiResponse<any[]>> {
  return apiFetch<any[]>(`/api/projects/${encodeURIComponent(projectCode)}/reviews`);
}

export async function getProjectAuditorNotes(
  projectCode: string
): Promise<ApiResponse<any[]>> {
  return apiFetch<any[]>(`/api/projects/${encodeURIComponent(projectCode)}/notes`);
}

