import { DatabaseSync } from "node:sqlite";
import type {
  ProjectRecord,
  ProjectFilters,
  PaymentRecord,
  PhysicalProgressRecord,
  DocumentRecord,
  ContractorRecord,
} from "../types/project.ts";
import { DatabaseManager } from "../database/sqlite.ts";

export class ProjectRepository {
  private db: DatabaseSync;

  constructor(dbManager?: DatabaseManager) {
    if (dbManager) {
      this.db = dbManager.getRawDb();
    } else {
      const defaultManager = new DatabaseManager();
      this.db = defaultManager.getRawDb();
    }
  }

  /**
   * Retrieves a single project by its unique project_code
   */
  public getProjectByCode(projectCode: string): ProjectRecord | null {
    const stmt = this.db.prepare("SELECT * FROM projects WHERE project_code = ? LIMIT 1;");
    const row = stmt.get(projectCode) as ProjectRecord | undefined;
    return row || null;
  }

  /**
   * Retrieves paginated projects matching optional filter criteria
   */
  public getProjects(filters: ProjectFilters = {}): { projects: ProjectRecord[]; total: number } {
    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (filters.district && filters.district !== "ALL") {
      conditions.push("district = ?");
      params.push(filters.district);
    }

    if (filters.sector && filters.sector !== "ALL") {
      conditions.push("sector = ?");
      params.push(filters.sector);
    }

    if (filters.agency && filters.agency !== "ALL") {
      conditions.push("implementing_agency = ?");
      params.push(filters.agency);
    }

    if (filters.contractor_id && filters.contractor_id !== "ALL") {
      conditions.push("contractor_id = ?");
      params.push(filters.contractor_id);
    }

    if (filters.status && filters.status !== "ALL") {
      conditions.push("status = ?");
      params.push(filters.status);
    }

    if (filters.scenario_type && filters.scenario_type !== "ALL") {
      conditions.push("scenario_type = ?");
      params.push(filters.scenario_type);
    }

    if (filters.search && filters.search.trim()) {
      const term = `%${filters.search.trim()}%`;
      conditions.push(
        "(project_code LIKE ? OR project_title LIKE ? OR constituency LIKE ? OR block_or_town LIKE ? OR contractor_name LIKE ?)"
      );
      params.push(term, term, term, term, term);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // Count total matches
    const countSql = `SELECT COUNT(*) as count FROM projects ${whereClause};`;
    const countStmt = this.db.prepare(countSql);
    const countRow = countStmt.get(...params) as { count: number };
    const total = countRow ? countRow.count : 0;

    // Fetch page
    const limit = filters.limit ?? 25;
    const offset = filters.offset ?? 0;
    const selectSql = `SELECT * FROM projects ${whereClause} ORDER BY project_code ASC LIMIT ? OFFSET ?;`;
    const selectStmt = this.db.prepare(selectSql);
    const rows = selectStmt.all(...params, limit, offset) as unknown as ProjectRecord[];

    return {
      projects: rows,
      total,
    };
  }

  /**
   * Returns total count of all projects in the database
   */
  public getProjectCount(): number {
    const stmt = this.db.prepare("SELECT COUNT(*) as count FROM projects;");
    const row = stmt.get() as { count: number };
    return row.count;
  }

  /**
   * Retrieves unique distinct districts represented in the dataset
   */
  public getDistinctDistricts(): string[] {
    const stmt = this.db.prepare("SELECT DISTINCT district FROM projects ORDER BY district ASC;");
    const rows = stmt.all() as unknown as { district: string }[];
    return rows.map((r) => r.district);
  }

  /**
   * Retrieves unique distinct sectors represented in the dataset
   */
  public getDistinctSectors(): string[] {
    const stmt = this.db.prepare("SELECT DISTINCT sector FROM projects ORDER BY sector ASC;");
    const rows = stmt.all() as unknown as { sector: string }[];
    return rows.map((r) => r.sector);
  }

  /**
   * Retrieves unique distinct implementing agencies represented in the dataset
   */
  public getDistinctAgencies(): string[] {
    const stmt = this.db.prepare("SELECT DISTINCT implementing_agency FROM projects ORDER BY implementing_agency ASC;");
    const rows = stmt.all() as unknown as { implementing_agency: string }[];
    return rows.map((r) => r.implementing_agency);
  }

  /**
   * Retrieves unique distinct constituencies represented in the dataset
   */
  public getDistinctConstituencies(): string[] {
    const stmt = this.db.prepare("SELECT DISTINCT constituency FROM projects ORDER BY constituency ASC;");
    const rows = stmt.all() as unknown as { constituency: string }[];
    return rows.map((r) => r.constituency);
  }

  /**
   * Retrieves distinct contractor entities
   */
  public getDistinctContractors(): ContractorRecord[] {
    const stmt = this.db.prepare("SELECT * FROM contractors ORDER BY name ASC;");
    return stmt.all() as unknown as ContractorRecord[];
  }

  /**
   * Retrieves payment records for a specific project
   */
  public getProjectPayments(projectCode: string): PaymentRecord[] {
    const stmt = this.db.prepare("SELECT * FROM payments WHERE project_code = ? ORDER BY tranche_number ASC;");
    return stmt.all(projectCode) as unknown as PaymentRecord[];
  }

  /**
   * Retrieves physical progress events for a specific project
   */
  public getProjectProgress(projectCode: string): PhysicalProgressRecord[] {
    const stmt = this.db.prepare("SELECT * FROM physical_progress_events WHERE project_code = ? ORDER BY record_date ASC;");
    return stmt.all(projectCode) as unknown as PhysicalProgressRecord[];
  }

  /**
   * Retrieves statutory documents for a specific project
   */
  public getProjectDocuments(projectCode: string): DocumentRecord[] {
    const stmt = this.db.prepare("SELECT * FROM documents WHERE project_code = ? ORDER BY upload_date ASC;");
    return stmt.all(projectCode) as unknown as DocumentRecord[];
  }

  /**
   * Retrieves all projects ordered by project_code
   */
  public getAllProjects(): ProjectRecord[] {
    const stmt = this.db.prepare("SELECT * FROM projects ORDER BY project_code ASC;");
    return stmt.all() as unknown as ProjectRecord[];
  }

  /**
   * Retrieves all payment records ordered by project_code and tranche
   */
  public getAllPayments(): PaymentRecord[] {
    const stmt = this.db.prepare("SELECT * FROM payments ORDER BY project_code ASC, tranche_number ASC;");
    return stmt.all() as unknown as PaymentRecord[];
  }

  /**
   * Retrieves all physical progress events ordered by project_code and date
   */
  public getAllProgress(): PhysicalProgressRecord[] {
    const stmt = this.db.prepare("SELECT * FROM physical_progress_events ORDER BY project_code ASC, record_date ASC;");
    return stmt.all() as unknown as PhysicalProgressRecord[];
  }

  /**
   * Retrieves all documents ordered by project_code and date
   */
  public getAllDocuments(): DocumentRecord[] {
    const stmt = this.db.prepare("SELECT * FROM documents ORDER BY project_code ASC, upload_date ASC;");
    return stmt.all() as unknown as DocumentRecord[];
  }

  /**
   * Records a human auditor workflow review action in SQLite
   */
  public recordAuditorReview(
    projectCode: string,
    status: string,
    actionType: string,
    actionLabel: string,
    notes: string,
    actor: string
  ): { id: string; project_code: string; status: string; action_type: string; action_label: string; notes: string; actor: string; created_at: string } {
    const id = `REV-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const createdAt = new Date().toISOString();
    const stmt = this.db.prepare(`
      INSERT INTO auditor_reviews (id, project_code, status, action_type, action_label, notes, actor, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?);
    `);
    stmt.run(id, projectCode, status, actionType, actionLabel, notes, actor, createdAt);
    return {
      id,
      project_code: projectCode,
      status,
      action_type: actionType,
      action_label: actionLabel,
      notes,
      actor,
      created_at: createdAt,
    };
  }

  /**
   * Retrieves all human auditor reviews for a project
   */
  public getAuditorReviews(projectCode: string): { id: string; project_code: string; status: string; action_type: string; action_label: string; notes: string | null; actor: string; created_at: string }[] {
    const stmt = this.db.prepare(
      "SELECT * FROM auditor_reviews WHERE project_code = ? ORDER BY created_at DESC;"
    );
    return stmt.all(projectCode) as unknown as { id: string; project_code: string; status: string; action_type: string; action_label: string; notes: string | null; actor: string; created_at: string }[];
  }

  /**
   * Adds an auditor observation note to SQLite
   */
  public addAuditorNote(
    projectCode: string,
    author: string,
    note: string
  ): { id: string; project_code: string; author: string; note: string; created_at: string } {
    const id = `NOTE-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const createdAt = new Date().toISOString();
    const stmt = this.db.prepare(`
      INSERT INTO auditor_notes (id, project_code, author, note, created_at)
      VALUES (?, ?, ?, ?, ?);
    `);
    stmt.run(id, projectCode, author, note, createdAt);
    return {
      id,
      project_code: projectCode,
      author,
      note,
      created_at: createdAt,
    };
  }

  /**
   * Retrieves all auditor notes for a project
   */
  public getAuditorNotes(projectCode: string): { id: string; project_code: string; author: string; note: string; created_at: string }[] {
    const stmt = this.db.prepare(
      "SELECT * FROM auditor_notes WHERE project_code = ? ORDER BY created_at DESC;"
    );
    return stmt.all(projectCode) as unknown as { id: string; project_code: string; author: string; note: string; created_at: string }[];
  }

  /**
   * Gets the latest auditor review status, or null if none
   */
  public getLatestReviewStatus(projectCode: string): string | null {
    const stmt = this.db.prepare(
      "SELECT status FROM auditor_reviews WHERE project_code = ? ORDER BY created_at DESC LIMIT 1;"
    );
    const row = stmt.get(projectCode) as { status: string } | undefined;
    return row ? row.status : null;
  }
}
