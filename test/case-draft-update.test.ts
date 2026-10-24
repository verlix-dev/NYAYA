import assert from 'node:assert/strict';
import { test } from 'node:test';

import { InMemoryCaseStore } from '../src/cases/store.ts';
import {
  CaseDraftUpdateError,
  canUpdateDraft,
  createPrivacyCase,
} from '../src/cases/state.ts';

const NOW = '2026-10-24T12:00:00.000Z';

function makeStore() {
  return new InMemoryCaseStore();
}

function preparedCase(store: InMemoryCaseStore) {
  return store.create({
    id: 'case-draft-1',
    destinationName: 'DemoCorp',
    requesterName: 'Aarav Sharma',
    requesterEmail: 'aarav@example.test',
    requestPurpose: 'Personal data associated with the demo account.',
    draftBody: 'Original draft body.',
    now: NOW,
  });
}

test('canUpdateDraft allows pre-submission states and blocks terminal states', () => {
  assert.equal(canUpdateDraft('preparing'), true);
  assert.equal(canUpdateDraft('draft_ready'), true);
  assert.equal(canUpdateDraft('awaiting_user_action'), false);
  assert.equal(canUpdateDraft('created'), false);
  assert.equal(canUpdateDraft('submission_reported'), false);
  assert.equal(canUpdateDraft('closed'), false);
  assert.equal(canUpdateDraft('cancelled'), false);
});

test('updateDraft persists a new draft body and records a user event', () => {
  const store = makeStore();
  const current = preparedCase(store);

  const updated = store.updateDraft(current.id, 'Edited by the user.', NOW);

  assert.equal(updated.draftBody, 'Edited by the user.');
  assert.equal(updated.status, 'draft_ready');
  assert.equal(updated.updatedAt, NOW);
  assert.equal(updated.events.length, current.events.length + 1);
  const event = updated.events.at(-1);
  assert.equal(event?.actor, 'user');
  assert.equal(event?.reason, 'User edited the access-request draft.');
  assert.equal(event?.from, 'draft_ready');
  assert.equal(event?.to, 'draft_ready');
});

test('updateDraft returns the updated case from the store', () => {
  const store = makeStore();
  const current = preparedCase(store);

  const updated = store.updateDraft(current.id, 'Second edit.', NOW);
  assert.equal(store.get(current.id)?.draftBody, 'Second edit.');
  assert.equal(updated, store.get(current.id));
});

test('updateDraft throws when the case does not exist', () => {
  const store = makeStore();
  assert.throws(() => store.updateDraft('missing', 'x', NOW), /Case not found: missing/);
});

test('updateDraft rejects empty draft bodies', () => {
  const store = makeStore();
  preparedCase(store);
  assert.throws(() => store.updateDraft('case-draft-1', '   ', NOW), /draftBody must be a non-empty string/);
});

test('updateDraft is rejected once the case has left user control', () => {
  const store = makeStore();
  const current = preparedCase(store);
  const handedOff = store.transition(
    current.id,
    'awaiting_user_action',
    'user',
    'User opened the synthetic destination.',
    NOW,
  );
  assert.ok(handedOff);

  let caught: unknown;
  try {
    store.updateDraft(current.id, 'Too late.', NOW);
  } catch (err) {
    caught = err;
  }
  assert.ok(caught instanceof CaseDraftUpdateError);
  assert.equal((caught as CaseDraftUpdateError).status, 'awaiting_user_action');
  assert.equal(store.get(current.id)?.draftBody, 'Original draft body.');
});

test('updateDraft is rejected after submission is reported', () => {
  const store = makeStore();
  const current = preparedCase(store);
  store.transition(current.id, 'awaiting_user_action', 'user', 'User opened the synthetic destination.', NOW);
  const submitted = store.transition(
    current.id,
    'submission_reported',
    'user',
    'User reported submitting directly on the destination.',
    NOW,
  );
  assert.ok(submitted);

  assert.throws(
    () => store.updateDraft(current.id, 'Nope.', NOW),
    (error: unknown) => error instanceof CaseDraftUpdateError && error.code === 'CASE_DRAFT_UPDATE_PROHIBITED',
  );
});

test('a created case can be edited during preparation before draft_ready', () => {
  const store = makeStore();
  const current = preparedCase(store);
  const preparing = store.transition(current.id, 'preparing', 'system', 'Going back to prepare.', NOW);
  assert.ok(preparing);
  assert.equal(preparing.status, 'preparing');

  const updated = store.updateDraft(preparing.id, 'Draft v2.', NOW);
  assert.equal(updated.draftBody, 'Draft v2.');
  assert.equal(updated.status, 'preparing');
});

test('createPrivacyCase rejects empty draft bodies', () => {
  assert.throws(
    () =>
      createPrivacyCase({
        id: 'case-empty',
        destinationName: 'DemoCorp',
        requesterName: 'Aarav Sharma',
        requesterEmail: 'aarav@example.test',
        requestPurpose: 'Personal data.',
        draftBody: '',
        now: NOW,
      }),
    /draftBody must be a non-empty string/,
  );
});