import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import type { SyntheticDatasetBundle } from "../types/project.ts";

export class DatabaseManager {
  private db: DatabaseSync;
  private dbPath: string;

  constructor(dbPath?: string) {
    let resolvedPath =
      dbPath ||
      process.env.DATABASE_PATH ||
      path.join(process.cwd(), "data", "generated", "mplad_database.sqlite");

    const defaultSeedPath = path.join(process.cwd(), "data", "generated", "mplad_database.sqlite");

    // Serverless / Read-Only Filesystem Handling:
    // If running in Vercel or AWS Lambda, mirror database into /tmp to support persistent write operations
    if (resolvedPath !== ":memory:" && (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME)) {
      const tmpPath = path.join("/tmp", "mplad_database.sqlite");
      if (!fs.existsSync(tmpPath) && fs.existsSync(resolvedPath)) {
        try {
          fs.copyFileSync(resolvedPath, tmpPath);
        } catch {
          // fallback to original path if copy fails
        }
      }
      if (fs.existsSync(tmpPath)) {
        resolvedPath = tmpPath;
      }
    }

    // If a custom persistent DATABASE_PATH is provided (e.g. Docker mounted volume /var/data/...)
    // but the file does not exist yet, initialize it from the bundled seed database
    if (resolvedPath !== ":memory:" && !fs.existsSync(resolvedPath) && fs.existsSync(defaultSeedPath) && resolvedPath !== defaultSeedPath) {
      try {
        const targetDir = path.dirname(resolvedPath);
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }
        fs.copyFileSync(defaultSeedPath, resolvedPath);
      } catch {
        // Fall back to resolved path
      }
    }

    this.dbPath = resolvedPath;

    // Ensure parent directory exists if using a file path
    if (resolvedPath !== ":memory:") {
      const dir = path.dirname(resolvedPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }

    this.db = new DatabaseSync(resolvedPath);
    this.db.exec("PRAGMA foreign_keys = ON;");
    this.ensureAuditorTables();
  }

  /**
   * Ensures auditor_reviews and auditor_notes tables exist
   */
  public ensureAuditorTables(): void {
    this.db.exec(`
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
    `);
  }

  /**
   * Initializes database schema from schema.sql
   */
  public initSchema(): void {
    const schemaPath = path.join(process.cwd(), "backend", "database", "schema.sql");
    const schemaSql = fs.readFileSync(schemaPath, "utf-8");
    this.db.exec(schemaSql);
  }

  /**
   * Seeds the database with the synthetic dataset bundle in a single transaction
   */
  public seedDataset(bundle: SyntheticDatasetBundle): void {
    this.initSchema();

    this.db.exec("BEGIN TRANSACTION;");
    try {
      // 1. Insert Constituencies
      const stmtConst = this.db.prepare(
        "INSERT OR REPLACE INTO constituencies (code, name, state, district) VALUES (?, ?, ?, ?);"
      );
      for (const c of bundle.constituencies) {
        stmtConst.run(c.code, c.name, c.state, c.district);
      }

      // 2. Insert Districts
      const stmtDist = this.db.prepare(
        "INSERT OR REPLACE INTO districts (code, name, state) VALUES (?, ?, ?);"
      );
      for (const d of bundle.districts) {
        stmtDist.run(d.code, d.name, d.state);
      }

      // 3. Insert Implementing Agencies
      const stmtAgy = this.db.prepare(
        "INSERT OR REPLACE INTO implementing_agencies (code, name, agency_type, state) VALUES (?, ?, ?, ?);"
      );
      for (const a of bundle.implementing_agencies) {
        stmtAgy.run(a.code, a.name, a.agency_type, a.state);
      }

      // 4. Insert Contractors
      const stmtCon = this.db.prepare(
        "INSERT OR REPLACE INTO contractors (id, name, registration_number, state) VALUES (?, ?, ?, ?);"
      );
      for (const con of bundle.contractors) {
        stmtCon.run(con.id, con.name, con.registration_number, con.state);
      }

      // 5. Insert Projects
      const stmtProj = this.db.prepare(`
        INSERT OR REPLACE INTO projects (
          project_code, project_title, recommendation_date, status, state, constituency,
          district, block_or_town, latitude, longitude, sector, work_category,
          implementing_agency, contractor_id, contractor_name, sanctioned_amount,
          released_amount, expenditure_amount, planned_completion_date,
          actual_or_reported_completion_date, physical_progress, sanction_date,
          start_date, expected_completion_date, last_updated, verification_status,
          documentation_status, scenario_type, scenario_description
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        );
      `);

      for (const p of bundle.projects) {
        stmtProj.run(
          p.project_code,
          p.project_title,
          p.recommendation_date,
          p.status,
          p.state,
          p.constituency,
          p.district,
          p.block_or_town,
          p.latitude,
          p.longitude,
          p.sector,
          p.work_category,
          p.implementing_agency,
          p.contractor_id,
          p.contractor_name,
          p.sanctioned_amount,
          p.released_amount,
          p.expenditure_amount,
          p.planned_completion_date,
          p.actual_or_reported_completion_date,
          p.physical_progress,
          p.sanction_date,
          p.start_date,
          p.expected_completion_date,
          p.last_updated,
          p.verification_status,
          p.documentation_status,
          p.scenario_type,
          p.scenario_description
        );
      }

      // 6. Insert Payments
      const stmtPay = this.db.prepare(
        "INSERT OR REPLACE INTO payments (id, project_code, payment_date, amount, tranche_number, reference_number, status) VALUES (?, ?, ?, ?, ?, ?, ?);"
      );
      for (const pay of bundle.payments) {
        stmtPay.run(
          pay.id,
          pay.project_code,
          pay.payment_date,
          pay.amount,
          pay.tranche_number,
          pay.reference_number,
          pay.status
        );
      }

      // 7. Insert Physical Progress Events
      const stmtProg = this.db.prepare(
        "INSERT OR REPLACE INTO physical_progress_events (id, project_code, record_date, stage_name, progress_percentage, inspection_officer) VALUES (?, ?, ?, ?, ?, ?);"
      );
      for (const prog of bundle.physical_progress_events) {
        stmtProg.run(
          prog.id,
          prog.project_code,
          prog.record_date,
          prog.stage_name,
          prog.progress_percentage,
          prog.inspection_officer
        );
      }

      // 8. Insert Documents
      const stmtDoc = this.db.prepare(
        "INSERT OR REPLACE INTO documents (id, project_code, document_type, document_name, upload_date, verification_status) VALUES (?, ?, ?, ?, ?, ?);"
      );
      for (const doc of bundle.documents) {
        stmtDoc.run(
          doc.id,
          doc.project_code,
          doc.document_type,
          doc.document_name,
          doc.upload_date,
          doc.verification_status
        );
      }

      this.db.exec("COMMIT;");
    } catch (err) {
      this.db.exec("ROLLBACK;");
      throw err;
    }
  }

  /**
   * Returns the underlying DatabaseSync instance
   */
  public getRawDb(): DatabaseSync {
    return this.db;
  }

  /**
   * Closes database connection
   */
  public close(): void {
    this.db.close();
  }
}
