/**
 * MPLAD SENTINEL — Phase 8 Anomaly Detection Pipeline
 *
 * Consumes:
 *   data/processed/project_features.json
 * Produces:
 *   data/processed/anomaly_results.json
 *
 * Guarantees:
 * - Exactly one AnomalyResult per project
 * - Deterministic, stable ordering by projectCode
 * - Full validation before persisting
 * - Zero accusatory language and zero data leakage
 */

import fs from "node:fs";
import path from "node:path";
import type { FeatureRecord, FeatureDatasetBundle } from "../features/types.ts";
import type { AnomalyResult } from "./types.ts";
import { runAnomalyDetectionEngine } from "./engine.ts";
import { validateAnomalyDataset } from "./validator.ts";

export interface PipelineExecutionResult {
  outputPath: string;
  projectCount: number;
  signalsCount: number;
  projectsWithSignals: number;
  projectsWithoutSignals: number;
  results: AnomalyResult[];
  durationMs: number;
}

/**
 * Loads project features from disk.
 */
export function loadProjectFeaturesFromDisk(customPath?: string): FeatureRecord[] {
  const filePath = customPath || path.join(process.cwd(), "data", "processed", "project_features.json");

  if (!fs.existsSync(filePath)) {
    throw new Error(`Features file not found at ${filePath}. Run Phase 7 pipeline first.`);
  }

  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = JSON.parse(raw);

  if (Array.isArray(parsed)) {
    return parsed as FeatureRecord[];
  }
  if (parsed && Array.isArray(parsed.features)) {
    return (parsed as FeatureDatasetBundle).features;
  }

  throw new Error("Invalid project_features.json format: expected array or bundle with features array.");
}

/**
 * Executes the complete anomaly pipeline and writes to data/processed/anomaly_results.json.
 */
export function runAnomalyPipeline(options?: {
  features?: FeatureRecord[];
  featuresPath?: string;
  outputPath?: string;
}): PipelineExecutionResult {
  const startTime = Date.now();
  const features = options?.features || loadProjectFeaturesFromDisk(options?.featuresPath);

  // Run complete multi-engine detection
  const results = runAnomalyDetectionEngine(features);

  // Validate all results before writing
  const validation = validateAnomalyDataset(results);
  if (!validation.valid) {
    throw new Error(
      `Pipeline validation failed before writing output: ${validation.errors.length} errors.\n` +
      validation.errors.slice(0, 5).join("\n")
    );
  }

  const outputPath = options?.outputPath || path.join(process.cwd(), "data", "processed", "anomaly_results.json");
  const outDir = path.dirname(outputPath);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // Write deterministic, pretty-printed JSON
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), "utf8");

  const totalSignals = results.reduce((acc, r) => acc + r.signals.length, 0);
  const projectsWithSignals = results.filter((r) => r.signals.length > 0).length;

  return {
    outputPath,
    projectCount: results.length,
    signalsCount: totalSignals,
    projectsWithSignals,
    projectsWithoutSignals: results.length - projectsWithSignals,
    results,
    durationMs: Date.now() - startTime,
  };
}

// CLI execution
function main() {
  try {
    console.log("=========================================");
    console.log("MPLAD SENTINEL — Phase 8 Anomaly Pipeline");
    console.log("=========================================");
    const res = runAnomalyPipeline();
    console.log(`Evaluated Projects:        ${res.projectCount}`);
    console.log(`Total Anomaly Signals:     ${res.signalsCount}`);
    console.log(`Projects with Signals:     ${res.projectsWithSignals}`);
    console.log(`Projects Clean (Baseline): ${res.projectsWithoutSignals}`);
    console.log(`Output File:               ${res.outputPath}`);
    console.log(`Duration:                  ${res.durationMs}ms`);
    console.log("Pipeline completed successfully.");
  } catch (err) {
    console.error("Pipeline execution failed:", err);
    process.exit(1);
  }
}

if (process.argv[1] && process.argv[1].includes("pipeline.ts")) {
  main();
}
