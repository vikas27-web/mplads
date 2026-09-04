/**
 * MPLAD SENTINEL — Phase 8 Anomaly Output & Responsible AI Validator
 *
 * Enforces rigorous schema compliance, numerical boundedness, anti-leakage invariants,
 * and zero forbidden accusatory language.
 */

import type { AnomalySignal, AnomalyResult, SignalType, Severity, AnomalyEvidence } from "./types.ts";

export interface ValidationReport {
  valid: boolean;
  errors: string[];
}

const VALID_SIGNAL_TYPES: SignalType[] = [
  "PHYSICAL_FINANCIAL_MISMATCH",
  "TIMELINE_INCONSISTENCY",
  "PAYMENT_PATTERN_SIGNAL",
  "EXPENDITURE_SHIFT",
  "DUPLICATE_SIGNAL",
  "CONTRACTOR_CONCENTRATION",
  "MISSING_DOCUMENTATION",
  "STATISTICAL_OUTLIER",
  "ISOLATION_FOREST_OUTLIER",
  "ALLOCATION_LIMIT_OUTLIER",
  "DATA_COMPLETENESS_SIGNAL",
  "REGIONAL_DISPARITY_SIGNAL",
  "MULTI_SIGNAL",
];

const VALID_SEVERITIES: Severity[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

const FORBIDDEN_LEAKAGE_KEYS = [
  "scenario_type",
  "scenario_description",
  "ground_truth",
];

const FORBIDDEN_ACCUSATORY_TERMS = [
  "fraud",
  "fraudulent",
  "guilty",
  "corrupt",
];

/**
 * Validates an individual AnomalySignal.
 */
export function validateAnomalySignal(signal: AnomalySignal): ValidationReport {
  const errors: string[] = [];

  // 1. Identity
  if (!signal.projectCode || typeof signal.projectCode !== "string" || !signal.projectCode.trim()) {
    errors.push("Missing or invalid projectCode");
  }

  if (!signal.detectorId || typeof signal.detectorId !== "string" || !signal.detectorId.trim()) {
    errors.push("Missing detectorId");
  }

  if (!signal.detectorVersion || typeof signal.detectorVersion !== "string") {
    errors.push("Missing detectorVersion");
  }

  // 2. Types and Severity
  if (!VALID_SIGNAL_TYPES.includes(signal.signalType)) {
    errors.push(`Invalid signalType: "${signal.signalType}"`);
  }

  if (!VALID_SEVERITIES.includes(signal.severity)) {
    errors.push(`Invalid severity: "${signal.severity}"`);
  }

  // 3. Score
  if (typeof signal.score !== "number" || Number.isNaN(signal.score) || !Number.isFinite(signal.score)) {
    errors.push(`Score must be a finite number, received: ${signal.score}`);
  } else if (signal.score < 0 || signal.score > 1) {
    errors.push(`Score must be bounded in [0, 1], received: ${signal.score}`);
  }

  // 4. Evidence
  if (!Array.isArray(signal.evidence) || signal.evidence.length === 0) {
    errors.push("Signal must contain at least one AnomalyEvidence item");
  } else {
    for (let i = 0; i < signal.evidence.length; i++) {
      const ev = signal.evidence[i];
      if (!ev.feature || typeof ev.feature !== "string") {
        errors.push(`Evidence[${i}]: Missing feature name`);
      }
      if (typeof ev.observedValue === "number" && (Number.isNaN(ev.observedValue) || !Number.isFinite(ev.observedValue))) {
        errors.push(`Evidence[${i}]: observedValue cannot be NaN or non-finite`);
      }
      if (typeof ev.referenceValue === "number" && (Number.isNaN(ev.referenceValue) || !Number.isFinite(ev.referenceValue))) {
        errors.push(`Evidence[${i}]: referenceValue cannot be NaN or non-finite`);
      }
      if (!ev.direction || typeof ev.direction !== "string") {
        errors.push(`Evidence[${i}]: Missing direction indicator`);
      }
      if (!ev.explanation || typeof ev.explanation !== "string" || !ev.explanation.trim()) {
        errors.push(`Evidence[${i}]: Missing explanation`);
      }
    }
  }

  // 5. Affected Features
  if (!Array.isArray(signal.affectedFeatures) || signal.affectedFeatures.length === 0) {
    errors.push("affectedFeatures must be a non-empty string array");
  }

  // 6. Explanation & Timestamp
  if (!signal.explanation || typeof signal.explanation !== "string" || !signal.explanation.trim()) {
    errors.push("Missing signal explanation");
  }

  if (!signal.generatedAt || typeof signal.generatedAt !== "string") {
    errors.push("Missing generatedAt timestamp");
  }

  // 7. Security Anti-Leakage & Terminology Scan
  const jsonStr = JSON.stringify(signal).toLowerCase();
  for (const forbiddenKey of FORBIDDEN_LEAKAGE_KEYS) {
    if (jsonStr.includes(`"${forbiddenKey}"`)) {
      errors.push(`CRITICAL ANTI-LEAKAGE: Signal contains ground-truth field "${forbiddenKey}"`);
    }
  }

  for (const term of FORBIDDEN_ACCUSATORY_TERMS) {
    const regex = new RegExp(`\\b${term}\\b`, "i");
    if (regex.test(jsonStr)) {
      errors.push(`RESPONSIBLE AI VIOLATION: Forbidden accusatory term "${term}" detected in signal`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates a consolidated AnomalyResult.
 */
export function validateAnomalyResult(result: AnomalyResult): ValidationReport {
  const errors: string[] = [];

  if (!result.projectCode || typeof result.projectCode !== "string" || !result.projectCode.trim()) {
    errors.push("Missing projectCode");
  }

  if (!VALID_SEVERITIES.includes(result.overallSeverity)) {
    errors.push(`Invalid overallSeverity: "${result.overallSeverity}"`);
  }

  if (typeof result.overallSignalScore !== "number" || Number.isNaN(result.overallSignalScore) || !Number.isFinite(result.overallSignalScore)) {
    errors.push(`overallSignalScore must be finite, received: ${result.overallSignalScore}`);
  } else if (result.overallSignalScore < 0 || result.overallSignalScore > 1) {
    errors.push(`overallSignalScore must be in [0, 1], received: ${result.overallSignalScore}`);
  }

  if (!result.explanation || typeof result.explanation !== "string" || !result.explanation.trim()) {
    errors.push("Missing result explanation");
  }

  if (!result.engineVersion || !result.featureVersion) {
    errors.push("Missing engineVersion or featureVersion");
  }

  if (!Array.isArray(result.signals)) {
    errors.push("signals must be an array");
  } else {
    for (const signal of result.signals) {
      const sigValidation = validateAnomalySignal(signal);
      if (!sigValidation.valid) {
        errors.push(...sigValidation.errors.map((e) => `[Signal ${signal.signalType}] ${e}`));
      }
    }
  }

  // Deep string validation on entire result
  const jsonStr = JSON.stringify(result).toLowerCase();
  for (const key of FORBIDDEN_LEAKAGE_KEYS) {
    if (jsonStr.includes(`"${key}"`)) {
      errors.push(`CRITICAL ANTI-LEAKAGE: AnomalyResult contains ground-truth field "${key}"`);
    }
  }

  for (const term of FORBIDDEN_ACCUSATORY_TERMS) {
    const regex = new RegExp(`\\b${term}\\b`, "i");
    if (regex.test(jsonStr)) {
      errors.push(`RESPONSIBLE AI VIOLATION: Forbidden accusatory term "${term}" detected in AnomalyResult`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates a dataset array of AnomalyResults.
 */
export function validateAnomalyDataset(results: AnomalyResult[]): ValidationReport {
  const errors: string[] = [];
  const seenProjects = new Set<string>();

  for (const res of results) {
    if (seenProjects.has(res.projectCode)) {
      errors.push(`Duplicate projectCode in dataset: ${res.projectCode}`);
    }
    seenProjects.add(res.projectCode);

    const report = validateAnomalyResult(res);
    if (!report.valid) {
      errors.push(`[${res.projectCode}] ${report.errors.join("; ")}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
