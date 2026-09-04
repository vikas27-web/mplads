/**
 * MPLAD SENTINEL — Phase 8 Missing Documentation Rule
 * Detects missing statutory milestone documents, lack of stage inspection certificates,
 * and low documentation completeness ratios.
 */

import type { FeatureRecord } from "../../features/types.ts";
import type { AnomalySignal, AnomalyEvidence } from "../types.ts";
import { RULE_THRESHOLDS } from "../config.ts";

export function detectMissingDocumentation(
  features: FeatureRecord
): AnomalySignal[] {
  const signals: AnomalySignal[] = [];
  const doc = features.documentation;
  const phys = features.physical;
  const cfg = RULE_THRESHOLDS.documentation;

  // Check 1: Missing stage progress certificate when physical progress has advanced
  if (
    doc.has_stage_certificate === 0 &&
    phys.reported_physical_progress >= cfg.stageCertRequiredMinProgress
  ) {
    const evidence: AnomalyEvidence[] = [
      {
        feature: "documentation.has_stage_certificate",
        observedValue: 0,
        referenceValue: 1,
        direction: "inconsistent",
        explanation: "Mandatory Stage Completion / Physical Inspection Certificate is missing or unverified.",
      },
      {
        feature: "physical.reported_physical_progress",
        observedValue: phys.reported_physical_progress,
        referenceValue: cfg.stageCertRequiredMinProgress,
        direction: "above_expected",
        explanation: `Project has reported ${phys.reported_physical_progress}% physical completion without an official stage certificate.`,
      },
      {
        feature: "documentation.missing_document_count",
        observedValue: doc.missing_document_count,
        referenceValue: 0,
        direction: "above_expected",
        explanation: `${doc.missing_document_count} mandatory statutory files remain unverified in the portal.`,
      },
    ];

    signals.push({
      projectCode: features.project_code,
      detectorId: "RULE_MISSING_DOCUMENTATION",
      detectorVersion: "1.0.0",
      signalType: "MISSING_DOCUMENTATION",
      severity: "HIGH",
      score: 0.8,
      confidence: "Statutory checklist verification",
      evidence,
      affectedFeatures: [
        "documentation.has_stage_certificate",
        "physical.reported_physical_progress",
        "documentation.missing_document_count",
      ],
      explanation: `Project reports ${phys.reported_physical_progress}% physical progress without an official certified Stage Progress Inspection report on record. Human audit verification required.`,
      generatedAt: "2026-09-04T00:00:00.000Z",
    });
  }

  // Check 2: Low documentation completeness ratio (< 70% verified documents)
  if (doc.documentation_completeness_ratio < cfg.lowCompletenessRatio) {
    const completenessPct = (doc.documentation_completeness_ratio * 100).toFixed(1);
    const isCritical = doc.documentation_completeness_ratio <= cfg.criticalCompletenessRatio;

    const evidence: AnomalyEvidence[] = [
      {
        feature: "documentation.documentation_completeness_ratio",
        observedValue: doc.documentation_completeness_ratio,
        referenceValue: cfg.lowCompletenessRatio,
        direction: "below_expected",
        explanation: `Only ${completenessPct}% of required statutory documents have reached verified status (${doc.verified_document_count}/${doc.document_count}).`,
      },
    ];

    signals.push({
      projectCode: features.project_code,
      detectorId: "RULE_MISSING_DOCUMENTATION",
      detectorVersion: "1.0.0",
      signalType: "MISSING_DOCUMENTATION",
      severity: isCritical ? "CRITICAL" : "MEDIUM",
      score: isCritical ? 0.9 : 0.65,
      confidence: "Statutory documentation completeness ratio",
      evidence,
      affectedFeatures: [
        "documentation.documentation_completeness_ratio",
        "documentation.verified_document_count",
        "documentation.document_count",
      ],
      explanation: `Only ${completenessPct}% of statutory audit documents have been formally uploaded and verified. Mandatory document submission verification recommended.`,
      generatedAt: "2026-09-04T00:00:00.000Z",
    });
  }

  return signals;
}
