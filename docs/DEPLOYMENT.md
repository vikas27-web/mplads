# MPLAD SENTINEL — Production Deployment Guide
**SIH26102 — Audit Intelligence Platform**

This guide provides exhaustive instructions for deploying **MPLAD SENTINEL** in production environments.

---

## 1. Deployment Architecture Overview

MPLAD SENTINEL uses Node 22 native `node:sqlite` for high-throughput, low-latency relational queries, and filesystem-backed JSON artifacts for pre-evaluated anomaly matrices.

```
┌─────────────────────────────────────────────────────────────┐
│                      Client / Browser                       │
│              (Auditors, Field Reviewers, Public)             │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                     Reverse Proxy / CDN                     │
│               (Cloudflare, Render, AWS ALB, etc.)            │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                  MPLAD SENTINEL Application                 │
│                                                             │
│   Next.js 14 Web UI  ◄────────►  Next.js REST API           │
│   (Server / Client Pages)         (App Router /api)         │
│                                           │                 │
│                                           ▼                 │
│                              Backend Intelligence Layer     │
│                              - ProjectRepository            │
│                              - AnomalyService               │
│                              - InvestigationService         │
│                                           │                 │
│                                           ▼                 │
│                        ┌──────────────────────────────────┐ │
│                        │       Persistent Storage         │ │
│                        │ - mplad_database.sqlite          │ │
│                        │ - anomaly_results.json           │ │
│                        │ - project_features.json          │ │
│                        └──────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Platform Compatibility & SQLite Persistence

### Why Persistence Matters
In MPLAD SENTINEL, auditors submit review determinations (*"Schedule Inspection"*, *"Request Additional Evidence"*, *"Close Review"*) and append timestamped investigation notes. These actions write to the `auditor_reviews` and `auditor_notes` SQLite tables.

| Platform | SQLite Persistence Support | Recommendation |
|---|---|---|
| **Render.com** (Docker + Disk) | **Full Native Persistence** (Mounted Volume) | **Recommended (Production)** |
| **Railway / Fly.io / VPS** (Docker) | **Full Native Persistence** (Volume Mount) | **Recommended (Production)** |
| **AWS EC2 / DigitalOcean** | **Full Native Persistence** | **Recommended (Enterprise)** |
| **Vercel** (Serverless) | **Temporary Ephemeral** (Auto-mirrored to `/tmp`) | Good for read-only preview/demo |

> **Note on Serverless Fallback:** When deployed on Vercel or AWS Lambda, the application detects the serverless environment and automatically copies `mplad_database.sqlite` to `/tmp/mplad_database.sqlite`. Writes succeed during the lifetime of the warm container instance, but will not persist across container cold starts unless a persistent container is used.

---

## 3. Option A: 1-Click Render.com Deployment (Recommended)

Render provides Docker runtime with persistent disk volumes, ensuring full SQLite persistence.

### Using `render.yaml` Blueprint
1. Push your repository to GitHub or GitLab.
2. Log in to [Render Dashboard](https://dashboard.render.com).
3. Click **New +** → **Blueprint**.
4. Connect your repository. Render detects `render.yaml` automatically:
   - **Service Name:** `mplad-sentinel`
   - **Runtime:** Docker (`./Dockerfile`)
   - **Disk:** `mplad-data` (1 GB mounted at `/var/data`)
   - **Health Check:** `/health`
5. Click **Apply**.
6. Render builds the Docker image, mounts the disk, runs health checks, and provisions a public HTTPS URL (e.g., `https://mplad-sentinel.onrender.com`).

---

## 4. Option B: Docker Container Deployment

The repository includes a production multi-stage `Dockerfile`:

### 1. Build Docker Image
```bash
docker build -t mplad-sentinel:latest .
```

### 2. Run Container with Persistent Volume
```bash
docker run -d \
  --name mplad-sentinel \
  -p 3000:3000 \
  -v mplad_storage:/app/data \
  -e NODE_ENV=production \
  -e PORT=3000 \
  --restart unless-stopped \
  mplad-sentinel:latest
```

### 3. Verify Container Health
```bash
curl -f http://localhost:3000/health
```
Response:
```json
{
  "status": "ok",
  "service": "mplad-sentinel",
  "timestamp": "2026-09-04T16:07:00.000Z",
  "checks": {
    "status": "ok",
    "service": "mplad-sentinel-api",
    "database": "connected",
    "anomalyEngine": "available",
    "projectCount": 300,
    "version": "1.0.0"
  }
}
```

---

## 5. Option C: Vercel Deployment

For rapid preview deployment:

### 1. Install & Login
```bash
npx vercel login
```

### 2. Deploy
```bash
npx vercel --prod
```
The repository includes `vercel.json` preconfigured with `cleanUrls: true` and the Next.js framework preset.

---

## 6. Environment Variables

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `PORT` | No | `3000` | Port for the HTTP server |
| `NODE_ENV` | No | `production` | Node environment |
| `DATABASE_PATH` | No | `./data/generated/mplad_database.sqlite` | SQLite database file path. When using Docker volumes, set to `/var/data/mplad_database.sqlite` |
| `ANOMALY_RESULTS_PATH` | No | `./data/processed/anomaly_results.json` | Path to verified Phase 8 anomaly results |
| `NEXT_PUBLIC_API_URL` | No | `""` (auto `window.location.origin`) | Base URL for REST API calls if API is deployed to a separate domain |
| `CORS_ORIGIN` | No | `*` | Allowed CORS origins (comma-separated list or `*`) |

---

## 7. Health Probes & Monitoring

The application provides two machine-readable health endpoints:
- `GET /health`: Standard HTTP 200/503 health probe for load balancers (Kubernetes, AWS ALB, Render).
- `GET /api/health`: JSON envelope containing status of SQLite connection, anomaly engine availability, and total project count.

---

## 8. Troubleshooting

### Issue: Database not found or permission denied
- **Cause:** Running in an environment where the non-root user cannot write to `./data`.
- **Fix:** In Docker, `/app/data` is automatically chowned to `nextjs:nodejs`. For custom volume mounts, ensure user ID 1001 has write permissions.

### Issue: CORS error when hosting API on separate domain
- **Fix:** Set `CORS_ORIGIN=https://your-frontend-domain.com` (or `*` for permissive access).
