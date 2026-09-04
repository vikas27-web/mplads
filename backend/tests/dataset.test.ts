import test from "node:test";
import assert from "node:assert";
import { generateSyntheticDataset } from "../generator/datasetGenerator.ts";
import { validateDataset, validateProjectRecord } from "../schemas/validator.ts";
import { DatabaseManager } from "../database/sqlite.ts";
import { ProjectRepository } from "../repository/projectRepository.ts";
import type { ProjectRecord, ScenarioType } from "../types/project.ts";

test("1. Dataset Generation & Record Count", () => {
  const bundle = generateSyntheticDataset({ seed: 26102, totalProjects: 300 });
  assert.strictEqual(bundle.projects.length, 300, "Should generate exactly 300 projects");
  assert.strictEqual(bundle.constituencies.length, 26, "Should generate 26 constituencies");
  assert.strictEqual(bundle.districts.length, 13, "Should generate 13 districts");
  assert.strictEqual(bundle.implementing_agencies.length, 8, "Should generate 8 implementing agencies");
  assert.strictEqual(bundle.contractors.length, 10, "Should generate 10 contractors");
  assert.strictEqual(bundle.payments.length, 600, "Should generate 600 payments");
  assert.strictEqual(bundle.documents.length, 900, "Should generate 900 statutory documents");
});

test("2. Determinism Verification (Fixed Random Seed)", () => {
  const run1 = generateSyntheticDataset({ seed: 26102, totalProjects: 100 });
  const run2 = generateSyntheticDataset({ seed: 26102, totalProjects: 100 });

  assert.deepStrictEqual(run1.projects, run2.projects, "Projects array must be strictly identical between runs with identical seed");
  assert.deepStrictEqual(run1.payments, run2.payments, "Payments array must be strictly identical between runs with identical seed");
  assert.deepStrictEqual(run1.documents, run2.documents, "Documents array must be strictly identical between runs with identical seed");

  // Verify different seed produces different dataset
  const runDiff = generateSyntheticDataset({ seed: 99999, totalProjects: 100 });
  assert.notDeepStrictEqual(run1.projects, runDiff.projects, "Different seed must produce different dataset");
});

test("3. Schema Validation & Error Detection", () => {
  const bundle = generateSyntheticDataset({ seed: 26102, totalProjects: 300 });
  const validation = validateDataset(bundle.projects);

  assert.strictEqual(validation.valid, true, "All generated records must pass schema validation");
  assert.strictEqual(validation.invalidCount, 0, "There should be zero invalid records");

  // Test that validator catches invalid project records
  const invalidRecord: ProjectRecord = {
    ...bundle.projects[0],
    sanctioned_amount: -5000, // Negative amount
    physical_progress: 150, // Invalid progress > 100
    recommendation_date: "invalid-date",
    scenario_type: "INVALID_SCENARIO" as ScenarioType,
  };

  const invalidCheck = validateProjectRecord(invalidRecord);
  assert.strictEqual(invalidCheck.valid, false, "Validator must reject invalid record");
  assert.ok(invalidCheck.errors.some((e) => e.includes("Negative or zero sanctioned_amount")));
  assert.ok(invalidCheck.errors.some((e) => e.includes("physical_progress must be between 0 and 100")));
  assert.ok(invalidCheck.errors.some((e) => e.includes("valid ISO YYYY-MM-DD date")));
  assert.ok(invalidCheck.errors.some((e) => e.includes("Invalid scenario_type")));
});

test("4. Required Fields Completeness", () => {
  const bundle = generateSyntheticDataset({ seed: 26102, totalProjects: 300 });

  for (const p of bundle.projects) {
    assert.ok(p.project_code.length > 0, "project_code must be non-empty");
    assert.ok(p.project_title.length > 0, "project_title must be non-empty");
    assert.ok(p.state.length > 0, "state must be non-empty");
    assert.ok(p.constituency.length > 0, "constituency must be non-empty");
    assert.ok(p.district.length > 0, "district must be non-empty");
    assert.ok(p.sector.length > 0, "sector must be non-empty");
    assert.ok(p.implementing_agency.length > 0, "implementing_agency must be non-empty");
    assert.ok(p.contractor_id.length > 0, "contractor_id must be non-empty");
  }
});

test("5. Financial Constraints & Numeric Boundaries", () => {
  const bundle = generateSyntheticDataset({ seed: 26102, totalProjects: 300 });

  for (const p of bundle.projects) {
    assert.ok(p.sanctioned_amount > 0, `Sanctioned amount must be > 0 (got ${p.sanctioned_amount})`);
    assert.ok(p.released_amount >= 0, `Released amount must be >= 0 (got ${p.released_amount})`);
    assert.ok(p.expenditure_amount >= 0, `Expenditure amount must be >= 0 (got ${p.expenditure_amount})`);

    // In NORMAL scenarios, released should not exceed sanctioned, expenditure should not exceed released
    if (p.scenario_type === "NORMAL") {
      assert.ok(
        p.released_amount <= p.sanctioned_amount,
        `Released (${p.released_amount}) should not exceed sanctioned (${p.sanctioned_amount}) in NORMAL scenario`
      );
      assert.ok(
        p.expenditure_amount <= p.released_amount,
        `Expenditure (${p.expenditure_amount}) should not exceed released (${p.released_amount}) in NORMAL scenario`
      );
    }
  }
});

test("6. Date Format & Chronological Sequence", () => {
  const bundle = generateSyntheticDataset({ seed: 26102, totalProjects: 300 });
  const isoRegex = /^\d{4}-\d{2}-\d{2}$/;

  for (const p of bundle.projects) {
    assert.match(p.recommendation_date, isoRegex, "recommendation_date must match ISO format");
    assert.match(p.sanction_date, isoRegex, "sanction_date must match ISO format");
    assert.match(p.start_date, isoRegex, "start_date must match ISO format");
    assert.match(p.planned_completion_date, isoRegex, "planned_completion_date must match ISO format");

    if (p.scenario_type === "NORMAL") {
      assert.ok(
        p.recommendation_date <= p.sanction_date,
        `recommendation_date (${p.recommendation_date}) <= sanction_date (${p.sanction_date})`
      );
      assert.ok(
        p.sanction_date <= p.start_date,
        `sanction_date (${p.sanction_date}) <= start_date (${p.start_date})`
      );
    }
  }
});

test("7. Physical Progress Bounds (0 to 100)", () => {
  const bundle = generateSyntheticDataset({ seed: 26102, totalProjects: 300 });

  for (const p of bundle.projects) {
    assert.ok(p.physical_progress >= 0, `Progress must be >= 0 (got ${p.physical_progress})`);
    assert.ok(p.physical_progress <= 100, `Progress must be <= 100 (got ${p.physical_progress})`);

    if (p.status === "Completed") {
      assert.strictEqual(p.physical_progress, 100, "Completed projects must have 100% progress");
      assert.ok(p.actual_or_reported_completion_date !== null, "Completed projects must have actual completion date");
    }
  }
});

test("8. Unique Project Codes (Zero Collisions)", () => {
  const bundle = generateSyntheticDataset({ seed: 26102, totalProjects: 300 });
  const codeSet = new Set<string>();

  for (const p of bundle.projects) {
    assert.ok(!codeSet.has(p.project_code), `Duplicate project_code detected: ${p.project_code}`);
    codeSet.add(p.project_code);
  }

  assert.strictEqual(codeSet.size, 300, "All 300 project codes must be unique");
});

test("9. Scenario Label Distribution & Validity", () => {
  const bundle = generateSyntheticDataset({ seed: 26102, totalProjects: 300 });
  const dist = bundle.metadata.scenario_distribution;

  const expectedScenarios: ScenarioType[] = [
    "NORMAL",
    "DUPLICATE_SIGNAL",
    "EXPENDITURE_SHIFT",
    "TIMELINE_INCONSISTENCY",
    "PHYSICAL_FINANCIAL_MISMATCH",
    "PAYMENT_PATTERN_SIGNAL",
    "CONTRACTOR_CONCENTRATION",
    "MISSING_DOCUMENTATION",
    "MULTI_SIGNAL",
  ];

  let sum = 0;
  for (const sc of expectedScenarios) {
    assert.ok(dist[sc] > 0, `Scenario ${sc} must have at least 1 record`);
    sum += dist[sc];
  }

  assert.strictEqual(sum, 300, "Scenario counts must sum to exactly 300");
  assert.strictEqual(dist.NORMAL, 180, "NORMAL scenario should be 180 (60%)");
});

test("10. Database Initialization & Storage", () => {
  const dbManager = new DatabaseManager(":memory:");
  const bundle = generateSyntheticDataset({ seed: 26102, totalProjects: 50 });

  dbManager.seedDataset(bundle);
  const rawDb = dbManager.getRawDb();

  const projCount = (rawDb.prepare("SELECT COUNT(*) as count FROM projects;").get() as { count: number }).count;
  assert.strictEqual(projCount, 50, "In-memory database should hold 50 projects");

  const payCount = (rawDb.prepare("SELECT COUNT(*) as count FROM payments;").get() as { count: number }).count;
  assert.ok(payCount > 50, "Payments table should have corresponding payment entries");

  dbManager.close();
});

test("11. Database Retrieval by Project Code (getProjectByCode)", () => {
  const dbManager = new DatabaseManager(":memory:");
  const bundle = generateSyntheticDataset({ seed: 26102, totalProjects: 50 });
  dbManager.seedDataset(bundle);

  const repo = new ProjectRepository(dbManager);

  const project = repo.getProjectByCode("MPLAD-DEMO-000001");
  assert.ok(project !== null, "Must retrieve project by valid code");
  assert.strictEqual(project?.project_code, "MPLAD-DEMO-000001");
  assert.ok(project!.sanctioned_amount > 0);

  // Non-existent project
  const notFound = repo.getProjectByCode("MPLAD-NONEXISTENT-999");
  assert.strictEqual(notFound, null, "Must return null for unknown project code");

  dbManager.close();
});

test("12. Database Filtered Queries (getProjects)", () => {
  const dbManager = new DatabaseManager(":memory:");
  const bundle = generateSyntheticDataset({ seed: 26102, totalProjects: 100 });
  dbManager.seedDataset(bundle);

  const repo = new ProjectRepository(dbManager);

  // Sector filter
  const waterProjects = repo.getProjects({ sector: "Drinking Water Supply" });
  assert.ok(waterProjects.total > 0, "Should find drinking water projects");
  for (const p of waterProjects.projects) {
    assert.strictEqual(p.sector, "Drinking Water Supply");
  }

  // Scenario filter
  const mismatchProjects = repo.getProjects({ scenario_type: "PHYSICAL_FINANCIAL_MISMATCH" });
  assert.ok(mismatchProjects.total > 0, "Should find mismatch scenario projects");
  for (const p of mismatchProjects.projects) {
    assert.strictEqual(p.scenario_type, "PHYSICAL_FINANCIAL_MISMATCH");
  }

  // Pagination
  const page1 = repo.getProjects({ limit: 10, offset: 0 });
  const page2 = repo.getProjects({ limit: 10, offset: 10 });
  assert.strictEqual(page1.projects.length, 10);
  assert.strictEqual(page2.projects.length, 10);
  assert.notStrictEqual(page1.projects[0].project_code, page2.projects[0].project_code);

  dbManager.close();
});

test("13. Facet & Aggregate Queries (Distinct Values & Counts)", () => {
  const dbManager = new DatabaseManager(":memory:");
  const bundle = generateSyntheticDataset({ seed: 26102, totalProjects: 100 });
  dbManager.seedDataset(bundle);

  const repo = new ProjectRepository(dbManager);

  const totalCount = repo.getProjectCount();
  assert.strictEqual(totalCount, 100, "Total count should match 100");

  const districts = repo.getDistinctDistricts();
  assert.ok(districts.length > 0, "Should retrieve list of distinct districts");

  const sectors = repo.getDistinctSectors();
  assert.ok(sectors.length > 0, "Should retrieve list of distinct sectors");

  const agencies = repo.getDistinctAgencies();
  assert.ok(agencies.length > 0, "Should retrieve list of distinct agencies");

  dbManager.close();
});
