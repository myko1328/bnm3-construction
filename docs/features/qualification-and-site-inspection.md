# Qualification and site-inspection workflow

[Back to feature catalog](README.md)

Staff can review preliminary classification, record a reasoned operational decision, move a lead through controlled statuses, and manage one internal site-inspection request.

| Field | Value |
| --- | --- |
| Implementation status | Implemented POC |
| Operational readiness | Not production-ready |
| Roadmap milestone | [**Wiring Milestone 6 — Qualification and site-inspection workflow**](../../PROJECT_BLUEPRINT.md#wiring-milestone-6--qualification-and-site-inspection-workflow) |
| Audience | Customer-support, technical, manager, and administrator roles in the POC |
| Entry point | `/dashboard/leads/:id` |
| Last verified | 2026-10-08 |

## User outcome

Personnel can see why the automated intake classified a lead, confirm that result or override it with a recorded reason, confirm inspection triggers, select an allowed next status, and request or manage an internal inspection. These steps route work; they do not automate technical approval.

## Current behavior

- A confirmed review must keep the preliminary classification; an override must select a different classification and record a reason.
- Status changes follow an explicit transition map and require a note.
- One internal inspection request can be created per lead with reason, triggers, and optional preferred date.
- Requested inspections can be scheduled or cancelled; scheduled inspections can be rescheduled, completed, or cancelled.
- Scheduling requires a time and assigned technical name; completion requires technical notes.
- POC route checks reject a client-declared customer-support role from marking quotation readiness or completing a technical inspection.
- Workflow changes append activity-history entries.

## Data and contracts

The lead stores reviewed classification, decision, reason, reviewer display name/time, confirmed triggers, and operational status. The inspection record stores state, reason, triggers, preference, schedule, assigned name, notes, and request attribution. Contracts are defined in [`lead.schemas.ts`](../../backend/src/modules/leads/lead.schemas.ts) and [`lead.routes.ts`](../../backend/src/modules/leads/lead.routes.ts).

## Safety, privacy, and authorization

All classifications remain preliminary. Site conditions, LPG/fire safety, feasibility, inspection findings, and formal quotation readiness require qualified human review. Current actor names and roles arrive from the client, so the role prohibitions demonstrate intended workflow but are not trusted authorization.

## Failure, retry, and recovery

Invalid inputs return validation errors; disallowed or repeated transitions and duplicate inspection requests return conflicts; missing records return not-found responses. Workflow state changes and their activity entries are separate writes rather than one transaction.

## Known limitations and deferred work

- There is no authenticated session, stable staff identifier, or authoritative role lookup.
- The final role-permission matrix still requires business approval.
- Inspection creation and scheduling update lead status outside the direct-status transition policy, and cancelling an inspection does not reconcile the lead's status.
- Multi-write operations are not atomic and concurrent transition behavior lacks automated coverage.
- Notifications, customer scheduling links, reopen operations, and formal quotation generation are deferred.

## Validation evidence

- 2026-10-08 — workflow UI, API schemas/routes, transition rules, database schema/migration, and roadmap evidence reviewed; no new runtime test was run for this documentation-only change.
- The roadmap reports browser/API verification of classification review, controlled transitions, inspection creation/scheduling/completion, role prohibitions, and activity history for Wiring Milestone 6.

## Evidence and related documents

- [`LeadRecord.tsx`](../../frontend/src/app/dashboard/leads/%5BleadId%5D/LeadRecord.tsx)
- [`lead.routes.ts`](../../backend/src/modules/leads/lead.routes.ts)
- [`backend/drizzle/0002_thankful_bill_hollister.sql`](../../backend/drizzle/0002_thankful_bill_hollister.sql)
- [Project blueprint](../../PROJECT_BLUEPRINT.md)
- [Implementation log](../implementation-log.md)
