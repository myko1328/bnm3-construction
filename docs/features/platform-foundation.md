# Platform and persistence foundation

[Back to feature catalog](README.md)

The workspace runs a Next.js frontend and a shared TypeScript Express API backed by Neon PostgreSQL through Drizzle ORM.

| Field | Value |
| --- | --- |
| Implementation status | Implemented POC |
| Operational readiness | Not production-ready |
| Roadmap milestone | [**Wiring Milestone 0 — Monorepo and backend foundation** and **Wiring Milestone 1 — Neon environment and database verification**](../../PROJECT_BLUEPRINT.md#backend-wiring-milestones--current-implementation-sequence) |
| Audience | Developers and operators |
| Entry points | Root workspace commands; `/health`; `/ready`; `/api/v1/leads` |
| Last verified | 2026-10-08 |

## User outcome

Developers can run the frontend and API together, validate service health, and persist the lead-management proof of concept in PostgreSQL rather than browser-only mock data.

## Current behavior

- The pnpm workspace provides combined and package-specific development, lint, type-check, and build commands.
- The Express application is shared by Node.js and Cloudflare Worker entry points.
- `/health` reports process health and `/ready` checks database connectivity.
- Drizzle schema and generated migrations define leads, activity entries, call records, qualification review fields, and site-inspection requests.
- The roadmap reports that a non-production Neon migration and API create/read check completed for Wiring Milestone 1. That external database state is not reproduced by this documentation review.

## Data and contracts

The lead record stores customer contact and location data, submitted answers, an optional estimate snapshot, classification evidence, workflow state, and consent time. Related tables hold activity history, one call record per lead, and one site-inspection request per lead.

See [`backend/src/db/schema.ts`](../../backend/src/db/schema.ts), [`backend/src/app.ts`](../../backend/src/app.ts), and [`README.md`](../../README.md).

## Safety, privacy, and authorization

The database contains sensitive customer and operational data. Staff authentication, trusted identity, retention/deletion controls, structured redacted logging, rate limiting, monitoring, backups, and production recovery checks remain part of Wiring Milestone 7.

## Failure, retry, and recovery

Environment configuration is validated at startup, readiness returns a service-unavailable response when the database cannot be reached, and API errors are sanitized at the shared handler. Several business mutations and their activity entries are separate writes rather than one transaction, so partial persistence remains possible.

## Known limitations and deferred work

- The staff-facing API is unauthenticated.
- The public create schema accepts `manual` as a client-supplied source even though assessment and estimator are the intended public intake sources.
- Public intake does not yet have production abuse controls or durable server-enforced idempotency.
- Production deployment and production database validation are not authorized by this documentation baseline.
- Automated backend behavioral tests are not configured.

## Validation evidence

- 2026-10-08 — repository code, schema, generated migrations, scripts, and roadmap evidence reviewed; no runtime or database command was run for this documentation-only change.
- The milestone-specific runtime evidence is roadmap-reported in [`PROJECT_BLUEPRINT.md`](../../PROJECT_BLUEPRINT.md).

## Evidence and related documents

- [`package.json`](../../package.json)
- [`backend/src/app.ts`](../../backend/src/app.ts)
- [`backend/src/db/schema.ts`](../../backend/src/db/schema.ts)
- [`backend/drizzle`](../../backend/drizzle)
- [Implementation log](../implementation-log.md)
