import { InMemoryCaseStore } from './store.ts';

// The shared case store used by the API routes. Tests can swap in an
// isolated instance and restore the default afterwards.
let current: InMemoryCaseStore = new InMemoryCaseStore();

export function getCaseStore(): InMemoryCaseStore {
  return current;
}

export function setCaseStore(store: InMemoryCaseStore): void {
  current = store;
}

export function resetCaseStore(): void {
  current = new InMemoryCaseStore();
}

// Backwards-compatible default export used by the app at runtime.
export const caseStore = current;