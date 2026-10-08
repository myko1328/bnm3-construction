# BNM3 execution plans

An ExecPlan is a living implementation document for work that is too broad or risky to manage as an informal checklist. Use one for cross-stack features, authentication or authorization, database schema or migration work, security or privacy changes, deployment work, or any effort with multiple independently reviewable stages. Small isolated fixes do not need an ExecPlan.

Store task-specific plans under `.agent/plans/<short-descriptive-name>.md`. A plan must be self-contained enough for a new contributor to continue from the repository and the plan alone. Keep it concise, update it as facts change, and never include credentials, connection strings, tokens, or real customer information.

## Required sections

### Goal and observable outcome

Explain why the change matters, what a user or operator can do afterward, and how they can observe that it works.

### Scope and non-goals

Name the active blueprint milestone or user request, the included behavior, and the nearby work that is intentionally deferred. A plan does not authorize work outside the user's request.

### Current behavior and evidence

Describe the relevant architecture and current behavior using repository-relative file paths, commands, and short evidence. Distinguish implemented behavior from roadmap intent.

### Interfaces and ownership

Define request and response contracts, identity and authorization boundaries, persistence changes, and affected files. If subagents are used, assign non-overlapping file ownership and identify read-only reviewers. Keep one primary agent responsible for integration.

### Implementation stages

List ordered, independently verifiable stages. Keep work inside one active roadmap milestone, even when independent slices run in parallel. Each stage must leave the repository in a coherent state.

### Security, data, and recovery

Record trust boundaries, sensitive data handling, migration risks, failure modes, idempotency, rollback or safe retry steps, and any external systems involved. Explicitly state which operations require separate user authorization, including deployment and real-database mutation.

### Validation and acceptance

For every stage, name the exact commands and observable behavior that establish success. Include negative permission checks, error paths, runtime verification, and migration recovery where relevant. Do not substitute compilation for behavioral validation or claim tests the repository does not have.

### Progress

Maintain timestamped checkboxes for completed, active, and remaining work. Use ISO 8601 timestamps with an explicit offset. Record blockers precisely without erasing completed evidence.

### Decisions and discoveries

Record material decisions, assumptions, unexpected findings, and changes to the plan, including the rationale and date. Resolve contradictions across the document when a decision changes.

### Outcomes and remaining risks

At milestones and completion, compare the result with the stated goal, list validation evidence, and identify any deferred decision, operational follow-up, or residual risk.

## Execution rules

- Read the entire current plan before implementing or reviewing it.
- Update progress, decisions, discoveries, and validation evidence as work proceeds rather than reconstructing them afterward.
- Prefer reversible, additive changes. Never treat an ExecPlan as permission to deploy, migrate production, edit secrets, or delete data.
- When a plan changes materially, update all affected sections so it remains internally consistent and resumable.
