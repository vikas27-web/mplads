# MPLAD SENTINEL — Deployment & Operations Guide (Phase 9)

This guide provides comprehensive instructions for running, testing, building, and deploying **MPLAD SENTINEL** (SIH26102) as a production-grade institutional audit intelligence system.

---

## 1. System Requirements & Architecture

- **Node.js**: `v22.0.0` or higher (Recommended: Node 22.x or 24.x LTS).
  - MPLAD SENTINEL uses Node's native built-in `node:sqlite` (`DatabaseSync`), requiring zero external native compilation tools (no `node-gyp`, no Python, no C++ build chain).
- **Package Manager**: `npm` (v10+).
- **Operating Systems Supported**: Linux (Ubuntu 20.04+, Debian 11+, Alpine 3.19+ with glibc/compat), macOS (12+), Windows (10/11, PowerShell).
- **Architecture**:
  ```
  SQLite Database (data/generated/mplad_database.sqlite)
  + Anomaly Engine Artifacts (data/processed/anomaly_results.json)
                         │
                         ▼
     Backend Intelligence & Repository Layer (TypeScript)
                         │
                         ▼
      Next.js App Router API Routes (/api/*) 
      OR Standalone REST Server (backend/api/server.ts)
                         │
                         ▼
    Central Typed API Client (src/lib/api-client/index.ts)
                         │
                         ▼
     Institutional Audit Web Interface (Next.js 14 UI)
  ```

---

## 2. Environment Configuration

Copy the sample environment file to create your local `.env`:

```bash
cp .env.example .env.local
```

### Supported Environment Variables

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `development` / `production` | Node runtime environment. |
| `PORT` | `3000` | Port for Next.js web application server. |
| `DATABASE_PATH` | `data/generated/mplad_database.sqlite` | Absolute or relative path to SQLite database file. Automatically falls back to `/tmp/mplad_database.sqlite` if running in read-only serverless environments. |
| `ANOMALY_RESULTS_PATH` | `data/processed/anomaly_results.json` | Path to Phase 8 explainable anomaly intelligence artifact. |
| `NEXT_PUBLIC_API_URL` | *Empty* (Relative `/api`) | Optional external API URL prefix. Leave empty for same-origin Next.js fullstack deployment. |
| `CORS_ORIGIN` | `*` | Allowed CORS origins for standalone REST API server (`backend/api/server.ts`). |

---

## 3. Quick Start (Local Development)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Verify Artifacts
The repository includes pre-generated canonical Phase 6, Phase 7, and Phase 8 artifacts:
- `data/generated/mplad_database.sqlite` (300 projects, 600 payments, 573 progress records, 900 documents)
- `data/processed/project_features.json` (65 features across 300 projects)
- `data/processed/anomaly_results.json` (Phase 8 explainable anomaly signals)

If you wish to regenerate the artifacts from scratch deterministically:
```bash
npm run generate:data     # Regenerate synthetic dataset
npm run init:db           # Initialize SQLite schema & seed tables
npm run features:generate # Extract 65 features
npm run anomaly:run       # Execute explainable anomaly detection pipeline
```

### Step 3: Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 4. Production Build & Execution

### Step 1: Run Full Test Suite
Ensure all 77 automated tests pass:
```bash
npm run test:data      # 13/13 Phase 6 dataset & repository tests
npm run test:features  # 17/17 Phase 7 feature pipeline tests
npm run test:anomaly   # 20/20 Phase 8 anomaly detector & engine tests
npm run test:api       # 16/16 Phase 9 REST API integration tests
npm run test:smoke     # 11/11 Live API endpoint & persistence smoke tests
```

### Step 2: Compile Production Bundle
```bash
npm run typecheck      # Zero TypeScript errors
npm run lint           # Zero ESLint errors
npm run build          # Builds all 23 Next.js static and server routes
```

### Step 3: Start Production Server
```bash
npm run start
```
The application will serve production traffic at [http://localhost:3000](http://localhost:3000).

---

## 5. Standalone REST API Server (Optional)

If running the REST API independently from the frontend:

```bash
# Starts Node.js native HTTP API server on port 4000
npm run api:start
```
API endpoints will be accessible at `http://localhost:4000/api/health`, `http://localhost:4000/api/dashboard`, `http://localhost:4000/api/projects`, etc.

---

## 6. Container Deployment (Docker)

The repository includes a production-ready `Dockerfile` and `.dockerignore`.

### Build Docker Image
```bash
docker build -t mplad-sentinel:latest .
```

### Run Docker Container
```bash
docker run -d \
  --name mplad-sentinel \
  -p 3000:3000 \
  -v mplad_data:/app/data/generated \
  -e NODE_ENV=production \
  mplad-sentinel:latest
```

Open [http://localhost:3000](http://localhost:3000) to access the system.

---

## 7. Cloud Deployment Compatibility

### Vercel / Netlify / AWS Amplify
1. **Serverless Filesystem**:
   - Next.js serverless functions have a read-only root filesystem with a writeable `/tmp` directory.
   - `backend/database/sqlite.ts` detects read-only filesystems automatically and mirrors the SQLite database into `/tmp/mplad_database.sqlite` on cold start, allowing auditor review notes and action status persistence to function seamlessly.
2. **Build Settings**:
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`
   - Node.js Version: `>= 22.0.0`

### VPS / Dedicated VM (Ubuntu / Debian / AWS EC2 / DigitalOcean)
1. Install Node.js 22+:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```
2. Clone repository and setup PM2 process manager:
   ```bash
   git clone <repo-url> /opt/mplad-sentinel
   cd /opt/mplad-sentinel
   npm install
   npm run build
   sudo npm install -g pm2
   pm2 start npm --name "mplad-sentinel" -- start
   pm2 save
   pm2 startup
   ```

---

## 8. Responsible AI & Operational Integrity

- **Deterministic & Auditable**: Every score, signal, and anomaly report links directly to mathematical evidence (MAD deviation scores, tree split depths, rule trigger records).
- **Anti-Defamation Policy**: The system strictly disallows accusing contractors, agencies, or officials of fraud. All indicators are flagged as *Review Priority* or *Potential Anomaly Signals*.
- **Demo Data Notice**: As this is an institutional prototype, all screens display the notice:
  > *"DEMO DATA — NOT OFFICIAL GOVERNMENT DATA. Anomaly signal does not equal fraud. Physical verification & human investigation required."*
