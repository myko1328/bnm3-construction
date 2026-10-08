# Backend agent instructions

## Scope and architecture

- This package is a TypeScript ESM Express API shared by the Node entrypoint in `src/server.ts` and the Cloudflare Worker entrypoint in `src/worker.ts`. Keep shared changes compatible with both runtimes.
- Preserve explicit `.js` suffixes in relative TypeScript imports under the current NodeNext/ESM configuration.
- Validate request params, query strings, and bodies at the route boundary with Zod schemas. Keep validation enums, Drizzle enums, state-transition rules, frontend types, and response contracts synchronized.
- Use consistent HTTP semantics: malformed input is `400`, unauthenticated is `401`, forbidden is `403`, missing resources are `404`, invalid state conflicts are `409`, and unexpected failures return sanitized `5xx` responses.

## Authentication, authorization, and privacy

- Treat all client input as untrusted. Derive staff identity and role only from a verified server-side session or cryptographically verified identity-provider claim; never authorize from `actorName`, `actorRole`, frontend state, or a client-controlled header.
- The customer lead-intake endpoint `POST /api/v1/leads` is the intentional public mutation unless the product contract changes; protect it with validation and abuse controls. Treat all staff-facing reads and mutations as authenticated.
- Centralize the permission model. Customer-support personnel must not declare quotation readiness, approve technical feasibility, or complete a technical site inspection.
- Do not invent the final role-permission matrix. Preserve documented prohibitions, and surface unresolved access or mutation permissions for business approval before encoding them.
- CORS is not authentication. In production, use exact allowed origins in addition to server-side authorization.
- Configure explicit JSON payload limits, security headers, endpoint-appropriate rate limits, and structured redacted logging when hardening the service.
- Production rate limiting must work across Cloudflare Worker isolates; do not rely on process-local in-memory counters as the enforcement boundary.
- Never log credentials, tokens, connection strings, raw request bodies, lead answers, addresses, or customer contact details. Do not expose internal exception details to clients.
- Treat `/ready` as operational information; minimize or restrict it appropriately in production.

## Domain and persistence

- Keep automated qualification preliminary and explainable. Safety concerns, unusual site conditions, and technical feasibility remain subject to qualified human review.
- Preserve controlled lead and inspection state transitions. Record every meaningful staff mutation in activity/audit history using identity from the trusted session.
- Make security- and audit-critical multi-write operations atomic so business state and its audit event cannot diverge.
- Store schema changes in `src/db/schema.ts`, then run `pnpm --filter backend db:generate` and inspect the generated SQL and metadata. Commit schema and migration artifacts together.
- Never edit an applied migration. Review destructive changes, enum evolution, backfill and nullability order, indexes, foreign keys, cascades, and recovery before migration.
- Do not run `db:migrate`, Drizzle Studio, or deployment commands unless the operation is in scope and the exact target is identified. Use non-production targets by default; production mutation requires an explicit user request and target verification.
- Do not rely on `drizzle.config.ts`'s placeholder `DATABASE_URL` fallback as proof that a migration target is configured. Inspect the effective target without printing credentials.
- Use timezone-aware database timestamps and database time for persisted mutations where consistency matters.

## Validation

- Run `pnpm --filter backend typecheck` and `pnpm --filter backend build` for backend code changes. The current backend `lint` script is also TypeScript validation, not source linting.
- Use `pnpm --filter backend dev` to verify Node behavior and `pnpm --filter backend dev:worker` when shared runtime or Worker behavior changes.
- After Worker binding or configuration changes, run `pnpm --filter backend cf-typegen` and review the generated types.
- For API behavior, exercise valid, malformed, unauthenticated, forbidden, not-found, invalid-transition, duplicate/retry, and database-failure paths as relevant. Confirm responses and logs do not leak sensitive data.
- For authentication work, prove that internal reads and mutations reject anonymous users, each role's allow/deny rules hold, payload identity cannot be spoofed, public lead intake still works with abuse controls, and audit attribution comes from the trusted identity.
- When a route performs a business mutation plus an activity insert, verify rollback and atomicity. Where the approved schema supports it, record a stable staff identifier in addition to display text.
- No backend automated-test script is currently configured. Security-critical work should introduce focused tests as part of its approved scope; otherwise document exact manual or integration verification without claiming automated coverage.
- Do not run `pnpm --filter backend deploy` unless deployment is explicitly requested.
