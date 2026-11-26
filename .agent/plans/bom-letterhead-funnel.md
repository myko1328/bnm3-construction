# BOQ and letterhead document funnel

## Goal and observable outcome

Maintain `/tools/bill-of-materials` as a three-step browser-only workflow. Personnel first prepare the BOQ, then enter quotation-letter details in a sidebar while viewing a live letter preview, and finally download a generated A4 PDF whose first page is the signed letter and whose remaining pages are the paginated BOQ.

## Scope and non-goals

This user-requested slice remains within **Milestone 0 — Business rules and estimating foundation**. It includes step navigation, letter fields, live preview, final ordering, a direct client-generated PDF download, the existing static signatory image, and synthetic test fixtures. It does not add authentication, persistence, customer records, approved pricing, cryptographic signatures, email delivery, or formal quotation approval.

## Current behavior and evidence

`frontend/src/app/tools/bill-of-materials/BillOfMaterials.tsx` holds all worksheet state in React memory and currently calls `window.print()` for export. `bill-of-materials.module.css` provides the visual A4 print reference. The existing static signature asset is `frontend/public/antonio-miparanum-signature.png`. `docs/features/bill-of-materials-worksheet.md` records the POC safety boundary. The supplied reference PDF informed visual hierarchy only; its customer information and quoted amount were not copied into defaults.

## Interfaces and ownership

There are no API, database, identity, or persistence changes. The primary agent owns the component, a new client-only PDF generator, dependency metadata, feature documentation, implementation log, and this plan. The generator accepts a typed snapshot of letter, BOQ, rates, display options, and totals and downloads a PDF locally. Letter state remains client-side and is discarded on refresh.

## Implementation stages

1. Add typed letter state, synthetic fixture values, step navigation, and safe field synchronization from BOQ totals/terms/duration.
2. Add the sidebar editor, live letter preview, and final review sequence with letter before BOQ.
3. Add combined print styles, runtime checks, rendered PDF inspection, and documentation updates.
4. Replace the print-dialog export with a direct A4 PDF generator that embeds the logo and static signature, paginates BOQ rows with repeated headings, preserves current display toggles and totals, and reports export failures without losing worksheet state.

## Security, data, and recovery

No external system or production data is mutated. PDF generation runs locally in the browser and sends no worksheet data to a third party. Sample buttons remain explicitly synthetic. If asset loading or PDF generation fails, the worksheet stays intact and the user receives a retryable error. Deployment and real customer use require separate authorization and **Wiring Milestone 7 — Authentication, permissions, and production hardening**.

## Validation and acceptance

- Run `pnpm --filter frontend lint`, `pnpm --filter frontend typecheck`, and `pnpm --filter frontend build`.
- Verify keyboard-accessible step controls and responsive editor/preview layout in the local browser.
- Load the one-page and multi-page synthetic fixtures and verify final review order.
- Print and render combined PDFs with Poppler. The letter must be page 1; the compact fixture BOQ must follow on page 2; the large fixture must continue across later pages without clipped rows or broken totals.
- Click the export control and verify it downloads a PDF without opening the print dialog. Render the compact and multi-page downloads with Poppler; verify A4 dimensions, letter-first ordering, embedded signature, repeated BOQ headings, intact rows and totals, optional contingency/preparer behavior, BOQ-only page numbering, and a useful retryable error if generation fails.
- Run `git diff --check` and confirm no real reference data was introduced.

## Progress

- [x] 2026-11-23T01:00:00+08:00 — Inspected repository rules, current BOQ implementation, and the complete reference PDF page.
- [x] 2026-11-23T13:15:00+08:00 — Implemented the three-step funnel, typed letter state, sidebar editor, live preview, final sequence, and combined export.
- [x] 2026-11-23T13:25:00+08:00 — Verified desktop and mobile layouts, compact and multi-page combined PDFs, frontend lint/type-check/build, and feature documentation.
- [x] 2026-11-23T15:25:00+08:00 — Removed browser print furniture and page outlines, added BOQ-only numbering and an optional detailed disclaimer, aligned the final review, and revalidated compact and multi-page exports.
- [x] 2026-11-25T23:42:35+08:00 — Replaced browser printing with a direct client-generated A4 PDF download and validated compact, multi-page, and display-option variants.

## Decisions and discoveries

- 2026-11-23: Use one shared BOQ DOM instance and conditionally compose it after the letter in final review, avoiding duplicated worksheet state.
- 2026-11-23: Derive the displayed quotation amount from the current BOQ overall total; terms and duration stay editable in the letter editor but can be copied from the BOQ.
- 2026-11-23: Use A4 for the combined output to remain consistent with the existing BOQ export even though the visual reference is US Letter.
- 2026-11-23: Use zero-margin letter pages and a named BOQ page style so Chrome cannot add its own title, URL, date, or letterhead page number; document padding and BOQ margin boxes own the printable layout.
- 2026-11-25: Generate the downloadable document from worksheet data with jsPDF and jsPDF-AutoTable rather than rasterizing the live DOM. This keeps text selectable, preserves row boundaries, repeats table headings, avoids browser print settings, and allows the existing signature PNG to be embedded deterministically.
- 2026-11-25: Keep the PDF libraries behind the export-time dynamic import. Record `core-js: false` in the workspace build policy because it is an optional jsPDF dependency whose install script is not needed for the exporter; frozen installation, Next.js, and Vinext builds all pass without approving the script.

## Outcomes and remaining risks

The route now downloads a generated A4 PDF without opening the browser print dialog. Browser tests produced a two-page compact package and a three-page 46-line-item package. Poppler rendering confirmed the signed letter first, BOQ-only numbering, row-safe page breaks, repeated continuation headings, intact totals, and correct omission/recalculation when contingency and Prepared by were disabled. Frozen dependency installation, frontend lint/type-check, the Next.js production build, and the Cloudflare/Vinext build pass. The PDF remains a mutable working document; the static signature is not cryptographic approval, letterhead/contact values still require qualified review, and the package is not an approved formal quotation or persisted record.
