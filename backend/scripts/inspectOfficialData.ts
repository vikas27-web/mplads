import fs from "node:fs";
import path from "node:path";

const filePath = path.join(process.cwd(), "data", "official", "Allocated Limit for Honble MPs.csv");
const raw = fs.readFileSync(filePath, "utf8");

function parseCsv(text: string) {
  const lines = text.trim().split(/\r?\n/);
  const header = parseLine(lines[0]);
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const values = parseLine(lines[i]);
    const obj: Record<string, string> = {};
    header.forEach((h, idx) => {
      obj[h] = values[idx] !== undefined ? values[idx].trim() : "";
    });
    rows.push(obj);
  }
  return { header, rows };
}

function parseLine(line: string): string[] {
  const result: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === "," && !inQuotes) {
      result.push(cur);
      cur = "";
    } else {
      cur += c;
    }
  }
  result.push(cur);
  return result;
}

const { header, rows } = parseCsv(raw);

console.log("=== OFFICIAL DATASET INSPECTION ===");
console.log("File:", filePath);
console.log("Total Rows:", rows.length);
console.log("Total Columns:", header.length);
console.log("Columns:", header);

// Missing values
const missing: Record<string, number> = {};
header.forEach((h) => (missing[h] = 0));
rows.forEach((r) => {
  header.forEach((h) => {
    if (!r[h] || r[h] === "") missing[h]++;
  });
});
console.log("Missing counts:", missing);

// Unique stats
const states = new Set(rows.map((r) => r["State"]));
const mps = new Set(rows.map((r) => r["Hon'ble Members of Parliaments"]));
const constituencies = new Set(rows.map((r) => r["Constituency"]));

console.log("Distinct States (" + states.size + "):", Array.from(states).sort());
console.log("Distinct MPs:", mps.size);
console.log("Distinct Constituencies:", constituencies.size);

// Financial amounts
const amounts = rows.map((r) => {
  const cleaned = r["Allocated AMOUNT ( ₹ )"].replace(/[^0-9.]/g, "");
  return parseFloat(cleaned) || 0;
});
const min = Math.min(...amounts);
const max = Math.max(...amounts);
const sum = amounts.reduce((a, b) => a + b, 0);
const avg = sum / amounts.length;

console.log("\n=== FINANCIAL STATISTICS ===");
console.log("Min Allocation: ₹" + min.toLocaleString("en-IN"));
console.log("Max Allocation: ₹" + max.toLocaleString("en-IN"));
console.log("Mean Allocation: ₹" + Math.round(avg).toLocaleString("en-IN"));
console.log("Total Outlay: ₹" + sum.toLocaleString("en-IN") + " (" + (sum / 1e7).toFixed(2) + " Crore)");

// Distribution of amounts
const amountCounts: Record<number, number> = {};
amounts.forEach((amt) => {
  amountCounts[amt] = (amountCounts[amt] || 0) + 1;
});
console.log("\nTop Allocation Brackets (INR):");
Object.entries(amountCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5)
  .forEach(([amt, count]) => {
    console.log(`  ₹${parseFloat(amt).toLocaleString("en-IN")}: ${count} MPs (${((count / rows.length) * 100).toFixed(1)}%)`);
  });

// Duplicate check
const srNos = rows.map((r) => r["Sr. No."]);
const uniqueSrNos = new Set(srNos);
console.log("\nUnique Sr. No. count:", uniqueSrNos.size, "out of", rows.length);

const constituencyCounts: Record<string, number> = {};
rows.forEach((r) => {
  const key = `${r["State"]}__${r["Constituency"]}`.toUpperCase();
  constituencyCounts[key] = (constituencyCounts[key] || 0) + 1;
});
const duplicateConstituencies = Object.entries(constituencyCounts).filter(([_, c]) => c > 1);
console.log("Duplicate (State, Constituency) pairs:", duplicateConstituencies);

console.log("\n=== SUSPICIOUS / OUTLIER ROWS ===");
rows.forEach((r, i) => {
  const amt = parseFloat(r["Allocated AMOUNT ( ₹ )"].replace(/[^0-9.]/g, "")) || 0;
  if (amt > 1e9 || amt === 0 || !r["State"] || r["Constituency"] === "NANDED") {
    console.log(`Row #${i + 1} (Sr. No: ${r["Sr. No."]}): State="${r["State"]}", MP="${r["Hon'ble Members of Parliaments"]}", Constituency="${r["Constituency"]}", Amount="₹${r["Allocated AMOUNT ( ₹ )"]}"`);
  }
});

