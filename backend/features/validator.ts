/**
 * MPLAD SENTINEL — Phase 7 Feature Validator
 * Validates feature records to ensure mathematical correctness, data integrity,
 * absence of NaN/Infinity, non-negative monetary quantities, and zero leakage of ground-truth scenario labels.
 */

import { type FeatureRecord, FEATURE_VERSION } from "./types.ts";

export interface FeatureValidationResult {
  valid: boolean;
  errors: string[];
}

export interface DatasetValidationResult {
  total: number;
  validCount: number;
  invalidCount: number;
  valid: boolean;
  errors: { project_code: string; errors: string[] }[];
}

const FORBIDDEN_KEYS = [
  "scenario_type",
  "scenario_description",
  "anomaly_score",
  "risk_score",
  "confidence_score",
  "is_anomaly",
  "anomaly_label",
];

const FORBIDDEN_SCENARIO_VALUES = [
  "NORMAL",
  "DUPLICATE_SIGNAL",
  "EXPENDITURE_SHIFT",
  "TIMELINE_INCONSISTENCY",
  "PHYSICAL_FINANCIAL_MISMATCH",
  "PAYMENT_PATTERN_SIGNAL",
  "CONTRACTOR_CONCENTRATION",
  "MISSING_DOCUMENTATION",
  "MULTI_SIGNAL",
];

/**
 * Recursively inspects an object to ensure no forbidden keys or scenario values are present.
 */
function checkForbiddenLeakage(
  obj: unknown,
  path: string,
  errors: string[]
): void {
  if (!obj || typeof obj !== "object") return;

  for (const [key, val] of Object.entries(obj)) {
    const currentPath = path ? `${path}.${key}` : key;

    // Check key names
    if (FORBIDDEN_KEYS.includes(key.toLowerCase())) {
      errors.push(`Data Leakage Violation: Forbidden key "${currentPath}" found in feature record`);
    }

    // Check string values for forbidden scenario types
    if (typeof val === "string" && FORBIDDEN_SCENARIO_VALUES.includes(val)) {
      errors.push(
        `Data Leakage Violation: Forbidden ground-truth value "${val}" found at "${currentPath}"`
      );
    }

    // Check for NaN or Infinity
    if (typeof val === "number") {
      if (Number.isNaN(val)) {
        errors.push(`Numeric Integrity Violation: NaN detected at "${currentPath}"`);
      }
      if (!Number.isFinite(val)) {
        errors.push(`Numeric Integrity Violation: Non-finite (Infinity) detected at "${currentPath}"`);
      }
    }

    // Recurse into nested objects
    if (typeof val === "object" && val !== null) {
      checkForbiddenLeakage(val, currentPath, errors);
    }
  }
}

/**
 * Validates a single FeatureRecord against strict domain, integrity, and anti-leakage constraints.
 */
export function validateFeatureRecord(record: FeatureRecord): FeatureValidationResult {
  const errors: string[] = [];

  // 1. Identity validation
  if (!record.project_code || typeof record.project_code !== "string" || !record.project_code.trim()) {
    errors.push("Missing or invalid project_code");
  }

  // 2. Metadata validation
  if (!record.metadata) {
    errors.push("Missing feature metadata");
  } else {
    if (record.metadata.feature_version !== FEATURE_VERSION) {
      errors.push(
        `Feature version mismatch: expected "${FEATURE_VERSION}", got "${record.metadata.feature_version}"`
      );
    }
    if (!record.metadata.reference_audit_date) {
      errors.push("Missing reference_audit_date in metadata");
    }
  }

  // 3. Categorical validation
  if (!record.categorical) {
    errors.push("Missing categorical features");
  } else {
    const { state, district, constituency, sector, implementing_agency, contractor_id, status } =
      record.categorical;
    if (!state) errors.push("categorical.state must not be empty");
    if (!district) errors.push("categorical.district must not be empty");
    if (!constituency) errors.push("categorical.constituency must not be empty");
    if (!sector) errors.push("categorical.sector must not be empty");
    if (!implementing_agency) errors.push("categorical.implementing_agency must not be empty");
    if (!contractor_id) errors.push("categorical.contractor_id must not be empty");
    if (!status) errors.push("categorical.status must not be empty");
  }

  // 4. Financial features validation
  if (!record.financial) {
    errors.push("Missing financial features");
  } else {
    const {
      sanctioned_amount,
      released_amount,
      expenditure_amount,
      payment_count,
      average_payment_amount,
    } = record.financial;

    if (sanctioned_amount < 0) errors.push("financial.sanctioned_amount cannot be negative");
    if (released_amount < 0) errors.push("financial.released_amount cannot be negative");
    if (expenditure_amount < 0) errors.push("financial.expenditure_amount cannot be negative");
    if (payment_count < 0) errors.push("financial.payment_count cannot be negative");
    if (average_payment_amount < 0) errors.push("financial.average_payment_amount cannot be negative");
  }

  // 5. Physical features validation
  if (!record.physical) {
    errors.push("Missing physical features");
  } else {
    const { reported_physical_progress, progress_event_count, planned_duration_days } =
      record.physical;
    if (reported_physical_progress < 0 || reported_physical_progress > 100) {
      errors.push("physical.reported_physical_progress must be between 0 and 100");
    }
    if (progress_event_count < 0) errors.push("physical.progress_event_count cannot be negative");
    if (planned_duration_days <= 0) errors.push("physical.planned_duration_days must be positive");
  }

  // 6. Temporal features validation
  if (!record.temporal) {
    errors.push("Missing temporal features");
  } else {
    const { days_recommendation_to_sanction, days_sanction_to_start, project_age_days } =
      record.temporal;
    if (days_recommendation_to_sanction < 0) {
      errors.push("temporal.days_recommendation_to_sanction cannot be negative");
    }
    if (days_sanction_to_start < 0) {
      errors.push("temporal.days_sanction_to_start cannot be negative");
    }
    if (project_age_days < 0) {
      errors.push("temporal.project_age_days cannot be negative");
    }
  }

  // 7. Payment features validation
  if (!record.payment) {
    errors.push("Missing payment features");
  } else {
    const { payment_count, total_paid_amount, disbursed_payment_ratio } = record.payment;
    if (payment_count < 0) errors.push("payment.payment_count cannot be negative");
    if (total_paid_amount < 0) errors.push("payment.total_paid_amount cannot be negative");
    if (disbursed_payment_ratio < 0 || disbursed_payment_ratio > 1) {
      errors.push("payment.disbursed_payment_ratio must be between 0 and 1");
    }
  }

  // 8. Contractor & Agency context validation
  if (!record.contractor) {
    errors.push("Missing contractor context features");
  } else {
    if (record.contractor.contractor_total_projects < 0) {
      errors.push("contractor.contractor_total_projects cannot be negative");
    }
    if (record.contractor.contractor_district_share_percentage < 0 || record.contractor.contractor_district_share_percentage > 100) {
      errors.push("contractor.contractor_district_share_percentage must be between 0 and 100");
    }
  }

  if (!record.agency) {
    errors.push("Missing agency context features");
  } else {
    if (record.agency.agency_total_projects < 0) {
      errors.push("agency.agency_total_projects cannot be negative");
    }
    if (record.agency.agency_district_share_percentage < 0 || record.agency.agency_district_share_percentage > 100) {
      errors.push("agency.agency_district_share_percentage must be between 0 and 100");
    }
  }

  // 9. Documentation features validation
  if (!record.documentation) {
    errors.push("Missing documentation features");
  } else {
    const { document_count, verified_document_count, documentation_completeness_ratio } =
      record.documentation;
    if (document_count < 0) errors.push("documentation.document_count cannot be negative");
    if (verified_document_count < 0) errors.push("documentation.verified_document_count cannot be negative");
    if (documentation_completeness_ratio < 0 || documentation_completeness_ratio > 1) {
      errors.push("documentation.documentation_completeness_ratio must be between 0 and 1");
    }
  }

  // 10. Cross-Domain features validation
  if (!record.cross_domain) {
    errors.push("Missing cross-domain features");
  }

  // 11. Anti-Leakage & Numerical finiteness check
  checkForbiddenLeakage(record, "", errors);

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates an entire collection of feature records
 */
export function validateFeatureDataset(records: FeatureRecord[]): DatasetValidationResult {
  const invalidList: { project_code: string; errors: string[] }[] = [];

  for (const record of records) {
    const res = validateFeatureRecord(record);
    if (!res.valid) {
      invalidList.push({
        project_code: record.project_code,
        errors: res.errors,
      });
    }
  }

  return {
    total: records.length,
    validCount: records.length - invalidList.length,
    invalidCount: invalidList.length,
    valid: invalidList.length === 0,
    errors: invalidList,
  };
}
