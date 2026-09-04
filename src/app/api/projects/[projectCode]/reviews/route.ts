import { NextRequest } from "next/server.js";
import { recordProjectAuditorAction } from "../../../../../../backend/api/services/investigationService.ts";
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
    const reviews = repo.getAuditorReviews(projectCode);
    const latestStatus = repo.getLatestReviewStatus(projectCode);
    return jsonSuccess({ reviews, latestStatus });
  } catch (err) {
    return jsonError("REVIEWS_FETCH_ERROR", "Failed to retrieve auditor reviews.", 500);
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

    const { status, actionType, actionLabel, notes, actor } = body as {
      status?: string;
      actionType?: string;
      actionLabel?: string;
      notes?: string;
      actor?: string;
    };

    if (!status || !actionLabel) {
      return jsonError("MISSING_REVIEW_PARAMS", "Review status and action label are required.", 400);
    }

    const safeActor = (actor && actor.trim()) || "Auditor Desk";
    const safeActionType = actionType || "STATUS_CHANGE";
    const safeNotes = notes || `Review status updated to "${status}". Action recorded in audit trail.`;

    const record = recordProjectAuditorAction(
      projectCode,
      status,
      safeActionType,
      actionLabel,
      safeNotes,
      safeActor
    );

    return jsonSuccess({
      review: {
        id: record.id,
        projectCode: record.project_code,
        status: record.status,
        actionType: record.action_type,
        actionLabel: record.action_label,
        notes: record.notes,
        actor: record.actor,
        createdAt: record.created_at,
      },
    });
  } catch (err) {
    return jsonError("REVIEW_SAVE_ERROR", "Failed to persist auditor review action.", 500);
  }
}
