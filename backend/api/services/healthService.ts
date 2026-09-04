/**
 * MPLAD SENTINEL — Phase 9 Health Inspection Service
 * Verifies that SQLite database and Phase 8 anomaly artifacts are available.
 */

import { ProjectRepository } from "../../repository/projectRepository.ts";
import { isAnomalyEngineAvailable } from "./anomalyService.ts";
import type { HealthResponse } from "../types.ts";

let defaultRepo: ProjectRepository | null = null;
function getRepo(): ProjectRepository {
  if (!defaultRepo) {
    defaultRepo = new ProjectRepository();
  }
  return defaultRepo;
}

export function getHealthStatus(): HealthResponse {
  let dbConnected = false;
  let projectCount = 0;

  try {
    const repo = getRepo();
    projectCount = repo.getProjectCount();
    dbConnected = projectCount > 0;
  } catch {
    dbConnected = false;
  }

  const anomalyEngineAvailable = isAnomalyEngineAvailable();
  const isHealthy = dbConnected && anomalyEngineAvailable;

  return {
    status: isHealthy ? "ok" : "degraded",
    service: "mplad-sentinel-api",
    database: dbConnected ? "connected" : "error",
    anomalyEngine: anomalyEngineAvailable ? "available" : "unavailable",
    projectCount,
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  };
}
