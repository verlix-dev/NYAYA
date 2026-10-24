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
