# Feature documentation system

## Goal and observable outcome

Create a repository-native documentation system that lets a contributor or stakeholder see which BNM3 features are implemented, how each feature behaves, how it was verified, and which limitations still prevent production use. The result is observable through a linked feature catalog under `docs/features/`, an implementation log, and contributor rules that require material implementation work to keep those records current.

## Scope and non-goals

This plan implements the user's request for ongoing implementation documentation. It supports the completed **Wiring Milestone 0 — Monorepo and backend foundation** through **Wiring Milestone 6 — Qualification and site-inspection workflow** and accurately identifies **Wiring Milestone 7 — Authentication, permissions, and production hardening** as the immediate next step.

Included:

- Inventory implemented behavior from code, migrations, and current project documentation.
- Add a feature catalog, reusable feature-page template, initial feature pages, and chronological implementation log.
- Link the documentation entry points from `README.md`.
- Add maintenance rules to the root `AGENTS.md` so future material changes update the documentation.
- Design the content so it could later be rendered by GitHub Pages without making publication a requirement.

Not included:

- GitHub Pages, Wiki, or other hosting setup or deployment.
- Application behavior, schema, migration, dependency, or environment changes.
- Starting **Wiring Milestone 7 — Authentication, permissions, and production hardening**.
- Claiming production readiness or reconstructing dates and validation evidence that the repository does not establish.

## Current behavior and evidence

Before this change:

- `PROJECT_BLUEPRINT.md` records Wiring Milestones 0 through 6 as implemented or completed and names Wiring Milestone 7 as the immediate next step.
- `README.md` documents workspace setup and a partial endpoint table but has no central feature documentation entry point.
- `docs/residential-lpg-estimating-spec.md` and `docs/residential-lpg-funnel-question-analysis.md` provide domain context; their stated approval status must remain visible.
- Frontend implementations are under `frontend/src/app/assessment`, `frontend/src/app/tools`, and `frontend/src/app/dashboard`.
- Backend behavior and persistence contracts are under `backend/src/modules/leads`, `backend/src/db/schema.ts`, and generated migrations under `backend/drizzle`.
- The repository had no `docs/features/` catalog, reusable feature documentation template, or implementation log.

After this change, `docs/features/README.md`, `docs/features/feature-page-template.md`, seven initial feature pages, and `docs/implementation-log.md` provide those entry points. `README.md` links them, and `AGENTS.md` requires future material implementation work to keep them current.

## Interfaces and ownership

This is a documentation-only change. No runtime request, response, identity, authorization, or persistence contract changes.

- Primary agent: owns the ExecPlan, all file edits, integration, and final validation.
- Feature inventory subagent: read-only inspection of implemented behavior, routes, persistence, and limitations.
- Documentation-structure subagent: read-only proposal for catalog, page template, implementation log, and README navigation.
- Publication-safety subagent: read-only privacy, accuracy, GitHub Pages/Wiki, and future-maintenance review.

Only the primary agent edits files, preventing concurrent ownership conflicts.

## Implementation stages

1. Inventory current features and compare executable evidence with roadmap statements.
2. Define status vocabulary and the minimal reusable feature-page contract.
3. Add the catalog, template, initial feature pages, and implementation log.
4. Link the documentation from `README.md` and add maintenance requirements to `AGENTS.md`.
5. Review the integrated result for accuracy, privacy, broken links, and publishing suitability.
6. Run documentation validation and record outcomes.

## Security, data, and recovery

Documentation must contain no credentials, connection strings, real customer data, production identifiers, or sensitive operational details. Example identifiers must be visibly synthetic. Public-facing suitability does not authorize publication: configuring GitHub Pages, changing repository visibility, or publishing a Wiki requires a separate user request and repository-specific review.

All changes are additive Markdown edits and can be recovered through Git history or reverted file by file. No external systems or databases are mutated.

## Validation and acceptance

- Confirm every documented feature and limitation against code, schema/migrations, or explicitly labeled roadmap evidence.
- Confirm all repository-relative Markdown links resolve to existing files or anchors where practical.
- Run `git diff --check` and an equivalent whitespace check that includes untracked documentation.
- Confirm Next.js-managed blocks in all affected `AGENTS.md` files remain unchanged.
- Have read-only subagents review the integrated documentation for accuracy, structure, and publication risk.
- Application lint, type-check, build, and runtime journeys are not required because runtime code and configuration do not change.

Acceptance requires a discoverable catalog, consistent status labels, reusable template, initial truthful feature pages, an implementation log, and explicit future-update rules.

## Progress

- [x] 2026-10-08T22:48:46+08:00 — Read root instructions, plan format, blueprint priorities, README, and current documentation inventory.
- [x] 2026-10-08T22:48:46+08:00 — Created this ExecPlan and assigned non-overlapping read-only review responsibilities.
- [x] 2026-10-08T22:54:00+08:00 — Inventoried implemented features and limitations against frontend code, backend routes/schema/migrations, Git history, and roadmap evidence.
- [x] 2026-10-08T22:55:00+08:00 — Added and linked the catalog, template, seven feature pages, implementation log, contributor maintenance rules, and corrected roadmap/README summaries.
- [x] 2026-10-08T22:57:00+08:00 — Completed independent accuracy, documentation-architecture, and publication-safety reviews; corrected overclaims, history attribution, public identifiers, recovery wording, and publishing boundaries.
- [x] 2026-10-08T22:58:10+08:00 — Ran final local-link, tracked and untracked whitespace, managed-block, identifier, and diff validation; no failures remained.

## Decisions and discoveries

- 2026-10-08: Repository Markdown is the canonical documentation source. It remains versioned with code, works in pull-request review, and can later feed GitHub Pages.
- 2026-10-08: GitHub Wiki is not the canonical source because its separate history can drift from implementation changes.
- 2026-10-08: Publication is deferred. The user asked to orchestrate the documentation system first, and publication has separate visibility and privacy implications.
- 2026-10-08: Initial feature pages will group behavior by user workflow rather than mirror every component or API route.
- 2026-10-08: Implementation status and operational readiness are separate so an implemented POC is not mistaken for a production-ready system.
- 2026-10-08: The repository is public. Contributor documentation therefore excludes real test references and confidential data, while any future customer-facing Pages site must use an explicit content allowlist rather than publish the full `docs/` tree.
- 2026-10-08: Source inspection found material POC gaps that the feature pages now state directly, including missing assessment safety/routing stages, browser-local duplicate handling, unauthenticated client-supplied staff identity, non-transactional activity writes, and unapproved estimator pricing.
- 2026-10-08: The integrated review found the visual customer-flow page still contains stale browser-only and future-stage copy. It remains documented as a limitation because changing application content is outside this documentation-only plan.

## Outcomes and remaining risks

The repository now has a linked and maintainable feature-documentation system covering the public website, platform foundation, assessment, estimator, dashboard, call records, activity history, qualification, and inspections. The blueprint's priority summary and README's migration/API guidance now match the connected POC while placing the production warning before deployment commands.

Validation completed on 2026-10-08:

- `git diff --check` passed.
- A trailing-whitespace scan covering tracked changes and all new documentation passed.
- Every local Markdown link target in `README.md`, `PROJECT_BLUEPRINT.md`, `docs/`, and `.agent/` resolved.
- No changed line in the Next.js-managed `AGENTS.md` blocks was detected.
- A targeted documentation scan found no credentials, private keys, real-looking lead references, UUIDs, or confidential numeric prices.
- Three read-only subagents completed feature-accuracy, documentation-architecture, and publication-safety review; their actionable findings were resolved.

No application lint, type-check, build, browser, API, or database journey was run because runtime code and configuration did not change. Feature pages clearly distinguish repository inspection from prior roadmap-reported runtime evidence.

Remaining risks are the documented POC limitations, the stale `/blueprint/customer-flow` application copy, and the undecided audience/build strategy for any future GitHub Pages site. Publication, deployment, and Wiring Milestone 7 remain separate work requiring explicit scope.
