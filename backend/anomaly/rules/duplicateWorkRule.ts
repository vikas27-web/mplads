/**
 * MPLAD SENTINEL — Phase 8 Duplicate Work Rule
 * Detects suspicious similarity and potential duplicate public works sanctioned
 * in the same constituency with identical work category and near-identical budget outlays.
 */

import type { FeatureRecord } from "../../features/types.ts";
import type { AnomalySignal, AnomalyEvidence } from "../types.ts";
import { RULE_THRESHOLDS } from "../config.ts";

export function detectDuplicateWork(
  features: FeatureRecord,
  allFeatures?: FeatureRecord[]
): AnomalySignal[] {
  const signals: AnomalySignal[] = [];
  if (!allFeatures || allFeatures.length === 0) {
    return signals;
  }

  const { constituency, district, work_category } = features.categorical;
  const { sanctioned_amount } = features.financial;
  const cfg = RULE_THRESHOLDS.duplicate;

  const peers = allFeatures.filter(
    (p) =>
      p.project_code !== features.project_code &&
      p.categorical.constituency === constituency &&
      p.categorical.work_category === work_category
  );

  for (const peer of peers) {
    const peerAmount = peer.financial.sanctioned_amount;
    const amountDelta = Math.abs(sanctioned_amount - peerAmount);
    const deltaRatio = sanctioned_amount > 0 ? amountDelta / sanctioned_amount : 1.0;

    if (deltaRatio <= cfg.maxAmountDeltaRatio) {
      const evidence: AnomalyEvidence[] = [
        {
          feature: "categorical.work_category",
          observedValue: work_category,
          referenceValue: peer.categorical.work_category,
          direction: "inconsistent",
          explanation: `Identical civil work classification "${work_category}" sanctioned in ${constituency}.`,
        },
        {
          feature: "financial.sanctioned_amount",
          observedValue: sanctioned_amount,
          referenceValue: peerAmount,
          direction: "inconsistent",
          explanation: `Sanctioned outlay difference is ${(deltaRatio * 100).toFixed(2)}% compared to peer ${peer.project_code} (INR ${peerAmount.toLocaleString("en-IN")}).`,
        },
        {
          feature: "categorical.constituency",
          observedValue: constituency,
          referenceValue: peer.categorical.constituency,
          direction: "inconsistent",
          explanation: `Both works located in ${constituency} parliamentary constituency (${district} district).`,
        },
      ];

      signals.push({
        projectCode: features.project_code,
        detectorId: "RULE_DUPLICATE_WORK",
        detectorVersion: "1.0.0",
        signalType: "DUPLICATE_SIGNAL",
        severity: "HIGH",
        score: 0.85,
        confidence: "Constituency outlay similarity match",
        evidence,
        affectedFeatures: [
          "categorical.work_category",
          "categorical.constituency",
          "financial.sanctioned_amount",
        ],
        explanation: `Project shares identical work classification and near-identical budget with ${peer.project_code} in ${constituency}. Physical site verification recommended to confirm distinct GPS locations.`,
        generatedAt: "2026-09-04T00:00:00.000Z",
      });
      break; // One primary match is sufficient
    }
  }

  return signals;
}
