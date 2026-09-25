# Residential LPG Installation & Gas Safety — Estimating Specification

**Status:** Draft for family and estimator review  
**Milestone:** 0 — Business rules and estimating foundation  
**Purpose:** Define how BNM3 will qualify and estimate residential LPG work before building the customer funnel.

## 1. Intended outcome

The online assessment should produce one of three results:

1. **Indicative estimate range** — enough reliable information exists to calculate a preliminary range.
2. **Needs technical review** — the project may be estimable after a BNM3 reviewer checks the answers or contacts the customer.
3. **Site visit required** — safety, access, design, or uncertainty makes remote estimating inappropriate.

The online result must never be described as a final or binding quotation. Final pricing remains subject to technical review, confirmed quantities, site conditions, applicable requirements, and BNM3 approval.

## 2. Proposed operating ownership

| Activity | Proposed owner | Target time | Must be confirmed |
|---|---|---:|---|
| New submission received | System | Immediate | Notification channel |
| Completeness check | Office/admin or estimator | Within 4 business hours | Assigned person |
| Technical review | LPG estimator/technical lead | Within 1 business day | Assigned person |
| Clarification request | Assigned reviewer | Within 1 business day | Message template |
| Site-visit decision | Technical lead | Within 1 business day | Approval authority |
| Formal quotation preparation | Estimator | 1–3 business days after complete information/site visit | Actual SLA |
| Final price approval | Owner/authorized approver | Before release | Named approver |

### Proposed customer promise

> Submit your project details in a few minutes. BNM3 will review the information within one business day and confirm whether we can provide an initial range or need a site assessment.

This promise should not be published until the team confirms it can be met consistently.

## 3. Scope for the first estimating model

### Included

- New residential LPG piping installation
- Replacement or extension of existing residential LPG piping
- Cylinder-to-appliance LPG connection
- Regulators, isolation valves, fittings, and related accessories
- Gas-leak detector installation
- Controller and automatic shutoff option
- Testing, commissioning, and basic handover documentation
- Inspection requests for an existing residential LPG installation

### Route directly to technical review or site visit

- Apartments, condominiums, boarding houses, or multi-unit properties
- Centralized or manifold cylinder systems
- Multiple kitchens or unusually high LPG demand
- Restaurants, commissaries, food businesses, and commercial kitchens
- Mixed residential/commercial properties
- Projects involving major civil work, concealed routes, or difficult penetrations
- Existing systems with a reported leak, damage, corrosion, fire, or unsafe modification
- Work requiring coordination with a property administrator, developer, mall, or authority

### Out of scope for automatic estimation

- Emergency leak response
- Repair advice for an active leak
- Final engineering design or compliance certification
- Fire sprinkler or kitchen suppression pricing within the residential LPG funnel
- Any project outside BNM3's active service area

If a customer reports a current gas smell or suspected active leak, the funnel should stop pricing and display an emergency safety message approved by BNM3's technical lead.

## 4. Minimum information required

The assessment may calculate a range only when all applicable minimum inputs are present.

### Customer and location

- City or municipality
- Barangay or general project area; exact address can wait until site scheduling
- Property type: detached house, townhouse, apartment/condominium unit, or other
- Project stage: planning, under construction, occupied, or renovation
- Desired timing

### Installation scope

- New installation, extension, replacement, inspection, or unsure
- Number and type of LPG appliances
- Proposed or current cylinder location
- Indoor or outdoor route
- Approximate pipe route length
- Number of floors crossed
- Wall, ceiling, floor, or underground sections
- Preferred exposed or concealed routing, if known
- Existing LPG piping and its condition, if applicable

### Safety components

- Gas-leak detector requested, existing, or unsure
- Automatic shutoff requested, existing, or unsure
- Number of detection areas
- Accessible isolation valve requirement
- Testing/inspection-only request

### Site and access

- Working height and access difficulty
- Wall/floor material along the route
- Need for drilling, trenching, ceiling access, or restoration
- Occupied-site restrictions
- Parking, delivery, and worker-access constraints

### Evidence

- Photos are optional for beginning the assessment.
- Recommended photos: cylinder area, appliance area, proposed route, and existing piping.
- If there are no photos, the system may still provide a preliminary classification but should reduce confidence or require review for uncertain conditions.

## 5. Project complexity classification

### Class A — Standard

Typical indicators:

- Single detached home
- One kitchen and one or two appliances
- Outdoor cylinder location
- Short, visible, accessible pipe route
- Ground-floor work
- No existing damage or unusual restrictions

**Proposed result:** Indicative estimate range may be shown.

### Class B — Moderate

Typical indicators:

- Longer route or several direction changes
- Two floors or moderate working height
- Some concealed routing or penetrations
- Existing system extension or partial replacement
- Multiple detection points
- Limited access or occupied-site scheduling

**Proposed result:** Wider estimate range plus technical review.

### Class C — Complex or high uncertainty

Typical indicators:

- Multi-unit or mixed-use property
- Centralized supply or manifold arrangement
- Three or more floors
- Underground or predominantly concealed route
- No usable measurements for a nonstandard project
- Signs of leakage, corrosion, damage, or unauthorized modification
- Major restoration or coordination requirements
- Customer answers conflict or contain significant unknowns

**Proposed result:** No automated price; site visit or technical assessment required.

## 6. Mandatory site-visit triggers

Any one of these conditions should override automated pricing:

- Suspected active leak, gas smell, fire damage, or visibly damaged equipment
- Centralized, manifold, or multi-unit LPG supply
- Commercial activity at the property
- Unclear cylinder location or unsafe-looking placement
- Route crosses several floors or common/shared areas
- Significant underground or concealed work
- Existing piping cannot be identified or assessed remotely
- Customer requests formal compliance confirmation
- Structural drilling or restoration scope is uncertain
- Project exceeds the value or complexity threshold set by BNM3
- Location falls outside a standard service zone
- Estimator confidence score falls below the approved threshold

## 7. Estimate calculation model

The first version should use transparent, auditable rules rather than AI-generated pricing.

### Core formula

```text
Direct materials
+ Direct labor
+ Equipment and access
+ Transport and mobilization
+ Testing and documentation
+ Restoration allowance, if applicable
+ Complexity allowance
+ Waste allowance
= Direct project cost

Direct project cost
+ Overhead allocation
+ Contingency
+ Margin
= Indicative estimate
```

The customer should see a low/high range. The internal team should see the itemized calculation and assumptions.

### Proposed range logic

| Information quality | Suggested range width | Customer result |
|---|---:|---|
| Complete answers plus usable measurements/photos | Base estimate ± 10–15% | Indicative range |
| Complete answers without photos or with minor uncertainty | Base estimate ± 15–25% | Wider range with review notice |
| Material unknowns or moderate complexity | No immediate price or ± 25–35% only if approved | Technical review |
| Safety issue, complex system, or unreliable inputs | No automated price | Site visit required |

These percentages are starting proposals and must be calibrated against BNM3's real projects.

## 8. Rate-card structure to complete

Do not put real rates directly in form code. Store them in a versioned price book.

### Base and mobilization

| Rate item | Unit | Current value | Owner/source |
|---|---|---:|---|
| Minimum residential job charge | project | TBD | BNM3 |
| Standard mobilization — local zone | trip/project | TBD | BNM3 |
| Additional travel by service zone | zone or km | TBD | BNM3 |
| Site inspection fee | visit | TBD | BNM3 |

### Materials

| Rate item | Unit | Current value | Notes |
|---|---|---:|---|
| Approved LPG pipe by specification/size | meter | TBD | Separate each material/diameter |
| Standard fittings allowance | fitting or meter factor | TBD | Elbows, tees, unions, adapters |
| Regulator | unit | TBD | Separate types/capacities |
| Isolation valve | unit | TBD | Separate types/sizes |
| Flexible connector | unit | TBD | If included |
| Supports/clamps | unit or meter factor | TBD | By route type |
| Protective sleeve/conduit | meter | TBD | Where required |
| Gas-leak detector | unit | TBD | By approved model |
| Controller | unit | TBD | If separate |
| Automatic shutoff valve | unit | TBD | By specification |
| Consumables | project or percentage | TBD | Sealants, fasteners, labels |

### Labor and equipment

| Rate item | Unit | Current value | Notes |
|---|---|---:|---|
| Standard pipe installation labor | meter | TBD | Accessible/exposed route |
| Difficult or concealed routing labor | meter or multiplier | TBD | Define conditions |
| Appliance connection labor | appliance | TBD | By appliance type if needed |
| Detector/controller installation | point | TBD | Includes testing? |
| Drilling/core work | penetration | TBD | By wall/floor type |
| Trenching | meter | TBD | Excludes restoration if separate |
| Ceiling access | hour/day/allowance | TBD | Define access type |
| Ladder/scaffold/access equipment | day | TBD | By height band |
| Pressure/leak test | system | TBD | Define included documentation |
| Technician/electrician day rate | day | TBD | If used instead of unit labor |

### Commercial adjustments

| Adjustment | Proposed method | Current value |
|---|---|---:|
| Material waste | Percentage of applicable materials | TBD |
| Complexity | Class-based multiplier or allowance | TBD |
| Occupied-site work | Percentage or fixed allowance | TBD |
| Overhead | Percentage of direct cost | TBD |
| Contingency | Risk-based percentage | TBD |
| Margin | Percentage or markup rule | TBD |
| Tax treatment | Inclusive/exclusive rule | TBD |

## 9. Quantity rules to validate

These rules are placeholders for estimator review:

- **Pipe quantity:** customer-estimated route length × route/waste factor.
- **Fittings:** derived from number of direction changes, branches, appliance points, and isolation points; use a minimum allowance if the exact route is unknown.
- **Supports:** pipe length divided by the approved support spacing for the selected pipe specification.
- **Valves:** minimum system isolation plus appliance- or branch-specific valves as required by BNM3's standard design.
- **Detection points:** based on the number and separation of relevant rooms/areas, subject to technical placement review.
- **Labor:** base installation allowance plus per-meter, per-point, penetration, height, access, and restoration components.
- **Mobilization:** determined by service zone, crew requirement, and expected visits.

No rule should be activated until the technical lead confirms it matches BNM3's actual installation practice.

## 10. Estimate output shown to customers

### Required output

- Project classification
- Indicative low/high range, when eligible
- Confidence level: High, Moderate, or Site Review Needed
- Summary of interpreted scope
- Included items
- Optional upgrades, clearly separated
- Major assumptions
- Exclusions
- Factors that may change the price
- Estimate validity period
- Next action: technical review, clarification, or site visit

### Required disclaimer

> This is an indicative estimate based on the information provided. It is not a final quotation or engineering approval. Final scope and pricing are subject to BNM3 technical review, confirmed quantities, site conditions, product selection, applicable requirements, and any necessary site assessment.

## 11. Safety and UX rules

- Never encourage a customer to test, dismantle, repair, or modify a suspected unsafe LPG system.
- Use plain language first and technical terms only where helpful.
- Include “Not sure” as a legitimate answer; do not force customers to guess.
- Show why each technical question matters.
- Do not block the first assessment step because the customer has no photos.
- Do not use artificial precision such as an estimate ending in exact pesos when the inputs are approximate.
- Do not imply that an online questionnaire verifies code compliance.
- Record the price-book and calculation-rule version used for every estimate.

## 12. Calibration plan

Select at least five completed or accurately priced residential LPG projects representing different complexity levels.

| Reference project | Class | Actual quoted price | Actual final cost | Model estimate | Variance | Reason for variance |
|---|---|---:|---:|---:|---:|---|
| Project 1 | A | TBD | TBD | TBD | TBD | TBD |
| Project 2 | A | TBD | TBD | TBD | TBD | TBD |
| Project 3 | B | TBD | TBD | TBD | TBD | TBD |
| Project 4 | B | TBD | TBD | TBD | TBD | TBD |
| Project 5 | C | TBD | TBD | Not eligible | N/A | Site visit expected |

Before launch, BNM3 should define:

- Acceptable estimate variance for Class A projects
- Acceptable estimate variance for Class B projects
- Maximum estimate value allowed without human review
- Minimum gross margin threshold
- Who can approve price-book changes

## 13. Review checklist for the BNM3 team

- [ ] Confirm the estimator and final approver.
- [ ] Confirm the response-time promise.
- [ ] Confirm the initial cities and service zones.
- [ ] Approve included and excluded work.
- [ ] Approve mandatory site-visit triggers.
- [ ] Complete the rate-card values.
- [ ] Define standard material brands/specifications or approved alternatives.
- [ ] Define warranty, estimate validity, tax, and payment rules.
- [ ] Provide at least five reference projects for calibration.
- [ ] Approve the customer disclaimer and emergency-message wording.
- [ ] Define the acceptable model variance and minimum margin.

## 14. Next implementation artifact

After this specification is reviewed, Milestone 2 can begin with a question-by-question Residential LPG assessment flow. Each question will map to one of four purposes:

1. Scope calculation
2. Risk or site-visit decision
3. Scheduling/logistics
4. Customer qualification and follow-up

Questions that do not influence one of those outcomes should not be included.
