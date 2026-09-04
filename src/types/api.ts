/**
 * Standard API response envelope for MPLAD SENTINEL backend endpoints.
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T | null;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
    page?: number;
    limit?: number;
    totalCount?: number;
  };
}

/**
 * Common async state interface for UI data fetching handlers.
 */
export type AsyncStatus = "idle" | "loading" | "success" | "error";

export interface AsyncState<T> {
  status: AsyncStatus;
  data: T | null;
  error: string | null;
  lastUpdated: number | null;
}
