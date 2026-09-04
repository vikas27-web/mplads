/**
 * MPLAD SENTINEL — Phase 12 Official Dataset Ingestion & Reconciliation Pipeline
 * SIH26102
 */

import fs from "node:fs";
import path from "node:path";
import { parseOfficialCsv, cleanCurrencyAmount } from "./parser.ts";
import { normalizeRecord } from "./normalizer.ts";
import type { NormalizedOfficialAllocation, OfficialIngestionReport } from "./types.ts";

export interface IngestionResult {
  allocations: NormalizedOfficialAllocation[];
  report: OfficialIngestionReport;
}

export function runOfficialIngestionPipeline(
  customCsvPath?: string,
  outputPath?: string
): IngestionResult {
  const csvPath =
    customCsvPath ||
    path.join(process.cwd(), "data", "official", "Allocated Limit for Honble MPs.csv");

  if (!fs.existsSync(csvPath)) {
    throw new Error(`Official dataset file not found at: ${csvPath}`);
  }

  const rawCsv = fs.readFileSync(csvPath, "utf-8");
  const rawRows = parseOfficialCsv(rawCsv);

  const allocations: NormalizedOfficialAllocation[] = [];
  const validationErrors: Array<{ row: number; identifier: string; error: string }> = [];
  const missingFieldStats: Record<string, number> = {
    state: 0,
    mpName: 0,
    constituency: 0,
    allocatedAmount: 0,
  };

  const stateBreakdown: Record<
    string,
    { count: number; totalAllocated: number; totalAllocatedCrores: number }
  > = {};

  let grandTotalRowsExcluded = 0;
  let nationalGrandTotalReported = 0;
  let nationalTotalAllocated = 0;
  const seenIds = new Set<string>();
  let duplicateRows = 0;

  rawRows.forEach((row, idx) => {
    const rowNumber = idx + 2; // Accounting for 1-based index and header

    const { allocation, isGrandTotal, error } = normalizeRecord(
      row,
      rowNumber,
      path.basename(csvPath)
    );

    if (isGrandTotal) {
      grandTotalRowsExcluded++;
      const { amount } = cleanCurrencyAmount(row.allocatedAmountRaw);
      nationalGrandTotalReported = amount;
      return;
    }

    if (error || !allocation) {
      validationErrors.push({
        row: rowNumber,
        identifier: row.srNo || `row-${rowNumber}`,
        error: error || "Normalization failed",
      });
      return;
    }

    // Missing field tracking
    if (!row.state) missingFieldStats.state++;
    if (!row.mpName) missingFieldStats.mpName++;
    if (!row.constituency) missingFieldStats.constituency++;
    if (!row.allocatedAmountRaw) missingFieldStats.allocatedAmount++;

    // Duplicate check
    if (seenIds.has(allocation.id)) {
      duplicateRows++;
      validationErrors.push({
        row: rowNumber,
        identifier: allocation.id,
        error: `Duplicate synthesized ID detected: ${allocation.id}`,
      });
    } else {
      seenIds.add(allocation.id);
    }

    allocations.push(allocation);
    nationalTotalAllocated += allocation.allocatedAmount;

    // State aggregation
    if (!stateBreakdown[allocation.state]) {
      stateBreakdown[allocation.state] = {
        count: 0,
        totalAllocated: 0,
        totalAllocatedCrores: 0,
      };
    }
    stateBreakdown[allocation.state].count++;
    stateBreakdown[allocation.state].totalAllocated += allocation.allocatedAmount;
    stateBreakdown[allocation.state].totalAllocatedCrores = Number(
      (stateBreakdown[allocation.state].totalAllocated / 10000000).toFixed(4)
    );
  });

  const reconciliationDelta = nationalTotalAllocated - nationalGrandTotalReported;

  const report: OfficialIngestionReport = {
    sourceFiles: [path.basename(csvPath)],
    totalRowsRead: rawRows.length,
    grandTotalRowsExcluded,
    acceptedRows: allocations.length,
    rejectedRows: validationErrors.length,
    duplicateRows,
    missingFieldStats,
    stateBreakdown,
    nationalTotalAllocated,
    nationalTotalAllocatedCrores: Number((nationalTotalAllocated / 10000000).toFixed(2)),
    nationalGrandTotalReported,
    reconciliationDelta,
    validationErrors,
    generatedAt: new Date().toISOString(),
  };

  // Persist report and normalized allocations
  const processedDir = path.join(process.cwd(), "data", "processed");
  if (!fs.existsSync(processedDir)) {
    fs.mkdirSync(processedDir, { recursive: true });
  }

  const reportPath = path.join(processedDir, "official_ingestion_report.json");
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf-8");

  const allocationsPath = outputPath || path.join(processedDir, "official_allocations.json");
  fs.writeFileSync(allocationsPath, JSON.stringify(allocations, null, 2), "utf-8");

  return { allocations, report };
}
