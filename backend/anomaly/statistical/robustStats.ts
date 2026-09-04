/**
 * MPLAD SENTINEL — Phase 8 Robust Statistical Outlier Detection
 * Implements Median Absolute Deviation (MAD) and Boris Iglewicz & David Hoaglin (1993)
 * Modified Z-scores for resilient outlier identification on skewed distribution metrics.
 *
 * Mathematical formulation:
 * Median: Median(X)
 * MAD = Median(|X_i - Median(X)|)
 * Modified Z_i = 0.6745 * (X_i - Median(X)) / MAD
 * Outlier condition: |Modified Z_i| >= 3.0
 */

import type { FeatureRecord } from "../../features/types.ts";
import type { AnomalySignal, AnomalyEvidence, Severity } from "../types.ts";
import { STATISTICAL_CONFIG } from "../config.ts";

/**
 * Computes the exact statistical median of a numeric array.
 */
export function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].filter((v) => !Number.isNaN(v) && Number.isFinite(v)).sort((a, b) => a - b);
  if (sorted.length === 0) return 0;
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 !== 0) {
    return sorted[mid];
  }
  return (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * Computes Median Absolute Deviation (MAD).
 * MAD = median(|x - median(x)|)
 */
export function calculateMAD(values: number[], precomputedMedian?: number): number {
  const valid = values.filter((v) => !Number.isNaN(v) && Number.isFinite(v));
  if (valid.length === 0) return 0;
  const med = precomputedMedian !== undefined ? precomputedMedian : calculateMedian(valid);
  const absoluteDeviations = valid.map((x) => Math.abs(x - med));
  return calculateMedian(absoluteDeviations);
}

/**
 * Computes the Boris Iglewicz & David Hoaglin Modified Z-Score:
 * M_i = 0.6745 * (x_i - median) / MAD
 * Handles MAD === 0 safely without division by zero.
 */
export function calculateModifiedZScore(value: number, median: number, mad: number): number {
  if (Number.isNaN(value) || !Number.isFinite(value)) return 0;
  const diff = value - median;
  if (diff === 0) return 0;

  if (mad === 0) {
    // When MAD is zero, all values around the median are identical.
    // If value equals median, z is 0; otherwise use small epsilon or return 0
    return 0;
  }

  return (0.6745 * diff) / mad;
}

/**
 * Extracts nested feature value by dot notation (e.g. "cross_domain.expenditure_per_progress_point").
 */
function getFeatureValue(record: FeatureRecord, path: string): number | null {
  const parts = path.split(".");
  let current: any = record;
  for (const part of parts) {
    if (current === null || current === undefined) return null;
    current = current[part];
  }
  if (typeof current === "number" && Number.isFinite(current)) {
    return current;
  }
  return null;
}

export interface StatisticalMetricBaseline {
  featurePath: string;
  median: number;
  mad: number;
  sampleSize: number;
}

/**
 * Computes dataset-wide medians and MAD values for configured continuous features.
 */
export function computeStatisticalBaselines(
  records: FeatureRecord[]
): Map<string, StatisticalMetricBaseline> {
  const baselines = new Map<string, StatisticalMetricBaseline>();

  for (const featPath of STATISTICAL_CONFIG.features) {
    const values: number[] = [];
    for (const rec of records) {
      const val = getFeatureValue(rec, featPath);
      if (val !== null) {
        values.push(val);
      }
    }

    const median = calculateMedian(values);
    const mad = calculateMAD(values, median);
    baselines.set(featPath, {
      featurePath: featPath,
      median,
      mad,
      sampleSize: values.length,
    });
  }

  return baselines;
}

/**
 * Evaluates records against robust statistical baselines and emits AnomalySignal objects.
 */
export function detectStatisticalOutliers(
  records: FeatureRecord[],
  precomputedBaselines?: Map<string, StatisticalMetricBaseline>
): Map<string, AnomalySignal[]> {
  const baselines = precomputedBaselines || computeStatisticalBaselines(records);
  const resultsByProject = new Map<string, AnomalySignal[]>();

  for (const rec of records) {
    const projectSignals: AnomalySignal[] = [];

    for (const featPath of STATISTICAL_CONFIG.features) {
      const baseline = baselines.get(featPath);
      if (!baseline || baseline.mad === 0) continue;

      const val = getFeatureValue(rec, featPath);
      if (val === null) continue;

      const modZ = calculateModifiedZScore(val, baseline.median, baseline.mad);

      if (Math.abs(modZ) >= STATISTICAL_CONFIG.madMultiplier) {
        const isCritical = Math.abs(modZ) >= 5.0;
        const severity: Severity = isCritical ? "CRITICAL" : "HIGH";

        // Score bounded strictly between [0.60, 0.98]
        const score = Math.min(
          0.98,
          Number((0.65 + Math.min(0.33, (Math.abs(modZ) - 3.0) / 10)).toFixed(3))
        );

        const direction = modZ > 0 ? "above_expected" : "below_expected";
        const evidence: AnomalyEvidence[] = [
          {
            feature: featPath,
            observedValue: Number(val.toFixed(2)),
            referenceValue: Number(baseline.median.toFixed(2)),
            direction,
            explanation: `Observed value ${val.toFixed(2)} deviates from median benchmark ${baseline.median.toFixed(2)} with Modified Z-score of ${modZ.toFixed(2)} (MAD: ${baseline.mad.toFixed(2)}).`,
          },
        ];

        projectSignals.push({
          projectCode: rec.project_code,
          detectorId: "STATISTICAL_ROBUST_MAD",
          detectorVersion: "1.0.0",
          signalType: "STATISTICAL_OUTLIER",
          severity,
          score,
          confidence: `Modified Z-score: ${modZ.toFixed(2)} (|Z| >= ${STATISTICAL_CONFIG.madMultiplier})`,
          evidence,
          affectedFeatures: [featPath],
          explanation: `Robust statistical outlier detected on ${featPath} (Modified Z-score: ${modZ.toFixed(2)}, threshold: ±${STATISTICAL_CONFIG.madMultiplier}). Quantitative distribution verification recommended.`,
          generatedAt: "2026-09-04T00:00:00.000Z",
        });
      }
    }

    if (projectSignals.length > 0) {
      resultsByProject.set(rec.project_code, projectSignals);
    }
  }

  return resultsByProject;
}
