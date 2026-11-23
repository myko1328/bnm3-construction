"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createAssessmentLead, createEstimatorLead, type CreatedLead, type LeadClassification } from "@/lib/api/leads";

const SERVICE = "Building water-based fire sprinkler system";
const QUESTIONNAIRE_VERSION = "fire-sprinkler-v2";
const ASSESSMENT_STORAGE_KEY = "bnm3-fire-sprinkler-assessment-v2";
const ESTIMATOR_STORAGE_KEY = "bnm3-fire-sprinkler-estimator-v2";
const PRICE_PER_PLANNING_HEAD = 5_000;
const LIGHT_HAZARD_REFERENCE_SQM = 20.9;
const ORDINARY_HAZARD_PLANNING_SQM = 12.1;

type Mode = "assessment" | "estimator";
type SafetyState = "" | "none" | "active_fire" | "uncontrolled_discharge" | "out_of_service" | "unsure";
type BuildingUse = "" | "residential_house" | "residential_multi" | "commercial_office" | "commercial_retail" | "commercial_hospitality" | "commercial_school" | "commercial_healthcare" | "warehouse" | "industrial" | "mixed" | "other" | "unsure";
type WorkType = "" | "new_new" | "new_existing" | "alteration" | "maintenance" | "unsure";
type Environment = "" | "ambient" | "cold" | "water_sensitive" | "existing_type" | "unsure";
type FirePumpState = "" | "yes" | "no" | "unsure";
type DimensionMode = "dimensions" | "total_area";
type Screen = "safety" | "building" | "work" | "floors" | "dimensions" | "environment" | "contact";

type ProjectAnswers = {
  safety: SafetyState;
  buildingUse: BuildingUse;
  workType: WorkType;
  existingSystem: "" | "yes" | "no" | "unsure";
  floors: string;
  basements: string;
  sameFloorSize: boolean;
  dimensionMode: DimensionMode;
  length: string;
  width: string;
  unit: "m" | "ft";
  totalArea: string;
  environment: Environment;
  existingSystemType: "" | "wet" | "dry" | "preaction" | "deluge" | "unsure";
  firePumpInstalled: FirePumpState;
};

type Contact = {
  name: string;
  phone: string;
  email: string;
  city: string;
  barangay: string;
  consent: boolean;
};

const INITIAL_ANSWERS: ProjectAnswers = {
  safety: "",
  buildingUse: "",
  workType: "",
  existingSystem: "",
  floors: "1",
  basements: "0",
  sameFloorSize: true,
  dimensionMode: "dimensions",
  length: "",
  width: "",
  unit: "m",
  totalArea: "",
  environment: "",
  existingSystemType: "",
  firePumpInstalled: "",
};

const INITIAL_CONTACT: Contact = { name: "", phone: "", email: "", city: "", barangay: "", consent: false };

const BUILDING_OPTIONS: Array<{ value: BuildingUse; label: string; note: string }> = [
  { value: "commercial_office", label: "Commercial office", note: "Offices and administrative spaces" },
  { value: "commercial_retail", label: "Shop or retail", note: "Stores, showrooms, and similar spaces" },
  { value: "commercial_hospitality", label: "Hotel or restaurant", note: "Hospitality and food-service buildings" },
  { value: "commercial_school", label: "School", note: "Classrooms and education facilities" },
  { value: "commercial_healthcare", label: "Healthcare", note: "Clinics, hospitals, and care facilities" },
  { value: "residential_house", label: "House", note: "Single-family residential building" },
  { value: "residential_multi", label: "Apartment or condominium", note: "Multi-unit residential building" },
  { value: "warehouse", label: "Warehouse or storage", note: "Storage arrangement needs technical review" },
  { value: "industrial", label: "Factory or industrial", note: "Process and production areas" },
  { value: "mixed", label: "Mixed use", note: "More than one use in the building" },
  { value: "other", label: "Other", note: "Describe it during BNM3 review" },
  { value: "unsure", label: "Not sure", note: "BNM3 will help classify the project" },
];

const BUILDING_LABELS = Object.fromEntries(BUILDING_OPTIONS.map((option) => [option.value, option.label])) as Record<BuildingUse, string>;
const WORK_LABELS: Record<WorkType, string> = {
  "": "Not answered",
  new_new: "New system in a new building",
  new_existing: "New system in an existing building",
  alteration: "Extension or alteration",
  maintenance: "Repair, inspection, or maintenance",
  unsure: "Not sure yet",
};
const ENVIRONMENT_LABELS: Record<Environment, string> = {
  "": "Not answered",
  ambient: "Normal occupied space",
  cold: "Freezer, cold room, or area below 4°C",
  water_sensitive: "Water-sensitive or high-value area",
  existing_type: "Existing system type is known",
  unsure: "Not sure",
};

const SCREENS: Screen[] = ["safety", "building", "work", "floors", "dimensions", "environment", "contact"];
const PROJECT_SCREENS: Screen[] = ["building", "work", "floors", "dimensions", "environment"];
const COMPLEX_BUILDINGS: BuildingUse[] = ["commercial_healthcare", "warehouse", "industrial", "mixed", "other", "unsure"];
const COUNT_ELIGIBLE_BUILDINGS: BuildingUse[] = ["residential_house", "residential_multi", "commercial_office", "commercial_retail", "commercial_hospitality", "commercial_school"];

function classificationLabel(value: LeadClassification) {
  return {
    qualified: "Qualified for follow-up",
    needs_clarification: "Needs clarification",
    site_inspection_likely: "Site inspection likely",
    outside_service_area: "Service area review",
    priority_review: "Priority review",
  }[value];
}

function formatPhp(value: number) {
  return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 }).format(value);
}

function finitePositive(value: string) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : 0;
}

function wholeNumber(value: string, fallback = 0) {
  const number = Number(value);
  return Number.isInteger(number) && number >= 0 ? number : fallback;
}

function areaSquareMetres(answers: ProjectAnswers) {
  if (answers.dimensionMode === "total_area") return finitePositive(answers.totalArea);
  const rawArea = finitePositive(answers.length) * finitePositive(answers.width);
  const squareMetres = answers.unit === "ft" ? rawArea * 0.092903 : rawArea;
  return squareMetres * Math.max(1, wholeNumber(answers.floors, 1));
}

function planningResult(answers: ProjectAnswers) {
  const floors = Math.max(1, wholeNumber(answers.floors, 1));
  const totalAreaSqm = areaSquareMetres(answers);
  const reasons: string[] = [];
  if (!COUNT_ELIGIBLE_BUILDINGS.includes(answers.buildingUse)) reasons.push("This building use needs technical classification before a planning count.");
  if (answers.workType !== "new_new") reasons.push("Existing-building, alteration, maintenance, and uncertain work needs a site-specific review before a planning count.");
  if (answers.environment !== "ambient") reasons.push("Cold, water-sensitive, existing-special, or unknown conditions need system-type review.");
  if (floors > 4) reasons.push("Projects above four included floors need technical review before a planning count.");
  if (!totalAreaSqm) reasons.push("Enter valid dimensions or total protected area.");
  if (reasons.length) return { eligible: false as const, totalAreaSqm, floors, low: 0, high: 0, reasons };

  const areaPerFloor = totalAreaSqm / floors;
  const lightReferenceHeads = Math.ceil(areaPerFloor / LIGHT_HAZARD_REFERENCE_SQM) * floors;
  const planningHeads = Math.ceil(areaPerFloor / ORDINARY_HAZARD_PLANNING_SQM) * floors;
  return {
    eligible: true as const,
    totalAreaSqm,
    floors,
    low: lightReferenceHeads,
    high: planningHeads,
    planningHeads,
    initialQuote: planningHeads * PRICE_PER_PLANNING_HEAD,
    reasons,
  };
}

function missingQuestions(answers: ProjectAnswers) {
  const missing: string[] = [];
  if (["unsure", "other"].includes(answers.buildingUse)) missing.push("Confirm the building use and applicable occupancy classification.");
  if (answers.workType === "unsure") missing.push("Confirm whether the project is new work, an alteration, or maintenance.");
  if (answers.existingSystem === "unsure") missing.push("Confirm whether a sprinkler system is already installed.");
  if (answers.environment === "unsure") missing.push("Confirm the protected-area environment and likely system type.");
  if (answers.firePumpInstalled === "unsure") missing.push("Confirm whether a fire pump is already installed for the building's fire-protection water supply.");
  return missing;
}

function projectSignals(answers: ProjectAnswers) {
  const floors = Math.max(1, wholeNumber(answers.floors, 1));
  return {
    requiresDrilling: false,
    unclearPipeRoute: ["cold", "water_sensitive", "existing_type", "unsure"].includes(answers.environment) || ["no", "unsure"].includes(answers.firePumpInstalled),
    multipleFloors: floors + wholeNumber(answers.basements) > 1,
    existingSystemModification: ["new_existing", "alteration", "maintenance"].includes(answers.workType),
    commercialProperty: COMPLEX_BUILDINGS.includes(answers.buildingUse),
    safetyConcern: ["out_of_service", "unsure"].includes(answers.safety),
  };
}

function Header({ mode }: { mode: Mode }) {
  return <header className="poc-header"><Link href="/"><Image src="/bnm3-logo.png" alt="BNM3 Construction" width={259} height={188} /></Link><div><span>BNM3 Construction</span><strong>{mode === "assessment" ? "Sprinkler assessment" : "Sprinkler initial quote"}</strong></div><Link className="poc-exit" href="/">Exit</Link></header>;
}

function Choice<T extends string>({ name, value, selected, label, note, onChange }: { name: string; value: T; selected: boolean; label: string; note?: string; onChange: (value: T) => void }) {
  return <label className={`poc-choice ${selected ? "selected" : ""}`}><input type="radio" name={name} value={value} checked={selected} onChange={() => onChange(value)} /><span><strong>{label}</strong>{note && <small>{note}</small>}</span></label>;
}

function EmergencyExit() {
  return <main className="poc-shell emergency-shell"><section className="poc-emergency" role="alert"><span className="poc-kicker">Stop this assessment</span><h1>Get immediate help.</h1><p>If anyone is in danger, contact local emergency services and follow your building&apos;s emergency procedures now. Do not use this form to diagnose the system or operate sprinkler valves.</p><p className="poc-disclaimer">When the immediate situation is controlled, qualified fire-protection personnel should inspect the affected system before it is treated as available.</p><Link className="poc-primary result-home" href="/">Return to BNM3 home</Link></section></main>;
}

function Assessment() {
  const [answers, setAnswers] = useState<ProjectAnswers>(INITIAL_ANSWERS);
  const [contact, setContact] = useState<Contact>(INITIAL_CONTACT);
  const [screen, setScreen] = useState<Screen>("safety");
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedLead, setSubmittedLead] = useState<CreatedLead | null>(null);

  useEffect(() => {
    const restoreTimer = window.setTimeout(() => {
      try {
        const stored = window.localStorage.getItem(ASSESSMENT_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as { answers?: Partial<ProjectAnswers>; screen?: Screen; submittedLead?: CreatedLead };
          if (parsed.answers) setAnswers({ ...INITIAL_ANSWERS, ...parsed.answers });
          if (parsed.screen && SCREENS.includes(parsed.screen)) setScreen(parsed.screen);
          if (parsed.submittedLead?.id && parsed.submittedLead.referenceCode) setSubmittedLead(parsed.submittedLead);
        }
      } catch { /* Ignore malformed browser drafts. */ }
      setReady(true);
    }, 0);
    return () => window.clearTimeout(restoreTimer);
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(ASSESSMENT_STORAGE_KEY, JSON.stringify({ answers, screen, submittedLead }));
  }, [answers, screen, submittedLead, ready]);

  const index = SCREENS.indexOf(screen);
  const projectNumber = PROJECT_SCREENS.indexOf(screen) + 1;
  const set = <K extends keyof ProjectAnswers>(key: K, value: ProjectAnswers[K]) => {
    setAnswers((current) => ({ ...current, [key]: value }));
    setError("");
  };

  const validationMessage = () => {
    if (screen === "safety" && !answers.safety) return "Choose the option that best describes the current situation.";
    if (screen === "building" && !answers.buildingUse) return "Choose the closest building use.";
    if (screen === "work" && (!answers.workType || (answers.workType !== "new_new" && !answers.existingSystem))) return "Choose the requested work and tell us whether a system is already installed.";
    if (screen === "floors" && (wholeNumber(answers.floors) < 1 || wholeNumber(answers.floors) > 100 || wholeNumber(answers.basements) > 20)) return "Enter 1–100 floors and no more than 20 basement levels.";
    if (screen === "dimensions" && !areaSquareMetres(answers)) return "Enter valid positive dimensions or a valid total protected area.";
    if (screen === "environment" && (!answers.environment || (answers.environment === "existing_type" && !answers.existingSystemType) || !answers.firePumpInstalled)) return "Choose the closest condition, provide any known system type, and tell us whether a fire pump is installed.";
    if (screen === "contact" && (!contact.name.trim() || contact.name.trim().length < 2 || contact.phone.trim().length < 7 || !contact.city.trim() || !contact.barangay.trim())) return "Add your name, mobile number, city or municipality, and barangay.";
    if (screen === "contact" && !contact.consent) return "Consent is required before BNM3 can store and review the request.";
    return "";
  };

  const next = () => {
    const message = validationMessage();
    if (message) return setError(message);
    if (screen === "safety" && ["active_fire", "uncontrolled_discharge"].includes(answers.safety)) return;
    setScreen(SCREENS[Math.min(index + 1, SCREENS.length - 1)]);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submit = async () => {
    const message = validationMessage();
    if (message || submitting || submittedLead) return setError(message);
    setSubmitting(true);
    setError("");
    const planning = planningResult(answers);
    try {
      const lead = await createAssessmentLead({
        source: "assessment",
        customer: { name: contact.name.trim(), phone: contact.phone.trim(), email: contact.email.trim() || undefined, consentedAt: new Date().toISOString() },
        project: { service: SERVICE, cityMunicipality: contact.city.trim(), barangay: contact.barangay.trim() },
        answers: {
          questionnaireVersion: QUESTIONNAIRE_VERSION,
          safetyState: answers.safety,
          buildingUse: answers.buildingUse,
          requestedWork: answers.workType,
          existingSystem: answers.workType === "new_new" ? "no" : answers.existingSystem,
          floors: wholeNumber(answers.floors, 1),
          basements: wholeNumber(answers.basements),
          sameFloorSize: answers.sameFloorSize,
          dimensionMode: answers.dimensionMode,
          length: answers.dimensionMode === "dimensions" ? finitePositive(answers.length) : undefined,
          width: answers.dimensionMode === "dimensions" ? finitePositive(answers.width) : undefined,
          dimensionUnit: answers.dimensionMode === "dimensions" ? answers.unit : undefined,
          totalAreaSqm: Number(planning.totalAreaSqm.toFixed(1)),
          environment: answers.environment,
          existingSystemType: answers.environment === "existing_type" ? answers.existingSystemType : undefined,
          firePumpInstalled: answers.firePumpInstalled,
        },
        missingQuestions: missingQuestions(answers),
        projectSignals: projectSignals(answers),
      });
      setSubmittedLead(lead);
      setContact(INITIAL_CONTACT);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "We could not submit your assessment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (["active_fire", "uncontrolled_discharge"].includes(answers.safety)) return <EmergencyExit />;

  if (submittedLead) return <main className="poc-shell"><Header mode="assessment" /><section className="poc-result"><span className="poc-kicker">Assessment received</span><h1>Your sprinkler request is in the lead queue.</h1><p>BNM3 can now review the five project answers through the same dashboard process used for other leads.</p><div className="result-reference"><span>Permanent reference</span><strong>{submittedLead.referenceCode}</strong><small>Keep this reference for follow-up.</small></div><div className="result-status review"><span>Preliminary route</span><strong>{classificationLabel(submittedLead.classification)}</strong></div><dl className="result-grid"><div><dt>Building</dt><dd>{BUILDING_LABELS[answers.buildingUse]}</dd></div><div><dt>Requested work</dt><dd>{WORK_LABELS[answers.workType]}</dd></div><div><dt>Included area</dt><dd>{areaSquareMetres(answers).toLocaleString("en-PH", { maximumFractionDigits: 1 })} m² across {answers.floors} floor(s)</dd></div><div><dt>System review signal</dt><dd>{ENVIRONMENT_LABELS[answers.environment]}</dd></div><div><dt>Fire pump</dt><dd>{answers.firePumpInstalled === "yes" ? "Reported installed" : answers.firePumpInstalled === "no" ? "Not installed" : "Not confirmed"}</dd></div></dl><div className="result-next"><h2>What happens next</h2><ul><li>Personnel verify the customer-provided information.</li><li>A qualified reviewer confirms system type, water supply, fire-pump suitability, and site-inspection needs.</li><li>Any budget remains indicative until the scope and quantities are reviewed.</li></ul></div><Link className="poc-primary result-home" href="/tools/fire-sprinkler-budget-estimator">Open initial quote estimator</Link><button className="poc-reset" type="button" onClick={() => { window.localStorage.removeItem(ASSESSMENT_STORAGE_KEY); setAnswers(INITIAL_ANSWERS); setSubmittedLead(null); setScreen("safety"); }}>Start another sprinkler assessment</button></section></main>;

  const title = screen === "safety" ? "Is there an urgent sprinkler problem now?" : screen === "building" ? "What kind of building is it?" : screen === "work" ? "Is this a new installation?" : screen === "floors" ? "How many floors are included?" : screen === "dimensions" ? "What are the approximate dimensions?" : screen === "environment" ? "Which condition best describes the area?" : "How can BNM3 reach you?";
  const intro = screen === "safety" ? "This first check keeps emergencies and impaired systems out of the normal estimating path." : screen === "building" ? "Choose the closest use. BNM3 will confirm the technical classification." : screen === "work" ? "This changes the records and site checks the team will need." : screen === "floors" ? "Count only the floors included in this sprinkler request." : screen === "dimensions" ? "A rough area is enough for planning. It does not determine the final sprinkler layout." : screen === "environment" ? "This helps flag wet, dry, preaction, or special-system review without selecting the final design." : "Your project questions are complete. Submit them for personnel review.";

  return <main className="poc-shell"><Header mode="assessment" /><div className="poc-progress"><div><span>{screen === "safety" ? "Safety check" : screen === "contact" ? "Your details" : `Question ${projectNumber} of 5`}</span><strong>Quick assessment</strong></div><progress value={index + 1} max={SCREENS.length}>{index + 1} of {SCREENS.length}</progress></div><section className="poc-card"><span className="poc-kicker">Building water-based fire sprinklers</span><h1>{title}</h1><p className="poc-intro">{intro}</p>
    {screen === "safety" && <fieldset className="poc-fieldset"><legend>Choose one</legend><div className="poc-choices"><Choice name="safety" value="none" selected={answers.safety === "none"} label="No urgent issue" note="This is a planned project or routine request" onChange={(value) => set("safety", value)} /><Choice name="safety" value="active_fire" selected={answers.safety === "active_fire"} label="Active fire or smoke" note="Stop the assessment and get immediate help" onChange={(value) => set("safety", value)} /><Choice name="safety" value="uncontrolled_discharge" selected={answers.safety === "uncontrolled_discharge"} label="Uncontrolled water discharge" note="Water is flowing or a major leak is active" onChange={(value) => set("safety", value)} /><Choice name="safety" value="out_of_service" selected={answers.safety === "out_of_service"} label="System may be out of service" note="Protection is shut down, damaged, or unavailable" onChange={(value) => set("safety", value)} /><Choice name="safety" value="unsure" selected={answers.safety === "unsure"} label="Not sure" note="Route the request for priority human review" onChange={(value) => set("safety", value)} /></div></fieldset>}
    {screen === "building" && <fieldset className="poc-fieldset"><legend>Commercial or non-commercial building use</legend><div className="poc-choices">{BUILDING_OPTIONS.map((option) => <Choice key={option.value} name="building" value={option.value} selected={answers.buildingUse === option.value} label={option.label} note={option.note} onChange={(value) => set("buildingUse", value)} />)}</div></fieldset>}
    {screen === "work" && <><fieldset className="poc-fieldset"><legend>Requested work</legend><div className="poc-choices"><Choice name="work" value="new_new" selected={answers.workType === "new_new"} label="New system · new building" onChange={(value) => { set("workType", value); set("existingSystem", "no"); }} /><Choice name="work" value="new_existing" selected={answers.workType === "new_existing"} label="New system · existing building" onChange={(value) => set("workType", value)} /><Choice name="work" value="alteration" selected={answers.workType === "alteration"} label="Extension or alteration" onChange={(value) => set("workType", value)} /><Choice name="work" value="maintenance" selected={answers.workType === "maintenance"} label="Repair, inspection, or maintenance" onChange={(value) => set("workType", value)} /><Choice name="work" value="unsure" selected={answers.workType === "unsure"} label="Not sure" onChange={(value) => set("workType", value)} /></div></fieldset>{answers.workType && answers.workType !== "new_new" && <fieldset className="poc-fieldset"><legend>Is a sprinkler system already installed?</legend><div className="poc-choices"><Choice name="existing" value="yes" selected={answers.existingSystem === "yes"} label="Yes" onChange={(value) => set("existingSystem", value)} /><Choice name="existing" value="no" selected={answers.existingSystem === "no"} label="No" onChange={(value) => set("existingSystem", value)} /><Choice name="existing" value="unsure" selected={answers.existingSystem === "unsure"} label="Not sure" onChange={(value) => set("existingSystem", value)} /></div></fieldset>}</>}
    {screen === "floors" && <div className="poc-two"><label className="poc-input">Above-ground floors included<input type="number" min="1" max="100" inputMode="numeric" value={answers.floors} onChange={(event) => set("floors", event.target.value)} /></label><label className="poc-input">Basement levels included<input type="number" min="0" max="20" inputMode="numeric" value={answers.basements} onChange={(event) => set("basements", event.target.value)} /></label><label className="poc-consent"><input type="checkbox" checked={answers.sameFloorSize} onChange={(event) => set("sameFloorSize", event.target.checked)} /><span>The included floors are approximately the same size.</span></label></div>}
    {screen === "dimensions" && <><fieldset className="poc-fieldset"><legend>How would you like to enter the size?</legend><div className="poc-choices"><Choice name="dimension-mode" value="dimensions" selected={answers.dimensionMode === "dimensions"} label="Length × width" note="Use a typical included floor" onChange={(value) => set("dimensionMode", value)} /><Choice name="dimension-mode" value="total_area" selected={answers.dimensionMode === "total_area"} label="Total protected area" note="Combined area across all included floors" onChange={(value) => set("dimensionMode", value)} /></div></fieldset>{answers.dimensionMode === "dimensions" ? <><div className="poc-two"><label className="poc-input">Approximate length<input type="number" min="0" step="0.1" inputMode="decimal" value={answers.length} onChange={(event) => set("length", event.target.value)} /></label><label className="poc-input">Approximate width<input type="number" min="0" step="0.1" inputMode="decimal" value={answers.width} onChange={(event) => set("width", event.target.value)} /></label></div><label className="poc-input">Measurement unit<select value={answers.unit} onChange={(event) => set("unit", event.target.value as "m" | "ft")}><option value="m">Metres</option><option value="ft">Feet</option></select></label></> : <label className="poc-input">Total protected area in square metres<input type="number" min="0" step="0.1" inputMode="decimal" value={answers.totalArea} onChange={(event) => set("totalArea", event.target.value)} /></label>}</>}
    {screen === "environment" && <><fieldset className="poc-fieldset"><legend>Closest area condition</legend><div className="poc-choices"><Choice name="environment" value="ambient" selected={answers.environment === "ambient"} label="Normal occupied space" note="No freezer or cold-storage area" onChange={(value) => set("environment", value)} /><Choice name="environment" value="cold" selected={answers.environment === "cold"} label="Freezer or cold room" note="An area may fall below 4°C" onChange={(value) => set("environment", value)} /><Choice name="environment" value="water_sensitive" selected={answers.environment === "water_sensitive"} label="Water-sensitive area" note="Special release control may need review" onChange={(value) => set("environment", value)} /><Choice name="environment" value="existing_type" selected={answers.environment === "existing_type"} label="Existing type is known" note="Record the current system type" onChange={(value) => set("environment", value)} /><Choice name="environment" value="unsure" selected={answers.environment === "unsure"} label="Not sure" note="BNM3 will verify this" onChange={(value) => set("environment", value)} /></div></fieldset>{answers.environment === "existing_type" && <label className="poc-input">Known existing type<select value={answers.existingSystemType} onChange={(event) => set("existingSystemType", event.target.value as ProjectAnswers["existingSystemType"])}><option value="">Select a type</option><option value="wet">Wet pipe</option><option value="dry">Dry pipe</option><option value="preaction">Preaction</option><option value="deluge">Deluge</option><option value="unsure">Not sure</option></select></label>}<fieldset className="poc-fieldset sprinkler-pump-question"><legend>Is a fire pump already installed for this building&apos;s fire-protection water supply?</legend><p className="poc-field-help">A fire pump increases water pressure when the available supply is not adequate. BNM3 must still verify its condition and suitability.</p><div className="poc-choices"><Choice name="fire-pump" value="yes" selected={answers.firePumpInstalled === "yes"} label="Yes" onChange={(value) => set("firePumpInstalled", value)} /><Choice name="fire-pump" value="no" selected={answers.firePumpInstalled === "no"} label="No" onChange={(value) => set("firePumpInstalled", value)} /><Choice name="fire-pump" value="unsure" selected={answers.firePumpInstalled === "unsure"} label="Not sure" onChange={(value) => set("firePumpInstalled", value)} /></div></fieldset></>}
    {screen === "contact" && <><div className="poc-two"><label className="poc-input">Your name<input autoComplete="name" value={contact.name} onChange={(event) => { setContact((current) => ({ ...current, name: event.target.value })); setError(""); }} /></label><label className="poc-input">Mobile number<input type="tel" autoComplete="tel" value={contact.phone} onChange={(event) => { setContact((current) => ({ ...current, phone: event.target.value })); setError(""); }} /></label><label className="poc-input">Email (optional)<input type="email" autoComplete="email" value={contact.email} onChange={(event) => setContact((current) => ({ ...current, email: event.target.value }))} /></label><label className="poc-input">City or municipality<input autoComplete="address-level2" value={contact.city} onChange={(event) => { setContact((current) => ({ ...current, city: event.target.value })); setError(""); }} /></label><label className="poc-input">Barangay<input autoComplete="address-level3" value={contact.barangay} onChange={(event) => { setContact((current) => ({ ...current, barangay: event.target.value })); setError(""); }} /></label></div><label className="poc-consent"><input type="checkbox" checked={contact.consent} onChange={(event) => { setContact((current) => ({ ...current, consent: event.target.checked })); setError(""); }} /><span>I agree that BNM3 may securely store these project details and contact me about this request.</span></label></>}
    {error && <p className="poc-error" role="alert">{error}</p>}<div className="poc-actions">{index > 0 ? <button className="poc-secondary" type="button" onClick={() => { setScreen(SCREENS[index - 1]); setError(""); }}>Back</button> : <span />}{screen === "contact" ? <button className="poc-primary" type="button" disabled={submitting} onClick={submit}>{submitting ? "Submitting…" : "Submit for review"}</button> : <button className="poc-primary" type="button" onClick={next}>Continue →</button>}</div><p className="poc-save">Project answers are saved on this device. Contact details are not saved in browser storage.</p></section></main>;
}

function Estimator() {
  const [answers, setAnswers] = useState<ProjectAnswers>({ ...INITIAL_ANSWERS, safety: "none", environment: "ambient", buildingUse: "commercial_office", workType: "new_new" });
  const [contact, setContact] = useState<Contact>(INITIAL_CONTACT);
  const [showContact, setShowContact] = useState(false);
  const [submittedLead, setSubmittedLead] = useState<CreatedLead | null>(null);
  const [ready, setReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const result = useMemo(() => planningResult(answers), [answers]);

  useEffect(() => {
    const restoreTimer = window.setTimeout(() => {
      try {
        const stored = window.localStorage.getItem(ESTIMATOR_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as { answers?: Partial<ProjectAnswers>; submittedLead?: CreatedLead };
          if (parsed.answers) setAnswers((current) => ({ ...current, ...parsed.answers }));
          if (parsed.submittedLead?.id && parsed.submittedLead.referenceCode) setSubmittedLead(parsed.submittedLead);
        }
      } catch { /* Ignore malformed browser snapshots. */ }
      setReady(true);
    }, 0);
    return () => window.clearTimeout(restoreTimer);
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(ESTIMATOR_STORAGE_KEY, JSON.stringify({ answers, submittedLead }));
  }, [answers, submittedLead, ready]);

  const set = <K extends keyof ProjectAnswers>(key: K, value: ProjectAnswers[K]) => { setAnswers((current) => ({ ...current, [key]: value })); setError(""); };

  const submit = async () => {
    if (!contact.name.trim() || contact.name.trim().length < 2 || contact.phone.trim().length < 7 || !contact.city.trim() || !contact.barangay.trim()) return setError("Add your name, mobile number, city or municipality, and barangay.");
    if (!contact.consent) return setError("Consent is required before BNM3 can store and review this estimator configuration.");
    if (submitting || submittedLead) return;
    setSubmitting(true);
    setError("");
    try {
      const lead = await createEstimatorLead({
        source: "estimator",
        customer: { name: contact.name.trim(), phone: contact.phone.trim(), consentedAt: new Date().toISOString() },
        project: { service: SERVICE, cityMunicipality: contact.city.trim(), barangay: contact.barangay.trim() },
        answers: {
          questionnaireVersion: QUESTIONNAIRE_VERSION,
          buildingUse: answers.buildingUse,
          requestedWork: answers.workType,
          floors: result.floors,
          basements: wholeNumber(answers.basements),
          dimensionMode: answers.dimensionMode,
          length: answers.dimensionMode === "dimensions" ? finitePositive(answers.length) : undefined,
          width: answers.dimensionMode === "dimensions" ? finitePositive(answers.width) : undefined,
          dimensionUnit: answers.dimensionMode === "dimensions" ? answers.unit : undefined,
          totalAreaSqm: Number(result.totalAreaSqm.toFixed(1)),
          environment: answers.environment,
          firePumpInstalled: answers.firePumpInstalled,
          estimatorConfiguration: { version: "sprinkler-initial-quote-v2", eligible: result.eligible, planningHeadsLow: result.low, planningHeadsHigh: result.high, pricingHeadCount: result.eligible ? result.planningHeads : undefined, pricePerPlanningHead: PRICE_PER_PLANNING_HEAD, maximumSpacingReferenceMetres: 4.6, coverageFactorsSqm: [LIGHT_HAZARD_REFERENCE_SQM, ORDINARY_HAZARD_PLANNING_SQM], assumptions: ["Indicative sprinkler-head supply and installation allowance only", "Pricing count uses 12.1 m² per head and rounds each included floor separately", "Final quantity requires qualified layout, listing, obstruction, and hydraulic review", "Fire pump, tank, pipework, valves, testing, professional services, and permits are excluded"] },
        },
        missingQuestions: result.eligible ? [] : result.reasons,
        projectSignals: projectSignals(answers),
        estimate: result.eligible ? { currency: "PHP", minimum: result.initialQuote, maximum: result.initialQuote, assumptions: [`${formatPhp(PRICE_PER_PLANNING_HEAD)} per planning sprinkler head`, "Indicative initial allowance only; not a binding quotation", "Fire pump and other system components are excluded"] } : undefined,
      });
      setSubmittedLead(lead);
      setContact(INITIAL_CONTACT);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "We could not submit your review request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return <main className="poc-shell estimator-shell sprinkler-estimator"><Header mode="estimator" /><section className="estimator-heading"><div><span className="poc-kicker">One-page initial quote</span><h1>Sprinkler budget planning starts with area.</h1><p>Enter the protected area to see an indicative sprinkler-head allowance using BNM3&apos;s current per-head planning rate.</p></div><div className="estimator-demo"><strong>{formatPhp(PRICE_PER_PLANNING_HEAD)} per planning head</strong><span>The initial quote covers the planning sprinkler-head allowance only. It is not a system design or binding quotation.</span></div></section><div className="estimator-layout"><section className="estimator-controls" aria-label="Sprinkler estimator inputs"><div className="estimator-section"><span>Project inputs</span><strong>Area, conditions, and existing fire pump · results update immediately</strong></div>
    <label className="estimator-field">Building use<select value={answers.buildingUse} onChange={(event) => set("buildingUse", event.target.value as BuildingUse)}>{BUILDING_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
    <label className="estimator-field">Work type<select value={answers.workType} onChange={(event) => set("workType", event.target.value as WorkType)}><option value="new_new">New system · new building</option><option value="new_existing">New system · existing building</option><option value="alteration">Extension or alteration</option><option value="maintenance">Repair, inspection, or maintenance</option><option value="unsure">Not sure</option></select></label>
    <div className="poc-two"><label className="estimator-field">Floors included<input type="number" min="1" max="100" value={answers.floors} onChange={(event) => set("floors", event.target.value)} /></label><label className="estimator-field">Basements<input type="number" min="0" max="20" value={answers.basements} onChange={(event) => set("basements", event.target.value)} /></label></div>
    <label className="estimator-field">Area entry<select value={answers.dimensionMode} onChange={(event) => set("dimensionMode", event.target.value as DimensionMode)}><option value="dimensions">Length × width per typical floor</option><option value="total_area">Total protected area</option></select></label>
    {answers.dimensionMode === "dimensions" ? <><div className="poc-two"><label className="estimator-field">Length<input type="number" min="0" step="0.1" value={answers.length} onChange={(event) => set("length", event.target.value)} /></label><label className="estimator-field">Width<input type="number" min="0" step="0.1" value={answers.width} onChange={(event) => set("width", event.target.value)} /></label></div><label className="estimator-field">Unit<select value={answers.unit} onChange={(event) => set("unit", event.target.value as "m" | "ft")}><option value="m">Metres</option><option value="ft">Feet</option></select></label></> : <label className="estimator-field">Total protected area (m²)<input type="number" min="0" step="0.1" value={answers.totalArea} onChange={(event) => set("totalArea", event.target.value)} /></label>}
    <label className="estimator-field">Area condition<select value={answers.environment} onChange={(event) => set("environment", event.target.value as Environment)}><option value="ambient">Normal occupied space</option><option value="cold">Freezer / cold room / below 4°C</option><option value="water_sensitive">Water-sensitive or high-value area</option><option value="existing_type">Existing special system type</option><option value="unsure">Not sure</option></select></label>
    <label className="estimator-field">Existing fire pump<select value={answers.firePumpInstalled} onChange={(event) => set("firePumpInstalled", event.target.value as FirePumpState)}><option value="">Select an answer</option><option value="yes">Yes, a fire pump is installed</option><option value="no">No fire pump is installed</option><option value="unsure">Not sure</option></select><small>A fire pump is the dedicated pump used to increase pressure for a fire-protection water supply. Its adequacy still requires technical verification.</small></label>
  </section><section className="estimator-output" aria-live="polite"><span className="estimator-eyebrow">Initial indicative quote</span><div className="sprinkler-area"><strong>{result.totalAreaSqm ? result.totalAreaSqm.toLocaleString("en-PH", { maximumFractionDigits: 1 }) : "—"}</strong><span>m² interpreted protected area</span></div>{result.eligible ? <><div className="estimator-total"><strong>{formatPhp(result.initialQuote)}</strong><span>{result.planningHeads} planning sprinkler heads × {formatPhp(PRICE_PER_PLANNING_HEAD)}</span></div><p>BNM3&apos;s pricing allowance uses {ORDINARY_HAZARD_PLANNING_SQM} m² per head and rounds each floor separately. It is a budgeting allowance—not a sprinkler layout, required count, or compliance result.</p><dl className="estimator-breakdown"><div><dt>Maximum spacing reference</dt><dd>4.6 m (15 ft), subject to applicable rules</dd></div><div><dt>Pricing head count</dt><dd>{result.planningHeads} at {ORDINARY_HAZARD_PLANNING_SQM} m²/head</dd></div><div><dt>Light-hazard reference</dt><dd>{result.low} at {LIGHT_HAZARD_REFERENCE_SQM} m²/head</dd></div><div><dt>Existing fire pump</dt><dd>{answers.firePumpInstalled === "yes" ? "Customer reports installed" : answers.firePumpInstalled === "no" ? "Not installed · excluded from quote" : "Not confirmed · review required"}</dd></div></dl></> : <div className="estimator-notice"><strong>Technical review before an initial quote</strong><p>{result.reasons.join(" ")}</p></div>}{result.eligible && answers.firePumpInstalled !== "yes" && <div className="estimator-notice"><strong>Fire pump not included</strong><p>{answers.firePumpInstalled === "no" ? "This initial quote does not include a new fire pump, controller, power supply, tank, or related installation." : "Confirm whether a fire pump is installed. Any required pump, controller, power supply, tank, or related installation is outside this initial quote."}</p></div>}<div className="estimator-notice"><strong>Indicative head allowance only</strong><p>Ceiling construction, walls, obstructions, sprinkler listing, storage, water supply, pipework, valves, pumps, tanks, testing, professional services, and permits can change the final scope and price.</p></div>
    {!submittedLead && !showContact && <div className="estimator-contact-actions"><button className="poc-primary" type="button" onClick={() => setShowContact(true)}>Request BNM3 pricing review</button><Link className="poc-secondary result-home" href="/assessment/fire-sprinkler">Start full assessment</Link></div>}
    {showContact && !submittedLead && <div className="estimator-lead-form"><div><span className="estimator-eyebrow">Optional lead submission</span><h2>Ask BNM3 to review this configuration</h2><p>The calculator stays anonymous until you submit these details.</p></div><div className="poc-two"><label className="estimator-field">Name<input autoComplete="name" value={contact.name} onChange={(event) => setContact((current) => ({ ...current, name: event.target.value }))} /></label><label className="estimator-field">Mobile number<input type="tel" autoComplete="tel" value={contact.phone} onChange={(event) => setContact((current) => ({ ...current, phone: event.target.value }))} /></label><label className="estimator-field">City or municipality<input value={contact.city} onChange={(event) => setContact((current) => ({ ...current, city: event.target.value }))} /></label><label className="estimator-field">Barangay<input value={contact.barangay} onChange={(event) => setContact((current) => ({ ...current, barangay: event.target.value }))} /></label></div><label className="poc-consent"><input type="checkbox" checked={contact.consent} onChange={(event) => setContact((current) => ({ ...current, consent: event.target.checked }))} /><span>I agree that BNM3 may store this planning configuration and contact me about the project.</span></label>{error && <p className="poc-error" role="alert">{error}</p>}<div className="estimator-form-actions"><button className="poc-secondary" type="button" onClick={() => { setShowContact(false); setError(""); }}>Cancel</button><button className="poc-primary" type="button" disabled={submitting} onClick={submit}>{submitting ? "Submitting…" : "Submit review request"}</button></div></div>}
    {submittedLead && <div className="estimator-lead-confirmation"><span>Review request received</span><strong>{submittedLead.referenceCode}</strong><p>Your exact planning configuration is attached to this estimator lead for dashboard review.</p></div>}
  </section></div></main>;
}

export default function FireSprinklerExperience({ mode }: { mode: Mode }) {
  return mode === "assessment" ? <Assessment /> : <Estimator />;
}
