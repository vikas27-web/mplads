/**
 * MPLAD SENTINEL — Phase 8 ML Feature Matrix Builder
 * Extracts and vectorizes continuous analytical features for unsupervised Isolation Forest.
 *
 * STRICT ANTI-LEAKAGE RULE:
 * `scenario_type` and scenario descriptions are benchmark ground truth ONLY.
 * They are NEVER extracted, normalized, or passed into this matrix.
 */

import type { FeatureRecord } from "../../features/types.ts";
import { ML_CONFIG } from "../config.ts";

export interface FeatureMatrixRow {
  projectCode: string;
  vector: number[];
}

export interface FeatureMatrixDataset {
  featureNames: string[];
  rows: FeatureMatrixRow[];
}

function extractFeatureValue(record: FeatureRecord, path: string): number {
  // Anti-leakage guard
  if (path.toLowerCase().includes("scenario")) {
    throw new Error(`CRITICAL SECURITY LEAKAGE: Ground truth "${path}" attempted in ML feature matrix!`);
  }

  const parts = path.split(".");
  let current: any = record;
  for (const part of parts) {
    if (current === null || current === undefined) return 0;
    current = current[part];
  }

  if (typeof current === "number" && Number.isFinite(current)) {
    return current;
  }
  return 0;
}

/**
 * Builds the numeric feature matrix for Isolation Forest.
 * Strictly guarantees that ground truth attributes are excluded.
 */
export function buildFeatureMatrix(records: FeatureRecord[]): FeatureMatrixDataset {
  // Double-check no ground-truth features are configured
  for (const feat of ML_CONFIG.featureNames) {
    if (feat.toLowerCase().includes("scenario")) {
      throw new Error(`CRITICAL LEAKAGE: ML_CONFIG contains ground-truth field "${feat}"`);
    }
  }

  const rows: FeatureMatrixRow[] = [];

  for (const rec of records) {
    // Assert record object itself does not leak scenario_type into feature vector
    const vector: number[] = ML_CONFIG.featureNames.map((name) =>
      extractFeatureValue(rec, name)
    );

    rows.push({
      projectCode: rec.project_code,
      vector,
    });
  }

  return {
    featureNames: [...ML_CONFIG.featureNames],
    rows,
  };
}
