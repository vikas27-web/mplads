/**
 * MPLAD SENTINEL — Phase 8 Expenditure Shift Rule
 * Detects abnormal treasury release drawdowns, expenditure exceeding release ceilings,
 * and near-total budget depletion while work execution remains preliminary.
 */

import type { FeatureRecord } from "../../features/types.ts";
import type { AnomalySignal, AnomalyEvidence } from "../types.ts";
import { RULE_THRESHOLDS } from "../config.ts";

export function detectExpenditureShift(features: FeatureRecord): AnomalySignal[] {
  const signals: AnomalySignal[] = [];
  const fin = features.financial;
  const phys = features.physical;
  const cfg = RULE_THRESHOLDS.expenditure;

  // Check 1: Expenditure exceeds released allocation
  if (fin.expenditure_to_release_ratio > cfg.expenditureExceedsReleaseRatio) {
    const evidence: AnomalyEvidence[] = [
      {
        feature: "financial.expenditure_amount",
        observedValue: fin.expenditure_amount,
        referenceValue: fin.released_amount,
        direction: "above_expected",
        explanation: `Booked expenditure exceeds available cumulative releases by INR ${(fin.expenditure_amount - fin.released_amount).toLocaleString("en-IN")}.`,
      },
      {
        feature: "financial.expenditure_to_release_ratio",
        observedValue: fin.expenditure_to_release_ratio,
        referenceValue: cfg.expenditureExceedsReleaseRatio,
        direction: "above_expected",
        explanation: `Expenditure ratio is ${(fin.expenditure_to_release_ratio * 100).toFixed(1)}% of released allocation.`,
      },
    ];

    signals.push({
      projectCode: features.project_code,
      detectorId: "RULE_EXPENDITURE_SHIFT",
      detectorVersion: "1.0.0",
      signalType: "EXPENDITURE_SHIFT",
      severity: "CRITICAL",
      score: 0.95,
      confidence: "Treasury release vs expenditure ledger",
      evidence,
      affectedFeatures: [
        "financial.expenditure_amount",
        "financial.released_amount",
        "financial.expenditure_to_release_ratio",
      ],
      explanation: "Booked expenditure exceeds total funds released by treasury to nodal agency. Accounting reconciliation required.",
      generatedAt: "2026-09-04T00:00:00.000Z",
    });
  } else if (
    fin.expenditure_to_release_ratio >= cfg.expenditureExceedsReleaseRatio &&
    phys.is_completed === 0
  ) {
    // Check 2: 100% of released funds expended while work remains incomplete
    const evidence: AnomalyEvidence[] = [
      {
        feature: "financial.expenditure_to_release_ratio",
        observedValue: fin.expenditure_to_release_ratio,
        referenceValue: 1.0,
        direction: "above_expected",
        explanation: "100.0% of cumulative treasury releases have been drawn down and expended.",
      },
      {
        feature: "physical.is_completed",
        observedValue: phys.is_completed,
        referenceValue: 1,
        direction: "below_expected",
        explanation: `Project remains incomplete (${phys.reported_physical_progress}% progress) with zero unexpended release headroom remaining.`,
      },
    ];

    signals.push({
      projectCode: features.project_code,
      detectorId: "RULE_EXPENDITURE_SHIFT",
      detectorVersion: "1.0.0",
      signalType: "EXPENDITURE_SHIFT",
      severity: "HIGH",
      score: 0.8,
      confidence: "Release headroom ledger balance",
      evidence,
      affectedFeatures: [
        "financial.expenditure_to_release_ratio",
        "financial.remaining_released_amount",
        "physical.reported_physical_progress",
      ],
      explanation: "Total cumulative treasury releases have been booked as expenditure prior to final project completion. Verification of milestone measurement recommended.",
      generatedAt: "2026-09-04T00:00:00.000Z",
    });
  }

  // Check 3: Early rapid expenditure shift (high burn with early-stage physical progress)
  if (
    fin.expenditure_to_sanction_ratio >= cfg.earlyHighBurnRatio &&
    phys.reported_physical_progress <= cfg.earlyHighBurnMaxProgress
  ) {
    const evidence: AnomalyEvidence[] = [
      {
        feature: "financial.expenditure_to_sanction_ratio",
        observedValue: fin.expenditure_to_sanction_ratio,
        referenceValue: cfg.earlyHighBurnRatio,
        direction: "above_expected",
        explanation: `${(fin.expenditure_to_sanction_ratio * 100).toFixed(1)}% of sanctioned budget has been disbursed.`,
      },
      {
        feature: "physical.reported_physical_progress",
        observedValue: phys.reported_physical_progress,
        referenceValue: cfg.earlyHighBurnMaxProgress,
        direction: "below_expected",
        explanation: `Reported physical execution stands at only ${phys.reported_physical_progress}%.`,
      },
    ];

    signals.push({
      projectCode: features.project_code,
      detectorId: "RULE_EXPENDITURE_SHIFT",
      detectorVersion: "1.0.0",
      signalType: "EXPENDITURE_SHIFT",
      severity: "HIGH",
      score: 0.85,
      confidence: "Budget burn vs physical progress ratio",
      evidence,
      affectedFeatures: [
        "financial.expenditure_to_sanction_ratio",
        "physical.reported_physical_progress",
        "financial.expenditure_amount",
      ],
      explanation: "Near-total financial drawdown observed while physical execution remains in preliminary stages. On-site verification recommended.",
      generatedAt: "2026-09-04T00:00:00.000Z",
    });
  }

  return signals;
}
