/**
 * MPLAD SENTINEL — Phase 12 Official Parliamentary Allocation Rules
 * SIH26102
 *
 * Implements capability-aware, explainable rules for official MPLAD allocation limits.
 *
 * Detectors:
 * 1. RULE_ALLOCATION_LIMIT_OUTLIER: Detects extreme deviations from national baseline (₹14.70 Cr)
 * 2. RULE_ALLOCATION_DATA_COMPLETENESS: Detects zero or missing allocations (e.g. Nanded)
 * 3. RULE_STATE_ALLOCATION_DISPARITY: Detects significant intra-state divergence from state median
 *
 * RESPONSIBLE AI POLICY:
 * Evaluates operational metrics for human audit priority. Does NOT imply wrongdoing.
 */

import type { FeatureRecord } from "../../features/types.ts";
import type { AnomalySignal, AnomalyEvidence, Severity } from "../types.ts";
import { calculateMedian } from "../statistical/robustStats.ts";

export const BASELINE_ALLOCATION_INR = 147000000; // ₹14.70 Cr
export const HIGH_REVIEW_THRESHOLD_INR = 200000000; // ₹20.00 Cr (+36.05% divergence)
export const CRITICAL_REVIEW_THRESHOLD_INR = 250000000; // ₹25.00 Cr (+70.07% divergence)

/**
 * Detects parliamentary allocation limit statistical divergence from standard baseline.
 */
export function detectOfficialAllocationOutlier(
  record: FeatureRecord
): AnomalySignal[] {
  const signals: AnomalySignal[] = [];
  const amount = record.financial.sanctioned_amount;

  // Zero amounts handled by completeness rule
  if (amount <= 0) {
    return signals;
  }

  const divergencePct = Number(
    (((amount - BASELINE_ALLOCATION_INR) / BASELINE_ALLOCATION_INR) * 100).toFixed(1)
  );

  // Upper outliers
  if (amount >= HIGH_REVIEW_THRESHOLD_INR) {
    const isCritical = amount >= CRITICAL_REVIEW_THRESHOLD_INR;
    const severity: Severity = isCritical ? "CRITICAL" : "HIGH";
    const score = isCritical
      ? Math.min(0.98, 0.85 + (amount - CRITICAL_REVIEW_THRESHOLD_INR) / 100000000 * 0.1)
      : 0.75 + ((amount - HIGH_REVIEW_THRESHOLD_INR) / (CRITICAL_REVIEW_THRESHOLD_INR - HIGH_REVIEW_THRESHOLD_INR)) * 0.09;

    const amountCrores = (amount / 1e7).toFixed(2);
    const baselineCrores = (BASELINE_ALLOCATION_INR / 1e7).toFixed(2);

    const evidence: AnomalyEvidence[] = [
      {
        feature: "financial.sanctioned_amount",
        observedValue: `₹${amountCrores} Cr (₹${amount.toLocaleString("en-IN")})`,
        referenceValue: `₹${baselineCrores} Cr (Standard 18th Lok Sabha Baseline)`,
        direction: "above_expected",
        explanation: `Allocated limit of ₹${amountCrores} Cr exceeds national baseline of ₹${baselineCrores} Cr by ${divergencePct > 0 ? "+" : ""}${divergencePct}%.`,
      },
      {
        feature: "baseline_divergence_pct",
        observedValue: `${divergencePct}%`,
        referenceValue: "0%",
        direction: "above_expected",
        explanation: `Constituency allocation ceiling exhibits substantial positive variance (+₹${((amount - BASELINE_ALLOCATION_INR) / 1e7).toFixed(2)} Cr) relative to standard parliamentary cycle entitlement.`,
      },
    ];

    signals.push({
      projectCode: record.project_code,
      detectorId: "RULE_ALLOCATION_LIMIT_OUTLIER",
      detectorVersion: "1.0.0",
      signalType: "ALLOCATION_LIMIT_OUTLIER",
      severity,
      score: Number(score.toFixed(3)),
      confidence: "Verified Official Source Outlier",
      evidence,
      affectedFeatures: ["financial.sanctioned_amount", "baseline_divergence_pct"],
      explanation: `Parliamentary constituency allocation limit of ₹${amountCrores} Cr represents a significant upward divergence (+${divergencePct}%). Prioritize for administrative verification of carried-over balances from preceding Lok Sabha tenures.`,
      generatedAt: new Date().toISOString(),
    });
  } else if (amount < 100000000 && amount > 0) {
    // Low outlier (e.g. Basirhat ₹4.90 Cr, Asansol ₹8.42 Cr)
    const amountCrores = (amount / 1e7).toFixed(2);
    const baselineCrores = (BASELINE_ALLOCATION_INR / 1e7).toFixed(2);

    const evidence: AnomalyEvidence[] = [
      {
        feature: "financial.sanctioned_amount",
        observedValue: `₹${amountCrores} Cr`,
        referenceValue: `₹${baselineCrores} Cr`,
        direction: "below_expected",
        explanation: `Allocated limit of ₹${amountCrores} Cr is notably below the ₹${baselineCrores} Cr baseline (${divergencePct}%).`,
      },
    ];

    signals.push({
      projectCode: record.project_code,
      detectorId: "RULE_ALLOCATION_LIMIT_OUTLIER",
      detectorVersion: "1.0.0",
      signalType: "ALLOCATION_LIMIT_OUTLIER",
      severity: "MEDIUM",
      score: 0.62,
      confidence: "Verified Official Source Outlier",
      evidence,
      affectedFeatures: ["financial.sanctioned_amount", "baseline_divergence_pct"],
      explanation: `Allocated limit of ₹${amountCrores} Cr represents an unusually low allocation ceiling (${divergencePct}% below standard ₹${baselineCrores} Cr baseline). Audit verification recommended to ensure full entitlement release.`,
      generatedAt: new Date().toISOString(),
    });
  }

  return signals;
}

/**
 * Detects zero or missing allocation limits in source data (e.g. Nanded vacancy).
 */
export function detectOfficialCompletenessRule(
  record: FeatureRecord
): AnomalySignal[] {
  const signals: AnomalySignal[] = [];
  const amount = record.financial.sanctioned_amount;

  if (amount === 0) {
    const evidence: AnomalyEvidence[] = [
      {
        feature: "financial.sanctioned_amount",
        observedValue: "₹0.00",
        referenceValue: "₹14.70 Cr",
        direction: "below_expected",
        explanation: "No allocated limit found in official source record (blank/zero amount entry).",
      },
      {
        feature: "data_completeness",
        observedValue: 0.0,
        referenceValue: 1.0,
        direction: "inconsistent",
        explanation: "Constituency record contains zero allocation. Requires administrative reconciliation.",
      },
    ];

    signals.push({
      projectCode: record.project_code,
      detectorId: "RULE_ALLOCATION_DATA_COMPLETENESS",
      detectorVersion: "1.0.0",
      signalType: "DATA_COMPLETENESS_SIGNAL",
      severity: "MEDIUM",
      score: 0.65,
      confidence: "Verified Source Missing Value",
      evidence,
      affectedFeatures: ["financial.sanctioned_amount", "data_completeness"],
      explanation: "Constituency record lists a ₹0.00 allocation ceiling. Field verification recommended to confirm parliamentary vacancy, by-election timing, or pending administrative installment.",
      generatedAt: new Date().toISOString(),
    });
  }

  return signals;
}

/**
 * Precomputes state-level medians across all official records.
 */
export function computeStateMedians(records: FeatureRecord[]): Map<string, number> {
  const stateAmounts = new Map<string, number[]>();
  for (const r of records) {
    const st = r.categorical.state;
    if (!stateAmounts.has(st)) {
      stateAmounts.set(st, []);
    }
    stateAmounts.get(st)!.push(r.financial.sanctioned_amount);
  }

  const medians = new Map<string, number>();
  for (const [st, amounts] of stateAmounts.entries()) {
    medians.set(st, calculateMedian(amounts));
  }
  return medians;
}

/**
 * Detects notable intra-state allocation disparity.
 */
export function detectOfficialStateDisparityRule(
  record: FeatureRecord,
  stateMedians: Map<string, number>
): AnomalySignal[] {
  const signals: AnomalySignal[] = [];
  const amount = record.financial.sanctioned_amount;
  const state = record.categorical.state;
  const stateMedian = stateMedians.get(state) || BASELINE_ALLOCATION_INR;

  if (amount <= 0 || stateMedian <= 0) return signals;

  const disparityPct = Number((((amount - stateMedian) / stateMedian) * 100).toFixed(1));

  // If allocation diverges from state median by >= 35%
  if (Math.abs(disparityPct) >= 35.0) {
    const amountCr = (amount / 1e7).toFixed(2);
    const stateMedianCr = (stateMedian / 1e7).toFixed(2);

    const evidence: AnomalyEvidence[] = [
      {
        feature: "state_disparity_pct",
        observedValue: `₹${amountCr} Cr (${disparityPct > 0 ? "+" : ""}${disparityPct}%)`,
        referenceValue: `₹${stateMedianCr} Cr (${state} Median)`,
        direction: disparityPct > 0 ? "above_expected" : "below_expected",
        explanation: `Constituency allocation diverges by ${disparityPct > 0 ? "+" : ""}${disparityPct}% from the state median allocation in ${state}.`,
      },
    ];

    signals.push({
      projectCode: record.project_code,
      detectorId: "RULE_STATE_ALLOCATION_DISPARITY",
      detectorVersion: "1.0.0",
      signalType: "REGIONAL_DISPARITY_SIGNAL",
      severity: Math.abs(disparityPct) >= 60.0 ? "HIGH" : "MEDIUM",
      score: Math.min(0.85, 0.6 + (Math.abs(disparityPct) / 100) * 0.2),
      confidence: "Verified Intra-State Variance",
      evidence,
      affectedFeatures: ["financial.sanctioned_amount", "state_disparity_pct"],
      explanation: `Allocation of ₹${amountCr} Cr exhibits significant intra-state divergence from ${state}'s median MP allocation (₹${stateMedianCr} Cr). Review district allocation distribution formulas.`,
      generatedAt: new Date().toISOString(),
    });
  }

  return signals;
}
