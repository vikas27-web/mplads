-- MPLAD SENTINEL Canonical SQLite Database Schema
-- Phase 6 Data & Database Foundation

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS constituencies (
    code TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    state TEXT NOT NULL,
    district TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS districts (
    code TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    state TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS implementing_agencies (
    code TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    agency_type TEXT NOT NULL,
    state TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS contractors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    registration_number TEXT NOT NULL,
    state TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS projects (
    project_code TEXT PRIMARY KEY,
    project_title TEXT NOT NULL,
    recommendation_date TEXT NOT NULL,
    status TEXT NOT NULL,
    state TEXT NOT NULL,
    constituency TEXT NOT NULL,
    district TEXT NOT NULL,
    block_or_town TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    sector TEXT NOT NULL,
    work_category TEXT NOT NULL,
    implementing_agency TEXT NOT NULL,
    contractor_id TEXT NOT NULL,
    contractor_name TEXT NOT NULL,
    sanctioned_amount REAL NOT NULL,
    released_amount REAL NOT NULL,
    expenditure_amount REAL NOT NULL,
    planned_completion_date TEXT NOT NULL,
    actual_or_reported_completion_date TEXT,
    physical_progress REAL NOT NULL,
    sanction_date TEXT NOT NULL,
    start_date TEXT NOT NULL,
    expected_completion_date TEXT NOT NULL,
    last_updated TEXT NOT NULL,
    verification_status TEXT NOT NULL,
    documentation_status TEXT NOT NULL,
    scenario_type TEXT NOT NULL,
    scenario_description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    project_code TEXT NOT NULL,
    payment_date TEXT NOT NULL,
    amount REAL NOT NULL,
    tranche_number INTEGER NOT NULL,
    reference_number TEXT NOT NULL,
    status TEXT NOT NULL,
    FOREIGN KEY (project_code) REFERENCES projects(project_code) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS physical_progress_events (
    id TEXT PRIMARY KEY,
    project_code TEXT NOT NULL,
    record_date TEXT NOT NULL,
    stage_name TEXT NOT NULL,
    progress_percentage REAL NOT NULL,
    inspection_officer TEXT NOT NULL,
    FOREIGN KEY (project_code) REFERENCES projects(project_code) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,
    project_code TEXT NOT NULL,
    document_type TEXT NOT NULL,
    document_name TEXT NOT NULL,
    upload_date TEXT NOT NULL,
    verification_status TEXT NOT NULL,
    FOREIGN KEY (project_code) REFERENCES projects(project_code) ON DELETE CASCADE
);

-- Performance Indexes for Repository Querying
CREATE INDEX IF NOT EXISTS idx_projects_district ON projects(district);
CREATE INDEX IF NOT EXISTS idx_projects_sector ON projects(sector);
CREATE INDEX IF NOT EXISTS idx_projects_agency ON projects(implementing_agency);
CREATE INDEX IF NOT EXISTS idx_projects_contractor ON projects(contractor_id);
CREATE INDEX IF NOT EXISTS idx_projects_scenario ON projects(scenario_type);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_payments_project ON payments(project_code);
CREATE INDEX IF NOT EXISTS idx_progress_project ON physical_progress_events(project_code);
CREATE INDEX IF NOT EXISTS idx_docs_project ON documents(project_code);

-- Auditor Review & Human Verification Persistence
CREATE TABLE IF NOT EXISTS auditor_reviews (
    id TEXT PRIMARY KEY,
    project_code TEXT NOT NULL,
    status TEXT NOT NULL,
    action_type TEXT NOT NULL,
    action_label TEXT NOT NULL,
    notes TEXT,
    actor TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (project_code) REFERENCES projects(project_code) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS auditor_notes (
    id TEXT PRIMARY KEY,
    project_code TEXT NOT NULL,
    author TEXT NOT NULL,
    note TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (project_code) REFERENCES projects(project_code) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_reviews_project ON auditor_reviews(project_code);
CREATE INDEX IF NOT EXISTS idx_notes_project ON auditor_notes(project_code);
