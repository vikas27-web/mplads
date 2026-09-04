/**
 * MPLAD SENTINEL — Phase 8 Contractor Concentration Rule
 * Detects disproportionate contractor concentration where a single commercial contractor
 * holds an unusually high market share of sanctioned works within a district or statewide.
 */

import type { FeatureRecord } from "../../features/types.ts";
import type { AnomalySignal, AnomalyEvidence } from "../types.ts";
import { RULE_THRESHOLDS } from "../config.ts";

export function detectContractorConcentration(
  features: FeatureRecord
): AnomalySignal[] {
  const signals: AnomalySignal[] = [];
  const con = features.contractor;
  const cat = features.categorical;
  const cfg = RULE_THRESHOLDS.contractor;

  const districtShare = con.contractor_district_share_percentage;
  const totalProjects = con.contractor_total_projects;

  // Check 1: High district concentration combined with dominant statewide volume
  if (
    districtShare >= cfg.districtShareCriticalPct &&
    totalProjects >= cfg.criticalStatewideProjectsCount
  ) {
    const evidence: AnomalyEvidence[] = [
      {
        feature: "contractor.contractor_district_share_percentage",
        observedValue: districtShare,
        referenceValue: cfg.districtShareCriticalPct,
        direction: "above_expected",
        explanation: `${cat.contractor_name} holds ${districtShare.toFixed(1)}% of all active MPLAD works sanctioned in ${cat.district} district.`,
      },
      {
        feature: "contractor.contractor_total_projects",
        observedValue: totalProjects,
        referenceValue: cfg.criticalStatewideProjectsCount,
        direction: "above_expected",
        explanation: `Contractor is executing ${totalProjects} total works statewide with cumulative sanctions of INR ${con.contractor_total_sanctioned_amount.toLocaleString("en-IN")}.`,
      },
    ];

    signals.push({
      projectCode: features.project_code,
      detectorId: "RULE_CONTRACTOR_CONCENTRATION",
      detectorVersion: "1.0.0",
      signalType: "CONTRACTOR_CONCENTRATION",
      severity: "HIGH",
      score: 0.85,
      confidence: "District market share analysis",
      evidence,
      affectedFeatures: [
        "contractor.contractor_district_share_percentage",
        "contractor.contractor_total_projects",
        "categorical.contractor_name",
        "categorical.district",
      ],
      explanation: `Vendor holds ${districtShare.toFixed(1)}% of all public works in ${cat.district} across a dominant portfolio of ${totalProjects} statewide works. Review of open competitive e-tendering documentation recommended.`,
      generatedAt: "2026-09-04T00:00:00.000Z",
    });
  } else if (districtShare >= cfg.districtShareHighPct) {
    // Check 2: Standalone elevated district concentration
    const evidence: AnomalyEvidence[] = [
      {
        feature: "contractor.contractor_district_share_percentage",
        observedValue: districtShare,
        referenceValue: cfg.districtShareHighPct,
        direction: "above_expected",
        explanation: `${cat.contractor_name} manages ${districtShare.toFixed(1)}% of works in ${cat.district}.`,
      },
    ];

    signals.push({
      projectCode: features.project_code,
      detectorId: "RULE_CONTRACTOR_CONCENTRATION",
      detectorVersion: "1.0.0",
      signalType: "CONTRACTOR_CONCENTRATION",
      severity: "MEDIUM",
      score: 0.65,
      confidence: "District allotment distribution",
      evidence,
      affectedFeatures: [
        "contractor.contractor_district_share_percentage",
        "categorical.contractor_name",
      ],
      explanation: `Vendor holds an elevated share (${districtShare.toFixed(1)}%) of public works in ${cat.district}. Procurement distribution review recommended.`,
      generatedAt: "2026-09-04T00:00:00.000Z",
    });
  }

  return signals;
}
