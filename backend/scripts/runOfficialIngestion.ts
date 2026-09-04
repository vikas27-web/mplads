/**
 * MPLAD SENTINEL — Phase 12 CLI Script: Run Official Dataset Ingestion
 */

import { runOfficialIngestionPipeline } from "../ingestion/importPipeline.ts";

console.log("==================================================");
console.log("  MPLAD SENTINEL — PHASE 12 OFFICIAL DATA INGESTION");
console.log("==================================================");

try {
  const result = runOfficialIngestionPipeline();
  console.log(`✓ Ingested Allocations:        ${result.allocations.length}`);
  console.log(`✓ Grand Total Summary Rows:    ${result.report.grandTotalRowsExcluded}`);
  console.log(`✓ Rejected / Invalid Rows:     ${result.report.rejectedRows}`);
  console.log(`✓ Duplicate IDs Detected:      ${result.report.duplicateRows}`);
  console.log(`✓ National Total Outlay:       ₹${result.report.nationalTotalAllocatedCrores.toLocaleString("en-IN")} Crore`);
  console.log(`✓ National Reported Ceiling:   ₹${(result.report.nationalGrandTotalReported / 10000000).toLocaleString("en-IN")} Crore`);
  console.log(`✓ Reconciled Delta:            ₹${result.report.reconciliationDelta.toFixed(2)}`);
  console.log(`✓ Total States / UTs Ingested: ${Object.keys(result.report.stateBreakdown).length}`);
  console.log("✓ Ingestion report generated:  data/processed/official_ingestion_report.json");
  console.log("==================================================");
} catch (err: any) {
  console.error("❌ Ingestion pipeline failed:", err.message);
  process.exit(1);
}
