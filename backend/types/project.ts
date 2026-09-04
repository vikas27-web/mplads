/**
 * Canonical Project and Domain Types for MPLAD SENTINEL Data & Intelligence Foundation
 *
 * IMPORTANT DISCLAIMER:
 * DEMO DATA — NOT OFFICIAL GOVERNMENT DATA
 *
 * Scenario labels represent synthetic ground truth for testing future detection models
 * and are NOT the output of an anomaly engine.
 */

export type ScenarioType =
  | "NORMAL"
  | "DUPLICATE_SIGNAL"
  | "EXPENDITURE_SHIFT"
  | "TIMELINE_INCONSISTENCY"
  | "PHYSICAL_FINANCIAL_MISMATCH"
  | "PAYMENT_PATTERN_SIGNAL"
  | "CONTRACTOR_CONCENTRATION"
  | "MISSING_DOCUMENTATION"
  | "MULTI_SIGNAL";

export type ProjectStatus =
  | "Recommended"
  | "Sanctioned"
  | "In Progress"
  | "Completed"
  | "Delayed";

export type VerificationStatus =
  | "Pending Review"
  | "Verified"
  | "Inspection Required"
  | "Documentation Flagged";

export type DocumentationStatus =
  | "Complete"
  | "Partial"
  | "Missing Key Milestones"
  | "Under Audit Review";

export interface ProjectRecord {
  // Identity
  project_code: string;
  project_title: string;
  recommendation_date: string; // ISO YYYY-MM-DD
  status: ProjectStatus;

  // Location
  state: string;
  constituency: string;
  district: string;
  block_or_town: string;
  latitude: number;
  longitude: number;

  // Classification
  sector: string;
  work_category: string;
  implementing_agency: string;
  contractor_id: string;
  contractor_name: string;

  // Financial (numeric amounts in INR)
  sanctioned_amount: number;
  released_amount: number;
  expenditure_amount: number;

  // Physical Progress
  planned_completion_date: string;
  actual_or_reported_completion_date: string | null;
  physical_progress: number; // 0 to 100

  // Timeline
  sanction_date: string;
  start_date: string;
  expected_completion_date: string;
  last_updated: string;

  // Verification & Governance
  verification_status: VerificationStatus;
  documentation_status: DocumentationStatus;

  // Synthetic Ground Truth Metadata (for testing future anomaly engines)
  scenario_type: ScenarioType;
  scenario_description: string;
}

export interface ConstituencyRecord {
  code: string;
  name: string;
  state: string;
  district: string;
}

export interface DistrictRecord {
  code: string;
  name: string;
  state: string;
}

export interface ImplementingAgencyRecord {
  code: string;
  name: string;
  agency_type: string;
  state: string;
}

export interface ContractorRecord {
  id: string;
  name: string;
  registration_number: string;
  state: string;
}

export interface PaymentRecord {
  id: string;
  project_code: string;
  payment_date: string;
  amount: number;
  tranche_number: number;
  reference_number: string;
  status: "Disbursed" | "Pending Clearance" | "Reconciled";
}

export interface PhysicalProgressRecord {
  id: string;
  project_code: string;
  record_date: string;
  stage_name: string;
  progress_percentage: number;
  inspection_officer: string;
}

export interface DocumentRecord {
  id: string;
  project_code: string;
  document_type: string;
  document_name: string;
  upload_date: string;
  verification_status: "Verified" | "Unverified" | "Discrepancy" | "Missing";
}

export interface ProjectFilters {
  district?: string;
  sector?: string;
  agency?: string;
  contractor_id?: string;
  scenario_type?: ScenarioType | "ALL";
  status?: ProjectStatus | "ALL";
  search?: string;
  limit?: number;
  offset?: number;
}

export interface SyntheticDatasetBundle {
  metadata: {
    dataset_name: string;
    version: string;
    generated_at: string;
    seed: number;
    record_count: number;
    disclaimer: string;
    scenario_distribution: Record<ScenarioType, number>;
  };
  constituencies: ConstituencyRecord[];
  districts: DistrictRecord[];
  implementing_agencies: ImplementingAgencyRecord[];
  contractors: ContractorRecord[];
  projects: ProjectRecord[];
  payments: PaymentRecord[];
  physical_progress_events: PhysicalProgressRecord[];
  documents: DocumentRecord[];
}
