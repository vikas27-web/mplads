# MPLAD SENTINEL — Phase 7 Feature Engineering Specification

**Feature Schema Version**: `1.0.0`  
**Reference Audit Date**: `2026-09-04`  
**Pipeline Source**: SQLite Database (`data/generated/mplad_database.sqlite`) via `ProjectRepository`  
**Processed Artifact**: `data/processed/project_features.json`  

---

> ### CRITICAL GOVERNANCE STATEMENT
> **"Features are descriptive representations and are not anomaly decisions."**  
> This feature layer performs purely deterministic, mathematical, and contextual transformations on raw project, payment, inspection, and statutory document records. It does **NOT** classify projects as anomalous, compute risk scores, generate confidence numbers, or execute machine learning inferences. All ground-truth evaluation labels (`scenario_type`, `scenario_description`) are strictly isolated and barred from entering the feature vector.

---

## 1. Architecture

```
SQLite Database (mplad_database.sqlite)
   │
   ▼
ProjectRepository (Data Access Layer)
   │
   ├─► Projects (300 records)
   ├─► Payments (600 records)
   ├─► Physical Progress Events (573 records)
   └─► Statutory Documents (900 records)
   │
   ▼
Global Context Builder (`buildGlobalContext`)
   │  Precomputes portfolio volumes, contractor district counts,
   │  and implementing agency market share across all 300 projects.
   ▼
Feature Extractor (`extractProjectFeatures`)
   │  Computes 8 typed sub-feature groups:
   │  - Categorical (9 features)
   │  - Financial (12 features)
   │  - Physical (8 features)
   │  - Temporal (7 features)
   │  - Payment (7 features)
   │  - Contractor Context (4 features)
   │  - Agency Context (4 features)
   │  - Documentation (8 features)
   │  - Cross-Domain (6 features)
   │  Total: 65 descriptive features per project
   ▼
Feature Validator (`validateFeatureRecord` / `validateFeatureDataset`)
   │  Asserts:
   │  - Finite numerical values (No NaN, No Infinity)
   │  - Non-negative monetary amounts
   │  - Progress bounds [0, 100]
   │  - Missing-value policy adherence (explicit nulls)
   │  - Zero data leakage (absence of scenario_type, risk_score, etc.)
   ▼
Feature Artifact (`exportProjectFeatures`)
   └─► `data/processed/project_features.json` (300 records, validated, deterministic)
```

---

## 2. Feature Taxonomy & Dictionary

### A. Categorical Features (9 features)
Descriptive identity and jurisdiction metadata for grouping and stratification.

| Feature Name | Source Field | Type | Description | Missing Value Policy |
| :--- | :--- | :--- | :--- | :--- |
| `state` | `projects.state` | String | State jurisdiction (e.g., "Karnataka") | Non-nullable string |
| `district` | `projects.district` | String | District administrative boundary | Non-nullable string |
| `constituency` | `projects.constituency` | String | Lok Sabha Parliamentary Constituency | Non-nullable string |
| `sector` | `projects.sector` | String | Public works category (e.g., "Drinking Water") | Non-nullable string |
| `work_category` | `projects.work_category` | String | Specific scheme classification | Non-nullable string |
| `implementing_agency`| `projects.implementing_agency`| String | Assigned nodal executing agency | Non-nullable string |
| `contractor_id` | `projects.contractor_id` | String | Unique contractor entity identifier | Non-nullable string |
| `contractor_name` | `projects.contractor_name` | String | Legal commercial contractor name | Non-nullable string |
| `status` | `projects.status` | String | Administrative status ("In Progress", etc.) | Non-nullable string |

---

### B. Financial Features (12 features)
Captures sanctioned outlays, actual releases, recorded expenditures, tranche distributions, and ratio relationships.

| Feature Name | Type | Unit | Formula / Derivation | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sanctioned_amount` | Number | INR | `projects.sanctioned_amount` | Total administratively sanctioned funds |
| `released_amount` | Number | INR | `projects.released_amount` | Cumulative treasury disbursements to agency |
| `expenditure_amount` | Number | INR | `projects.expenditure_amount` | Booked contractor expenditures to date |
| `remaining_sanctioned_amount` | Number | INR | `sanctioned_amount - expenditure_amount` | Unutilized sanctioned budgetary headroom |
| `remaining_released_amount` | Number | INR | `released_amount - expenditure_amount` | Unspent cash remaining in nodal account |
| `expenditure_to_release_ratio`| Number | Ratio | `expenditure_amount / released_amount` | Fund utilization velocity relative to releases |
| `release_to_sanction_ratio` | Number | Ratio | `released_amount / sanctioned_amount` | Treasury release progression relative to sanction |
| `expenditure_to_sanction_ratio`| Number | Ratio | `expenditure_amount / sanctioned_amount` | Total financial burn rate relative to sanction |
| `payment_count` | Integer | Count | `count(payments)` | Total recorded payment disbursement tranches |
| `average_payment_amount` | Number | INR | `sum(payments.amount) / payment_count` | Mean tranche ticket size |
| `max_payment_amount` | Number | INR | `max(payments.amount)` | Largest single payment transaction tranche |
| `min_payment_amount` | Number | INR | `min(payments.amount)` | Smallest single payment transaction tranche |
| `payment_amount_std_dev` | Number | INR | Population $\sigma$ of payment amounts | Tranche size variance across lifecycle |

---

### C. Physical Progress Features (8 features)
Measures on-the-ground engineering execution, milestone frequency, and schedule adherence.

| Feature Name | Type | Unit | Formula / Derivation | Description |
| :--- | :--- | :--- | :--- | :--- |
| `reported_physical_progress` | Number | % | `projects.physical_progress` | Current recorded physical completion (0–100%) |
| `progress_event_count` | Integer | Count | `count(physical_progress_events)` | Number of logged engineering inspection visits |
| `latest_progress_percentage` | Number | % | Latest inspection `progress_percentage` | Progress logged at the most recent field visit |
| `average_progress_per_update`| Number | %/visit | `reported_physical_progress / progress_event_count` | Average physical delta per field inspection |
| `is_completed` | Integer | Binary | `status === "Completed" ? 1 : 0` | Physical completion milestone indicator |
| `planned_duration_days` | Number | Days | `planned_completion_date - start_date` | Sanctioned execution window in days |
| `actual_or_elapsed_duration_days` | Number | Days | `(actual_completion_date \|\| 2026-09-04) - start_date` | Calendar days elapsed since mobilization |
| `schedule_delay_days` | Number | Days | `max(0, elapsed_duration - planned_duration)` | Days project has run past planned deadline |

---

### D. Temporal Features (7 features)
Measures governance latency, administrative approvals, mobilization times, and event intervals.

| Feature Name | Type | Unit | Formula / Derivation | Missing Value Policy |
| :--- | :--- | :--- | :--- | :--- |
| `days_recommendation_to_sanction` | Number | Days | `sanction_date - recommendation_date` | Administrative approval latency |
| `days_sanction_to_start` | Number | Days | `start_date - sanction_date` | Mobilization and tendering latency |
| `days_start_to_planned_completion`| Number | Days | `planned_completion_date - start_date` | Sanctioned operational timeline |
| `days_since_last_updated` | Number | Days | `2026-09-04 - last_updated` | Recency of state portal telemetry |
| `project_age_days` | Number | Days | `2026-09-04 - start_date` | Total project age from commencement |
| `avg_payment_interval_days` | Number \| null | Days | Mean interval between sorted payment dates | **`null` if payment count < 2** |
| `avg_progress_interval_days`| Number \| null | Days | Mean interval between sorted inspections | **`null` if inspection count < 2** |

---

### E. Payment Features (7 features)
Captures transaction sequencing, reconciliation status, and disbursement velocity.

| Feature Name | Type | Unit | Formula / Derivation | Missing Value Policy |
| :--- | :--- | :--- | :--- | :--- |
| `payment_count` | Integer | Count | `count(payments)` | Total payment transaction records |
| `total_paid_amount` | Number | INR | `sum(payments.amount)` | Total money disbursed via payment gateway |
| `disbursed_payment_ratio` | Number | Ratio | `count(Disbursed) / payment_count` | Proportion of fully settled payment tranches |
| `pending_payment_count` | Integer | Count | `count(Pending Clearance)` | Unreconciled or in-flight bank transfers |
| `days_to_first_payment` | Number \| null | Days | `min(payment_date) - start_date` | **`null` if 0 payments** |
| `days_to_final_payment` | Number \| null | Days | `max(payment_date) - start_date` | **`null` if 0 payments** |
| `payment_velocity_amount_per_month` | Number | INR/mo | `total_paid_amount / (elapsed_days / 30.4375)` | Monthly average capital outflow rate |

---

### F. Contractor Context Features (4 features)
Contextual portfolio properties across the entire state dataset (precomputed via global context).

| Feature Name | Type | Unit | Formula / Derivation | Description |
| :--- | :--- | :--- | :--- | :--- |
| `contractor_total_projects` | Integer | Count | `count(projects where contractor_id = X)` | Overall contractor project portfolio size |
| `contractor_total_sanctioned_amount`| Number | INR | `sum(sanctioned_amount where contractor = X)`| Cumulative state allocation to contractor |
| `contractor_district_count` | Integer | Count | `count(distinct district where contractor = X)`| Geographic dispersion across districts |
| `contractor_district_share_percentage`| Number | % | `(contractor_projects_in_district / district_total) * 100` | Share of district works held by firm |

---

### G. Agency Context Features (4 features)
Implementing agency operational capacity and cross-sectoral distribution.

| Feature Name | Type | Unit | Formula / Derivation | Description |
| :--- | :--- | :--- | :--- | :--- |
| `agency_total_projects` | Integer | Count | `count(projects where agency = Y)` | Agency portfolio volume |
| `agency_total_sanctioned_amount` | Number | INR | `sum(sanctioned_amount where agency = Y)` | Total funds entrusted to agency |
| `agency_sector_count` | Integer | Count | `count(distinct sector where agency = Y)` | Sectoral diversification index |
| `agency_district_share_percentage` | Number | % | `(agency_projects_in_district / district_total) * 100` | Agency market share in local district |

---

### H. Documentation Features (8 features)
Statutory compliance indicators derived from upload metadata and audit checks.

| Feature Name | Type | Unit | Formula / Derivation | Description |
| :--- | :--- | :--- | :--- | :--- |
| `document_count` | Integer | Count | `count(documents)` | Total statutory documents in dossier |
| `verified_document_count` | Integer | Count | `count(status == "Verified")` | Legally verified and sealed documents |
| `missing_document_count` | Integer | Count | `count(status == "Missing")` | Statutory files not yet uploaded |
| `discrepancy_document_count` | Integer | Count | `count(status == "Discrepancy")` | Files flagged during nodal review |
| `has_sanction_order` | Integer | Binary | 1 if Sanction Order is verified, else 0 | Administrative authorization check |
| `has_technical_estimate` | Integer | Binary | 1 if DPR / Tech Sanction is verified, else 0 | Engineering validation check |
| `has_stage_certificate` | Integer | Binary | 1 if Stage / Inspection Cert is verified, else 0 | Field inspection sign-off check |
| `documentation_completeness_ratio` | Number | Ratio | `verified_document_count / document_count` | Ratio of verified mandatory files (0.0 to 1.0) |

---

### I. Cross-Domain Features (6 features)
Harmonized metrics combining financial, physical, and temporal dimensions to capture multi-domain relationships.

| Feature Name | Type | Unit | Formula / Derivation | Description |
| :--- | :--- | :--- | :--- | :--- |
| `expenditure_per_progress_point` | Number | INR/% | `expenditure_amount / physical_progress` | Capital expended per 1% physical progress |
| `financial_progress_vs_physical_progress_gap` | Number | % pts | `(expenditure / sanctioned * 100) - physical_progress` | Difference between financial and physical burn |
| `elapsed_time_ratio` | Number | Ratio | `actual_or_elapsed_duration / planned_duration` | Calendar consumption vs sanctioned window |
| `time_vs_physical_progress_gap` | Number | % pts | `(elapsed_time_ratio * 100) - physical_progress` | Time elapsed percentage vs physical achievement |
| `payments_per_progress_event_ratio` | Number | Ratio | `payment_count / progress_event_count` | Tranches issued per physical inspection |
| `disbursement_prior_to_progress_flag` | Integer | Binary | 1 if payment date < first inspection date, else 0 | Funds disbursed before 1st site inspection |

---

## 3. Missing-Value Policy

A strict, domain-appropriate missing-value policy is enforced:
1. **Explicit `null`**: Applied when calculating intervals where fewer than 2 events exist (e.g. `avg_payment_interval_days`, `avg_progress_interval_days`, `days_to_first_payment`). Substituting `0` would be mathematically misleading, implying simultaneous events.
2. **Semantic `0`**: Applied only where zero accurately reflects count or quantity (e.g. `payment_count = 0`, `schedule_delay_days = 0`, `missing_document_count = 0`).
3. **Safe Denominators**: Division operations guard against divide-by-zero using `Math.max(1, denominator)` or explicit conditional checks.

---

## 4. Anti-Leakage Controls & Governance

To guarantee that future Phase 8 machine learning models or anomaly detection engines cannot cheat:
- `scenario_type` and `scenario_description` are **completely stripped** from all feature extraction paths.
- The recursive validator inspects the serialized JSON for any occurrence of forbidden terms (`scenario_type`, `scenario_description`, `risk_score`, `anomaly_score`, `confidence_score`).
- Automated tests (`test:features`, Test 14) assert that no scenario label strings appear anywhere in the feature dataset.

---

## 5. Execution & Verification

### Pipeline Scripts
```bash
# Generate and export feature artifact to data/processed/project_features.json
npm run features:generate

# Execute all 17 feature validation and mathematical tests
npm run test:features

# Execute Phase 6 dataset regression tests
npm run test:data

# Verify type safety and frontend integrity
npm run typecheck
npm run lint
npm run build
```

---

## 6. Limitations

- **Synthetic Domain Bounds**: Features reflect synthetic distributions modeled from Karnataka MPLADS guidelines.
- **Reference Date Dependency**: All temporal elapsed days are evaluated relative to `REFERENCE_AUDIT_DATE` (`2026-09-04`) to preserve determinism and avoid non-reproducible timestamp drifts.
- **No Predictive Labels**: Features describe *what occurred* and *how dimensions interact*, but make no determination regarding fraud, waste, or irregularity.
