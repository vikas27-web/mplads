import fs from "node:fs";
import path from "node:path";
import type { SyntheticDatasetBundle } from "../types/project.ts";
import { DatabaseManager } from "../database/sqlite.ts";
import { generateSyntheticDataset } from "../generator/datasetGenerator.ts";

async function main() {
  console.log("==================================================");
  console.log("MPLAD SENTINEL — SQLite Database Initializer");
  console.log("==================================================");

  const dataDir = path.join(process.cwd(), "data", "generated");
  const jsonPath = path.join(dataDir, "mplad_synthetic_dataset.json");
  const dbPath = path.join(dataDir, "mplad_database.sqlite");

  let bundle: SyntheticDatasetBundle;

  if (fs.existsSync(jsonPath)) {
    console.log(`Loading existing canonical dataset from: ${jsonPath}...`);
    bundle = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
  } else {
    console.log(`Dataset not found at ${jsonPath}. Generating deterministically with seed 26102...`);
    bundle = generateSyntheticDataset({ seed: 26102, totalProjects: 300 });
    fs.mkdirSync(dataDir, { recursive: true });
    fs.writeFileSync(jsonPath, JSON.stringify(bundle, null, 2), "utf-8");
  }

  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
  }

  console.log(`Initializing SQLite schema and seeding tables at: ${dbPath}...`);
  const dbManager = new DatabaseManager(dbPath);
  dbManager.seedDataset(bundle);

  const rawDb = dbManager.getRawDb();
  const projectCount = (rawDb.prepare("SELECT COUNT(*) as count FROM projects;").get() as { count: number }).count;
  const paymentCount = (rawDb.prepare("SELECT COUNT(*) as count FROM payments;").get() as { count: number }).count;
  const progressCount = (rawDb.prepare("SELECT COUNT(*) as count FROM physical_progress_events;").get() as { count: number }).count;
  const documentCount = (rawDb.prepare("SELECT COUNT(*) as count FROM documents;").get() as { count: number }).count;

  dbManager.close();

  console.log(`Database Initialized Successfully.`);
  console.log(`Verified Rows:`);
  console.log(`  projects                 : ${projectCount}`);
  console.log(`  payments                 : ${paymentCount}`);
  console.log(`  physical_progress_events : ${progressCount}`);
  console.log(`  documents                : ${documentCount}`);
}

main().catch((err) => {
  console.error("Database initialization failed:", err);
  process.exit(1);
});
