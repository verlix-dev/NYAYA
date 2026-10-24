import { NextResponse } from 'next/server';

import { getCaseStore } from '../../../../src/cases/store-instance.ts';
import { CaseDraftUpdateError, CaseTransitionError } from '../../../../src/cases/state.ts';
import type { CaseStatus } from '../../../../src/cases/state.ts';

const ACTIONS: Record<string, CaseStatus> = {
  handoff: 'awaiting_user_action',
  'submission-report': 'submission_reported',
  close: 'closed',
};

function error(code: string, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status });
}

function actionReason(action: string): string {
  switch (action) {
    case 'handoff':
      return 'User opened the synthetic destination for review.';
    case 'submission-report':
      return 'User reported submitting directly on the destination.';
    case 'close':
      return 'User closed the case.';
    default:
      return action;
  }
}

export async function GET(_request: Request, { params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params;
  const found = getCaseStore().get(caseId);
  if (!found) {
    return error('CASE_NOT_FOUND', 'Case not found.', 404);
  }
  return NextResponse.json({ case: found });
}

export async function POST(request: Request, { params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params;
  const found = getCaseStore().get(caseId);
  if (!found) {
    return error('CASE_NOT_FOUND', 'Case not found.', 404);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return error('INVALID_JSON', 'Request body must be valid JSON.', 400);
  }

  if (!body || typeof body !== 'object' || !(body as Record<string, unknown>).action) {
    return error('INVALID_REQUEST', 'action is required.', 400);
  }

  const payload = body as { action: string; draftBody?: unknown };

  if (payload.action === 'delete') {
    getCaseStore().delete(caseId);
    return NextResponse.json({ deleted: true, caseId });
  }

  if (payload.action === 'update-draft') {
    if (typeof payload.draftBody !== 'string') {
      return error('INVALID_REQUEST', 'draftBody must be a non-empty string.', 400);
    }
    if (payload.draftBody.trim() === '') {
      return error('INVALID_REQUEST', 'draftBody must be a non-empty string.', 400);
    }
    try {
      const updated = getCaseStore().updateDraft(caseId, payload.draftBody, new Date().toISOString());
      return NextResponse.json({ case: updated });
    } catch (err) {
      if (err instanceof CaseDraftUpdateError) {
        return error(
          'CASE_DRAFT_UPDATE_PROHIBITED',
          `Draft updates are not permitted while the case is ${err.status}.`,
          409,
        );
      }
      throw err;
    }
  }

  const target = ACTIONS[payload.action];
  if (!target) {
    return error('INVALID_ACTION', `Unknown action: ${payload.action}.`, 400);
  }

  try {
    const updated = getCaseStore().transition(
      caseId,
      target,
      'user',
      actionReason(payload.action),
      new Date().toISOString(),
    );
    if (!updated) {
      return error('CASE_NOT_FOUND', 'Case not found.', 404);
    }
    return NextResponse.json({ case: updated });
  } catch (err) {
    if (err instanceof CaseTransitionError) {
      return error('CASE_INVALID_TRANSITION', `Cannot transition from ${err.from} to ${err.to}.`, 409);
    }
    throw err;
  }
}