# MPLAD SENTINEL — Development & Architecture Log

## Phase 6 Implementation: Dataset + Database Foundation (Completed)

### 1. Architectural Scope
Phase 6 establishes the canonical, deterministic data and database foundation for the MPLAD SENTINEL system without touching or modifying the verified Phase 1–5 Next.js frontend.

### 2. Core Decisions
- **Storage Technology**: Selected Node.js built-in `node:sqlite` (`DatabaseSync`), which runs natively in Node 24 without external native dependencies or C++ compiler toolchains.
- **Single Source of Truth**: Generated `data/generated/mplad_synthetic_dataset.json` (300 records, 600 payments, 573 progress logs, 900 documents) and seeded `data/generated/mplad_database.sqlite`.
- **Determinism**: Built a stateful Mulberry32 PRNG with fixed seed `26102`. Two independent generation runs produce 100% byte-for-byte identical datasets.
- **Ground Truth Metadata**: 9 distinct scenario types (`NORMAL`, `DUPLICATE_SIGNAL`, `EXPENDITURE_SHIFT`, `TIMELINE_INCONSISTENCY`, `PHYSICAL_FINANCIAL_MISMATCH`, `PAYMENT_PATTERN_SIGNAL`, `CONTRACTOR_CONCENTRATION`, `MISSING_DOCUMENTATION`, `MULTI_SIGNAL`). These represent dataset-generation metadata for future model evaluation, not algorithmic detections.
- **Decoupled Data Access**: Implemented `ProjectRepository` providing typed queries (`getProjectByCode`, `getProjects`, `getProjectCount`, `getDistinctDistricts`, `getDistinctSectors`, `getDistinctAgencies`) ready for future REST API exposure in Phase 9.

### 3. Verification & Compliance
- `npm run test:data`: 13 / 13 tests passed.
- `npm run typecheck`: 0 errors.
- `npm run lint`: 0 errors, 0 warnings.
- `npm run build`: Production build passes with exit code 0.
- All 9 application routes return HTTP 200.
- Strict Phase 6 boundary maintained: Zero ML models, zero risk scoring, zero frontend changes.

## Phase 7 Implementation: Feature Engineering & Intelligence Data Pipeline (Completed)

### 1. Architectural Scope
Phase 7 constructs the deterministic, mathematically grounded feature engineering layer that converts canonical SQLite project and child records into structured, typed feature vectors for future anomaly detection models.

### 2. Core Decisions
- **Strict Phase Boundary**: Zero anomaly detection, zero risk scoring, zero confidence scoring, zero ML classifiers, zero frontend modifications. Features are strictly descriptive representations.
- **Anti-Leakage Isolation**: `scenario_type` and `scenario_description` are strictly isolated and prevented from entering the feature vector. Automated tests assert absence of scenario keys and ground-truth label tokens.
- **Feature Taxonomy (65 Features)**:
  - Categorical (9 features)
  - Financial (12 features)
  - Physical Progress (8 features)
  - Temporal (7 features)
  - Payment (7 features)
  - Contractor Context (4 features)
  - Agency Context (4 features)
  - Documentation (8 features)
  - Cross-Domain (6 features)
- **Deterministic Pipeline**: Exported to `data/processed/project_features.json` with deterministic reference audit date `2026-09-04` and feature version `1.0.0`.
- **Missing-Value Policy**: Explicit `null` representation for event intervals with insufficient sample points (< 2 events) to avoid erroneous 0 assumptions.

### 3. Verification & Compliance
- `npm run features:generate`: Extracted, validated, and exported 300 records in 32ms.
- `npm run test:features`: 17 / 17 automated tests passing.
- `npm run test:data`: 13 / 13 Phase 6 regression tests passing.
- `npm run typecheck`: 0 errors.
- `npm run lint`: 0 errors, 0 warnings.
- `npm run build`: Production build passes with exit code 0 across all 9 routes.
- Strict Phase 7 boundary maintained: Zero Phase 8 anomaly detection implemented.

## Phase 8 Implementation: Explainable Multi-Engine Anomaly Detection & Intelligence Engine (Completed)

### 1. Architectural Scope
Phase 8 constructs the explainable anomaly detection engine layer that evaluates FeatureRecords from Phase 7 through three independent, complementary analytical engines:
1. Deterministic Rule-Based Anomaly Detection (7 primary domain rules + 1 multi-signal synthesizer)
2. Robust Statistical Outlier Detection using Median Absolute Deviation (MAD) & Modified Z-scores
3. Pure TypeScript Unsupervised Machine Learning (Isolation Forest with Mulberry32 PRNG seed 26102)
4. Consolidated Signal Aggregator and Schema/Ethics Validator
5. Isolated Ground-Truth Benchmark Evaluation against Phase 6 SQLite database

### 2. Core Decisions & Governance
- **Responsible AI Boundary**: The engine exclusively detects "potential anomaly signals" requiring administrative audit review. Strict zero-tolerance ban on accusatory terms (`fraud`, `fraudulent`, `guilty`, `corrupt`). "Anomaly signal does not equal fraud."
- **Strict Anti-Leakage Invariant**: Synthetic `scenario_type` benchmark labels are exclusively accessed inside `backend/evaluation/evaluator.ts`. All detection rules, statistical baselines, ML feature matrices, and aggregators are completely isolated from ground truth.
- **Rule Detectors**:
  - `physicalFinancialMismatchRule.ts` (`PHYSICAL_FINANCIAL_MISMATCH`)
  - `timelineInconsistencyRule.ts` (`TIMELINE_INCONSISTENCY`)
  - `paymentPatternRule.ts` (`PAYMENT_PATTERN_SIGNAL`)
  - `expenditureShiftRule.ts` (`EXPENDITURE_SHIFT`)
  - `duplicateWorkRule.ts` (`DUPLICATE_SIGNAL`)
  - `contractorConcentrationRule.ts` (`CONTRACTOR_CONCENTRATION`)
  - `missingDocumentationRule.ts` (`MISSING_DOCUMENTATION`)
  - `multiSignalRule.ts` (`MULTI_SIGNAL`)
- **Robust Statistics**: Median Absolute Deviation (MAD) with Boris Iglewicz & David Hoaglin (1993) Modified Z-scores ($|Z| \ge 3.0$). Safe zero-MAD handling.
- **Pure TypeScript Isolation Forest**: 100 recursive isolation trees, subsample size 128, score threshold 0.60, deterministic Mulberry32 PRNG (seed 26102). Implemented from first principles without Python or external dependencies.
- **Artifacts**:
  - `data/processed/anomaly_results.json`: 300 validated project results with evidence, severity, and scores.
  - `data/evaluation/anomaly_evaluation.json`: Precision (64.4%), Recall (78.3%), F1 (0.7067), Confusion Matrix.

### 3. Verification & Compliance
- `npm run test:data`: 13 / 13 tests passed.
- `npm run test:features`: 17 / 17 tests passed.
- `npm run test:anomaly`: 20 / 20 tests passed.
- `npm run anomaly:run`: 300 projects processed deterministically.
- `npm run anomaly:eval`: Benchmark evaluation completed.
- `npm run typecheck`: 0 errors.
- `npm run lint`: 0 errors, 0 warnings.
- `npm run build`: Production build passes with exit code 0 across all 9 routes.
- Anti-leakage scan: 0 occurrences of `scenario_type` in detection code.
- Responsible AI scan: 0 occurrences of forbidden terms in output results.

## Phase 9 Implementation: Backend REST API + Frontend Intelligence Integration (Completed)

### 1. Architectural Scope
Phase 9 establishes the live application REST API layer and connects the SQLite database and Phase 8 anomaly intelligence directly into the Next.js frontend, transforming MPLAD SENTINEL into a fully operational end-to-end intelligence system.
Data Flow:
`SQLite Database` → `ProjectRepository` → `Anomaly Results (anomaly_results.json)` → `Service Layer` → `Next.js App Router API Routes (/api/...)` → `Centralized API Client` → `Frontend UI (Dashboard, Project Explorer, Project Detail, Investigations)`

### 2. Core Decisions & Contracts
- **Data Integrity Rule (RECEIVE → FORMAT → DISPLAY)**: Zero business or anomaly metric calculation in the frontend. All severity classifications, anomaly signals, and evidence originate from backend intelligence.
- **Responsible AI Notice**: Enforced persistent notice: *"Anomaly signal does not equal fraud. Physical verification & human investigation required."* Zero accusatory terms across all API outputs.
- **REST Endpoints (`src/app/api/`)**:
  - `GET /api/health`: Validates SQLite database connectivity and anomaly engine availability.
  - `GET /api/projects`: Filtered, sorted, paginated project catalog joined with backend anomaly severity.
  - `GET /api/projects/[projectCode]`: Single project record and anomaly summary.
  - `GET /api/projects/[projectCode]/payments`: Treasury payment tranches.
  - `GET /api/projects/[projectCode]/progress`: Physical progress events and inspection logs.
  - `GET /api/projects/[projectCode]/documents`: Uploaded statutory audit documents.
  - `GET /api/anomalies`: Portfolio-wide anomaly evaluation results.
  - `GET /api/anomalies/[projectCode]`: Project-specific anomaly signals and mathematical evidence.
  - `GET /api/dashboard`: Aggregated portfolio intelligence, KPIs, sector and district risk distributions.
  - `GET /api/investigations`: Prioritized audit review queue for field inspections.
- **Centralized API Client (`src/lib/api-client/`)**: Strongly typed client methods wrapping `apiFetch` with dynamic origin resolution and development fallbacks. Zero scattered `fetch()` calls.
- **Connected Frontend Views**:
  - `/dashboard`: Consumes `/api/dashboard`.
  - `/projects`: Consumes `/api/projects` with live server-side search, filtering, and pagination.
  - `/projects/[projectCode]`: Consumes `/api/projects/[code]`, `/api/anomalies/[code]`, payments, progress, and documents.
  - `/investigations`: Consumes `/api/investigations` with review priority filtering.
  - `/investigations/[id]`: Renders comprehensive case dossier.

### 3. Verification & Compliance
- `npm run test:api`: 20 / 20 tests passed.
- `npm run test:data`: 13 / 13 tests passed.
- `npm run test:features`: 17 / 17 tests passed.
- `npm run test:anomaly`: 20 / 20 tests passed.
- `npm run typecheck`: 0 errors.
- `npm run lint`: 0 errors, 0 warnings.
- `npm run build`: Production build passes with exit code 0 across all 19 routes (10 API endpoints + 9 pages).
## Phase 9A Implementation: Standalone REST API Foundation (Completed)

### 1. Architectural Scope
Phase 9A establishes a native, lightweight Node.js 24 TypeScript HTTP REST API server foundation (`backend/api/server.ts`, `backend/api/router.ts`) operating independently on port 4000 alongside Next.js App Router API routes, complete with CORS preflight support, centralized error trapping, and strict schema compliance.
Data Flow:
`SQLite Database (ProjectRepository)` + `Phase 8 Anomaly Artifacts (anomaly_results.json)` → `API Service Layer` → `Native Router (router.ts)` → `HTTP Server (server.ts :4000)` → `Client / Frontend Applications`

### 2. Implemented Modules
- `backend/api/server.ts`: Configurable native Node HTTP server listening on PORT (default 4000).
- `backend/api/router.ts`: Request dispatcher matching `/api/health`, `/api/projects`, `/api/projects/:projectCode`, `/api/anomalies`, `/api/anomalies/:projectCode`, `/api/dashboard`, `/api/investigations`. Includes CORS handling for `http://localhost:3000` and `http://localhost:3005`.
- `backend/api/errors.ts`: Centralized `ApiError`, `BadRequestError`, `NotFoundError`, and `formatErrorResponse` ensuring zero internal stack traces or SQL statements leak to clients.
- `backend/api/types.ts`: Extended with `PaginationMeta`, `AnomalyListResponse`, `AnomalyResponse`, and updated `ProjectListResponse` / `HealthResponse`.
- Package Scripts: Added `"api:dev"` and `"api:start"` (`node backend/api/server.ts`).

### 3. Verification & Compliance
- `npm run test:api`: 16/16 tests passing, including live HTTP server test on port 4098 with CORS preflight.
- `npm run test:data`: 13/13 passing.
- `npm run test:features`: 17/17 passing.
- `npm run test:anomaly`: 20/20 passing.
- `npm run anomaly:run`: Evaluated 300 projects, 365 signals generated.
- `npm run anomaly:eval`: Precision 64.4%, Recall 78.3%, F1 0.7067.
- `npm run typecheck`: 0 errors.
- `npm run lint`: 0 errors, 0 warnings.
- `npm run build`: Production build passes across all routes.
- Live Port 4000 Standalone Server Verification: All endpoints tested and verified returning HTTP 200 / 404.
- Anti-leakage: Zero `scenario_type` instances in API payloads.
- Responsible AI: Zero accusatory terms in user-facing output.

## Phase 9B: Deployable Product Transformation & Real Workflow Persistence (Completed)

### 1. Architectural Scope
Phase 9B eliminates all simulated, theatrical, or fake workflow mechanics, establishing a credible, deployable SIH prototype for MPLAD SENTINEL (SIH26102). The entire stack operates as a real, production-ready data flow:
`SQLite (node:sqlite)` → `ProjectRepository` → `Feature Engineering (65 features)` → `Phase 8 Anomaly Engine` → `REST API Layer` → `API Client` → `Auditor-Facing Institutional UI`

### 2. Implemented Capabilities
- **Removal of Simulation Artifacts**: Audited and removed all simulated agent activity, "agent running" indicators, fake console behavior, and mock workflows. Replaced with authentic system telemetry: "Intelligence Engine Available", "Last Analysis Run", "Projects Analyzed" (300), and "Human Verification Required".
- **Real Workflow & Note Persistence in SQLite**:
  - Added `auditor_reviews` table in `backend/database/schema.sql` to persist workflow status transitions, action types, action labels, justification notes, and timestamps.
  - Added `auditor_notes` table to persist auditor field observations and remarks.
  - Extended `ProjectRepository` with `recordAuditorReview()`, `getAuditorReviews()`, `addAuditorNote()`, `getAuditorNotes()`, and `getLatestReviewStatus()`.
  - Added API endpoints: `GET`/`POST /api/projects/[projectCode]/notes` and `GET`/`POST /api/projects/[projectCode]/reviews`.
  - Wired `ProjectInvestigationClient` so that auditor actions ("Mark for Physical Verification", "Schedule Inspection", "Request Evidence", "Acknowledge Signal", "Dismiss Signal") and notes are saved directly to the database and reloaded on dossier inspection.
- **Institutional Reference UI Overhaul**:
  - Replaced dark/cybersecurity styling with clean institutional light theme (#F8F9FB neutral background, #FFFFFF cards, #DDE2EA borders, #0080FF primary accent, Inter font, tabular numbers in JetBrains Mono).
  - Redesigned all shell, dashboard, project explorer, and investigation dossier views.
  - Added persistent `DEMO DATA — NOT OFFICIAL GOVERNMENT DATA` disclaimers and Responsible AI banners across all auditor workspaces.
- **Production & Deployment Readiness**:
  - Created `.env.example` defining `PORT`, `API_BASE_URL`, `DATABASE_PATH`, `NEXT_PUBLIC_APP_NAME`.
  - Eliminated all hardcoded absolute Windows paths or localhost assumptions in core logic.
  - Verified Next.js production build (`next build`) compiles cleanly with 0 errors across all routes.

### 3. Verification & Compliance
- `npm run typecheck`: 0 errors.
- `npm run lint`: 0 errors.
- `npm run build`: Production build passes with exit code 0 across all 23 application routes.
- `npm run test:data`: 13 / 13 tests passing.
- `npm run test:features`: 17 / 17 tests passing.
- `npm run test:anomaly`: 20 / 20 tests passing.
- `npm run test:api`: 16 / 16 tests passing.
- Total automated tests: 66 / 66 passing (100% pass rate).
- Zero `scenario_type` leakage in `src/` frontend codebase.
- Zero accusatory words in frontend user interface.


