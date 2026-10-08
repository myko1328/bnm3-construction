# Feature name

[Back to feature catalog](README.md)

One sentence describing the user or operator outcome.

| Field | Value |
| --- | --- |
| Implementation status | Planned, Partially implemented, Implemented POC, or Deferred |
| Operational readiness | Not production-ready or Production-ready |
| Roadmap milestone | Use the full milestone name and link to `PROJECT_BLUEPRINT.md` |
| Audience | Customer, staff role, developer, or operator |
| Entry points | Routes, commands, or surfaces |
| Last verified | YYYY-MM-DD; update only after checking the evidence below |

## User outcome

Describe the observable journey and why it exists. Do not copy component structure.

## Current behavior

- Describe implemented behavior only.
- Distinguish code evidence from roadmap-reported runtime evidence.
- Keep estimates, classifications, and technical decisions within their human-review boundaries.

## Data and contracts

Summarize important API and persistence facts. Link to canonical code rather than duplicating volatile schemas or exhaustive route definitions.

## Safety, privacy, and authorization

Identify sensitive data, trusted boundaries, human-review requirements, and current authorization limitations. Do not include real customer or staff information, secrets, production identifiers, confidential prices, or actionable exploit details.

## Failure, retry, and recovery

Record the user-visible failure behavior, retry or duplicate handling, persistence/recovery behavior, and any known non-atomic operations.

## Known limitations and deferred work

List material gaps plainly. Preserve the `Draft`, `Proposed`, or `Approved` status of related source documents.

## Validation evidence

- `YYYY-MM-DD` — exact automated commands run, with results.
- `YYYY-MM-DD` — exact manual journey and non-production environment used.
- If no behavioral test exists, say so explicitly.

## Evidence and related documents

- Link to the most relevant code, schema/migration, roadmap section, domain document, and implementation-log entry.
