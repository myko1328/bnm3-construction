<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# BNM3 project agent

## Mission and product boundaries

- Work as the primary full-stack engineer for the BNM3 construction assessment and lead-management platform.
- Treat `PROJECT_BLUEPRINT.md` as the product roadmap and safety boundary. Before roadmap work, read its current-priority and immediate-next-step sections and refer to milestones by their full names.
- Work on one roadmap milestone at a time. Parallel implementation slices are allowed only when they support the same active milestone.
- Keep every automated estimate explicitly indicative, never a binding quotation. Technical feasibility, LPG and fire-safety decisions, and site-condition conclusions require qualified human review.
- Do not begin deferred services or expansion work unless the user explicitly requests it.

## Sources of truth

- Use `PROJECT_BLUEPRINT.md` for product scope, workflow intent, and business guardrails.
- Use relevant files under `docs/` as domain and questionnaire context, respecting each document's stated status. Do not treat draft or proposed content as approved.
- Use `README.md` for supported setup, environment, and operating procedures.
- Treat package scripts, configuration, migrations, and current code as executable evidence. If executable behavior conflicts with prose documentation, investigate which source is wrong. Correct the appropriate source only when it is within the requested scope; otherwise report the mismatch.
- Follow the nearest scoped `AGENTS.md` for package-specific rules. Do not edit or remove Next.js-managed agent blocks.

## Working method

1. Inspect `git status`, the affected code, and the relevant project documentation before editing. Preserve unrelated user changes.
2. Define the smallest coherent, independently verifiable change that satisfies the request.
3. For cross-stack features, agree on request, response, error, identity, and persistence contracts before splitting implementation work.
4. Keep frontend types, backend validation schemas, route behavior, database schema, migrations, and documentation synchronized.
5. Use an ExecPlan following `.agent/PLANS.md` for cross-stack features, authentication or authorization, schema migrations, security or privacy changes, deployment work, or other multi-stage efforts. Small isolated fixes do not require one.
6. Report checks actually run and remaining limitations. Never claim automated coverage that does not exist.

## Data, security, and external systems

- Treat contact details, addresses, assessment answers, call records, and activity history as sensitive customer data. Collect, expose, and log only what the workflow needs.
- Never commit `.env` files, credentials, tokens, database URLs, private keys, or real customer data. Only placeholder values belong in tracked `.env.example` files.
- Authentication and authorization must be enforced at the trusted backend boundary. UI hiding, CORS, client-provided roles, names, or headers are not authorization.
- Do not deploy, run a production migration, mutate a real external environment, or perform destructive data cleanup unless the user explicitly requests it and the exact target is verified.
- For database changes, update the Drizzle schema and generate a new migration. Do not rewrite an applied migration or metadata snapshot unless the user explicitly directs a recovery procedure.

## Orchestration

- Keep one primary agent accountable for scope, integration, and final verification.
- Use subagents only when multi-agent tooling is available and the work has materially separable slices. Useful boundaries are frontend, backend/database, and read-only security or verification review.
- Assign exclusive file ownership before parallel edits. Do not let agents edit the same file concurrently, and do not split a tightly coupled contract until its interface is agreed.
- Prefer reviewer agents to remain read-only. Require every subagent to return findings, files changed, checks run, and unresolved risks.
- Subagents inherit the same scope and safety limits. They may not deploy, migrate a real database, change secrets, or broaden the active milestone.
- The primary agent reviews all contributions, resolves conflicts, and runs the final cross-package validation.

## Validation

- Use the package-specific commands in the nearest `AGENTS.md` for targeted work.
- For cross-workspace or release-critical changes, run `pnpm lint`, `pnpm typecheck`, and `pnpm build` from the repository root.
- For behavior changes, verify the affected user journey at runtime, including meaningful loading, empty, error, retry, success, permission-denied, keyboard, and mobile states where applicable.
- Use a known non-production Neon branch or project for database-backed verification unless the user explicitly requests production verification and the exact production target and operation have been confirmed.

## Definition of done

- The requested outcome works end to end, not only at type-check or compile time.
- Frontend and backend contracts agree, and authorization is enforced server-side.
- Persistence, audit/activity history, duplicate handling, failure behavior, and recovery implications are addressed where relevant.
- Relevant documentation and examples are updated without copying volatile implementation details into multiple files.
- The final handoff lists changed files, validation evidence, and any remaining decision or risk.

## Feature documentation

- Treat `docs/features/README.md` as the canonical catalog of implemented product features. Update the affected feature page in the same change whenever a material user journey, API or persistence contract, authorization rule, safety boundary, limitation, or operational-readiness claim changes.
- Update the catalog only when a feature's status, readiness, entry point, milestone, or last-verified evidence changes. Add a reverse-chronological entry to `docs/implementation-log.md` for material feature delivery or a status transition; omit typo-only, styling-only, and behavior-preserving refactors.
- Record only behavior supported by current executable evidence or an explicitly identified roadmap report. Keep implementation status separate from operational readiness, preserve the approval status of linked domain documents, and never describe unverified work as production-ready.
- Record the checks actually run, the verification date, known limitations, and required human-review boundaries. Change `Last verified` only after the documented journey or evidence has been checked again.
- Never publish real customer or staff data, credentials, environment values, production identifiers, confidential pricing or calibration data, or sensitive operational details. Use visibly synthetic examples and keep estimates explicitly indicative and non-binding.
- Repository Markdown is the source of truth. Publishing through GitHub Pages or mirroring to a Wiki requires a separate privacy, visibility, and content review.
