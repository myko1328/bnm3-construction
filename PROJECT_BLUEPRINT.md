# BNM3 Construction Digital Platform Blueprint

## 1. Product vision

Build a trustworthy construction website and guided project-assessment platform that helps customers describe their requirements, receive an initial budget range, and move into technical review with BNM3.

The platform should combine BNM3's field experience with a clear digital process. It must avoid presenting an automated result as a final quotation when site conditions, engineering decisions, permits, or safety requirements still need professional verification.

## 2. Initial service scope

The initial service roadmap covers four services:

1. Residential LPG Installation & Gas Safety
2. Commercial Kitchen LPG & Fire Suppression
3. Industrial Lighting & Electrical Wiring
4. Residential Smoke & Fire Alarm Systems

Smoke and fire alarms belong to the **Fire Detection & Alarm Systems** category. The initial public offer focuses on homes and may later expand into commercial panel-based fire detection systems.

Expansion into other construction services should happen only after these focused workflows are operating reliably.

## Current priority — Connect the proof of concept

**Status:** The frontend proof of concept is implemented. It includes the Residential LPG assessment, LPG budget estimator, lead dashboard, detailed personnel call record, and printable PDF record. The TypeScript backend and Neon/Drizzle foundation are also implemented, but the frontend is not connected to it yet.

The immediate goal is to connect the working frontend to Neon in small, independently testable milestones. The team should be able to review each connection before the next workflow begins using permanent data.

The connected proof of concept will demonstrate:

1. A Residential LPG assessment creating a permanent lead.
2. An estimator user becoming a lead only after explicitly requesting contact.
3. Preliminary lead classification with visible reasons.
4. Personnel retrieving and updating the lead from the dashboard.
5. Call notes, verification records, activities, and statuses remaining available to management.
6. Site-inspection recommendations being recorded without automatically making technical decisions.

The question analysis is documented in [`docs/residential-lpg-funnel-question-analysis.md`](docs/residential-lpg-funnel-question-analysis.md).

Commercial and industrial funnels, automatic formal quotations, project portals, QR maintenance records, advanced analytics, and geographic expansion remain deferred until the connected LPG proof of concept has been demonstrated and approved.

The smoke-alarm service remains separate from the LPG questionnaire. After the LPG proof of concept is approved, it should receive its own focused assessment flow, with an optional cross-sell between the two residential safety services.

## 3. Customer journey

1. Customer discovers BNM3 through the landing page or a service-specific campaign.
2. Customer selects the relevant service.
3. A guided questionnaire collects project and site details.
4. The platform identifies missing information and requests optional photos or documents.
5. The platform presents an indicative budget range, assumptions, exclusions, and confidence level.
6. Customer submits contact information and requests technical review or a site visit.
7. BNM3 reviews the submission and adjusts the scope.
8. BNM3 issues the formal quotation and proposed schedule.
9. If accepted, the project proceeds through execution, testing, and documented handover.

## 4. Milestones

### Backend wiring milestones — Current implementation sequence

These milestones connect the existing frontend POC to Neon gradually. Only one milestone should be placed into active development at a time. Each milestone must pass its completion criteria before work begins on the next one.

#### Wiring Milestone 0 — Monorepo and backend foundation

**Status:** Implemented.

**Goal:** Establish the backend without changing the behavior of the working frontend POC.

**Deliverables:**

- Move the Next.js application into `frontend`.
- Create a TypeScript Express application in `backend`, with Node.js and Cloudflare Worker entrypoints.
- Configure the pnpm workspace and root development commands.
- Add Neon serverless connectivity and environment validation.
- Add the initial Drizzle schema and generated SQL migration.
- Add API health and database-readiness endpoints.
- Add lead creation, listing, retrieval, and status-route boilerplate.

**Completion criteria:** Frontend and backend type checks, linting, and production builds pass; the backend health endpoint responds successfully.

---

#### Wiring Milestone 1 — Neon environment and database verification

**Status:** Completed. The initial migration was applied and test lead `BNM-2026-0D800287` was created and retrieved successfully through the API.

**Goal:** Confirm that the application can safely persist and retrieve records from the selected Neon project.

**Deliverables:**

- Add the real Neon pooled connection string to the local backend environment.
- Apply the initial Drizzle migration.
- Verify `/ready` against Neon.
- Create and retrieve one test lead through the API.
- Confirm timestamps use timezone-aware database fields.
- Document how development and production database branches will be separated.

**Completion criteria:** A test lead can be written to and read from Neon through the backend API, without using the frontend or manually editing the database.

---

#### Wiring Milestone 2 — Assessment submission to Neon

**Status:** Completed. Browser submission `BNM-2026-99BAEA19` was persisted to Neon and remained duplicate-safe after refreshing the confirmation page.

**Goal:** Make the Residential LPG assessment the first real lead source.

**Deliverables:**

- Add a typed frontend API client.
- Map the existing assessment state to the backend lead payload.
- Require contact consent before submission.
- Submit to `POST /api/v1/leads` only on the final assessment action.
- Show submitting, successful, validation-error, and connection-error states.
- Display the permanent lead reference number on confirmation.
- Prevent accidental duplicate submissions from repeated clicks.

**Completion criteria:** A customer can complete the assessment once, receive a reference number, and the same answers appear as one Neon lead.

---

#### Wiring Milestone 3 — Estimator opt-in lead capture

**Status:** Completed. Browser submission `BNM-2026-D8EE92F5` was persisted to Neon with its exact estimator snapshot and remained duplicate-safe after refreshing the confirmation page.

**Goal:** Preserve the estimator as a low-friction anonymous tool while allowing interested customers to request contact.

**Deliverables:**

- Keep calculations anonymous until the customer selects a contact action.
- Add “Request an official review” and “Request a callback” actions.
- Collect contact details and consent only after the customer opts in.
- Save the selected equipment, calculation inputs, budget range, and assumptions as an estimate snapshot.
- Record the lead source as `estimator`.
- Show a clear distinction between an indicative budget and a formal quotation.

**Completion criteria:** Anonymous estimator use creates no personal lead; opting in creates exactly one lead containing the estimator snapshot.

---

#### Wiring Milestone 4 — Dashboard reads live leads

**Status:** Completed. The dashboard loaded three Neon leads in browser verification, filtered assessment and estimator sources correctly, and opened UUID-backed detail pages for `BNM-2026-99BAEA19` and `BNM-2026-D8EE92F5`.

**Goal:** Replace dashboard mock data with Neon records without changing the personnel workflow unnecessarily.

**Deliverables:**

- Load the lead list from `GET /api/v1/leads`.
- Add loading, empty, error, and retry states.
- Display lead source, status, classification, score, location, and creation time.
- Add filters for status and source.
- Open database-backed lead-detail routes using UUIDs.
- Remove mock leads only after live-data behavior is verified.

**Completion criteria:** A lead submitted from the assessment or estimator appears in the dashboard after refresh and opens the correct detail page.

---

#### Wiring Milestone 5 — Persistent call record and activity history

**Status:** Completed. Call-record drafts, checklist responses, comments, summaries, finalization state, manager questions, and activity events now persist in Neon. Browser verification confirmed that the draft for `BNM-2026-D8EE92F5` survived a full page reload and restored its checklist progress, comment, summary, and activity history.

**Goal:** Preserve the personnel and management record currently stored only in the browser.

**Deliverables:**

- Extend the database schema for call records, verification items, notes, and activity events.
- Add backend endpoints for saving draft call records and finalizing them.
- Save checklist results, customer responses, unresolved questions, and call summaries.
- Record the author and timestamp of every meaningful change.
- Load the same record on another authorized browser.
- Generate the printable PDF from database-backed information.

**Completion criteria:** Personnel can save a call record, close the browser, reopen the lead elsewhere, and recover the complete record and activity history.

---

#### Wiring Milestone 6 — Qualification and site-inspection workflow

**Status:** Completed. Personnel can confirm or override the preliminary classification with a recorded reason, confirm technical inspection triggers, move leads through controlled status transitions, and create or schedule an internal site-inspection request. The API prevents customer-support users from declaring quotation readiness or completing a technical inspection, and every workflow decision is retained in the lead activity history.

**Goal:** Turn lead information into a controlled operational next action without automating technical approval.

**Deliverables:**

- Show the reasons behind every preliminary classification.
- Let personnel confirm or override the preliminary classification with a recorded reason.
- Add statuses for clarification, contact attempts, site-inspection recommendation, inspection scheduling, quotation readiness, conversion, and closure.
- Record technical triggers such as drilling, uncertain pipe routing, multiple floors, existing-system modification, managed properties, and safety concerns.
- Add an internal site-inspection request record.
- Prevent customer-service personnel from marking technical feasibility as approved.

**Completion criteria:** Personnel can move a lead from submission through qualification and inspection recommendation while management can reconstruct why each decision was made.

---

#### Wiring Milestone 7 — Authentication, permissions, and production hardening

**Goal:** Prepare the connected POC for controlled real-world use.

**Deliverables:**

- Add authenticated staff accounts.
- Define customer-support, technical, manager, and administrator permissions.
- Protect dashboard and mutation endpoints.
- Add API rate limiting, security headers, payload limits, and structured audit logs.
- Define retention and deletion rules for customer contact and project information.
- Configure production frontend and backend environments, CORS, and Neon branches.
- Add backups, monitoring, error reporting, and deployment checks.

**Completion criteria:** Unauthenticated users cannot access internal records, staff actions follow role permissions, and a production deployment passes security and recovery checks.

---

### Milestone 0 — Business rules and estimating foundation

**Status:** In progress — the first service specification is documented in [`docs/residential-lpg-estimating-spec.md`](docs/residential-lpg-estimating-spec.md), and the research-backed funnel variables are documented in [`docs/residential-lpg-funnel-question-analysis.md`](docs/residential-lpg-funnel-question-analysis.md).

**Goal:** Document how BNM3 currently evaluates and prices work before automating it.

**Deliverables:**

- Assign an owner for preparing and approving estimates.
- Document the current estimating turnaround time and target response time.
- Define the minimum information needed for each service.
- Define standard labor units, material categories, travel costs, overhead, contingency, and margin rules.
- Identify which inputs can produce an online estimate and which require a site inspection.
- Define geographic service areas and travel zones, beginning with Cebu, CDO, Iligan, and Davao if nationwide operations are not yet practical.
- Define estimate validity, exclusions, taxes, permit responsibilities, and escalation rules.
- Create sample estimates from completed projects for later calibration.

**Completion criteria:** BNM3 can manually price at least five representative scenarios per service using documented rules and obtain consistent results.

---

### Milestone 1 — Brand, landing page, and information architecture

**Goal:** Establish BNM3's public presence and clearly communicate its focused services.

**Deliverables:**

- Responsive landing page.
- Accessible BNM3 color system and logo treatment.
- Service summaries for residential, commercial, and industrial customers.
- Clear process, credibility, project documentation, and call-to-action sections.
- Basic metadata, social sharing image, favicon, robots file, and sitemap.
- Working navigation and service-specific entry points.
- Production deployment and domain configuration.

**Completion criteria:** The website passes responsive, accessibility, performance, and production-build checks and every primary call to action leads to a useful next step.

---

### Milestone 2 — Service assessment blueprints

**Goal:** Design the complete question flow for each service before building forms.

**Deliverables:**

- Residential LPG questionnaire covering property type, appliance count, cylinder location, pipe distance, leak detection, shutoff requirements, access, and existing installation.
- Commercial kitchen questionnaire covering venue type, appliance schedule, LPG demand, hood information, suppression requirements, gas detection, mall requirements, access, and operating constraints.
- Industrial electrical questionnaire covering facility type, lighting quantity, mounting height, operating schedule, available power, wiring scope, controls, access equipment, shutdown restrictions, and existing conditions.
- Conditional question map showing which answers reveal additional questions.
- Required versus optional fields.
- Plain-language help text for nontechnical customers.
- Rules for when photos, plans, or supporting documents are requested.
- Exit paths for unsupported or high-risk projects.

**Completion criteria:** A project estimator can review each questionnaire and confirm that it captures enough information to decide whether to provide a range, request clarification, or require a site visit.

---

### Milestone 3 — Interactive assessment funnel

**POC status:** Residential LPG browser-only funnel implemented. External submission, uploads, and the remaining service funnels are deferred.

**Goal:** Let customers complete a focused, low-friction project assessment.

**Deliverables:**

- Service selection screen.
- Multi-step questionnaire with progress indicator.
- Conditional questions based on previous answers.
- Save-and-resume capability.
- Form validation and accessible error messages.
- Mobile-friendly controls and keyboard navigation.
- Optional image and document uploads with file limits and privacy notice.
- Review screen before submission.
- Confirmation page with clear next steps.

**Completion criteria:** Test users can finish the correct service flow on mobile and desktop without assistance, and submitted answers are complete and readable by the BNM3 team.

---

### Milestone 4 — Estimating engine version 1

**Goal:** Convert qualified questionnaire answers into a controlled indicative estimate.

**Deliverables:**

- Versioned price book for materials, labor, equipment, travel, overhead, and contingency.
- Rule engine for quantities, unit rates, minimum charges, and optional items.
- Low/high estimate range instead of false precision.
- Confidence level based on information completeness and project complexity.
- Visible assumptions, inclusions, exclusions, and estimate-validity period.
- Mandatory site-review flag for safety-critical, unusual, incomplete, or high-value work.
- Internal calculation breakdown that is not exposed as editable customer data.
- Automated tests for representative pricing scenarios and boundary cases.

**Completion criteria:** Calculated ranges are compared with historical projects and estimator-produced results, with acceptable variance defined by BNM3 before public release.

---

### Milestone 5 — Lead capture and internal review dashboard

**Goal:** Give the BNM3 team an efficient way to qualify, review, and respond to submissions.

**Deliverables:**

- Secure staff authentication and role-based access.
- Lead list with service, location, status, date, and estimated range.
- Full assessment and uploaded-file viewer.
- Internal notes and activity history.
- Workflow statuses such as New, Needs Clarification, Site Visit Required, Estimating, Quoted, Won, and Lost.
- Assignment to a responsible estimator or project lead.
- Ability to adjust assumptions and produce a reviewed proposal.
- Exportable or printable assessment summary.

**Completion criteria:** A staff member can receive a lead, review its evidence, request clarification, assign responsibility, and move it to formal quotation without relying on scattered chat messages.

---

### Milestone 6 — Notifications and customer follow-up

**Goal:** Keep customers and staff informed without creating excessive manual work.

**Deliverables:**

- Customer submission confirmation.
- Internal new-lead notification.
- Clarification-request workflow.
- Site-visit scheduling link or request flow.
- Status updates for reviewed estimates and formal proposals.
- Message templates with consistent response-time expectations.
- Consent and unsubscribe controls where required.

**Completion criteria:** Every submitted assessment receives an acknowledgement, reaches the assigned team member, and has a recorded next action.

---

### Milestone 7 — Project proof and credibility system

**Goal:** Turn completed work into structured evidence that improves trust and future estimating.

**Deliverables:**

- Project case-study template.
- Before, during, and after documentation.
- Scope, location category, challenges, installed systems, testing, and handover details.
- Customer approval process for publishing photos or identifying information.
- Filterable project portfolio by service and property type.
- Internal link between completed projects and estimate calibration data.

**Completion criteria:** BNM3 can publish consistent case studies without exposing confidential customer or mall information, and completed-project data can inform future pricing.

---

### Milestone 8 — Operations, analytics, and optimization

**Goal:** Measure performance and continuously improve the service and estimating process.

**Deliverables:**

- Privacy-conscious analytics.
- Funnel metrics: landing-page visit, assessment start, completion, qualified lead, site visit, quotation, and won project.
- Response-time and estimate-turnaround reporting.
- Estimate-versus-actual cost and margin reporting.
- Geographic demand reporting by city and service.
- Error monitoring, backups, dependency updates, and security review.
- Quarterly questionnaire and pricing-rule review.

**Completion criteria:** BNM3 can identify where customers abandon the process, which services and cities produce qualified work, and where estimate rules need adjustment.

---

### Milestone 9 — Geographic and service expansion

**Goal:** Scale only after the initial operating model is proven.

**Deliverables:**

- City-specific landing pages and service availability.
- Travel-zone and partner/subcontractor rules.
- Capacity controls so marketing demand does not exceed delivery capacity.
- Additional service funnels based on proven demand.
- Optional customer portal for project records, approvals, and handover documents.

**Completion criteria:** Expansion decisions are supported by conversion, capacity, response-time, project-margin, and quality data—not traffic alone.

## 5. Recommended release sequence

### Proof of concept — Current work

Research and approve the Residential LPG question flow, build one working assessment funnel, and demonstrate how it produces a structured project brief. Do not add automatic pricing until BNM3 validates the captured variables and provides actual estimating rules.

### Release A — Credible online presence

Milestones 0 and 1. Publish the landing page, establish the estimating rules, and begin collecting direct inquiries.

### Release B — Structured lead qualification

Milestones 2 and 3. Launch guided assessments without automated pricing. This creates real customer data while keeping estimates under human review.

### Release C — Controlled indicative estimates

Milestones 4 and 5. Introduce estimate ranges only after the rules have been calibrated and the staff review workflow exists.

### Release D — Scalable operations

Milestones 6 through 9. Add notifications, case studies, analytics, geographic expansion, and new services based on evidence.

## 6. Principles and guardrails

- The online result is an indicative estimate, not a binding quotation.
- Safety-critical work always remains subject to technical review.
- Site conditions can override automated assumptions.
- Ask only questions that influence scope, risk, scheduling, or price.
- Explain technical questions in customer-friendly language.
- Do not require image uploads to begin an assessment; provide a no-image path and lower the confidence level when necessary.
- Store only information needed for assessment and project delivery.
- Protect customer addresses, plans, photos, and contact details.
- Keep pricing rules versioned so old estimates can be reproduced.
- Make service availability reflect real BNM3 capacity in each city.
- Optimize for qualified projects and profitable delivery, not the largest number of submissions.

## 7. Decisions required before Milestone 2

- Who owns and approves estimates?
- What response time can BNM3 reliably promise?
- Which cities are actively served at launch?
- What project sizes should be declined or routed directly to a site visit?
- Which historical projects can be used to calibrate pricing?
- Which certifications, licenses, supplier relationships, and project evidence can be shown publicly?
- What customer information may be collected and how long should it be retained?
- Which team members need dashboard access and what may each role change?

## 8. Immediate next step

Complete **Wiring Milestone 7 — Authentication, permissions, and production hardening**. Replace the current demo actor identity with authenticated staff accounts, enforce roles from trusted sessions, protect internal routes and mutations, and add the operational security controls required before real customer use.
