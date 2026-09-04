# MPLAD SENTINEL — Canonical Synthetic Dataset & Database Foundation

> **IMPORTANT DISCLAIMER:**  
> **DEMO DATA — NOT OFFICIAL GOVERNMENT DATA**  
> All project records, expenditure allocations, geospatial coordinates, contractor assignments, and documentation artifacts in this dataset are synthetically generated for demonstration, prototyping, and benchmark evaluation for the Smart India Hackathon. They do NOT represent actual government records, live PFMS accounts, or official audit findings.

> **GROUND TRUTH NOTICE:**  
> **Scenario labels are synthetic ground truth for testing and are NOT anomaly-engine outputs.**  
> The scenario tags embedded in this dataset are provided strictly as training and evaluation ground truth for future detection engines (Phase 8). In a live deployment, anomaly signals are detected autonomously by the backend intelligence models rather than retrieved from pre-existing labels.

---

## 1. Overview & Purpose
Phase 6 establishes the canonical, deterministic synthetic data and database foundation for the **MPLAD SENTINEL** platform. This layer acts as the single source of truth for:
- Canonical project identities and lifecycles
- State, constituency, district, and block hierarchies across India
- Priority sectors and realistic civil engineering work categories
- Financial sanctions, releases, and multi-tranche expenditure disbursements
- Physical milestone progress and inspection events
- Statutory audit documentation artifacts
- Controlled, realistic anomaly ground-truth patterns for downstream model training

---

## 2. Directory Architecture
```
data/
├── README.md                          # This documentation file
├── raw/
│   └── reference_data.json            # Reference lookups (states, districts, sectors, agencies, contractors)
└── generated/
    ├── mplad_synthetic_dataset.json   # Canonical synthetic dataset artifact (300 projects)
    └── mplad_database.sqlite          # SQLite database seeded from canonical dataset

backend/
├── types/
│   ├── project.ts                     # TypeScript domain models and interfaces
│   └── sqlite.d.ts                    # Ambient types for built-in node:sqlite
├── schemas/
│   └── validator.ts                   # Strict schema and cross-field consistency validator
├── generator/
│   ├── prng.ts                        # Deterministic Mulberry32 PRNG (Seed: 26102)
│   └── datasetGenerator.ts            # Canonical dataset generator with realistic scenario distributions
├── database/
│   ├── schema.sql                     # Canonical relational SQLite schema and performance indexes
│   └── sqlite.ts                      # DatabaseManager abstraction using Node.js 24 node:sqlite
├── repository/
│   └── projectRepository.ts           # Decoupled data-access repository for future backend APIs
├── scripts/
│   ├── generate.ts                    # Generator execution script (outputs JSON + SQLite)
│   └── initDb.ts                      # Database initialization and table seeding script
└── tests/
    └── dataset.test.ts                # Automated test suite (13 tests)
```

---

## 3. Determinism & Generation Parameters
- **Deterministic Seed**: `26102` (Derived from SIH Problem Statement SIH26102).
- **PRNG Algorithm**: Mulberry32 32-bit stateful generator.
- **Guarantee**: Running the generator twice produces identical data structures, record counts, and field values.
- **Record Count**: **300 Projects** (exceeds the 100 minimum, fitting the 250–500 target).

---

## 4. Scenario Types & Ground-Truth Distribution
The dataset models realistic municipal project execution with intentional, controlled anomalies:

| Scenario Type | Count | % | Description |
| :--- | :---: | :---: | :--- |
| `NORMAL` | 180 | 60.0% | Standard compliant project lifecycle with regular milestones and valid documentation. |
| `DUPLICATE_SIGNAL` | 15 | 5.0% | Coordinates registered within 40m perimeter of an existing civil asset. |
| `EXPENDITURE_SHIFT` | 15 | 5.0% | 100% funds expended within initial 45 days before midpoint progress review. |
| `TIMELINE_INCONSISTENCY` | 15 | 5.0% | Ground truth anomaly: Start date registered prior to formal administrative sanction. |
| `PHYSICAL_FINANCIAL_MISMATCH` | 18 | 6.0% | Severe divergence: 95% funds expended but physical progress recorded < 30%. |
| `PAYMENT_PATTERN_SIGNAL` | 15 | 5.0% | Payments disbursed without prerequisite engineering stage progress certificate. |
| `CONTRACTOR_CONCENTRATION` | 15 | 5.0% | Single contractor awarded disproportionate cluster of works within single district. |
| `MISSING_DOCUMENTATION` | 15 | 5.0% | Statutory documentation gap: mandatory stage completion certificate / UC missing. |
| `MULTI_SIGNAL` | 12 | 4.0% | Compound anomaly combining financial pacing, low physical progress, and missing documents. |
| **Total** | **300** | **100.0%** | |

---

## 5. Canonical Relational Schema
Stored in SQLite (`data/generated/mplad_database.sqlite`):
1. **`projects`**: Core entity (300 rows) with financial figures, progress, location, dates, and ground truth metadata.
2. **`constituencies`**: 26 parliamentary constituencies across 5 major states.
3. **`districts`**: 13 districts across Karnataka, Maharashtra, Delhi, Tamil Nadu, and Uttar Pradesh.
4. **`implementing_agencies`**: 8 engineering wings (PWD, RDPR, ZP, BBMP, DJB, TWAD, UPRN, MID).
5. **`contractors`**: 10 state/national registered infrastructure contractors.
6. **`payments`**: 600 milestone disbursement entries linked via foreign keys.
7. **`physical_progress_events`**: 573 inspection milestones with stage names and inspecting officers.
8. **`documents`**: 900 statutory artifacts (Sanction Orders, DPRs, Stage Certificates).

Indexes are maintained on: `district`, `sector`, `implementing_agency`, `contractor_id`, `scenario_type`, `status`, and foreign keys.

---

## 6. Validation Rules (`backend/schemas/validator.ts`)
The schema validation engine enforces:
- **Project Code**: Must match regex `^MPLAD-[A-Z0-9-]+$` and be globally unique.
- **Title & Text**: Non-empty, minimum length thresholds.
- **Financial Bounds**: `sanctioned_amount > 0`; `released_amount >= 0`; `expenditure_amount >= 0`. In `NORMAL` scenario: `released_amount <= sanctioned_amount` and `expenditure_amount <= released_amount`.
- **Physical Progress**: Bound between `0` and `100`. Completed projects must be `100%` with actual completion date.
- **Date Sequencing**: Valid ISO `YYYY-MM-DD`. In `NORMAL` scenario: `recommendation_date <= sanction_date <= start_date`.
- **Enumerations**: Strict membership check for `ScenarioType` and `ProjectStatus`.

---

## 7. Data Access Contract (`ProjectRepository`)
The repository layer is completely decoupled from Next.js UI components:
```typescript
class ProjectRepository {
  getProjectByCode(projectCode: string): ProjectRecord | null;
  getProjects(filters?: ProjectFilters): { projects: ProjectRecord[]; total: number };
  getProjectCount(): number;
  getDistinctDistricts(): string[];
  getDistinctSectors(): string[];
  getDistinctAgencies(): string[];
  getDistinctConstituencies(): string[];
  getDistinctContractors(): ContractorRecord[];
  getProjectPayments(projectCode: string): PaymentRecord[];
  getProjectProgress(projectCode: string): PhysicalProgressRecord[];
  getProjectDocuments(projectCode: string): DocumentRecord[];
}
```

---

## 8. Execution Commands
Generate dataset and seed database:
```bash
npm run generate:data
```

Reinitialize database from existing JSON:
```bash
npm run init:db
```

Execute automated test suite:
```bash
npm run test:data
```

Typecheck TypeScript codebase:
```bash
npm run typecheck
```

---

## 9. Limitations & Phase Boundaries
- **No Real Government Integration**: All values are synthetic benchmarks.
- **No Anomaly Engine**: Phase 6 provides ground-truth metadata only; detection models belong to Phase 8.
- **No Direct Frontend-to-Database Link**: Architecture maintains strict separation: `Frontend -> future Backend API -> Repository -> Database`.
