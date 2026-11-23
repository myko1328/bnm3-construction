# BOQ and letterhead document funnel

## Goal and observable outcome

Convert `/tools/bill-of-materials` into a three-step browser-only workflow. Personnel first prepare the BOQ, then enter quotation-letter details in a sidebar while viewing a live letter preview, and finally review/export a combined PDF whose first page is the letter and whose remaining pages are the BOQ.

## Scope and non-goals

This user-requested slice remains within **Milestone 0 — Business rules and estimating foundation**. It includes step navigation, letter fields, live preview, final ordering, combined printing, and synthetic test fixtures. It does not add authentication, persistence, customer records, approved pricing, signatures, email delivery, or formal quotation approval.

## Current behavior and evidence

`frontend/src/app/tools/bill-of-materials/BillOfMaterials.tsx` holds all worksheet state in React memory and prints the active BOQ with `window.print()`. `bill-of-materials.module.css` provides A4 print pagination and repeating table headers. `docs/features/bill-of-materials-worksheet.md` records the POC safety boundary. The supplied reference PDF is one US Letter page and is used only for visual hierarchy; its real people, contact details, customer information, and quoted amount are not copied into defaults.

## Interfaces and ownership

There are no API, database, identity, or persistence changes. The primary agent owns the component, its CSS module, feature documentation, implementation log, and this plan. Letter state remains client-side and is discarded on refresh.

## Implementation stages

1. Add typed letter state, synthetic fixture values, step navigation, and safe field synchronization from BOQ totals/terms/duration.
2. Add the sidebar editor, live letter preview, and final review sequence with letter before BOQ.
3. Add combined print styles, runtime checks, rendered PDF inspection, and documentation updates.

## Security, data, and recovery

No external system or production data is mutated. The app must not preload real names, addresses, phone numbers, or quoted values from the reference. Sample buttons remain explicitly synthetic. Recovery is limited to reloading the page because the POC has no persistence. Deployment and real customer use require separate authorization and **Wiring Milestone 7 — Authentication, permissions, and production hardening**.

## Validation and acceptance

- Run `pnpm --filter frontend lint`, `pnpm --filter frontend typecheck`, and `pnpm --filter frontend build`.
- Verify keyboard-accessible step controls and responsive editor/preview layout in the local browser.
- Load the one-page and multi-page synthetic fixtures and verify final review order.
- Print and render combined PDFs with Poppler. The letter must be page 1; the compact fixture BOQ must follow on page 2; the large fixture must continue across later pages without clipped rows or broken totals.
- Run `git diff --check` and confirm no real reference data was introduced.

## Progress

- [x] 2026-11-23T01:00:00+08:00 — Inspected repository rules, current BOQ implementation, and the complete reference PDF page.
- [x] 2026-11-23T13:15:00+08:00 — Implemented the three-step funnel, typed letter state, sidebar editor, live preview, final sequence, and combined export.
- [x] 2026-11-23T13:25:00+08:00 — Verified desktop and mobile layouts, compact and multi-page combined PDFs, frontend lint/type-check/build, and feature documentation.

## Decisions and discoveries

- 2026-11-23: Use one shared BOQ DOM instance and conditionally compose it after the letter in final review, avoiding duplicated worksheet state.
- 2026-11-23: Derive the displayed quotation amount from the current BOQ overall total; terms and duration stay editable in the letter editor but can be copied from the BOQ.
- 2026-11-23: Use A4 for the combined output to remain consistent with the existing BOQ export even though the visual reference is US Letter.

## Outcomes and remaining risks

The route now provides the requested BOQ → Letterhead → Final view funnel. The compact synthetic fixture exports as two A4 pages and the 46-line-item fixture exports as three A4 pages; both place the letter first and preserve BOQ continuation headers and totals. Frontend lint, type-check, production build, browser rendering, and Poppler page inspection passed. Browser-generated PDFs remain mutable working documents, letterhead contact/signatory values still require manual entry and qualified approval, and the package is not an approved formal quotation or persisted record.
