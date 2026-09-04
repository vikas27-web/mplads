/**
 * MPLAD SENTINEL — Phase 8 Comprehensive Anomaly Engine Tests
 *
 * Covers 20 rigorous test domains:
 * 1. Rule detector output schema
 * 2. Physical-financial rule
 * 3. Timeline rule
 * 4. Payment rule
 * 5. Expenditure rule
 * 6. Duplicate rule
 * 7. Contractor concentration rule
 * 8. Documentation rule
 * 9. Multi-signal rule
 * 10. Median calculation
 * 11. MAD calculation
 * 12. Statistical outlier detection
 * 13. Isolation Forest determinism
 * 14. Isolation Forest score bounds
 * 15. Feature matrix anti-leakage
 * 16. Validator anti-leakage
 * 17. Forbidden terminology validation
 * 18. Complete engine execution
 * 19. Exactly 300 results
 * 20. Deterministic pipeline output
 */

import test from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";

import type { FeatureRecord } from "../../features/types.ts";
import type { AnomalySignal, AnomalyResult } from "../types.ts";
import { detectPhysicalFinancialMismatch } from "../rules/physicalFinancialMismatchRule.ts";
import { detectTimelineInconsistency } from "../rules/timelineInconsistencyRule.ts";
import { detectPaymentPattern } from "../rules/paymentPatternRule.ts";
import { detectExpenditureShift } from "../rules/expenditureShiftRule.ts";
import { detectDuplicateWork } from "../rules/duplicateWorkRule.ts";
import { detectContractorConcentration } from "../rules/contractorConcentrationRule.ts";
import { detectMissingDocumentation } from "../rules/missingDocumentationRule.ts";
import { detectMultiSignal } from "../rules/multiSignalRule.ts";
import {
  calculateMedian,
  calculateMAD,
  calculateModifiedZScore,
  detectStatisticalOutliers,
} from "../statistical/robustStats.ts";
import { buildFeatureMatrix } from "../ml/featureMatrix.ts";
import {
  IsolationForest,
  averagePathLengthBST,
  createMulberry32,
  runIsolationForestDetection,
} from "../ml/isolationForest.ts";
import {
  validateAnomalySignal,
  validateAnomalyResult,
  validateAnomalyDataset,
} from "../validator.ts";
import { runAnomalyDetectionEngine } from "../engine.ts";
import { runAnomalyPipeline, loadProjectFeaturesFromDisk } from "../pipeline.ts";

const features = loadProjectFeaturesFromDisk();

test("1. Rule detector output schema conformity", () => {
  const sample = features[0];
  const signals = [
    ...detectPhysicalFinancialMismatch(sample),
    ...detectTimelineInconsistency(sample),
    ...detectPaymentPattern(sample),
    ...detectExpenditureShift(sample),
    ...detectDuplicateWork(sample, features),
    ...detectContractorConcentration(sample),
    ...detectMissingDocumentation(sample),
  ];

  for (const sig of signals) {
    const report = validateAnomalySignal(sig);
    assert.strictEqual(report.valid, true, `Schema violation: ${report.errors.join("; ")}`);
    assert.ok(sig.projectCode === sample.project_code);
    assert.ok(sig.score >= 0 && sig.score <= 1);
    assert.ok(Number.isFinite(sig.score));
    assert.ok(sig.evidence.length > 0);
    assert.ok(sig.affectedFeatures.length > 0);
    assert.ok(sig.explanation.length > 0);
  }
});

test("2. Physical-financial mismatch rule detection", () => {
  const testRec: FeatureRecord = JSON.parse(JSON.stringify(features[0]));
  // Force a 40 percentage point gap
  testRec.cross_domain.financial_progress_vs_physical_progress_gap = 40.0;
  testRec.financial.expenditure_to_sanction_ratio = 0.70;
  testRec.physical.reported_physical_progress = 30.0;

  const signals = detectPhysicalFinancialMismatch(testRec);
  assert.ok(signals.length > 0, "Should emit signal when gap >= 35%");
  const sig = signals[0];
  assert.strictEqual(sig.signalType, "PHYSICAL_FINANCIAL_MISMATCH");
  assert.strictEqual(sig.severity, "HIGH");
  assert.strictEqual(sig.score, 0.8);
  assert.ok(sig.affectedFeatures.includes("cross_domain.financial_progress_vs_physical_progress_gap"));

  // Critical threshold gap >= 50%
  testRec.cross_domain.financial_progress_vs_physical_progress_gap = 55.0;
  const critSignals = detectPhysicalFinancialMismatch(testRec);
  assert.strictEqual(critSignals[0].severity, "CRITICAL");
  assert.strictEqual(critSignals[0].score, 0.95);
});

test("3. Timeline inconsistency rule detection", () => {
  const testRec: FeatureRecord = JSON.parse(JSON.stringify(features[0]));

  // Chronological milestone inversion (start precedes sanction)
  testRec.temporal.days_sanction_to_start = -20;
  const invSignals = detectTimelineInconsistency(testRec);
  assert.ok(invSignals.some((s) => s.evidence.some((e) => e.direction === "inconsistent")));
  assert.strictEqual(invSignals[0].signalType, "TIMELINE_INCONSISTENCY");

  // Officially classified Delayed
  testRec.temporal.days_sanction_to_start = 15;
  testRec.categorical.status = "Delayed";
  testRec.physical.schedule_delay_days = 90;
  const delayedSignals = detectTimelineInconsistency(testRec);
  assert.ok(delayedSignals.length > 0);
  assert.strictEqual(delayedSignals[0].severity, "HIGH");
});

test("4. Payment pattern rule detection", () => {
  const testRec: FeatureRecord = JSON.parse(JSON.stringify(features[0]));

  // High pending payments
  testRec.payment.payment_count = 5;
  testRec.payment.pending_payment_count = 3; // 60% > 40% threshold
  testRec.payment.disbursed_payment_ratio = 0.4;
  const paySignals = detectPaymentPattern(testRec);
  assert.ok(paySignals.length > 0);
  assert.strictEqual(paySignals[0].signalType, "PAYMENT_PATTERN_SIGNAL");
  assert.strictEqual(paySignals[0].severity, "HIGH");
});

test("5. Expenditure shift rule detection", () => {
  const testRec: FeatureRecord = JSON.parse(JSON.stringify(features[0]));

  // Expenditure exceeding treasury release ceiling
  testRec.financial.expenditure_to_release_ratio = 1.15;
  testRec.financial.expenditure_amount = 1150000;
  testRec.financial.released_amount = 1000000;
  const excessSignals = detectExpenditureShift(testRec);
  assert.ok(excessSignals.length > 0);
  assert.strictEqual(excessSignals[0].severity, "CRITICAL");
  assert.strictEqual(excessSignals[0].signalType, "EXPENDITURE_SHIFT");
});

test("6. Duplicate work rule detection", () => {
  const testRecA: FeatureRecord = JSON.parse(JSON.stringify(features[0]));
  const testRecB: FeatureRecord = JSON.parse(JSON.stringify(features[0]));

  testRecA.project_code = "MPLAD-TEST-001";
  testRecB.project_code = "MPLAD-TEST-002";
  testRecA.categorical.constituency = "Varanasi";
  testRecB.categorical.constituency = "Varanasi";
  testRecA.categorical.work_category = "Community Center";
  testRecB.categorical.work_category = "Community Center";
  testRecA.financial.sanctioned_amount = 5000000;
  testRecB.financial.sanctioned_amount = 5050000; // 1% difference, <= 5% threshold

  const dupSignals = detectDuplicateWork(testRecA, [testRecA, testRecB]);
  assert.strictEqual(dupSignals.length, 1);
  assert.strictEqual(dupSignals[0].signalType, "DUPLICATE_SIGNAL");
  assert.strictEqual(dupSignals[0].severity, "HIGH");
});

test("7. Contractor concentration rule detection", () => {
  const testRec: FeatureRecord = JSON.parse(JSON.stringify(features[0]));

  testRec.contractor.contractor_district_share_percentage = 24.5;
  testRec.contractor.contractor_total_projects = 50;
  const conSignals = detectContractorConcentration(testRec);
  assert.strictEqual(conSignals.length, 1);
  assert.strictEqual(conSignals[0].signalType, "CONTRACTOR_CONCENTRATION");
  assert.strictEqual(conSignals[0].severity, "HIGH");
});

test("8. Missing documentation rule detection", () => {
  const testRec: FeatureRecord = JSON.parse(JSON.stringify(features[0]));

  // Progress >= 30% but no stage certificate
  testRec.physical.reported_physical_progress = 55.0;
  testRec.documentation.has_stage_certificate = 0;
  testRec.documentation.missing_document_count = 2;
  const docSignals = detectMissingDocumentation(testRec);
  assert.ok(docSignals.length > 0);
  assert.strictEqual(docSignals[0].signalType, "MISSING_DOCUMENTATION");
});

test("9. Multi-signal rule synthesis", () => {
  const sig1: AnomalySignal = {
    projectCode: "MPLAD-TEST-999",
    detectorId: "RULE_PHYSICAL_FINANCIAL_MISMATCH",
    detectorVersion: "1.0.0",
    signalType: "PHYSICAL_FINANCIAL_MISMATCH",
    severity: "HIGH",
    score: 0.8,
    evidence: [{ feature: "f1", observedValue: 10, referenceValue: 5, direction: "above", explanation: "test" }],
    affectedFeatures: ["cross_domain.gap"],
    explanation: "Test 1",
    generatedAt: "2026-09-04T00:00:00.000Z",
  };

  const sig2: AnomalySignal = {
    projectCode: "MPLAD-TEST-999",
    detectorId: "RULE_TIMELINE_INCONSISTENCY",
    detectorVersion: "1.0.0",
    signalType: "TIMELINE_INCONSISTENCY",
    severity: "HIGH",
    score: 0.85,
    evidence: [{ feature: "f2", observedValue: 20, referenceValue: 10, direction: "above", explanation: "test" }],
    affectedFeatures: ["temporal.delay"],
    explanation: "Test 2",
    generatedAt: "2026-09-04T00:00:00.000Z",
  };

  // Only 1 domain should NOT trigger multi-signal
  const single = detectMultiSignal("MPLAD-TEST-999", [sig1]);
  assert.strictEqual(single, null);

  // 2 distinct domains MUST trigger multi-signal
  const multi = detectMultiSignal("MPLAD-TEST-999", [sig1, sig2]);
  assert.ok(multi !== null);
  assert.strictEqual(multi.signalType, "MULTI_SIGNAL");
  assert.strictEqual(multi.severity, "HIGH");
  assert.ok(multi.score >= 0.85 && multi.score <= 1.0);
  assert.ok(multi.evidence.length === 2);
});

test("10. Exact median calculation", () => {
  assert.strictEqual(calculateMedian([1, 3, 5]), 3);
  assert.strictEqual(calculateMedian([1, 2, 4, 8]), 3);
  assert.strictEqual(calculateMedian([10]), 10);
  assert.strictEqual(calculateMedian([]), 0);
  assert.strictEqual(calculateMedian([7, 1, 9, 3, 5]), 5);
});

test("11. Exact MAD calculation and modified Z-scores", () => {
  const series = [2, 4, 4, 4, 5, 5, 7, 9];
  // Median of series: (4 + 5)/2 = 4.5
  // Deviations: |2-4.5|=2.5, |4-4.5|=0.5, 0.5, 0.5, 0.5, 0.5, |7-4.5|=2.5, |9-4.5|=4.5
  // Sorted deviations: [0.5, 0.5, 0.5, 0.5, 0.5, 2.5, 2.5, 4.5] -> Median = 0.5
  const mad = calculateMAD(series);
  assert.strictEqual(mad, 0.5);

  const zScore = calculateModifiedZScore(9, 4.5, 0.5);
  // (0.6745 * (9 - 4.5)) / 0.5 = (0.6745 * 4.5) / 0.5 = 6.0705
  assert.ok(Math.abs(zScore - 6.0705) < 0.001);

  // Safe zero-MAD handling
  const zeroMadSeries = [5, 5, 5, 5, 5];
  assert.strictEqual(calculateMAD(zeroMadSeries), 0);
  assert.strictEqual(calculateModifiedZScore(5, 5, 0), 0);
  assert.strictEqual(calculateModifiedZScore(10, 5, 0), 0);
});

test("12. Robust statistical outlier detection on dataset", () => {
  const resultsMap = detectStatisticalOutliers(features);
  assert.ok(resultsMap.size > 0, "Outliers should be identified across dataset");

  for (const [, signals] of resultsMap) {
    for (const sig of signals) {
      assert.strictEqual(sig.signalType, "STATISTICAL_OUTLIER");
      assert.ok(sig.score >= 0.6 && sig.score <= 1.0);
      assert.ok(sig.evidence[0].explanation.includes("Modified Z-score"));
    }
  }
});

test("13. Isolation Forest byte-for-byte determinism with seed 26102", () => {
  const matrix = buildFeatureMatrix(features);
  const data = matrix.rows.map((r) => r.vector);

  const forest1 = new IsolationForest(data, 50, 64, 26102);
  const forest2 = new IsolationForest(data, 50, 64, 26102);

  const scores1 = matrix.rows.slice(0, 20).map((r) => forest1.score(r.vector));
  const scores2 = matrix.rows.slice(0, 20).map((r) => forest2.score(r.vector));

  assert.deepStrictEqual(scores1, scores2, "Mulberry32 seed 26102 must guarantee exact identical scores");
});

test("14. Isolation Forest score bounds [0, 1] and c(n) math", () => {
  // Test c(n) formula
  assert.strictEqual(averagePathLengthBST(1), 0);
  assert.strictEqual(averagePathLengthBST(2), 1);
  const c128 = averagePathLengthBST(128);
  assert.ok(c128 > 8 && c128 < 11, `c(128) expected ~9.3, got ${c128}`);

  const matrix = buildFeatureMatrix(features.slice(0, 50));
  const forest = new IsolationForest(matrix.rows.map((r) => r.vector), 50, 32, 26102);

  for (const r of matrix.rows) {
    const sc = forest.score(r.vector);
    assert.ok(sc >= 0.0 && sc <= 1.0, `Score out of bounds: ${sc}`);
    assert.ok(Number.isFinite(sc), "Score must be finite");
  }
});

test("15. Strict anti-leakage in feature matrix", () => {
  const matrix = buildFeatureMatrix(features);

  // Check feature names
  for (const name of matrix.featureNames) {
    assert.ok(!name.toLowerCase().includes("scenario"), `Leakage in feature name: ${name}`);
    assert.ok(!name.toLowerCase().includes("fraud"), `Forbidden word in feature name: ${name}`);
  }

  // Check serialized rows
  const json = JSON.stringify(matrix);
  assert.ok(!json.includes("scenario_type"), "CRITICAL: scenario_type found in feature matrix");
  assert.ok(!json.includes("scenario_description"), "CRITICAL: scenario_description found in feature matrix");
});

test("16. Strict anti-leakage validation by validator.ts", () => {
  const validResult: AnomalyResult = {
    projectCode: "MPLAD-TEST-001",
    signals: [],
    overallSeverity: "LOW",
    overallSignalScore: 0.0,
    explanation: "Standard routine monitoring applies.",
    engineVersion: "1.0.0",
    featureVersion: "1.0.0",
  };

  assert.strictEqual(validateAnomalyResult(validResult).valid, true);

  // Contaminate with scenario_type
  const contaminated: any = {
    ...validResult,
    scenario_type: "PHYSICAL_FINANCIAL_MISMATCH",
  };

  const report = validateAnomalyResult(contaminated);
  assert.strictEqual(report.valid, false, "Validator must reject ground-truth leakage");
  assert.ok(report.errors.some((e) => e.includes("CRITICAL ANTI-LEAKAGE")));
});

test("17. Forbidden accusatory terminology validation", () => {
  const invalidResult: AnomalyResult = {
    projectCode: "MPLAD-TEST-001",
    signals: [],
    overallSeverity: "CRITICAL",
    overallSignalScore: 0.9,
    explanation: "This project is fraudulent and corrupt.",
    engineVersion: "1.0.0",
    featureVersion: "1.0.0",
  };

  const report = validateAnomalyResult(invalidResult);
  assert.strictEqual(report.valid, false, "Validator must reject forbidden accusatory terms");
  assert.ok(report.errors.some((e) => e.includes("RESPONSIBLE AI VIOLATION")));
});

test("18. Complete engine execution and output schema", () => {
  const results = runAnomalyDetectionEngine(features.slice(0, 20));
  assert.strictEqual(results.length, 20);

  for (const res of results) {
    const report = validateAnomalyResult(res);
    assert.strictEqual(report.valid, true, `Result validation failure: ${report.errors.join("; ")}`);
    assert.ok(res.overallSignalScore >= 0 && res.overallSignalScore <= 1);
    assert.ok(["LOW", "MEDIUM", "HIGH", "CRITICAL"].includes(res.overallSeverity));
  }
});

test("19. Exactly 300 projects processed in pipeline", () => {
  const pipelineRes = runAnomalyPipeline({ features });
  assert.strictEqual(pipelineRes.projectCount, 300, "Pipeline must evaluate exactly 300 projects");
  assert.strictEqual(pipelineRes.results.length, 300);
  assert.ok(pipelineRes.signalsCount > 0, "Signals should be generated");
  assert.ok(pipelineRes.projectsWithSignals > 0);
  assert.ok(pipelineRes.projectsWithoutSignals > 0);
});

test("20. Deterministic pipeline output across multiple runs", () => {
  const runA = runAnomalyDetectionEngine(features.slice(0, 30));
  const runB = runAnomalyDetectionEngine(features.slice(0, 30));

  assert.deepStrictEqual(
    runA,
    runB,
    "Engine must be 100% deterministic across consecutive executions"
  );
});
