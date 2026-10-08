# Implementation log

This reverse-chronological log records material feature deliveries and status transitions. It is not a duplicate of Git history and does not record typo-only, styling-only, or behavior-preserving refactors. Validation is stated exactly as evidenced; roadmap-reported checks are distinguished from checks run while preparing documentation.

[Open the feature catalog](features/README.md)

## 2026-10-08 — Feature documentation baseline

- **Outcome:** Added a canonical feature catalog, reusable page template, initial feature pages, and contributor maintenance rules. Corrected the blueprint's stale connected-POC summary and expanded the README endpoint summary.
- **Status affected:** Documentation baseline for the partially implemented public website and for **Wiring Milestone 0 — Monorepo and backend foundation** through **Wiring Milestone 6 — Qualification and site-inspection workflow**. This entry does not reconstruct unknown completion dates.
- **Validation:** Repository source, schema, generated migrations, Git history, README, domain documents, and blueprint were reviewed. Documentation link and whitespace checks are recorded in the active ExecPlan. No application runtime or database validation was performed for this documentation-only change.
- **Remaining limitations:** All connected workflows are not production-ready until **Wiring Milestone 7 — Authentication, permissions, and production hardening** and its acceptance checks are complete.

## 2026-10-08 — Qualification and site-inspection workflow

- **Outcome:** Added reasoned classification confirmation/override, controlled lead-status transitions, inspection triggers, and internal site-inspection request scheduling and completion.
- **Feature:** [Qualification and site-inspection workflow](features/qualification-and-site-inspection.md)
- **Validation:** The blueprint reports role-prohibition, workflow, and activity-history verification. See commit `dd72bed` for repository history.
- **Remaining limitations:** Client-supplied identity/roles, unauthenticated staff endpoints, and non-transactional multi-write operations prevent production use.

## 2026-10-07 — Live dashboard, persistent call records, and activity history

- **Outcome:** Replaced dashboard mock data with Neon records and replaced browser-only call-record persistence with Neon-backed drafts, required-field finalization, manager questions, activity history, and reload recovery.
- **Features:** [Lead dashboard](features/lead-dashboard.md) and [call records and activity history](features/call-records-and-activity-history.md)
- **Validation:** The blueprint reports live list filtering, UUID-backed detail routes, and persisted checklist state, comments, summary, and activity history after full reload. See commits `3c816d8` and `c17fe9c`.
- **Remaining limitations:** Authentication, trusted audit attribution, transactionality, and automated concurrency coverage remain incomplete.

## 2026-10-06 — Connected assessment and estimator POC

- **Outcome:** Added the typed frontend API client, assessment submission, estimator opt-in capture, Node/Worker API support, and connected Neon-backed lead handling.
- **Features:** [Residential LPG assessment](features/residential-lpg-assessment.md), [indicative LPG budget estimator](features/indicative-lpg-budget-estimator.md), and [platform foundation](features/platform-foundation.md)
- **Validation:** The blueprint reports browser-to-Neon submissions, confirmation refresh behavior, and exact estimator snapshot persistence. See commit `a483264`.
- **Remaining limitations:** Server-enforced idempotency, authenticated staff access, approved production pricing, and production hardening remain incomplete.

## 2026-09-25 — Residential LPG proof-of-concept flow

- **Outcome:** Added the guided Residential LPG assessment and customer-flow presentation used to shape the connected implementation.
- **Feature:** [Residential LPG assessment](features/residential-lpg-assessment.md)
- **Validation:** Repository history establishes the initial POC delivery; the current feature page documents later connected behavior. See commit `4ae3f19`.
- **Remaining limitations:** The customer-flow presentation contains stale browser-only and “next phase” copy that should be reconciled in a future UI-content change.
