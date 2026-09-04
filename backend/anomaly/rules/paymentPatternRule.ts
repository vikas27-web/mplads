/**
 * MPLAD SENTINEL — Payment Pattern Signal Rule
 * Detects unusual payment sequencing, accumulated pending tranches,
 * and disbursements executed without prior inspection logs.
 */

import type { FeatureRecord } from "../../features/types.ts";
import type { AnomalySignal, AnomalyEvidence } from "../types.ts";
import { RULE_THRESHOLDS } from "../config.ts";

export function detectPaymentPattern(features: FeatureRecord): AnomalySignal[] {
  const signals: AnomalySignal[] = [];
  const pay = features.payment;
  const cross = features.cross_domain;
  const phys = features.physical;
  const cfg = RULE_THRESHOLDS.payment;

  // Check 1: High pending payment accumulation
  const pendingRatio =
    pay.payment_count > 0 ? pay.pending_payment_count / pay.payment_count : 0;

  if (pay.pending_payment_count > 0 && pendingRatio >= cfg.highPendingRatio) {
    const evidence: AnomalyEvidence[] = [
      {
        feature: "payment.pending_payment_count",
        observedValue: pay.pending_payment_count,
        referenceValue: 0,
        direction: "above_expected",
        explanation: `${pay.pending_payment_count} out of ${pay.payment_count} total payment tranches are pending clearance.`,
      },
      {
        feature: "payment.disbursed_payment_ratio",
        observedValue: pay.disbursed_payment_ratio,
        referenceValue: 1.0,
        direction: "below_expected",
        explanation: `Only ${(pay.disbursed_payment_ratio * 100).toFixed(1)}% of recorded payments have reached disbursed status.`,
      },
    ];

    signals.push({
      projectCode: features.project_code,
      detectorId: "RULE_PAYMENT_PATTERN",
      detectorVersion: "1.0.0",
      signalType: "PAYMENT_PATTERN_SIGNAL",
      severity: "HIGH",
      score: 0.8,
      confidence: "Gateway clearance records",
      evidence,
      affectedFeatures: [
        "payment.pending_payment_count",
        "payment.disbursed_payment_ratio",
        "payment.payment_count",
      ],
      explanation: `${pay.pending_payment_count} payment tranches remain marked as pending clearance or withheld in banking gateway. Treasury reconciliation recommended.`,
      generatedAt: "2026-09-04T00:00:00.000Z",
    });
  }

  // Check 2: Advance disbursement prior to foundation inspection
  if (
    cross.disbursement_prior_to_progress_flag === 1 &&
    phys.reported_physical_progress <= cfg.advanceDisbursementMaxProgress &&
    pay.days_to_first_payment !== null &&
    pay.days_to_first_payment <= cfg.advanceDisbursementMaxDays
  ) {
    const evidence: AnomalyEvidence[] = [
      {
        feature: "cross_domain.disbursement_prior_to_progress_flag",
        observedValue: 1,
        referenceValue: 0,
        direction: "inconsistent",
        explanation: "Initial payment tranche was disbursed on a date preceding the first recorded site inspection visit.",
      },
      {
        feature: "payment.days_to_first_payment",
        observedValue: pay.days_to_first_payment,
        referenceValue: cfg.advanceDisbursementMaxDays,
        direction: "below_expected",
        explanation: `First payment issued ${pay.days_to_first_payment} days following ground mobilization.`,
      },
    ];

    signals.push({
      projectCode: features.project_code,
      detectorId: "RULE_PAYMENT_PATTERN",
      detectorVersion: "1.0.0",
      signalType: "PAYMENT_PATTERN_SIGNAL",
      severity: "MEDIUM",
      score: 0.65,
      confidence: "Chronological transaction sequence",
      evidence,
      affectedFeatures: [
        "cross_domain.disbursement_prior_to_progress_flag",
        "payment.days_to_first_payment",
      ],
      explanation: "Capital disbursement occurred prior to the first recorded site inspection certificate with preliminary physical progress. Mobilization advance verification recommended.",
      generatedAt: "2026-09-04T00:00:00.000Z",
    });
  }

  return signals;
}
