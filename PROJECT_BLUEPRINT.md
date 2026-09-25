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

## Current priority — Proof of concept

**Status:** Implemented for internal demonstration at `/assessment/residential-lpg`. Family review and question refinement are next.

The immediate goal is not to build the entire platform. It is to show the BNM3 family and operating team how a structured digital assessment can turn customer answers into an estimator-ready project brief.

The proof of concept will include only:

1. A research-backed Residential LPG question set.
2. One working, responsive Residential LPG assessment funnel.
3. Conditional routing for emergencies, technical review, and site visits.
4. A personalized project-summary result without automatic peso pricing.
5. A family demonstration and feedback round.

The question analysis is documented in [`docs/residential-lpg-funnel-question-analysis.md`](docs/residential-lpg-funnel-question-analysis.md).

Automatic prices, the commercial and industrial funnels, staff dashboards, notifications, CRM features, project portals, QR maintenance records, analytics, and geographic expansion are deferred until the proof of concept has been demonstrated and approved.

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

Implement the Residential LPG proof-of-concept funnel defined in [`docs/residential-lpg-funnel-question-analysis.md`](docs/residential-lpg-funnel-question-analysis.md). The first version should save answers in the browser, apply conditional routing, and produce a reviewable scope summary without calculating a peso amount or sending data to an external service.
