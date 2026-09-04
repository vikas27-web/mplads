/**
 * MPLAD SENTINEL — Phase 9 Anomaly Service
 * Exposes access to verified Phase 8 anomaly results (data/processed/anomaly_results.json).
 */

import fs from "node:fs";
import path from "node:path";
import type { AnomalyResult } from "../../anomaly/types.ts";

let cachedResults: AnomalyResult[] | null = null;
let cachedMap: Map<string, AnomalyResult> | null = null;

function getAnomalyResultsFilePath(): string {
  return (
    process.env.ANOMALY_RESULTS_PATH ||
    path.join(process.cwd(), "data", "processed", "anomaly_results.json")
  );
}

export function isAnomalyEngineAvailable(): boolean {
  try {
    const p = getAnomalyResultsFilePath();
    return fs.existsSync(p);
  } catch {
    return false;
  }
}

export function getAllAnomalyResults(): AnomalyResult[] {
  if (cachedResults) {
    return cachedResults;
  }

  const filePath = getAnomalyResultsFilePath();
  if (!fs.existsSync(filePath)) {
    throw new Error(`Anomaly results file not found at ${filePath}. Run Phase 8 pipeline first.`);
  }

  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = JSON.parse(raw);
  const results: AnomalyResult[] = Array.isArray(parsed) ? parsed : parsed.results || [];

  cachedResults = results;
  cachedMap = new Map(results.map((r) => [r.projectCode, r]));

  return cachedResults;
}

export function getAnomalyResultsMap(): Map<string, AnomalyResult> {
  if (!cachedMap) {
    getAllAnomalyResults();
  }
  return cachedMap!;
}

export function getAnomalyResultByCode(projectCode: string): AnomalyResult | null {
  const map = getAnomalyResultsMap();
  return map.get(projectCode) || null;
}

export interface AnomalyQueryParams {
  projectCode?: string;
  severity?: string;
  signalType?: string;
  limit?: number;
  offset?: number;
  page?: number;
  pageSize?: number;
}

export function getAnomalies(params: AnomalyQueryParams = {}) {
  let list = getAllAnomalyResults();

  if (params.projectCode) {
    const code = params.projectCode.trim().toLowerCase();
    list = list.filter((r) => r.projectCode.toLowerCase().includes(code));
  }

  if (params.severity && params.severity !== "ALL") {
    list = list.filter((r) => r.overallSeverity === params.severity);
  }

  if (params.signalType && params.signalType !== "ALL") {
    list = list.filter((r) =>
      r.signals.some((s) => s.signalType === params.signalType)
    );
  }

  const total = list.length;
  const pageSize = Math.max(1, Math.min(100, params.pageSize || params.limit || 25));
  const offset = params.offset !== undefined ? Math.max(0, params.offset) : undefined;
  let page = Math.max(1, params.page || 1);
  if (offset !== undefined) {
    page = Math.floor(offset / pageSize) + 1;
  }
  const totalPages = Math.ceil(total / pageSize) || 1;
  const validPage = Math.min(page, totalPages);
  const startIndex = offset !== undefined ? offset : (validPage - 1) * pageSize;
  const paginated = list.slice(startIndex, startIndex + pageSize);

  return {
    results: paginated,
    total,
    pagination: {
      page: validPage,
      pageSize,
      total,
      totalPages,
    },
  };
}
