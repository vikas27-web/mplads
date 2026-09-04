/**
 * MPLAD SENTINEL — Timeline Inconsistency Rule
 * Detects milestone chronological inversions, officially classified delayed works,
 * and severely stalled execution timelines.
 */

import type { FeatureRecord } from "../../features/types.ts";
import type { AnomalySignal, AnomalyEvidence } from "../types.ts";
import { RULE_THRESHOLDS } from "../config.ts";

export function detectTimelineInconsistency(
  features: FeatureRecord
): AnomalySignal[] {
  const signals: AnomalySignal[] = [];
  const temp = features.temporal;
  const phys = features.physical;
  const cat = features.categorical;
  const cross = features.cross_domain;
  const cfg = RULE_THRESHOLDS.timeline;

  // Check 1: Inverted sequence (start date precedes sanction date)
  if (temp.days_sanction_to_start < cfg.invertedMilestoneDays) {
    const evidence: AnomalyEvidence[] = [
      {
        feature: "temporal.days_sanction_to_start",
        observedValue: temp.days_sanction_to_start,
        referenceValue: 0,
        direction: "inconsistent",
        explanation: `Work commencement recorded ${Math.abs(temp.days_sanction_to_start)} days prior to formal administrative sanction order.`,
      },
    ];

    signals.push({
      projectCode: features.project_code,
      detectorId: "RULE_TIMELINE_INCONSISTENCY",
      detectorVersion: "1.0.0",
      signalType: "TIMELINE_INCONSISTENCY",
      severity: "HIGH",
      score: 0.85,
      confidence: "Deterministic date sequencing check",
      evidence,
      affectedFeatures: ["temporal.days_sanction_to_start"],
      explanation: "Ground work commencement date is recorded prior to formal administrative sanction issuance. Procedural audit recommended.",
      generatedAt: "2026-09-04T00:00:00.000Z",
    });
  }

  // Check 2: Officially designated Delayed Status
  if (cat.status === cfg.flaggedDelayedStatus) {
    const evidence: AnomalyEvidence[] = [
      {
        feature: "categorical.status",
        observedValue: cat.status,
        referenceValue: "In Progress / Completed",
        direction: "inconsistent",
        explanation: `Project has been administratively designated as "${cat.status}".`,
      },
      {
        feature: "physical.schedule_delay_days",
        observedValue: phys.schedule_delay_days,
        referenceValue: 0,
        direction: "above_expected",
        explanation: `Project has exceeded planned completion deadline by ${phys.schedule_delay_days} days.`,
      },
    ];

    signals.push({
      projectCode: features.project_code,
      detectorId: "RULE_TIMELINE_INCONSISTENCY",
      detectorVersion: "1.0.0",
      signalType: "TIMELINE_INCONSISTENCY",
      severity: "HIGH",
      score: 0.75,
      confidence: "Official administrative record",
      evidence,
      affectedFeatures: ["categorical.status", "physical.schedule_delay_days"],
      explanation: `Project is officially classified as "${cat.status}" with ${phys.schedule_delay_days} days past scheduled deadline. Progress review recommended.`,
      generatedAt: "2026-09-04T00:00:00.000Z",
    });
  } else if (
    cross.elapsed_time_ratio >= cfg.stalledExecutionRatio &&
    phys.reported_physical_progress <= cfg.stalledExecutionMaxProgress
  ) {
    // Check 3: Stalled execution
    const evidence: AnomalyEvidence[] = [
      {
        feature: "cross_domain.elapsed_time_ratio",
        observedValue: cross.elapsed_time_ratio,
        referenceValue: 1.5,
        direction: "above_expected",
        explanation: `Elapsed calendar duration is ${cross.elapsed_time_ratio.toFixed(1)}x the originally planned window.`,
      },
      {
        feature: "physical.reported_physical_progress",
        observedValue: phys.reported_physical_progress,
        referenceValue: 50,
        direction: "below_expected",
        explanation: `Physical progress remains at ${phys.reported_physical_progress}%.`,
      },
    ];

    signals.push({
      projectCode: features.project_code,
      detectorId: "RULE_TIMELINE_INCONSISTENCY",
      detectorVersion: "1.0.0",
      signalType: "TIMELINE_INCONSISTENCY",
      severity: "MEDIUM",
      score: 0.6,
      confidence: "Duration vs milestone ratio",
      evidence,
      affectedFeatures: [
        "cross_domain.elapsed_time_ratio",
        "physical.reported_physical_progress",
      ],
      explanation: `Elapsed time is ${cross.elapsed_time_ratio.toFixed(1)}x planned duration, but physical completion has reached only ${phys.reported_physical_progress}%. Inspection recommended.`,
      generatedAt: "2026-09-04T00:00:00.000Z",
    });
  }

  return signals;
}
