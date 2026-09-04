/**
 * MPLAD SENTINEL — Physical-Financial Mismatch Rule
 * Detects severe divergence where financial capital burn outpaces verified on-site engineering progress.
 */

import type { FeatureRecord } from "../../features/types.ts";
import type { AnomalySignal, AnomalyEvidence } from "../types.ts";
import { RULE_THRESHOLDS } from "../config.ts";

export function detectPhysicalFinancialMismatch(
  features: FeatureRecord
): AnomalySignal[] {
  const signals: AnomalySignal[] = [];
  const cross = features.cross_domain;
  const fin = features.financial;
  const phys = features.physical;
  const cfg = RULE_THRESHOLDS.physicalFinancial;

  const gap = cross.financial_progress_vs_physical_progress_gap;
  const financialBurnPct = Number((fin.expenditure_to_sanction_ratio * 100).toFixed(1));

  if (gap >= cfg.criticalGapPct) {
    const evidence: AnomalyEvidence[] = [
      {
        feature: "cross_domain.financial_progress_vs_physical_progress_gap",
        observedValue: gap,
        referenceValue: cfg.highGapPct,
        direction: "above_expected",
        explanation: `Financial burn rate leads on-site physical progress by ${gap.toFixed(1)} percentage points.`,
      },
      {
        feature: "financial.expenditure_to_sanction_ratio",
        observedValue: fin.expenditure_to_sanction_ratio,
        referenceValue: phys.reported_physical_progress / 100,
        direction: "above_expected",
        explanation: `${financialBurnPct}% of total sanctioned allocation has been booked as expenditure.`,
      },
      {
        feature: "physical.reported_physical_progress",
        observedValue: phys.reported_physical_progress,
        referenceValue: Math.max(0, financialBurnPct - cfg.highGapPct),
        direction: "below_expected",
        explanation: `Reported physical progress stands at only ${phys.reported_physical_progress}%.`,
      },
    ];

    signals.push({
      projectCode: features.project_code,
      detectorId: "RULE_PHYSICAL_FINANCIAL_MISMATCH",
      detectorVersion: "1.0.0",
      signalType: "PHYSICAL_FINANCIAL_MISMATCH",
      severity: "CRITICAL",
      score: 0.95,
      confidence: "High empirical divergence",
      evidence,
      affectedFeatures: [
        "cross_domain.financial_progress_vs_physical_progress_gap",
        "financial.expenditure_to_sanction_ratio",
        "physical.reported_physical_progress",
      ],
      explanation: `Severe physical-financial divergence of ${gap.toFixed(1)} percentage points observed between booked expenditure and physical milestones. Immediate site inspection recommended.`,
      generatedAt: "2026-09-04T00:00:00.000Z",
    });
  } else if (gap >= cfg.highGapPct) {
    const evidence: AnomalyEvidence[] = [
      {
        feature: "cross_domain.financial_progress_vs_physical_progress_gap",
        observedValue: gap,
        referenceValue: cfg.highGapPct,
        direction: "above_expected",
        explanation: `Financial drawdown leads physical milestones by ${gap.toFixed(1)} percentage points.`,
      },
      {
        feature: "financial.expenditure_amount",
        observedValue: fin.expenditure_amount,
        referenceValue: Math.round(fin.sanctioned_amount * (phys.reported_physical_progress / 100)),
        direction: "above_expected",
        explanation: `INR ${fin.expenditure_amount.toLocaleString("en-IN")} expended against ${phys.reported_physical_progress}% physical progress.`,
      },
    ];

    signals.push({
      projectCode: features.project_code,
      detectorId: "RULE_PHYSICAL_FINANCIAL_MISMATCH",
      detectorVersion: "1.0.0",
      signalType: "PHYSICAL_FINANCIAL_MISMATCH",
      severity: "HIGH",
      score: 0.8,
      confidence: "Moderate empirical divergence",
      evidence,
      affectedFeatures: [
        "cross_domain.financial_progress_vs_physical_progress_gap",
        "financial.expenditure_amount",
        "physical.reported_physical_progress",
      ],
      explanation: `Substantial gap of ${gap.toFixed(1)}% between financial outlay and engineering progress. Measurement book review recommended.`,
      generatedAt: "2026-09-04T00:00:00.000Z",
    });
  }

  return signals;
}
