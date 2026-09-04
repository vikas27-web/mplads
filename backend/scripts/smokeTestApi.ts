/**
 * MPLAD SENTINEL — Phase 10 API & Persistence Smoke Test
 * Tests service layers, route responses, and SQLite persistence.
 */

import { getHealthStatus } from "../api/services/healthService.ts";
import { getProjects, getProjectByCode } from "../api/services/projectService.ts";
import { getDashboardData } from "../api/services/dashboardService.ts";
import { getAnomalies, getAnomalyResultByCode } from "../api/services/anomalyService.ts";
import {
  getInvestigations,
  getInvestigationById,
  recordProjectAuditorAction,
  addProjectAuditorNote,
  getProjectInvestigationDossier,
} from "../api/services/investigationService.ts";
import { ProjectRepository } from "../repository/projectRepository.ts";

async function runSmokeTests() {
  console.log("=========================================");
  console.log("MPLAD SENTINEL — API & Persistence Smoke Test");
  console.log("=========================================");

  const repo = new ProjectRepository();
  const allProjects = repo.getAllProjects();
  const totalCount = allProjects.length;
  const testProjectCode = allProjects[0].project_code;

  // 1. Health
  const health = getHealthStatus();
  console.log(`✓ 1. Health Service: status=${health.status}, db=${health.database}, engine=${health.anomalyEngine}`);
  if (health.status !== "ok") throw new Error("Health check failed");

  // 2. Projects
  const projectsRes = getProjects({ limit: 5 });
  console.log(`✓ 2. Projects Service: total=${projectsRes.totalCount}, returned=${projectsRes.projects.length}`);
  if (projectsRes.totalCount !== totalCount) throw new Error(`Expected ${totalCount} projects, got ${projectsRes.totalCount}`);

  // 3. Project Detail
  const projectDetail = getProjectByCode(testProjectCode);
  if (!projectDetail) throw new Error(`Project ${testProjectCode} not found`);
  console.log(`✓ 3. Project Detail: code=${projectDetail.project.project_code}, title=${projectDetail.project.project_title.slice(0, 30)}...`);

  // 4. Dashboard
  const dashboard = getDashboardData();
  console.log(`✓ 4. Dashboard Service: totalProjects=${dashboard.kpis.totalProjects}, totalAnomalies=${dashboard.kpis.totalAnomalies}`);
  if (dashboard.kpis.totalProjects !== totalCount) throw new Error(`Expected ${totalCount} projects in dashboard`);

  // 5. Anomalies List
  const anomalies = getAnomalies({ limit: 5 });
  console.log(`✓ 5. Anomalies Service: totalEvaluated=${anomalies.total}, returned=${anomalies.results.length}`);
  if (anomalies.total !== totalCount) throw new Error(`Expected ${totalCount} evaluated projects`);

  // 6. Project Anomaly Detail
  const anomalyDetail = getAnomalyResultByCode(testProjectCode);
  console.log(`✓ 6. Anomaly Detail: code=${testProjectCode}, severity=${anomalyDetail?.overallSeverity}, signals=${anomalyDetail?.signals.length}`);

  // 7. Investigations List
  const investigations = getInvestigations();
  console.log(`✓ 7. Investigations Queue: totalFlagged=${investigations.total}, topReviewPriority="${investigations.investigations[0]?.reviewPriority}"`);
  if (investigations.total === 0) throw new Error("Expected flagged investigation cases");

  // 8. Investigation By ID / Case
  const invCase = getInvestigationById(`case-${testProjectCode}`);
  console.log(`✓ 8. Investigation Case: id=${invCase?.investigation.id}, project=${invCase?.investigation.projectCode}`);
  if (!invCase) throw new Error("Investigation case lookup failed");

  // 9. Persistence: Record Auditor Review
  const testActionLabel = "Smoke Test Physical Verification";
  const testReviewStatus = "Physical Verification Required";
  const reviewRecord = recordProjectAuditorAction(
    testProjectCode,
    testReviewStatus,
    "MARK_PHYSICAL_VERIFICATION",
    testActionLabel,
    "Smoke test: Field inspection recommended by audit team.",
    "Smoke Test Auditor"
  );
  console.log(`✓ 9. Persisted Review Action: id=${reviewRecord.id}, status=${reviewRecord.status}`);

  // 10. Persistence: Add Auditor Note
  const testNoteContent = "Smoke test note: Site measurement book verified against treasury voucher.";
  const noteRecord = addProjectAuditorNote(testProjectCode, "Field Lead Auditor", testNoteContent);
  console.log(`✓ 10. Persisted Auditor Note: id=${noteRecord.id}, author=${noteRecord.author}`);

  // 11. Verify Dossier Reflects Persisted Records from SQLite
  const updatedDossier = getProjectInvestigationDossier(testProjectCode);
  if (!updatedDossier) throw new Error("Dossier reload failed");

  const hasNote = updatedDossier.auditorNotes.some((n) => n.id === noteRecord.id);
  const hasReview = updatedDossier.auditTrail.some((a) => a.id === reviewRecord.id);
  console.log(`✓ 11. SQLite Persistence Invariant Verified: notePersisted=${hasNote}, reviewPersisted=${hasReview}, status=${updatedDossier.status}`);

  if (!hasNote || !hasReview) {
    throw new Error("Persistence verification failed: note or review not retrieved in dossier");
  }

  console.log("=========================================");
  console.log("ALL API & PERSISTENCE SMOKE TESTS PASSED!");
  console.log("=========================================");
}

runSmokeTests().catch((err) => {
  console.error("Smoke test failure:", err);
  process.exit(1);
});
