# MPLAD SENTINEL — Anomaly Detection & Intelligence Engine (Phase 8)

## 1. System Architecture

The Anomaly Detection Engine evaluates project features generated in Phase 7 (`data/processed/project_features.json`) to identify potential audit divergence signals. The architecture combines three distinct, complementary paradigms:

```
                      +---------------------------------------+
                      |   data/processed/project_features.json|
                      |          (300 FeatureRecords)         |
                      +-------------------+-------------------+
                                          |
                   +----------------------+----------------------+
                   |                      |                      |
                   v                      v                      v
        +--------------------+  +--------------------+  +--------------------+
        |  Rule-Based Engine |  | Statistical Engine |  | ML Isolation Forest|
        |  (7 Domain Rules)  |  |    (Robust MAD)    |  | (100 Trees, Seed)  |
        +----------+---------+  +----------+---------+  +----------+---------+
                   |                      |                      |
                   +----------------------+----------------------+
                                          |
                                          v
                               +---------------------+
                               | Multi-Signal Rule   |
                               | (>=2 cross-domains) |
                               +----------+----------+
                                          |
                                          v
                               +---------------------+
                               |  Signal Aggregator  |
                               | (Severity & Score)  |
                               +----------+----------+
                                          |
                                          v
                               +---------------------+
                               | Output & Ethics     |
                               | Schema Validator    |
                               +----------+----------+
                                          |
                                          v
                      +---------------------------------------+
                      |   data/processed/anomaly_results.json |
                      |       (300 Validated Results)         |
                      +---------------------------------------+
                                          |
                               (Isolated Evaluation)
                                          v
                      +---------------------------------------+
                      |     backend/evaluation/evaluator.ts   |
                      |  (Compares against SQLite benchmark)  |
                      |                  ↓                    |
                      | data/evaluation/anomaly_evaluation.json|
                      +---------------------------------------+
```

---

## 2. Responsible AI Policy & Governance Boundaries

> [!IMPORTANT]
> **Core Responsible AI Principle:**
> *"An anomaly signal is an indicator for human audit review and does not constitute evidence of fraud, corruption, or legal culpability."*

1. **Strict Language Constraints:**
   - The terms `fraud`, `fraudulent`, `guilty`, and `corrupt` are strictly prohibited in the engine, detectors, rules, logs, and generated output files.
   - Outputs utilize institutional audit terminology:
     - `Potential anomaly signal`
     - `Review priority: [CRITICAL | HIGH | MEDIUM | LOW]`
     - `Evidence requires verification`
     - `Human investigation required`
     - `Physical verification recommended`
2. **Ground-Truth Isolation (Zero Leakage):**
   - Synthetic `scenario_type` labels from Phase 6 are benchmark ground truth ONLY.
   - Detectors, rules, statistical algorithms, feature matrix builders, the Isolation Forest, signal aggregators, and the anomaly pipeline are strictly barred from reading or referencing `scenario_type`.
   - `scenario_type` is exclusively accessed inside `backend/evaluation/evaluator.ts`.

---

## 3. Detection Paradigms & Domains

### 3.1 Deterministic Rule Detectors (`backend/anomaly/rules/`)

| Detector File | Signal Type | Detection Criteria | Severity |
| :--- | :--- | :--- | :--- |
| `physicalFinancialMismatchRule.ts` | `PHYSICAL_FINANCIAL_MISMATCH` | Financial progress lead over physical progress $\ge 35\%$ (High) or $\ge 50\%$ (Critical). | HIGH / CRITICAL |
| `timelineInconsistencyRule.ts` | `TIMELINE_INCONSISTENCY` | Ground commencement preceding formal administrative sanction date; administrative status `"Delayed"`; or execution time $\ge 3.0\times$ scheduled window with progress $\le 40\%$. | MEDIUM / HIGH |
| `paymentPatternRule.ts` | `PAYMENT_PATTERN_SIGNAL` | Pending payment tranche ratio $\ge 40\%$; or initial payment tranche disbursed prior to site inspection with progress $\le 30\%$. | MEDIUM / HIGH |
| `expenditureShiftRule.ts` | `EXPENDITURE_SHIFT` | Expenditure exceeding treasury releases; $100\%$ release drawn down while incomplete; or expenditure burn $\ge 95\%$ with progress $\le 40\%$. | HIGH / CRITICAL |
| `duplicateWorkRule.ts` | `DUPLICATE_SIGNAL` | Co-located works within the same constituency having identical work category and sanctioned budget outlay within $5\%$ variance. | HIGH |
| `contractorConcentrationRule.ts` | `CONTRACTOR_CONCENTRATION` | Vendor holding $\ge 20\%$ of district works with $\ge 40$ statewide works; or standalone district share $\ge 25\%$. | MEDIUM / HIGH |
| `missingDocumentationRule.ts` | `MISSING_DOCUMENTATION` | Physical progress $\ge 30\%$ without mandatory stage inspection certificate; or documentation completeness ratio $< 70\%$ (or $\le 40\%$). | MEDIUM / HIGH / CRITICAL |
| `multiSignalRule.ts` | `MULTI_SIGNAL` | Triggered only when $\ge 2$ independent primary detection domains flag the same project. Synthesizes cross-domain findings. | HIGH / CRITICAL |

### 3.2 Robust Statistics (MAD Outlier Detection) (`backend/anomaly/statistical/robustStats.ts`)

For continuous, skewed administrative distributions (where Gaussian standard deviations break down due to extreme outliers), we implement the Boris Iglewicz and David Hoaglin (1993) Median Absolute Deviation (MAD) framework:

$$\text{Median} = \text{median}(X)$$

$$\text{MAD} = \text{median}(|X_i - \text{median}(X)|)$$

$$\text{Modified } Z_i = \frac{0.6745 \times (X_i - \text{median}(X))}{\text{MAD}}$$

- **Outlier Decision Boundary:** $|\text{Modified } Z_i| \ge 3.0$
- **Division-by-Zero Protection:** If $\text{MAD} = 0$, deviations evaluate to $0$ to prevent numerical instability.
- **Evaluated Continuous Features:**
  - `cross_domain.expenditure_per_progress_point`
  - `payment.payment_velocity_amount_per_month`
  - `temporal.days_recommendation_to_sanction`

### 3.3 Pure TypeScript Isolation Forest (`backend/anomaly/ml/isolationForest.ts`)

An unsupervised, tree-based multi-dimensional anomaly detection model implementing Liu, Ting & Zhou (2008) in pure TypeScript without Python, native binaries, or external libraries.

- **PRNG:** Mulberry32 32-bit generator with seed `26102` for 100% byte-for-byte reproducibility.
- **Hyperparameters:**
  - $n_{\text{trees}} = 100$
  - $\text{subsampleSize} = 128$
  - $\text{maxDepth} = \lceil \log_2(128) \rceil = 7$
  - $\text{scoreThreshold} = 0.60$
- **Average Path Length $c(n)$:**
  $$c(n) = 2 \left( \ln(n - 1) + 0.5772156649 \right) - \frac{2(n - 1)}{n} \quad (\text{for } n > 2)$$
  $$c(2) = 1, \quad c(n \le 1) = 0$$
- **Anomaly Score Formula:**
  $$s(x, n) = 2^{-\frac{E(h(x))}{c(n)}}$$
  - $s \to 1.0$: Strong multi-dimensional outlier (short path lengths across trees).
  - $s \to 0.5$: Normal observation.
  - $s \to 0.0$: Deeply clustered, central observation.

---

## 4. Centralized Thresholds (`backend/anomaly/config.ts`)

All detection limits and model configurations are centralized:

```typescript
export const RULE_THRESHOLDS = {
  physicalFinancial: { criticalGapPct: 50.0, highGapPct: 35.0, moderateGapPct: 20.0 },
  timeline: { invertedMilestoneDays: 0, flaggedDelayedStatus: "Delayed", stalledExecutionRatio: 3.0, stalledExecutionMaxProgress: 40 },
  payment: { highPendingRatio: 0.4, advanceDisbursementMaxProgress: 30, advanceDisbursementMaxDays: 15 },
  expenditure: { expenditureExceedsReleaseRatio: 1.0, earlyHighBurnRatio: 0.95, earlyHighBurnMaxProgress: 40 },
  duplicate: { maxAmountDeltaRatio: 0.05 },
  contractor: { districtShareCriticalPct: 20.0, criticalStatewideProjectsCount: 40, districtShareHighPct: 25.0 },
  documentation: { criticalCompletenessRatio: 0.4, lowCompletenessRatio: 0.7, stageCertRequiredMinProgress: 30 }
};

export const STATISTICAL_CONFIG = {
  madMultiplier: 3.0,
  features: [
    "cross_domain.expenditure_per_progress_point",
    "payment.payment_velocity_amount_per_month",
    "temporal.days_recommendation_to_sanction"
  ]
};

export const ML_CONFIG = {
  nTrees: 100,
  subsampleSize: 128,
  scoreThreshold: 0.60,
  seed: 26102
};
```

---

## 5. Output Evidence Schema

Every signal provides transparent, verifiable evidence for audit personnel:

```typescript
export interface AnomalyEvidence {
  feature: string;
  observedValue: string | number | null;
  referenceValue: string | number;
  direction: string; // "above_expected" | "below_expected" | "inconsistent"
  explanation: string;
}

export interface AnomalySignal {
  projectCode: string;
  detectorId: string;
  detectorVersion: string;
  signalType: SignalType;
  severity: Severity; // "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  score: number; // Finite, bounded [0, 1]
  confidence?: string;
  evidence: AnomalyEvidence[];
  affectedFeatures: string[];
  explanation: string;
  generatedAt: string;
}
```

---

## 6. Signal Aggregation & Scoring Strategy (`backend/anomaly/aggregator.ts`)

1. **Overall Severity Resolution:**
   Determined strictly by the highest constituent signal severity:
   $$\text{CRITICAL} > \text{HIGH} > \text{MEDIUM} > \text{LOW}$$
   If no signals are triggered, `overallSeverity` defaults to `"LOW"` with an `overallSignalScore` of `0.0`.
2. **Overall Anomaly Signal Score:**
   Combines the primary signal score with a deterministic multi-signal boost bounded strictly to $[0, 1]$:
   $$\text{Score} = \min\left(1.0, \max(S) + \min(0.12, (N_{\text{signals}} - 1) \times 0.03)\right)$$
3. **Audit Explanation:**
   Generates a clear explanation detailing the count of signals, distinct evaluation domains, priority level, and next recommended physical inspection step.

---

## 7. Isolated Ground-Truth Evaluation (`backend/evaluation/evaluator.ts`)

The evaluation harness compares `data/processed/anomaly_results.json` against synthetic scenario labels stored in `data/generated/mplad_database.sqlite`:

- **Benchmark Dataset Summary:**
  - Total Projects: 300
  - Ground-Truth Anomalous: 120 projects
  - Ground-Truth Baseline (Normal): 180 projects
- **Benchmark Evaluation Results:**
  - **Precision:** $64.4\%$
  - **Recall:** $78.3\%$
  - **F1-Score:** $0.7067$
  - **False Positive Rate:** $28.9\%$
  - **Confusion Matrix:** $\text{TP} = 94, \text{FP} = 52, \text{TN} = 128, \text{FN} = 26$
- **High-Fidelity Scenario Recall:**
  - `PHYSICAL_FINANCIAL_MISMATCH`: $100.0\%$ ($18/18$)
  - `EXPENDITURE_SHIFT`: $100.0\%$ ($15/15$)
  - `PAYMENT_PATTERN_SIGNAL`: $100.0\%$ ($15/15$)
  - `MISSING_DOCUMENTATION`: $100.0\%$ ($15/15$)
  - `MULTI_SIGNAL`: $100.0\%$ ($12/12$)
  - `CONTRACTOR_CONCENTRATION`: $73.3\%$ ($11/15$)
