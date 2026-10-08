# LPG budget-estimator instructions

## Implementation boundary

- This subtree currently contains the estimator route wrapper and metadata. The estimator state, calculation, consent, submission, and persistence logic live in `frontend/src/app/assessment/residential-lpg/LpgAssessment.tsx`.
- Do not duplicate the estimator implementation in the route wrapper. For estimator behavior changes, read and apply both this file and `frontend/src/app/assessment/AGENTS.md` to the shared component.

## Pricing and customer boundary

- Treat `docs/residential-lpg-estimating-spec.md` as a draft for family and estimator review. Do not activate proposed rates, percentage bands, service zones, response times, site-visit thresholds, or calculation rules without explicit BNM3 approval.
- Keep the estimator an optional planning aid with transparent low/high ranges and visible assumptions. Never label its output a formal quotation, engineering approval, code-compliance result, or confirmed scope.
- When approved pricing is implemented, keep calculations deterministic and auditable. Store rates in a versioned price book rather than route or component code, and persist the price-book and calculation-rule versions with every estimate.
- Do not show an automated price for an emergency or for any site-visit trigger, service-area exclusion, or minimum-confidence threshold that BNM3 has approved. Until those policies are approved, keep affected results explicitly illustrative and route uncertainty to technical review rather than presenting it as an approved eligibility decision.
- After contact opt-in and consent, persist the exact submitted configuration, range, assumptions, intent, and consent timestamp as an immutable snapshot.

## Verification

- For estimator changes, verify anonymous adjustment and exit, `Not sure` inputs, calculation boundaries, approved review or price-suppression behavior, opt-in cancellation, and submitted-snapshot immutability.
- Verify the route metadata and direct-entry estimator mode independently from the assessment-first journey.
