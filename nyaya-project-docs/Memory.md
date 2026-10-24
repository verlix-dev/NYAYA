# Nyaya — Working Memory for Claude Code

**This is the only project planning file Claude Code may update.** Treat the other project documents (`PRD.md`, `Architecture.md`, `Rules.md`, `Phases.md`, and `Design.md`) as read-only unless the user explicitly authorizes a change.

## Project purpose
Nyaya is a human-approved privacy-rights request preparation Agent plus an evidence-backed public Index of observed privacy-request journey readiness for selected Indian consumer services.

## Hard constraints
- Never automatically submit a real privacy request.
- Agent stops before final submission; user reviews and submits.
- Never handle/bypass OTP, CAPTCHA, passwords, or access controls.
- Never call a prepared draft “filed” or “submitted.”
- A submission report is user-reported, not independently verified.
- Controlled demo uses synthetic data and no real submission integration.
- Public Index is not a legal-compliance score or legal advice.
- Do not fabricate evidence, scores, confidence, timestamps, or progress.
- No TinyFish spend before authenticated audit request approval and explicit team/admin execution.
- Keep all secrets server-side.
- Enforce owner and team/admin permissions server-side, with RLS as defense in depth.
- Closing a case retains its content; explicit deletion removes associated private artifacts.
- Retraction removes public artifacts/sensitive details and invalidates unsupported scores.
- Partial/blocked runs are unpublished; sanitized evidence only can be public.
- Case content retained until explicit deletion.
- Reminders are in-app only for MVP and require explicit user save.

## Locked product decisions
- MVP fully supports access-request preparation only; correction/erasure are exploratory until implemented.
- Auth: Supabase Auth, passwordless email magic link or OTP.
- Public Index browsing is anonymous; submitting/tracking an individual audit request requires authentication.
- Team/admin membership is manually provisioned.
- Agent and Index have equal priority.
- Public Index pilot shortlist: Amazon India, Flipkart, Swiggy, MakeMyTrip, Uber, Airtel, Instagram, YouTube, Physics Wallah, PhonePe.
- Scoring weights: discoverability 25%, contact clarity 25%, journey friction 30%, completion evidence 20%.
- Dimension score scale 0–100; insufficient evidence is unavailable; overall score requires all four valid dimensions.
- Confidence labels: High / Medium / Low, based on a versioned evidence coverage/quality algorithm.
- Keep previous valid published score if a newer run is incomplete/invalid, and disclose freshness/latest outcome.
- Separate audit request lifecycle from audit run lifecycle.
- Worker platform: managed background worker with HTTPS webhooks, persistent jobs, and secrets; Railway is a candidate only, pending verification.
- Proposed stack: Next.js + React + TypeScript, Supabase, Vercel, TinyFish server-side adapter, separate managed worker.
- API prefix: `/api/v1`.
- Visual identity: editorial/investigative, light theme, hybrid public navigation/private workspace sidebar.
- Accessibility target: WCAG 2.2 AA.

## Unresolved gates — do not silently invent
1. Exact scoring criteria, point mapping, evidence thresholds, and confidence formula.
2. Verified official privacy-request routes and limitations for the ten pilot services.
3. Worker host selection after checking connectivity, free-tier limits, and cost.
4. TinyFish account limits/capabilities and current available budget.
5. Exact case, audit-request, audit-run, and job transition matrices.
6. Final request/response schemas, idempotency keys, optimistic concurrency, reminder timezone behavior.
7. Deletion failure/retry semantics and public cache invalidation behavior.

Until each gate is resolved, document the limitation and use a safe fallback. Never publish a score without the finalized versioned rubric.

## Engineering workflow
- Prefer small, typed, testable changes.
- Build deterministic fixtures before using paid external automation.
- Keep provider-specific behavior behind adapters.
- Persist job state before external work; database is the source of truth.
- Make webhook processing idempotent and reconcile missed events.
- Use bounded retries and explicit timeouts.
- Never commit `.env` files, API keys, tokens, personal data, or raw private evidence.
- Tests should cover authorization, transitions, scoring/unavailable evidence, human handoff, deletion, webhook duplication/loss, and sanitization failure.
- Update this file only when a decision is made or a meaningful implementation state changes. Do not use it as a substitute for tests or source documentation.

## Current implementation state
Planning documents have been drafted. No application code, migrations, integrations, or deployments are claimed as complete by these documents. External routes, provider account capabilities, and final scoring details remain to be verified.
