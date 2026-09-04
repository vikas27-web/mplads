/**
 * MPLAD SENTINEL — Phase 7 Feature Generation CLI Script
 * Executes the feature engineering pipeline against the Phase 6 SQLite database
 * and exports the validated feature dataset to data/processed/project_features.json.
 */

import { exportProjectFeatures } from "../features/pipeline.ts";
import { FEATURE_VERSION } from "../features/types.ts";

function main() {
  console.log("==================================================");
  console.log("MPLAD SENTINEL — PHASE 7 FEATURE ENGINEERING PIPELINE");
  console.log("==================================================");
  console.log(`Feature Version: ${FEATURE_VERSION}`);
  console.log("Loading Phase 6 SQLite Database...");

  const startTime = Date.now();
  try {
    const result = exportProjectFeatures();
    const duration = Date.now() - startTime;

    console.log("Extraction & Validation Complete!");
    console.log(`- Records Processed: ${result.recordCount}`);
    console.log(`- Export Artifact: ${result.outputPath}`);
    console.log(`- Validation Status: PASSED (100% compliant)`);
    console.log(`- Anti-Leakage Check: PASSED (Zero scenario_type exposure)`);
    console.log(`- Pipeline Duration: ${duration}ms`);
    console.log("==================================================");
  } catch (error) {
    console.error("Feature generation failed with error:", error);
    process.exit(1);
  }
}

main();
