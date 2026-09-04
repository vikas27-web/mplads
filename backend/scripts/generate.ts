import fs from "node:fs";
import path from "node:path";
import { generateSyntheticDataset } from "../generator/datasetGenerator.ts";
import { validateDataset } from "../schemas/validator.ts";
import { DatabaseManager } from "../database/sqlite.ts";

async function main() {
  console.log("==================================================");
  console.log("MPLAD SENTINEL — Phase 6 Synthetic Dataset Generator");
  console.log("==================================================");

  const SEED = 26102;
  const TOTAL_RECORDS = 300;

  console.log(`Initializing deterministic generator with seed: ${SEED}...`);
  const bundle = generateSyntheticDataset({ seed: SEED, totalProjects: TOTAL_RECORDS });

  console.log(`Generated ${bundle.projects.length} project records.`);
  console.log(`Validating dataset against canonical schema rules...`);

  const validation = validateDataset(bundle.projects);
  if (!validation.valid) {
    console.error(`Validation FAILED with ${validation.invalidCount} invalid records!`);
    console.error(JSON.stringify(validation.errorsByCode, null, 2));
    process.exit(1);
  }

  console.log(`Schema Validation: PASSED (100% of ${validation.totalRecords} records compliant).`);

  // Ensure output directories exist
  const outputDir = path.join(process.cwd(), "data", "generated");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 1. Write JSON canonical artifact
  const jsonPath = path.join(outputDir, "mplad_synthetic_dataset.json");
  fs.writeFileSync(jsonPath, JSON.stringify(bundle, null, 2), "utf-8");
  const stats = fs.statSync(jsonPath);
  console.log(`Saved canonical dataset to: ${jsonPath} (${(stats.size / 1024).toFixed(1)} KB)`);

  // 2. Initialize and seed SQLite database
  const dbPath = path.join(outputDir, "mplad_database.sqlite");
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath); // clean recreate
  }

  console.log(`Initializing SQLite database at: ${dbPath}...`);
  const dbManager = new DatabaseManager(dbPath);
  dbManager.seedDataset(bundle);
  dbManager.close();

  const dbStats = fs.statSync(dbPath);
  console.log(`Database seeded successfully (${(dbStats.size / 1024).toFixed(1)} KB).`);

  // Print Summary
  console.log("\n--- Scenario Distribution ---");
  for (const [sc, count] of Object.entries(bundle.metadata.scenario_distribution)) {
    console.log(`  ${sc.padEnd(30)}: ${count} (${((count / TOTAL_RECORDS) * 100).toFixed(1)}%)`);
  }

  console.log("\n--- Entity Record Counts ---");
  console.log(`  Projects                 : ${bundle.projects.length}`);
  console.log(`  Constituencies           : ${bundle.constituencies.length}`);
  console.log(`  Districts                : ${bundle.districts.length}`);
  console.log(`  Implementing Agencies    : ${bundle.implementing_agencies.length}`);
  console.log(`  Contractors              : ${bundle.contractors.length}`);
  console.log(`  Payment Records          : ${bundle.payments.length}`);
  console.log(`  Physical Progress Events : ${bundle.physical_progress_events.length}`);
  console.log(`  Statutory Documents      : ${bundle.documents.length}`);
  console.log("\nGeneration & Seeding Completed Successfully.");
}

main().catch((err) => {
  console.error("Fatal generation error:", err);
  process.exit(1);
});
