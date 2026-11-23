# Building water-based fire sprinkler assessment

[Back to feature catalog](README.md)

A proof-of-concept customer assessment prepares a structured sprinkler-project brief, while a one-page estimator provides a tightly bounded planning quantity for simple inputs and routes safety- or design-sensitive work to qualified review.

| Field | Value |
| --- | --- |
| Implementation status | Implemented POC |
| Operational readiness | Not production-ready |
| Roadmap milestone | Current priority — Building fire sprinkler assessment and estimator POC in [`PROJECT_BLUEPRINT.md`](../../PROJECT_BLUEPRINT.md) |
| Audience | Customers and BNM3 technical/estimating staff |
| Entry points | `/assessment/fire-sprinkler`; `/tools/fire-sprinkler-budget-estimator`; existing lead dashboard |
| Last verified | 2026-10-12 |

## User outcome

The flow lets a customer describe a new, existing, altered, or maintenance-related building water-based fire sprinkler project without making engineering decisions. It identifies missing information and routes the request to technical review, site inspection, or priority human review. A separate one-page tool gives a non-binding initial sprinkler-head allowance for a narrow simple-new-building scenario at BNM3's user-directed ₱5,000 planning rate per head.

## Current behavior

- The first landing-page service opens a safety screen followed by exactly five grouped project questions: building use, requested work, floors, dimensions/area, and area condition.
- Active fire or uncontrolled discharge stops the commercial flow. A reported impairment or uncertain safety state can continue only as a priority-review lead and never receives an automated quantity.
- Project answers recover from browser storage; contact fields do not. Submission requires consent and returns the permanent reference from `POST /api/v1/leads`.
- The single-page estimator works anonymously, interprets dimensions or total protected area, and updates an initial indicative quote only for an eligible simple new-building input. It prices a per-floor-rounded count at the conservative 12.1 m²/head planning factor and ₱5,000/head, while also showing the 20.9 m² light-hazard reference and 4.6 m maximum-spacing context. Existing-building work, alterations, maintenance, complex uses, cold/special conditions, more than four floors, and invalid inputs suppress the amount.
- Both flows ask whether a **fire pump** is already installed for the building's fire-protection water supply. This customer answer is a review signal; it does not establish that the pump is suitable or required.
- Estimator contact capture is optional and explicit. It creates a lead only after the visitor requests BNM3 pricing review and consents.
- The existing dashboard, call record, activity, qualification, status, and site-inspection workflows are reused. Sprinkler leads receive service-aware summaries, verification items, reason labels, and inspection triggers.

## Data and contracts

Sprinkler leads use the existing generic persistence contract with `project.service = "Building water-based fire sprinkler system"`, `source = assessment | estimator`, and `answers.questionnaireVersion = "fire-sprinkler-v2"`. The JSON answer snapshot records customer-observed facts, reported fire-pump state, and, for estimator opt-ins, the immutable `sprinkler-initial-quote-v2` configuration. Eligible opt-ins also store the PHP estimate snapshot and its per-head/exclusion assumptions. No database migration was required.

## Safety, privacy, and authorization

The flow does not choose the governing standard, approve occupancy/hazard classification, perform hydraulic design, certify compliance, or issue a binding quotation. The area-based quantity is not a layout or required head count. Qualified reviewers must confirm system type, water supply, site conditions, applicable rules, final quantities, and pricing.

Building plans, system locations, exact addresses, inspection reports, water-supply data, and contact details are sensitive. This POC collects coarse location and no uploads. Real customer use remains blocked on approved privacy controls and server-enforced staff authentication/authorization.

## Failure, retry, and recovery

The browser keeps non-contact project inputs and a confirmed lead reference so refresh does not immediately resubmit from that device. API failures remain on the form for correction and retry. The backend still lacks durable idempotency and duplicate linking, so cross-device or repeated submissions can create separate leads.

## Known limitations and deferred work

- Technical and estimating owners still need to approve launch terminology, routing triggers, emergency/impairment operations, service areas, and response time.
- The user approved a ₱5,000/head POC planning rate, but this is not a complete or calibrated system price book. It excludes pipework, valves, fire pump/controller, tank, electrical work, testing, design, permits, taxes, and other project costs.
- The planning envelope is a transparent POC aid derived from cited context-specific coverage examples, not a universal spacing rule or design basis.
- Durable server idempotency, duplicate handling, uploads, transactionality, and authenticated staff access remain incomplete.
- **Wiring Milestone 7 — Authentication, permissions, and production hardening** remains required before real customer or production use.

## Validation evidence

- `2026-10-12` — Frontend lint, type-check, and production build passed with both sprinkler routes generated.
- `2026-10-12` — Backend type-check and production build passed; the local development backend's `/ready` check reported its configured database connected and malformed lead input returned HTTP 400.
- `2026-10-12` — Browser smoke covered the complete five-question path through contact, live 20 m × 10 m planning output, existing-building suppression, narrow/mobile layout, and browser warnings/errors; no lead was submitted during this smoke check.
- `2026-10-12` — Re-verified the estimator after adding the ₱5,000/head initial allowance, 12.1 m²/head pricing count, 4.6 m spacing context, and existing-fire-pump question.
- `2026-10-12` — Requirements were reviewed against cited BFP and NFPA primary sources, including system-type and sprinkler-coverage boundaries.

## Evidence and related documents

- [Assessment and estimator requirements](../water-based-fire-sprinkler-assessment-requirements.md)
- [Public website and flow preview](public-website-and-flow-preview.md)
- [Roadmap](../../PROJECT_BLUEPRINT.md)
- [Implementation log](../implementation-log.md)
