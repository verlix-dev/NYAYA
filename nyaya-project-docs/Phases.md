# Nyaya — Implementation Phases

**Delivery target:** 24-hour hackathon MVP.  
**Priority:** Agent and Index are equally important; the controlled Agent demo and a trustworthy evidence-backed Index must both be demonstrable.  
**Rule:** Prefer a narrow, complete, honest flow over broad but simulated functionality.

## Phase 0 — Environment and external gates

- [ ] Create the repository and confirm Node/package manager versions.
- [ ] Set up Next.js + React + TypeScript.
- [ ] Create Supabase project; configure Auth and database.
- [ ] Configure Vercel deployment.
- [ ] Select/verify a managed worker platform; Railway is the first candidate only after verifying HTTPS webhooks, outbound TinyFish connectivity, persistent work, secrets, and cost/free-tier limits.
- [ ] Store TinyFish and Supabase secrets only in server-side environment variables.
- [ ] Verify TinyFish account capabilities and remaining budget in its dashboard; never paste secrets into source control or chat.
- [ ] Seed a deterministic controlled demo website and synthetic data.
- [ ] Record any external verification gaps as risks; do not fake completion.

**Exit criteria:** local app starts; auth/storage connectivity verified; secrets are not exposed; fixture journey works without paid provider calls.

## Phase 1 — Foundation and access control

- [ ] Add typed domain models and shared validation schemas.
- [ ] Add Supabase migrations for services, cases, drafts, jobs, events, audit requests/runs/evidence/scores, memberships, and reminders.
- [ ] Configure RLS and server-side ownership/role checks.
- [ ] Add stable API error envelope and request IDs.
- [ ] Add audit logs that exclude sensitive content.
- [ ] Implement passwordless sign-in and session expiry handling.
- [ ] Add role seeding/manual admin provisioning instructions.

**Exit criteria:** anonymous users can read only public Index data; signed-in users can access only their own cases/requests; team-only endpoints reject non-team users.

## Phase 2 — Design system and public Index shell

- [ ] Implement editorial light theme, typography, navigation, spacing, buttons, forms, tables, status indicators, and evidence panels.
- [ ] Build public landing page, Index leaderboard, service profile, methodology page, and published evidence view.
- [ ] Seed service directory with the ten pilot candidates, clearly marked as unverified/unevaluated until real evidence exists.
- [ ] Render unavailable dimensions without substituting zero.
- [ ] Add loading, empty, stale, partial, blocked, and failed states.
- [ ] Verify keyboard navigation and responsive layouts.

**Exit criteria:** public pages work with honest empty/unverified data and do not display invented scores.

## Phase 3 — Controlled Agent demo

- [ ] Build the controlled demo destination with synthetic data, privacy page, access form, review stage, deterministic success and blocked routes.
- [ ] Implement case creation and centralized state transitions.
- [ ] Implement discovery/preparation jobs using deterministic fixture data first.
- [ ] Build draft editor/review and human handoff.
- [ ] Ensure there is no code path that automatically submits the final form.
- [ ] Add user-reported submission, awaiting-response, resolve/close, and explicit deletion actions.
- [ ] Add owner-scoped case tracker and evidence.
- [ ] Add in-app reminder create/edit with explicit save.
- [ ] Test blocked, failed, and session-expired journeys.

**Exit criteria:** a judge can run the complete synthetic access-request preparation journey, inspect/edit the draft, and see that the final submission remains user-controlled.

## Phase 4 — Index audit and scoring pipeline

- [ ] Finalize and version the scoring rubric before any public numeric score is published.
- [ ] Verify official routes for pilot services and record route limitations.
- [ ] Implement authenticated audit-request submission/tracking.
- [ ] Build team/admin review queue and rejection reason.
- [ ] Enforce approval before starting any live run.
- [ ] Implement TinyFish adapter and async job persistence.
- [ ] Implement webhook ingestion, deduplication, provider reconciliation, timeouts, and bounded retries.
- [ ] Capture evidence only where permitted and available.
- [ ] Implement sanitization and validation; separate private and public storage.
- [ ] Calculate scores only from sufficient evidence and publish only after validation.
- [ ] Preserve previous valid scores on incomplete/failed runs.
- [ ] Implement evidence retraction, score recomputation/withdrawal, and best-effort cache invalidation.

**Exit criteria:** no unauthenticated audit request, no unapproved live execution, no fabricated scores, and no private evidence exposed publicly.

## Phase 5 — Hardening and demo readiness

- [ ] Test case ownership and cross-user access denial.
- [ ] Test team/admin authorization on every privileged route.
- [ ] Test deletion including storage objects, retries, and partial failures.
- [ ] Test duplicate/missed webhooks, worker restart, provider timeout, and cancellation race.
- [ ] Test score calculation against rubric examples and unavailable evidence.
- [ ] Test evidence sanitization failure and retraction.
- [ ] Test responsive/mobile and keyboard-only flows.
- [ ] Check logs for secrets/private request content.
- [ ] Confirm external costs and set spend alerts/limits where supported.
- [ ] Prepare a short demo script with honest caveats and a resettable fixture.
- [ ] Document known limitations and what is live vs deterministic.

**Exit criteria:** reproducible demo, no critical authorization leak, no automatic final submission, and transparent distinction between demo data and verified audit results.

## Suggested 24-hour allocation

| Workstream | Target share | Reason |
|---|---:|---|
| Foundation/auth/data contracts | 15% | Security and persistence unblock both tracks |
| Public Index/UI | 20% | Public-facing half of the product |
| Agent controlled demo | 20% | Core interactive demonstration |
| Audit/worker/scoring pipeline | 25% | Evidence integrity and Index credibility |
| Hardening/demo/recovery | 20% | Avoid a brittle or misleading demo |

Treat the allocation as a guide, not permission to skip safety requirements. If provider integration is blocked, demonstrate the deterministic fixture and clearly mark live auditing as unavailable rather than fabricating a run.

## Definition of done

- Required flows work end-to-end in the intended environment.
- All access control is server-enforced.
- Human approval gate cannot be bypassed.
- No fake scores or fake progress.
- Evidence and score provenance are inspectable.
- Private data deletion is verified or visibly pending.
- Tests cover state transitions, authorization, scoring, and failure paths.
- README/setup instructions explain environment variables and deployment without revealing secrets.
