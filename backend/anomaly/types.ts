/**
 * MPLAD SENTINEL — Phase 8 Anomaly Detection & Intelligence Engine Types
 * Strongly typed definitions for anomaly signal models, evidence structures,
 * and project anomaly results.
 *
 * CRITICAL RESPONSIBLE AI PRINCIPLE:
 * Anomaly signals are indicators requiring human review and verification.
 * They DO NOT determine or imply fraud, guilt, or corruption.
 */

export type SignalType =
  | "PHYSICAL_FINANCIAL_MISMATCH"
  | "TIMELINE_INCONSISTENCY"
  | "PAYMENT_PATTERN_SIGNAL"
  | "EXPENDITURE_SHIFT"
  | "DUPLICATE_SIGNAL"
  | "CONTRACTOR_CONCENTRATION"
  | "MISSING_DOCUMENTATION"
  | "STATISTICAL_OUTLIER"
  | "ISOLATION_FOREST_OUTLIER"
  | "ALLOCATION_LIMIT_OUTLIER"
  | "DATA_COMPLETENESS_SIGNAL"
  | "REGIONAL_DISPARITY_SIGNAL"
  | "MULTI_SIGNAL";

export type Severity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface AnomalyEvidence {
  feature: string;
  observedValue: string | number | null;
  referenceValue: string | number;
  direction: string; // e.g., "above_expected", "below_expected", "inconsistent"
  explanation: string;
}

export interface AnomalySignal {
  projectCode: string;
  detectorId: string;
  detectorVersion: string;
  signalType: SignalType;
  severity: Severity;
  score: number; // Finite and bounded in [0, 1]
  confidence?: string; // Methodological reliability metadata
  evidence: AnomalyEvidence[];
  affectedFeatures: string[];
  explanation: string;
  generatedAt: string;
}

export interface AnomalyResult {
  projectCode: string;
  signals: AnomalySignal[];
  overallSeverity: Severity;
  overallSignalScore: number; // Finite and bounded in [0, 1]
  explanation: string;
  engineVersion: string;
  featureVersion: string;
}

export interface AnomalyDatasetBundle {
  metadata: {
    engineVersion: string;
    featureVersion: string;
    generatedAt: string;
    projectCount: number;
    signalsCount: number;
    projectsWithSignals: number;
    disclaimer: string;
  };
  results: AnomalyResult[];
}

export const ANOMALY_ENGINE_VERSION = "1.0.0";
