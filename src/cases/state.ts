export const CASE_STATUSES = [
  'created',
  'discovering',
  'preparing',
  'draft_ready',
  'awaiting_user_action',
  'submission_reported',
  'awaiting_response',
  'resolved',
  'closed',
  'needs_user_input',
  'blocked',
  'failed',
  'cancelled',
] as const;

export type CaseStatus = (typeof CASE_STATUSES)[number];
export type CaseActor = 'system' | 'user';

export interface CaseEvent {
  from: CaseStatus | null;
  to: CaseStatus;
  actor: CaseActor;
  reason: string;
  occurredAt: string;
}

export interface PrivacyCase {
  id: string;
  destinationName: string;
  rightsGoal: 'access';
  requesterName: string;
  requesterEmail: string;
  requestPurpose: string;
  draftBody: string;
  status: CaseStatus;
  createdAt: string;
  updatedAt: string;
  events: readonly CaseEvent[];
}

const allowedTransitions: Record<CaseStatus, readonly CaseStatus[]> = {
  created: ['discovering', 'preparing', 'needs_user_input', 'blocked', 'failed', 'cancelled'],
  discovering: ['preparing', 'needs_user_input', 'blocked', 'failed', 'cancelled'],
  preparing: ['draft_ready', 'needs_user_input', 'blocked', 'failed', 'cancelled'],
  draft_ready: ['awaiting_user_action', 'preparing', 'blocked', 'failed', 'cancelled'],
  awaiting_user_action: ['draft_ready', 'submission_reported', 'blocked', 'failed', 'cancelled'],
  submission_reported: ['awaiting_response', 'resolved', 'closed', 'failed'],
  awaiting_response: ['resolved', 'closed', 'failed'],
  resolved: ['closed'],
  closed: [],
  needs_user_input: ['discovering', 'preparing', 'blocked', 'failed', 'cancelled'],
  blocked: ['discovering', 'cancelled'],
  failed: ['discovering', 'cancelled'],
  cancelled: [],
};

export class CaseTransitionError extends Error {
  readonly code = 'CASE_INVALID_TRANSITION';
  readonly from: CaseStatus;
  readonly to: CaseStatus;

  constructor(
    from: CaseStatus,
    to: CaseStatus,
  ) {
    super(`Cannot transition case from ${from} to ${to}.`);
    this.name = 'CaseTransitionError';
    this.from = from;
    this.to = to;
  }
}

export function canTransitionCase(from: CaseStatus, to: CaseStatus): boolean {
  return allowedTransitions[from].includes(to);
}

// Draft body edits are only meaningful before the request leaves Nyaya's
// control. These are the pre-submission states where the user is still
// shaping the text that will be handed off. Once the case reaches
// awaiting_user_action the draft has been handed to the user and must not
// be silently rewritten.
const DRAFT_UPDATABLE_STATUSES: readonly CaseStatus[] = [
  'preparing',
  'draft_ready',
];

export function canUpdateDraft(status: CaseStatus): boolean {
  return DRAFT_UPDATABLE_STATUSES.includes(status);
}

export class CaseDraftUpdateError extends Error {
  readonly code = 'CASE_DRAFT_UPDATE_PROHIBITED';
  readonly status: CaseStatus;

  constructor(status: CaseStatus) {
    super(`Draft updates are not permitted while the case is ${status}.`);
    this.name = 'CaseDraftUpdateError';
    this.status = status;
  }
}

export function transitionCase(
  current: PrivacyCase,
  to: CaseStatus,
  actor: CaseActor,
  reason: string,
  occurredAt: string,
): PrivacyCase {
  if (!reason.trim()) {
    throw new Error('Case transition reason must not be empty.');
  }

  if (!canTransitionCase(current.status, to)) {
    throw new CaseTransitionError(current.status, to);
  }

  const event: CaseEvent = {
    from: current.status,
    to,
    actor,
    reason: reason.trim(),
    occurredAt,
  };

  return {
    ...current,
    status: to,
    updatedAt: occurredAt,
    events: [...current.events, event],
  };
}

export function createPrivacyCase(input: {
  id: string;
  destinationName: string;
  requesterName: string;
  requesterEmail: string;
  requestPurpose: string;
  draftBody: string;
  now: string;
}): PrivacyCase {
  if (typeof input.draftBody !== 'string' || input.draftBody.trim() === '') {
    throw new Error('draftBody must be a non-empty string.');
  }

  const event: CaseEvent = {
    from: null,
    to: 'created',
    actor: 'system',
    reason: 'Case created for a controlled access-request demo.',
    occurredAt: input.now,
  };

  return {
    id: input.id,
    destinationName: input.destinationName,
    rightsGoal: 'access',
    requesterName: input.requesterName,
    requesterEmail: input.requesterEmail,
    requestPurpose: input.requestPurpose,
    draftBody: input.draftBody,
    status: 'created',
    createdAt: input.now,
    updatedAt: input.now,
    events: [event],
  };
}
