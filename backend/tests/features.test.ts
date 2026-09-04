/**
 * MPLAD SENTINEL — Phase 7 Feature Engineering Test Suite
 * Validates deterministic feature extraction, validation, domain constraints,
 * and zero data leakage against the Phase 6 SQLite database.
 */

import test from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { ProjectRepository } from "../repository/projectRepository.ts";
import {
  generateProjectFeatures,
  generateAllProjectFeatures,
  exportProjectFeatures,
} from "../features/pipeline.ts";
import { validateFeatureRecord, validateFeatureDataset } from "../features/validator.ts";
import { FEATURE_VERSION, REFERENCE_AUDIT_DATE, type FeatureRecord } from "../features/types.ts";

const repo = new ProjectRepository();

test("1. Feature Generation for Single Project", () => {
  const record = generateProjectFeatures("MPLAD-DEMO-000001", repo);
  assert.ok(record, "Feature record should not be null");
  assert.strictEqual(record.project_code, "MPLAD-DEMO-000001");
  assert.ok(record.financial, "Financial features group must be defined");
  assert.ok(record.physical, "Physical features group must be defined");
  assert.ok(record.temporal, "Temporal features group must be defined");
  assert.ok(record.payment, "Payment features group must be defined");
  assert.ok(record.contractor, "Contractor context group must be defined");
  assert.ok(record.agency, "Agency context group must be defined");
  assert.ok(record.documentation, "Documentation features group must be defined");
  assert.ok(record.cross_domain, "Cross-domain features group must be defined");
});

test("2. Feature Record Count Matches Database Project Count", () => {
  const dbCount = repo.getProjectCount();
  const bundle = generateAllProjectFeatures(repo);
  assert.strictEqual(
    bundle.features.length,
    dbCount,
    `Feature count (${bundle.features.length}) must match SQLite project count (${dbCount})`
  );
  assert.strictEqual(bundle.features.length, 300, "Should have exactly 300 projects");
});

test("3. Unique Project Codes in Feature Dataset", () => {
  const bundle = generateAllProjectFeatures(repo);
  const codes = bundle.features.map((f) => f.project_code);
  const uniqueCodes = new Set(codes);
  assert.strictEqual(
    uniqueCodes.size,
    bundle.features.length,
    "All project codes must be unique"
  );
});

test("4. Deterministic Feature Generation Across Repeated Runs", () => {
  const run1 = generateAllProjectFeatures(repo);
  const run2 = generateAllProjectFeatures(repo);

  assert.deepStrictEqual(
    run1.features,
    run2.features,
    "Features generated from identical database state must be byte-for-byte identical"
  );
});

test("5. Financial Feature Mathematical Correctness", () => {
  const bundle = generateAllProjectFeatures(repo);

  for (const f of bundle.features) {
    const fin = f.financial;
    assert.strictEqual(
      fin.remaining_sanctioned_amount,
      fin.sanctioned_amount - fin.expenditure_amount,
      `remaining_sanctioned_amount must equal sanctioned - expenditure for ${f.project_code}`
    );
    assert.strictEqual(
      fin.remaining_released_amount,
      fin.released_amount - fin.expenditure_amount,
      `remaining_released_amount must equal released - expenditure for ${f.project_code}`
    );

    if (fin.released_amount > 0) {
      const expectedRatio = Number((fin.expenditure_amount / fin.released_amount).toFixed(4));
      assert.strictEqual(
        fin.expenditure_to_release_ratio,
        expectedRatio,
        `expenditure_to_release_ratio math error for ${f.project_code}`
      );
    }

    assert.ok(fin.sanctioned_amount >= 0, "sanctioned_amount must be non-negative");
    assert.ok(fin.released_amount >= 0, "released_amount must be non-negative");
    assert.ok(fin.expenditure_amount >= 0, "expenditure_amount must be non-negative");
    assert.ok(fin.payment_amount_std_dev >= 0, "std_dev must be non-negative");
  }
});

test("6. Physical Feature Bounds & Integrity", () => {
  const bundle = generateAllProjectFeatures(repo);

  for (const f of bundle.features) {
    const phys = f.physical;
    assert.ok(
      phys.reported_physical_progress >= 0 && phys.reported_physical_progress <= 100,
      `reported_physical_progress out of bounds [0, 100] for ${f.project_code}`
    );
    assert.ok(
      phys.latest_progress_percentage >= 0 && phys.latest_progress_percentage <= 100,
      `latest_progress_percentage out of bounds for ${f.project_code}`
    );
    assert.ok(
      phys.is_completed === 0 || phys.is_completed === 1,
      `is_completed must be 0 or 1 for ${f.project_code}`
    );
    assert.ok(
      phys.planned_duration_days > 0,
      `planned_duration_days must be > 0 for ${f.project_code}`
    );
    assert.ok(
      phys.schedule_delay_days >= 0,
      `schedule_delay_days must be non-negative for ${f.project_code}`
    );
  }
});

test("7. Temporal Feature Chronology", () => {
  const bundle = generateAllProjectFeatures(repo);

  for (const f of bundle.features) {
    const temp = f.temporal;
    assert.ok(
      temp.days_recommendation_to_sanction >= 0,
      `Recommendation must precede sanction for ${f.project_code}`
    );
    assert.ok(
      temp.days_sanction_to_start >= 0,
      `Sanction must precede start for ${f.project_code}`
    );
    assert.ok(
      temp.project_age_days >= 0,
      `Project age must be non-negative for ${f.project_code}`
    );
  }
});

test("8. Payment Aggregation Correctness Against Database Records", () => {
  const bundle = generateAllProjectFeatures(repo);

  for (const f of bundle.features.slice(0, 30)) {
    const dbPayments = repo.getProjectPayments(f.project_code);
    assert.strictEqual(
      f.payment.payment_count,
      dbPayments.length,
      `payment_count mismatch for ${f.project_code}`
    );

    const sumDb = dbPayments.reduce((s, p) => s + p.amount, 0);
    assert.strictEqual(
      f.payment.total_paid_amount,
      sumDb,
      `total_paid_amount mismatch for ${f.project_code}`
    );

    assert.ok(
      f.payment.disbursed_payment_ratio >= 0 && f.payment.disbursed_payment_ratio <= 1,
      `disbursed_payment_ratio must be between 0 and 1 for ${f.project_code}`
    );
  }
});

test("9. Contractor Context Features Aggregation", () => {
  const bundle = generateAllProjectFeatures(repo);
  const contractors = repo.getDistinctContractors();

  for (const c of contractors) {
    const contractorFeatures = bundle.features.filter((f) => f.categorical.contractor_id === c.id);
    if (contractorFeatures.length > 0) {
      const sample = contractorFeatures[0].contractor;
      assert.strictEqual(
        sample.contractor_total_projects,
        contractorFeatures.length,
        `contractor_total_projects mismatch for contractor ${c.id}`
      );
      assert.ok(
        sample.contractor_district_share_percentage >= 0 &&
          sample.contractor_district_share_percentage <= 100,
        "contractor_district_share_percentage must be between 0 and 100"
      );
    }
  }
});

test("10. Agency Context Features Aggregation", () => {
  const bundle = generateAllProjectFeatures(repo);
  const agencies = repo.getDistinctAgencies();

  for (const agencyName of agencies) {
    const agencyFeatures = bundle.features.filter(
      (f) => f.categorical.implementing_agency === agencyName
    );
    if (agencyFeatures.length > 0) {
      const sample = agencyFeatures[0].agency;
      assert.strictEqual(
        sample.agency_total_projects,
        agencyFeatures.length,
        `agency_total_projects mismatch for agency ${agencyName}`
      );
      assert.ok(
        sample.agency_district_share_percentage >= 0 &&
          sample.agency_district_share_percentage <= 100,
        "agency_district_share_percentage must be between 0 and 100"
      );
    }
  }
});

test("11. Documentation Aggregation Correctness Against Database Records", () => {
  const bundle = generateAllProjectFeatures(repo);

  for (const f of bundle.features.slice(0, 30)) {
    const dbDocs = repo.getProjectDocuments(f.project_code);
    assert.strictEqual(
      f.documentation.document_count,
      dbDocs.length,
      `document_count mismatch for ${f.project_code}`
    );

    const verifiedDb = dbDocs.filter((d) => d.verification_status === "Verified").length;
    assert.strictEqual(
      f.documentation.verified_document_count,
      verifiedDb,
      `verified_document_count mismatch for ${f.project_code}`
    );

    assert.ok(
      f.documentation.documentation_completeness_ratio >= 0 &&
        f.documentation.documentation_completeness_ratio <= 1,
      `completeness_ratio out of bounds for ${f.project_code}`
    );
  }
});

test("12. Missing-Value Handling Policy", () => {
  const bundle = generateAllProjectFeatures(repo);

  for (const f of bundle.features) {
    // If payment count < 2, avg_payment_interval_days must be explicitly null
    if (f.financial.payment_count < 2) {
      assert.strictEqual(
        f.temporal.avg_payment_interval_days,
        null,
        `avg_payment_interval_days must be null when payments < 2 for ${f.project_code}`
      );
    } else {
      assert.ok(
        typeof f.temporal.avg_payment_interval_days === "number",
        `avg_payment_interval_days must be a number when payments >= 2 for ${f.project_code}`
      );
    }

    // If progress event count < 2, avg_progress_interval_days must be explicitly null
    if (f.physical.progress_event_count < 2) {
      assert.strictEqual(
        f.temporal.avg_progress_interval_days,
        null,
        `avg_progress_interval_days must be null when progress events < 2 for ${f.project_code}`
      );
    }

    // If payment count === 0, days to first/final payment must be null
    if (f.payment.payment_count === 0) {
      assert.strictEqual(f.payment.days_to_first_payment, null);
      assert.strictEqual(f.payment.days_to_final_payment, null);
    }
  }
});

test("13. Feature Validation System & Error Detection", () => {
  const sample = generateProjectFeatures("MPLAD-DEMO-000001", repo)!;
  const validCheck = validateFeatureRecord(sample);
  assert.strictEqual(validCheck.valid, true, "Valid record must pass validation");
  assert.strictEqual(validCheck.errors.length, 0);

  // Negative amount error
  const invalidRecord: FeatureRecord = JSON.parse(JSON.stringify(sample));
  invalidRecord.financial.sanctioned_amount = -100;
  const res1 = validateFeatureRecord(invalidRecord);
  assert.strictEqual(res1.valid, false);
  assert.ok(res1.errors.some((e) => e.includes("financial.sanctioned_amount cannot be negative")));

  // Progress out of bounds
  const invalidRecord2: FeatureRecord = JSON.parse(JSON.stringify(sample));
  invalidRecord2.physical.reported_physical_progress = 120;
  const res2 = validateFeatureRecord(invalidRecord2);
  assert.strictEqual(res2.valid, false);
  assert.ok(res2.errors.some((e) => e.includes("physical.reported_physical_progress must be between 0 and 100")));

  // Version mismatch
  const invalidRecord3: FeatureRecord = JSON.parse(JSON.stringify(sample));
  invalidRecord3.metadata.feature_version = "0.9.0";
  const res3 = validateFeatureRecord(invalidRecord3);
  assert.strictEqual(res3.valid, false);
  assert.ok(res3.errors.some((e) => e.includes("Feature version mismatch")));
});

test("14. Zero Data Leakage (Strict Exclusion of scenario_type and anomaly labels)", () => {
  const bundle = generateAllProjectFeatures(repo);

  for (const f of bundle.features) {
    // 1. Direct property check on root
    assert.strictEqual(
      (f as any).scenario_type,
      undefined,
      `CRITICAL LEAKAGE: scenario_type found on root of ${f.project_code}`
    );
    assert.strictEqual(
      (f as any).scenario_description,
      undefined,
      `CRITICAL LEAKAGE: scenario_description found on root of ${f.project_code}`
    );

    // 2. Full JSON string serialization inspection
    const jsonStr = JSON.stringify(f);
    assert.ok(
      !jsonStr.includes('"scenario_type"'),
      `CRITICAL LEAKAGE: "scenario_type" key serialized in JSON for ${f.project_code}`
    );
    assert.ok(
      !jsonStr.includes('"scenario_description"'),
      `CRITICAL LEAKAGE: "scenario_description" key serialized in JSON for ${f.project_code}`
    );
    assert.ok(
      !jsonStr.includes('"risk_score"'),
      `CRITICAL LEAKAGE: "risk_score" key serialized in JSON for ${f.project_code}`
    );
    assert.ok(
      !jsonStr.includes('"anomaly_score"'),
      `CRITICAL LEAKAGE: "anomaly_score" key serialized in JSON for ${f.project_code}`
    );

    // 3. Ensure no ground truth scenario string tokens leak into categorical or other values
    assert.ok(!jsonStr.includes("DUPLICATE_SIGNAL"), "DUPLICATE_SIGNAL leaked into feature record");
    assert.ok(!jsonStr.includes("EXPENDITURE_SHIFT"), "EXPENDITURE_SHIFT leaked into feature record");
    assert.ok(!jsonStr.includes("TIMELINE_INCONSISTENCY"), "TIMELINE_INCONSISTENCY leaked into feature record");
    assert.ok(!jsonStr.includes("PHYSICAL_FINANCIAL_MISMATCH"), "PHYSICAL_FINANCIAL_MISMATCH leaked into feature record");
    assert.ok(!jsonStr.includes("PAYMENT_PATTERN_SIGNAL"), "PAYMENT_PATTERN_SIGNAL leaked into feature record");
    assert.ok(!jsonStr.includes("CONTRACTOR_CONCENTRATION"), "CONTRACTOR_CONCENTRATION leaked into feature record");
    assert.ok(!jsonStr.includes("MISSING_DOCUMENTATION"), "MISSING_DOCUMENTATION leaked into feature record");
    assert.ok(!jsonStr.includes("MULTI_SIGNAL"), "MULTI_SIGNAL leaked into feature record");
  }
});

test("15. No NaN or Infinity Values Across Entire Feature Dataset", () => {
  const bundle = generateAllProjectFeatures(repo);

  function assertFiniteRecursive(obj: any, path: string) {
    if (!obj || typeof obj !== "object") return;
    for (const [key, val] of Object.entries(obj)) {
      const currentPath = `${path}.${key}`;
      if (typeof val === "number") {
        assert.ok(
          !Number.isNaN(val),
          `NaN detected at ${currentPath}`
        );
        assert.ok(
          Number.isFinite(val),
          `Infinite value detected at ${currentPath}`
        );
      } else if (typeof val === "object" && val !== null) {
        assertFiniteRecursive(val, currentPath);
      }
    }
  }

  for (const f of bundle.features) {
    assertFiniteRecursive(f, f.project_code);
  }
});

test("16. Feature Version & Metadata Integrity", () => {
  const bundle = generateAllProjectFeatures(repo);
  assert.strictEqual(bundle.metadata.feature_version, FEATURE_VERSION);
  assert.strictEqual(bundle.metadata.record_count, 300);
  assert.ok(bundle.metadata.disclaimer.includes("DESCRIPTIVE FEATURES ONLY"));

  for (const f of bundle.features) {
    assert.strictEqual(f.metadata.feature_version, FEATURE_VERSION);
    assert.strictEqual(f.metadata.reference_audit_date, REFERENCE_AUDIT_DATE);
    assert.strictEqual(f.metadata.source_database, "mplad_database.sqlite");
  }
});

test("17. Full Pipeline Execution & Export Verification", () => {
  const exportPath = path.join(process.cwd(), "data", "processed", "project_features.json");
  const result = exportProjectFeatures({ repo, outputPath: exportPath });

  assert.strictEqual(result.recordCount, 300);
  assert.ok(fs.existsSync(exportPath), "Export artifact must exist on disk");

  const fileContent = fs.readFileSync(exportPath, "utf8");
  const parsed = JSON.parse(fileContent);
  assert.strictEqual(parsed.metadata.record_count, 300);
  assert.strictEqual(parsed.features.length, 300);
  assert.strictEqual(parsed.metadata.feature_version, FEATURE_VERSION);
});
