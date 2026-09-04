import { SeverityLevel } from "@/components/ui/SeverityBadge";

/**
 * MPLAD SENTINEL — Phase 10 Data Contracts
 * Investigation & Explainability Workspace
 */

export type AuditWorkflowStatus =
  | "Flagged for Inspection"
  | "Under Human Review"
  | "Physical Verification Required"
  | "Inspection Recommended"
  | "Inspection Scheduled"
  | "Evidence Reviewed"
  | "Additional Evidence Requested"
  | "Signal Acknowledged"
  | "Review Closed"
  | "Signal Dismissed";

export interface AnomalyEvidenceItem {
  feature: string;
  observedValue: string | number | null;
  referenceValue: string | number;
  direction: string;
  explanation: string;
}

export interface AnomalySignal {
  id: string;
  signalName: string;
  signalType?: string;
  category: string;
  detectorId?: string;
  detectorVersion?: string;
  severity?: SeverityLevel;
  score?: number;
  explanation: string;
  source: string; // e.g., "Phase 8 Deterministic Anomaly Engine"
  observedValue: string;
  referenceValue?: string; // Reference / expected baseline
  direction?: string;
  affectedFeatures?: string[];
  evidenceList?: AnomalyEvidenceItem[];
  evidenceStatus: "Flagged" | "Verification Required" | "Under Review" | "Physical Inspection Recommended";
  verificationRequirement: string;
  generatedAt?: string;
  engineVersion?: string;
  featureVersion?: string;
}

export interface PaymentReferenceRecord {
  id: string;
  date: string;
  referenceNumber: string;
  amount: number;
  description: string;
  source: string; // e.g., "Canonical Treasury Ledger (SQLite API)"
  status: string; // e.g., "Disbursed", "Pending Clearance"
}

export interface FinancialEvidence {
  sanctionedAmount: number;
  expenditureAmount: number;
  paymentRecords: PaymentReferenceRecord[];
  evidenceStatus: string;
  source: string; // e.g., "SQLite Payment Ledger API"
}

export interface PhysicalVerificationLog {
  id: string;
  inspectionDate: string;
  inspectorName: string;
  status: string;
  notes: string;
  photoUrl?: string;
  geoCoordinates?: string;
  source: string; // e.g., "Canonical Physical Progress Events (SQLite API)"
}

export interface PhysicalVerificationEvidence {
  reportedCompletionState: string; // Provided as-is: e.g., "Reported 75% Physical Completion (Roof Slab)"
  inspectionState: string; // Provided: e.g., "3 Verified Field Inspection Logs on Record"
  geoLocationRecordState: string; // Provided: e.g., "12.9250° N, 77.5938° E (Constituency: Bangalore South)"
  photoDocumentAvailability: string; // Provided: e.g., "Site Geotagged Photographs Available"
  verificationLogs: PhysicalVerificationLog[];
  source: string; // e.g., "SQLite Physical Progress Store"
}

export interface DocumentEvidenceItem {
  id: string;
  documentName: string;
  documentType: string;
  availability: "Available" | "Missing" | "Pending Submission" | "Under Review";
  verificationStatus: "Unverified" | "Verified by Auditor" | "Discrepancy Found" | "Pending Field Check";
  source: string; // e.g., "Canonical Statutory Documents (SQLite API)"
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  actor: string;
  source: string;
  type:
    | "project_registered"
    | "admin_approval"
    | "financial_record"
    | "physical_evidence"
    | "anomaly_signal"
    | "human_review";
}

export interface AuditorNote {
  id: string;
  timestamp: string;
  author: string;
  note: string;
  isSessionOnly: boolean;
}

export interface AuditTrailEntry {
  id: string;
  timestamp: string;
  actor: string;
  actionType: string;
  notes: string;
  isSessionAction: boolean;
}

export type HumanAuditActionType =
  | "MARK_UNDER_HUMAN_REVIEW"
  | "MARK_PHYSICAL_VERIFICATION"
  | "RECOMMEND_INSPECTION"
  | "SCHEDULE_INSPECTION"
  | "MARK_EVIDENCE_REVIEWED"
  | "REQUEST_ADDITIONAL_EVIDENCE"
  | "ACKNOWLEDGE_SIGNAL"
  | "CLOSE_REVIEW"
  | "DISMISS_SIGNAL";

export interface ProjectInvestigation {
  isDemoData: boolean;
  disclaimerText: string;
  projectCode: string;
  title: string;
  constituency: string;
  district: string;
  state: string;
  sector: string;
  workCategory?: string;
  implementingAgency: string;
  contractorName?: string;
  sanctionedAmount: number;
  releasedAmount?: number;
  expenditureAmount: number;
  physicalProgress?: number;
  projectStatus?: string;
  governanceStatus?: string;
  documentationStatus?: string;
  severity: SeverityLevel;
  overallSignalScore?: number;
  reviewPriority?: string;
  primarySignal: string;
  status: AuditWorkflowStatus | string;
  recommendationDate?: string;
  sanctionDate: string;
  startDate?: string;
  plannedCompletionDate?: string;
  actualCompletionDate?: string | null;
  lastUpdated: string;
  engineVersion?: string;
  featureVersion?: string;
  signals: AnomalySignal[];
  financialEvidence: FinancialEvidence;
  physicalVerificationEvidence: PhysicalVerificationEvidence;
  documentEvidence: DocumentEvidenceItem[];
  timelineEvents: TimelineEvent[];
  auditorNotes: AuditorNote[];
  auditTrail: AuditTrailEntry[];
}
