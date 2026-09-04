/**
 * MPLAD SENTINEL — Phase 7 Feature Engineering Types
 * Canonical definitions for structured, typed, deterministic intelligence features.
 *
 * CRITICAL GOVERNANCE RULE:
 * This schema strictly excludes 'scenario_type', synthetic anomaly labels, and risk scores.
 * Features represent raw, descriptive, mathematically grounded characteristics for future model input.
 */

export const FEATURE_VERSION = "1.0.0";
export const REFERENCE_AUDIT_DATE = "2026-09-04";

export interface CategoricalFeatures {
  state: string;
  district: string;
  constituency: string;
  sector: string;
  work_category: string;
  implementing_agency: string;
  contractor_id: string;
  contractor_name: string;
  status: string;
}

export interface FinancialFeatures {
  sanctioned_amount: number; // INR
  released_amount: number; // INR
  expenditure_amount: number; // INR
  remaining_sanctioned_amount: number; // INR (sanctioned - expenditure)
  remaining_released_amount: number; // INR (released - expenditure)
  expenditure_to_release_ratio: number; // Dimensionless (expenditure / released)
  release_to_sanction_ratio: number; // Dimensionless (released / sanctioned)
  expenditure_to_sanction_ratio: number; // Dimensionless (expenditure / sanctioned)
  payment_count: number; // Total payment events recorded
  average_payment_amount: number; // Mean INR per payment
  max_payment_amount: number; // Max INR single tranche
  min_payment_amount: number; // Min INR single tranche
  payment_amount_std_dev: number; // Standard deviation of payment amounts
}

export interface PhysicalFeatures {
  reported_physical_progress: number; // Percentage (0 - 100)
  progress_event_count: number; // Number of on-site inspection events
  latest_progress_percentage: number; // Most recent logged inspection progress
  average_progress_per_update: number; // Progress points gained per inspection update
  is_completed: number; // Binary indicator (1 if Completed, 0 otherwise)
  planned_duration_days: number; // Planned duration in days (start to planned completion)
  actual_or_elapsed_duration_days: number; // Days from start to actual completion or reference date
  schedule_delay_days: number; // Days past planned completion (0 if on/ahead of schedule)
}

export interface TemporalFeatures {
  days_recommendation_to_sanction: number; // Administrative approval lead time
  days_sanction_to_start: number; // Mobilization delay
  days_start_to_planned_completion: number; // Sanctioned project window
  days_since_last_updated: number; // Recency relative to audit reference date
  project_age_days: number; // Days since project start date
  avg_payment_interval_days: number | null; // Mean days between payments (null if < 2 payments)
  avg_progress_interval_days: number | null; // Mean days between inspections (null if < 2 inspections)
}

export interface PaymentFeatures {
  payment_count: number; // Total transactions
  total_paid_amount: number; // Sum of transaction amounts (INR)
  disbursed_payment_ratio: number; // Disbursed transactions / total transactions
  pending_payment_count: number; // Transactions awaiting clearance
  days_to_first_payment: number | null; // Days from start to Tranche 1 (null if 0 payments)
  days_to_final_payment: number | null; // Days from start to final tranche (null if 0 payments)
  payment_velocity_amount_per_month: number; // Average monthly capital outflow (INR/month)
}

export interface ContractorContextFeatures {
  contractor_total_projects: number; // Total portfolio volume
  contractor_total_sanctioned_amount: number; // Total portfolio valuation (INR)
  contractor_district_count: number; // Geographic dispersion across districts
  contractor_district_share_percentage: number; // % of total projects in this district awarded to contractor
}

export interface AgencyContextFeatures {
  agency_total_projects: number; // Total agency project volume
  agency_total_sanctioned_amount: number; // Total agency sanctioned outlay (INR)
  agency_sector_count: number; // Sector diversity count
  agency_district_share_percentage: number; // % of total district projects managed by agency
}

export interface DocumentationFeatures {
  document_count: number; // Total statutory documents in dossier
  verified_document_count: number; // Total approved/verified documents
  missing_document_count: number; // Missing mandatory documents
  discrepancy_document_count: number; // Documents flagged with discrepancies
  has_sanction_order: number; // Binary: 1 if sanction order present & verified, else 0
  has_technical_estimate: number; // Binary: 1 if DPR/technical estimate present & verified, else 0
  has_stage_certificate: number; // Binary: 1 if stage progress certificate present & verified, else 0
  documentation_completeness_ratio: number; // Ratio of verified mandatory documents (0.0 to 1.0)
}

export interface CrossDomainFeatures {
  expenditure_per_progress_point: number; // INR per 1% physical progress
  financial_progress_vs_physical_progress_gap: number; // (Exp/Sanction % - Physical Progress %)
  elapsed_time_ratio: number; // Elapsed days / Planned days
  time_vs_physical_progress_gap: number; // (Elapsed Time % - Physical Progress %)
  payments_per_progress_event_ratio: number; // Ratio of payment events to physical inspections
  disbursement_prior_to_progress_flag: number; // Binary: 1 if payment occurred before 1st inspection
}

export interface FeatureMetadata {
  feature_version: string;
  schema_version: string;
  source_database: string;
  reference_audit_date: string;
}

export interface FeatureRecord {
  project_code: string;
  categorical: CategoricalFeatures;
  financial: FinancialFeatures;
  physical: PhysicalFeatures;
  temporal: TemporalFeatures;
  payment: PaymentFeatures;
  contractor: ContractorContextFeatures;
  agency: AgencyContextFeatures;
  documentation: DocumentationFeatures;
  cross_domain: CrossDomainFeatures;
  metadata: FeatureMetadata;
}

export interface FeatureDatasetBundle {
  metadata: {
    dataset_name: string;
    feature_version: string;
    generated_at: string;
    record_count: number;
    disclaimer: string;
  };
  features: FeatureRecord[];
}
