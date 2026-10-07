import type { LeadClassification, LeadSource, LeadStatus, StoredLead } from "@/lib/api/leads";

export type ChecklistItem = { id: string; label: string; detail?: string };

export type DashboardLead = {
  id: string;
  referenceCode: string;
  name: string;
  phone: string;
  service: string;
  property: string;
  address: string;
  city: string;
  received: string;
  createdAtLabel: string;
  status: LeadStatus;
  statusLabel: string;
  priority: "High" | "Normal";
  source: LeadSource;
  sourceLabel: string;
  classification: LeadClassification;
  classificationLabel: string;
  preliminaryClassification: LeadClassification;
  preliminaryClassificationLabel: string;
  qualificationDecision: "confirmed" | "overridden" | null;
  qualificationReviewReason: string;
  qualificationReviewedBy: string;
  qualificationReviewedAt: string;
  qualificationScore: number;
  classificationReasons: string[];
  assignee: string;
  budget: string;
  equipment: string[];
  scope: string;
  nextAction: string;
  nextActionDate: string;
  notes: string;
  missingQuestions: string[];
  inspectionTriggers: string[];
  preliminaryInspectionTriggers: string[];
  estimateAssumptions: string[];
  activities: Array<{ id: string; author: string; message: string; time: string }>;
};

export const leadStatuses: LeadStatus[] = [
  "new",
  "assigned",
  "contact_attempted",
  "customer_contacted",
  "needs_clarification",
  "site_inspection_recommended",
  "inspection_scheduled",
  "ready_for_quotation",
  "converted",
  "closed",
];

export const leadSources: LeadSource[] = ["assessment", "estimator", "manual"];

const STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New",
  assigned: "Assigned",
  contact_attempted: "Contact attempted",
  customer_contacted: "Customer contacted",
  needs_clarification: "Needs clarification",
  site_inspection_recommended: "Inspection recommended",
  inspection_scheduled: "Inspection scheduled",
  ready_for_quotation: "Ready for quotation",
  converted: "Converted",
  closed: "Closed",
};

const SOURCE_LABELS: Record<LeadSource, string> = {
  assessment: "Assessment funnel",
  estimator: "Budget estimator",
  manual: "Manual entry",
};

const CLASSIFICATION_LABELS: Record<LeadClassification, string> = {
  qualified: "Qualified",
  needs_clarification: "Needs clarification",
  site_inspection_likely: "Site inspection likely",
  outside_service_area: "Service area review",
  priority_review: "Priority review",
};

const PROPERTY_LABELS: Record<string, string> = {
  house: "Detached house",
  townhouse: "Townhouse / duplex",
  condo: "Condominium unit",
  multi: "Apartment / multi-unit",
  mixed: "Home with business use",
  other: "Other property type",
};

const WORK_LABELS: Record<string, string> = {
  new: "New LPG installation",
  extend: "Extend an existing system",
  replace: "Replace or upgrade a system",
  safety: "Add a detector or automatic shutoff",
  inspect: "Inspect an existing system",
  unsure: "Requested work requires clarification",
};

export function statusLabel(status: LeadStatus) {
  return STATUS_LABELS[status];
}

export function sourceLabel(source: LeadSource) {
  return SOURCE_LABELS[source];
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 }).format(value);
}

function formatDate(value: string, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-PH", { timeZone: "Asia/Manila", ...options }).format(new Date(value));
}

function formatReceived(value: string) {
  const elapsedMinutes = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 60_000));
  if (elapsedMinutes < 1) return "Just now";
  if (elapsedMinutes < 60) return `${elapsedMinutes} min ago`;
  if (elapsedMinutes < 1_440) return `${Math.floor(elapsedMinutes / 60)} hr ago`;
  if (elapsedMinutes < 2_880) return "Yesterday";
  return formatDate(value, { month: "short", day: "numeric" });
}

function readEquipment(answers: Record<string, unknown>) {
  if (!Array.isArray(answers.equipment)) return [];
  return answers.equipment.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const equipment = item as Record<string, unknown>;
    const label = stringValue(equipment.label) || stringValue(equipment.code);
    if (!label) return [];
    const quantity = typeof equipment.quantity === "number" ? equipment.quantity : 1;
    return [`${label} × ${quantity}`];
  });
}

function buildScope(lead: StoredLead) {
  const answers = lead.answers;
  const work = WORK_LABELS[stringValue(answers.requestedWork)] || lead.service;
  const configuration = answers.estimatorConfiguration;
  if (!configuration || typeof configuration !== "object") return work;
  const config = configuration as Record<string, unknown>;
  const details = [
    stringValue(config.pipeLength) && `${stringValue(config.pipeLength)} pipe-length band`,
    stringValue(config.route) && `${stringValue(config.route)} route`,
    stringValue(config.floors) && `${stringValue(config.floors)} floor${stringValue(config.floors) === "1" ? "" : "s"}`,
    stringValue(config.protection) && `${stringValue(config.protection)} protection`,
  ].filter(Boolean);
  return [work, ...details].join(" · ");
}

function nextActionFor(lead: StoredLead) {
  if (lead.status === "new") return "Call and validate project details";
  if (lead.status === "needs_clarification") return "Resolve missing project information";
  if (lead.status === "site_inspection_recommended") return "Arrange a site inspection";
  if (lead.status === "inspection_scheduled") return "Prepare for the scheduled inspection";
  if (lead.status === "ready_for_quotation") return "Prepare the formal quotation";
  if (lead.status === "converted") return "Handoff to project delivery";
  if (lead.status === "closed") return "No further action scheduled";
  return "Continue customer follow-up";
}

export function toDashboardLead(lead: StoredLead): DashboardLead {
  const address = [lead.houseUnitNumber, lead.addressLine, lead.barangay && `Brgy. ${lead.barangay}`, lead.cityMunicipality].filter(Boolean).join(", ");
  const equipment = readEquipment(lead.answers);
  const propertyCode = stringValue(lead.answers.propertyType);
  const effectiveClassification = lead.reviewedClassification ?? lead.classification;
  const highPriority = ["priority_review", "site_inspection_likely"].includes(effectiveClassification);

  return {
    id: lead.id,
    referenceCode: lead.referenceCode,
    name: lead.customerName,
    phone: lead.phone,
    service: lead.service,
    property: PROPERTY_LABELS[propertyCode] || (lead.source === "estimator" ? "Not provided by estimator" : "Not provided"),
    address: address || `${lead.barangay}, ${lead.cityMunicipality}`,
    city: lead.cityMunicipality,
    received: formatReceived(lead.createdAt),
    createdAtLabel: formatDate(lead.createdAt, { dateStyle: "medium", timeStyle: "short" }),
    status: lead.status,
    statusLabel: STATUS_LABELS[lead.status],
    priority: highPriority ? "High" : "Normal",
    source: lead.source,
    sourceLabel: SOURCE_LABELS[lead.source],
    classification: effectiveClassification,
    classificationLabel: CLASSIFICATION_LABELS[effectiveClassification],
    preliminaryClassification: lead.classification,
    preliminaryClassificationLabel: CLASSIFICATION_LABELS[lead.classification],
    qualificationDecision: lead.qualificationDecision,
    qualificationReviewReason: lead.qualificationReviewReason ?? "",
    qualificationReviewedBy: lead.qualificationReviewedBy ?? "",
    qualificationReviewedAt: lead.qualificationReviewedAt ? formatDate(lead.qualificationReviewedAt, { dateStyle: "medium", timeStyle: "short" }) : "",
    qualificationScore: lead.qualificationScore,
    classificationReasons: lead.classificationReasons,
    assignee: lead.assignedTo ? "Assigned personnel" : "Unassigned",
    budget: lead.estimate ? `${formatCurrency(lead.estimate.minimum)}–${formatCurrency(lead.estimate.maximum)}` : "Not calculated",
    equipment: equipment.length ? equipment : ["Not provided"],
    scope: buildScope(lead),
    nextAction: nextActionFor(lead),
    nextActionDate: "Schedule during customer follow-up",
    notes: lead.classificationReasons.join(" "),
    missingQuestions: lead.missingQuestions,
    inspectionTriggers: lead.confirmedInspectionTriggers.length ? lead.confirmedInspectionTriggers : lead.inspectionTriggers,
    preliminaryInspectionTriggers: lead.inspectionTriggers,
    estimateAssumptions: lead.estimate?.assumptions ?? [],
    activities: (lead.activities ?? []).map((activity) => ({
      id: activity.id,
      author: activity.actorName || "BNM3 system",
      message: activity.message,
      time: formatDate(activity.createdAt, { dateStyle: "medium", timeStyle: "short" }),
    })),
  };
}

export function buildChecklist(lead: DashboardLead) {
  const captured: ChecklistItem[] = [
    { id: "service", label: "Requested service identified", detail: lead.service },
    { id: "property", label: "Property type provided", detail: lead.property },
    { id: "equipment", label: "Equipment and quantities provided", detail: lead.equipment.join(", ") },
    { id: "address", label: "Project address provided", detail: lead.address },
    { id: "contact", label: "Contact number and consent provided", detail: lead.phone },
  ];
  if (lead.budget !== "Not calculated") captured.push({ id: "budget", label: "Preliminary budget explored", detail: lead.budget });

  const verify: ChecklistItem[] = [
    { id: "confirm-scope", label: "Confirm the requested work and intended outcome" },
    { id: "confirm-equipment", label: "Verify equipment types, quantities, and expected use" },
    { id: "confirm-address", label: "Verify the address, access instructions, and service coverage" },
  ];
  if (/existing|replace|upgrade|inspection/i.test(lead.scope)) verify.push({ id: "existing-condition", label: "Ask about system age, modifications, damage, and recurring issues" });
  if (/condominium|multi|business/i.test(lead.property)) verify.push({ id: "building-approval", label: "Confirm building or administration LPG approval and work restrictions" });
  if (lead.equipment.some((item) => /commercial|fryer|range|oven|water heater/i.test(item))) verify.push({ id: "equipment-ratings", label: "Request appliance ratings or nameplate information" });
  if (/ceiling|concealed|masonry|underground|floor/i.test(lead.scope)) verify.push({ id: "route-access", label: "Validate the proposed pipe route, floors, and difficult access" });
  if (/detector|shutoff/i.test(lead.scope)) verify.push({ id: "safety-system", label: "Confirm detector, shutoff, controller, and electrical requirements" });
  if (lead.budget !== "Not calculated") verify.push({ id: "budget-disclaimer", label: "Explain that the online budget is preliminary, not a formal quotation" });
  lead.missingQuestions.forEach((question, index) => verify.push({ id: `missing-${index}`, label: question }));

  const next: ChecklistItem[] = [
    { id: "contacted", label: "Customer successfully contacted" },
    { id: "serviceable", label: "Project appears within BNM3 service capability" },
    { id: "inspection-decision", label: "Decide whether a site inspection is required" },
    { id: "availability", label: "Discuss customer availability for the next action" },
    { id: "documents", label: "Record any photos, plans, or documents requested" },
    { id: "assigned", label: "Assign the responsible technical personnel" },
    { id: "follow-up", label: "Record the next action and follow-up date" },
  ];
  return { captured, verify, next };
}
