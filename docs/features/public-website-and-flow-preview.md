# Public website and flow preview

[Back to feature catalog](README.md)

Visitors can learn about BNM3's focus areas and enter the Residential LPG assessment or estimator, while stakeholders can view a visual preview of the intended customer-to-quotation journey.

| Field | Value |
| --- | --- |
| Implementation status | Partially implemented |
| Operational readiness | Not production-ready |
| Roadmap milestone | [Product **Milestone 1 — Brand, landing page, and information architecture**](../../PROJECT_BLUEPRINT.md#milestone-1--brand-landing-page-and-information-architecture) |
| Audience | Prospective customers and project stakeholders |
| Entry points | `/`; `/blueprint/customer-flow` |
| Last verified | 2026-10-08 |

## User outcome

The landing page introduces services, process, credibility, and calls to action. Residential LPG links to implemented customer tools. The separate flow page explains the intended relationship between assessment, qualification, technical review, quotation, and project delivery.

## Current behavior

- The responsive public landing page presents residential, commercial, and industrial service categories and links to the Residential LPG assessment and budget estimator.
- The flow preview visually separates current, POC, next, and later stages and preserves the boundary between digital qualification and qualified professional approval.
- Only Residential LPG has an implemented assessment. Other service presentations do not lead to dedicated working funnels.

## Data and contracts

These pages do not directly persist data. The customer tools they link to have separate feature pages and contracts.

## Safety, privacy, and authorization

Public copy must not promise unapproved service areas, response times, safety outcomes, or production pricing. It must keep automated estimates non-binding and technical decisions subject to qualified review.

## Failure, retry, and recovery

The pages are static application routes. No deployment, production availability, analytics, or recovery behavior was verified for this documentation baseline.

## Known limitations and deferred work

- The broader product milestone is not marked complete: production deployment, domain configuration, sitemap/robots review, accessibility, performance, and every primary CTA were not verified against its completion criteria.
- The flow preview is stale: it labels persistent lead submission and staff triage as future work and says assessment data remains browser-only.
- The flow preview also shows planned assessment stages, including an active-leak gate, that are not present in the current assessment implementation.
- Commercial, industrial, and fire-alarm funnels remain deferred.

## Validation evidence

- 2026-10-08 — landing-page and flow-preview source plus roadmap criteria reviewed; no browser, accessibility, performance, or deployment validation was run for this documentation-only change.

## Evidence and related documents

- [`frontend/src/app/page.tsx`](../../frontend/src/app/page.tsx)
- [`frontend/src/app/blueprint/customer-flow/page.tsx`](../../frontend/src/app/blueprint/customer-flow/page.tsx)
- [Residential LPG assessment](residential-lpg-assessment.md)
- [Indicative LPG budget estimator](indicative-lpg-budget-estimator.md)
- [Implementation log](../implementation-log.md)
