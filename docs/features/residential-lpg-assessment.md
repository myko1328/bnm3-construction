# Residential LPG assessment

[Back to feature catalog](README.md)

Customers can describe a residential LPG project, consent to contact, and receive a permanent lead reference with preliminary routing guidance.

| Field | Value |
| --- | --- |
| Implementation status | Implemented POC |
| Operational readiness | Not production-ready |
| Roadmap milestone | [**Wiring Milestone 2 — Assessment submission to Neon**](../../PROJECT_BLUEPRINT.md#wiring-milestone-2--assessment-submission-to-neon) |
| Audience | Prospective residential LPG customers |
| Entry point | `/assessment/residential-lpg` |
| Last verified | 2026-10-08 |

## User outcome

The guided flow collects requested work, existing-system concerns, property, equipment, access, location, and contact information. It produces an estimator-ready summary and preliminary classification, not a quotation or technical approval.

## Current behavior

- Conditional stages collect the existing-system follow-up only when that work is selected and accept several unknown answers rather than forcing technical guesses.
- Contact consent is required before `POST /api/v1/leads` creates the lead.
- The UI shows pending, validation, connection-error, retry, and confirmation states.
- The successful reference and local assessment state survive a page refresh, preventing the normal confirmation refresh from resubmitting the lead.
- The backend generates an explainable preliminary classification, score, reasons, missing questions, and inspection triggers.

## Data and contracts

Assessment submission stores contact and coarse location details, consent time, answers, missing questions, and project signals. The frontend contract is in [`frontend/src/lib/api/leads.ts`](../../frontend/src/lib/api/leads.ts); backend validation and classification are in [`lead.schemas.ts`](../../backend/src/modules/leads/lead.schemas.ts) and [`lead-qualification.ts`](../../backend/src/modules/leads/lead-qualification.ts).

## Safety, privacy, and authorization

Contact details, the required street/building location, and assessment answers are sensitive and are also stored in browser storage while the flow is in progress. The result is intake guidance only. An active leak, uncertain condition, site constraint, or LPG safety decision requires approved emergency wording and qualified human review.

## Failure, retry, and recovery

Client state is saved in browser storage and restored after refresh. The UI blocks repeated clicks and retains a completed response, but the API lacks a durable server-enforced idempotency key, so retries from a lost client state or concurrent delivery can still create duplicates.

## Known limitations and deferred work

- Production abuse controls and authenticated staff handling are not implemented.
- The research direction's active-leak emergency gate, cylinder/supply questions, detailed route questions, optional evidence, and customer site-visit preference are not implemented in the current assessment. The submitted safety signal is always false.
- Optional uploads, cross-device customer save/resume, and other service funnels are deferred.
- The current flow requires street/building detail before intake, although the draft policy proposes collecting only coarse location until scheduling.
- Frontend location choices and the backend's hard-coded service-area matching are not one approved shared policy and can disagree.
- Service-area and customer-facing emergency policies still require BNM3 approval.
- The research direction is approved for POC design; it is not compliance approval.

## Validation evidence

- 2026-10-08 — source, API contract, validation schema, persistence schema, and roadmap evidence reviewed; no new browser or database test was run for this documentation-only change.
- The roadmap reports a successful browser-to-Neon submission and duplicate-safe confirmation refresh for Wiring Milestone 2.

## Evidence and related documents

- [`LpgAssessment.tsx`](../../frontend/src/app/assessment/residential-lpg/LpgAssessment.tsx)
- [Residential LPG funnel question analysis](../residential-lpg-funnel-question-analysis.md) — approved research direction
- [Project blueprint](../../PROJECT_BLUEPRINT.md)
- [Implementation log](../implementation-log.md)
