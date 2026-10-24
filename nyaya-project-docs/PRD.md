# Nyaya — Product Requirements Document

**Status:** Implementation baseline  
**Audience:** Product, design, engineering, hackathon judges  
**Scope:** MVP for a 24-hour hackathon build  
**Product promise:** Help people prepare privacy-rights requests with human control, and publish an evidence-backed view of how discoverable and usable selected services' privacy-request journeys are.

## 1. Problem and product thesis

People may struggle to find the right privacy-request channel, understand what to ask for, and keep track of follow-up. Separately, public claims about service readiness are hard to compare without reproducible evidence.

Nyaya combines:
1. **Agent** — a guided, human-approved workflow to prepare an access request and track the user's next steps.
2. **Index** — a transparent, evidence-backed public index of observed privacy-request journey readiness.
3. **Case tracker** — a private record of drafts, user-reported submission, evidence, and optional in-app reminders.

Nyaya is not a data-deletion service, legal adviser, or certification of legal compliance.

## 2. MVP goals

- Demonstrate one complete Agent journey against a purpose-built controlled demo website using synthetic data.
- Show the Agent discovering a destination, preparing an access-request draft, and stopping before final submission.
- Require the user to inspect and manually submit any request on the destination website.
- Offer a case tracker with explicit status, evidence, user-reported submission, close, delete, and optional in-app due-date reminder.
- Publish an Index for up to ten pilot services only where audit evidence and scoring requirements are met.
- Make scoring, freshness, confidence, methodology version, and evidence provenance inspectable.
- Support authenticated audit-request submission and tracking, with team/admin approval before a live audit can consume TinyFish credits.

## 3. Non-goals

- Automated final submission to a real service.
- Handling or bypassing passwords, OTPs, CAPTCHA, or other access controls.
- Claiming that a request was filed when only a draft was prepared.
- Claiming legal compliance or adjudicating a service's legal obligations.
- Broad service coverage, a dark-pattern classifier, automatic legal conclusions, scheduled email/push reminders, or unattended public publishing.
- Automatically merging private Agent observations into the public Index.

## 4. Users and access levels

### Public visitor
- Browse published service profiles, scores, audit freshness, methodology, and sanitized evidence.
- Cannot submit or track an individual live audit request without authentication.

### Authenticated user
- Create and manage their own cases.
- Create drafts, inspect evidence, report that they personally submitted a request, set/edit reminders, close cases, and explicitly delete cases.
- Submit and track audit requests.
- Cannot access another user's private cases or unpublished audit data.

### Team/admin
- Manually provisioned; no public self-service team enrollment.
- Review, approve, or reject audit requests with a reason.
- Start, monitor, cancel, validate, and publish eligible audits.
- Must pass server-side role checks for every privileged operation.

## 5. Agent workflow

### Supported rights goal
- **Access request preparation** is the only fully supported MVP journey.
- Access, correction, and erasure may appear as product concepts, but correction and erasure must be labeled exploratory/unsupported until implemented and tested.

### Controlled demo destination
The demo site must use synthetic data and provide:
- A realistic privacy/help page.
- An access-request form.
- A review stage.
- A deterministic success route and a deterministic blocked route.
- No real-world submission integration or transmission of a real request.

### Human-control boundary
- The Agent may find a route, navigate, and prepare a draft.
- It must stop before the final submit action.
- The user opens/reviews the destination and submits directly.
- The user controls OTP, CAPTCHA, passwords, and any other authentication challenges.
- The system must not impersonate a user or silently submit.
- The human-approval requirement is enforced by workflow and UI, not only by an Agent instruction.

### Case status vocabulary
Candidate statuses to implement as a validated state machine:
`created`, `discovering`, `preparing`, `draft_ready`, `awaiting_user_action`, `submission_reported`, `awaiting_response`, `resolved`, `closed`, `needs_user_input`, `blocked`, `failed`, `cancelled`.

The exact allowed transitions and terminal-state rules must be encoded centrally in `Rules.md` before implementation of the state machine. Invalid transitions return a stable error and do not mutate state.

A user-reported submission is an assertion by that user, not independent verification by Nyaya. A prepared draft is never represented as filed.

## 6. Case retention, closure, and deletion

- Closing a case changes its status only. It does not delete case content.
- Case content is retained until the user explicitly deletes the case.
- Explicit deletion removes the case's private artifacts, including draft revisions, screenshots, uploads, and derived private artifacts.
- Storage objects must be deleted through the storage provider API; deleting database metadata alone is insufficient.
- Deletion must be retryable and idempotent. If deletion is incomplete, expose a safe operational status without falsely claiming success.
- A minimal non-content deletion/audit record may remain to support operational integrity; it must not preserve request text, screenshots, uploads, or other private content.
- Never place secrets, passwords, OTPs, or unnecessary sensitive identifiers in case data or logs.

## 7. Public Index

### Pilot shortlist (not yet a verified dataset)
1. Amazon India — e-commerce
2. Flipkart — e-commerce
3. Swiggy — food delivery
4. MakeMyTrip — travel booking
5. Uber — ride-hailing
6. Airtel — telecom
7. Instagram — social/communication
8. YouTube — entertainment/streaming
9. Physics Wallah — education
10. PhonePe — payments/fintech

This is a shortlist, not evidence that official routes have been verified. Record each service's official route, route type (web/app/login-required/unknown), audit date, evidence, reproducibility, and limitations before scoring. A blocked route is an outcome to document, not automatically a zero.

### Dimensions and weights
- Discoverability — 25%
- Contact clarity — 25%
- Journey friction — 30%
- Completion evidence — 20%

Dimension scores use a 0–100 scale. A dimension with insufficient evidence is **unavailable**, not zero. An overall score is published only when all four dimension scores are valid.

### Confidence and freshness
Each published result has High, Medium, or Low confidence based on evidence coverage and quality. The detailed rubric and confidence formula must be versioned and specified in `Rules.md`; do not invent missing data to make a score publishable.

If a new audit is incomplete or fails validation, retain the previous valid published score and clearly disclose its age and the latest attempt's outcome.

### Publication and retraction
- Audit completion and publication are separate states.
- Only fully completed audits with validated and sanitized evidence are eligible for publication.
- Partial/blocked runs remain unpublished.
- Sanitization failure means evidence is withheld.
- A completed audit may be stored internally while still lacking enough evidence for an overall score.
- Public evidence is retained until superseded or retracted.
- On retraction, remove public artifacts and sensitive details; retain only non-sensitive audit history, methodology version, and retraction reason.
- If retracted evidence no longer supports a dimension or overall score, recompute or withdraw the affected score. Never leave an unsupported score published.
- Cached public artifacts should be invalidated on a best-effort basis and the retraction outcome recorded.

### Interpretation
The Index describes observed public-web readiness and the evidence captured in a specific audit. It is not a legal-compliance score, proof of fulfillment, or legal advice.

## 8. Audit request workflow

- A public visitor can browse the Index.
- An authenticated user can submit and track an audit request.
- Team/admin reviews each request and approves or rejects it with a reason.
- Only team/admin can execute a live audit.
- No TinyFish credits are consumed before approval and an explicit execution action.
- Audit request and audit run are separate records with separate lifecycle/status fields.
- Unpublished or private audit details must not leak through public endpoints.

Proposed request lifecycle: `submitted → under_review → approved → queued → running → completed`, with alternative outcomes `rejected`, `cancelled`, `partial`, `blocked`, `failed`, and `timed_out`. Exact transitions are governed by `Rules.md`.

## 9. Reminders

- User-selected in-app due dates only for MVP.
- A suggested date may be shown, but cannot be saved without explicit user action.
- No scheduled email or push delivery in MVP.
- Reminder dates are stored with a documented timezone policy; display dates in the user's selected/local timezone without silently changing the underlying due date.

## 10. UX and accessibility

- Editorial/investigative identity; light theme; restrained typography.
- Hybrid public navigation and private workspace sidebar.
- Target WCAG 2.2 AA: keyboard access, screen-reader labels, contrast, focus states, and mobile usability.
- Screens: public landing, Index dashboard, service profile/evidence/methodology, passwordless sign-in, private workspace, new request, Agent workspace, human review, case tracker, audit-request tracker, account/deletion controls, and team/admin audit queue.
- Show honest loading, empty, partial, blocked, failed, stale, unauthorized, and expired-session states.
- Public leaderboard includes overall score only when valid, four dimensions, audit freshness, confidence, outcome, and evidence links. Unavailable is distinct from zero.
- Live progress must reflect persisted/provider state; never fabricate progress.

## 11. Authentication and privacy

- Supabase Auth with passwordless email magic link or OTP.
- Public Index reads require no sign-in.
- Private case and audit-request endpoints require authenticated ownership checks.
- Team/admin authorization is server-side and based on manually provisioned membership.
- Apply database Row Level Security (RLS) as defense in depth. Server-side checks remain mandatory.
- Keep Supabase service-role credentials and TinyFish credentials server-side only.
- Store the minimum personal information required to prepare a request.
- Do not use real personal data in the controlled demo.

## 12. Acceptance criteria

### Agent
- A user can complete the supported access-request preparation journey on the controlled demo site.
- The draft is visible for review and can be edited before the user proceeds.
- No path automatically triggers final submission.
- A draft-ready case is not described as submitted.
- User-reported submission is visibly labeled as user-reported.
- A blocked route is represented honestly with recovery guidance.

### Case tracker
- A signed-in user can list and open only their own cases.
- Close retains content; explicit delete initiates deletion of database and private storage artifacts.
- Failed deletion is surfaced and safely retryable.
- Reminder save requires user action and stores an explicit due date.

### Index
- No score is fabricated where evidence is insufficient.
- The overall score appears only when all four dimensions are valid.
- The score is traceable to a versioned rubric, audit time, and evidence.
- Failed/incomplete new attempts do not erase a prior valid score and are disclosed.
- Unpublished evidence is inaccessible from public endpoints.
- Retraction removes public artifacts and invalidates unsupported scores.

### Audit requests
- Authentication is required to create and track a request.
- Only team/admin can approve/reject and execute a live audit.
- Rejection captures a reason.
- No provider spend occurs before approval and explicit execution.

## 13. Open implementation gates

Do not present these as settled facts until verified:
- Official privacy-request routes and route limitations for each pilot service.
- Exact rubric criteria, evidence thresholds, dimension score mapping, and confidence algorithm.
- Selected worker host and free-tier/network/cost suitability.
- TinyFish account capability, rate limits, and remaining budget.
- Exact case/audit state-transition tables and API schemas.
- Deletion retry/partial-failure behavior and public cache invalidation.
