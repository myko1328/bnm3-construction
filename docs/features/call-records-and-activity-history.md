# Call records and activity history

[Back to feature catalog](README.md)

Staff can save, recover, finalize, and print a structured customer call record while consequential actions remain visible in the lead's activity history.

| Field | Value |
| --- | --- |
| Implementation status | Implemented POC |
| Operational readiness | Not production-ready |
| Roadmap milestone | [**Wiring Milestone 5 — Persistent call record and activity history**](../../PROJECT_BLUEPRINT.md#wiring-milestone-5--persistent-call-record-and-activity-history) |
| Audience | Internal BNM3 staff and managers |
| Entry point | `/dashboard/leads/:id` |
| Last verified | 2026-10-08 |

## User outcome

Personnel can complete verification and next-action checklists, record customer responses, keep an overall call summary, save a draft to Neon, reopen it later, finalize it after required content is present, and print the draft or finalized record to PDF through the browser.

## Current behavior

- One persisted call record is associated with each lead.
- Draft saving records checklist state, comments, summary, update time, and displayed actor name.
- Finalization requires all designated checks, required comments, and a summary, then locks later edits.
- After a successful API response confirms that no persisted call record exists, an available browser backup is restored. A persisted record takes precedence and clears the backup; API read failure shows an error instead of restoring the backup.
- Manager follow-up questions and save/finalize actions append entries to activity history.
- Print-specific layout and document naming support browser PDF export.

## Data and contracts

Call records persist checklist maps, comment maps, summary, update attribution, and finalization attribution/timestamps. Activity entries persist a type, message, optional actor display name, metadata, and timestamp. See [`schema.ts`](../../backend/src/db/schema.ts) and [`lead.routes.ts`](../../backend/src/modules/leads/lead.routes.ts).

## Safety, privacy, and authorization

Call notes and activity history are sensitive operational records. Current actor names are client-supplied and routes are unauthenticated, so the history is useful POC traceability but not a security-grade audit log.

## Failure, retry, and recovery

Failed draft saves keep a local browser backup for a later successful load. Finalized records reject later edits. Business writes and activity inserts are currently separate database operations, so an interruption after the business write can leave the record changed without its matching activity entry.

## Known limitations and deferred work

- Trusted staff IDs, authentication, role checks, and tamper-resistant audit attribution are not implemented.
- Save/finalize plus activity insertion is not transactional.
- Concurrent finalization protection is not proven by an automated test.
- PDF output uses browser print behavior rather than a server-generated immutable artifact.

## Validation evidence

- 2026-10-08 — call-record UI, API contract, routes, persistence schema, migrations, and roadmap evidence reviewed; no new runtime test was run for this documentation-only change.
- The roadmap reports that a saved draft survived full page reload and restored checklist, comments, summary, and activity history for Wiring Milestone 5.

## Evidence and related documents

- [`LeadRecord.tsx`](../../frontend/src/app/dashboard/leads/%5BleadId%5D/LeadRecord.tsx)
- [`backend/drizzle/0001_abnormal_newton_destine.sql`](../../backend/drizzle/0001_abnormal_newton_destine.sql)
- [`lead.routes.ts`](../../backend/src/modules/leads/lead.routes.ts)
- [Implementation log](../implementation-log.md)
