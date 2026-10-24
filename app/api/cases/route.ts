import { randomUUID } from 'node:crypto';

import { NextResponse } from 'next/server';

import { buildDraftBody } from '../../../src/cases/draft.ts';
import { getCaseStore } from '../../../src/cases/store-instance.ts';
import type { RequestDraftInput } from '../../../src/web/domain.ts';

function error(code: string, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status });
}

export async function GET() {
  return NextResponse.json({ cases: getCaseStore().list() });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return error('INVALID_JSON', 'Request body must be valid JSON.', 400);
  }

  if (!body || typeof body !== 'object') {
    return error('INVALID_REQUEST', 'Request body must be a JSON object.', 400);
  }

  const input = body as Partial<RequestDraftInput> & Record<string, unknown>;
  if (!input.requesterName || !input.requesterEmail || !input.requestPurpose) {
    return error(
      'INVALID_REQUEST',
      'requesterName, requesterEmail, and requestPurpose are required.',
      400,
    );
  }

  const requesterEmail = String(input.requesterEmail).trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(requesterEmail)) {
    return error('INVALID_REQUEST', 'requesterEmail must be a valid email address.', 400);
  }

  const now = new Date().toISOString();
  const created = getCaseStore().create({
    id: randomUUID(),
    destinationName:
      typeof input.destinationName === 'string' && input.destinationName.trim()
        ? input.destinationName.trim()
        : 'DemoCorp',
    requesterName: String(input.requesterName).trim(),
    requesterEmail: requesterEmail,
    requestPurpose: String(input.requestPurpose).trim(),
    draftBody: buildDraftBody(input as RequestDraftInput),
    now,
  });

  return NextResponse.json({ case: created }, { status: 201 });
}