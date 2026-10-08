# Lead module agent instructions

## API boundary and identity

- Keep assessment and estimator submission through `POST /api/v1/leads` as the public customer-intake boundary. Treat all lead reads, call records, qualification reviews, manager questions, status changes, and site-inspection operations as authenticated staff actions. Before implementing `source: "manual"`, define whether it belongs on a separate authenticated staff flow or another explicitly approved contract; do not expose manual attribution publicly by accident.
- Derive the staff actor, stable staff identifier, and role from verified request authentication context. Do not accept or authorize `actorName`, `actorRole`, or equivalent identity fields from request bodies, query strings, or client-controlled headers.
- Apply authorization before returning lead data or performing a staff mutation. Enforce role restrictions in the backend even when the frontend hides or disables the action.

## Contracts and workflow rules

- Validate every route parameter, query, and body with `lead.schemas.ts`. Keep those schemas aligned with frontend API types, Drizzle enums, persisted JSON shapes, and route responses whenever a contract changes.
- Keep preliminary qualification deterministic, explainable, and non-binding. Preserve its reasons and inspection triggers; never interpret qualification as technical approval or a formal quotation.
- Maintain one canonical policy for lead and inspection transitions. Reject skipped, repeated, terminal-state, or prerequisite-violating transitions with `409`, and preserve the prohibition on customer-support personnel approving quotation readiness or completing a technical inspection.
- Preserve the contract's required reasons and notes for qualification overrides, status changes, inspection requests, and technical completion. Record enough context for management to reconstruct other consequential workflow decisions without inventing new required fields unless the product contract approves them.

## Persistence, audit, and duplicates

- Execute each business mutation and its activity event in one database transaction. This includes lead creation, call-record save or finalization, qualification review, status change, and site-inspection creation or update.
- Build audit attribution from trusted identity and record enough context to reconstruct the change, including stable actor identity, prior value, new value, reason, and timestamp where applicable.
- Make public lead creation safe to retry with a server-enforced idempotency mechanism or equivalent durable duplicate key. Repeated delivery of the same accepted submission must return the existing result instead of creating another lead.
- Treat unique-constraint and concurrent-update outcomes as expected conflicts. Return sanitized, stable responses; do not rely on read-then-write checks alone for uniqueness, finalization, or transition enforcement.
- Preserve immutable estimator snapshots and submitted assessment answers. Do not silently rewrite historical customer input when qualification or workflow state changes.

## Verification

- Exercise assessment and estimator creation, retry and idempotency, malformed payloads, consent handling, authenticated reads, anonymous and forbidden access, allowed and rejected transitions, finalized-record immutability, duplicate inspection requests, and missing-resource behavior.
- Verify transaction rollback when either the business write or activity insert fails, and test concurrent attempts at finalization, inspection creation, and status changes.
- Confirm API responses, activities, and logs expose no unnecessary contact details, addresses, assessment answers, credentials, or internal exception data.
