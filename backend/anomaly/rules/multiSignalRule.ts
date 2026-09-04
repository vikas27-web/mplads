/**
 * MPLAD SENTINEL — Phase 8 Multi-Signal Rule
 * Generates MULTI_SIGNAL only when >=2 independent primary detector domains trigger
 * concurrently for the same project.
 */

import type { AnomalySignal, AnomalyEvidence, Severity, SignalType } from "../types.ts";

export function detectMultiSignal(
  projectCode: string,
  existingSignals: AnomalySignal[]
): AnomalySignal | null {
  // Collect distinct primary signal domains (excluding MULTI_SIGNAL itself)
  const primaryTypes = new Set<SignalType>();
  for (const s of existingSignals) {
    if (s.signalType !== "MULTI_SIGNAL") {
      primaryTypes.add(s.signalType);
    }
  }

  if (primaryTypes.size < 2) {
    return null;
  }

  // Determine severity: if any constituent signal is CRITICAL, or if >= 3 domains trigger -> CRITICAL, else HIGH
  const hasCritical = existingSignals.some((s) => s.severity === "CRITICAL");
  const severity: Severity = hasCritical || primaryTypes.size >= 3 ? "CRITICAL" : "HIGH";

  // Score computation: deterministic combination bounded strictly to [0, 1]
  const maxScore = Math.max(...existingSignals.map((s) => s.score));
  const multiScore = Math.min(1.0, Number((maxScore + 0.05 * (primaryTypes.size - 1)).toFixed(3)));

  // Combine unique affected features
  const affectedFeaturesSet = new Set<string>();
  for (const s of existingSignals) {
    for (const feat of s.affectedFeatures) {
      affectedFeaturesSet.add(feat);
    }
  }

  const distinctDomains = Array.from(primaryTypes).sort();
  const evidence: AnomalyEvidence[] = distinctDomains.map((domain) => {
    const matchingSignals = existingSignals.filter((s) => s.signalType === domain);
    const topSignal = matchingSignals[0];
    return {
      feature: topSignal.affectedFeatures[0] || domain,
      observedValue: domain,
      referenceValue: "NORMAL_BASELINE",
      direction: "inconsistent",
      explanation: `${domain} domain flagged with severity ${topSignal.severity} (${topSignal.detectorId}).`,
    };
  });

  return {
    projectCode,
    detectorId: "RULE_MULTI_SIGNAL",
    detectorVersion: "1.0.0",
    signalType: "MULTI_SIGNAL",
    severity,
    score: multiScore,
    confidence: `Concurrent cross-domain triggers across ${primaryTypes.size} independent domains`,
    evidence,
    affectedFeatures: Array.from(affectedFeaturesSet).sort(),
    explanation: `Multiple (${primaryTypes.size}) independent anomaly domains triggered concurrently (${distinctDomains.join(", ")}). Comprehensive multi-domain physical and audit verification recommended.`,
    generatedAt: "2026-09-04T00:00:00.000Z",
  };
}
