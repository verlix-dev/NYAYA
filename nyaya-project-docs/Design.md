# Nyaya — Design System and UX Specification

## 1. Design direction

**Identity:** editorial, investigative, calm, evidence-first.  
**Theme:** light by default.  
**Navigation:** public-facing top navigation plus a private workspace sidebar.  
**Principle:** the interface should feel like a trustworthy research tool, not a legal authority or an autonomous agent that acts without the user.

A previously generated high-fidelity Index mockup is a visual reference only. Any scores, dates, or evidence shown in it are illustrative and must not be copied as real data.

## 2. Information architecture

### Public
- Landing
- Index / leaderboard
- Service profile
- Audit report
- Evidence viewer
- Methodology and scoring rules
- Sign in

### Signed-in workspace
- Overview
- New privacy request
- Agent workspace
- Draft review / human handoff
- Cases and case details
- Audit requests and request details
- Reminders
- Account, privacy, and deletion controls

### Team/admin
- Audit request queue
- Request review with approve/reject and reason
- Active/recent audit runs
- Evidence validation and sanitization
- Score preview and methodology version
- Publish/withhold/retract controls
- Operational deletion/reconciliation status

## 3. Visual foundations

- Use a neutral, low-saturation palette with strong text contrast.
- Use one restrained accent for primary actions; status colors must also have text/icon labels.
- Prefer readable body text and clear hierarchy over dense dashboard decoration.
- Use consistent spacing, border radius, line lengths, and component states.
- Use typography that supports long-form evidence, citations, timestamps, and methodology.
- Avoid decorative charts that imply precision unsupported by data.

Exact tokens should be implemented as CSS variables/design tokens and reviewed for WCAG 2.2 AA contrast before release.

## 4. Core components

- Global navigation and workspace sidebar
- Service category label
- Score display with confidence and freshness
- Dimension score row/bar with unavailable state
- Evidence citation and sanitized screenshot viewer
- Audit outcome and methodology-version labels
- Case status timeline
- Draft editor with version/save state
- Human handoff panel with explicit “Open destination” action
- User-reported submission confirmation
- Reminder date picker and explicit Save action
- Audit request status tracker
- Admin approve/reject controls with required rejection reason
- Confirmation dialog for destructive delete/retract actions
- Error, warning, empty, loading, stale, blocked, and partial-result panels

## 5. Index dashboard

Each service row/card should show:
- Service name and category
- Overall score only if all four dimensions are valid
- Dimension scores or explicit unavailable labels
- Confidence (High/Medium/Low)
- Last valid audit date and freshness
- Latest attempt outcome when newer than the published score
- Link to methodology and supporting evidence

Never replace unavailable with zero. If a new audit fails, show the prior valid score with its date and disclose the latest attempt outcome.

## 6. Service profile and evidence

- Show official route and whether it is web, app-only, login-required, or unknown when verified.
- Separate observations from interpretation.
- Evidence must show capture date, criterion mapping, methodology version, and limitations.
- Public evidence is sanitized only.
- Withheld/partial audits should not expose private artifacts or imply publication.
- Provide a retraction/issue-reporting path with a documented response process.

## 7. Agent workspace

- Use a structured stepper/status timeline plus a persistent conversational panel.
- Show current goal, selected service/demo destination, job status, and last update.
- Distinguish discovery from preparation and draft-ready from user-reported submission.
- Make the editable request draft prominent before handoff.
- The final action is a handoff/open-destination action; never a Nyaya “Submit request” action.
- Clearly state that the user must review and submit on the destination site.
- If a route is blocked, explain what happened and offer safe next steps without pretending success.

## 8. Case tracker

- Show current status, event timeline, draft versions, private evidence, and reminders.
- Use explicit labels for `Submission reported by you` rather than `Verified submitted`.
- Closing a case is separate from deleting it; communicate that closing retains its content.
- Delete requires explicit confirmation and explains that associated private artifacts are also deleted.
- Show pending/failed deletion if any object removal cannot be confirmed.
- Avoid exposing private case metadata in public routes or analytics.

## 9. Audit request/admin workflow

- Public visitors can view the Index; sign-in is required to request and track an audit.
- Show review status separately from execution status.
- Explain that a request is not approved merely because it was submitted.
- Require a reason for rejection.
- Make the no-spend-before-approval rule clear to administrators.
- Provide a pre-publication checklist for completion, evidence, sanitization, score validity, and methodology version.
- Separate `Publish`, `Withhold`, and `Retract` actions; destructive actions require confirmation.

## 10. Accessibility and responsive behavior

Target WCAG 2.2 AA:
- Full keyboard operation and visible focus.
- Semantic headings, landmarks, buttons, forms, and tables.
- Labels and accessible descriptions for all fields and status changes.
- Do not rely on color alone.
- Sufficient contrast for text, controls, borders, and focus indicators.
- Announce async status changes to assistive technology without excessive chatter.
- Preserve usable layouts at narrow widths and zoom.
- Provide alternatives to screenshot-only evidence, such as a text description and criterion mapping.

## 11. Content and microcopy rules

Prefer precise phrases:
- “Draft prepared”
- “Ready for your review”
- “Open destination to review and submit”
- “Submission reported by you”
- “Evidence unavailable”
- “Audit incomplete”
- “Previous valid score retained; latest attempt failed”
- “Evidence withheld because sanitization did not pass”

Avoid:
- “Request submitted” when Nyaya only prepared a draft.
- “Verified compliant” or “DPDP compliant.”
- “Success” for an unverified provider callback.
- A numeric zero where evidence is unavailable.
- Fake live progress or invented audit timestamps.
