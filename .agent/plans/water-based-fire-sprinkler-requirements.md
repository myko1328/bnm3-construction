# Building water-based fire sprinkler assessment requirements

## Goal and observable outcome

Implement the approved proof-of-concept shape for Building Water-Based Fire Sprinkler Systems. A visitor can open the first landing-page service, complete a five-question assessment, submit contact details into the existing lead pipeline, or use a one-page planning estimator anonymously and opt in to follow-up. Staff see sprinkler-aware summaries, verification items, classification reasons, and site-inspection triggers in the existing dashboard workflow.

## Scope and non-goals

This plan covers the user-requested sprinkler requirements slice now named as the current priority in `PROJECT_BLUEPRINT.md`.

Included:

- Add `/assessment/fire-sprinkler` with a safety screen, five grouped questions, contact consent, persistence/recovery, submission, confirmation reference, and human-review result.
- Add `/tools/fire-sprinkler-budget-estimator` as a single responsive page with building/work type, floors, dimensions/area, environment, existing-fire-pump state, a transparent head-only initial allowance, and optional lead capture.
- Reuse `POST /api/v1/leads`, existing lead sources, persistence table, dashboard, call record, qualification, activity, and site-inspection workflow.
- Make backend qualification labels and frontend dashboard summaries/checklists service-aware without changing the database schema.
- Link both routes from the landing page and synchronize feature/roadmap documentation.

Not included:

- Hydraulic calculations, sprinkler layout, pipe sizing, hazard classification approval, code-compliance approval, signed/sealed design, permitting, inspection certification, or a formal quotation.
- A final hydraulic design, sprinkler layout, approved head quantity, hazard classification, or compliance result.
- A complete-system peso estimate. The later user-approved ₱5,000/head POC rate applies only to the narrow eligible sprinkler-head allowance and does not price the fire pump or other system components.
- Database migrations, uploads, a separate dashboard, production authentication, deployment, or production-data mutation.
- Deploying or using real customer data.

## Current behavior and evidence

- `frontend/src/app/page.tsx` links the first service to the implemented sprinkler assessment and links its estimator from the tools navigation.
- The current public API stores a generic `service`, JSON `answers`, optional estimate snapshot, classification reasons, and inspection triggers, so sprinkler answers can reuse the lead table without a migration.
- `frontend/src/lib/dashboard-leads.ts` and the lead-record trigger list interpret sprinkler answers with service-aware labels, checklists, and review triggers.
- The sprinkler questionnaire and estimator are implemented. The estimator has one user-approved POC rate, not a complete system price book.
- `PROJECT_BLUEPRINT.md` requires automated results to remain indicative and technical decisions to remain with qualified personnel.
- Existing LPG documents demonstrate the desired pattern: research/question analysis is distinct from draft estimating rules and from implemented behavior.

## Interfaces and ownership

The public lead request keeps the existing API envelope:

- `source`: `assessment` or `estimator`.
- `project.service`: `Building water-based fire sprinkler system`.
- `answers.questionnaireVersion`: `fire-sprinkler-v2`.
- `answers`: safety state, building use, work type, existing-system state, floors/basements, dimension mode and normalized square metres, environment/system clue, and—when applicable—an immutable planning-estimator snapshot.
- `projectSignals`: existing generic booleans mapped to sprinkler meaning; the backend selects service-aware reason labels.
- `estimate`: present only for an eligible estimator opt-in, with minimum and maximum equal to the head-only allowance and explicit assumptions. The answer snapshot keeps the calculation inputs, 12.1 m²/head pricing factor, 4.6 m spacing context, ₱5,000/head rate, exclusions, and fire-pump answer.
- Response and error behavior remain the existing created-lead contract and sanitized API errors.

Primary agent owns the full contract, implementation, integration, and final verification. No subagents are assigned because the user did not request delegation and the shared contract is tightly coupled.

No subagents are assigned because this is one tightly coupled requirements analysis and the user did not request parallel delegation.

## Implementation stages

1. Finalize the request/response and service-aware dashboard interpretation contract without a migration.
2. Implement backend service-aware preliminary qualification reasons while preserving LPG behavior.
3. Implement the shared sprinkler assessment/estimator client component, routes, styles, landing links, recovery, validation, and submission behavior.
4. Implement sprinkler-aware dashboard summaries, call checklist, and inspection-trigger options.
5. Run root lint, type-check, build, targeted API/runtime checks where the configured non-production environment permits, and desktop/mobile browser journeys.
6. Update roadmap and feature documentation with evidence and limitations.

## Security, data, and recovery

Contact, location, occupancy, and sprinkler answers are sensitive. The public flow collects coarse location and no uploads or exact address. Anonymous estimator use creates no lead; only explicit contact consent submits. Assessment draft recovery stays in browser storage and is cleared after confirmed submission; the saved reference prevents accidental resubmission from that browser.

The analysis must not give emergency response instructions beyond approved public-safety wording, declare an impaired system safe, or imply that digital intake replaces qualified inspection, hydraulic analysis, authority review, or required professional responsibility.

No database migration is planned. No deployment, production migration, external message, or production-data operation is authorized. A runtime submission may be tested only against the repository's already configured, known non-production environment with visibly synthetic data.

## Validation and acceptance

- Landing page opens both new routes with Next links.
- Assessment enforces safety exit, exactly five visible project questions, back/forward correction, valid dimensions, consent, pending/error/retry, confirmed reference, and refresh recovery.
- Estimator works without contact details, calculates a per-floor head allowance at 12.1 m²/head and ₱5,000/head only for simple eligible inputs, shows the 20.9 m² light-hazard comparison and 4.6 m spacing context, suppresses pricing for complex/special conditions, records fire-pump state, and creates no lead until opt-in.
- Sprinkler submissions use the existing API and appear with service-aware property, scope, system details, reasons, and call verification in the current dashboard.
- Run `pnpm lint`, `pnpm typecheck`, `pnpm build`, `git diff --check`, local Markdown-link verification, and responsive runtime smoke checks.

## Progress

- [x] 2026-10-12T13:58:30+08:00 — Confirmed the landing-page priority entry, repository state, plan requirements, and absence of an existing sprinkler specification.
- [x] 2026-10-12T14:06:17+08:00 — Reviewed current BFP and NFPA primary sources and recorded their applicability and authority boundaries.
- [x] 2026-10-12T14:06:17+08:00 — Drafted the question map, routing outcomes, estimator inputs, no-price rules, data controls, and BNM3 approval checklist.
- [x] 2026-10-12T14:06:17+08:00 — Added the planned feature page and roadmap/catalog/log status updates; local Markdown links and `git diff --check` passed.
- [x] 2026-10-12T14:32:36+08:00 — Incorporated the confirmed shared-dashboard workflow, reduced the public assessment to five grouped questions, and documented the one-page area-based planning estimator after additional NFPA coverage and system-type research.
- [x] 2026-10-12T14:45:00+08:00 — User authorized implementation; reviewed root and scoped agent rules, current contracts, and version-matched Next.js App Router guidance.
- [x] 2026-10-12T15:35:00+08:00 — Implemented the backend/frontend contract, customer routes, landing links, and service-aware dashboard interpretation without a schema migration.
- [x] 2026-10-12T15:52:00+08:00 — Validated root lint, type-check, build, API readiness and malformed-input rejection, assessment/estimator browser journeys, narrow/mobile rendering, service-aware dashboard compilation, documentation links, and whitespace.
- [x] 2026-10-12T16:35:00+08:00 — Added the user-approved ₱5,000/head initial allowance, 12.1 m²/head pricing count, 4.6 m spacing context, questionnaire v2 fire-pump answer, estimate snapshot, dashboard interpretation, and synchronized documentation.
- [x] 2026-10-12T16:43:00+08:00 — Re-ran root lint, type-check, and build; browser-verified the ₱85,000 result for 20 m × 10 m, required assessment fire-pump answer, narrow layout, and zero browser warnings/errors.

## Decisions and discoveries

- 2026-10-12: The requested service is a building water-based fire sprinkler system, not kitchen hood suppression.
- 2026-10-12: Requirements analysis precedes implementation. The landing page must not link to a nonexistent questionnaire or suggest that pricing rules are approved.
- 2026-10-12: The future customer result may support intake, missing-information identification, and routing, but cannot make hydraulic, hazard-classification, code-compliance, or installation-feasibility decisions.
- 2026-10-12: Launch begins with assessment and human review, not a general sprinkler calculator. The later user-approved ₱5,000/head POC allowance applies only to the narrow simple-new-building path; a complete system price book, calibration, threshold, and stale-rate policy remain unapproved.
- 2026-10-12: Only the simple-new-building class receives the head-only initial allowance. Retrofits, alterations, maintenance, complex buildings, special environments, and related tank/main/standpipe scope default to no automated price. Active emergency exits the commercial flow; a possible impairment becomes priority review without pricing.
- 2026-10-12: The user confirmed that sprinkler submissions reuse the current dashboard lead lifecycle; only service-specific questionnaires, summaries, and rules differ. The implementation contract therefore needs a service discriminator and questionnaire version while preserving `assessment` and `estimator` as lead sources.
- 2026-10-12: The customer assessment is limited to five grouped project questions plus safety and contact steps. The estimator is a single page and may show only a planning sprinkler-count range from approved coverage factors, never a design quantity or layout.
- 2026-10-12: The initial version deliberately omitted PHP pricing because no rate was approved. The user subsequently approved ₱5,000 per planning sprinkler head for a narrow POC initial allowance; this does not approve a complete system price book.
- 2026-10-12: NFPA material supports “fire pump” as the customer-facing term and NFPA 20 as the standard for stationary pumps for fire protection. The questionnaire records whether one is reported installed but never concludes that it is adequate.
- 2026-10-12: Existing `service` and JSON `answers` fields provide the service discriminator and versioned snapshot without a migration. Existing source enums remain unchanged.

## Outcomes and remaining risks

Requirements analysis, the revised initial-quote implementation, documentation, and repository-wide validation are complete.

Validation evidence:

- Authoritative BFP and NFPA source material was reviewed for the intake and professional-review boundaries. Some BFP PDF URLs reject direct automated retrieval with HTTP 403, but the official URLs and indexed source content were available; the draft does not claim that an online assessment replaces the underlying rules or authority review.
- Local Markdown links passed a repository-relative existence check.
- `git diff --check` passed.
- Landing-page validation was completed separately in the same change with frontend lint, type-check, production build, and desktop/mobile browser smoke checks.
- Root `pnpm lint`, `pnpm typecheck`, and `pnpm build` passed after implementation. The production build generated `/assessment/fire-sprinkler` and `/tools/fire-sprinkler-budget-estimator`.
- The local development backend reported its configured database connected; a malformed `POST /api/v1/leads` returned HTTP 400. No valid lead was submitted because the connected Neon target was not independently established as a non-production branch.
- Browser smoke reached the assessment contact boundary through all five questions, verified the 20 m × 10 m live result of 10–17 planning sprinklers, verified existing-building quantity suppression, checked the narrow/mobile layout, and found no browser warnings or errors.
- Revised browser smoke verified that the same 20 m × 10 m input produces a 17-head pricing count and ₱85,000 initial allowance, the reported fire-pump state updates the result, and assessment question 5 requires the fire-pump answer before contact.
- All local Markdown link targets resolved and `git diff --check` passed.

Remaining risks and decisions:

- BNM3 must approve launch scope, terminology, emergency/impairment wording and operations, site-visit triggers, document requirements, eligible estimate classes, price book, calibration, privacy controls, response time, and named ownership.
- Upload handling and complete-system automatic pricing remain deferred.
- **Wiring Milestone 7 — Authentication, permissions, and production hardening** still blocks real customer and production use.
- A confirmed non-production database target is still needed for a persisted sprinkler-lead/dashboard runtime smoke; the frontend/backend contract and dashboard mapping compiled, but this turn intentionally did not write to the unverified connected Neon target.
