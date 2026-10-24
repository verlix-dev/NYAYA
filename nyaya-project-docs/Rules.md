# Nyaya — Product, Safety, and Engineering Rules

This file contains invariants that implementation must preserve. If code and this file conflict, pause and resolve the discrepancy rather than silently weakening a safety rule.

## 1. Human control

1. Never submit a privacy request on the user's behalf.
2. The Agent must stop before final submission; the user reviews and submits directly.
3. OTP, CAPTCHA, passwords, and other authentication challenges remain user-controlled.
4. Never impersonate a user or silently submit a form.
5. Never describe a prepared draft as filed, sent, delivered, or submitted.
6. A `submission_reported` status means the authenticated user reported submission. It is not independent verification by Nyaya.
7. The controlled demo uses synthetic data and has no integration that submits to a real service.
8. Do not let conversational instructions bypass the structured workflow, permissions, or human-approval gate.

## 2. Authentication and authorization

- Use Supabase Auth with email magic link or OTP.
- Public Index browsing is anonymous.
- Creating or tracking an individual audit request requires authentication.
- Cases and case artifacts are owner-scoped. The server derives owner identity from the authenticated session, never from client-supplied IDs.
- Team/admin access is manually provisioned and checked server-side on every privileged operation.
- No public team/admin self-enrollment.
- Use RLS as defense in depth and keep server authorization checks mandatory.
- Never expose service-role or TinyFish secrets to the client.
- Private-record authorization failures must not reveal whether another user's record exists.

## 3. Audit approval and provider spend

- A user-submitted audit request is not permission to execute an audit.
- Team/admin must approve before execution.
- Only team/admin can start a live audit.
- Do not consume TinyFish credits before approval and an explicit execution action.
- No automatic paid retries. Every retry must be bounded, justified, and observable.
- Use the controlled demo fixture for routine development and UI testing.

## 4. Index scoring invariants

### Fixed weights
| Dimension | Weight |
|---|---:|
| Discoverability | 25% |
| Contact clarity | 25% |
| Journey friction | 30% |
| Completion evidence | 20% |

- Each dimension uses a 0–100 scale when there is sufficient evidence.
- Insufficient evidence is `unavailable`, not `0`.
- Overall score exists only when all four dimensions have valid scores.
- Store the scoring rubric/methodology version with every score.
- Scores must be reproducible from recorded evidence and the exact rubric version.
- Confidence is High/Medium/Low and must derive from a published, versioned evidence-coverage/quality rule.
- Never fabricate a score, evidence, completion result, audit date, or confidence level.
- A blocked path is an observed outcome and is not automatically a zero.
- Do not make legal-compliance claims or imply the Index proves legal compliance.
- Keep the previous valid published score if a later run is incomplete or fails validation; disclose its age and the latest attempt outcome.
- Do not publish an overall score until exact dimension criteria, evidence thresholds, mapping, and confidence formula have been specified and versioned.

### Rubric version 1 — criteria to finalize before production scoring
The following are rubric dimensions, not yet a complete scoring algorithm. Before production scores are published, add observable criteria, evidence required, point mapping, unavailable threshold, and examples for every dimension.

- **Discoverability:** Can a user locate the relevant privacy-request route from official service-owned pages using a reproducible path?
- **Contact clarity:** Is the responsible privacy/contact channel clearly identified, with a usable route and understandable instructions?
- **Journey friction:** How many meaningful steps, barriers, detours, login requirements, or unexplained failures occur before a request can be prepared? Document the counting rules.
- **Completion evidence:** Is there observable, reproducible evidence that the journey reached the defined end state? Reaching a form is not proof a request was submitted; Nyaya never submits the request.

No numeric scores may be derived from these descriptions alone. They require an approved point-mapping table and evidence thresholds.

## 5. Evidence and publication

- Separate raw/private artifacts from public sanitized evidence.
- Only fully completed audits can become publication candidates.
- Partial, blocked, failed, and timed-out runs remain unpublished.
- Completion and publication are separate states.
- Public artifacts require sanitization and validation.
- If sanitization fails, withhold the artifact.
- Do not expose unpublished audit IDs, private statuses, raw provider payloads, private screenshots, or private case artifacts through public endpoints.
- Every public claim must link to its supporting evidence and identify audit time, methodology version, and limitations.
- Retain public evidence until superseded or retracted.
- Retraction removes public artifacts and sensitive details. Retain only non-sensitive audit history, methodology version, and retraction reason.
- If retraction leaves a dimension/overall score unsupported, recompute or withdraw the affected score.
- Attempt public cache invalidation and record whether it succeeded; do not claim global invalidation if only origin storage was changed.

## 6. Case lifecycle

Candidate case statuses:
`created`, `discovering`, `preparing`, `draft_ready`, `awaiting_user_action`, `submission_reported`, `awaiting_response`, `resolved`, `closed`, `needs_user_input`, `blocked`, `failed`, `cancelled`.

Required transition rules:
- Implement a single centralized transition validator; do not allow arbitrary status patches.
- Record event time, actor type, and a safe reason for every status change.
- Only authenticated owner actions can report submission, close, delete, or manage reminders for their case.
- A case may be closed without deleting its content.
- Close is a status-only action. It must not trigger data deletion.
- Delete is a separate explicit action and must initiate deletion of associated private artifacts.
- Terminal/reopen rules and the full allowed transition matrix must be defined in code and tests before release; no implicit transitions.

## 7. Audit-request and audit-run lifecycle

Proposed audit-request statuses:
`submitted`, `under_review`, `approved`, `rejected`, `queued`, `running`, `completed`, `partial`, `blocked`, `failed`, `timed_out`, `cancelled`.

- Audit request and audit run are separate entities.
- Rejection requires a reason.
- Only team/admin can approve/reject.
- Only approved requests can be executed.
- Record the approver, decision time, and reason.
- A request status is not the same as provider run status.
- A run can have a distinct outcome from the request's review state.
- Define and test the exact transition matrix, cancellation semantics, and re-run policy before enabling live runs.

## 8. Async job rules

Internal job states:
`queued`, `running`, `succeeded`, `partial`, `blocked`, `failed`, `timed_out`, `cancelled`.

- Persist a job before starting external work.
- The database is the source of truth.
- Treat provider webhooks as best-effort notifications; reconcile with provider status.
- Verify completion against the provider API before publication.
- Deduplicate webhook events and make processing idempotent.
- Use bounded retries/backoff for transient errors only.
- Distinguish cancellation requested from cancellation confirmed if the provider can race completion.
- Do not fabricate progress; show the latest persisted state and last-updated time.

## 9. Privacy, retention, and deletion

- Retain case content until explicit user deletion; closing does not delete.
- Minimize stored personal information and never store passwords/OTPs.
- Raw case evidence is private and owner-scoped.
- Deletion must remove private DB content and underlying objects through the Storage API.
- Deletion is idempotent and retryable.
- Do not claim deletion success until all required private artifacts have been confirmed removed.
- If a partial failure occurs, show a safe pending/failed state and retry path without exposing sensitive details.
- Keep only minimal non-content deletion metadata if required for operational integrity.
- Logs must exclude private request text, tokens, secrets, and unnecessary personal data.

## 10. Reminders

- MVP reminders are in-app only.
- A suggested due date is not persisted until the user explicitly saves it.
- No email/push delivery in MVP.
- Persist due date and timezone semantics explicitly.
- Reminder operations must be owner-scoped and idempotent where applicable.

## 11. API and reliability rules

- All API paths are versioned under `/api/v1`.
- Validate request bodies, query parameters, identifiers, and payload size.
- Use consistent error responses and stable machine-readable codes.
- Use idempotency for external job creation, approval/execution, and destructive requests where appropriate.
- Use optimistic concurrency for draft revisions.
- Apply rate limits to authentication, case creation, audit requests, and expensive actions.
- Return safe messages; keep stack traces/provider payloads in redacted server logs only.
- Enforce timeouts and bounded retries.
- Do not let a client set privileged fields such as owner, role, score, publication status, or provider status.

## 12. UI honesty and accessibility

- Show unavailable separately from zero.
- Clearly label exploratory/unsupported rights goals.
- Clearly label user-reported submission.
- Show score freshness, confidence, methodology version, and evidence.
- Provide loading, empty, stale, partial, blocked, failed, unauthorized, and session-expired states.
- Target WCAG 2.2 AA, including keyboard navigation, focus visibility, screen-reader labels, contrast, and mobile layouts.
