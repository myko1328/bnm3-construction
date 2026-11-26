# Bill of materials worksheet

- **Implementation status:** Implemented POC
- **Operational readiness:** Not production-ready
- **Audience:** BNM3 estimators and project personnel
- **Entry point:** `/tools/bill-of-materials`
- **Roadmap evidence:** Product **Milestone 0 — Business rules and estimating foundation**
- **Last verified:** 2026-11-25

## User outcome

Personnel can prepare and directly download a structured working quotation package without editing a spreadsheet or document template. They first build the bill of materials and quantities, then prepare a quotation letter through sidebar fields and a live preview, and finally review/download the letter followed by the BOQ. They can add or remove rows in Materials, Labor, and Other Costs & Consumables, enter project details and rates, and see line, section, subtotal, contingency, VAT, and overall totals update immediately.

## Current behavior

- The worksheet starts without customer, location, quantity, or pricing data from the reference document. The BOQ preparer defaults to the designated BNM3 preparer and remains editable.
- A three-step funnel guides personnel through BOQ preparation, quotation-letter editing, and final review.
- The letter editor uses a sidebar for the date, recipient, address, salutation, introduction, letterhead contact, closing, and signatory fields while a live A4 preview updates beside it.
- The letter amount, payment terms, duration, project title, client, and location come from the current BOQ so the two documents cannot silently diverge.
- Materials and other-cost rows capture description, unit, quantity, and unit cost.
- Labor rows capture personnel description, head count, days, and daily rate.
- Every section supports repeatable row insertion and removal.
- Item numbers identify sections while editing but are omitted from exported section headings.
- Two non-printing test controls replace the current worksheet with explicitly synthetic one-page or multi-page mock project data. When the worksheet already contains entries, replacement requires confirmation.
- Wide tables remain horizontally scrollable on narrow screens without showing a scrollbar, and large currency totals wrap inside their assigned cells instead of widening the page.
- Contingency and VAT percentages are user-editable and calculated from the subtotal. Disabling contingency removes it from both the displayed summary and overall calculation while preserving the entered rate for re-enabling.
- The final view orders the letterhead first and the complete BOQ afterward. Download PDF generates that A4 sequence locally in the browser without opening the print dialog. Multi-page BOQs split at row boundaries, repeat the active section and column headings, and keep the final totals, terms, and disclaimer together.
- Every downloaded quotation letter embeds the designated signatory's static signature image above the editable signatory name. The signature remains hidden from the editor and on-screen final review.
- Exported pages use generator-owned A4 margins and contain no browser date, title, local URL, or page outline. The letter has no page number; BOQ pages are numbered from 1.
- Non-printing options control whether the Prepared by row and the detailed qualified-review disclaimer appear at the end of the BOQ.
- The worksheet's detailed disclaimer identifies the totals as indicative working costs rather than a binding quotation and requires qualified review.

## Data and contracts

All BOQ and letter state is held in React memory for the current browser tab. This feature adds no API contract, database table, migration, or customer lead. Refreshing or leaving the page discards the complete working package.

## Safety, privacy, and authorization

The worksheet does not include approved rates, construction quantities, customer records, or technical decisions. Users enter their own working values. BNM3 review remains required for quantities, pricing, tax treatment, technical feasibility, and site conditions.

Because authentication is not implemented, the worksheet intentionally has no server persistence and should not be treated as an approved estimating record or formal quotation.

## Failure, retry, and recovery

Arithmetic is deterministic and recalculates after each input. Empty, invalid, or negative numeric entries contribute zero. Blank letter fields remain visibly labeled in preview rather than inventing customer or sender details. If PDF generation or asset loading fails, an inline error leaves the worksheet intact so the user can retry. There is no save or recovery behavior in this POC; personnel should download a PDF before leaving the page if they need a copy.

## Known limitations and deferred work

- There is no authenticated project association, database persistence, revision history, approval workflow, or audit attribution.
- Material catalogs, suppliers, approved price-book versions, CSV/XLSX import and export, and tax-policy validation are not implemented.
- The client-generated PDF is not an immutable server-generated document or persisted project record.
- The embedded signature is a static image, not a cryptographic digital signature or evidence of per-document approval. The letterhead has no approved company-profile workflow, document number, validity period, or approval state.
- The worksheet does not distinguish taxable and non-taxable line items or model discounts, markups, retention, or progress-billing schedules.

## Validation evidence

- 2026-11-25 — direct compact and 46-line-item PDF downloads were generated from the browser without a print dialog, inspected as A4 documents, rendered with Poppler, and visually checked for letter-first ordering, automatic signature placement, multi-page row boundaries, repeated continuation headings, intact totals, and BOQ-only numbering.
- 2026-11-25 — the contingency toggle was verified to remove and restore the contingency contribution while recalculating the overall total; frontend lint, type-check, production build, browser smoke checks, and whitespace checks passed.
- 2026-11-24 — the editor-only item numbers and optional Prepared by output were verified with frontend lint, type-check, production build, and whitespace checks.
- 2026-11-24 — the supplied quotation PDF was rendered and visually inspected to isolate the authorized signatory mark. The transparent print asset, default preparer value, frontend lint, type-check, production build, and whitespace checks were verified.
- 2026-11-23 — the source PDF was rendered and visually inspected as a layout reference; no customer details or rates were copied into application defaults.
- 2026-11-23 — frontend lint, type-check, production build, desktop/mobile browser interaction, three-step navigation, live letter preview, repeatable-row arithmetic, a ₱1,333,378,664.00 overflow case, hidden-scrollbar behavior, vertically centered sign-off values, both sample loaders, a two-page compact combined export, and a three-page 46-line-item combined export with the letter first, repeated continuation headings, and an intact final summary block were checked for this feature.
- 2026-11-23 — the supplied two-page result was rendered and compared with new compact and multi-page exports. The new exports were checked without a browser header/footer suppression flag and contained no date, title, local URL, page outline, or letterhead page number; BOQ numbering began at 1 and continued on the second BOQ page.

## Evidence and related documents

- [`BillOfMaterials.tsx`](../../frontend/src/app/tools/bill-of-materials/BillOfMaterials.tsx)
- [`bill-of-materials-pdf.ts`](../../frontend/src/app/tools/bill-of-materials/bill-of-materials-pdf.ts)
- [`page.tsx`](../../frontend/src/app/tools/bill-of-materials/page.tsx)
- [`PROJECT_BLUEPRINT.md`](../../PROJECT_BLUEPRINT.md)
- [Implementation log](../implementation-log.md)
