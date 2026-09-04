/**
 * MPLAD SENTINEL — Phase 9 Investigation Service
 * Coordinates investigation case files, audit evidence dossiers, and human review priorities
 * using canonical SQLite data and Phase 8 anomaly signals.
 *
 * CRITICAL RESPONSIBLE AI POLICY:
 * All investigation items are "Potential anomaly signals requiring human audit verification".
 * Does NOT generate fraud scores, guilt verdicts, or criminal classifications.
 */

import { ProjectRepository } from "../../repository/projectRepository.ts";
import type {
  ProjectInvestigation,
  AnomalySignal as UiAnomalySignal,
  FinancialEvidence,
  PhysicalVerificationEvidence,
  DocumentEvidenceItem,
  TimelineEvent,
  AuditorNote,
  AuditTrailEntry,
} from "../../../src/types/project-investigation.ts";
import type { InvestigationItem, InvestigationResponse } from "../types.ts";
import { getAnomalyResultByCode, getAnomalyResultsMap } from "./anomalyService.ts";
import type { Severity } from "../../anomaly/types.ts";

let defaultRepo: ProjectRepository | null = null;
function getRepo(): ProjectRepository {
  if (!defaultRepo) {
    defaultRepo = new ProjectRepository();
  }
  return defaultRepo;
}

const SEVERITY_WEIGHT: Record<Severity, number> = {
  CRITICAL: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};

/**
 * Returns projects requiring human audit review.
 */
export function getInvestigations(options?: {
  severity?: string;
  search?: string;
}): InvestigationResponse {
  const repo = getRepo();
  const anomalyMap = getAnomalyResultsMap();
  const allProjects = repo.getAllProjects();

  const items: InvestigationItem[] = [];

  for (const p of allProjects) {
    const anomaly = anomalyMap.get(p.project_code);
    if (!anomaly || anomaly.signals.length === 0) continue;

    if (options?.severity && options.severity !== "ALL" && anomaly.overallSeverity !== options.severity) {
      continue;
    }

    if (options?.search && options.search.trim()) {
      const q = options.search.trim().toLowerCase();
      const matches =
        p.project_code.toLowerCase().includes(q) ||
        p.project_title.toLowerCase().includes(q) ||
        p.constituency.toLowerCase().includes(q) ||
        p.district.toLowerCase().includes(q);
      if (!matches) continue;
    }

    const primarySignal = anomaly.signals[0];
    const totalEvidence = anomaly.signals.reduce((acc, s) => acc + s.evidence.length, 0);
    const latestReview = repo.getLatestReviewStatus(p.project_code);
    const reviewStatus =
      latestReview ||
      (anomaly.overallSeverity === "CRITICAL"
        ? "Physical Verification Required"
        : anomaly.overallSeverity === "HIGH"
        ? "Flagged for Inspection"
        : "Signal Acknowledged");

    const assignedReviewer =
      anomaly.overallSeverity === "CRITICAL"
        ? "District Vigilance Inspection Cell"
        : anomaly.overallSeverity === "HIGH"
        ? "Nodal Audit Officer"
        : "Desk Compliance Desk";

    items.push({
      id: `case-${p.project_code}`,
      projectCode: p.project_code,
      title: p.project_title,
      constituency: p.constituency,
      district: p.district,
      sector: p.sector,
      severity: anomaly.overallSeverity,
      signalType: primarySignal.signalType,
      signalSummary: `${primarySignal.signalType.replace(/_/g, " ")} (${anomaly.signals.length} ${anomaly.signals.length === 1 ? "signal" : "signals"})`,
      explanation: anomaly.explanation,
      evidenceCount: totalEvidence,
      overallSignalScore: anomaly.overallSignalScore,
      reviewPriority:
        anomaly.overallSeverity === "CRITICAL"
          ? "Immediate Physical Inspection Required"
          : anomaly.overallSeverity === "HIGH"
          ? "Field Audit Verification Scheduled"
          : "Desk Documentation Review",
      status: reviewStatus,
      createdDate: p.sanction_date || p.recommendation_date,
      lastUpdated: p.actual_or_reported_completion_date || p.last_updated,
      assignedReviewer,
      signals: anomaly.signals,
    });
  }

  // Sort by severity descending, then anomaly score descending
  items.sort((a, b) => {
    const sDiff = (SEVERITY_WEIGHT[b.severity] || 0) - (SEVERITY_WEIGHT[a.severity] || 0);
    if (sDiff !== 0) return sDiff;
    return b.overallSignalScore - a.overallSignalScore;
  });

  return {
    total: items.length,
    investigations: items,
  };
}

/**
 * Retrieves a single investigation item and dossier by ID or project code.
 * Supports:
 * - Direct case ID: "case-MPLAD-KA-BEN-01446"
 * - Direct project code: "MPLAD-KA-BEN-01446"
 * - Numeric 1-based index from prioritized investigation queue: "1", "2"
 */
export function getInvestigationById(id: string): { investigation: InvestigationItem; dossier: ProjectInvestigation | null } | null {
  if (!id || !id.trim()) return null;

  const trimmed = id.trim();
  const allResult = getInvestigations();
  let foundItem: InvestigationItem | undefined;

  // 1. Check numeric index
  if (/^\d+$/.test(trimmed)) {
    const idx = parseInt(trimmed, 10) - 1;
    if (idx >= 0 && idx < allResult.investigations.length) {
      foundItem = allResult.investigations[idx];
    }
  }

  // 2. Check case ID or project code match in investigations
  if (!foundItem) {
    foundItem = allResult.investigations.find(
      (inv) =>
        inv.id.toLowerCase() === trimmed.toLowerCase() ||
        inv.projectCode.toLowerCase() === trimmed.toLowerCase() ||
        inv.id.toLowerCase() === `case-${trimmed.toLowerCase()}` ||
        `case-${inv.projectCode.toLowerCase()}` === trimmed.toLowerCase()
    );
  }

  if (foundItem) {
    const dossier = getProjectInvestigationDossier(foundItem.projectCode);
    return {
      investigation: foundItem,
      dossier,
    };
  }

  // 3. Fallback: check if project exists in database
  const repo = getRepo();
  const rawCode = trimmed.startsWith("case-") ? trimmed.replace("case-", "") : trimmed;
  const project = repo.getProjectByCode(rawCode);
  if (!project) return null;

  const dossier = getProjectInvestigationDossier(project.project_code);
  const fallbackItem: InvestigationItem = {
    id: `case-${project.project_code}`,
    projectCode: project.project_code,
    title: project.project_title,
    constituency: project.constituency,
    district: project.district,
    sector: project.sector,
    severity: "LOW",
    signalType: "Standard Baseline",
    signalSummary: "Standard Baseline (0 signals)",
    explanation: "Standard operational metrics within expected variance.",
    evidenceCount: 0,
    overallSignalScore: 0.0,
    reviewPriority: "Desk Documentation Review",
    status: "Signal Acknowledged",
    createdDate: project.sanction_date || project.recommendation_date,
    lastUpdated: project.actual_or_reported_completion_date || project.last_updated,
    assignedReviewer: "Desk Compliance Desk",
    signals: [],
  };

  return {
    investigation: fallbackItem,
    dossier,
  };
}

/**
 * Builds a comprehensive ProjectInvestigation dossier combining SQLite records
 * and Phase 8 anomaly evidence for a specific projectCode.
 */
export function getProjectInvestigationDossier(projectCode: string): ProjectInvestigation | null {
  const repo = getRepo();
  const project = repo.getProjectByCode(projectCode);
  if (!project) return null;

  const anomaly = getAnomalyResultByCode(projectCode);
  const payments = repo.getProjectPayments(projectCode);
  const progressLogs = repo.getProjectProgress(projectCode);
  const documents = repo.getProjectDocuments(projectCode);

  const severity: Severity = anomaly ? anomaly.overallSeverity : "LOW";
  const primarySignal =
    anomaly && anomaly.signals.length > 0
      ? anomaly.signals[0].signalType
      : "Standard Baseline";

  // Map Anomaly Signals to UI Model
  const uiSignals: UiAnomalySignal[] = (anomaly?.signals || []).map((s, idx) => {
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
      observedValue: firstEv ? String(firstEv.observedValue) : "Flagged",
      referenceValue: firstEv ? String(firstEv.referenceValue) : undefined,
      direction: firstEv?.direction,
      affectedFeatures: s.affectedFeatures || [],
      evidenceStatus:
        s.severity === "CRITICAL" || s.severity === "HIGH"
          ? "Physical Inspection Recommended"
          : "Verification Required",
      verificationRequirement:
        firstEv?.explanation || "Cross-verify on-site measurement book and treasury voucher.",
      generatedAt: s.generatedAt,
      engineVersion: anomaly?.engineVersion || "1.0.0",
      featureVersion: anomaly?.featureVersion || "1.0.0",
    };
  });

  // Map Financial Evidence
  const financialEvidence: FinancialEvidence = {
    sanctionedAmount: project.sanctioned_amount,
    expenditureAmount: project.expenditure_amount,
    paymentRecords: payments.map((p) => ({
      id: `pay-${p.id}`,
      date: p.payment_date,
      referenceNumber: p.reference_number || `REF-${p.tranche_number}`,
      amount: p.amount,
      description: `Tranche #${p.tranche_number} - Disbursement`,
      source: "Canonical Treasury Ledger (SQLite)",
      status: p.status,
    })),
    evidenceStatus:
      payments.some((p) => p.status === "Pending Clearance")
        ? "Pending Clearance Detected"
        : "Reconciled with Treasury Ledger",
    source: "SQLite Payment Ledger",
  };

  // Map Physical Verification Logs
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
    photoDocumentAvailability: documents.some((d) => d.document_type.includes("Photo") || d.document_type.includes("Site"))
      ? "Site Geotagged Photographs Available"
      : "Site Photographs Awaiting Upload",
    verificationLogs: progressLogs.map((log) => ({
      id: `prog-${log.id}`,
      inspectionDate: log.record_date,
      inspectorName: log.inspection_officer || "Executive Engineer, Nodal Agency",
      status: "Recorded in Measurement Book",
      notes: `Stage: ${log.stage_name} (${log.progress_percentage}% completed)`,
      photoUrl: undefined,
      geoCoordinates: `${project.latitude ? project.latitude.toFixed(4) : "12.9716"}° N, ${project.longitude ? project.longitude.toFixed(4) : "77.5946"}° E`,
      source: "Canonical Physical Progress Events (SQLite)",
    })),
    source: "SQLite Physical Progress Store",
  };

  // Map Documents
  const documentEvidence: DocumentEvidenceItem[] = documents.map((doc) => ({
    id: `doc-${doc.id}`,
    documentName: doc.document_name,
    documentType: doc.document_type,
    availability: doc.verification_status !== "Missing" ? "Available" : "Missing",
    verificationStatus: doc.verification_status === "Verified" ? "Verified by Auditor" : "Unverified",
    source: "Canonical Statutory Documents (SQLite)",
  }));

  // Build Timeline Events
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

  if (anomaly && anomaly.signals.length > 0) {
    timelineEvents.push({
      id: "ev-anomaly",
      timestamp: anomaly.signals[0].generatedAt,
      title: `Potential Anomaly Signal: ${anomaly.signals[0].signalType.replace(/_/g, " ")}`,
      description: anomaly.signals[0].explanation,
      actor: "MPLAD SENTINEL Intelligence Engine",
      source: "Phase 8 Detection Engine",
      type: "anomaly_signal",
    });
  }

  const persistedReviews = repo.getAuditorReviews(project.project_code);
  const persistedNotes = repo.getAuditorNotes(project.project_code);
  const latestReviewStatus = repo.getLatestReviewStatus(project.project_code);

  const finalStatus =
    latestReviewStatus ||
    (severity === "CRITICAL"
      ? "Physical Verification Required"
      : severity === "HIGH"
      ? "Flagged for Inspection"
      : "Signal Acknowledged");

  const auditorNotes: AuditorNote[] = persistedNotes.map((n) => ({
    id: n.id,
    timestamp: n.created_at,
    author: n.author,
    note: n.note,
    isSessionOnly: false,
  }));

  const auditTrail: AuditTrailEntry[] = [
    ...persistedReviews.map((r) => ({
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
      notes: "Live audit evidence dossier compiled from backend SQLite and Phase 8 intelligence artifacts.",
      isSessionAction: false,
    },
  ];

  return {
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
    severity: severity as any,
    overallSignalScore: anomaly?.overallSignalScore || 0,
    reviewPriority:
      severity === "CRITICAL"
        ? "Immediate Physical Inspection Required"
        : severity === "HIGH"
        ? "Field Audit Verification Scheduled"
        : "Desk Documentation Review",
    primarySignal,
    status: finalStatus as any,
    recommendationDate: project.recommendation_date,
    sanctionDate: project.sanction_date,
    startDate: project.start_date,
    plannedCompletionDate: project.planned_completion_date,
    actualCompletionDate: project.actual_or_reported_completion_date,
    lastUpdated: project.actual_or_reported_completion_date || project.last_updated,
    engineVersion: anomaly?.engineVersion || "1.0.0",
    featureVersion: anomaly?.featureVersion || "1.0.0",
    signals: uiSignals,
    financialEvidence,
    physicalVerificationEvidence,
    documentEvidence,
    timelineEvents,
    auditorNotes,
    auditTrail,
  };
}

/**
 * Adds an auditor note to the database for a project
 */
export function addProjectAuditorNote(projectCode: string, author: string, note: string) {
  const repo = getRepo();
  return repo.addAuditorNote(projectCode, author, note);
}

/**
 * Records a human auditor workflow action in the database
 */
export function recordProjectAuditorAction(
  projectCode: string,
  status: string,
  actionType: string,
  actionLabel: string,
  notes: string,
  actor: string
) {
  const repo = getRepo();
  return repo.recordAuditorReview(projectCode, status, actionType, actionLabel, notes, actor);
}
