# Indicative LPG budget estimator

[Back to feature catalog](README.md)

Customers can explore an illustrative LPG installation range anonymously and become a lead only after explicitly requesting contact.

| Field | Value |
| --- | --- |
| Implementation status | Implemented POC |
| Operational readiness | Not production-ready |
| Roadmap milestone | [**Wiring Milestone 3 — Estimator opt-in lead capture**](../../PROJECT_BLUEPRINT.md#wiring-milestone-3--estimator-opt-in-lead-capture) |
| Audience | Prospective residential LPG customers |
| Entry point | `/tools/lpg-budget-estimator` |
| Last verified | 2026-10-08 |

## User outcome

The estimator varies an indicative low/high PHP range using equipment points, approximate pipe length, route, floors, and protection choices. Anonymous adjustments create no lead. A contact request opens the consent and contact step, then stores the exact submitted estimate snapshot with the new lead.

## Current behavior

- The direct estimator route reuses the assessment component in estimator mode.
- The result shows assumptions and clearly separates the planning range from a formal quotation.
- Contact opt-in is explicit and can be cancelled before submission.
- Successful opt-in records `estimator` as the lead source and preserves the submitted configuration, range, and assumptions.
- Confirmation state survives refresh and disables further edits for the submitted snapshot.

## Data and contracts

The estimate snapshot contains currency, minimum, maximum, and assumptions alongside the estimator configuration in submitted answers. See [`LpgAssessment.tsx`](../../frontend/src/app/assessment/residential-lpg/LpgAssessment.tsx), [`leads.ts`](../../frontend/src/lib/api/leads.ts), and [`schema.ts`](../../backend/src/db/schema.ts).

## Safety, privacy, and authorization

Anonymous use stores configuration in the browser but sends no personal lead. Contact details are collected only after opt-in and consent. The displayed range is illustrative and non-binding; it is not engineering approval, code-compliance confirmation, or a final quotation.

## Failure, retry, and recovery

Estimator state and a completed response are restored from browser storage. Client-side duplicate prevention does not replace durable API idempotency, and the current API can still create duplicates if a submission is delivered again without the saved response.

## Known limitations and deferred work

- Rates and calculation rules are embedded demonstration values, not an approved or versioned production price book.
- The POC continues to display a range for uncertain and technically complex configurations; approved price-suppression and escalation rules are not implemented.
- The linked estimating specification is a draft; proposed rates, service zones, thresholds, promises, and policies are not approved.
- Historical calibration, pricing-rule tests, and approved suppression rules for risky or low-confidence projects are not implemented.

## Validation evidence

- 2026-10-08 — estimator source, submission contract, schema, and roadmap evidence reviewed; no new browser or database test was run for this documentation-only change.
- The roadmap reports anonymous-use behavior and a successful opt-in submission with an exact persisted snapshot and duplicate-safe confirmation refresh for Wiring Milestone 3.

## Evidence and related documents

- [`frontend/src/app/tools/lpg-budget-estimator/page.tsx`](../../frontend/src/app/tools/lpg-budget-estimator/page.tsx)
- [`LpgAssessment.tsx`](../../frontend/src/app/assessment/residential-lpg/LpgAssessment.tsx)
- [Residential LPG estimating specification](../residential-lpg-estimating-spec.md) — draft
- [Implementation log](../implementation-log.md)
