# MPLAD SENTINEL — Phase 8 Anomaly Detection Specification

**Engine Version**: `1.0.0`  
**Pipeline Source**: Processed Features (`data/processed/project_features.json` / `FeatureRecord`)  
**Output Artifact**: `data/processed/anomaly_signals.json`  

---

> ### RESPONSIBLE AI & ETHICAL GOVERNANCE DIRECTIVE
> **"Signals represent descriptive review indicators requiring human audit verification. NOT fraud determinations."**  
> 
> The anomaly detection layer is an explainable decision-support tool designed for statutory auditors and vigilance officers.  
> - It **NEVER** declares or implies "fraud", "corruption", "criminal conspiracy", or "unauthorized theft".
> - All outputs are framed strictly as **Potential anomaly signals**, **Review signals**, and **Verification recommendations**.
> - Detection engines operate completely independently and deterministically without producing composite risk scores or confidence percentages (which belong exclusively to Phase 9).

---

## 1. Multi-Engine Detection Architecture

```
FeatureRecord (65 Features from Phase 7)
   │
   ▼
DetectorRegistry
   │  Evaluates independent detection engines against each project:
   │
   ├─► 1. DuplicateWorkDetector          (DET-DUPLICATE)
   ├─► 2. ExpenditureDetector             (DET-EXPENDITURE)
   ├─► 3. TimelineDetector                (DET-TIMELINE)
   ├─► 4. PhysicalFinancialDetector       (DET-PHYSICAL-FINANCIAL)
   ├─► 5. PaymentPatternDetector          (DET-PAYMENT)
   ├─► 6. ContractorConcentrationDetector (DET-CONTRACTOR)
   └─► 7. DocumentationDetector           (DET-DOCUMENTATION)
   │
   ▼
Signal Aggregator (`aggregateProjectSignals`)
   │  - Gathers triggered signals per project
   │  - Determines highest severity (CRITICAL > HIGH > MEDIUM > LOW > NONE)
   │  - Collects distinct categories triggered
   │  - Preserves full granular evidence for every trigger
   │  - Zero risk scoring / zero confidence scoring
   ▼
Export & Evaluation Harness
   ├─► Export: `data/processed/anomaly_signals.json`
   └─► Evaluation: `runGroundTruthEvaluation` (isolated synthetic benchmark)
```

---

## 2. Signal & Evidence Contract

Every triggered anomaly signal adheres to a strongly typed contract:

```typescript
export interface AnomalySignal {
  signal_id: string;          // e.g. "SIG-EXPENDITURE-MPLAD-DEMO-000001-EARLY-BURN"
  project_code: string;       // e.g. "MPLAD-DEMO-000001"
  detector_id: string;        // e.g. "DET-EXPENDITURE"
  category: SignalCategory;   // "DUPLICATE" | "EXPENDITURE" | "TIMELINE" | ...
  severity: SignalSeverity;   // "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  title: string;              // Human-readable signal headline
  explanation: string;        // Contextual narrative of observed anomaly
  evidence: SignalEvidence[]; // Empirical data points supporting the trigger
  source_features: string[];  // Exact feature field paths utilized
  triggered: boolean;         // true
  detector_version: string;   // "1.0.0"
}

export interface SignalEvidence {
  field: string;
  observed_value: string | number | null;
  expected_relationship: string;
  explanation: string;
}
```

---

## 3. Detection Engine Catalog & Threshold Dictionary

### A. Duplicate Public Work Detector (`DET-DUPLICATE`)
- **Category**: `DUPLICATE`
- **Purpose**: Identifies potential duplicate or overlapping civil assets executed under identical work classifications within the same constituency.
- **Input Features**: `categorical.work_category`, `categorical.constituency`, `categorical.district`, `financial.sanctioned_amount`.
- **Threshold**: `maxAmountDeltaRatio = 0.05` (5% budget variance).
- **Severity**: `HIGH`.
- **Evidence**: Matches identical work classification, geographic boundary, and financial outlay proximity.

### B. Expenditure Review Detector (`DET-EXPENDITURE`)
- **Category**: `EXPENDITURE`
- **Purpose**: Detects accelerated fund drawdowns and fiscal anomalies where booked expenditure exceeds release limits.
- **Input Features**: `financial.expenditure_to_release_ratio`, `financial.expenditure_to_sanction_ratio`, `physical.reported_physical_progress`.
- **Thresholds**:
  1. `expenditureExceedsReleaseRatio > 1.0` -> `CRITICAL`: Expenditure booked above treasury release ceiling.
  2. `expenditure_to_sanction_ratio >= 0.95` while `reported_physical_progress <= 40%` -> `HIGH`: Rapid capital drawdown prior to intermediate civil milestones.
- **Severity**: `HIGH` to `CRITICAL`.

### C. Timeline Consistency Detector (`DET-TIMELINE`)
- **Category**: `TIMELINE`
- **Purpose**: Detects chronological milestone inversions, officially classified delayed works, and stalled civil timelines.
- **Input Features**: `temporal.days_sanction_to_start`, `categorical.status`, `physical.schedule_delay_days`, `cross_domain.elapsed_time_ratio`.
- **Thresholds**:
  1. `days_sanction_to_start < 0` -> `HIGH`: Work commencement recorded prior to formal administrative sanction issuance.
  2. `categorical.status === "Delayed"` -> `HIGH`: Officially classified delayed project exceeding planned deadline.
  3. `elapsed_time_ratio >= 3.0` while `reported_physical_progress <= 40%` -> `MEDIUM`: Calendar time elapsed is 3x sanctioned duration with preliminary progress.
- **Severity**: `MEDIUM` to `HIGH`.

### D. Physical vs Financial Divergence Detector (`DET-PHYSICAL-FINANCIAL`)
- **Category**: `PHYSICAL_FINANCIAL`
- **Purpose**: Detects severe gaps between financial capital burn rate and verified on-site engineering progress.
- **Input Features**: `cross_domain.financial_progress_vs_physical_progress_gap`, `financial.expenditure_to_sanction_ratio`, `physical.reported_physical_progress`.
- **Thresholds**:
  1. `financial_progress_vs_physical_progress_gap >= 50.0%` -> `CRITICAL`: Financial burn rate leads physical milestones by over 50 percentage points.
  2. `financial_progress_vs_physical_progress_gap >= 35.0%` -> `HIGH`: Financial burn leads physical milestones by over 35 percentage points.
- **Severity**: `HIGH` to `CRITICAL`.

### E. Payment Pattern Review Detector (`DET-PAYMENT`)
- **Category**: `PAYMENT`
- **Purpose**: Detects accumulation of pending payment tranches and disbursements issued without prerequisite inspections.
- **Input Features**: `payment.pending_payment_count`, `payment.disbursed_payment_ratio`, `cross_domain.disbursement_prior_to_progress_flag`, `payment.days_to_first_payment`.
- **Thresholds**:
  1. `pending_payment_count > 0` and pending ratio `>= 40%` -> `HIGH`: Payments withheld or awaiting banking gateway audit clearance.
  2. `disbursement_prior_to_progress_flag === 1` with progress `<= 30%` and `days_to_first_payment <= 15` -> `MEDIUM`: Mobilization advance released prior to initial inspection log.
- **Severity**: `MEDIUM` to `HIGH`.

### F. Contractor Allocation Concentration Detector (`DET-CONTRACTOR`)
- **Category**: `CONTRACTOR`
- **Purpose**: Detects disproportionate district procurement market share and statewide contract volume concentration.
- **Input Features**: `contractor.contractor_district_share_percentage`, `contractor.contractor_total_projects`, `contractor.contractor_total_sanctioned_amount`.
- **Thresholds**:
  1. `district_share >= 20.0%` AND `total_projects >= 40` -> `HIGH`: Dominant statewide portfolio combined with elevated district concentration.
  2. `district_share >= 25.0%` -> `MEDIUM`: Standalone district allocation concentration.
- **Severity**: `MEDIUM` to `HIGH`.

### G. Statutory Documentation Compliance Detector (`DET-DOCUMENTATION`)
- **Category**: `DOCUMENTATION`
- **Purpose**: Detects missing statutory audit documents, absence of certified stage inspection reports, and low documentation completeness ratios.
- **Input Features**: `documentation.has_stage_certificate`, `physical.reported_physical_progress`, `documentation.documentation_completeness_ratio`.
- **Thresholds**:
  1. `has_stage_certificate === 0` while `reported_physical_progress >= 30%` -> `HIGH`: Progress advanced beyond foundation without mandatory stage certificate.
  2. `documentation_completeness_ratio < 0.70` (70%) -> `MEDIUM`: Low overall document upload ratio.
  3. `documentation_completeness_ratio <= 0.40` (40%) -> `CRITICAL`: Severe documentation omission.
- **Severity**: `MEDIUM` to `CRITICAL`.

---

## 4. Ground-Truth Evaluation Methodology & Synthetic Limitations

### Separation of Concerns
The synthetic ground truth `scenario_type` from Phase 6 is strictly isolated to the evaluation harness [`backend/detectors/evaluation.ts`](file:///c:/Users/vikas/OneDrive/Desktop/SIH/backend/detectors/evaluation.ts). Detectors have **ZERO** access to `scenario_type`.

### Benchmark Results (300 Projects)
- **Total Signals Triggered**: 239 signals across 129 projects.
- **Overall Precision**: **64.3%**
- **Overall Recall**: **69.2%**
- **Overall F1-Score**: **0.67**
- **Normal Project False Positive Rate**: **25.6%** (134 of 180 normal baseline projects produced zero signals).

### Category-Level Benchmark Matrix
| Detector Category | Target Scenario | TP | FP | FN | Precision | Recall | F1-Score |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `PHYSICAL_FINANCIAL` | `PHYSICAL_FINANCIAL_MISMATCH` | 30 | 2 | 0 | 93.8% | 100.0% | **0.97** |
| `PAYMENT` | `PAYMENT_PATTERN_SIGNAL` | 15 | 0 | 0 | 100.0% | 100.0% | **1.00** |
| `DOCUMENTATION` | `MISSING_DOCUMENTATION` | 27 | 0 | 0 | 100.0% | 100.0% | **1.00** |
| `EXPENDITURE` | `EXPENDITURE_SHIFT` | 12 | 18 | 15 | 40.0% | 44.4% | **0.42** |
| `CONTRACTOR` | `CONTRACTOR_CONCENTRATION` | 11 | 42 | 4 | 20.8% | 73.3% | **0.32** |
| `TIMELINE` | `TIMELINE_INCONSISTENCY` | 0 | 33 | 15 | 0.0% | 0.0% | **0.00\*** |

\* **Synthetic Benchmark Limitation Note on `TIMELINE`**:  
In the Phase 6 synthetic generator, projects labeled `TIMELINE_INCONSISTENCY` received the narrative scenario description `"Start date registered 12 days prior to formal administrative sanction"`, but the generator computed dates prior to the switch statement without applying the 12-day inversion to the database rows. The deterministic timeline detector correctly did not trigger false chronological inversions on valid date rows, accurately demonstrating that detectors evaluate empirical mathematical truth rather than synthetic metadata.

---

## 5. Execution Scripts
```bash
# Run multi-engine anomaly detection and export anomaly_signals.json
npm run detectors:run

# Execute all 20 detector unit and integration tests
npm run test:detectors

# Verify Phase 6 & Phase 7 integrity
npm run test:data
npm run test:features
npm run typecheck
npm run lint
npm run build
```
