/**
 * MPLAD SENTINEL — Phase 12 CSV Parsing & Financial Sanitization
 * SIH26102
 */

import type { RawOfficialRecord } from "./types.ts";

/**
 * Splits a CSV text into array of tokens respecting quoted strings.
 */
export function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === "," && !inQuotes) {
      result.push(cur.trim());
      cur = "";
    } else {
      cur += c;
    }
  }
  result.push(cur.trim());
  return result;
}

/**
 * Parses raw CSV content into RawOfficialRecord objects.
 */
export function parseOfficialCsv(csvText: string): RawOfficialRecord[] {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const rawHeader = parseCsvLine(lines[0]);
  const records: RawOfficialRecord[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const cols = parseCsvLine(line);
    records.push({
      srNo: cols[0] ?? "",
      state: cols[1] ?? "",
      mpName: cols[2] ?? "",
      constituency: cols[3] ?? "",
      allocatedAmountRaw: cols[4] ?? "",
    });
  }

  return records;
}

/**
 * Parses currency string into numeric INR amount safely.
 * Handles commas, Rupee symbols (₹, Rs), whitespace, and decimal fractions.
 */
export function cleanCurrencyAmount(val: string): { amount: number; isMissing: boolean } {
  if (!val || !val.trim()) {
    return { amount: 0, isMissing: true };
  }

  // Remove currency signs, commas, and whitespace
  const cleaned = val.replace(/[^0-9.]/g, "");
  if (!cleaned) {
    return { amount: 0, isMissing: true };
  }

  const num = parseFloat(cleaned);
  if (Number.isNaN(num)) {
    return { amount: 0, isMissing: true };
  }

  return { amount: num, isMissing: false };
}
