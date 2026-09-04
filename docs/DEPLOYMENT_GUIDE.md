# MPLAD SENTINEL — Production Deployment Guide
**Smart India Hackathon 2024 — SIH26102**

---

## 1. Overview & Architecture

MPLAD SENTINEL is containerized and production-ready for automated deployment. The application uses Next.js 14, Node.js 22 LTS with native `node:sqlite`, and SQLite persistence for auditor review workflows.

```
Browser
   ↓
HTTPS Public URL (Render / Vercel)
   ↓
Next.js Production Application (Port 3000 / 0.0.0.0)
   ↓
REST APIs (/api/projects, /api/dashboard, /api/investigations, /health)
   ↓
SQLite Persistent Storage (/var/data/mplad_database.sqlite)
   ↓
Official SIH26102 Dataset (543 Lok Sabha MPs across 36 States/UTs)
   ↓
Capability-Aware Anomaly Detection & Intelligence
```

---

## 2. Option A: Render Blueprint Deployment (Recommended)

Render is the **recommended deployment target** because it provides a dedicated persistent disk mount for the SQLite database, ensuring that all human auditor notes and review actions persist across application updates and container restarts.

### Configuration Files Already in Repository:
- `Dockerfile`: Multi-stage Node 22 Alpine production build.
- `render.yaml`: Complete Infrastructure-as-Code Blueprint defining the web service and a 1GB persistent disk.

### Step-by-Step Deployment:
1. **Push Code to GitHub**:
   ```bash
   git add .
   git commit -m "feat(sih): complete Phase 12 & 13 production release"
   git remote add origin https://github.com/<your-username>/mplad-sentinel.git
   git branch -M main
   git push -u origin main
   ```
2. **Open Render Dashboard**:
   - Navigate to [https://dashboard.render.com/](https://dashboard.render.com/).
   - Click **New +** → **Blueprint**.
   - Select your GitHub repository.
3. **Render Automated Setup**:
   - Render detects `render.yaml` automatically.
   - It provisions the web service (`mplad-sentinel`) and the persistent disk (`mplad-data` at `/var/data`).
   - On first boot, the system automatically copies the bundled 543 official records into `/var/data/mplad_database.sqlite`.
4. **Access Public HTTPS URL**:
   - Render generates: `https://mplad-sentinel.onrender.com`.
   - Health check: `https://mplad-sentinel.onrender.com/health`.

---

## 3. Option B: Vercel Deployment (Serverless Alternative)

If you prefer Vercel for serverless edge delivery:

1. **Open Vercel Dashboard**:
   - Navigate to [https://vercel.com/new](https://vercel.com/new).
   - Import your GitHub repository.
2. **Framework Preset**:
   - Next.js (automatically detected).
   - Root directory: `./`.
3. **Serverless SQLite Handling**:
   - The application automatically mirrors `data/generated/mplad_database.sqlite` into `/tmp/mplad_database.sqlite` in serverless environments, allowing fast read and write operations.
4. **Deploy**:
   - Click **Deploy**. Vercel will build the production bundle and assign a public `https://*.vercel.app` URL.

---

## 4. Production Environment Variables

| Variable | Recommended Production Value | Description |
|---|---|---|
| `NODE_ENV` | `production` | Enables production optimizations and secure cookies |
| `PORT` | `3000` | HTTP listening port (Render/Docker sets automatically) |
| `DATABASE_PATH` | `/var/data/mplad_database.sqlite` (Render) or `./data/generated/mplad_database.sqlite` (Local) | Persistent SQLite database file location |
| `ANOMALY_RESULTS_PATH` | `/app/data/processed/anomaly_results.json` | Path to Phase 8/12 anomaly evaluation matrix |
| `CORS_ORIGIN` | `*` | Allowed origins for cross-origin API consumers |
| `DEMO_AUDITOR_ID` | `auditor@mplad.gov.in` | Prototype auditor username for evaluation |
| `DEMO_AUDITOR_PASSWORD` | `Sentinel@2024` | Prototype auditor password for evaluation |

---

## 5. Security & Verification Invariants

- **Protected Routes**: `/dashboard`, `/projects`, `/analytics`, `/investigations` are guarded by HTTP-only session cookies and redirect unauthorized requests to `/login`.
- **Health Check**: `GET /health` returns HTTP 200 with operational metrics (`checks.projectCount: 543`, `database: "connected"`) without exposing secrets or paths.
- **Direct File Protection**: Direct downloads of `.env` or SQLite `.sqlite` files are blocked with HTTP 404.
- **Prototype Credentials**:
  - **Auditor ID**: `auditor@mplad.gov.in`
  - **Password**: `Sentinel@2024`
  - *(Convenience one-click auto-fill button provided on the login page)*
