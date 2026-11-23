"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import styles from "./bill-of-materials.module.css";

type ProjectDetails = {
  title: string;
  client: string;
  location: string;
  duration: string;
  paymentTerms: string;
  preparedBy: string;
};

type CostRow = {
  id: number;
  description: string;
  unit: string;
  quantity: string;
  unitCost: string;
};

type LaborRow = {
  id: number;
  personnel: string;
  quantity: string;
  days: string;
  dailyRate: string;
};

type LetterDetails = {
  date: string;
  recipientName: string;
  recipientRole: string;
  recipientCompany: string;
  recipientAddress: string;
  salutation: string;
  introduction: string;
  companyAddress: string;
  contactPerson: string;
  contactLine: string;
  closing: string;
  signatoryName: string;
  signatoryTitle: string;
};

type WorksheetSample = {
  details: ProjectDetails;
  letter: LetterDetails;
  materials: CostRow[];
  labor: LaborRow[];
  otherCosts: CostRow[];
  nextId: number;
  contingencyRate: string;
  vatRate: string;
};

const EMPTY_DETAILS: ProjectDetails = {
  title: "",
  client: "",
  location: "",
  duration: "",
  paymentTerms: "",
  preparedBy: "",
};

const EMPTY_LETTER: LetterDetails = {
  date: "",
  recipientName: "",
  recipientRole: "",
  recipientCompany: "",
  recipientAddress: "",
  salutation: "Sir/Madam:",
  introduction: "Herewith is our indicative working cost for",
  companyAddress: "",
  contactPerson: "",
  contactLine: "",
  closing: "Thank you,",
  signatoryName: "",
  signatoryTitle: "",
};

const money = new Intl.NumberFormat("en-PH", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function numberValue(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

function costTotal(row: CostRow) {
  return numberValue(row.quantity) * numberValue(row.unitCost);
}

function laborTotal(row: LaborRow) {
  return numberValue(row.quantity) * numberValue(row.days) * numberValue(row.dailyRate);
}

function amount(value: number) {
  return money.format(value);
}

function formatLetterDate(value: string) {
  if (!value) return "Date";
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return value;
  return new Intl.DateTimeFormat("en-PH", { dateStyle: "long" }).format(new Date(year, month - 1, day));
}

function blankCostRow(id: number): CostRow {
  return { id, description: "", unit: "", quantity: "", unitCost: "" };
}

function blankLaborRow(id: number): LaborRow {
  return { id, personnel: "", quantity: "", days: "", dailyRate: "" };
}

function onePageSample(): WorksheetSample {
  return {
    details: {
      title: "MOCK PROJECT - LPG boiler supply line installation",
      client: "Sample Food Processing Company",
      location: "Mandaue City, Cebu (mock site)",
      duration: "12 calendar days",
      paymentTerms: "50% mobilization, 40% progress, 10% after testing",
      preparedBy: "Sample Estimator - For testing only",
    },
    letter: {
      date: "2026-11-23",
      recipientName: "Maria Santos",
      recipientRole: "Purchasing Officer",
      recipientCompany: "Sample Food Processing Company",
      recipientAddress: "Mandaue City, Cebu (mock address)",
      salutation: "Dear Ms. Santos:",
      introduction: "Herewith is our indicative working cost for",
      companyAddress: "Sample BNM3 office address",
      contactPerson: "Sample Project Coordinator",
      contactLine: "Sample contact details",
      closing: "Thank you,",
      signatoryName: "SAMPLE AUTHORIZED SIGNATORY",
      signatoryTitle: "General Manager",
    },
    materials: [
      { id: 1, description: "2-in Sch 40 BI pipe", unit: "length", quantity: "12", unitCost: "3350" },
      { id: 2, description: "2-inch fittings and flanges", unit: "lot", quantity: "1", unitCost: "18500" },
      { id: 3, description: "Pipe supports and anchors", unit: "lot", quantity: "1", unitCost: "12500" },
      { id: 4, description: "Primer and consumables", unit: "lot", quantity: "1", unitCost: "6500" },
    ],
    labor: [
      { id: 5, personnel: "Pipe fitter", quantity: "2", days: "6", dailyRate: "1200" },
      { id: 6, personnel: "Helper", quantity: "2", days: "6", dailyRate: "850" },
    ],
    otherCosts: [
      { id: 7, description: "Mobilization and delivery", unit: "lot", quantity: "1", unitCost: "9500" },
      { id: 8, description: "Testing and documentation", unit: "lot", quantity: "1", unitCost: "7500" },
    ],
    nextId: 9,
    contingencyRate: "10",
    vatRate: "12",
  };
}

function multiPageSample(): WorksheetSample {
  const materialNames = [
    "2-in Sch 40 BI pipe", "2-inch 90-degree elbow", "2-inch 45-degree elbow", "2-inch equal tee",
    "2-inch welded flange", "2-inch ball valve", "2-inch union", "2-inch pipe coupling",
    "Pressure gauge assembly", "Gas-rated flexible connector", "Emergency shutoff valve", "Pipe support assembly",
    "Wall sleeve and sealant", "Warning labels and markers", "Welding rods and discs", "Primer and finish coat",
    "Leak-test solution", "Nitrogen test gas", "Valve identification tags", "Equipment connection kit",
    "Outdoor pipe protection", "Fire-stop penetration seal", "Fasteners and anchors", "Installation consumables",
  ];
  const laborNames = [
    "Project supervisor", "Safety officer", "Pipe fitter lead", "Pipe fitter", "Welder", "Welder helper",
    "General helper", "Scaffolding installer", "Painter", "Testing technician", "Documentation staff", "Cleanup crew",
  ];
  const otherCostNames = [
    "Mobilization", "Material delivery", "Tool rental", "Scaffolding rental", "Temporary barriers",
    "Safety signage", "Testing equipment", "Permit allowance", "As-built documentation", "Final cleanup",
  ];

  const materials = materialNames.map((description, index) => ({
    id: index + 1,
    description,
    unit: index === 0 ? "length" : "pc",
    quantity: index === 0 ? "24" : String((index % 4) + 1),
    unitCost: String(850 + index * 175),
  }));
  const labor = laborNames.map((personnel, index) => ({
    id: materials.length + index + 1,
    personnel,
    quantity: String((index % 3) + 1),
    days: String(2 + (index % 6)),
    dailyRate: String(850 + index * 75),
  }));
  const otherCosts = otherCostNames.map((description, index) => ({
    id: materials.length + labor.length + index + 1,
    description,
    unit: "lot",
    quantity: "1",
    unitCost: String(2500 + index * 900),
  }));

  return {
    details: {
      title: "MOCK PROJECT - Multi-page LPG boiler supply line BOQ",
      client: "Sample Industrial Kitchen Corporation",
      location: "Cebu City (mock site)",
      duration: "30 calendar days",
      paymentTerms: "30% mobilization, progress billing, 10% after testing",
      preparedBy: "Sample Estimator - For pagination testing only",
    },
    letter: {
      date: "2026-11-23",
      recipientName: "Carlo Reyes",
      recipientRole: "Facilities Manager",
      recipientCompany: "Sample Industrial Kitchen Corporation",
      recipientAddress: "Cebu City (mock address)",
      salutation: "Dear Mr. Reyes:",
      introduction: "Herewith is our indicative working cost for",
      companyAddress: "Sample BNM3 office address",
      contactPerson: "Sample Project Coordinator",
      contactLine: "Sample contact details",
      closing: "Thank you,",
      signatoryName: "SAMPLE AUTHORIZED SIGNATORY",
      signatoryTitle: "General Manager",
    },
    materials,
    labor,
    otherCosts,
    nextId: materials.length + labor.length + otherCosts.length + 1,
    contingencyRate: "10",
    vatRate: "12",
  };
}

function LetterPage({ letter, project, quoteAmount }: { letter: LetterDetails; project: ProjectDetails; quoteAmount: number }) {
  const text = (value: string, fallback: string) => value || fallback;

  return (
    <article className={styles.letterPage} aria-label="Quotation letter preview">
      <header className={styles.letterheadHeader}>
        <Image src="/bnm3-logo.png" alt="BNM3 Construction" width={259} height={188} priority />
        <div>
          <p><strong>BNM3</strong> <span>CONSTRUCTION</span></p>
          <small>{text(letter.companyAddress, "Company address")}</small>
        </div>
      </header>

      <div className={styles.senderBlock}>
        <strong>{text(letter.contactPerson, "Contact person")}</strong>
        <span>{text(letter.contactLine, "Contact details")}</span>
      </div>

      <p className={styles.letterDate}>{formatLetterDate(letter.date)}</p>

      <address className={styles.recipientBlock}>
        <strong>{text(letter.recipientName, "Recipient name")}</strong>
        <strong>{text(letter.recipientRole, "Recipient role")}</strong>
        <strong>{text(letter.recipientCompany || project.client, "Recipient company")}</strong>
        <strong>{text(letter.recipientAddress, "Recipient address")}</strong>
      </address>

      <p className={styles.salutation}>{text(letter.salutation, "Sir/Madam:")}</p>
      <p className={styles.letterIntroduction}>
        {text(letter.introduction, "Herewith is our indicative working cost for")} <strong>{text(project.title, "the proposed project")}</strong>{project.location ? <> at <strong>{project.location}</strong></> : null}.
      </p>

      <dl className={styles.letterSummary}>
        <div><dt>Indicative cost</dt><dd>PHP {amount(quoteAmount)}</dd></div>
        <div><dt>Terms of payment</dt><dd>{text(project.paymentTerms, "For discussion")}</dd></div>
        <div><dt>Duration</dt><dd>{text(project.duration, "Subject to scheduling")}</dd></div>
      </dl>

      <div className={styles.letterClosing}>
        <p>{text(letter.closing, "Thank you,")}</p>
        <div className={styles.signatureSpace} aria-hidden="true" />
        <strong>{text(letter.signatoryName, "Authorized signatory")}</strong>
        <span>{text(letter.signatoryTitle, "Position")}</span>
      </div>

      <p className={styles.letterDisclaimer}>Indicative working cost only. This document is not a binding quotation and remains subject to qualified review of quantities, rates, taxes, technical feasibility, and site conditions.</p>
    </article>
  );
}

function CostSection({
  itemNumber,
  title,
  rows,
  setRows,
  nextId,
  setNextId,
  totalLabel,
}: {
  itemNumber: number;
  title: string;
  rows: CostRow[];
  setRows: Dispatch<SetStateAction<CostRow[]>>;
  nextId: number;
  setNextId: Dispatch<SetStateAction<number>>;
  totalLabel: string;
}) {
  const sectionTotal = rows.reduce((sum, row) => sum + costTotal(row), 0);
  const update = (id: number, field: keyof Omit<CostRow, "id">, value: string) => {
    setRows((current) => current.map((row) => row.id === id ? { ...row, [field]: value } : row));
  };
  const addRow = () => {
    setRows((current) => [...current, blankCostRow(nextId)]);
    setNextId((current) => current + 1);
  };
  const removeRow = (id: number) => {
    setRows((current) => current.length === 1 ? [blankCostRow(current[0].id)] : current.filter((row) => row.id !== id));
  };

  return (
    <section className={styles.section} aria-labelledby={`${title.toLowerCase().replaceAll(" ", "-")}-heading`}>
      <div className={styles.sectionHeading}>
        <div>
          <span>Item {itemNumber}</span>
          <h2 id={`${title.toLowerCase().replaceAll(" ", "-")}-heading`}>{title}</h2>
        </div>
        <button className={`${styles.addButton} ${styles.noPrint}`} type="button" onClick={addRow}>+ Add row</button>
      </div>
      <div className={styles.tableScroll}>
        <table className={styles.costTable}>
          <thead>
            <tr className={styles.printSectionHeader} aria-hidden="true">
              <th colSpan={5}><span>Item {itemNumber}</span>{title}</th>
            </tr>
            <tr><th>Description</th><th>Unit</th><th>Quantity</th><th>Unit cost (PHP)</th><th>Total (PHP)</th><th className={styles.actionColumn}><span className={styles.srOnly}>Actions</span></th></tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.id}>
                <td><input aria-label={`${title} row ${index + 1} description`} value={row.description} onChange={(event) => update(row.id, "description", event.target.value)} placeholder="Enter item description" /></td>
                <td><input aria-label={`${title} row ${index + 1} unit`} value={row.unit} onChange={(event) => update(row.id, "unit", event.target.value)} placeholder="pcs, lot, length" /></td>
                <td><input aria-label={`${title} row ${index + 1} quantity`} inputMode="decimal" type="number" min="0" step="any" value={row.quantity} onChange={(event) => update(row.id, "quantity", event.target.value)} placeholder="0" /></td>
                <td><input aria-label={`${title} row ${index + 1} unit cost`} inputMode="decimal" type="number" min="0" step="0.01" value={row.unitCost} onChange={(event) => update(row.id, "unitCost", event.target.value)} placeholder="0.00" /></td>
                <td className={styles.calculated}>{amount(costTotal(row))}</td>
                <td className={`${styles.rowAction} ${styles.noPrint}`}><button type="button" onClick={() => removeRow(row.id)} aria-label={`Remove ${title} row ${index + 1}`}>Remove</button></td>
              </tr>
            ))}
          </tbody>
          <tfoot><tr><th colSpan={4}>{totalLabel}</th><td>{amount(sectionTotal)}</td><td className={`${styles.actionColumn} ${styles.noPrint}`} /></tr></tfoot>
        </table>
      </div>
    </section>
  );
}

export default function BillOfMaterials() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [details, setDetails] = useState<ProjectDetails>(EMPTY_DETAILS);
  const [letter, setLetter] = useState<LetterDetails>(EMPTY_LETTER);
  const [materials, setMaterials] = useState<CostRow[]>([blankCostRow(1)]);
  const [labor, setLabor] = useState<LaborRow[]>([blankLaborRow(2)]);
  const [otherCosts, setOtherCosts] = useState<CostRow[]>([blankCostRow(3)]);
  const [nextId, setNextId] = useState(4);
  const [contingencyRate, setContingencyRate] = useState("10");
  const [vatRate, setVatRate] = useState("12");

  useEffect(() => {
    const previousDocumentOverflow = document.documentElement.style.overflowX;
    const previousBodyOverflow = document.body.style.overflowX;
    document.documentElement.style.overflowX = "hidden";
    document.body.style.overflowX = "hidden";
    return () => {
      document.documentElement.style.overflowX = previousDocumentOverflow;
      document.body.style.overflowX = previousBodyOverflow;
    };
  }, []);

  const totals = useMemo(() => {
    const materialsTotal = materials.reduce((sum, row) => sum + costTotal(row), 0);
    const laborCost = labor.reduce((sum, row) => sum + laborTotal(row), 0);
    const otherCost = otherCosts.reduce((sum, row) => sum + costTotal(row), 0);
    const subtotal = materialsTotal + laborCost + otherCost;
    const contingency = subtotal * numberValue(contingencyRate) / 100;
    const vat = subtotal * numberValue(vatRate) / 100;
    return { materialsTotal, laborCost, otherCost, subtotal, contingency, vat, overall: subtotal + contingency + vat };
  }, [contingencyRate, labor, materials, otherCosts, vatRate]);

  const updateDetails = (field: keyof ProjectDetails, value: string) => setDetails((current) => ({ ...current, [field]: value }));
  const updateLetter = (field: keyof LetterDetails, value: string) => setLetter((current) => ({ ...current, [field]: value }));
  const updateLabor = (id: number, field: keyof Omit<LaborRow, "id">, value: string) => {
    setLabor((current) => current.map((row) => row.id === id ? { ...row, [field]: value } : row));
  };
  const addLaborRow = () => {
    setLabor((current) => [...current, blankLaborRow(nextId)]);
    setNextId((current) => current + 1);
  };
  const removeLaborRow = (id: number) => {
    setLabor((current) => current.length === 1 ? [blankLaborRow(current[0].id)] : current.filter((row) => row.id !== id));
  };
  const hasWorksheetData = Object.values(details).some(Boolean)
    || (Object.keys(letter) as (keyof LetterDetails)[]).some((field) => letter[field] !== EMPTY_LETTER[field])
    || materials.some((row) => Object.entries(row).some(([field, value]) => field !== "id" && Boolean(value)))
    || labor.some((row) => Object.entries(row).some(([field, value]) => field !== "id" && Boolean(value)))
    || otherCosts.some((row) => Object.entries(row).some(([field, value]) => field !== "id" && Boolean(value)))
    || contingencyRate !== "10"
    || vatRate !== "12";
  const loadSample = (createSample: () => WorksheetSample) => {
    if (hasWorksheetData && !window.confirm("Replace the current worksheet with synthetic mock project data?")) return;
    const sample = createSample();
    setDetails(sample.details);
    setLetter(sample.letter);
    setMaterials(sample.materials);
    setLabor(sample.labor);
    setOtherCosts(sample.otherCosts);
    setNextId(sample.nextId);
    setContingencyRate(sample.contingencyRate);
    setVatRate(sample.vatRate);
    setStep(1);
  };
  const exportCombinedPdf = () => {
    if (step === 3) {
      window.print();
      return;
    }
    setStep(3);
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => window.print()));
  };

  return (
    <main className={styles.shell}>
      <header className={`${styles.appHeader} ${styles.noPrint}`}>
        <Link className={styles.brand} href="/">
          <Image src="/bnm3-logo.png" alt="BNM3 Construction" width={259} height={188} priority />
          <span><strong>BNM3</strong><small>Project tools</small></span>
        </Link>
        <div className={styles.headerActions}>
          <Link href="/">Back to website</Link>
          <button className={styles.sampleButton} type="button" onClick={() => loadSample(onePageSample)} title="Replace the worksheet with a synthetic one-page test project">Load 1-page sample</button>
          <button className={styles.sampleButton} type="button" onClick={() => loadSample(multiPageSample)} title="Replace the worksheet with a synthetic multi-page test project">Load multi-page sample</button>
          <button type="button" onClick={exportCombinedPdf}>Export combined PDF</button>
        </div>
      </header>

      <nav className={`${styles.funnelSteps} ${styles.noPrint}`} aria-label="Document preparation steps">
        <button type="button" onClick={() => setStep(1)} aria-current={step === 1 ? "step" : undefined}><span>1</span><strong>BOQ</strong><small>Build the costs</small></button>
        <button type="button" onClick={() => setStep(2)} aria-current={step === 2 ? "step" : undefined}><span>2</span><strong>Letterhead</strong><small>Prepare the letter</small></button>
        <button type="button" onClick={() => setStep(3)} aria-current={step === 3 ? "step" : undefined}><span>3</span><strong>Final view</strong><small>Review and export</small></button>
      </nav>

      <div className={`${styles.intro} ${styles.noPrint}`}>
        <div><span className={styles.eyebrow}>Document preparation</span><h1>{step === 1 ? "Build the bill of quantities" : step === 2 ? "Prepare the quotation letter" : "Review the combined document"}</h1></div>
        <p>{step === 1 ? "Add material, labor, and other-cost rows. Totals update automatically." : step === 2 ? "Use the sidebar fields while the quotation letter updates beside them." : "The letterhead is first, followed by the complete BOQ. Export when the sequence is ready."}</p>
      </div>

      <aside className={`${styles.notice} ${styles.noPrint}`}>
        <strong>Working document only.</strong> Values are entered by the user and are not an approved price book, formal quotation, or technical scope. Qualified BNM3 personnel must review quantities, rates, taxes, and site conditions.
      </aside>

      <div className={step === 3 ? styles.finalSequence : undefined}>
        {step === 2 ? (
          <div className={styles.letterWorkspace}>
            <aside className={`${styles.letterEditor} ${styles.noPrint}`} aria-label="Quotation letter fields">
              <div><span className={styles.eyebrow}>Letter fields</span><h2>Quotation letter</h2><p>The BOQ controls the amount, payment terms, and duration.</p></div>
              <label><span>Date</span><input type="date" value={letter.date} onChange={(event) => updateLetter("date", event.target.value)} /></label>
              <label><span>Recipient name</span><input value={letter.recipientName} onChange={(event) => updateLetter("recipientName", event.target.value)} placeholder="Full name" /></label>
              <label><span>Recipient role</span><input value={letter.recipientRole} onChange={(event) => updateLetter("recipientRole", event.target.value)} placeholder="Position or department" /></label>
              <label><span>Recipient company</span><input value={letter.recipientCompany} onChange={(event) => updateLetter("recipientCompany", event.target.value)} placeholder={details.client || "Company name"} /></label>
              <label><span>Recipient address</span><textarea rows={3} value={letter.recipientAddress} onChange={(event) => updateLetter("recipientAddress", event.target.value)} placeholder="Business address" /></label>
              <label><span>Salutation</span><input value={letter.salutation} onChange={(event) => updateLetter("salutation", event.target.value)} placeholder="Sir/Madam:" /></label>
              <label><span>Introduction</span><textarea rows={3} value={letter.introduction} onChange={(event) => updateLetter("introduction", event.target.value)} /></label>
              <fieldset><legend>Letterhead contact</legend>
                <label><span>Company address</span><input value={letter.companyAddress} onChange={(event) => updateLetter("companyAddress", event.target.value)} placeholder="Office address" /></label>
                <label><span>Contact person</span><input value={letter.contactPerson} onChange={(event) => updateLetter("contactPerson", event.target.value)} placeholder="Name or department" /></label>
                <label><span>Contact details</span><input value={letter.contactLine} onChange={(event) => updateLetter("contactLine", event.target.value)} placeholder="Phone or email" /></label>
              </fieldset>
              <fieldset><legend>Sign-off</legend>
                <label><span>Closing</span><input value={letter.closing} onChange={(event) => updateLetter("closing", event.target.value)} /></label>
                <label><span>Signatory name</span><input value={letter.signatoryName} onChange={(event) => updateLetter("signatoryName", event.target.value)} placeholder="Authorized signatory" /></label>
                <label><span>Signatory title</span><input value={letter.signatoryTitle} onChange={(event) => updateLetter("signatoryTitle", event.target.value)} placeholder="Position" /></label>
              </fieldset>
            </aside>
            <LetterPage letter={letter} project={details} quoteAmount={totals.overall} />
          </div>
        ) : null}

        {step === 3 ? <LetterPage letter={letter} project={details} quoteAmount={totals.overall} /> : null}

        {step === 1 || step === 3 ? <article className={`${styles.sheet} ${step === 3 ? styles.reviewSheet : ""}`}>
        <header className={styles.sheetHeader}>
          <div className={styles.sheetBrand}><span><b>BNM3</b> CONSTRUCTION</span><small>Indicative working sheet</small></div>
          <h2>Bill of quantities</h2>
        </header>

        <section className={styles.projectGrid} aria-label="Project information">
          <label className={styles.projectTitle}><span>Project title</span><textarea rows={2} value={details.title} onChange={(event) => updateDetails("title", event.target.value)} placeholder="Describe the proposed work" /></label>
          <label><span>Location</span><textarea rows={2} value={details.location} onChange={(event) => updateDetails("location", event.target.value)} placeholder="Project city or site" /></label>
          <label><span>Prepared for</span><input value={details.client} onChange={(event) => updateDetails("client", event.target.value)} placeholder="Client or company" /></label>
        </section>

        <CostSection itemNumber={1} title="Materials" rows={materials} setRows={setMaterials} nextId={nextId} setNextId={setNextId} totalLabel="Materials total" />

        <section className={styles.section} aria-labelledby="labor-heading">
          <div className={styles.sectionHeading}>
            <div><span>Item 2</span><h2 id="labor-heading">Labor</h2></div>
            <button className={`${styles.addButton} ${styles.noPrint}`} type="button" onClick={addLaborRow}>+ Add personnel row</button>
          </div>
          <div className={styles.tableScroll}>
            <table className={styles.costTable}>
              <thead>
                <tr className={styles.printSectionHeader} aria-hidden="true">
                  <th colSpan={5}><span>Item 2</span>Labor</th>
                </tr>
                <tr><th>Personnel</th><th>Quantity</th><th>No. of days</th><th>Daily rate (PHP)</th><th>Total (PHP)</th><th className={styles.actionColumn}><span className={styles.srOnly}>Actions</span></th></tr>
              </thead>
              <tbody>
                {labor.map((row, index) => (
                  <tr key={row.id}>
                    <td><input aria-label={`Labor row ${index + 1} personnel`} value={row.personnel} onChange={(event) => updateLabor(row.id, "personnel", event.target.value)} placeholder="Supervisor, skilled worker..." /></td>
                    <td><input aria-label={`Labor row ${index + 1} quantity`} type="number" min="0" step="any" value={row.quantity} onChange={(event) => updateLabor(row.id, "quantity", event.target.value)} placeholder="0" /></td>
                    <td><input aria-label={`Labor row ${index + 1} number of days`} type="number" min="0" step="any" value={row.days} onChange={(event) => updateLabor(row.id, "days", event.target.value)} placeholder="0" /></td>
                    <td><input aria-label={`Labor row ${index + 1} daily rate`} type="number" min="0" step="0.01" value={row.dailyRate} onChange={(event) => updateLabor(row.id, "dailyRate", event.target.value)} placeholder="0.00" /></td>
                    <td className={styles.calculated}>{amount(laborTotal(row))}</td>
                    <td className={`${styles.rowAction} ${styles.noPrint}`}><button type="button" onClick={() => removeLaborRow(row.id)} aria-label={`Remove labor row ${index + 1}`}>Remove</button></td>
                  </tr>
                ))}
              </tbody>
              <tfoot><tr><th colSpan={4}>Labor cost</th><td>{amount(totals.laborCost)}</td><td className={`${styles.actionColumn} ${styles.noPrint}`} /></tr></tfoot>
            </table>
          </div>
        </section>

        <CostSection itemNumber={3} title="Other costs & consumables" rows={otherCosts} setRows={setOtherCosts} nextId={nextId} setNextId={setNextId} totalLabel="Other costs total" />

        <div className={styles.closingBlock}>
          <section className={styles.summary} aria-label="Project cost summary">
            <div><span>Subtotal cost</span><strong>{amount(totals.subtotal)}</strong></div>
            <div><label htmlFor="contingency-rate">Contingency (%)</label><input id="contingency-rate" type="number" min="0" step="0.1" value={contingencyRate} onChange={(event) => setContingencyRate(event.target.value)} /><strong>{amount(totals.contingency)}</strong></div>
            <div><label htmlFor="vat-rate">VAT (%)</label><input id="vat-rate" type="number" min="0" step="0.1" value={vatRate} onChange={(event) => setVatRate(event.target.value)} /><strong>{amount(totals.vat)}</strong></div>
            <div className={styles.grandTotal}><span>Overall project cost</span><strong>PHP {amount(totals.overall)}</strong></div>
          </section>

          <section className={styles.signoff} aria-label="Project terms">
            <label><span>Duration</span><input value={details.duration} onChange={(event) => updateDetails("duration", event.target.value)} placeholder="e.g. 30 calendar days" /></label>
            <label><span>Terms of payment</span><input value={details.paymentTerms} onChange={(event) => updateDetails("paymentTerms", event.target.value)} placeholder="Enter agreed terms" /></label>
            <label><span>Prepared by</span><input value={details.preparedBy} onChange={(event) => updateDetails("preparedBy", event.target.value)} placeholder="Name and role" /></label>
          </section>
          <p className={styles.printDisclaimer}>Indicative working cost only. Not a binding quotation. Quantities, rates, tax treatment, technical feasibility, and site conditions require qualified review.</p>
        </div>
        </article> : null}
      </div>

      <div className={`${styles.funnelActions} ${styles.noPrint}`}>
        {step > 1 ? <button className={styles.secondaryAction} type="button" onClick={() => setStep((step - 1) as 1 | 2)}>Back</button> : <span />}
        {step === 1 ? <button type="button" onClick={() => setStep(2)}>Continue to letterhead</button> : null}
        {step === 2 ? <button type="button" onClick={() => setStep(3)}>Review final document</button> : null}
        {step === 3 ? <button type="button" onClick={exportCombinedPdf}>Export combined PDF</button> : null}
      </div>
    </main>
  );
}
