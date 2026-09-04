import { NextRequest } from "next/server.js";
import { addProjectAuditorNote } from "../../../../../../backend/api/services/investigationService.ts";
import { ProjectRepository } from "../../../../../../backend/repository/projectRepository.ts";
import { jsonSuccess, jsonError } from "../../../../../../backend/api/response.ts";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: {
    projectCode: string;
  };
}

let defaultRepo: ProjectRepository | null = null;
function getRepo(): ProjectRepository {
  if (!defaultRepo) {
    defaultRepo = new ProjectRepository();
  }
  return defaultRepo;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { projectCode } = params;
    if (!projectCode) {
      return jsonError("INVALID_PROJECT_CODE", "Project code is required.", 400);
    }
    const repo = getRepo();
    const notes = repo.getAuditorNotes(projectCode);
    return jsonSuccess({ notes });
  } catch (err) {
    return jsonError("NOTES_FETCH_ERROR", "Failed to retrieve auditor notes.", 500);
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { projectCode } = params;
    if (!projectCode) {
      return jsonError("INVALID_PROJECT_CODE", "Project code is required.", 400);
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return jsonError("INVALID_PAYLOAD", "Request body must be valid JSON.", 400);
    }

    const { author, note, content } = body as { author?: string; note?: string; content?: string };
    const noteText = (note || content || "").trim();
    if (!noteText) {
      return jsonError("MISSING_NOTE_CONTENT", "Auditor note text is required.", 400);
    }

    const safeAuthor = (author && author.trim()) || "Field Auditor";
    const record = addProjectAuditorNote(projectCode, safeAuthor, noteText);

    return jsonSuccess({
      note: {
        id: record.id,
        projectCode: record.project_code,
        author: record.author,
        note: record.note,
        timestamp: record.created_at,
        isSessionOnly: false,
      },
    });
  } catch (err) {
    return jsonError("NOTE_SAVE_ERROR", "Failed to persist auditor note.", 500);
  }
}
