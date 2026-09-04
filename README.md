# MPLAD SENTINEL — Audit Intelligence Platform
**Smart India Hackathon 2024 / SIH26102**

> **Responsible AI Notice:** Anomaly signals indicate priority for human administrative audit and field inspection. Signals do not constitute proof of culpability or fraud. Physical verification & human investigation required.
> 
> **Data Notice:** DEMO DATA — NOT OFFICIAL GOVERNMENT DATA. All figures, contractor records, and work items are deterministically synthesized for audit-algorithm evaluation.

---

## 1. Project Overview

**MPLAD SENTINEL** is an institutional-grade, human-in-the-loop audit intelligence system engineered for the Member of Parliament Local Area Development Scheme (MPLADS). It ingests canonical project registries, financial ledger entries, physical inspection reports, and statutory compliance documents to detect statistical outliers and regulatory divergence.

Unlike black-box risk engines, MPLAD SENTINEL guarantees:
- **Zero Hallucination / Explainable Attribution:** Every signal is anchored to observed vs. baseline values, feature indicators, and deterministic mathematical rules.
- **Strict Anti-Leakage Invariants:** Synthetic scenario labels are strictly sequestered in evaluation harnesses; zero ground-truth labels touch features, inference, or API payloads.
- **Human-in-the-Loop Governance:** Auditors review evidence, record determinations ("Schedule Inspection", "Request Additional Evidence", "Under Review"), and log timestamped notes with persistent SQLite audit trails.
- **Clean Architecture:** Strict unidirectional flow `RECEIVE → FORMAT → DISPLAY` on the frontend with zero duplicated risk/anomaly formulas.

---

## 2. End-to-End Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 NEXT.JS 14 FRONTEND (React)                 │
│  Institutional Theme • Server & Client Components • Charts  │
└──────────────▲───────────────────────────────▲──────────────┘
               │                               │
        REST API Routes                  Central API Client
        (App Router /api)               (src/lib/api-client)
               │                               │
┌──────────────▼───────────────────────────────▼──────────────┐
│                  BACKEND INTELLIGENCE LAYER                 │
│                                                             │
│   1. SQLite Repository (backend/repository/projectRepo.ts)  │
│      - 300 Projects, 600 Payments, 573 Progress Records     │
│      - Persistent auditor_reviews & auditor_notes           │
│                                                             │
│   2. Feature Pipeline (backend/features/pipeline.ts)        │
│      - 65 Descriptive Features, 0% Ground-Truth Leakage     │
│                                                             │
│   3. Anomaly Engine (backend/anomaly/pipeline.ts)           │
│      - Rule Detectors (Mismatch, Duplicate, Timeline, etc.) │
│      - Robust Statistical Outlier Detection (MAD / Z-Score) │
│      - Pure TypeScript Isolation Forest (Seed 26102)        │
│                                                             │
│   4. Health & REST Router (backend/api/router.ts)           │
│      - GET /health, GET /api/*, CORS, Zero PII/Path leaks   │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Quick Start & Local Setup

### Prerequisites
- Node.js 20.x or 22.x LTS
- npm 10.x+

### 1. Installation
```bash
git clone <repo-url>
cd SIH
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default parameters are preconfigured for instant local execution.

### 3. Initialize Database & Generate Intelligence (If not pre-seeded)
```bash
# Generate synthetic dataset (300 projects)
npm run generate:data

# Initialize SQLite database
npm run init:db

# Generate 65-feature descriptive dataset
npm run features:generate

# Execute deterministic anomaly detection engine
npm run anomaly:run

# Evaluate model performance against ground truth
npm run anomaly:eval
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to access the application.

---

## 4. Production Build & Execution

```bash
# Build optimized Next.js production bundle
npm run build

# Start production server
npm run start
```
The server will bind to `0.0.0.0:3000` (or the configured `PORT`).

---

## 5. Verification Test Suite

MPLAD SENTINEL comes with an end-to-end automated verification suite covering dataset generation, feature mathematics, anomaly algorithms, API contracts, persistence, and type integrity:

```bash
# 1. Dataset & SQLite Repository Tests (13 tests)
npm run test:data

# 2. Feature Engineering & Anti-Leakage Tests (17 tests)
npm run test:features

# 3. Anomaly Detection & Isolation Forest Tests (20 tests)
npm run test:anomaly

# 4. REST API Contract & Responsible AI Tests (16 tests)
npm run test:api

# 5. Full Persistence Smoke Test (11 checks)
npm run test:smoke

# 6. Static Typechecking & Linting
npm run typecheck
npm run lint
```
**All 77+ tests pass with 100% success rate.**

---

## 6. API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` / `/api/health` | Service health status, database connection, anomaly engine status |
| `GET` | `/api/dashboard` | Portfolio summary, high-priority counts, sector & status breakdowns |
| `GET` | `/api/projects` | Paginated project catalog with district, sector, severity filters |
| `GET` | `/api/projects/:code` | Canonical project dossier, contractor, implementing agency |
| `GET` | `/api/projects/:code/signals` | Project anomaly signals, detector IDs, observed vs baseline values |
| `GET` | `/api/projects/:code/payments` | Payment installments, voucher numbers, payee details |
| `GET` | `/api/projects/:code/progress` | Physical stage milestones, inspection dates, percentages |
| `GET` | `/api/projects/:code/documents`| Statutory administrative & technical sanction documents |
| `GET` | `/api/projects/:code/reviews` | Persisted auditor determinations and review audit log |
| `POST`| `/api/projects/:code/reviews` | Record auditor action (Schedule Inspection, Under Review, etc.) |
| `GET` | `/api/projects/:code/notes`   | Persisted auditor case notes |
| `POST`| `/api/projects/:code/notes`   | Add timestamped auditor note |
| `GET` | `/api/investigations`         | Audit review queue prioritized by risk and signal severity |
| `GET` | `/api/investigations/:id`     | Deep-dive investigation dossier with complete evidence breakdown |

---

## 7. Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for full deployment instructions:
- **Docker Container (Recommended for Persistent SQLite)**: Complete multi-stage build running Node 22 Alpine.
- **Render.com Blueprint (`render.yaml`)**: One-click deployment with persistent 1 GB disk mount for SQLite data retention.
- **Vercel Serverless (`vercel.json`)**: Automatic `/tmp` database mirroring for zero-config serverless operation.
