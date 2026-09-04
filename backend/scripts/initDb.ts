import fs from "node:fs";
import path from "node:path";
import type { SyntheticDatasetBundle } from "../types/project.ts";
import { DatabaseManager } from "../database/sqlite.ts";
import { runOfficialIngestionPipeline } from "../ingestion/importPipeline.ts";
import { generateSyntheticDataset } from "../generator/datasetGenerator.ts";

async function main() {
  console.log("==================================================");
  console.log("MPLAD SENTINEL — Primary Database Initializer");
  console.log("Official SIH26102 Dataset Integration");
  console.log("==================================================");

  const dataDir = path.join(process.cwd(), "data", "generated");
  const benchmarkDir = path.join(process.cwd(), "data", "benchmark");
  const processedDir = path.join(process.cwd(), "data", "processed");
  const officialJsonPath = path.join(processedDir, "official_allocations.json");
  const primaryDbPath = path.join(dataDir, "mplad_database.sqlite");
  const benchmarkDbPath = path.join(benchmarkDir, "mplad_benchmark_database.sqlite");

  fs.mkdirSync(dataDir, { recursive: true });
  fs.mkdirSync(benchmarkDir, { recursive: true });

  // 1. Ensure official dataset is ingested
  let officialAllocations: any[];
  if (fs.existsSync(officialJsonPath)) {
    console.log(`Loading processed official dataset from: ${officialJsonPath}...`);
    officialAllocations = JSON.parse(fs.readFileSync(officialJsonPath, "utf-8"));
  } else {
    console.log("Official dataset not processed yet. Running ingestion pipeline...");
    const { allocations } = runOfficialIngestionPipeline();
    officialAllocations = allocations;
  }

  // 2. Initialize primary database with official dataset (543 MPs)
  if (fs.existsSync(primaryDbPath)) {
    try {
      fs.unlinkSync(primaryDbPath);
    } catch {
      // File may be locked by another process; DatabaseManager.clearTables() will handle reset safely
    }
  }

  console.log(`Seeding PRIMARY database with ${officialAllocations.length} official records at: ${primaryDbPath}...`);
  const primaryDbManager = new DatabaseManager(primaryDbPath);
  primaryDbManager.seedOfficialDataset(officialAllocations);

  const rawDb = primaryDbManager.getRawDb();
  const officialCount = (rawDb.prepare("SELECT COUNT(*) as count FROM official_allocations;").get() as { count: number }).count;
  const projectCount = (rawDb.prepare("SELECT COUNT(*) as count FROM projects;").get() as { count: number }).count;
  const constCount = (rawDb.prepare("SELECT COUNT(*) as count FROM constituencies;").get() as { count: number }).count;
  const distCount = (rawDb.prepare("SELECT COUNT(*) as count FROM districts;").get() as { count: number }).count;
  primaryDbManager.close();

  console.log(`✓ Primary Database Initialized Successfully.`);
  console.log(`  official_allocations : ${officialCount}`);
  console.log(`  projects (official)  : ${projectCount}`);
  console.log(`  constituencies       : ${constCount}`);
  console.log(`  districts            : ${distCount}`);

  // 3. Seed isolated benchmark database for unit & regression tests
  console.log(`\nInitializing ISOLATED benchmark database at: ${benchmarkDbPath}...`);
  const benchmarkJsonPath = path.join(benchmarkDir, "mplad_synthetic_dataset.json");
  let benchmarkBundle: SyntheticDatasetBundle;
  if (fs.existsSync(benchmarkJsonPath)) {
    benchmarkBundle = JSON.parse(fs.readFileSync(benchmarkJsonPath, "utf-8"));
  } else {
    benchmarkBundle = generateSyntheticDataset({ seed: 26102, totalProjects: 300 });
    fs.writeFileSync(benchmarkJsonPath, JSON.stringify(benchmarkBundle, null, 2), "utf-8");
  }

  if (fs.existsSync(benchmarkDbPath)) {
    fs.unlinkSync(benchmarkDbPath);
  }
  const benchmarkDbManager = new DatabaseManager(benchmarkDbPath);
  benchmarkDbManager.seedDataset(benchmarkBundle);
  benchmarkDbManager.close();
  console.log(`✓ Benchmark Database Initialized for isolated regression tests (300 projects).`);
}

main().catch((err) => {
  console.error("Database initialization failed:", err);
  process.exit(1);
});

