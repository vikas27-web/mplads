/**
 * MPLAD SENTINEL — Phase 8 Anomaly Detection Engine
 * Orchestrates multi-domain detection workflows:
 *
 * FeatureRecords
 *       ↓
 * Rule Detectors (7 primary domains)
 *       ↓
 * Statistical MAD Detector
 *       ↓
 * Machine Learning (Isolation Forest)
 *       ↓
 * Multi-Signal Cross-Domain Detector
 *       ↓
 * Signal Aggregator
 *       ↓
 * Schema, Anti-Leakage & Responsible AI Validator
 *       ↓
 * AnomalyResult[]
 */

import type { FeatureRecord } from "../features/types.ts";
import type { AnomalyResult, AnomalySignal } from "./types.ts";
import { detectPhysicalFinancialMismatch } from "./rules/physicalFinancialMismatchRule.ts";
import { detectTimelineInconsistency } from "./rules/timelineInconsistencyRule.ts";
import { detectPaymentPattern } from "./rules/paymentPatternRule.ts";
import { detectExpenditureShift } from "./rules/expenditureShiftRule.ts";
import { detectDuplicateWork } from "./rules/duplicateWorkRule.ts";
import { detectContractorConcentration } from "./rules/contractorConcentrationRule.ts";
import { detectMissingDocumentation } from "./rules/missingDocumentationRule.ts";
import { detectMultiSignal } from "./rules/multiSignalRule.ts";
import {
  detectOfficialAllocationOutlier,
  detectOfficialCompletenessRule,
  detectOfficialStateDisparityRule,
  computeStateMedians,
} from "./rules/officialAllocationRules.ts";
import { detectStatisticalOutliers } from "./statistical/robustStats.ts";
import { buildFeatureMatrix } from "./ml/featureMatrix.ts";
import { runIsolationForestDetection } from "./ml/isolationForest.ts";
import { aggregateProjectSignals } from "./aggregator.ts";
import { validateAnomalyDataset } from "./validator.ts";

export interface AnomalyEngineOptions {
  skipValidation?: boolean;
}

/**
 * Executes the complete anomaly detection engine over an array of FeatureRecords.
 * Produces deterministic, explainable AnomalyResults for every project.
 */
export function runAnomalyDetectionEngine(
  records: FeatureRecord[],
  options?: AnomalyEngineOptions
): AnomalyResult[] {
  // 1. Sort records by project_code for stable determinism
  const sortedRecords = [...records].sort((a, b) =>
    a.project_code.localeCompare(b.project_code)
  );

  const isOfficialDataset = sortedRecords.some((r) => r.project_code.startsWith("MPLAD-OFFICIAL-"));
  const stateMedians = isOfficialDataset ? computeStateMedians(sortedRecords) : new Map<string, number>();

  // 2. Statistical Outlier Detection across dataset
  const statisticalSignalsMap = detectStatisticalOutliers(sortedRecords);

  // 3. Machine Learning Isolation Forest Outlier Detection
  const featureMatrix = buildFeatureMatrix(sortedRecords);
  const isolationForestSignalsMap = runIsolationForestDetection(featureMatrix);

  // 4. Per-project Rule Execution and Signal Assembly
  const results: AnomalyResult[] = [];

  for (const rec of sortedRecords) {
    const projectSignals: AnomalySignal[] = [];
    const isOfficial = rec.project_code.startsWith("MPLAD-OFFICIAL-");

    if (isOfficial) {
      // Capability-aware detectors for Official Dataset:
      // Only execute detectors for genuinely available source dimensions!
      projectSignals.push(...detectOfficialAllocationOutlier(rec));
      projectSignals.push(...detectOfficialCompletenessRule(rec));
      projectSignals.push(...detectOfficialStateDisparityRule(rec, stateMedians));

      // Statistical Signals
      const statSignals = statisticalSignalsMap.get(rec.project_code);
      if (statSignals) {
        projectSignals.push(...statSignals);
      }

      // Isolation Forest Signals
      const ifSignals = isolationForestSignalsMap.get(rec.project_code);
      if (ifSignals) {
        projectSignals.push(...ifSignals);
      }

      // Multi-Signal Detector (triggers if >= 2 distinct primary domains detected)
      const multiSig = detectMultiSignal(rec.project_code, projectSignals);
      if (multiSig) {
        projectSignals.push(multiSig);
      }
    } else {
      // Synthetic Benchmark Rules (only executed for synthetic test datasets)
      projectSignals.push(...detectPhysicalFinancialMismatch(rec));
      projectSignals.push(...detectTimelineInconsistency(rec));
      projectSignals.push(...detectPaymentPattern(rec));
      projectSignals.push(...detectExpenditureShift(rec));
      projectSignals.push(...detectDuplicateWork(rec, sortedRecords));
      projectSignals.push(...detectContractorConcentration(rec));
      projectSignals.push(...detectMissingDocumentation(rec));

      // Statistical Signals
      const statSignals = statisticalSignalsMap.get(rec.project_code);
      if (statSignals) {
        projectSignals.push(...statSignals);
      }

      // Isolation Forest Signals
      const ifSignals = isolationForestSignalsMap.get(rec.project_code);
      if (ifSignals) {
        projectSignals.push(...ifSignals);
      }

      // Multi-Signal Detector (triggers if >= 2 distinct primary domains detected)
      const multiSig = detectMultiSignal(rec.project_code, projectSignals);
      if (multiSig) {
        projectSignals.push(multiSig);
      }
    }

    // Aggregate signals into consolidated AnomalyResult
    const aggregated = aggregateProjectSignals(rec.project_code, projectSignals);
    results.push(aggregated);
  }

  // 5. Strict Validation
  if (!options?.skipValidation) {
    const validation = validateAnomalyDataset(results);
    if (!validation.valid) {
      throw new Error(
        `Anomaly Dataset Validation Failed with ${validation.errors.length} errors:\n${validation.errors.slice(0, 5).join("\n")}`
      );
    }
  }

  return results;
}
