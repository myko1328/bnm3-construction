# Bill of materials worksheet

- **Implementation status:** Implemented POC
- **Operational readiness:** Not production-ready
- **Audience:** BNM3 estimators and project personnel
- **Entry point:** `/tools/bill-of-materials`
- **Roadmap evidence:** Product **Milestone 0 — Business rules and estimating foundation**
- **Last verified:** 2026-11-23

## User outcome

Personnel can prepare a structured, printable working quotation package without editing a spreadsheet or document template. They first build the bill of materials and quantities, then prepare a quotation letter through sidebar fields and a live preview, and finally review/export the letter followed by the BOQ. They can add or remove rows in Materials, Labor, and Other Costs & Consumables, enter project details and rates, and see line, section, subtotal, contingency, VAT, and overall totals update immediately.

## Current behavior

- The worksheet starts blank and does not copy customer, location, quantity, or pricing data from the reference document.
- A three-step funnel guides personnel through BOQ preparation, quotation-letter editing, and final review.
- The letter editor uses a sidebar for the date, recipient, address, salutation, introduction, letterhead contact, closing, and signatory fields while a live A4 preview updates beside it.
- The letter amount, payment terms, duration, project title, client, and location come from the current BOQ so the two documents cannot silently diverge.
- Materials and other-cost rows capture description, unit, quantity, and unit cost.
- Labor rows capture personnel description, head count, days, and daily rate.
- Every section supports repeatable row insertion and removal.
- Two non-printing test controls replace the current worksheet with explicitly synthetic one-page or multi-page mock project data. When the worksheet already contains entries, replacement requires confirmation.
- Wide tables remain horizontally scrollable on narrow screens without showing a scrollbar, and large currency totals wrap inside their assigned cells instead of widening the page.
- Contingency and VAT percentages are user-editable; both are calculated from the subtotal.
- The final view orders the letterhead first and the complete BOQ afterward. Export combined PDF opens the browser's print dialog with that A4 sequence. When the BOQ exceeds one page, the browser paginates at row boundaries, repeats the section and column headings on continuation pages, and keeps the final totals, terms, and disclaimer together.
- Exported pages use document-owned margins, so browser-added dates, titles, local URLs, and page outlines are not included. The letter has no page number; BOQ pages are numbered from 1.
- A non-printing option controls whether the detailed qualified-review disclaimer appears at the end of the BOQ. The letter and worksheet remain explicitly labeled as indicative working documents even when that duplicate detailed note is hidden.
- The worksheet labels the result as an indicative working cost rather than a binding quotation.

## Data and contracts

All BOQ and letter state is held in React memory for the current browser tab. This feature adds no API contract, database table, migration, or customer lead. Refreshing or leaving the page discards the complete working package.

## Safety, privacy, and authorization

The worksheet does not include approved rates, construction quantities, customer records, or technical decisions. Users enter their own working values. BNM3 review remains required for quantities, pricing, tax treatment, technical feasibility, and site conditions.

Because authentication is not implemented, the worksheet intentionally has no server persistence and should not be treated as an approved estimating record or formal quotation.

## Failure, retry, and recovery

Arithmetic is deterministic and recalculates after each input. Empty, invalid, or negative numeric entries contribute zero. Blank letter fields remain visibly labeled in preview rather than inventing customer or sender details. There is no save or recovery behavior in this POC; personnel should print or save a PDF before leaving the page if they need a copy.

## Known limitations and deferred work

- There is no authenticated project association, database persistence, revision history, approval workflow, or audit attribution.
- Material catalogs, suppliers, approved price-book versions, CSV/XLSX import and export, and tax-policy validation are not implemented.
- Browser print output is not an immutable server-generated document.
- The letterhead does not store a real digital signature, approved company contact profile, document number, validity period, or approval state.
- The worksheet does not distinguish taxable and non-taxable line items or model discounts, markups, retention, or progress-billing schedules.

## Validation evidence

- 2026-11-23 — the source PDF was rendered and visually inspected as a layout reference; no customer details or rates were copied into application defaults.
- 2026-11-23 — frontend lint, type-check, production build, desktop/mobile browser interaction, three-step navigation, live letter preview, repeatable-row arithmetic, a ₱1,333,378,664.00 overflow case, hidden-scrollbar behavior, vertically centered sign-off values, both sample loaders, a two-page compact combined export, and a three-page 46-line-item combined export with the letter first, repeated continuation headings, and an intact final summary block were checked for this feature.
- 2026-11-23 — the supplied two-page result was rendered and compared with new compact and multi-page exports. The new exports were checked without a browser header/footer suppression flag and contained no date, title, local URL, page outline, or letterhead page number; BOQ numbering began at 1 and continued on the second BOQ page.

## Evidence and related documents

- [`BillOfMaterials.tsx`](../../frontend/src/app/tools/bill-of-materials/BillOfMaterials.tsx)
- [`page.tsx`](../../frontend/src/app/tools/bill-of-materials/page.tsx)
- [`PROJECT_BLUEPRINT.md`](../../PROJECT_BLUEPRINT.md)
- [Implementation log](../implementation-log.md)
