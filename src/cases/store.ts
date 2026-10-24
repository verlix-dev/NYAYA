import type { CaseStatus, PrivacyCase } from './state.ts';
import {
  CaseDraftUpdateError,
  canUpdateDraft,
  createPrivacyCase,
  transitionCase,
} from './state.ts';

export class InMemoryCaseStore {
  private readonly cases = new Map<string, PrivacyCase>();

  create(input: Omit<Parameters<typeof createPrivacyCase>[0], 'id'> & { id: string }): PrivacyCase {
    const created = createPrivacyCase(input);
    const prepared = transitionCase(
      transitionCase(created, 'preparing', 'system', 'Synthetic destination selected.', input.now),
      'draft_ready',
      'system',
      'Access-request draft prepared for user review.',
      input.now,
    );
    this.cases.set(prepared.id, prepared);
    return prepared;
  }

  get(id: string): PrivacyCase | undefined {
    return this.cases.get(id);
  }

  list(): readonly PrivacyCase[] {
    return [...this.cases.values()];
  }

  transition(
    id: string,
    to: CaseStatus,
    actor: 'system' | 'user',
    reason: string,
    now: string,
  ): PrivacyCase | undefined {
    const current = this.cases.get(id);
    if (!current) {
      return undefined;
    }

    const updated = transitionCase(current, to, actor, reason, now);
    this.cases.set(id, updated);
    return updated;
  }

  updateDraft(id: string, draftBody: string, now: string): PrivacyCase {
    const current = this.cases.get(id);
    if (!current) {
      throw new Error(`Case not found: ${id}`);
    }
    if (typeof draftBody !== 'string' || draftBody.trim() === '') {
      throw new Error('draftBody must be a non-empty string.');
    }
    if (!canUpdateDraft(current.status)) {
      throw new CaseDraftUpdateError(current.status);
    }

    const updated: PrivacyCase = {
      ...current,
      draftBody,
      updatedAt: now,
      events: [
        ...current.events,
        {
          from: current.status,
          to: current.status,
          actor: 'user',
          reason: 'User edited the access-request draft.',
          occurredAt: now,
        },
      ],
    };
    this.cases.set(id, updated);
    return updated;
  }

  delete(id: string): boolean {
    return this.cases.delete(id);
  }

  clear(): void {
    this.cases.clear();
  }
}
