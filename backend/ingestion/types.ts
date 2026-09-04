/**
 * MPLAD SENTINEL — Phase 12 Official Dataset Ingestion Types
 * SIH26102
 */

export interface RawOfficialRecord {
  srNo: string;
  state: string;
  mpName: string;
  constituency: string;
  allocatedAmountRaw: string;
}

export interface NormalizedOfficialAllocation {
  id: string; // e.g. "MPLAD-OFFICIAL-001"
  srNo: number;
  state: string;
  stateCode: string;
  mpName: string;
  constituency: string;
  rawConstituency: string;
  reservationCategory: "GENERAL" | "SC" | "ST";
  allocatedAmount: number; // in INR
  allocatedAmountCrores: number;
  baselineDivergencePct: number; // % deviation from standard ₹14.70 Cr
  dataQualityNotes: string[];
  sourceMetadata: {
    sourceFile: string;
    sourceRow: number;
    importedAt: string;
    schemaVersion: string;
  };
}

export interface OfficialIngestionReport {
  sourceFiles: string[];
  totalRowsRead: number;
  grandTotalRowsExcluded: number;
  acceptedRows: number;
  rejectedRows: number;
  duplicateRows: number;
  missingFieldStats: Record<string, number>;
  stateBreakdown: Record<
    string,
    { count: number; totalAllocated: number; totalAllocatedCrores: number }
  >;
  nationalTotalAllocated: number;
  nationalTotalAllocatedCrores: number;
  nationalGrandTotalReported: number;
  reconciliationDelta: number;
  validationErrors: Array<{ row: number; identifier: string; error: string }>;
  generatedAt: string;
}
