import type { ProjectRecord, ScenarioType } from "../types/project.ts";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

const VALID_SCENARIOS: Set<ScenarioType> = new Set([
  "NORMAL",
  "DUPLICATE_SIGNAL",
  "EXPENDITURE_SHIFT",
  "TIMELINE_INCONSISTENCY",
  "PHYSICAL_FINANCIAL_MISMATCH",
  "PAYMENT_PATTERN_SIGNAL",
  "CONTRACTOR_CONCENTRATION",
  "MISSING_DOCUMENTATION",
  "MULTI_SIGNAL",
]);

const VALID_STATUSES = new Set([
  "Recommended",
  "Sanctioned",
  "In Progress",
  "Completed",
  "Delayed",
]);

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const PROJECT_CODE_REGEX = /^MPLAD-[A-Z0-9-]+$/;

/**
 * Validates an individual ProjectRecord against canonical schema rules
 */
export function validateProjectRecord(project: ProjectRecord): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Identity validation
  if (!project.project_code || !PROJECT_CODE_REGEX.test(project.project_code)) {
    errors.push(
      `Invalid project_code: "${project.project_code}". Must match format ${PROJECT_CODE_REGEX.source}`
    );
  }

  if (!project.project_title || project.project_title.trim().length < 5) {
    errors.push(`Invalid project_title: Must be at least 5 characters long.`);
  }

  if (!VALID_STATUSES.has(project.status)) {
    errors.push(`Invalid status: "${project.status}". Expected one of: ${Array.from(VALID_STATUSES).join(", ")}`);
  }

  // 2. Financial validation
  if (typeof project.sanctioned_amount !== "number" || isNaN(project.sanctioned_amount)) {
    errors.push(`Invalid sanctioned_amount: Must be a valid number.`);
  } else if (project.sanctioned_amount <= 0) {
    errors.push(`Negative or zero sanctioned_amount (${project.sanctioned_amount}). Must be positive.`);
  }

  if (typeof project.released_amount !== "number" || isNaN(project.released_amount) || project.released_amount < 0) {
    errors.push(`Negative or invalid released_amount (${project.released_amount}).`);
  }

  if (typeof project.expenditure_amount !== "number" || isNaN(project.expenditure_amount) || project.expenditure_amount < 0) {
    errors.push(`Negative or invalid expenditure_amount (${project.expenditure_amount}).`);
  }

  // Cross-financial checks (unless documented anomalous test scenario)
  if (
    project.scenario_type !== "EXPENDITURE_SHIFT" &&
    project.scenario_type !== "PHYSICAL_FINANCIAL_MISMATCH" &&
    project.scenario_type !== "MULTI_SIGNAL"
  ) {
    if (project.released_amount > project.sanctioned_amount) {
      errors.push(
        `released_amount (₹${project.released_amount}) exceeds sanctioned_amount (₹${project.sanctioned_amount}) in NORMAL scenario.`
      );
    }
    if (project.expenditure_amount > project.released_amount) {
      errors.push(
        `expenditure_amount (₹${project.expenditure_amount}) exceeds released_amount (₹${project.released_amount}) in NORMAL scenario.`
      );
    }
  }

  // 3. Physical progress validation
  if (
    typeof project.physical_progress !== "number" ||
    isNaN(project.physical_progress) ||
    project.physical_progress < 0 ||
    project.physical_progress > 100
  ) {
    errors.push(`physical_progress must be between 0 and 100, got: ${project.physical_progress}`);
  }

  // 4. Date format & chronology validation
  const datesToCheck = [
    { name: "recommendation_date", val: project.recommendation_date },
    { name: "sanction_date", val: project.sanction_date },
    { name: "start_date", val: project.start_date },
    { name: "expected_completion_date", val: project.expected_completion_date },
    { name: "planned_completion_date", val: project.planned_completion_date },
    { name: "last_updated", val: project.last_updated },
  ];

  for (const { name, val } of datesToCheck) {
    if (!val || !ISO_DATE_REGEX.test(val) || isNaN(Date.parse(val))) {
      errors.push(`Field "${name}" must be a valid ISO YYYY-MM-DD date, got: "${val}"`);
    }
  }

  if (project.actual_or_reported_completion_date) {
    if (!ISO_DATE_REGEX.test(project.actual_or_reported_completion_date) || isNaN(Date.parse(project.actual_or_reported_completion_date))) {
      errors.push(`actual_or_reported_completion_date must be valid ISO date or null, got: "${project.actual_or_reported_completion_date}"`);
    }
  }

  // Chronology checks
  if (
    project.scenario_type !== "TIMELINE_INCONSISTENCY" &&
    project.scenario_type !== "MULTI_SIGNAL"
  ) {
    if (project.recommendation_date > project.sanction_date) {
      errors.push(
        `recommendation_date (${project.recommendation_date}) cannot be after sanction_date (${project.sanction_date}) in NORMAL scenario.`
      );
    }
    if (project.sanction_date > project.start_date) {
      errors.push(
        `sanction_date (${project.sanction_date}) cannot be after start_date (${project.start_date}) in NORMAL scenario.`
      );
    }
  }

  // 5. Scenario validation
  if (!VALID_SCENARIOS.has(project.scenario_type)) {
    errors.push(`Invalid scenario_type: "${project.scenario_type}". Expected one of: ${Array.from(VALID_SCENARIOS).join(", ")}`);
  }

  if (!project.scenario_description || project.scenario_description.trim().length === 0) {
    errors.push(`Missing scenario_description for ground truth testing.`);
  }

  // 6. Classification & Location completeness
  if (!project.state || !project.constituency || !project.district) {
    errors.push(`Location fields (state, constituency, district) must all be non-empty.`);
  }

  if (!project.sector || !project.implementing_agency || !project.contractor_id) {
    errors.push(`Classification fields (sector, implementing_agency, contractor_id) must be non-empty.`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates an entire collection of ProjectRecords, checking both per-record
 * validity and global uniqueness constraints (unique project codes).
 */
export function validateDataset(projects: ProjectRecord[]): {
  valid: boolean;
  totalRecords: number;
  invalidCount: number;
  errorsByCode: Record<string, string[]>;
} {
  const errorsByCode: Record<string, string[]> = {};
  const seenCodes = new Set<string>();
  let invalidCount = 0;

  for (const project of projects) {
    const res = validateProjectRecord(project);
    const localErrors = [...res.errors];

    if (seenCodes.has(project.project_code)) {
      localErrors.push(`Duplicate project_code detected: "${project.project_code}"`);
    } else {
      seenCodes.add(project.project_code);
    }

    if (localErrors.length > 0) {
      invalidCount++;
      errorsByCode[project.project_code] = localErrors;
    }
  }

  return {
    valid: invalidCount === 0,
    totalRecords: projects.length,
    invalidCount,
    errorsByCode,
  };
}
