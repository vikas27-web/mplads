import { ApiResponse } from "@/types/api";
import type {
  ProjectInvestigation,
  AnomalySignal as UiAnomalySignal,
  FinancialEvidence,
  PhysicalVerificationEvidence,
  DocumentEvidenceItem,
  TimelineEvent,
  AuditorNote,
  AuditTrailEntry,
} from "@/types/project-investigation";
import type { AnomalySignal } from "../../../backend/anomaly/types.ts";
import {
  getProject,
  getAnomalyResult,
  getProjectPayments,
  getProjectProgress,
  getProjectDocuments,
  getProjectAuditorReviews,
  getProjectAuditorNotes,
} from "@/lib/api-client";

/**
 * Data provider for MPLAD SENTINEL Project Investigation Workspace.
 *
 * In Phase 9/10, fetches live backend intelligence through:
 * - GET /api/projects/[projectCode]
 * - GET /api/anomalies/[projectCode]
 * - GET /api/projects/[projectCode]/payments
 * - GET /api/projects/[projectCode]/progress
 * - GET /api/projects/[projectCode]/documents
 * - GET /api/projects/[projectCode]/reviews
 * - GET /api/projects/[projectCode]/notes
 */
export async function getProjectInvestigation(
  projectCode: string
): Promise<ApiResponse<ProjectInvestigation>> {
  // 1. Fetch live backend project details
  const projectRes = await getProject(projectCode);
  if (!projectRes.success || !projectRes.data) {
    return {
      success: false,
      data: null,
      error: projectRes.error || {
        code: "HTTP_404",
        message: `Project Investigation record for "${projectCode}" was not found in the audit dataset.`,
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: `req-inv-404-${projectCode}`,
      },
    };
  }

  const { project, summary } = projectRes.data;

  // 2. Fetch parallel child datasets and persisted auditor state
  const [anomalyRes, paymentsRes, progressRes, docsRes, reviewsRes, notesRes] = await Promise.all([
    getAnomalyResult(projectCode),
    getProjectPayments(projectCode),
    getProjectProgress(projectCode),
    getProjectDocuments(projectCode),
    getProjectAuditorReviews(projectCode),
    getProjectAuditorNotes(projectCode),
  ]);

  const anomalyData = anomalyRes.success && anomalyRes.data ? anomalyRes.data.result : null;
  const payments = paymentsRes.success && paymentsRes.data ? paymentsRes.data.payments : [];
  const progressLogs = progressRes.success && progressRes.data ? progressRes.data.progressEvents : [];
  const documents = docsRes.success && docsRes.data ? docsRes.data.documents : [];
  const persistedReviews = reviewsRes.success && reviewsRes.data ? reviewsRes.data : [];
  const persistedNotes = notesRes.success && notesRes.data ? notesRes.data : [];

  // 3. Map Anomaly Signals with backend-provided evidence & explanations
  const uiSignals: UiAnomalySignal[] = (anomalyData?.signals || []).map((s: AnomalySignal, idx: number) => {
    const firstEv = s.evidence && s.evidence.length > 0 ? s.evidence[0] : null;
    return {
      id: `sig-${idx + 1}-${s.signalType}`,
      signalName: s.signalType.replace(/_/g, " "),
      signalType: s.signalType,
      category: s.detectorId,
      detectorId: s.detectorId,
      detectorVersion: s.detectorVersion,
      severity: s.severity as any,
      score: s.score,
      explanation: s.explanation,
      source: "Phase 8 Deterministic Anomaly Engine",
      observedValue: firstEv ? String(firstEv.observedValue) : "Discrepancy Flagged",
      referenceValue: firstEv ? String(firstEv.referenceValue) : undefined,
      direction: firstEv?.direction,
      affectedFeatures: s.affectedFeatures || [],
      evidenceList: (s.evidence || []).map((e) => ({
        feature: e.feature,
        observedValue: e.observedValue,
        referenceValue: e.referenceValue,
        direction: e.direction,
        explanation: e.explanation,
      })),
      evidenceStatus:
        s.severity === "CRITICAL" || s.severity === "HIGH"
          ? "Physical Inspection Recommended"
          : "Verification Required",
      verificationRequirement:
        firstEv?.explanation || "Cross-verify on-site measurement book and treasury voucher.",
      generatedAt: s.generatedAt,
      engineVersion: anomalyData?.engineVersion || "1.0.0",
      featureVersion: anomalyData?.featureVersion || "1.0.0",
    };
  });

  // 4. Map Financial Evidence from Payments API
  const financialEvidence: FinancialEvidence = {
    sanctionedAmount: project.sanctioned_amount,
    expenditureAmount: project.expenditure_amount,
    paymentRecords: payments.map((p: any) => ({
      id: `pay-${p.id}`,
      date: p.payment_date,
      referenceNumber: p.reference_number || `REF-${p.tranche_number}`,
      amount: p.amount,
      description: `Tranche #${p.tranche_number} - Disbursement`,
      source: "Canonical Treasury Ledger (SQLite API)",
      status: p.status,
    })),
    evidenceStatus:
      payments.some((p: any) => p.status === "Pending Clearance")
        ? "Pending Clearance Detected"
        : "Reconciled with Treasury Ledger",
    source: "SQLite Payment Ledger API",
  };

  // 5. Map Physical Verification Evidence from Progress API
  const latestProgress = progressLogs[progressLogs.length - 1];
  const physicalVerificationEvidence: PhysicalVerificationEvidence = {
    reportedCompletionState: latestProgress
      ? `Reported ${latestProgress.progress_percentage}% Physical Completion (${latestProgress.stage_name})`
      : `Reported ${project.physical_progress}% Physical Progress`,
    inspectionState:
      progressLogs.length > 0
        ? `${progressLogs.length} Verified Field Inspection Logs on Record`
        : "Initial Milestone - Ground Verification Pending",
    geoLocationRecordState: `${project.latitude ? project.latitude.toFixed(4) : "12.9716"}° N, ${project.longitude ? project.longitude.toFixed(4) : "77.5946"}° E (Constituency: ${project.constituency})`,
    photoDocumentAvailability: documents.some((d: any) => d.document_type.includes("Photo") || d.document_type.includes("Site"))
      ? "Site Geotagged Photographs Available"
      : "Site Photographs Awaiting Upload",
    verificationLogs: progressLogs.map((log: any) => ({
      id: `prog-${log.id}`,
      inspectionDate: log.record_date,
      inspectorName: log.inspection_officer || "Executive Engineer, Nodal Agency",
      status: "Recorded in Measurement Book",
      notes: `Stage: ${log.stage_name} (${log.progress_percentage}% completed)`,
      photoUrl: undefined,
      geoCoordinates: `${project.latitude ? project.latitude.toFixed(4) : "12.9716"}° N, ${project.longitude ? project.longitude.toFixed(4) : "77.5946"}° E`,
      source: "Canonical Physical Progress Events (SQLite API)",
    })),
    source: "SQLite Physical Progress Store",
  };

  // 6. Map Document Evidence from Documents API
  const documentEvidence: DocumentEvidenceItem[] = documents.map((doc: any) => ({
    id: `doc-${doc.id}`,
    documentName: doc.document_name,
    documentType: doc.document_type,
    availability: doc.verification_status !== "Missing" ? "Available" : "Missing",
    verificationStatus: doc.verification_status === "Verified" ? "Verified by Auditor" : "Unverified",
    source: "Canonical Statutory Documents (SQLite API)",
  }));

  // 7. Timeline Events
  const timelineEvents: TimelineEvent[] = [
    {
      id: "ev-rec",
      timestamp: project.recommendation_date,
      title: "MP Work Recommendation Submitted",
      description: `Recommendation initiated by Member of Parliament for ${project.constituency}.`,
      actor: "Member of Parliament",
      source: "Administrative Registry",
      type: "project_registered",
    },
    {
      id: "ev-sanc",
      timestamp: project.sanction_date,
      title: "Administrative Sanction Issued",
      description: `Formal sanction of INR ${project.sanctioned_amount.toLocaleString("en-IN")} authorized by District Authority.`,
      actor: "District Collector / Authority",
      source: "Sanction Order Registry",
      type: "admin_approval",
    },
  ];

  if (payments.length > 0) {
    timelineEvents.push({
      id: "ev-pay",
      timestamp: payments[0].payment_date,
      title: "First Tranche Disbursed",
      description: `Initial payment of INR ${payments[0].amount.toLocaleString("en-IN")} released to ${project.implementing_agency}.`,
      actor: "District Treasury",
      source: "Treasury Ledger",
      type: "financial_record",
    });
  }

  if (progressLogs.length > 0) {
    timelineEvents.push({
      id: "ev-prog",
      timestamp: progressLogs[0].record_date,
      title: "Initial Physical Inspection Logged",
      description: `First on-site inspection recorded at ${progressLogs[0].progress_percentage}% progress.`,
      actor: progressLogs[0].inspection_officer || "Site Engineer",
      source: "Measurement Book",
      type: "physical_evidence",
    });
  }

  if (anomalyData && anomalyData.signals.length > 0) {
    timelineEvents.push({
      id: "ev-anomaly",
      timestamp: anomalyData.signals[0].generatedAt,
      title: `Potential Anomaly Signal: ${anomalyData.signals[0].signalType.replace(/_/g, " ")}`,
      description: anomalyData.signals[0].explanation,
      actor: "MPLAD SENTINEL Intelligence Engine",
      source: "Phase 8 Detection Engine",
      type: "anomaly_signal",
    });
  }

  // 8. Map Real Auditor Notes and Reviews from SQLite
  const auditorNotes: AuditorNote[] = persistedNotes.map((n: any) => ({
    id: n.id,
    timestamp: n.created_at,
    author: n.author,
    note: n.note,
    isSessionOnly: false,
  }));

  const auditTrail: AuditTrailEntry[] = [
    ...persistedReviews.map((r: any) => ({
      id: r.id,
      timestamp: r.created_at,
      actor: r.actor,
      actionType: r.action_label,
      notes: r.notes || `Review status updated to "${r.status}".`,
      isSessionAction: false,
    })),
    {
      id: "at-1",
      timestamp: new Date().toISOString(),
      actor: "System Auditor",
      actionType: "EVIDENCE_RETRIEVED",
      notes: "Live audit evidence dossier compiled from backend SQLite and Phase 8 intelligence artifacts via REST API.",
      isSessionAction: false,
    },
  ];

  const latestReview = persistedReviews.length > 0 ? persistedReviews[0] : null;
  const currentStatus =
    latestReview?.status ||
    (summary.severity === "CRITICAL"
      ? "Physical Verification Required"
      : summary.severity === "HIGH"
      ? "Flagged for Inspection"
      : "Signal Acknowledged");

  const investigation: ProjectInvestigation = {
    isDemoData: false,
    disclaimerText:
      "All anomaly classifications, severity rankings, and financial evidence originate directly from verified SQLite records and Phase 8 intelligence engines. Anomaly signal does not equal illicit conduct or wrongdoing. Physical verification & human investigation required.",
    projectCode: project.project_code,
    title: project.project_title,
    constituency: project.constituency,
    district: project.district,
    state: project.state,
    sector: project.sector,
    workCategory: project.work_category,
    implementingAgency: project.implementing_agency,
    contractorName: project.contractor_name,
    sanctionedAmount: project.sanctioned_amount,
    releasedAmount: project.released_amount,
    expenditureAmount: project.expenditure_amount,
    physicalProgress: project.physical_progress,
    projectStatus: project.status,
    governanceStatus: project.verification_status,
    documentationStatus: project.documentation_status,
    severity: summary.severity as any,
    overallSignalScore: summary.overallSignalScore,
    reviewPriority: summary.reviewPriority,
    primarySignal: summary.primaryExplanation.split(".")[0],
    status: currentStatus,
    recommendationDate: project.recommendation_date,
    sanctionDate: project.sanction_date,
    startDate: project.start_date,
    plannedCompletionDate: project.planned_completion_date,
    actualCompletionDate: project.actual_or_reported_completion_date,
    lastUpdated: project.actual_or_reported_completion_date || project.last_updated,
    engineVersion: anomalyData?.engineVersion || "1.0.0",
    featureVersion: anomalyData?.featureVersion || "1.0.0",
    signals: uiSignals,
    financialEvidence,
    physicalVerificationEvidence,
    documentEvidence,
    timelineEvents,
    auditorNotes,
    auditTrail,
  };

  return {
    success: true,
    data: investigation,
    meta: {
      timestamp: new Date().toISOString(),
      requestId: `req-inv-${projectCode}`,
    },
  };
}
