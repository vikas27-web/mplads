# MPLAD SENTINEL — REST API Documentation (Phase 9 & Phase 9A)

## Architecture Overview

MPLAD SENTINEL provides a dual-deployment REST API architecture:
1. **Standalone Node.js 24 HTTP Server**: Located in [`backend/api/server.ts`](file:///c:/Users/vikas/OneDrive/Desktop/SIH/backend/api/server.ts) and [`backend/api/router.ts`](file:///c:/Users/vikas/OneDrive/Desktop/SIH/backend/api/router.ts), running natively on `http://localhost:4000` with zero external dependencies.
2. **Next.js App Router Routes**: Located in `src/app/api/` for integrated same-origin Next.js fullstack execution.

Both surfaces consume identical backend domain services in `backend/api/services/`:
```
SQLite (ProjectRepository) + Phase 8 Anomaly Artifacts (anomaly_results.json)
                                ↓
                        Backend Services
          (projectService, anomalyService, dashboardService)
                                ↓
        +-----------------------+-----------------------+
        |                                               |
  Standalone Server (:4000)                   Next.js App Router (:3000/:3005)
  (backend/api/server.ts)                     (src/app/api/*)
```

## Local Development Instructions

- **Start Standalone REST API Server**:
  ```bash
  npm run api:dev   # or npm run api:start (defaults to http://localhost:4000)
  ```
- **Configure Port & CORS**:
  ```bash
  PORT=4000 CORS_ORIGIN=http://localhost:3000,http://localhost:3005 npm run api:start
  ```
- **Run API Integration & Server Tests**:
  ```bash
  npm run test:api
  ```

## Data Provenance & Responsible AI Principles

- **Data Provenance**: All project records originate from canonical SQLite database tables (`projects`, `payment_records`, `physical_progress_records`, `document_records`). All anomaly signals and evidence originate strictly from Phase 8 `data/processed/anomaly_results.json`.
- **Zero Frontend Business Calculations**: The frontend follows `RECEIVE → FORMAT → DISPLAY`. Anomaly scores, risk categories, and aggregations are NEVER calculated in React.
- **Anti-Leakage**: Synthetic evaluation ground-truth (`scenario_type`) is strictly barred from all API outputs.
- **Responsible AI Boundary**: Never use accusatory terminology (`fraudulent project`, `corrupt contractor`, `guilty`, `fraudster`). All signals represent *potential anomalies requiring physical audit verification*.
- **Mandatory Disclaimer**:
  > *"Anomaly signal does not equal fraud. Physical verification & human investigation required."*

---

## Response Envelopes

All endpoints return a uniform JSON envelope adhering to the following structure:

```json
{
  "success": true,
  "data": { ... },
  "pagination": {
    "page": 1,
    "pageSize": 25,
    "total": 300,
    "totalPages": 12
  },
  "meta": {
    "timestamp": "2026-09-04T12:00:00.000Z"
  }
}
```

Error responses:

```json
{
  "success": false,
  "error": {
    "code": "PROJECT_NOT_FOUND",
    "message": "Project was not found."
  },
  "meta": {
    "timestamp": "2026-09-04T12:00:00.000Z"
  }
}
```

---

## 1. GET `/api/health`

### Purpose
System health and operational status verification. Inspects SQLite database accessibility and Phase 8 anomaly intelligence availability.

### Query Parameters
None.

### Success Response (HTTP 200)
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "database": "connected",
    "anomalyEngine": "available",
    "projectCount": 300,
    "version": "1.0.0"
  },
  "meta": {
    "timestamp": "2026-09-04T00:00:00.000Z"
  }
}
```

### Error Response (HTTP 503)
```json
{
  "success": true,
  "data": {
    "status": "degraded",
    "database": "error",
    "anomalyEngine": "unavailable"
  }
}
```

---

## 2. GET `/api/projects`

### Purpose
Retrieves paginated, filtered, and sorted MPLAD projects joined with Phase 8 anomaly severity metadata.

### Query Parameters
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `search` | string | Optional | Search query matching project code, title, constituency, district, agency, contractor. |
| `district`| string | Optional | Filter by district name (e.g. `Varanasi`, `Bangalore Urban`) or `ALL`. |
| `sector` | string | Optional | Filter by sector classification (e.g. `Education`, `Drinking Water`) or `ALL`. |
| `severity`| string | Optional | Filter by backend anomaly severity: `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`, or `ALL`. |
| `status` | string | Optional | Filter by project status: `Sanctioned`, `In Progress`, `Completed`, `Delayed`. |
| `sortBy` | string | Optional | Sort field: `projectCode`, `recommendedAmount`, `lastUpdated`, `severity`. Default: `projectCode`. |
| `sortOrder`| string | Optional | Sort direction: `asc` or `desc`. Default: `asc`. |
| `page` | number | Optional | Page number (1-indexed). Default: `1`. |
| `pageSize`| number | Optional | Number of items per page (1 to 100). Default: `10`. (Alias: `limit`). |

### Example Request
`GET /api/projects?district=Varanasi&severity=HIGH&page=1&pageSize=5`

### Success Response (HTTP 200)
```json
{
  "success": true,
  "data": {
    "projects": [
      {
        "projectCode": "MPLAD-UP-VAR-00124",
        "title": "Solar Powered Drinking Water System",
        "constituency": "Varanasi",
        "district": "Varanasi",
        "state": "Uttar Pradesh",
        "sector": "Drinking Water",
        "implementingAgency": "Rural Water Supply Dept",
        "contractorName": "Apex Infra Works Pvt Ltd",
        "recommendedAmount": 2500000,
        "severity": "HIGH",
        "signal": "PHYSICAL_FINANCIAL_MISMATCH",
        "status": "In Progress",
        "sanctionDate": "2024-03-15",
        "lastUpdated": "2024-11-20",
        "anomalyScore": 0.85,
        "signalsCount": 2
      }
    ],
    "totalCount": 18,
    "page": 1,
    "pageSize": 5,
    "totalPages": 4,
    "availableDistricts": ["Bangalore Urban", "Varanasi"],
    "availableSectors": ["Drinking Water", "Education"],
    "availableStatuses": ["Completed", "Delayed", "In Progress", "Sanctioned"],
    "availableSeverities": ["CRITICAL", "HIGH", "MEDIUM", "LOW"]
  },
  "meta": {
    "total": 18,
    "page": 1,
    "pageSize": 5,
    "totalPages": 4
  }
}
```

---

## 3. GET `/api/projects/[projectCode]`

### Purpose
Retrieves comprehensive details for an individual project along with Phase 8 anomaly intelligence summary.

### Example Request
`GET /api/projects/MPLAD-KA-BEN-01446`

### Success Response (HTTP 200)
```json
{
  "success": true,
  "data": {
    "project": {
      "project_code": "MPLAD-KA-BEN-01446",
      "project_title": "Primary Health Centre Diagnostic Wing",
      "constituency": "Bangalore South",
      "district": "Bangalore Urban",
      "sanctioned_amount": 4500000,
      "released_amount": 4000000,
      "expenditure_amount": 3900000,
      "reported_physical_progress": 35.0
    },
    "anomalyResult": {
      "projectCode": "MPLAD-KA-BEN-01446",
      "overallSeverity": "HIGH",
      "overallSignalScore": 0.82,
      "explanation": "2 potential anomaly signal(s) identified. Review priority: HIGH."
    },
    "summary": {
      "severity": "HIGH",
      "signalCount": 2,
      "overallSignalScore": 0.82,
      "reviewPriority": "Immediate Inspection Required",
      "primaryExplanation": "Financial burn rate significantly exceeds physical engineering milestones."
    }
  }
}
```

### Error Response (HTTP 404)
```json
{
  "success": false,
  "error": {
    "code": "PROJECT_NOT_FOUND",
    "message": "Project with code \"MPLAD-UNKNOWN-999\" was not found in the database."
  }
}
```

---

## 4. GET `/api/projects/[projectCode]/payments`

### Purpose
Returns granular treasury payment tranche records for a given project from canonical SQLite storage.

### Example Request
`GET /api/projects/MPLAD-KA-BEN-01446/payments`

### Success Response (HTTP 200)
```json
{
  "success": true,
  "data": {
    "projectCode": "MPLAD-KA-BEN-01446",
    "totalPayments": 2,
    "payments": [
      {
        "id": 1,
        "project_code": "MPLAD-KA-BEN-01446",
        "tranche_number": 1,
        "payment_date": "2024-04-10",
        "amount": 2000000,
        "voucher_number": "VR-2024-001",
        "status": "Disbursed"
      }
    ]
  }
}
```

---

## 5. GET `/api/projects/[projectCode]/progress`

### Purpose
Returns logged physical progress events and site inspection records for a project.

### Example Request
`GET /api/projects/MPLAD-KA-BEN-01446/progress`

### Success Response (HTTP 200)
```json
{
  "success": true,
  "data": {
    "projectCode": "MPLAD-KA-BEN-01446",
    "totalEvents": 2,
    "progressEvents": [
      {
        "id": 1,
        "project_code": "MPLAD-KA-BEN-01446",
        "record_date": "2024-05-15",
        "physical_progress_percentage": 35.0,
        "stage_name": "Foundation Completed",
        "inspector_designation": "Assistant Executive Engineer"
      }
    ]
  }
}
```

---

## 6. GET `/api/projects/[projectCode]/documents`

### Purpose
Returns uploaded statutory audit documents, inspection certificates, and completion certificates.

### Example Request
`GET /api/projects/MPLAD-KA-BEN-01446/documents`

### Success Response (HTTP 200)
```json
{
  "success": true,
  "data": {
    "projectCode": "MPLAD-KA-BEN-01446",
    "totalDocuments": 3,
    "documents": [
      {
        "id": 1,
        "project_code": "MPLAD-KA-BEN-01446",
        "title": "Administrative Sanction Order",
        "document_type": "Sanction Order",
        "verified_status": 1
      }
    ]
  }
}
```

---

## 7. GET `/api/anomalies`

### Purpose
Retrieves all Phase 8 anomaly detection results across the entire portfolio.

### Query Parameters
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `severity` | string | Optional | Filter by severity (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`, or `ALL`). |

### Example Request
`GET /api/anomalies?severity=CRITICAL`

### Success Response (HTTP 200)
```json
{
  "success": true,
  "data": {
    "total": 35,
    "results": [ ... ]
  }
}
```

---

## 8. GET `/api/anomalies/[projectCode]`

### Purpose
Retrieves full explainable anomaly signals, underlying mathematical evidence, and affected features for a specific project.

### Example Request
`GET /api/anomalies/MPLAD-KA-BEN-01446`

### Success Response (HTTP 200)
```json
{
  "success": true,
  "data": {
    "projectCode": "MPLAD-KA-BEN-01446",
    "anomalyResult": {
      "projectCode": "MPLAD-KA-BEN-01446",
      "overallSeverity": "HIGH",
      "overallSignalScore": 0.82,
      "signals": [
        {
          "signalType": "PHYSICAL_FINANCIAL_MISMATCH",
          "severity": "HIGH",
          "score": 0.8,
          "evidence": [
            {
              "feature": "cross_domain.financial_progress_vs_physical_progress_gap",
              "observedValue": 51.6,
              "referenceValue": 35.0,
              "direction": "above_expected",
              "explanation": "Financial drawdown leads physical milestones by 51.6 percentage points."
            }
          ]
        }
      ]
    }
  }
}
```

---

## 9. GET `/api/dashboard`

### Purpose
Returns aggregated portfolio intelligence, KPIs, sector and district risk concentrations, and prioritized signals for the executive dashboard.

### Example Request
`GET /api/dashboard`

### Success Response (HTTP 200)
```json
{
  "success": true,
  "data": {
    "isDemoData": false,
    "disclaimerText": "All anomaly counts and priority ratings originate from deterministic audit rules, MAD robust statistics, and unsupervised Isolation Forest engines.",
    "kpis": {
      "totalProjects": 300,
      "totalAnomalies": 146,
      "criticalRiskCount": 35,
      "highRiskCount": 78,
      "mediumRiskCount": 33,
      "lowRiskCount": 154
    },
    "riskDistribution": [ ... ],
    "anomalyDistribution": [ ... ],
    "districtSignals": [ ... ],
    "sectorSignals": [ ... ],
    "agencySignals": [ ... ],
    "prioritySignals": [ ... ],
    "priorityProjects": [ ... ]
  }
}
```

---

## 10. GET `/api/investigations`

### Purpose
Returns prioritized audit queue of projects exhibiting potential anomaly signals for field verification and auditor case management.

### Query Parameters
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `severity` | string | Optional | Filter by review priority (`CRITICAL`, `HIGH`, `MEDIUM`, or `ALL`). |
| `search` | string | Optional | Search query on project code, title, constituency, or district. |

### Example Request
`GET /api/investigations?severity=CRITICAL`

### Success Response (HTTP 200)
```json
{
  "success": true,
  "data": {
    "total": 35,
    "investigations": [
      {
        "id": "case-MPLAD-KA-BEN-01446",
        "projectCode": "MPLAD-KA-BEN-01446",
        "title": "Primary Health Centre Diagnostic Wing",
        "constituency": "Bangalore South",
        "district": "Bangalore Urban",
        "sector": "Health & Family Welfare",
        "severity": "CRITICAL",
        "signalType": "PHYSICAL_FINANCIAL_MISMATCH",
        "explanation": "Severe physical-financial divergence observed.",
        "evidenceCount": 3,
        "overallSignalScore": 0.95,
        "reviewPriority": "Immediate Physical Inspection Required",
        "signals": [ ... ]
      }
    ]
  }
}
```

---

## 11. GET `/api/projects/[projectCode]/anomalies`

### Purpose
Retrieves the explainable anomaly result for a given project under the project-specific resource tree. Mirrors the `/api/anomalies/[projectCode]` contract.

### Example Request
`GET /api/projects/MPLAD-KA-BEN-01446/anomalies`

### Success Response (HTTP 200)
```json
{
  "success": true,
  "data": {
    "projectCode": "MPLAD-KA-BEN-01446",
    "anomalyResult": {
      "projectCode": "MPLAD-KA-BEN-01446",
      "overallSeverity": "HIGH",
      "overallSignalScore": 0.82,
      "signals": [
        {
          "signalType": "PHYSICAL_FINANCIAL_MISMATCH",
          "severity": "HIGH",
          "score": 0.8,
          "evidence": [
            {
              "feature": "cross_domain.financial_progress_vs_physical_progress_gap",
              "observedValue": 51.6,
              "referenceValue": 35.0,
              "direction": "above_expected",
              "explanation": "Financial drawdown leads physical milestones by 51.6 percentage points."
            }
          ]
        }
      ]
    }
  }
}
```

---

## 12. GET `/api/investigations/[id]`

### Purpose
Retrieves a specific investigation case file and synthesized audit dossier by identifier. Supports case IDs (`case-MPLAD-KA-BEN-01446`), project codes (`MPLAD-KA-BEN-01446`), or 1-based queue indices (`1`, `2`).

### Example Request
`GET /api/investigations/1`

### Success Response (HTTP 200)
```json
{
  "success": true,
  "data": {
    "investigation": {
      "id": "case-MPLAD-KA-BEN-01446",
      "projectCode": "MPLAD-KA-BEN-01446",
      "title": "Primary Health Centre Diagnostic Wing",
      "constituency": "Bangalore South",
      "district": "Bangalore Urban",
      "sector": "Health & Family Welfare",
      "severity": "CRITICAL",
      "signalType": "PHYSICAL_FINANCIAL_MISMATCH",
      "explanation": "Severe physical-financial divergence observed.",
      "evidenceCount": 3,
      "overallSignalScore": 0.95,
      "reviewPriority": "Immediate Physical Inspection Required",
      "signals": [ ... ]
    },
    "dossier": {
      "projectCode": "MPLAD-KA-BEN-01446",
      "title": "Primary Health Centre Diagnostic Wing",
      "severity": "CRITICAL",
      "signals": [ ... ],
      "financialEvidence": { ... },
      "physicalVerificationEvidence": { ... },
      "documentEvidence": [ ... ],
      "timelineEvents": [ ... ]
    }
  }
}
```

