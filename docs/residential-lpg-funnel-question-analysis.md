# Residential LPG Funnel — Question and Variable Analysis

**Status:** Approved research direction for proof-of-concept design  
**Current objective:** Demonstrate how a structured digital assessment qualifies a project and prepares it for quotation.  
**POC boundary:** No automatic peso estimate yet. The result is a personalized scope summary, complexity classification, missing-information list, and recommended next step.

## 1. Research basis

The funnel questions are based on variables that affect system sizing, material quantity, labor, risk, or whether remote quotation is appropriate.

- The BFP Revised IRR states that LPG piping within buildings involves considerations such as gas-leak sensors, controllers and automatic shutoff devices, accessible isolation valves, restricted routing locations, inspection/testing, labeling, and accessibility. These requirements justify asking about routing, detector/shutoff scope, existing conditions, and accessibility. [BFP Revised IRR of RA 9514](https://region6.bfp.gov.ph/wp-content/uploads/2022/09/Revised-Implementing-Rules-and-Regulations-RIRR-of-RA-9514-The-Fire-Code-of-the-Philippines.pdf)
- RA 9514 applies fire-safety requirements to private and public buildings and gives the BFP enforcement authority. The funnel must therefore avoid presenting an online result as compliance approval. [Revised Fire Code of the Philippines](https://lawphil.net/statutes/repacts/ra2008/ra_9514_2008.html)
- RA 11592 distinguishes centralized LPG piping systems and places registration and safety responsibilities on relevant owners/operators. Multi-unit or centralized arrangements should leave the simple residential path and receive technical review. [LPG Industry Regulation Act](https://lawphil.net/statutes/repacts/ra2021/ra_11592_2021.html)
- DOE consumer guidance emphasizes cylinder ventilation/accessibility, cylinder and appliance condition, connections, and professional checking after a suspected leak. These support the cylinder-location, existing-condition, and emergency-routing questions. [DOE LPG consumer safety guidance](https://legacy.doe.gov.ph/sites/default/files/pdf/consumer_connect/lpg_consumer_and_safety_tips.pdf)
- Manufacturer technical guidance sizes LPG piping using total appliance demand and the length to the furthest appliance; it also requires understanding the capacity carried by each pipe section. These are the strongest technical reasons to collect appliance count/type, nameplate input when available, route length, and branching. [RegO LP-Gas Serviceman’s Manual](https://www.regoproducts.com/PDFs/L-545_Servicemans_Manual.pdf)

These sources inform the questions but do not replace BNM3's technical judgment, current local requirements, manufacturer instructions, or project-specific design.

## 2. What the proof of concept must demonstrate

The first funnel should show the family that a digital process can:

1. Ask different questions based on previous answers.
2. Reject emergencies and unsuitable projects safely.
3. Capture the variables an estimator would otherwise request through several messages or calls.
4. Work even when the customer has no photos or technical knowledge.
5. Produce a structured project brief for BNM3.
6. Classify the lead as **Standard**, **Needs Technical Review**, or **Site Visit Required**.
7. Show the customer what happens next.

It does not need automatic material pricing, authentication, a dashboard, CRM integration, or all three service funnels to prove the model.

## 3. Variable priority

### Tier 1 — Required for a useful quotation request

| Variable | Why it matters | Pricing/scope effect |
|---|---|---|
| Requested work | Establishes whether this is new work, replacement, extension, or inspection | Determines base workflow and labor type |
| Property/occupancy type | Separates a simple home from multi-unit, mixed-use, or commercial work | May force technical review |
| Project location | Determines serviceability and mobilization | Travel, crew time, and site-visit availability |
| Appliance types and quantities | Establishes connected demand and number of endpoints | Pipe/regulator sizing input, connection materials, labor |
| Appliance rated input, when known | Improves load calculation accuracy | Technical sizing input |
| Cylinder count, size, and arrangement | Describes supply arrangement | Regulator, manifold, storage, and review requirements |
| Cylinder location | Affects route, ventilation/access, and safety review | Materials, routing, and site-visit decision |
| Furthest estimated pipe length | Core material quantity and pipe-sizing input | Pipe quantity and sizing |
| Number of appliance points/branches | Indicates line sections, fittings, and valves | Fittings, valves, pipe sections, labor |
| Floors and route type | Identifies vertical, concealed, underground, or difficult routing | Labor, access equipment, penetrations, restoration |
| Existing system status | Distinguishes new work from repair/replacement risk | Removal, testing, investigation, contingency |

### Tier 2 — Required for confidence and labor adjustment

| Variable | Why it matters | Pricing/scope effect |
|---|---|---|
| Wall/floor/ceiling materials | Indicates drilling and restoration effort | Tools, labor, consumables, restoration |
| Working height | Indicates ladder/scaffold and safety needs | Access equipment and labor |
| Occupied or under construction | Changes access and protection requirements | Scheduling and productivity |
| Available route photos or sketch | Validates measurements and constraints | Narrows estimate range; optional for POC |
| Access and work-hour restrictions | Reveals subdivision/condo/occupied-site constraints | Mobilization and productivity |
| Gas detector scope | Adds detection points and electrical/control work | Equipment, wiring, testing |
| Automatic shutoff scope | Adds valve/controller integration | Equipment, labor, testing |
| Desired schedule | Helps capacity planning and urgency review | Scheduling; rush work only if BNM3 allows it |

### Tier 3 — Useful later, not necessary for the POC

- Exact product brand preference
- Detailed pipe material/diameter selection by the customer
- Exact fitting count
- Permit and documentation package selections
- Payment terms
- Warranty upgrades
- Maintenance-plan enrollment
- Full customer account creation

Technical selections should be made or verified by BNM3 rather than forced on nontechnical customers.

## 4. Recommended POC funnel

The visible funnel should contain no more than eight customer-facing stages. Conditional questions keep each path short.

### Stage 0 — Emergency gate

**Question:** Do you currently smell gas or suspect an active LPG leak?

- Yes — stop the assessment and show BNM3-approved emergency guidance; do not calculate or encourage troubleshooting.
- No — continue.
- Not sure — show a caution message and route to direct assistance rather than an online quote.

**Purpose:** Safety routing only. This answer must never increase or decrease a price.

### Stage 1 — What do you need?

**Question:** What would you like BNM3 to help with?

- New LPG piping installation
- Extend an existing system
- Replace or upgrade an existing system
- Add gas-leak detection and automatic shutoff
- Inspect an existing system
- Not sure — help me assess it

**Conditional follow-up:** If existing work is selected, ask whether it is currently operating and whether there is known damage, corrosion, modification, or repeated leakage.

### Stage 2 — Tell us about the property

**Questions:**

- What type of property is this?
  - Detached house
  - Townhouse/duplex
  - Condominium unit
  - Apartment or multi-unit property
  - Mixed residential/business use
  - Other
- What stage is the property in?
  - Planning/design
  - Under construction
  - Renovation
  - Occupied home
- How many floors will the LPG route cross?

**Routing rule:** Multi-unit, mixed-use, or centralized arrangements require technical review and may require a site visit.

### Stage 3 — Appliances and gas demand

**Question:** Which LPG appliances will be connected?

Allow quantities for:

- Cooktop or range
- Oven
- Water heater
- Outdoor grill
- Dryer
- Generator
- Other

**Optional expert input:** Can you provide the rated gas input from each appliance nameplate?

- Enter value and unit
- Upload/nameplate photo later
- Not sure

Customers should be allowed to continue without technical ratings. Missing ratings lower confidence and trigger estimator verification.

### Stage 4 — LPG supply and cylinder location

**Questions:**

- How many cylinders will supply the system?
- What cylinder size is planned or currently used?
- Will cylinders operate one at a time or through a changeover/manifold arrangement?
- Where are or will the cylinders be located?
  - Outdoors beside the house
  - Outdoor ventilated cabinet
  - Separate service area
  - Inside the kitchen/home
  - Condominium/service area
  - Not decided
- Is the location ventilated and readily accessible?
  - Yes
  - No
  - Not sure

**Routing rule:** Indoor, undecided, inaccessible, multi-cylinder manifold, or unusual locations require technical review.

### Stage 5 — Pipe route and quantity drivers

**Questions:**

- Approximately how far is the cylinder location from the furthest appliance?
  - Under 5 m
  - 5–10 m
  - 11–20 m
  - Over 20 m
  - Not sure
- How many separate appliance connection points are needed?
- Which route conditions apply? Select all that apply.
  - Exposed along a wall
  - Above a ceiling
  - Concealed inside a wall
  - Through concrete/masonry
  - Across floors
  - Underground
  - Outdoor/weather-exposed
  - Not sure
- Approximately how many wall or floor penetrations are expected?
- What is the highest working point?
  - Below 2 m
  - 2–4 m
  - Above 4 m
  - Not sure

**Routing rule:** Underground, mostly concealed, several-floor, or high-access routes should normally require review/site assessment.

### Stage 6 — Safety system options

**Questions:**

- Is gas-leak detection already installed?
  - Yes
  - No
  - Not sure
- Would you like BNM3 to include gas-leak detection in the assessment?
- Would you like an automatic gas shutoff included?
- Is an accessible main isolation valve already present?
  - Yes
  - No
  - Not sure
- Is electrical power available near the proposed controller/detector area?
  - Yes
  - No
  - Not sure

The UI should explain that final detector quantity and placement are subject to technical review.

### Stage 7 — Access, timing, and optional evidence

**Questions:**

- Are there work-hour, subdivision, condominium, parking, or access restrictions?
- When would you like the work assessed or completed?
- Would you like to add photos or a simple sketch?
  - Cylinder/proposed cylinder area
  - Appliance area
  - Proposed pipe route
  - Existing LPG equipment
- Is there anything else the estimator should know?

Uploads are optional. The no-photo path must remain complete.

### Stage 8 — Location and contact

**Questions:**

- City/municipality
- Barangay or project area
- Customer name
- Mobile number
- Email address, optional
- Preferred contact method
- Consent to be contacted about this assessment

Ask for the exact street address only when BNM3 needs to schedule a visit.

## 5. Conditional logic summary

```text
Active leak or uncertain emergency
  → Stop funnel
  → Safety message and direct assistance

Simple house + standard cylinder arrangement + accessible short route
  → Standard project
  → Show structured scope summary
  → Request technical review

Missing appliance ratings/photos but otherwise standard
  → Continue without blocking
  → Moderate confidence
  → Estimator verifies missing details

Multi-unit/mixed-use/centralized supply/complex route/existing damage
  → Do not imply instant quotation
  → Site visit or technical review required
```

## 6. POC result screen

The proof-of-concept result should display:

- **Project type:** e.g., New residential LPG installation
- **Property:** e.g., Occupied two-storey detached house
- **Supply:** e.g., Two cylinders; changeover arrangement needs confirmation
- **Demand:** e.g., Two appliance points; rated input not yet provided
- **Route:** e.g., Estimated 5–10 m, exposed wall route, two penetrations
- **Safety options:** e.g., Detector and automatic shutoff requested
- **Assessment status:** Standard / Technical Review / Site Visit Required
- **Information still needed:** a short dynamic list
- **Next step:** Submit to BNM3 or revise answers

For the family demonstration, this personalized output is the proof: customer answers are transformed into an estimator-ready brief. Peso pricing should be added only after the family validates the questions and supplies real rates.

## 7. Questions intentionally excluded from the first screen flow

- “What pipe diameter do you want?” — technical selection, not a customer decision.
- “How many elbows and tees?” — usually unreliable before route confirmation.
- “Does this comply with the Fire Code?” — cannot be responsibly self-declared by the customer.
- “What is your exact budget?” — useful for qualification but not required to calculate physical scope; add later if BNM3 wants it.
- Full legal address — premature before visit scheduling.
- Account password — unnecessary friction for a POC.

## 8. POC acceptance criteria

- The common standard path takes approximately 3–5 minutes.
- A customer can complete it without knowing pipe sizes or LPG technical terminology.
- No photo is required.
- Emergency answers safely stop the quotation flow.
- Complex property/supply/route answers trigger review instead of a misleading result.
- The final summary contains the Tier 1 variables needed to begin estimating.
- The form is usable by keyboard and screen reader and works at 320 px width.
- No submission is presented as a final quotation or compliance approval.

## 9. Family-review decisions before coding pricing

The family does not need to define the entire future platform. For the POC, they only need to answer:

1. Are these the same facts you normally ask a residential LPG customer?
2. Which answer should immediately require a site visit?
3. Which property types will BNM3 accept at launch?
4. Which cities can BNM3 realistically serve?
5. Who receives the completed assessment?
6. What response time can BNM3 promise?

