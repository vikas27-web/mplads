/**
 * MPLAD SENTINEL — Phase 12 Entity Normalization Layer
 * SIH26102
 */

import { cleanCurrencyAmount } from "./parser.ts";
import type { RawOfficialRecord, NormalizedOfficialAllocation } from "./types.ts";

export const STANDARD_MPLAD_BASELINE_INR = 147000000; // ₹14.70 Crore baseline

export const STATE_CODE_MAP: Record<string, string> = {
  "Andaman And Nicobar Islands": "AN",
  "Andhra Pradesh": "AP",
  "Arunachal Pradesh": "AR",
  "Assam": "AS",
  "Bihar": "BR",
  "Chandigarh": "CH",
  "Chhattisgarh": "CG",
  "Delhi": "DL",
  "Goa": "GA",
  "Gujarat": "GJ",
  "Haryana": "HR",
  "Himachal Pradesh": "HP",
  "Jammu And Kashmir": "JK",
  "Jharkhand": "JH",
  "Karnataka": "KA",
  "Kerala": "KL",
  "Ladakh": "LA",
  "Lakshadweep": "LD",
  "Madhya Pradesh": "MP",
  "Maharashtra": "MH",
  "Manipur": "MN",
  "Meghalaya": "ML",
  "Mizoram": "MZ",
  "Nagaland": "NL",
  "Odisha": "OD",
  "Puducherry": "PY",
  "Punjab": "PB",
  "Rajasthan": "RJ",
  "Sikkim": "SK",
  "Tamil Nadu": "TN",
  "Telangana": "TG",
  "The Dadra And Nagar Haveli And Daman And Diu": "DN",
  "Tripura": "TR",
  "Uttar Pradesh": "UP",
  "Uttarakhand": "UK",
  "West Bengal": "WB",
};

/**
 * Normalizes raw state names and assigns 2-letter state codes.
 */
export function normalizeState(rawState: string): { state: string; stateCode: string } {
  const trimmed = rawState.trim();
  const stateCode = STATE_CODE_MAP[trimmed] || "IN";
  return { state: trimmed, stateCode };
}

/**
 * Extracts reservation category and clean display name from raw constituency string.
 */
export function normalizeConstituency(raw: string): {
  cleanName: string;
  reservationCategory: "GENERAL" | "SC" | "ST";
} {
  const trimmed = raw.trim();

  let reservationCategory: "GENERAL" | "SC" | "ST" = "GENERAL";
  if (/\(SC\)/i.test(trimmed)) {
    reservationCategory = "SC";
  } else if (/\(ST\)/i.test(trimmed)) {
    reservationCategory = "ST";
  }

  // Remove state suffixes like _BR, _UP, _MH, and category markers for display
  const cleanName = trimmed
    .replace(/\((?:SC|ST)\)/gi, "")
    .replace(/_(?:BR|UP|MH|HP)$/gi, "")
    .trim();

  return { cleanName, reservationCategory };
}

/**
 * Normalizes an individual row into the canonical NormalizedOfficialAllocation schema.
 */
export function normalizeRecord(
  raw: RawOfficialRecord,
  rowIndex: number,
  sourceFile: string
): { allocation?: NormalizedOfficialAllocation; isGrandTotal: boolean; error?: string } {
  const srNoRaw = raw.srNo.trim();

  // 1. Identify Grand Total summary row
  if (srNoRaw.toLowerCase().includes("grand total") || !raw.state) {
    return { isGrandTotal: true };
  }

  const srNo = parseInt(srNoRaw, 10);
  if (Number.isNaN(srNo)) {
    return { isGrandTotal: false, error: `Invalid Sr. No. "${srNoRaw}" at row ${rowIndex}` };
  }

  const { state, stateCode } = normalizeState(raw.state);
  const { cleanName, reservationCategory } = normalizeConstituency(raw.constituency);
  const { amount, isMissing } = cleanCurrencyAmount(raw.allocatedAmountRaw);

  const dataQualityNotes: string[] = [];
  if (isMissing || amount === 0) {
    dataQualityNotes.push("Zero/missing allocation limit in official source publication (e.g. seat vacancy or mid-term transition).");
  }

  // Baseline divergence percentage
  const baselineDivergencePct =
    amount > 0
      ? Number((((amount - STANDARD_MPLAD_BASELINE_INR) / STANDARD_MPLAD_BASELINE_INR) * 100).toFixed(2))
      : -100.0;

  // Format ID with 3-digit padding
  const paddedNo = String(srNo).padStart(3, "0");
  const id = `MPLAD-OFFICIAL-${stateCode}-${paddedNo}`;

  const allocation: NormalizedOfficialAllocation = {
    id,
    srNo,
    state,
    stateCode,
    mpName: raw.mpName.trim(),
    constituency: cleanName,
    rawConstituency: raw.constituency.trim(),
    reservationCategory,
    allocatedAmount: amount,
    allocatedAmountCrores: Number((amount / 10000000).toFixed(4)),
    baselineDivergencePct,
    dataQualityNotes,
    sourceMetadata: {
      sourceFile,
      sourceRow: rowIndex,
      importedAt: new Date().toISOString(),
      schemaVersion: "1.0.0-official",
    },
  };

  return { allocation, isGrandTotal: false };
}
