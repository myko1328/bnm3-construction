"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import Select, { SingleValue } from "react-select";
import { getAllMunicipalities, getBarangaysByMunicipality, getProvinceByCode } from "@aivangogh/ph-address";
import { createAssessmentLead, createEstimatorLead, type AssessmentLeadInput, type CreatedLead, type EstimatorLeadInput, type LeadClassification } from "@/lib/api/leads";

type Answers = Record<string, string>;
type Choice = { value: string; label: string; hint?: string };
type EquipmentOption = { value: string; label: string };
type LocationOption = { value: string; label: string; name: string };
type ScreenId = "work" | "existing" | "property" | "access" | "appliances" | "location" | "contact";
type EstimateConfig = { pipeLength: string; points: string; floors: string; route: string; protection: string };
type EstimatorIntent = "official_review" | "callback";
type EstimatorLeadForm = { name: string; phone: string; cityCode: string; city: string; barangayCode: string; barangay: string; streetAddress: string; houseNumber: string; consent: boolean };

const STORAGE_KEY = "bnm3-residential-lpg-poc-v4";
const EMPTY_ESTIMATOR_LEAD_FORM: EstimatorLeadForm = { name: "", phone: "", cityCode: "", city: "", barangayCode: "", barangay: "", streetAddress: "", houseNumber: "", consent: false };

const equipmentOptions: EquipmentOption[] = [
  { value: "tabletop-stove", label: "Tabletop gas stove (single or double burner)" },
  { value: "freestanding-range", label: "Freestanding gas range" },
  { value: "built-in-hob", label: "Built-in gas hob / cooktop" },
  { value: "gas-oven", label: "Gas oven" },
  { value: "water-heater", label: "LPG water heater" },
  { value: "clothes-dryer", label: "LPG clothes dryer" },
  { value: "outdoor-grill", label: "Outdoor barbecue grill" },
  { value: "commercial-range", label: "Commercial cooking range" },
  { value: "wok-range", label: "Wok range / Chinese burner" },
  { value: "stock-pot-burner", label: "Stock-pot burner / soup burner" },
  { value: "rice-cooker", label: "Commercial gas rice cooker" },
  { value: "deep-fryer", label: "Gas deep fryer" },
  { value: "griddle", label: "Gas griddle / hot plate" },
  { value: "charbroiler", label: "Charbroiler / lava-rock grill" },
  { value: "salamander", label: "Salamander / overhead broiler" },
  { value: "steamer", label: "Gas steamer" },
  { value: "shawarma", label: "Shawarma / vertical rotisserie" },
  { value: "rotisserie", label: "Chicken rotisserie" },
  { value: "bakery-oven", label: "Bakery deck or rack oven" },
  { value: "convection-oven", label: "Gas convection oven" },
  { value: "roaster", label: "Food or coffee roaster" },
  { value: "other", label: "Other equipment" },
];

const SERVICE_CITY_CODES = new Set([
  "1030900000", // Iligan City
  "0730600000", // Cebu City
  "1030500000", // Cagayan de Oro City
  "1830200000", // Bacolod City
  "1804502000", "1804504000", "1804509000", "1804510000", "1804515000", "1804516000",
  "1804523000", "1804524000", "1804526000", "1804527000", "1804528000", "1804531000", // Negros Occidental cities
  "1804604000", "1804606000", "1804608000", "1804610000", "1804611000", "1804621000", // Negros Oriental cities
  "1001312000", "1001321000", // Malaybalay and Valencia, Bukidnon
]);

const choices = {
  yesNoUnsure: [
    { value: "yes", label: "Yes" }, { value: "no", label: "No" }, { value: "unsure", label: "Not sure" },
  ],
  work: [
    { value: "new", label: "New LPG installation", hint: "A new fixed LPG piping system" },
    { value: "extend", label: "Extend an existing system" },
    { value: "replace", label: "Replace or upgrade a system" },
    { value: "safety", label: "Add a detector or automatic shutoff" },
    { value: "inspect", label: "Inspect an existing system" },
    { value: "unsure", label: "Not sure yet" },
  ],
  property: [
    { value: "house", label: "Detached house" }, { value: "townhouse", label: "Townhouse / duplex" },
    { value: "condo", label: "Condominium unit" }, { value: "multi", label: "Apartment / multi-unit" },
    { value: "mixed", label: "Home with business use" }, { value: "other", label: "Other" },
  ],
};

function parseEquipmentQuantities(value?: string): Record<string, number> {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value) as Record<string, number>;
    return Object.fromEntries(Object.entries(parsed).map(([key, quantity]) => [key, Math.max(1, Number(quantity) || 1)]));
  } catch {
    return {};
  }
}

function ChoiceGroup({ name, label, value, options, onChange }: { name: string; label: string; value?: string; options: Choice[]; onChange: (value: string) => void }) {
  return (
    <fieldset className="poc-fieldset">
      <legend>{label}</legend>
      <div className="poc-choices">
        {options.map((option) => (
          <label className={value === option.value ? "poc-choice selected" : "poc-choice"} key={option.value}>
            <input type="radio" name={name} value={option.value} checked={value === option.value} onChange={() => onChange(option.value)} />
            <span><strong>{option.label}</strong>{option.hint && <small>{option.hint}</small>}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function EquipmentPicker({ id, values, quantities, onChange, disabled = false }: { id: string; values: string[]; quantities: Record<string, number>; onChange: (values: string[], quantities: Record<string, number>) => void; disabled?: boolean }) {
  const availableOptions = equipmentOptions.filter((option) => !values.includes(option.value));
  const selectedOptions = values.map((value) => equipmentOptions.find((option) => option.value === value)).filter((option): option is EquipmentOption => Boolean(option));

  return (
    <>
      <Select<EquipmentOption>
        inputId={id}
        instanceId={`${id}-select`}
        classNamePrefix="equipment-select"
        isDisabled={disabled}
        isSearchable
        placeholder="Search and add equipment..."
        noOptionsMessage={() => "All matching equipment is already selected"}
        options={availableOptions}
        value={null}
        onChange={(selected: SingleValue<EquipmentOption>) => selected && onChange([...values, selected.value], { ...quantities, [selected.value]: quantities[selected.value] || 1 })}
      />
      {selectedOptions.length > 0 && <div className="selected-equipment" aria-label="Selected LPG equipment">
        <span>Selected equipment</span>
        <ul>{selectedOptions.map((option) => {
          const quantity = quantities[option.value] || 1;
          return <li key={option.value}><strong>{option.label}</strong><div className="equipment-row-actions"><div className="equipment-quantity" aria-label={`Quantity for ${option.label}`}><button type="button" aria-label={`Decrease ${option.label} quantity`} disabled={disabled || quantity <= 1} onClick={() => onChange(values, { ...quantities, [option.value]: Math.max(1, quantity - 1) })}>−</button><span aria-live="polite">{quantity}</span><button type="button" aria-label={`Increase ${option.label} quantity`} disabled={disabled} onClick={() => onChange(values, { ...quantities, [option.value]: Math.min(20, quantity + 1) })}>+</button></div><button className="equipment-remove" type="button" aria-label={`Remove ${option.label}`} disabled={disabled} onClick={() => { const nextQuantities = { ...quantities }; delete nextQuantities[option.value]; onChange(values.filter((value) => value !== option.value), nextQuantities); }}>Remove</button></div></li>;
        })}</ul>
      </div>}
    </>
  );
}

export default function LpgAssessment({ startWithEstimator = false }: { startWithEstimator?: boolean }) {
  const [screenIndex, setScreenIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [ready, setReady] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [showEstimator, setShowEstimator] = useState(startWithEstimator);
  const [estimateSaved, setEstimateSaved] = useState(false);
  const [estimate, setEstimate] = useState<EstimateConfig>({ pipeLength: "6to10", points: "1", floors: "1", route: "exposed", protection: "none" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedLead, setSubmittedLead] = useState<CreatedLead | null>(null);
  const [estimatorIntent, setEstimatorIntent] = useState<EstimatorIntent | null>(null);
  const [estimatorLeadForm, setEstimatorLeadForm] = useState<EstimatorLeadForm>(EMPTY_ESTIMATOR_LEAD_FORM);
  const [estimatorLead, setEstimatorLead] = useState<CreatedLead | null>(null);
  const [estimatorSubmittedEstimate, setEstimatorSubmittedEstimate] = useState<EstimateConfig | null>(null);
  const [isEstimatorSubmitting, setIsEstimatorSubmitting] = useState(false);
  const [estimatorError, setEstimatorError] = useState("");
  const equipmentQuantities = useMemo(() => parseEquipmentQuantities(answers.equipmentQuantities), [answers.equipmentQuantities]);
  const municipalityOptions = useMemo<LocationOption[]>(() => getAllMunicipalities().filter((municipality) => SERVICE_CITY_CODES.has(municipality.psgcCode)).map((municipality) => {
    const province = getProvinceByCode(municipality.provinceCode);
    return {
      value: municipality.psgcCode,
      name: municipality.name,
      label: municipality.psgcCode === "1830200000" ? "Bacolod City, Negros Occidental" : province ? `${municipality.name}, ${province.name}` : municipality.name,
    };
  }), []);

  const barangayOptions = useMemo<LocationOption[]>(() => {
    if (!answers.cityCode) return [];
    return getBarangaysByMunicipality(answers.cityCode).map((barangay) => ({
      value: barangay.psgcCode,
      name: barangay.name,
      label: barangay.name,
    }));
  }, [answers.cityCode]);

  const estimatorBarangayOptions = useMemo<LocationOption[]>(() => {
    if (!estimatorLeadForm.cityCode) return [];
    return getBarangaysByMunicipality(estimatorLeadForm.cityCode).map((barangay) => ({
      value: barangay.psgcCode,
      name: barangay.name,
      label: barangay.name,
    }));
  }, [estimatorLeadForm.cityCode]);

  const screens = useMemo<ScreenId[]>(() => {
    const items: ScreenId[] = ["work"];
    if (answers.work && answers.work !== "new") items.push("existing");
    items.push("property");
    if (["condo", "multi", "mixed"].includes(answers.property)) items.push("access");
    items.push("appliances", "location", "contact");
    return items;
  }, [answers.work, answers.property]);

  const screen = screens[Math.min(screenIndex, screens.length - 1)];
  const assessmentScreens: ScreenId[] = screens.filter((item) => item !== "contact");
  const assessmentNumber = assessmentScreens.indexOf(screen) + 1;

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const restoredAnswers = parsed.answers ?? {};
          setAnswers(restoredAnswers);
          setScreenIndex(parsed.screenIndex ?? 0);
          if (parsed.submittedLead?.id && parsed.submittedLead?.referenceCode) {
            setSubmittedLead(parsed.submittedLead);
            setShowResult(true);
          }
          if (parsed.estimatorLead?.id && parsed.estimatorLead?.referenceCode) {
            setEstimatorLead(parsed.estimatorLead);
            if (parsed.estimatorSubmittedEstimate) {
              setEstimatorSubmittedEstimate(parsed.estimatorSubmittedEstimate);
              setEstimate(parsed.estimatorSubmittedEstimate);
            }
          } else if (parsed.estimatorDraftEstimate) {
            setEstimate(parsed.estimatorDraftEstimate);
          } else {
            const restoredQuantities = parseEquipmentQuantities(restoredAnswers.equipmentQuantities);
            const restoredEquipment = (restoredAnswers.appliances || "").split("|").filter(Boolean);
            const restoredPoints = restoredEquipment.reduce((total: number, value: string) => total + (restoredQuantities[value] || 1), 0);
            setEstimate((current) => ({ ...current, points: String(Math.max(1, restoredPoints)) }));
          }
        } catch { /* Ignore invalid local data. */ }
      }
      setReady(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (ready) window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ answers, screenIndex, submittedLead, estimatorLead, estimatorDraftEstimate: estimate, estimatorSubmittedEstimate }));
  }, [answers, screenIndex, submittedLead, estimatorLead, estimate, estimatorSubmittedEstimate, ready]);

  const set = (key: string, value: string) => {
    setAnswers((current) => ({ ...current, [key]: value }));
    setError("");
  };

  const classification = useMemo(() => {
    const siteVisit = (answers.existingConcern && answers.existingConcern !== "no") || ["condo", "multi", "mixed", "other"].includes(answers.property) || (answers.accessApproval && answers.accessApproval !== "yes");
    return siteVisit ? "Site Visit Recommended" : "Initial Review";
  }, [answers]);

  const classificationLabel = (value?: LeadClassification) => {
    const labels: Record<LeadClassification, string> = {
      qualified: "Initial Review",
      needs_clarification: "Needs Clarification",
      site_inspection_likely: "Site Inspection Likely",
      outside_service_area: "Service Area Review",
      priority_review: "Priority Review",
    };
    return value ? labels[value] : classification;
  };

  const budget = useMemo(() => {
    const distance: Record<string, [number, number]> = {
      under5: [3, 5], "6to10": [6, 10], "11to20": [11, 20], over20: [21, 30], unsure: [8, 18],
    };
    const routeFactor: Record<string, number> = { exposed: 1, ceiling: 1.15, concealed: 1.35, masonry: 1.45, underground: 1.6, unsure: 1.25 };
    const protection: Record<string, [number, number]> = { none: [0, 0], detector: [3500, 5500], shutoff: [9000, 15000] };
    const [minimumMeters, maximumMeters] = distance[estimate.pipeLength] ?? distance.unsure;
    const factor = routeFactor[estimate.route] ?? routeFactor.unsure;
    const [protectionLow, protectionHigh] = protection[estimate.protection] ?? protection.none;
    const points = Math.max(1, Number(estimate.points) || 1);
    const floors = Math.max(1, Number(estimate.floors) || 1);
    const baseLow = 12000 + points * 2500;
    const baseHigh = 17000 + points * 4000;
    const pipeLow = minimumMeters * 850 * factor;
    const pipeHigh = maximumMeters * 1400 * factor;
    const accessLow = (floors - 1) * 3000;
    const accessHigh = (floors - 1) * 5000;
    const round = (value: number) => Math.ceil(value / 500) * 500;
    return {
      base: [round(baseLow), round(baseHigh)],
      pipe: [round(pipeLow), round(pipeHigh)],
      access: [round(accessLow), round(accessHigh)],
      protection: [protectionLow, protectionHigh],
      total: [round(baseLow + pipeLow + accessLow + protectionLow), round(baseHigh + pipeHigh + accessHigh + protectionHigh)],
    };
  }, [estimate]);

  const peso = (value: number) => new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 }).format(value);

  const openEstimator = () => {
    const selectedValues = (answers.appliances || "").split("|").filter(Boolean);
    const connectionPoints = selectedValues.reduce((total, value) => total + (equipmentQuantities[value] || 1), 0);
    setEstimate((current) => ({ ...current, points: String(Math.max(1, connectionPoints)) }));
    setShowEstimator(true);
    setEstimateSaved(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeEstimator = () => {
    if (startWithEstimator) return;
    setShowEstimator(false);
  };

  const openEstimatorLeadForm = (intent: EstimatorIntent) => {
    setEstimatorIntent(intent);
    setEstimatorError("");
    window.setTimeout(() => document.getElementById("estimator-lead-form")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  };

  const submitEstimatorLead = async (event: FormEvent) => {
    event.preventDefault();
    if (!estimatorIntent || isEstimatorSubmitting || estimatorLead) return;
    if (!answers.appliances) {
      setEstimatorError("Please add at least one LPG equipment item before requesting contact.");
      return;
    }
    if (!estimatorLeadForm.name.trim() || !estimatorLeadForm.phone.trim() || !estimatorLeadForm.city || !estimatorLeadForm.barangay) {
      setEstimatorError("Please provide your name, mobile number, city, and barangay.");
      return;
    }
    if (!estimatorLeadForm.consent) {
      setEstimatorError("Please provide contact consent before submitting this request.");
      return;
    }

    const selectedEquipment = (answers.appliances || "").split("|").filter(Boolean).map((value) => ({
      code: value,
      label: equipmentOptions.find((item) => item.value === value)?.label ?? value,
      quantity: equipmentQuantities[value] || 1,
    }));
    const commercialEquipment = new Set(["commercial-range", "wok-range", "stock-pot-burner", "rice-cooker", "deep-fryer", "griddle", "charbroiler", "salamander", "steamer", "shawarma", "rotisserie", "bakery-oven", "convection-oven", "roaster"]);
    const payload: EstimatorLeadInput = {
      source: "estimator",
      customer: {
        name: estimatorLeadForm.name.trim(),
        phone: estimatorLeadForm.phone.trim(),
        consentedAt: new Date().toISOString(),
      },
      project: {
        service: "LPG installation budget review",
        cityMunicipality: estimatorLeadForm.city,
        barangay: estimatorLeadForm.barangay,
        addressLine: estimatorLeadForm.streetAddress.trim() || undefined,
        houseUnitNumber: estimatorLeadForm.houseNumber.trim() || undefined,
      },
      answers: {
        contactRequest: estimatorIntent,
        equipment: selectedEquipment,
        otherEquipment: answers.otherEquipment?.trim() || null,
        estimatorConfiguration: estimate,
      },
      estimate: {
        currency: "PHP",
        minimum: budget.total[0],
        maximum: budget.total[1],
        assumptions: [
          "Illustrative rates only; not a formal quotation.",
          "Final pipe sizing, measurements, appliance ratings, regulator requirements, and site conditions require technical verification.",
          `Assumed pipe length: ${estimate.pipeLength}; route: ${estimate.route}; floors crossed: ${estimate.floors}; safety protection: ${estimate.protection}.`,
        ],
      },
      missingQuestions: [],
      projectSignals: {
        requiresDrilling: ["masonry", "concealed"].includes(estimate.route),
        unclearPipeRoute: estimate.route === "unsure",
        multipleFloors: Number(estimate.floors) > 1,
        existingSystemModification: false,
        commercialProperty: selectedEquipment.some((item) => commercialEquipment.has(item.code)),
        safetyConcern: false,
      },
    };

    setIsEstimatorSubmitting(true);
    setEstimatorError("");
    try {
      const lead = await createEstimatorLead(payload);
      setEstimatorSubmittedEstimate({ ...estimate });
      setEstimatorLead(lead);
      setEstimatorIntent(null);
    } catch (submissionError) {
      setEstimatorError(submissionError instanceof Error ? submissionError.message : "We could not submit your estimator request. Please try again.");
    } finally {
      setIsEstimatorSubmitting(false);
    }
  };

  const validate = () => {
    const required: Partial<Record<ScreenId, string>> = {
      work: "work", existing: "existingConcern", property: "property",
      access: "accessApproval", appliances: "appliances",
    };
    const requiredKey = required[screen];
    if (requiredKey && !answers[requiredKey]) {
      setError("Please answer this question before continuing.");
      return false;
    }
    if (screen === "appliances" && answers.appliances.split("|").includes("other") && !answers.otherEquipment?.trim()) {
      setError("Please describe the other LPG equipment.");
      return false;
    }
    if (screen === "location" && (!answers.cityCode || !answers.barangayCode || !answers.streetAddress?.trim())) {
      setError("Please select the city and barangay, then enter the street, subdivision, or building.");
      return false;
    }
    if (screen === "contact" && (!answers.name || !answers.phone || answers.consent !== "yes")) {
      setError("Please provide your name, mobile number, and contact consent.");
      return false;
    }
    return true;
  };

  const buildLeadPayload = (): AssessmentLeadInput => {
    const selectedEquipment = (answers.appliances || "").split("|").filter(Boolean).map((value) => ({
      code: value,
      label: equipmentOptions.find((item) => item.value === value)?.label ?? value,
      quantity: equipmentQuantities[value] || 1,
    }));
    const missingQuestions: string[] = [];
    if (answers.work === "unsure") missingQuestions.push("Confirm the requested LPG work.");
    if (answers.existingConcern === "yes") missingQuestions.push("Describe the known concern with the existing LPG system.");
    if (answers.existingConcern === "unsure") missingQuestions.push("Clarify whether the existing LPG system has a known concern.");
    if (answers.property === "other") missingQuestions.push("Confirm the property type.");
    if (answers.accessApproval && answers.accessApproval !== "yes") missingQuestions.push("Confirm property approval, access, and work restrictions.");

    return {
      source: "assessment",
      customer: {
        name: answers.name.trim(),
        phone: answers.phone.trim(),
        consentedAt: new Date().toISOString(),
      },
      project: {
        service: "Residential LPG installation",
        cityMunicipality: answers.city,
        barangay: answers.area,
        addressLine: answers.streetAddress.trim(),
        houseUnitNumber: answers.houseNumber?.trim() || undefined,
      },
      answers: {
        requestedWork: answers.work,
        existingConcern: answers.existingConcern || null,
        propertyType: answers.property,
        accessApproval: answers.accessApproval || null,
        equipment: selectedEquipment,
        otherEquipment: answers.otherEquipment?.trim() || null,
        cityCode: answers.cityCode,
        barangayCode: answers.barangayCode,
      },
      missingQuestions,
      projectSignals: {
        requiresDrilling: false,
        unclearPipeRoute: false,
        multipleFloors: false,
        existingSystemModification: ["extend", "replace"].includes(answers.work),
        commercialProperty: ["condo", "multi", "mixed"].includes(answers.property),
        safetyConcern: false,
      },
    };
  };

  const next = async (event: FormEvent) => {
    event.preventDefault();
    if (!validate() || isSubmitting) return;
    if (screenIndex === screens.length - 1) {
      if (submittedLead) {
        setShowResult(true);
        return;
      }
      setIsSubmitting(true);
      setError("");
      try {
        const lead = await createAssessmentLead(buildLeadPayload());
        setSubmittedLead(lead);
        setShowResult(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (submissionError) {
        setError(submissionError instanceof Error ? submissionError.message : "We could not submit your assessment. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setScreenIndex((value) => value + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const reset = () => {
    window.localStorage.removeItem(STORAGE_KEY);
    setAnswers({});
    setScreenIndex(0);
    setShowResult(false);
    setShowEstimator(false);
    setEstimateSaved(false);
    setSubmittedLead(null);
    setIsSubmitting(false);
    setEstimatorIntent(null);
    setEstimatorLeadForm(EMPTY_ESTIMATOR_LEAD_FORM);
    setEstimatorLead(null);
    setEstimatorSubmittedEstimate(null);
    setIsEstimatorSubmitting(false);
    setEstimatorError("");
    setError("");
  };

  if (!ready) return null;

  if (showEstimator) {
    const selectedEquipment = (answers.appliances || "").split("|").filter(Boolean).map((value) => {
      const label = equipmentOptions.find((item) => item.value === value)?.label;
      return label ? `${label} × ${equipmentQuantities[value] || 1}` : undefined;
    }).filter(Boolean);
    return (
      <main className="poc-shell estimator-shell">
        <header className="poc-header">
          <Link href="/" aria-label="Return to BNM3 Construction home"><Image src="/bnm3-logo.png" alt="" width={259} height={188} /></Link>
          <div><span>Residential LPG</span><strong>Budget Explorer</strong></div>
          {startWithEstimator ? <Link className="poc-exit estimator-exit" href="/">Exit</Link> : <button className="poc-exit estimator-exit" type="button" onClick={closeEstimator}>Back</button>}
        </header>

        <section className="estimator-heading">
          <div><span className="poc-kicker">Optional planning tool</span><h1>Explore a preliminary budget.</h1><p>Adjust the project assumptions to see how they may affect the budget range.</p></div>
          <div className="estimator-demo"><strong>Proof of concept</strong><span>Illustrative rates only—not approved customer pricing.</span></div>
        </section>

        <div className="estimator-layout">
          <aside className="estimator-controls" aria-label="Estimate configuration">
            <div className="estimator-section"><span>{startWithEstimator ? "Start your configuration" : "Included from your request"}</span><strong>{selectedEquipment.length ? selectedEquipment.join(", ") : "Select the equipment that will use LPG."}{answers.otherEquipment ? ` — ${answers.otherEquipment}` : ""}</strong></div>

            <div className="estimator-field"><label htmlFor="estimator-equipment">Add LPG equipment</label><EquipmentPicker id={startWithEstimator ? "direct-estimator-equipment" : "lead-estimator-equipment"} disabled={startWithEstimator && Boolean(estimatorLead)} values={(answers.appliances || "").split("|").filter(Boolean)} quantities={equipmentQuantities} onChange={(values, quantities) => { const points = values.reduce((total, value) => total + (quantities[value] || 1), 0); setAnswers((current) => ({ ...current, appliances: values.join("|"), equipmentQuantities: JSON.stringify(quantities), ...(values.includes("other") ? {} : { otherEquipment: "" }) })); setEstimate((current) => ({ ...current, points: String(Math.max(1, points)) })); }} /></div>
            {(answers.appliances || "").split("|").includes("other") && <label className="estimator-field">Describe the other equipment<input disabled={startWithEstimator && Boolean(estimatorLead)} value={answers.otherEquipment || ""} onChange={(event) => set("otherEquipment", event.target.value)} placeholder="Example: custom roasting machine" /></label>}

            <label className="estimator-field">Approximate pipe length
              <select disabled={startWithEstimator && Boolean(estimatorLead)} value={estimate.pipeLength} onChange={(event) => setEstimate((current) => ({ ...current, pipeLength: event.target.value }))}>
                <option value="under5">Up to 5 meters</option><option value="6to10">6–10 meters</option><option value="11to20">11–20 meters</option><option value="over20">More than 20 meters</option><option value="unsure">I&apos;m not sure</option>
              </select>
            </label>

            <label className="estimator-field">Floors crossed by the pipe route
              <input disabled={startWithEstimator && Boolean(estimatorLead)} type="number" min="1" max="10" value={estimate.floors} onChange={(event) => setEstimate((current) => ({ ...current, floors: event.target.value }))} />
            </label>

            <label className="estimator-field">Likely installation route
              <select disabled={startWithEstimator && Boolean(estimatorLead)} value={estimate.route} onChange={(event) => setEstimate((current) => ({ ...current, route: event.target.value }))}>
                <option value="exposed">Exposed along a wall</option><option value="ceiling">Above a ceiling</option><option value="concealed">Concealed inside a wall</option><option value="masonry">Through concrete or masonry</option><option value="underground">Underground</option><option value="unsure">I&apos;m not sure</option>
              </select>
            </label>

            <label className="estimator-field">Safety protection
              <select disabled={startWithEstimator && Boolean(estimatorLead)} value={estimate.protection} onChange={(event) => setEstimate((current) => ({ ...current, protection: event.target.value }))}>
                <option value="none">Standard installation only</option><option value="detector">Include gas-leak detector</option><option value="shutoff">Detector with automatic shutoff</option>
              </select>
            </label>
          </aside>

          <section className="estimator-output" aria-live="polite">
            <span className="estimator-eyebrow">Preliminary planning range</span>
            <div className="estimator-total"><strong>{peso(budget.total[0])}</strong><span>to</span><strong>{peso(budget.total[1])}</strong></div>
            <p>This range changes as you adjust the assumptions. It is not a formal quotation.</p>

            <dl className="estimator-breakdown">
              <div><dt>Base installation and connections</dt><dd>{peso(budget.base[0])}–{peso(budget.base[1])}</dd></div>
              <div><dt>Estimated piping and route</dt><dd>{peso(budget.pipe[0])}–{peso(budget.pipe[1])}</dd></div>
              <div><dt>Multi-floor access allowance</dt><dd>{peso(budget.access[0])}–{peso(budget.access[1])}</dd></div>
              <div><dt>Selected safety protection</dt><dd>{peso(budget.protection[0])}–{peso(budget.protection[1])}</dd></div>
            </dl>

            <div className="estimator-notice"><strong>Site verification required</strong><p>Final pricing depends on measurements, appliance ratings, pipe sizing, cylinder and regulator requirements, access conditions, and the approved technical scope.</p></div>

            {startWithEstimator ? <>
              {estimatorLead ? <div className="estimator-lead-confirmation" role="status"><span>Request received</span><strong>{estimatorLead.referenceCode}</strong><p>BNM3 received your budget configuration and contact request. Keep this reference number for follow-up.</p></div> : <>
                <div className="estimator-contact-actions" aria-label="Request contact from BNM3">
                  <button className="poc-primary" type="button" onClick={() => openEstimatorLeadForm("official_review")}>Request official review</button>
                  <button className="poc-secondary" type="button" onClick={() => openEstimatorLeadForm("callback")}>Request a callback</button>
                </div>
                <p className="estimator-privacy-note">Your estimator remains anonymous unless you choose one of these options and submit the contact form.</p>
                {estimatorIntent && <form id="estimator-lead-form" className="estimator-lead-form" onSubmit={submitEstimatorLead}>
                  <div><span className="poc-kicker">Optional contact request</span><h2>{estimatorIntent === "official_review" ? "Request an official review" : "Request a callback"}</h2><p>Provide the minimum details needed to route your request. The displayed range remains preliminary.</p></div>
                  <div className="poc-two"><label className="estimator-field">Your name<input autoComplete="name" value={estimatorLeadForm.name} onChange={(event) => { setEstimatorLeadForm((current) => ({ ...current, name: event.target.value })); setEstimatorError(""); }} /></label><label className="estimator-field">Mobile number<input type="tel" autoComplete="tel" value={estimatorLeadForm.phone} onChange={(event) => { setEstimatorLeadForm((current) => ({ ...current, phone: event.target.value })); setEstimatorError(""); }} /></label></div>
                  <div className="poc-two"><div className="estimator-field"><label htmlFor="estimator-project-city">City / municipality</label><Select<LocationOption> inputId="estimator-project-city" instanceId="estimator-project-city-select" classNamePrefix="equipment-select" isSearchable placeholder="Search city or municipality..." noOptionsMessage={() => "No matching city or municipality"} options={municipalityOptions} value={municipalityOptions.find((option) => option.value === estimatorLeadForm.cityCode) ?? null} onChange={(selected: SingleValue<LocationOption>) => { setEstimatorLeadForm((current) => ({ ...current, cityCode: selected?.value ?? "", city: selected?.name ?? "", barangayCode: "", barangay: "" })); setEstimatorError(""); }} /></div><div className="estimator-field"><label htmlFor="estimator-project-barangay">Barangay</label><Select<LocationOption> inputId="estimator-project-barangay" instanceId="estimator-project-barangay-select" classNamePrefix="equipment-select" isSearchable isDisabled={!estimatorLeadForm.cityCode} placeholder={estimatorLeadForm.cityCode ? "Search barangay..." : "Select a city first"} noOptionsMessage={() => "No matching barangay"} options={estimatorBarangayOptions} value={estimatorBarangayOptions.find((option) => option.value === estimatorLeadForm.barangayCode) ?? null} onChange={(selected: SingleValue<LocationOption>) => { setEstimatorLeadForm((current) => ({ ...current, barangayCode: selected?.value ?? "", barangay: selected?.name ?? "" })); setEstimatorError(""); }} /></div></div>
                  <label className="estimator-field">Street, subdivision, or building (Optional)<input autoComplete="address-line1" value={estimatorLeadForm.streetAddress} onChange={(event) => setEstimatorLeadForm((current) => ({ ...current, streetAddress: event.target.value }))} /></label>
                  <label className="estimator-field">House or unit number (Optional)<input autoComplete="address-line2" value={estimatorLeadForm.houseNumber} onChange={(event) => setEstimatorLeadForm((current) => ({ ...current, houseNumber: event.target.value }))} /></label>
                  <label className="poc-consent"><input type="checkbox" checked={estimatorLeadForm.consent} onChange={(event) => { setEstimatorLeadForm((current) => ({ ...current, consent: event.target.checked })); setEstimatorError(""); }} /><span>I agree that BNM3 may store this estimator configuration and contact me about this project.</span></label>
                  {estimatorError && <p className="poc-error" role="alert">{estimatorError}</p>}
                  <div className="estimator-form-actions"><button className="poc-secondary" type="button" onClick={() => { setEstimatorIntent(null); setEstimatorError(""); }}>Cancel</button><button className="poc-primary" type="submit" disabled={isEstimatorSubmitting}>{isEstimatorSubmitting ? "Submitting request..." : estimatorIntent === "official_review" ? "Submit review request" : "Submit callback request"}</button></div>
                </form>}
              </>}
              <Link className="poc-reset estimator-home-link" href="/">Finish without submitting details</Link>
            </> : <>
              {estimateSaved ? <p className="estimator-saved" role="status">Budget configuration saved in this browser with your assessment.</p> : <button className="poc-primary estimator-save" type="button" onClick={() => { setAnswers((current) => ({ ...current, estimatePipeLength: estimate.pipeLength, estimatePoints: estimate.points, estimateFloors: estimate.floors, estimateRoute: estimate.route, estimateProtection: estimate.protection, estimateBudgetLow: String(budget.total[0]), estimateBudgetHigh: String(budget.total[1]) })); setEstimateSaved(true); }}>Save budget to my request</button>}
              <button className="poc-reset" type="button" onClick={closeEstimator}>Return to lead confirmation</button>
            </>}
          </section>
        </div>
      </main>
    );
  }

  if (showResult) {
    return (
      <main className="poc-shell">
        <section className="poc-result" aria-labelledby="result-title">
          <div><span className="poc-kicker">Lead confirmation</span><h1 id="result-title">Your request is confirmed.</h1><p>BNM3 has received your initial project details and will contact you after reviewing the assessment.</p></div>
          {submittedLead && <div className="result-reference" role="status"><span>Your reference number</span><strong>{submittedLead.referenceCode}</strong><small>Keep this number when following up with BNM3.</small></div>}
          <div className="result-status review"><span>Recommended path</span><strong>{classificationLabel(submittedLead?.classification)}</strong></div>
          <dl className="result-grid">
            <div><dt>Requested work</dt><dd>{choices.work.find((item) => item.value === answers.work)?.label}</dd></div>
            <div><dt>Property</dt><dd>{choices.property.find((item) => item.value === answers.property)?.label}</dd></div>
            <div><dt>LPG use</dt><dd>{answers.appliances?.split("|").map((value) => { const label = equipmentOptions.find((item) => item.value === value)?.label; return label ? `${label} × ${equipmentQuantities[value] || 1}` : undefined; }).filter(Boolean).join(", ")}{answers.otherEquipment ? ` — ${answers.otherEquipment}` : ""}</dd></div>
            <div><dt>Project address</dt><dd>{[answers.houseNumber, answers.streetAddress, answers.area, answers.city].filter(Boolean).join(", ")}</dd></div>
          </dl>
          <div className="result-next"><h2>What happens next?</h2><p>A BNM3 representative will call to review the request, ask any necessary follow-up questions, and arrange a site visit with you when needed.</p></div>
          <div className="budget-invitation"><span className="poc-kicker">Optional next step</span><h2>Want to explore a preliminary budget?</h2><p>Adjust a few project assumptions and see an illustrative range. Your request is already complete.</p></div>
          <div className="poc-actions"><Link className="poc-secondary result-home" href="/">Return home</Link><button className="poc-primary" type="button" onClick={openEstimator}>Explore budget <span aria-hidden="true">→</span></button></div>
          <button className="poc-reset" type="button" onClick={reset}>Clear and start another assessment</button>
        </section>
      </main>
    );
  }

  const phaseLabel = screen === "contact" ? "Your details" : `Question ${assessmentNumber} of ${assessmentScreens.length}`;
  const progressValue = screenIndex + 1;

  return (
    <main className="poc-shell">
      <header className="poc-header">
        <Link href="/" aria-label="Return to BNM3 Construction home"><Image src="/bnm3-logo.png" alt="" width={259} height={188} /></Link>
        <div><span>Residential LPG</span><strong>Quick Assessment</strong></div>
        <Link href="/" className="poc-exit">Exit</Link>
      </header>

      <div className="poc-progress" aria-label={`${phaseLabel}: step ${progressValue} of ${screens.length}`}>
        <div><span>{phaseLabel}</span><strong>{screen === "contact" ? "Contact" : "Quick assessment"}</strong></div>
        <progress value={progressValue} max={screens.length}>{progressValue} of {screens.length}</progress>
      </div>

      <form className="poc-card" onSubmit={next}>
        {screen === "work" && <><span className="poc-kicker">Project</span><h1>What would you like us to help with?</h1><ChoiceGroup name="work" label="Choose the closest match" value={answers.work} options={choices.work} onChange={(value) => set("work", value)} /></>}

        {screen === "existing" && <><span className="poc-kicker">One follow-up</span><h1>Does the existing LPG system have a known concern?</h1><p className="poc-intro">We ask this only because you selected work involving an existing system.</p><ChoiceGroup name="existingConcern" label="Damage, corrosion, modification, recurring issues, or suspected leakage?" value={answers.existingConcern} options={choices.yesNoUnsure} onChange={(value) => set("existingConcern", value)} /></>}

        {screen === "property" && <><span className="poc-kicker">Property</span><h1>Where will the LPG work be done?</h1><ChoiceGroup name="property" label="Property type" value={answers.property} options={choices.property} onChange={(value) => set("property", value)} /></>}

        {screen === "access" && <><span className="poc-kicker">One follow-up</span><h1>Can LPG work be approved and accessed at the property?</h1><p className="poc-intro">Some buildings require administration approval or have work-hour restrictions.</p><ChoiceGroup name="accessApproval" label="Is approval or site access already available?" value={answers.accessApproval} options={choices.yesNoUnsure} onChange={(value) => set("accessApproval", value)} /></>}

        {screen === "appliances" && <><span className="poc-kicker">LPG use</span><h1>What equipment will use LPG?</h1><div className="poc-input"><label htmlFor="lpg-equipment">Add equipment one at a time</label><EquipmentPicker id="lpg-equipment" values={(answers.appliances || "").split("|").filter(Boolean)} quantities={equipmentQuantities} onChange={(values, quantities) => { setAnswers((current) => ({ ...current, appliances: values.join("|"), equipmentQuantities: JSON.stringify(quantities), ...(values.includes("other") ? {} : { otherEquipment: "" }) })); setError(""); }} /></div>{(answers.appliances || "").split("|").includes("other") && <label className="poc-input">Describe the other equipment<input value={answers.otherEquipment || ""} onChange={(event) => set("otherEquipment", event.target.value)} placeholder="Example: custom roasting machine" /></label>}<p className="poc-intro">Add each equipment type, then set its quantity. Ratings and exact connections will be confirmed during the site visit.</p></>}

        {screen === "location" && <><span className="poc-kicker">Location</span><h1>Where is the project?</h1><div className="poc-two"><div className="poc-input"><label htmlFor="project-city">City / municipality</label><Select<LocationOption> inputId="project-city" instanceId="project-city-select" classNamePrefix="equipment-select" isSearchable placeholder="Search city or municipality..." noOptionsMessage={() => "No matching city or municipality"} options={municipalityOptions} value={municipalityOptions.find((option) => option.value === answers.cityCode) ?? null} onChange={(selected: SingleValue<LocationOption>) => { setAnswers((current) => ({ ...current, cityCode: selected?.value ?? "", city: selected?.name ?? "", barangayCode: "", area: "" })); setError(""); }} /></div><div className="poc-input"><label htmlFor="project-barangay">Barangay</label><Select<LocationOption> inputId="project-barangay" instanceId="project-barangay-select" classNamePrefix="equipment-select" isSearchable isDisabled={!answers.cityCode} placeholder={answers.cityCode ? "Search barangay..." : "Select a city first"} noOptionsMessage={() => "No matching barangay"} options={barangayOptions} value={barangayOptions.find((option) => option.value === answers.barangayCode) ?? null} onChange={(selected: SingleValue<LocationOption>) => { setAnswers((current) => ({ ...current, barangayCode: selected?.value ?? "", area: selected?.name ?? "" })); setError(""); }} /></div></div><label className="poc-input">Street, subdivision, or building<input autoComplete="address-line1" value={answers.streetAddress || ""} onChange={(event) => set("streetAddress", event.target.value)} placeholder="Example: Mabini Street or Sunrise Subdivision" /></label><label className="poc-input">House or unit number (Optional)<input autoComplete="address-line2" value={answers.houseNumber || ""} onChange={(event) => set("houseNumber", event.target.value)} placeholder="Example: House 24 or Unit 3B" /></label><p className="poc-intro">Start typing to quickly find the project location.</p></>}

        {screen === "contact" && <><span className="poc-kicker">Assessment complete</span><h1>How can BNM3 reach you?</h1><p className="poc-intro">Your quick assessment is done. Add your details so the team can review it.</p><div className="poc-two"><label className="poc-input">Your name<input autoComplete="name" value={answers.name || ""} onChange={(event) => set("name", event.target.value)} /></label><label className="poc-input">Mobile number<input type="tel" autoComplete="tel" value={answers.phone || ""} onChange={(event) => set("phone", event.target.value)} /></label></div><label className="poc-consent"><input type="checkbox" checked={answers.consent === "yes"} onChange={(event) => set("consent", event.target.checked ? "yes" : "no")} /><span>I agree that BNM3 may securely store these assessment details and contact me about this project.</span></label></>}

        {error && <p className="poc-error" role="alert">{error}</p>}
        <div className="poc-actions">
          {screenIndex > 0 ? <button className="poc-secondary" type="button" onClick={() => { setScreenIndex((value) => value - 1); setError(""); }}>Back</button> : <span />}
          <button className="poc-primary" type="submit" disabled={isSubmitting}>{screenIndex === screens.length - 1 ? isSubmitting ? "Submitting request..." : "Submit project request" : "Continue"}<span aria-hidden="true">→</span></button>
        </div>
        <p className="poc-save">Progress is saved in this browser. Your request is sent to BNM3 only after you submit the final step.</p>
      </form>
    </main>
  );
}
