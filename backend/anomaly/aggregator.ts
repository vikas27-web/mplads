/**
 * MPLAD SENTINEL — Phase 8 Signal Aggregator
 * Synthesizes multi-engine signals (rules, statistical MAD, and Isolation Forest)
 * into a consolidated AnomalyResult per project.
 *
 * CRITICAL RESPONSIBLE AI POLICY:
 * This module computes an "overall anomaly signal score" and "review priority".
 * It DOES NOT produce a fraud verdict, culpability index, or criminal score.
 */

import type { AnomalySignal, AnomalyResult, Severity } from "./types.ts";
import { ANOMALY_ENGINE_VERSION } from "./types.ts";
import { FEATURE_VERSION } from "../features/types.ts";

const SEVERITY_ORDER: Record<Severity, number> = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  CRITICAL: 4,
};

/**
 * Aggregates all detected signals for a project into a consolidated AnomalyResult.
 */
export function aggregateProjectSignals(
  projectCode: string,
  signals: AnomalySignal[]
): AnomalyResult {
  if (signals.length === 0) {
    return {
      projectCode,
      signals: [],
      overallSeverity: "LOW",
      overallSignalScore: 0.0,
      explanation: "No potential anomaly signals detected across rule, statistical, or machine learning evaluation engines. Standard routine monitoring applies.",
      engineVersion: ANOMALY_ENGINE_VERSION,
      featureVersion: FEATURE_VERSION,
    };
  }

  // 1. Determine overall severity by highest constituent severity
  let highestSeverity: Severity = "LOW";
  let maxSeverityWeight = 0;

  for (const s of signals) {
    const weight = SEVERITY_ORDER[s.severity] || 0;
    if (weight > maxSeverityWeight) {
      maxSeverityWeight = weight;
      highestSeverity = s.severity;
    }
  }

  // 2. Compute overall anomaly signal score bounded strictly in [0, 1]
  const scores = signals.map((s) => s.score).filter((sc) => Number.isFinite(sc));
  const maxScore = scores.length > 0 ? Math.max(...scores) : 0;
  // Deterministic multi-signal boost (capped strictly at 1.0)
  const additionalBonus = Math.min(0.12, (signals.length - 1) * 0.03);
  const overallSignalScore = Math.min(1.0, Math.max(0.0, Number((maxScore + additionalBonus).toFixed(3))));

  // 3. Synthesize explainable summary
  const uniqueDomains = Array.from(new Set(signals.map((s) => s.signalType))).sort();
  const domainSummary = uniqueDomains.join(", ");

  const explanation = `${signals.length} potential anomaly signal(s) identified across ${uniqueDomains.length} evaluation domain(s) (${domainSummary}). Review priority: ${highestSeverity}. Human audit verification and physical site inspection recommended.`;

  return {
    projectCode,
    signals,
    overallSeverity: highestSeverity,
    overallSignalScore,
    explanation,
    engineVersion: ANOMALY_ENGINE_VERSION,
    featureVersion: FEATURE_VERSION,
  };
}
