import test from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { parseOfficialCsv, cleanCurrencyAmount } from "../ingestion/index.ts";
import { DatabaseManager } from "../database/sqlite.ts";
import { ProjectRepository } from "../repository/projectRepository.ts";
import { getDashboardData } from "../api/services/dashboardService.ts";
import { getProjectInvestigationDossier } from "../api/services/investigationService.ts";

const OFFICIAL_CSV_PATH = path.resolve(process.cwd(), "data/official/Allocated Limit for Honble MPs.csv");
const OFFICIAL_ALLOCATIONS_JSON = path.resolve(process.cwd(), "data/processed/official_allocations.json");
const INGESTION_REPORT_JSON = path.resolve(process.cwd(), "data/processed/official_ingestion_report.json");
const PROJECT_FEATURES_JSON = path.resolve(process.cwd(), "data/processed/project_features.json");
const OFFICIAL_FEATURES_JSON = path.resolve(process.cwd(), "data/processed/official_project_features.json");
const ANOMALY_RESULTS_JSON = path.resolve(process.cwd(), "data/processed/anomaly_results.json");

test("1. Official Dataset Loads Successfully", () => {
  assert.ok(fs.existsSync(OFFICIAL_CSV_PATH), `Official CSV must exist at ${OFFICIAL_CSV_PATH}`);
  const rawCsv = fs.readFileSync(OFFICIAL_CSV_PATH, "utf-8");
  assert.ok(rawCsv.length > 1000, "Raw CSV content should not be empty");
  assert.ok(rawCsv.includes("Hon'ble Members of Parliaments"), "CSV must contain official header");
  assert.ok(rawCsv.includes("Allocated AMOUNT"), "CSV must contain official allocated amount header");
  assert.ok(rawCsv.includes("Narendra Modi"), "CSV must contain known official MP record");
});

test("2. Row Counts and Total Allocations Match Source", () => {
  const rawCsv = fs.readFileSync(OFFICIAL_CSV_PATH, "utf-8");
  const records = parseOfficialCsv(rawCsv);
  assert.strictEqual(records.length, 544, "Raw CSV must contain exactly 544 rows (543 MPs + 1 Grand Total)");
  const mpRecords = records.filter((r) => r.srNo !== "Grand Total");
  assert.strictEqual(mpRecords.length, 543, "Must contain exactly 543 Lok Sabha MP records");
  const grandTotal = records.find((r) => r.srNo === "Grand Total");
  assert.ok(grandTotal, "Grand Total row must be present");
  assert.strictEqual(
    grandTotal.allocatedAmountRaw.trim(),
    "83,18,05,53,325.71",
    "Grand Total formatted string must match official CSV value"
  );
  const { amount: grandTotalAmount } = cleanCurrencyAmount(grandTotal.allocatedAmountRaw);
  assert.strictEqual(
    grandTotalAmount,
    83180553325.71,
    "Grand Total numeric value must match ₹8,318.05 Cr"
  );

  // Ingestion report check
  assert.ok(fs.existsSync(INGESTION_REPORT_JSON), "Ingestion report must exist");
  const report = JSON.parse(fs.readFileSync(INGESTION_REPORT_JSON, "utf-8"));
  assert.strictEqual(report.acceptedRows, 543, "Accepted rows must be exactly 543");
  assert.strictEqual(report.rejectedRows, 0, "Rejected rows must be 0");
  assert.strictEqual(report.duplicateRows, 0, "Duplicate rows must be 0");
  assert.ok(report.reconciliationDelta < 0.01, "Reconciliation delta must be approximately 0.00");
});

test("3. Required Identifiers and Canonical Structure", () => {
  assert.ok(fs.existsSync(OFFICIAL_ALLOCATIONS_JSON), "Official allocations JSON must exist");
  const allocations = JSON.parse(fs.readFileSync(OFFICIAL_ALLOCATIONS_JSON, "utf-8"));
  assert.strictEqual(allocations.length, 543, "Allocations array must contain 543 entries");

  for (const record of allocations) {
    assert.match(
      record.id,
      /^MPLAD-OFFICIAL-[A-Z]{2}-\d+$/,
      `id ${record.id} must follow canonical naming format`
    );
    assert.ok(record.mpName && record.mpName.trim().length > 0, "MP name must be non-empty");
    assert.ok(record.state && record.state.trim().length > 0, "State must be non-empty");
    assert.ok(record.constituency && record.constituency.trim().length > 0, "Constituency must be non-empty");
    assert.strictEqual(typeof record.allocatedAmount, "number", "Allocated limit must be a number");
  }
});

test("4. Unique Identifiers and No Duplicate IDs", () => {
  const allocations = JSON.parse(fs.readFileSync(OFFICIAL_ALLOCATIONS_JSON, "utf-8"));
  const idSet = new Set<string>();
  for (const r of allocations) {
    assert.ok(!idSet.has(r.id), `Duplicate id found: ${r.id}`);
    idSet.add(r.id);
  }
  assert.strictEqual(idSet.size, 543, "All 543 ids must be strictly unique");
});

test("5. Dates Parse Correctly and Safely", () => {
  const allocations = JSON.parse(fs.readFileSync(OFFICIAL_ALLOCATIONS_JSON, "utf-8"));
  for (const r of allocations) {
    assert.ok(r.sourceMetadata?.importedAt, "Imported timestamp must exist");
    const d = new Date(r.sourceMetadata.importedAt);
    assert.ok(!isNaN(d.getTime()), "Import timestamp must be a valid date");
  }
});

test("6. Monetary Fields Parse with Exact Indian Number Formatting", () => {
  const allocations = JSON.parse(fs.readFileSync(OFFICIAL_ALLOCATIONS_JSON, "utf-8"));
  const sum = allocations.reduce((acc: number, r: any) => acc + r.allocatedAmount, 0);
  const diff = Math.abs(sum - 83180553325.71);
  assert.ok(diff < 0.05, `Calculated sum ₹${sum} must match Grand Total ₹83180553325.71 within float rounding`);
});

test("7. Missing and Zero Values Handled Explicitly", () => {
  const allocations = JSON.parse(fs.readFileSync(OFFICIAL_ALLOCATIONS_JSON, "utf-8"));
  // Row 108 is Nanded (CHAVAN VASANTRAO BALWANTRAO) which has 0 allocation
  const nanded = allocations.find((r: any) => r.srNo === 108);
  assert.ok(nanded, "Nanded record must be present");
  assert.strictEqual(nanded.allocatedAmount, 0, "Nanded allocation must be exactly 0");
  assert.strictEqual(nanded.allocatedAmountCrores, 0, "Nanded crores must be 0");
  assert.ok(nanded.dataQualityNotes.length > 0, "Data quality notes must explicitly document zero allocation");
  assert.strictEqual(nanded.sourceMetadata.sourceRow, 109, "CSV row must match 109");
});

test("8. No Synthetic Records Enter Official Primary Database", () => {
  const repo = new ProjectRepository();
  const count = repo.getProjectCount();
  assert.strictEqual(count, 543, "Primary SQLite database must contain exactly 543 official records");

  const dbManager = new DatabaseManager();
  const db = dbManager.getRawDb();
  const syntheticCount = (db.prepare("SELECT COUNT(*) as count FROM projects WHERE project_code LIKE 'MPLAD-DEMO-%'").get() as any).count;
  assert.strictEqual(syntheticCount, 0, "Zero synthetic (MPLAD-DEMO-) records must be in official database");

  const officialCount = (db.prepare("SELECT COUNT(*) as count FROM projects WHERE project_code LIKE 'MPLAD-OFFICIAL-%'").get() as any).count;
  assert.strictEqual(officialCount, 543, "All 543 records in database must be official records");
});

test("9. No Scenario Type or Ground Truth Enters Feature Vectors", () => {
  assert.ok(fs.existsSync(PROJECT_FEATURES_JSON), "Project features JSON must exist");
  const rawFeatures = JSON.parse(fs.readFileSync(PROJECT_FEATURES_JSON, "utf-8"));
  const features = rawFeatures.features || rawFeatures;
  assert.strictEqual(features.length, 543, "Feature vector count must be 543");

  for (const f of features) {
    assert.strictEqual(f.scenario_type, undefined, "scenario_type must NEVER be in operational feature vector");
    assert.strictEqual(f.scenario_description, undefined, "scenario_description must NEVER be in operational feature vector");
    assert.strictEqual(f.ground_truth, undefined, "ground_truth must NEVER be in operational feature vector");
    assert.strictEqual(f.is_synthetic_benchmark, undefined, "synthetic ground truth must be absent");
  }
});

test("10. Feature Provenance Tracking & No Fabricated Fields", () => {
  assert.ok(fs.existsSync(OFFICIAL_FEATURES_JSON), "Official feature JSON must exist");
  const officialFeaturesData = JSON.parse(fs.readFileSync(OFFICIAL_FEATURES_JSON, "utf-8"));
  const records = officialFeaturesData.officialFeatures || officialFeaturesData;
  assert.strictEqual(records.length, 543, "Official features array must contain 543 records");

  const sample = records[0];
  assert.ok(Array.isArray(sample.provenance), "Sample record must include provenance array");
  const provMap = new Map(sample.provenance.map((p: any) => [p.feature, p.status]));
  assert.strictEqual(provMap.get("allocated_amount"), "AVAILABLE");
  assert.strictEqual(provMap.get("allocated_amount_crores"), "DERIVED");
  assert.strictEqual(provMap.get("physical_progress"), "NOT_AVAILABLE");
  assert.strictEqual(provMap.get("contractor_name"), "NOT_AVAILABLE");
  assert.strictEqual(provMap.get("payment_tranches"), "NOT_AVAILABLE");
  assert.strictEqual(provMap.get("statutory_documents"), "NOT_AVAILABLE");
});

test("11. API Returns Official Records", () => {
  const repo = new ProjectRepository();
  const result = repo.getProjects({ limit: 10, offset: 0 });
  assert.strictEqual(result.projects.length, 10, "API must return requested page size");
  assert.strictEqual(result.total, 543, "API total count must be 543");
  for (const p of result.projects) {
    assert.ok(p.project_code.startsWith("MPLAD-OFFICIAL-"), "All API returned projects must be official records");
  }
});

test("12. Dashboard Statistics Match Database Counts", () => {
  const data = getDashboardData();
  assert.strictEqual(data.kpis.totalProjects, 543, "Dashboard totalProjects must equal 543");
  assert.ok(data.dataQuality, "dataQuality must be defined");
  assert.strictEqual(data.dataQuality.acceptedRows, 543, "Data quality accepted rows must be 543");
  assert.strictEqual(data.dataQuality.rejectedRows, 0, "Data quality rejected rows must be 0");
  assert.ok(data.dataSource && data.dataSource.includes("SIH26102"), "Banner must reference SIH26102");
});

test("13. Project Detail Matches Database Source Values", () => {
  // Check Varanasi (Shri Narendra Modi)
  const varanasi = getProjectInvestigationDossier("MPLAD-OFFICIAL-UP-457");
  assert.ok(varanasi, "Varanasi project dossier must exist");
  assert.strictEqual(varanasi.constituency, "VARANASI");
  assert.strictEqual(varanasi.state, "Uttar Pradesh");
  assert.ok(varanasi.title.includes("Shri Narendra Modi"), "Title must contain MP name");
  assert.strictEqual(varanasi.sanctionedAmount, 162070276.11, "Sanctioned amount must be ₹16.21 Cr");
  assert.strictEqual(varanasi.contractorName, "Not available in source dataset");
  assert.strictEqual(varanasi.physicalVerificationEvidence.reportedCompletionState, "Not available in source dataset");
  assert.strictEqual(varanasi.isDemoData, false, "Must not be demo data");
});

test("14. Anomaly Engine Never Uses Unavailable Fields", () => {
  assert.ok(fs.existsSync(ANOMALY_RESULTS_JSON), "Anomaly results JSON must exist");
  const anomalyResults = JSON.parse(fs.readFileSync(ANOMALY_RESULTS_JSON, "utf-8"));
  assert.strictEqual(anomalyResults.length, 543, "Anomaly engine must have evaluated all 543 official records");

  for (const p of anomalyResults) {
    for (const sig of p.signals) {
      assert.notStrictEqual(
        sig.signalType,
        "PHYSICAL_FINANCIAL_MISMATCH",
        "Physical/Financial mismatch detector must NEVER run when physical progress is unavailable"
      );
      assert.notStrictEqual(
        sig.signalType,
        "INFLATED_COST_PER_UNIT",
        "Cost per unit detector must NEVER run when item units are unavailable"
      );
    }
  }
});

test("15. Responsible-AI Terminology Compliance", () => {
  const anomalyResultsStr = fs.readFileSync(ANOMALY_RESULTS_JSON, "utf-8");
  const forbiddenTerms = [
    "fraud confirmed",
    "fraudulent contractor",
    "fraudulent project",
    "criminal act",
    "corrupt official",
    "guilty of fraud",
  ];

  for (const term of forbiddenTerms) {
    assert.strictEqual(
      anomalyResultsStr.toLowerCase().includes(term),
      false,
      `Anomaly results must not contain forbidden accusatory phrase: "${term}"`
    );
  }
});
