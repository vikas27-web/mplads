import { SeverityLevel } from "@/components/ui/SeverityBadge";

/**
 * MPLAD SENTINEL — Phase 5 Data Contracts
 * Investigation & Explainability Workspace
 */

export type AuditWorkflowStatus =
  | "Flagged for Inspection"
  | "Physical Verification Required"
  | "Inspection Scheduled"
  | "Additional Evidence Requested"
  | "Signal Acknowledged"
  | "Signal Dismissed";

export interface AnomalySignal {
  id: string;
  signalName: string;
  category: string;
  explanation: string;
  source: string; // e.g., "Demo Anomaly Signal", "Synthetic Geo-location Record", "Demo Financial Record"
  observedValue: string;
  referenceValue?: string; // Reference / expected value
  evidenceStatus: "Flagged" | "Verification Required" | "Under Review" | "Physical Inspection Recommended";
  verificationRequirement: string;
}

export interface PaymentReferenceRecord {
  id: string;
  date: string;
  referenceNumber: string;
  amount: number;
  description: string;
  source: string; // e.g., "Demo Financial Record"
  status: string; // e.g., "Disbursed", "Pending Clearance"
}

export interface FinancialEvidence {
  sanctionedAmount: number;
  expenditureAmount: number;
  paymentRecords: PaymentReferenceRecord[];
  evidenceStatus: string;
  source: string; // e.g., "Demo Financial Record"
}

export interface PhysicalVerificationLog {
  id: string;
  inspectionDate: string;
  inspectorName: string;
  status: string;
  notes: string;
  photoUrl?: string;
  geoCoordinates?: string;
  source: string; // e.g., "Synthetic Inspection Record", "Synthetic Geo-location Record"
}

export interface PhysicalVerificationEvidence {
  reportedCompletionState: string; // Provided as-is: e.g., "Stage 2 Foundation Completed"
  inspectionState: string; // Provided: e.g., "Field Verification Pending"
  geoLocationRecordState: string; // Provided: e.g., "12.9250° N, 77.5938° E (Geofence Alert: 42m to BBMP Asset)"
  photoDocumentAvailability: string; // Provided: e.g., "1 Site Photo Available (Awaiting Stage 2 Photo)"
  verificationLogs: PhysicalVerificationLog[];
  source: string; // e.g., "Synthetic Inspection Record"
}

export interface DocumentEvidenceItem {
  id: string;
  documentName: string;
  documentType: string;
  availability: "Available" | "Missing" | "Pending Submission" | "Under Review";
  verificationStatus: "Unverified" | "Verified by Auditor" | "Discrepancy Found" | "Pending Field Check";
  source: string; // e.g., "Demo Document Record"
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  actor: string;
  source: string; // e.g., "Demo Audit History", "Demo Anomaly Signal"
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
  isSessionAction: boolean; // Distinguishes "Demo Session Action" from source evidence
}

export type HumanAuditActionType =
  | "MARK_PHYSICAL_VERIFICATION"
  | "SCHEDULE_INSPECTION"
  | "REQUEST_ADDITIONAL_EVIDENCE"
  | "ACKNOWLEDGE_SIGNAL"
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
  implementingAgency: string;
  contractorName?: string;
  sanctionedAmount: number;
  expenditureAmount: number;
  severity: SeverityLevel;
  primarySignal: string;
  status: AuditWorkflowStatus | string;
  sanctionDate: string;
  lastUpdated: string;
  signals: AnomalySignal[];
  financialEvidence: FinancialEvidence;
  physicalVerificationEvidence: PhysicalVerificationEvidence;
  documentEvidence: DocumentEvidenceItem[];
  timelineEvents: TimelineEvent[];
  auditorNotes: AuditorNote[];
  auditTrail: AuditTrailEntry[];
}
