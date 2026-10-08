# Residential LPG assessment instructions

## Product source and outcome

- Use `docs/residential-lpg-funnel-question-analysis.md` as the approved proof-of-concept research direction. Its approval does not approve customer-facing emergency wording, service areas, response-time promises, or pricing rules; those require the BNM3 decisions identified in that document.
- Keep the assessment outcome to an estimator-ready scope summary, preliminary classification, missing-information list, and recommended next step. Never present it as a quotation, engineering design, compliance approval, or confirmed site appointment.
- Include a question only when it affects scope, risk, scheduling, price inputs, qualification, or follow-up. Explain technical questions in plain language.

## Safety and conditional flow

- An active or uncertain leak must stop the assessment and quotation path and route the customer to BNM3-approved emergency guidance or direct assistance. Never encourage testing, dismantling, repair, or troubleshooting.
- Route multi-unit, mixed-use, centralized or manifold supply, difficult or concealed routing, unsafe or unclear cylinder placement, and existing damage, corrosion, modification, or leakage to technical review or a site visit rather than a standard result.
- Let customers continue when appliance ratings, photos, measurements, or technical terminology are unknown. Treat `Not sure` as valid input, record what remains missing, and lower confidence or require review instead of forcing a guess.
- Keep the common path short and conditional. When an earlier answer changes, remove or ignore answers from branches that are no longer active so stale data cannot affect classification or submission.
- Collect only the location detail needed for intake. Do not require an exact street address until BNM3 needs it for site scheduling.

## Shared estimator implementation

- `residential-lpg/LpgAssessment.tsx` also implements the budget-estimator mode used by `frontend/src/app/tools/lpg-budget-estimator/page.tsx`. When changing estimator behavior here, also read `frontend/src/app/tools/AGENTS.md` and preserve its anonymous-use, pricing, opt-in, snapshot, and verification boundaries.
- Treat `docs/residential-lpg-estimating-spec.md` as a draft. Do not interpret its proposed rates, percentages, service zones, timing promises, or thresholds as approved production policy.

## Verification

- For assessment changes, verify the emergency exit, conditional branches, back-and-forward edits, no-photo and unknown-answer paths, classification and missing-information output, consent, pending state, retry, duplicate prevention, and refresh recovery.
- Verify keyboard and screen-reader use and the complete common path at a 320 px viewport.
- If code and the approved funnel direction differ, do not silently expand scope. Fix the mismatch only when requested; otherwise report it clearly.
