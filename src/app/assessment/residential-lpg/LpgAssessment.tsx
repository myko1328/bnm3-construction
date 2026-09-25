"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";

type Answers = Record<string, string>;
type Choice = { value: string; label: string; hint?: string };

const STORAGE_KEY = "bnm3-residential-lpg-poc";
const steps = ["Safety", "Project", "Property", "Appliances", "Supply", "Route", "Protection", "Access", "Contact", "Site visit"];

const choices = {
  yesNoUnsure: [
    { value: "yes", label: "Yes" }, { value: "no", label: "No" }, { value: "unsure", label: "Not sure" },
  ],
  work: [
    { value: "new", label: "New LPG piping", hint: "Plan a new fixed LPG system" },
    { value: "extend", label: "Extend an existing system" },
    { value: "replace", label: "Replace or upgrade" },
    { value: "safety", label: "Add detection and shutoff" },
    { value: "inspect", label: "Inspect an existing system" },
    { value: "unsure", label: "Not sure yet" },
  ],
  property: [
    { value: "house", label: "Detached house" }, { value: "townhouse", label: "Townhouse / duplex" },
    { value: "condo", label: "Condominium unit" }, { value: "multi", label: "Apartment / multi-unit" },
    { value: "mixed", label: "Home with business use" }, { value: "other", label: "Other" },
  ],
  stage: [
    { value: "planning", label: "Planning / design" }, { value: "construction", label: "Under construction" },
    { value: "renovation", label: "Renovation" }, { value: "occupied", label: "Occupied home" },
  ],
  distance: [
    { value: "under5", label: "Under 5 meters" }, { value: "5to10", label: "5–10 meters" },
    { value: "11to20", label: "11–20 meters" }, { value: "over20", label: "Over 20 meters" },
    { value: "unsure", label: "Not sure" },
  ],
};

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

export default function LpgAssessment() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [ready, setReady] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [error, setError] = useState("");
  const today = useMemo(() => {
    const date = new Date();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${date.getFullYear()}-${month}-${day}`;
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try { const parsed = JSON.parse(saved); setAnswers(parsed.answers ?? {}); setStep(parsed.step ?? 0); } catch { /* Ignore invalid local data. */ }
      }
      setReady(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (ready) window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ answers, step }));
  }, [answers, step, ready]);

  const set = (key: string, value: string) => { setAnswers((current) => ({ ...current, [key]: value })); setError(""); };
  const requiredByStep = ["emergency", "work", "property", "appliances", "cylinders", "distance", "detector", "restrictions", "city", "visitRequested"];

  const classification = useMemo(() => {
    const siteVisit = ["multi", "mixed"].includes(answers.property) || answers.manifold === "yes" || answers.route === "underground" || answers.damage === "yes" || answers.distance === "over20" || Number(answers.floors || 0) >= 3;
    const review = siteVisit || ["condo", "other"].includes(answers.property) || ["unsure", "inside"].includes(answers.cylinderLocation) || ["concealed", "ceiling"].includes(answers.route) || answers.distance === "unsure" || answers.ratings === "no";
    return siteVisit ? "Site Visit Required" : review ? "Technical Review" : "Standard Assessment";
  }, [answers]);

  const missing = useMemo(() => {
    const items: string[] = [];
    if (answers.ratings !== "yes") items.push("Appliance nameplate ratings");
    if (!answers.route || answers.route === "unsure") items.push("Confirmed pipe route");
    if (answers.cylinderLocation === "unsure") items.push("Proposed cylinder location");
    if (!answers.photos || answers.photos === "no") items.push("Optional site photos");
    return items;
  }, [answers]);

  const validate = () => {
    if (!answers[requiredByStep[step]]) { setError("Please answer the main question before continuing."); return false; }
    if (step === 8 && (!answers.name || !answers.phone || answers.consent !== "yes")) { setError("Please provide your name, mobile number, and contact consent."); return false; }
    if (step === 9 && answers.visitRequested === "yes" && (!answers.visitDate || !answers.alternateDate || !answers.visitTime || answers.visitAcknowledged !== "yes")) { setError("Please choose two dates and a time window, then acknowledge that BNM3 must confirm the visit."); return false; }
    if (step === 9 && answers.visitRequested === "yes" && answers.visitDate === answers.alternateDate) { setError("Please choose a different alternative date."); return false; }
    return true;
  };

  const next = (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    if (step === steps.length - 1) setShowResult(true); else { setStep((value) => value + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }
  };

  const reset = () => { window.localStorage.removeItem(STORAGE_KEY); setAnswers({}); setStep(0); setShowResult(false); setError(""); };

  if (!ready) return null;

  if (answers.emergency === "yes" || answers.emergency === "unsure") {
    return (
      <main className="poc-shell emergency-shell">
        <div className="poc-emergency">
          <span className="poc-kicker">Safety first</span>
          <h1>Do not continue with an online quotation.</h1>
          <p>If you smell gas or suspect a leak, avoid flames and electrical switches, leave the affected area, and contact the appropriate emergency service or qualified LPG professional from a safe location.</p>
          <p className="poc-disclaimer">This page does not diagnose a leak or replace emergency assistance.</p>
          <button className="poc-secondary" type="button" onClick={reset}>Start over</button>
        </div>
      </main>
    );
  }

  if (showResult) {
    return (
      <main className="poc-shell">
        <section className="poc-result" aria-labelledby="result-title">
          <div><span className="poc-kicker">Assessment complete</span><h1 id="result-title">Your project brief is ready.</h1><p>This is a proof-of-concept summary, not a quotation or compliance approval.</p></div>
          <div className={`result-status ${classification === "Standard Assessment" ? "standard" : "review"}`}><span>Recommended path</span><strong>{classification}</strong></div>
          <dl className="result-grid">
            <div><dt>Requested work</dt><dd>{choices.work.find((x) => x.value === answers.work)?.label}</dd></div>
            <div><dt>Property</dt><dd>{choices.property.find((x) => x.value === answers.property)?.label}, {answers.floors || "?"} floor(s)</dd></div>
            <div><dt>Appliances</dt><dd>{answers.appliances}</dd></div>
            <div><dt>Supply</dt><dd>{answers.cylinders} cylinder(s), {answers.cylinderLocation || "location unconfirmed"}</dd></div>
            <div><dt>Route</dt><dd>{choices.distance.find((x) => x.value === answers.distance)?.label}; {answers.route || "route unconfirmed"}</dd></div>
            <div><dt>Protection</dt><dd>Detector: {answers.detector}; automatic shutoff: {answers.shutoff || "unsure"}</dd></div>
            <div><dt>Project area</dt><dd>{answers.area ? `${answers.area}, ` : ""}{answers.city}</dd></div>
            <div><dt>Preferred timing</dt><dd>{answers.timing || "Flexible"}</dd></div>
            <div><dt>Site visit</dt><dd>{answers.visitRequested === "yes" ? `${answers.visitDate}, ${answers.visitTime}; alternative ${answers.alternateDate}` : "Not requested yet"}</dd></div>
          </dl>
          <div className="result-next"><h2>Before formal estimating</h2>{missing.length ? <ul>{missing.map((item) => <li key={item}>{item}</li>)}</ul> : <p>The information provided is ready for initial estimator review.</p>}</div>
          <div className="poc-actions"><button className="poc-secondary" type="button" onClick={() => setShowResult(false)}>Review answers</button><button className="poc-primary" type="button" onClick={() => alert("POC only: external submission will be added after family approval.")}>Submit to BNM3</button></div>
          <button className="poc-reset" type="button" onClick={reset}>Clear and start another assessment</button>
        </section>
      </main>
    );
  }

  return (
    <main className="poc-shell">
      <header className="poc-header">
        <Link href="/" aria-label="Return to BNM3 Construction home"><Image src="/bnm3-logo.png" alt="" width={259} height={188} /></Link>
        <div><span>Residential LPG</span><strong>Project Assessment</strong></div>
        <Link href="/" className="poc-exit">Exit</Link>
      </header>

      <div className="poc-progress" aria-label={`Step ${step + 1} of ${steps.length}: ${steps[step]}`}>
        <div><span>Step {step + 1} of {steps.length}</span><strong>{steps[step]}</strong></div>
        <progress value={step + 1} max={steps.length}>{step + 1} of {steps.length}</progress>
      </div>

      <form className="poc-card" onSubmit={next}>
        {step === 0 && <><span className="poc-kicker">Before we begin</span><h1>Is there a possible gas leak right now?</h1><p className="poc-intro">This assessment is for planned work—not emergency diagnosis.</p><ChoiceGroup name="emergency" label="Do you currently smell gas or suspect an active LPG leak?" value={answers.emergency} options={choices.yesNoUnsure} onChange={(v) => set("emergency", v)} /></>}
        {step === 1 && <><span className="poc-kicker">Project scope</span><h1>What would you like us to assess?</h1><ChoiceGroup name="work" label="Choose the closest match" value={answers.work} options={choices.work} onChange={(v) => set("work", v)} />{answers.work && answers.work !== "new" && <ChoiceGroup name="damage" label="Is there known damage, corrosion, modification, or repeated leakage?" value={answers.damage} options={choices.yesNoUnsure} onChange={(v) => set("damage", v)} />}</>}
        {step === 2 && <><span className="poc-kicker">Property</span><h1>Where will the system be installed?</h1><ChoiceGroup name="property" label="Property type" value={answers.property} options={choices.property} onChange={(v) => set("property", v)} /><ChoiceGroup name="projectStage" label="Current project stage" value={answers.projectStage} options={choices.stage} onChange={(v) => set("projectStage", v)} /><label className="poc-input">How many floors will the LPG route cross?<input type="number" min="1" max="20" value={answers.floors || ""} onChange={(e) => set("floors", e.target.value)} placeholder="Example: 1" /></label></>}
        {step === 3 && <><span className="poc-kicker">Gas demand</span><h1>Which appliances will use LPG?</h1><label className="poc-input">List the appliance types and quantities<textarea value={answers.appliances || ""} onChange={(e) => set("appliances", e.target.value)} placeholder="Example: 1 cooktop and 1 oven" rows={4} /></label><ChoiceGroup name="ratings" label="Do you have the gas-input ratings from their nameplates?" value={answers.ratings} options={[{value:"yes",label:"Yes, available"},{value:"no",label:"Not yet"},{value:"unsure",label:"Not sure where to find them"}]} onChange={(v) => set("ratings", v)} /></>}
        {step === 4 && <><span className="poc-kicker">LPG supply</span><h1>Tell us about the cylinders.</h1><label className="poc-input">How many cylinders?<input type="number" min="1" max="20" value={answers.cylinders || ""} onChange={(e) => set("cylinders", e.target.value)} placeholder="Example: 2" /></label><ChoiceGroup name="manifold" label="Will they use a changeover or manifold arrangement?" value={answers.manifold} options={choices.yesNoUnsure} onChange={(v) => set("manifold", v)} /><ChoiceGroup name="cylinderLocation" label="Where are or will the cylinders be located?" value={answers.cylinderLocation} options={[{value:"outdoor",label:"Outdoors beside the house"},{value:"cabinet",label:"Outdoor ventilated cabinet"},{value:"service",label:"Separate service area"},{value:"inside",label:"Inside the home / kitchen"},{value:"condo",label:"Condominium service area"},{value:"unsure",label:"Not decided"}]} onChange={(v) => set("cylinderLocation", v)} /></>}
        {step === 5 && <><span className="poc-kicker">Pipe route</span><h1>What does the installation route look like?</h1><ChoiceGroup name="distance" label="Distance to the furthest appliance" value={answers.distance} options={choices.distance} onChange={(v) => set("distance", v)} /><ChoiceGroup name="route" label="Main route condition" value={answers.route} options={[{value:"exposed",label:"Exposed along a wall"},{value:"ceiling",label:"Above a ceiling"},{value:"concealed",label:"Concealed inside a wall"},{value:"concrete",label:"Through concrete / masonry"},{value:"underground",label:"Underground"},{value:"unsure",label:"Not sure"}]} onChange={(v) => set("route", v)} /><label className="poc-input">How many appliance connection points?<input type="number" min="1" max="30" value={answers.points || ""} onChange={(e) => set("points", e.target.value)} placeholder="Example: 2" /></label></>}
        {step === 6 && <><span className="poc-kicker">Safety options</span><h1>What protection should be assessed?</h1><ChoiceGroup name="detector" label="Is a gas-leak detector already installed?" value={answers.detector} options={choices.yesNoUnsure} onChange={(v) => set("detector", v)} /><ChoiceGroup name="shutoff" label="Include an automatic gas shutoff in the assessment?" value={answers.shutoff} options={[{value:"yes",label:"Yes"},{value:"no",label:"No"},{value:"explain",label:"Please explain the option"}]} onChange={(v) => set("shutoff", v)} /><ChoiceGroup name="power" label="Is electrical power available near the detector/controller area?" value={answers.power} options={choices.yesNoUnsure} onChange={(v) => set("power", v)} /></>}
        {step === 7 && <><span className="poc-kicker">Planning</span><h1>Are there any access restrictions?</h1><ChoiceGroup name="restrictions" label="Subdivision, condominium, parking, or work-hour restrictions?" value={answers.restrictions} options={choices.yesNoUnsure} onChange={(v) => set("restrictions", v)} /><label className="poc-input">Preferred timing<input value={answers.timing || ""} onChange={(e) => set("timing", e.target.value)} placeholder="Example: Within the next month" /></label><ChoiceGroup name="photos" label="Do you have site photos available later?" value={answers.photos} options={[{value:"yes",label:"Yes"},{value:"no",label:"No—and I can still continue"}]} onChange={(v) => set("photos", v)} /><label className="poc-input">Anything else the estimator should know?<textarea value={answers.notes || ""} onChange={(e) => set("notes", e.target.value)} rows={3} /></label></>}
        {step === 8 && <><span className="poc-kicker">Contact details</span><h1>Where is the project, and how can we reach you?</h1><div className="poc-two"><label className="poc-input">City / municipality<input value={answers.city || ""} onChange={(e) => set("city", e.target.value)} /></label><label className="poc-input">Barangay / project area<input value={answers.area || ""} onChange={(e) => set("area", e.target.value)} /></label><label className="poc-input">Your name<input autoComplete="name" value={answers.name || ""} onChange={(e) => set("name", e.target.value)} /></label><label className="poc-input">Mobile number<input type="tel" autoComplete="tel" value={answers.phone || ""} onChange={(e) => set("phone", e.target.value)} /></label></div><label className="poc-consent"><input type="checkbox" checked={answers.consent === "yes"} onChange={(e) => set("consent", e.target.checked ? "yes" : "no")} /><span>BNM3 may contact me about this project assessment.</span></label></>}
        {step === 9 && <><span className="poc-kicker">Site visit request</span><h1>When can BNM3 visit the property?</h1><p className="poc-intro">Choose your preferred availability. The visit is requested—not confirmed—until BNM3 reviews the project and contacts you.</p><ChoiceGroup name="visitRequested" label="Would you like to request a site visit?" value={answers.visitRequested} options={[{value:"yes",label:"Yes, request a visit"},{value:"no",label:"Not yet"}]} onChange={(v) => set("visitRequested", v)} />{answers.visitRequested === "yes" && <><div className="poc-two"><label className="poc-input">Preferred date<input type="date" min={today} value={answers.visitDate || ""} onChange={(e) => set("visitDate", e.target.value)} /></label><label className="poc-input">Alternative date<input type="date" min={answers.visitDate || today} value={answers.alternateDate || ""} onChange={(e) => set("alternateDate", e.target.value)} /></label></div><ChoiceGroup name="visitTime" label="Preferred time window" value={answers.visitTime} options={[{value:"8:00–10:00 AM",label:"8:00–10:00 AM"},{value:"10:00 AM–12:00 PM",label:"10:00 AM–12:00 PM"},{value:"1:00–3:00 PM",label:"1:00–3:00 PM"},{value:"3:00–5:00 PM",label:"3:00–5:00 PM"}]} onChange={(v) => set("visitTime", v)} /><label className="poc-input">Site access notes, optional<textarea value={answers.accessNotes || ""} onChange={(e) => set("accessNotes", e.target.value)} rows={3} placeholder="Gate instructions, on-site contact, parking, or other details" /></label><label className="poc-consent"><input type="checkbox" checked={answers.visitAcknowledged === "yes"} onChange={(e) => set("visitAcknowledged", e.target.checked ? "yes" : "no")} /><span>I understand that these dates are requested and the appointment is subject to confirmation by BNM3.</span></label></>}</>}

        {error && <p className="poc-error" role="alert">{error}</p>}
        <div className="poc-actions">{step > 0 ? <button className="poc-secondary" type="button" onClick={() => { setStep(step - 1); setError(""); }}>Back</button> : <span />}<button className="poc-primary" type="submit">{step === steps.length - 1 ? "Build my project brief" : "Continue"}<span aria-hidden="true">→</span></button></div>
        <p className="poc-save">Progress is saved only in this browser for this demonstration.</p>
      </form>
    </main>
  );
}
