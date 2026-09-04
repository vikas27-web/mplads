# Official SIH Dataset Inventory & Schema Discovery
**Smart India Hackathon 2024 — SIH26102: MPLAD Scheme Audit Intelligence Platform**

---

## 1. Dataset Overview & Source Lineage

| Attribute | Specification |
|---|---|
| **Primary Dataset Filename** | `Allocated Limit for Honble MPs.csv` |
| **Companion Source Document** | `Allocated Limit for Honble MPs.pdf` (19 pages, MoSPI Official Report) |
| **Dataset Source** | Ministry of Statistics and Programme Implementation (MoSPI) / MPLADS Portal (`mplads.gov.in` / `data.gov.in`) |
| **Supplied Location** | `data/official/Allocated Limit for Honble MPs.csv` (SHA256: `775F7CB9F3F29B180CB7461EAE23215BC7FAF6439760F5D7375A6755221BAFD8`) |
| **File Format** | RFC 4180 Comma-Separated Values (CSV), UTF-8 encoded with double-quoted string literals |
| **File Size** | 36,142 bytes (35.3 KB) |
| **Total Lines in File** | 545 lines (1 Header Row + 544 Data Rows) |
| **Total Official Entity Rows** | **543 Parliamentary Constituency Allocations** + 1 Grand Total Summary Row |
| **Target Parliamentary Body** | 18th Lok Sabha (Lower House of the Parliament of India) |

---

## 2. Source Files Inventory

| Filename | Type | Size | Row Count | Role in System |
|---|---|---|---|---|
| `Allocated Limit for Honble MPs.csv` | CSV | 36,142 B | 544 rows | **Operational Primary Source**: Canonical MP and constituency allocation limits. |
| `Allocated Limit for Honble MPs.pdf` | PDF | 99,788 B | 19 pages | **Authoritative Reference**: Published government sanction summary table with grand totals. |
| `demo_mplads.csv` *(Historical)* | CSV | 417,913 B | 600 rows | **Isolated Benchmark Archive**: Retained strictly under `data/benchmark/` for regression tests. |

---

## 3. Detailed Column Specification & Statistical Profile

| # | Source Column Name | Target Data Type | Null Count | Null % | Distinct Values | Sample Source Value | Description & Constraints |
|---|---|---|---|---|---|---|---|
| 1 | `Sr. No.` | Integer / String | 0 | 0.0% | 544 | `"1"`, `"108"`, `"Grand Total"` | Sequential numbering (1 to 543) plus `"Grand Total"` for summary row. |
| 2 | `State` | String | 1 | 0.18% | 36 States/UTs | `"Maharashtra"`, `"Uttar Pradesh"` | Name of State or Union Territory. Empty only on Grand Total row. |
| 3 | `Hon'ble Members of Parliaments` | String | 1 | 0.18% | 544 distinct | `"Narendra Modi"`, `"Akhilesh Yadav"` | Official name of the elected Member of Parliament. |
| 4 | `Constituency` | String | 1 | 0.18% | 543 distinct | `"VARANASI"`, `"KANNAUJ"`, `"NANDED"` | Parliamentary constituency name with optional reservation tags `(SC)`, `(ST)`. |
| 5 | `Allocated AMOUNT ( ₹ )` | Decimal (Float64) | 1 | 0.18% | 34 distinct | `"147000000"`, `"83180553325.71"` | Cumulative MPLADS fund allocation limit in Indian Rupees (₹). |

---

## 4. Financial Outlay Profile

- **Baseline Allocation Level:** **₹14,70,00,000** (₹14.70 Crore) — applies to **386 MPs (71.1%)**
- **Minimum Allocation:** **₹0** (Row #108: Late MP Chavan Vasantrao Balwantrao, Nanded, Maharashtra)
- **Second Minimum Allocation:** **₹4,90,00,000** (Row #474: SK Nurul Islam, Basirhat, West Bengal)
- **Maximum Individual Allocation:** **₹32,74,77,390.86** (₹32.75 Crore) (Row #168: Eatala Rajender, Malkajgiri, Telangana)
- **Mean Individual Allocation:** **₹15,31,87,022.70** (~₹15.32 Crore across 543 MPs)
- **National Grand Total Outlay:** **₹83,18,05,53,325.71** (**₹8,318.05 Crore**)

---

## 5. Geographic & Regional Distribution

All 36 States and Union Territories of India are represented:

| State / Union Territory | Constituency Count | Total Allocated Amount (₹) |
|---|---|---|
| Uttar Pradesh | 80 | ₹12,07,46,67,617.91 |
| Maharashtra | 48 | ₹7,32,04,95,934.30 |
| West Bengal | 42 | ₹6,57,48,74,136.28 |
| Bihar | 40 | ₹6,00,77,29,788.65 |
| Tamil Nadu | 39 | ₹6,13,85,67,117.84 |
| Madhya Pradesh | 29 | ₹4,51,04,22,238.92 |
| Karnataka | 28 | ₹4,29,66,69,977.33 |
| Gujarat | 26 | ₹3,92,44,82,109.47 |
| Andhra Pradesh | 25 | ₹4,02,30,86,183.18 |
| Rajasthan | 25 | ₹3,88,68,91,561.43 |
| Odisha | 21 | ₹3,35,01,65,739.06 |
| Kerala | 20 | ₹3,16,19,95,027.22 |
| Telangana | 17 | ₹2,88,43,00,323.04 |
| Assam | 14 | ₹2,00,93,00,157.11 |
| Jharkhand | 14 | ₹2,16,36,44,227.44 |
| Punjab | 13 | ₹1,97,81,80,680.54 |
| Chhattisgarh | 11 | ₹1,69,32,15,487.42 |
| Haryana | 10 | ₹1,57,84,54,264.00 |
| Delhi | 7 | ₹1,12,73,14,315.00 |
| Jammu And Kashmir | 5 | ₹74,27,73,472.11 |
| Uttarakhand | 5 | ₹73,50,00,000.00 |
| Himachal Pradesh | 4 | ₹63,25,23,041.33 |
| Tripura | 2 | ₹29,40,00,000.00 |
| Manipur | 2 | ₹29,40,00,000.00 |
| Meghalaya | 2 | ₹24,50,00,000.00 |
| Goa | 2 | ₹29,40,00,000.00 |
| Arunachal Pradesh | 2 | ₹29,40,00,000.00 |
| Puducherry | 1 | ₹20,93,68,972.11 |
| Chandigarh | 1 | ₹17,83,51,443.75 |
| Dadra & Nagar Haveli and Daman & Diu | 2 | ₹39,20,63,957.00 |
| Mizoram | 1 | ₹14,70,00,000.00 |
| Nagaland | 1 | ₹14,70,00,000.00 |
| Sikkim | 1 | ₹15,20,03,923.11 |
| Andaman And Nicobar Islands | 1 | ₹14,70,00,000.00 |
| Ladakh | 1 | ₹16,11,14,542.00 |
| Lakshadweep | 1 | ₹15,39,42,460.41 |
| **National Total (543 MPs)** | **543** | **₹83,18,05,53,325.71** |

---

## 6. Field Suitability for Audit & Anomaly Detection

### A. Fields Directly Available & Usable for Audit Intelligence
1. **Constituency Allocation Ceiling (`Allocated AMOUNT ( ₹ )`):**
   - Enables statistical outlier detection (Median Absolute Deviation, modified Z-score) on allocated ceilings.
   - Detects disproportionate state-level and constituency-level fund skew.
2. **State & Regional Aggregations (`State`):**
   - Enables regional fund parity analysis and cross-state distribution auditing.
3. **Constituency Identifier (`Constituency`):**
   - High-cardinality primary join key for parliamentary tracking.
4. **Parliamentary Representation (`Hon'ble Members of Parliaments`):**
   - Official attribution for public accountability and audit dossiers.

### B. Fields NOT AVAILABLE in Source Dataset (Must NOT be Fabricated)
Per Phase 12 instructions, when these fields are unavailable in the official source, the UI and API must explicitly state **"Not available in source dataset"**:
1. **Physical Inspection Completion %:** *NOT AVAILABLE IN SOURCE DATA*
2. **Itemized Payment Vouchers / Ledger:** *NOT AVAILABLE IN SOURCE DATA*
3. **Private Contractor Registrations:** *NOT AVAILABLE IN SOURCE DATA*
4. **Milestone Progress Photographs:** *NOT AVAILABLE IN SOURCE DATA*
5. **Statutory Technical Sanction PDFs:** *NOT AVAILABLE IN SOURCE DATA*

---

## 7. Data Quality & Cleaning Rules Discovered

1. **Grand Total Row Filter:** Row #544 contains `Sr. No. = "Grand Total"`. Must be excluded from entity tables and ingested into scheme aggregate metadata.
2. **State Name Normalization:** Suffixes in constituency names like `AURANGABAD_BR` (Bihar) vs `AURANGABAD_MH` (Maharashtra), and `HAMIRPUR_HP` (Himachal Pradesh) vs `HAMIRPUR_UP` (Uttar Pradesh) are disambiguated cleanly.
3. **Zero / Null Value Handling:** Row #108 (Nanded, Maharashtra) has empty string `""` for amount. Must be parsed as `0.0` with a flag `DATA_QUALITY_NOTE: "Mid-term vacancy / allocation pending confirmation"`.
4. **Duplicate Constituency Key:** Constituency `NANDED` appears twice due to representation transition (Row 108 and Row 390). Unique primary key must be synthesized as `MPLAD-OFFICIAL-CONSTITUENCY-<SR_NO>` or `MPLAD-LS-<STATE_CODE>-<SR_NO>` to maintain zero collision guarantees.

---

## 8. Ingestion Plan & Verification Target
- **Input Source:** `data/official/Allocated Limit for Honble MPs.csv`
- **Output Canonical Table:** `official_allocations` in SQLite `mplad_database.sqlite`
- **Target Ingested Records:** Exactly **543 MP records**
- **Target Filtered Summary Records:** Exactly **1 Grand Total row** (ingested as portfolio ceiling)
- **Target Rejected Records:** **0 records**
