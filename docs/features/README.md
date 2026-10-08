# BNM3 feature catalog

This catalog is the canonical index of implemented product behavior. It describes what the repository currently supports, where the evidence lives, what has actually been verified, and what still prevents operational use. The roadmap remains in [`PROJECT_BLUEPRINT.md`](../../PROJECT_BLUEPRINT.md).

## Status vocabulary

Implementation status and operational readiness are separate:

- **Implemented POC** — the described end-to-end proof-of-concept behavior exists in the repository.
- **Partially implemented** — useful behavior exists, but a material part of the stated journey or acceptance criteria is missing.
- **Planned** — roadmap intent only; do not describe it as available.
- **Deferred** — intentionally outside the current active scope.
- **Not production-ready** — the feature lacks one or more approved security, privacy, recovery, monitoring, policy, or production-validation controls.
- **Production-ready** — all applicable operational controls have been implemented and verified. No current feature has this designation.

## Current features

| Feature | Audience and entry point | Implementation | Operational readiness | Roadmap evidence | Last verified |
| --- | --- | --- | --- | --- | --- |
| [Public website and flow preview](public-website-and-flow-preview.md) | Customers and stakeholders; `/` and `/blueprint/customer-flow` | Partially implemented | Not production-ready | Product **Milestone 1 — Brand, landing page, and information architecture** | 2026-10-08 |
| [Platform and persistence foundation](platform-foundation.md) | Developers and operators; workspace and API | Implemented POC | Not production-ready | **Wiring Milestone 0 — Monorepo and backend foundation**; **Wiring Milestone 1 — Neon environment and database verification** | 2026-10-08 |
| [Residential LPG assessment](residential-lpg-assessment.md) | Customers; `/assessment/residential-lpg` | Implemented POC | Not production-ready | **Wiring Milestone 2 — Assessment submission to Neon** | 2026-10-08 |
| [Indicative LPG budget estimator](indicative-lpg-budget-estimator.md) | Customers; `/tools/lpg-budget-estimator` | Implemented POC | Not production-ready | **Wiring Milestone 3 — Estimator opt-in lead capture** | 2026-10-08 |
| [Lead dashboard](lead-dashboard.md) | Staff; `/dashboard` and `/dashboard/leads/:id` | Implemented POC | Not production-ready | **Wiring Milestone 4 — Dashboard reads live leads** | 2026-10-08 |
| [Call records and activity history](call-records-and-activity-history.md) | Staff; lead detail record | Implemented POC | Not production-ready | **Wiring Milestone 5 — Persistent call record and activity history** | 2026-10-08 |
| [Qualification and site-inspection workflow](qualification-and-site-inspection.md) | Staff; lead detail workflow | Implemented POC | Not production-ready | **Wiring Milestone 6 — Qualification and site-inspection workflow** | 2026-10-08 |

The immediate next roadmap step is **Wiring Milestone 7 — Authentication, permissions, and production hardening**. Until it is completed and validated, internal records and mutations must not be treated as securely protected production operations.

## Evidence policy

- Executable code, schema, migrations, and package commands establish what is present in the repository.
- The blueprint can record runtime or database verification that cannot be reproduced by a documentation-only review. Pages label that evidence as roadmap-reported.
- `Last verified` changes only when the relevant source or journey is checked again; a documentation edit alone does not prove runtime behavior.
- Estimates remain indicative and non-binding. Preliminary classification, site conditions, LPG safety, technical feasibility, and quotation readiness require qualified human review.

Use [`feature-page-template.md`](feature-page-template.md) for a new feature page and record material deliveries in the [implementation log](../implementation-log.md).

## Publication boundary

These contributor documents include internal workflow and readiness details. A future GitHub Pages site must use an explicit public-content allowlist or a separate publish source; do not publish the whole `docs/` directory by default. Repository Markdown remains canonical, and confidential internal material does not belong in this public repository.
