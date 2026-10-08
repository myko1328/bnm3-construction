# Lead dashboard

[Back to feature catalog](README.md)

Staff can browse persisted assessment and estimator leads, filter the inbox, and open a database-backed lead record.

| Field | Value |
| --- | --- |
| Implementation status | Implemented POC |
| Operational readiness | Not production-ready |
| Roadmap milestone | [**Wiring Milestone 4 — Dashboard reads live leads**](../../PROJECT_BLUEPRINT.md#wiring-milestone-4--dashboard-reads-live-leads) |
| Audience | Internal BNM3 staff |
| Entry points | `/dashboard`; `/dashboard/leads/:id` |
| Last verified | 2026-10-08 |

## User outcome

The inbox replaces mock lead data with live API records. Staff can search by customer, reference, city, or phone; filter by status and source; review classification and budget context; and open a full record using the persisted lead UUID.

## Current behavior

- Live lead loading includes visible loading, empty, error, retry, and filtered-empty states.
- Summary cards reflect current lead statuses.
- The detail preview shows source, status, preliminary or reviewed classification, score, contact/location data, project scope, equipment, and estimate context.
- The full record loads lead activity and the current site-inspection request from the API.

## Data and contracts

The dashboard reads `GET /api/v1/leads` and `GET /api/v1/leads/:id` through the typed client in [`frontend/src/lib/api/leads.ts`](../../frontend/src/lib/api/leads.ts). Display mapping lives in [`dashboard-leads.ts`](../../frontend/src/lib/dashboard-leads.ts).

## Safety, privacy, and authorization

This surface exposes sensitive customer contact, address, answers, and operational history. It is an internal POC only: the routes and API reads are currently unauthenticated, and the displayed demo identity is not proof of staff authority.

## Failure, retry, and recovery

List reads can be retried after service failure and stale requests are aborted when the component unmounts. Detail failures are displayed separately. Database persistence allows records to survive browser and device changes, subject to API availability.

## Known limitations and deferred work

- Authentication, route protection, server-side authorization, and trusted staff identity are deferred to Wiring Milestone 7.
- Assignment controls are display-only.
- A previously selected record can remain visible in the preview after filters exclude it.
- The public customer-flow blueprint page contains stale POC copy that still describes connected operational steps as future work.
- Automated frontend behavioral tests are not configured.

## Validation evidence

- 2026-10-08 — dashboard source, API client, backend routes, and roadmap evidence reviewed; no new browser or database test was run for this documentation-only change.
- The roadmap reports live list, source filtering, and UUID-backed detail verification for Wiring Milestone 4.

## Evidence and related documents

- [`PersonnelDashboard.tsx`](../../frontend/src/app/dashboard/PersonnelDashboard.tsx)
- [`LeadRecord.tsx`](../../frontend/src/app/dashboard/leads/%5BleadId%5D/LeadRecord.tsx)
- [`lead.routes.ts`](../../backend/src/modules/leads/lead.routes.ts)
- [Implementation log](../implementation-log.md)
