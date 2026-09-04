/**
 * MPLAD SENTINEL — Phase 8 Ground-Truth Evaluation Module
 *
 * STRICT GOVERNANCE & ANTI-LEAKAGE BOUNDARY:
 * ONLY this module in the entire backend is permitted to read `scenario_type`.
 * Production detectors, rules, statistical baselines, ML matrix, and aggregator
 * NEVER import or reference scenario_type.
 *
 * This evaluator compares `data/processed/anomaly_results.json` against
 * Phase 6 SQLite synthetic ground-truth benchmark labels.
 */

import fs from "node:fs";
import path from "node:path";
import { ProjectRepository } from "../repository/projectRepository.ts";
import type { AnomalyResult } from "../anomaly/types.ts";

export interface ConfusionMatrix {
  truePositives: number;
  falsePositives: number;
  trueNegatives: number;
  falseNegatives: number;
}

export interface ScenarioEvaluation {
  scenarioType: string;
  totalGroundTruth: number;
  detectedPositives: number;
  falseNegatives: number;
  recall: number;
}

export interface AnomalyEvaluationReport {
  metadata: {
    evaluatedAt: string;
    engineVersion: string;
    totalProjects: number;
    datasetGroundTruthNote: string;
    responsibleAiDisclaimer: string;
  };
  metrics: {
    precision: number;
    recall: number;
    f1Score: number;
    falsePositiveRate: number;
    confusionMatrix: ConfusionMatrix;
  };
  perScenarioPerformance: Record<string, ScenarioEvaluation>;
  summary: {
    projectsWithSignals: number;
    projectsWithoutSignals: number;
    totalSignalsDetected: number;
  };
}

/**
 * Runs the evaluation comparing anomaly_results.json against SQLite ground truth.
 */
export function runEvaluation(options?: {
  resultsPath?: string;
  outputPath?: string;
  repo?: ProjectRepository;
}): AnomalyEvaluationReport {
  const resultsPath =
    options?.resultsPath ||
    path.join(process.cwd(), "data", "processed", "anomaly_results.json");

  if (!fs.existsSync(resultsPath)) {
    throw new Error(`Anomaly results file not found at ${resultsPath}. Run anomaly pipeline first.`);
  }

  const anomalyResults: AnomalyResult[] = JSON.parse(
    fs.readFileSync(resultsPath, "utf8")
  );

  const repository = options?.repo || new ProjectRepository();
  const dbProjects = repository.getAllProjects();

  const resultsMap = new Map<string, AnomalyResult>();
  for (const res of anomalyResults) {
    resultsMap.set(res.projectCode, res);
  }

  // 1. Compute Confusion Matrix
  let tp = 0;
  let fp = 0;
  let tn = 0;
  let fn = 0;

  const scenarioCounts: Record<string, { total: number; detected: number }> = {};

  for (const proj of dbProjects) {
    const scenario = proj.scenario_type || "NORMAL";
    if (!scenarioCounts[scenario]) {
      scenarioCounts[scenario] = { total: 0, detected: 0 };
    }
    scenarioCounts[scenario].total++;

    const res = resultsMap.get(proj.project_code);
    const hasSignal = res ? res.signals.length > 0 : false;
    const isGroundTruthAnomaly = scenario !== "NORMAL";

    if (hasSignal) {
      scenarioCounts[scenario].detected++;
    }

    if (isGroundTruthAnomaly && hasSignal) {
      tp++;
    } else if (!isGroundTruthAnomaly && hasSignal) {
      fp++;
    } else if (!isGroundTruthAnomaly && !hasSignal) {
      tn++;
    } else if (isGroundTruthAnomaly && !hasSignal) {
      fn++;
    }
  }

  const precision = tp + fp > 0 ? Number((tp / (tp + fp)).toFixed(4)) : 0;
  const recall = tp + fn > 0 ? Number((tp / (tp + fn)).toFixed(4)) : 0;
  const f1Score =
    precision + recall > 0
      ? Number(((2 * precision * recall) / (precision + recall)).toFixed(4))
      : 0;
  const normalTotal = (scenarioCounts["NORMAL"]?.total) || (tn + fp);
  const falsePositiveRate =
    normalTotal > 0 ? Number((fp / normalTotal).toFixed(4)) : 0;

  // 2. Per-scenario performance
  const perScenarioPerformance: Record<string, ScenarioEvaluation> = {};
  for (const [scenario, counts] of Object.entries(scenarioCounts)) {
    const scRecall =
      counts.total > 0 ? Number((counts.detected / counts.total).toFixed(4)) : 0;
    perScenarioPerformance[scenario] = {
      scenarioType: scenario,
      totalGroundTruth: counts.total,
      detectedPositives: counts.detected,
      falseNegatives: counts.total - counts.detected,
      recall: scRecall,
    };
  }

  const totalSignals = anomalyResults.reduce(
    (acc, r) => acc + r.signals.length,
    0
  );
  const projectsWithSignals = anomalyResults.filter(
    (r) => r.signals.length > 0
  ).length;

  const report: AnomalyEvaluationReport = {
    metadata: {
      evaluatedAt: new Date().toISOString(),
      engineVersion: "1.0.0",
      totalProjects: dbProjects.length,
      datasetGroundTruthNote:
        "Ground truth scenario_type labels are synthetic benchmark data generated in Phase 6 for model evaluation only. Detectors are strictly prohibited from utilizing ground truth.",
      responsibleAiDisclaimer:
        "Anomaly signals indicate priority for human administrative audit and field inspection. Signals do not constitute proof of culpability or fraud.",
    },
    metrics: {
      precision,
      recall,
      f1Score,
      falsePositiveRate,
      confusionMatrix: {
        truePositives: tp,
        falsePositives: fp,
        trueNegatives: tn,
        falseNegatives: fn,
      },
    },
    perScenarioPerformance,
    summary: {
      projectsWithSignals,
      projectsWithoutSignals: dbProjects.length - projectsWithSignals,
      totalSignalsDetected: totalSignals,
    },
  };

  // Write output
  const outputPath =
    options?.outputPath ||
    path.join(process.cwd(), "data", "evaluation", "anomaly_evaluation.json");
  const outDir = path.dirname(outputPath);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), "utf8");

  return report;
}

// CLI runner
function main() {
  try {
    console.log("=================================================");
    console.log("MPLAD SENTINEL — Phase 8 Ground-Truth Evaluation");
    console.log("=================================================");
    const report = runEvaluation();
    console.log(`Evaluated Projects:        ${report.metadata.totalProjects}`);
    console.log(`Precision:                 ${(report.metrics.precision * 100).toFixed(1)}%`);
    console.log(`Recall:                    ${(report.metrics.recall * 100).toFixed(1)}%`);
    console.log(`F1-Score:                  ${report.metrics.f1Score}`);
    console.log(`False Positive Rate:       ${(report.metrics.falsePositiveRate * 100).toFixed(1)}%`);
    console.log(`True Positives:            ${report.metrics.confusionMatrix.truePositives}`);
    console.log(`False Positives:           ${report.metrics.confusionMatrix.falsePositives}`);
    console.log(`True Negatives:            ${report.metrics.confusionMatrix.trueNegatives}`);
    console.log(`False Negatives:           ${report.metrics.confusionMatrix.falseNegatives}`);
    console.log("-------------------------------------------------");
    console.log("Per-Scenario Recall Performance:");
    for (const [sc, data] of Object.entries(report.perScenarioPerformance)) {
      console.log(
        `  - ${sc.padEnd(30)}: Recall ${(data.recall * 100).toFixed(1)}% (${data.detectedPositives}/${data.totalGroundTruth})`
      );
    }
    console.log("=================================================");
  } catch (err) {
    console.error("Evaluation failed:", err);
    process.exit(1);
  }
}

if (process.argv[1] && process.argv[1].includes("evaluator.ts")) {
  main();
}
