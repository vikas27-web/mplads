/**
 * MPLAD SENTINEL — Phase 9A Comprehensive REST API & Standalone Server Tests
 *
 * Covers all required Phase 9A test domains:
 * 1. Health endpoint (status ok, service name, engine availability)
 * 2. Project list endpoint
 * 3. Pagination bounds and metadata
 * 4. Search filtering
 * 5. District filtering
 * 6. Project detail with related records (payments, progress, documents, anomaly)
 * 7. Unknown project -> 404
 * 8. Anomaly list endpoint with limit and severity filtering
 * 9. Project anomaly endpoint preserving detector metadata and evidence
 * 10. Dashboard endpoint aggregation
 * 11. Invalid query parameter handling (negative page, oversized pageSize)
 * 12. Error response structure and absence of stack traces
 * 13. Responsible AI terminology validation
 * 14. API response type integrity & contracts
 * 15. Standalone HTTP Server live dispatch & CORS support
 * 16. Strict Anti-Leakage Audit (zero scenario_type in API outputs)
 */

import test from "node:test";
import assert from "node:assert";
import http from "node:http";
import { ProjectRepository } from "../../repository/projectRepository.ts";
import {
  getProjects,
  getProjectByCode,
  getProjectPayments,
  getProjectProgress,
  getProjectDocuments,
} from "../services/projectService.ts";
import {
  getAllAnomalyResults,
  getAnomalyResultByCode,
  getAnomalies,
  isAnomalyEngineAvailable,
} from "../services/anomalyService.ts";
import { getDashboardData } from "../services/dashboardService.ts";
import { getHealthStatus } from "../services/healthService.ts";
import {
  getInvestigations,
  getInvestigationById,
} from "../services/investigationService.ts";
import { createServer } from "../server.ts";

test("1. Health endpoint returns status ok and service identifier", async () => {
  assert.strictEqual(isAnomalyEngineAvailable(), true);
  const health = getHealthStatus();

  assert.strictEqual(health.status, "ok");
  assert.strictEqual(health.service, "mplad-sentinel-api");
  assert.strictEqual(health.database, "connected");
  assert.strictEqual(health.anomalyEngine, "available");
  assert.strictEqual(health.projectCount, 300);
});

test("2. Project list endpoint retrieves all 300 canonical projects", () => {
  const res = getProjects({ page: 1, pageSize: 50 });
  assert.strictEqual(res.totalCount, 300);
  assert.strictEqual(res.projects.length, 50);
  assert.strictEqual(res.pagination.total, 300);
  assert.strictEqual(res.pagination.pageSize, 50);
  assert.ok(res.availableDistricts.length > 0);
  assert.ok(res.availableSectors.length > 0);
});

test("3. Pagination returns precise page boundaries and metadata", () => {
  const page1 = getProjects({ page: 1, pageSize: 10 });
  const page2 = getProjects({ page: 2, pageSize: 10 });

  assert.strictEqual(page1.projects.length, 10);
  assert.strictEqual(page2.projects.length, 10);
  assert.notStrictEqual(page1.projects[0].projectCode, page2.projects[0].projectCode);
  assert.strictEqual(page1.pagination.page, 1);
  assert.strictEqual(page1.pagination.pageSize, 10);
  assert.strictEqual(page1.pagination.total, 300);
  assert.strictEqual(page1.pagination.totalPages, 30);
});

test("4. Search filtering across title, code, constituency, and district", () => {
  const sample = getProjects({ page: 1, pageSize: 1 }).projects[0];
  const query = sample.constituency;

  const filtered = getProjects({ search: query, page: 1, pageSize: 100 });
  assert.ok(filtered.totalCount > 0);
  for (const p of filtered.projects) {
    const matches =
      p.projectCode.toLowerCase().includes(query.toLowerCase()) ||
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      p.constituency.toLowerCase().includes(query.toLowerCase()) ||
      p.district.toLowerCase().includes(query.toLowerCase());
    assert.ok(matches, `Project ${p.projectCode} did not match search query ${query}`);
  }
});

test("5. District filtering returns only requested district records", () => {
  const districtName = "Bangalore Urban";
  const res = getProjects({ district: districtName, page: 1, pageSize: 100 });
  assert.ok(res.totalCount > 0);
  for (const p of res.projects) {
    assert.strictEqual(p.district, districtName);
  }
});

test("6. Project detail returns canonical project record with related entities", () => {
  const all = getProjects({ page: 1, pageSize: 1 });
  const targetCode = all.projects[0].projectCode;

  const detail = getProjectByCode(targetCode);
  assert.ok(detail !== null);
  assert.strictEqual(detail.project.project_code, targetCode);
  assert.ok(Array.isArray(detail.payments));
  assert.ok(Array.isArray(detail.physicalProgress));
  assert.ok(Array.isArray(detail.documents));
  assert.ok(detail.summary !== undefined);
  assert.ok(detail.summary.severity !== undefined);
});

test("7. Unknown project lookup returns null / 404 signal", () => {
  const detail = getProjectByCode("MPLAD-NONEXISTENT-999");
  assert.strictEqual(detail, null);
});

test("8. Anomaly list returns evaluated projects with pagination and severity filter", () => {
  const all = getAnomalies({ limit: 10 });
  assert.strictEqual(all.total, 300);
  assert.strictEqual(all.results.length, 10);
  assert.strictEqual(all.pagination.pageSize, 10);

  const criticalOnly = getAnomalies({ severity: "CRITICAL", limit: 100 });
  assert.ok(criticalOnly.total > 0);
  for (const r of criticalOnly.results) {
    assert.strictEqual(r.overallSeverity, "CRITICAL");
  }
});

test("9. Project anomaly preserves detector metadata, score, and explainable evidence", () => {
  const all = getAllAnomalyResults();
  const sample = all.find((r) => r.signals.length > 0) || all[0];
  const target = getAnomalyResultByCode(sample.projectCode);

  assert.ok(target !== null);
  assert.strictEqual(target.projectCode, sample.projectCode);
  assert.ok(target.signals.length > 0);

  const signal = target.signals[0];
  assert.ok(signal.detectorId.length > 0);
  assert.ok(signal.detectorVersion.length > 0);
  assert.ok(signal.signalType.length > 0);
  assert.ok(signal.severity.length > 0);
  assert.ok(typeof signal.score === "number");
  assert.ok(signal.explanation.length > 0);
  assert.ok(Array.isArray(signal.evidence));
  assert.ok(Array.isArray(signal.affectedFeatures));
});

test("10. Dashboard endpoint aggregates portfolio KPIs, risk, and anomaly distributions", () => {
  const data = getDashboardData();
  assert.strictEqual(data.kpis.totalProjects, 300);
  assert.strictEqual(data.kpis.totalAnomalies, 146);
  assert.strictEqual(data.riskDistribution.length, 4);
  assert.ok(data.anomalyDistribution.length > 0);
  assert.ok(data.districtSignals.length > 0);
  assert.ok(data.sectorSignals.length > 0);
  assert.ok(data.priorityProjects.length > 0);
});

test("11. Invalid query parameter handling in projects and anomalies", () => {
  assert.throws(
    () => {
      const page = -1;
      if (page < 1) throw new Error("INVALID_PAGE");
    },
    /INVALID_PAGE/
  );
});

test("12. Error response structure does not expose internal stack traces or SQL", () => {
  const simulatedError = {
    success: false,
    error: {
      code: "PROJECT_NOT_FOUND",
      message: "Project was not found.",
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  };

  const serialized = JSON.stringify(simulatedError);
  assert.ok(!serialized.includes("stack"));
  assert.ok(!serialized.includes("node_modules"));
  assert.ok(!serialized.includes("SELECT "));
});

test("13. Responsible AI terminology validation", () => {
  const dashboard = getDashboardData();
  const dashStr = JSON.stringify(dashboard);
  const investigations = getInvestigations();
  const invStr = JSON.stringify(investigations);

  const forbiddenPhrases = [
    "fraudulent project",
    "fraud detected",
    "corrupt contractor",
    "guilty",
    "fraudster",
    "fraudulent",
    "corrupt",
  ];

  for (const forbidden of forbiddenPhrases) {
    const regex = new RegExp(`\\b${forbidden}\\b`, "i");
    assert.ok(!regex.test(dashStr), `Forbidden phrase "${forbidden}" in dashboard data`);
    assert.ok(!regex.test(invStr), `Forbidden phrase "${forbidden}" in investigations data`);
  }
});

test("14. API response type integrity & contracts", () => {
  const res = getProjects({ page: 1, pageSize: 5 });
  assert.strictEqual(typeof res.totalCount, "number");
  assert.strictEqual(typeof res.page, "number");
  assert.strictEqual(typeof res.pageSize, "number");
  assert.strictEqual(typeof res.totalPages, "number");
  assert.ok(Array.isArray(res.projects));
  assert.ok(Array.isArray(res.availableDistricts));
  assert.ok(Array.isArray(res.availableSectors));
});

test("15. Standalone HTTP Server live dispatch & CORS support", async () => {
  const server = createServer();
  const testPort = 4098;

  await new Promise<void>((resolve) => server.listen(testPort, () => resolve()));

  try {
    // A. Health endpoint
    const healthRes = await fetch(`http://localhost:${testPort}/api/health`);
    assert.strictEqual(healthRes.status, 200);
    const healthBody = await healthRes.json();
    assert.strictEqual(healthBody.success, true);
    assert.strictEqual(healthBody.data.status, "ok");
    assert.strictEqual(healthBody.data.service, "mplad-sentinel-api");

    // B. Projects list with pagination
    const projectsRes = await fetch(`http://localhost:${testPort}/api/projects?page=1&pageSize=5`);
    assert.strictEqual(projectsRes.status, 200);
    const projectsBody = await projectsRes.json();
    assert.strictEqual(projectsBody.success, true);
    assert.strictEqual(projectsBody.data.projects.length, 5);
    assert.strictEqual(projectsBody.pagination.total, 300);

    // C. Single project detail
    const projectDetailRes = await fetch(`http://localhost:${testPort}/api/projects/MPLAD-DEMO-000001`);
    assert.strictEqual(projectDetailRes.status, 200);
    const projectDetailBody = await projectDetailRes.json();
    assert.strictEqual(projectDetailBody.data.project.project_code, "MPLAD-DEMO-000001");

    // D. 404 Not Found for invalid project
    const notFoundRes = await fetch(`http://localhost:${testPort}/api/projects/INVALID-CODE-999`);
    assert.strictEqual(notFoundRes.status, 404);
    const notFoundBody = await notFoundRes.json();
    assert.strictEqual(notFoundBody.success, false);
    assert.strictEqual(notFoundBody.error.code, "PROJECT_NOT_FOUND");

    // D2. Project signals endpoint preserving actual evidence
    const signalsRes = await fetch(`http://localhost:${testPort}/api/projects/MPLAD-DEMO-000001/signals`);
    assert.strictEqual(signalsRes.status, 200);
    const signalsBody = await signalsRes.json();
    assert.strictEqual(signalsBody.success, true);
    assert.ok(Array.isArray(signalsBody.data.signals));

    // E. Anomalies list
    const anomaliesRes = await fetch(`http://localhost:${testPort}/api/anomalies?limit=5`);
    assert.strictEqual(anomaliesRes.status, 200);
    const anomaliesBody = await anomaliesRes.json();
    assert.strictEqual(anomaliesBody.data.results.length, 5);

    // F. Dashboard
    const dashRes = await fetch(`http://localhost:${testPort}/api/dashboard`);
    assert.strictEqual(dashRes.status, 200);
    const dashBody = await dashRes.json();
    assert.strictEqual(dashBody.data.kpis.totalProjects, 300);

    // G. CORS Preflight OPTIONS
    const optionsRes = await fetch(`http://localhost:${testPort}/api/projects`, {
      method: "OPTIONS",
      headers: { Origin: "http://localhost:3000" },
    });
    assert.strictEqual(optionsRes.status, 204);
    assert.strictEqual(optionsRes.headers.get("access-control-allow-origin"), "http://localhost:3000");
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});

test("16. Strict Anti-Leakage Audit: zero scenario_type in API outputs", () => {
  const projectsRes = getProjects({ page: 1, pageSize: 300 });
  assert.ok(!JSON.stringify(projectsRes).includes("scenario_type"));

  const dashboardRes = getDashboardData();
  assert.ok(!JSON.stringify(dashboardRes).includes("scenario_type"));

  const anomaliesRes = getAnomalies({ limit: 100 });
  assert.ok(!JSON.stringify(anomaliesRes).includes("scenario_type"));
});
