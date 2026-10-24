import assert from 'node:assert/strict';
import { test } from 'node:test';

import { POST as createCase } from '../app/api/cases/route.ts';
import { GET as getCase, POST as updateCase } from '../app/api/cases/[caseId]/route.ts';
import { InMemoryCaseStore } from '../src/cases/store.ts';
import { setCaseStore, resetCaseStore } from '../src/cases/store-instance.ts';

const ORIGIN = 'http://localhost:3000';

function jsonRequest(body: unknown) {
  return new Request(`${ORIGIN}/api/cases`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function jsonCaseRequest(caseId: string, body: unknown) {
  return new Request(`${ORIGIN}/api/cases/${caseId}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function jsonResponse(response: Response) {
  return response.json();
}

test('POST /api/cases creates a case and returns id, status, and draftBody', async () => {
  const store = new InMemoryCaseStore();
  setCaseStore(store);

  const response = await createCase(jsonRequest({
    requesterName: 'Aarav Sharma',
    requesterEmail: 'aarav@example.test',
    requestPurpose: 'Personal data associated with the demo account.',
  }));

  assert.equal(response.status, 201);
  const data = await jsonResponse(response) as { case: { id: string; status: string; draftBody: string } };
  assert.ok(data.case.id);
  assert.equal(data.case.status, 'draft_ready');
  assert.match(data.case.draftBody, /Aarav Sharma/);
  assert.equal(store.get(data.case.id)?.id, data.case.id);

  resetCaseStore();
});

test('POST /api/cases rejects missing fields', async () => {
  const store = new InMemoryCaseStore();
  setCaseStore(store);

  const response = await createCase(jsonRequest({ requesterName: 'Aarav' }));
  assert.equal(response.status, 400);
  const data = await jsonResponse(response) as { error: { code: string } };
  assert.equal(data.error.code, 'INVALID_REQUEST');
  assert.equal(store.list().length, 0);

  resetCaseStore();
});

test('POST /api/cases rejects an invalid email', async () => {
  const store = new InMemoryCaseStore();
  setCaseStore(store);

  const response = await createCase(
    jsonRequest({ requesterName: 'Aarav', requesterEmail: 'not-an-email', requestPurpose: 'p' }),
  );
  assert.equal(response.status, 400);
  const data = await jsonResponse(response) as { error: { code: string } };
  assert.equal(data.error.code, 'INVALID_REQUEST');
  assert.equal(store.list().length, 0);

  resetCaseStore();
});

test('POST /api/cases/[caseId] persists a draft update for a draft_ready case', async () => {
  const store = new InMemoryCaseStore();
  setCaseStore(store);

  const created = await createCase(
    jsonRequest({ requesterName: 'Aarav', requesterEmail: 'aarav@example.test', requestPurpose: 'p' }),
  );
  const createdCase = (await jsonResponse(created) as { case: { id: string } }).case;
  const caseId = createdCase.id;

  const response = await updateCase(
    jsonCaseRequest(caseId, { action: 'update-draft', draftBody: 'Edited body.' }),
    { params: Promise.resolve({ caseId }) },
  );

  assert.equal(response.status, 200);
  const data = await jsonResponse(response) as { case: { draftBody: string; status: string } };
  assert.equal(data.case.draftBody, 'Edited body.');
  assert.equal(data.case.status, 'draft_ready');
  assert.equal(store.get(caseId)?.draftBody, 'Edited body.');

  resetCaseStore();
});

test('POST /api/cases/[caseId] returns 404 for a missing case', async () => {
  const store = new InMemoryCaseStore();
  setCaseStore(store);

  const response = await updateCase(
    jsonCaseRequest('missing', { action: 'update-draft', draftBody: 'x' }),
    { params: Promise.resolve({ caseId: 'missing' }) },
  );

  assert.equal(response.status, 404);
  const data = await jsonResponse(response) as { error: { code: string } };
  assert.equal(data.error.code, 'CASE_NOT_FOUND');

  resetCaseStore();
});

test('POST /api/cases/[caseId] rejects a non-string draft body', async () => {
  const store = new InMemoryCaseStore();
  setCaseStore(store);

  const created = await createCase(
    jsonRequest({ requesterName: 'Aarav', requesterEmail: 'aarav@example.test', requestPurpose: 'p' }),
  );
  const caseId = (await jsonResponse(created) as { case: { id: string } }).case.id;

  const response = await updateCase(
    jsonCaseRequest(caseId, { action: 'update-draft', draftBody: 42 }),
    { params: Promise.resolve({ caseId }) },
  );

  assert.equal(response.status, 400);
  const data = await jsonResponse(response) as { error: { code: string } };
  assert.equal(data.error.code, 'INVALID_REQUEST');

  resetCaseStore();
});

test('POST /api/cases/[caseId] rejects an empty draft body', async () => {
  const store = new InMemoryCaseStore();
  setCaseStore(store);

  const created = await createCase(
    jsonRequest({ requesterName: 'Aarav', requesterEmail: 'aarav@example.test', requestPurpose: 'p' }),
  );
  const caseId = (await jsonResponse(created) as { case: { id: string } }).case.id;

  const response = await updateCase(
    jsonCaseRequest(caseId, { action: 'update-draft', draftBody: '   ' }),
    { params: Promise.resolve({ caseId }) },
  );

  assert.equal(response.status, 400);
  const data = await jsonResponse(response) as { error: { code: string } };
  assert.equal(data.error.code, 'INVALID_REQUEST');

  resetCaseStore();
});

test('POST /api/cases/[caseId] blocks draft updates after handoff', async () => {
  const store = new InMemoryCaseStore();
  setCaseStore(store);

  const created = await createCase(
    jsonRequest({ requesterName: 'Aarav', requesterEmail: 'aarav@example.test', requestPurpose: 'p' }),
  );
  const caseId = (await jsonResponse(created) as { case: { id: string } }).case.id;

  await updateCase(
    jsonCaseRequest(caseId, { action: 'handoff' }),
    { params: Promise.resolve({ caseId }) },
  );

  const response = await updateCase(
    jsonCaseRequest(caseId, { action: 'update-draft', draftBody: 'Too late.' }),
    { params: Promise.resolve({ caseId }) },
  );

  assert.equal(response.status, 409);
  const data = await jsonResponse(response) as { error: { code: string } };
  assert.equal(data.error.code, 'CASE_DRAFT_UPDATE_PROHIBITED');
  assert.equal(store.get(caseId)?.draftBody.includes('Too late.'), false);

  resetCaseStore();
});

test('GET /api/cases/[caseId] echoes the updated draft body', async () => {
  const store = new InMemoryCaseStore();
  setCaseStore(store);

  const created = await createCase(
    jsonRequest({ requesterName: 'Aarav', requesterEmail: 'aarav@example.test', requestPurpose: 'p' }),
  );
  const caseId = (await jsonResponse(created) as { case: { id: string } }).case.id;

  await updateCase(
    jsonCaseRequest(caseId, { action: 'update-draft', draftBody: 'Persisted.' }),
    { params: Promise.resolve({ caseId }) },
  );

  const response = await getCase(
    new Request(`${ORIGIN}/api/cases/${caseId}`),
    { params: Promise.resolve({ caseId }) },
  );
  assert.equal(response.status, 200);
  const data = await jsonResponse(response) as { case: { draftBody: string } };
  assert.equal(data.case.draftBody, 'Persisted.');

  resetCaseStore();
});

test('unknown API action is rejected', async () => {
  const store = new InMemoryCaseStore();
  setCaseStore(store);

  const created = await createCase(
    jsonRequest({ requesterName: 'Aarav', requesterEmail: 'aarav@example.test', requestPurpose: 'p' }),
  );
  const caseId = (await jsonResponse(created) as { case: { id: string } }).case.id;

  const response = await updateCase(
    jsonCaseRequest(caseId, { action: 'bogus' }),
    { params: Promise.resolve({ caseId }) },
  );

  assert.equal(response.status, 400);
  const data = await jsonResponse(response) as { error: { code: string } };
  assert.equal(data.error.code, 'INVALID_ACTION');

  resetCaseStore();
});