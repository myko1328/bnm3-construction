import { jsPDF } from "jspdf";
import autoTable, { type UserOptions } from "jspdf-autotable";

export type PdfCostRow = {
  description: string;
  unit: string;
  quantity: string;
  unitCost: string;
};

export type PdfLaborRow = {
  personnel: string;
  quantity: string;
  days: string;
  dailyRate: string;
};

export type BillOfMaterialsPdfInput = {
  project: {
    title: string;
    client: string;
    location: string;
    duration: string;
    paymentTerms: string;
    preparedBy: string;
  };
  letter: {
    date: string;
    recipientName: string;
    recipientRole: string;
    recipientCompany: string;
    recipientAddress: string;
    salutation: string;
    introduction: string;
    companyAddress: string;
    contactPerson: string;
    contactTitle: string;
    contactLine: string;
    closing: string;
    signatoryName: string;
    signatoryTitle: string;
  };
  materials: PdfCostRow[];
  labor: PdfLaborRow[];
  otherCosts: PdfCostRow[];
  contingencyRate: string;
  vatRate: string;
  showContingency: boolean;
  showPreparedBy: boolean;
  showDetailedDisclaimer: boolean;
  totals: {
    materialsTotal: number;
    laborCost: number;
    otherCost: number;
    subtotal: number;
    contingency: number;
    vat: number;
    overall: number;
  };
};

type PdfWithLastTable = jsPDF & { lastAutoTable?: { finalY: number } };

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const BOQ_MARGIN = 8;
const BOQ_BOTTOM_MARGIN = 14;
const BOQ_WIDTH = PAGE_WIDTH - BOQ_MARGIN * 2;
const BORDER_COLOR: [number, number, number] = [135, 146, 162];
const TEAL: [number, number, number] = [7, 169, 140];
const NAVY: [number, number, number] = [7, 19, 79];
const RED: [number, number, number] = [239, 32, 40];

function numberValue(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function amount(value: number) {
  return new Intl.NumberFormat("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function text(value: string, fallback: string) {
  return value.trim() || fallback;
}

function formatLetterDate(value: string) {
  if (!value) return "Date";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

function costTotal(row: PdfCostRow) {
  return numberValue(row.quantity) * numberValue(row.unitCost);
}

function laborTotal(row: PdfLaborRow) {
  return numberValue(row.quantity) * numberValue(row.days) * numberValue(row.dailyRate);
}

function hasCostRow(row: PdfCostRow) {
  return Boolean(row.description || row.unit || row.quantity || row.unitCost);
}

function hasLaborRow(row: PdfLaborRow) {
  return Boolean(row.personnel || row.quantity || row.days || row.dailyRate);
}

async function loadImageData(path: string) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Unable to load PDF asset: ${path}`);
  const blob = await response.blob();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error(`Unable to read PDF asset: ${path}`));
    reader.readAsDataURL(blob);
  });
}

function drawWrappedText(doc: jsPDF, value: string, x: number, y: number, width: number, lineHeight: number) {
  const lines = doc.splitTextToSize(value, width) as string[];
  doc.text(lines, x, y);
  return y + Math.max(lines.length, 1) * lineHeight;
}

function drawLetterPage(doc: jsPDF, input: BillOfMaterialsPdfInput, logo: string, signature: string) {
  const { letter, project, totals } = input;
  doc.setTextColor(23, 27, 36);
  doc.addImage(logo, "PNG", 20, 16, 34, 29, "bnm3-logo", "FAST");

  doc.setFont("times", "bold");
  doc.setFontSize(27);
  doc.setTextColor(...RED);
  doc.text("BNM3", 55, 29);
  doc.setFontSize(11);
  doc.setTextColor(...NAVY);
  doc.text("ENTERPRISES", 86, 29);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(23, 27, 36);
  doc.text(doc.splitTextToSize(text(letter.companyAddress, "Company address"), 125), 55, 36);

  const senderCenter = 37;
  doc.setFont("times", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(230, 38, 46);
  doc.text(text(letter.contactPerson, "Contact person"), senderCenter, 51, { align: "center" });
  doc.setTextColor(23, 27, 36);
  doc.setFont("times", "bolditalic");
  doc.text(text(letter.contactTitle, "Position"), senderCenter, 55, { align: "center" });
  doc.setFont("times", "normal");
  const contactLines = doc.splitTextToSize(text(letter.contactLine, "Contact details"), 38) as string[];
  doc.text(contactLines, senderCenter, 59, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(formatLetterDate(letter.date), 30, 78);

  doc.setFontSize(10.5);
  doc.setFont("helvetica", "bold");
  const recipientLines = [
    text(letter.recipientName, "Recipient name"),
    text(letter.recipientRole, "Recipient role"),
    text(letter.recipientCompany || project.client, "Recipient company"),
    ...text(letter.recipientAddress, "Recipient address").split(/\r?\n/),
  ];
  let y = 91;
  recipientLines.forEach((line) => {
    doc.text(line, 30, y);
    y += 5.2;
  });

  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(text(letter.salutation, "Sir/Madam:"), 30, y);

  y += 9;
  doc.setFontSize(10.5);
  const introduction = `${text(letter.introduction, "Herewith is our quotation for the")} ${text(project.title, "proposed project")}${project.location ? ` at ${project.location}` : ""}.`;
  y = drawWrappedText(doc, introduction, 30, y, 150, 5.2);

  y += 8;
  const summaryRows: Array<[string, string]> = [
    ["Indicative cost", `PHP ${amount(totals.overall)}`],
    ["Terms of payment", text(project.paymentTerms, "For discussion")],
    ["Duration", text(project.duration, "Subject to scheduling")],
  ];
  summaryRows.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold");
    doc.text(label, 38, y);
    doc.text(":", 80, y);
    doc.text(value, 86, y);
    y += 9;
  });

  const closingY = Math.min(Math.max(y + 10, 205), 242);
  doc.setFont("helvetica", "bold");
  doc.text(text(letter.closing, "Thank you,"), 30, closingY);
  doc.addImage(signature, "PNG", 58, closingY + 5, 19, 15.2, "authorized-signature", "FAST");
  doc.setFontSize(10.5);
  doc.text(text(letter.signatoryName, "Authorized signatory").toUpperCase(), 67.5, closingY + 25, { align: "center" });
  doc.line(38, closingY + 26, 97, closingY + 26);
  doc.text(text(letter.signatoryTitle, "Position"), 67.5, closingY + 31, { align: "center" });
}

function finalY(doc: jsPDF) {
  return (doc as PdfWithLastTable).lastAutoTable?.finalY ?? BOQ_MARGIN;
}

function baseTableOptions(startY: number): UserOptions {
  return {
    startY,
    margin: { top: BOQ_MARGIN, right: BOQ_MARGIN, bottom: BOQ_BOTTOM_MARGIN, left: BOQ_MARGIN },
    theme: "grid",
    rowPageBreak: "avoid",
    styles: {
      font: "helvetica",
      fontSize: 8,
      textColor: [17, 24, 39],
      lineColor: BORDER_COLOR,
      lineWidth: 0.25,
      cellPadding: 1.6,
      overflow: "linebreak",
      valign: "middle",
    },
    headStyles: {
      fillColor: [238, 241, 245],
      textColor: [17, 24, 39],
      fontStyle: "bold",
      halign: "center",
    },
    footStyles: {
      fillColor: [247, 249, 252],
      textColor: [17, 24, 39],
      fontStyle: "bold",
    },
    showHead: "everyPage",
    showFoot: "lastPage",
    tableLineColor: BORDER_COLOR,
    tableLineWidth: 0.25,
  };
}

function sectionHeading(title: string) {
  return {
    content: title,
    colSpan: 5,
    styles: {
      fillColor: TEAL,
      textColor: [255, 255, 255] as [number, number, number],
      fontStyle: "bold" as const,
      halign: "left" as const,
      fontSize: 10,
      cellPadding: 1.8,
    },
  };
}

function drawBoqHeader(doc: jsPDF) {
  doc.setDrawColor(...BORDER_COLOR);
  doc.setLineWidth(0.25);
  doc.rect(BOQ_MARGIN, BOQ_MARGIN, BOQ_WIDTH, 12);
  doc.line(105, BOQ_MARGIN, 105, BOQ_MARGIN + 12);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...RED);
  doc.text("BNM3", 56.5, 15.5, { align: "right" });
  doc.setTextColor(...NAVY);
  doc.text(" ENTERPRISES", 56.5, 15.5);
  doc.setTextColor(17, 24, 39);
  doc.text("BILL OF QUANTITIES", 153.5, 15.5, { align: "center" });
}

function drawProjectInformation(doc: jsPDF, input: BillOfMaterialsPdfInput) {
  autoTable(doc, {
    ...baseTableOptions(20),
    body: [
      [
        `PROJECT TITLE\n${text(input.project.title, "Project title")}`,
        `LOCATION\n${text(input.project.location, "Project location")}`,
      ],
      [{ content: `PREPARED FOR\n${text(input.project.client, "Client or company")}`, colSpan: 2 }],
    ],
    columnStyles: { 0: { cellWidth: 119 }, 1: { cellWidth: 75 } },
    bodyStyles: { minCellHeight: 10, fontSize: 8.5 },
  });
}

function drawCostSection(doc: jsPDF, title: string, rows: PdfCostRow[], totalLabel: string, total: number) {
  const printableRows = rows.filter(hasCostRow);
  autoTable(doc, {
    ...baseTableOptions(finalY(doc)),
    head: [
      [sectionHeading(title)],
      ["Description", "Unit", "Quantity", "Unit cost (PHP)", "Total (PHP)"],
    ],
    body: printableRows.map((row) => [
      text(row.description, ""),
      text(row.unit, ""),
      row.quantity || "",
      row.unitCost ? amount(numberValue(row.unitCost)) : "",
      amount(costTotal(row)),
    ]),
    foot: [[{ content: totalLabel, colSpan: 4, styles: { halign: "right" } }, amount(total)]],
    columnStyles: {
      0: { cellWidth: 86 },
      1: { cellWidth: 18, halign: "center" },
      2: { cellWidth: 22, halign: "right" },
      3: { cellWidth: 34, halign: "right" },
      4: { cellWidth: 34, halign: "right", fontStyle: "bold" },
    },
  });
}

function drawLaborSection(doc: jsPDF, rows: PdfLaborRow[], total: number) {
  const printableRows = rows.filter(hasLaborRow);
  autoTable(doc, {
    ...baseTableOptions(finalY(doc)),
    head: [
      [sectionHeading("Labor")],
      ["Personnel", "Quantity", "No. of days", "Daily rate (PHP)", "Total (PHP)"],
    ],
    body: printableRows.map((row) => [
      text(row.personnel, ""),
      row.quantity || "",
      row.days || "",
      row.dailyRate ? amount(numberValue(row.dailyRate)) : "",
      amount(laborTotal(row)),
    ]),
    foot: [[{ content: "Labor cost", colSpan: 4, styles: { halign: "right" } }, amount(total)]],
    columnStyles: {
      0: { cellWidth: 86 },
      1: { cellWidth: 18, halign: "right" },
      2: { cellWidth: 22, halign: "right" },
      3: { cellWidth: 34, halign: "right" },
      4: { cellWidth: 34, halign: "right", fontStyle: "bold" },
    },
  });
}

function ensureBoqSpace(doc: jsPDF, requiredHeight: number) {
  if (finalY(doc) + requiredHeight > PAGE_HEIGHT - BOQ_BOTTOM_MARGIN) doc.addPage("a4", "portrait");
}

function drawSummaryAndTerms(doc: jsPDF, input: BillOfMaterialsPdfInput) {
  ensureBoqSpace(doc, input.showPreparedBy ? 63 : 53);
  const summaryBody: Array<[string, string]> = [["Subtotal cost", amount(input.totals.subtotal)]];
  if (input.showContingency) summaryBody.push(["Contingency", amount(input.totals.contingency)]);
  summaryBody.push([`VAT (${input.vatRate || "0"}%)`, amount(input.totals.vat)]);
  summaryBody.push(["OVERALL PROJECT COST", `PHP ${amount(input.totals.overall)}`]);

  autoTable(doc, {
    ...baseTableOptions(finalY(doc)),
    body: summaryBody,
    columnStyles: { 0: { cellWidth: 150 }, 1: { cellWidth: 44, halign: "right", fontStyle: "bold" } },
    didParseCell: (data) => {
      if (data.section === "body" && data.row.index === summaryBody.length - 1) {
        data.cell.styles.fillColor = NAVY;
        data.cell.styles.textColor = [255, 255, 255];
        data.cell.styles.fontStyle = "bold";
        data.cell.styles.fontSize = 9.5;
      }
    },
  });

  const terms: Array<[string, string]> = [
    ["Duration", text(input.project.duration, "Subject to scheduling")],
    ["Terms of payment", text(input.project.paymentTerms, "For discussion")],
  ];
  if (input.showPreparedBy) terms.push(["Prepared by", text(input.project.preparedBy, "Prepared by")]);
  autoTable(doc, {
    ...baseTableOptions(finalY(doc)),
    body: terms,
    columnStyles: { 0: { cellWidth: 40, fontStyle: "bold" }, 1: { cellWidth: 154 } },
  });

  if (input.showDetailedDisclaimer) {
    const disclaimer = "Indicative working cost only. Not a binding quotation. Quantities, rates, tax treatment, technical feasibility, and site conditions require qualified review.";
    const y = finalY(doc) + 4;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(102, 112, 133);
    doc.text(doc.splitTextToSize(disclaimer, BOQ_WIDTH - 6), BOQ_MARGIN + 3, y);
  }
}

function addBoqPageNumbers(doc: jsPDF) {
  const pages = doc.getNumberOfPages();
  for (let page = 2; page <= pages; page += 1) {
    doc.setPage(page);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(31, 41, 55);
    doc.text(String(page - 1), PAGE_WIDTH - BOQ_MARGIN, PAGE_HEIGHT - 5, { align: "right" });
  }
}

function filenameFor(title: string) {
  const safeTitle = title.trim().replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();
  return `${safeTitle || "bnm3-project"}-quotation.pdf`;
}

export async function generateBillOfMaterialsPdf(input: BillOfMaterialsPdfInput) {
  const [logo, signature] = await Promise.all([
    loadImageData("/bnm3-logo.png"),
    loadImageData("/antonio-miparanum-signature.png"),
  ]);
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
  doc.setProperties({
    title: text(input.project.title, "BNM3 quotation package"),
    subject: "Indicative quotation letter and bill of quantities",
    author: "BNM3 Enterprises",
    creator: "BNM3 Enterprises project tools",
  });

  drawLetterPage(doc, input, logo, signature);
  doc.addPage("a4", "portrait");
  drawBoqHeader(doc);
  drawProjectInformation(doc, input);
  drawCostSection(doc, "Materials", input.materials, "Materials total", input.totals.materialsTotal);
  drawLaborSection(doc, input.labor, input.totals.laborCost);
  drawCostSection(doc, "Other costs & consumables", input.otherCosts, "Other costs total", input.totals.otherCost);
  drawSummaryAndTerms(doc, input);
  addBoqPageNumbers(doc);
  doc.save(filenameFor(input.project.title));
}
