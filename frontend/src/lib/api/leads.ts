export type LeadClassification =
  | "qualified"
  | "needs_clarification"
  | "site_inspection_likely"
  | "outside_service_area"
  | "priority_review";

export type LeadSource = "assessment" | "estimator" | "manual";

export type LeadStatus =
  | "new"
  | "assigned"
  | "contact_attempted"
  | "customer_contacted"
  | "needs_clarification"
  | "site_inspection_recommended"
  | "inspection_scheduled"
  | "ready_for_quotation"
  | "converted"
  | "closed";

export type StaffRole = "customer_support" | "technical" | "manager" | "admin";
export type QualificationDecision = "confirmed" | "overridden";
export type InspectionRequestStatus = "requested" | "scheduled" | "completed" | "cancelled";

export type EstimateSnapshot = {
  currency: "PHP";
  minimum: number;
  maximum: number;
  assumptions?: string[];
};

export type LeadActivity = {
  id: string;
  activityType: string;
  message: string;
  actorName: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export type StoredCallRecord = {
  id: string;
  leadId: string;
  checks: Record<string, boolean>;
  comments: Record<string, string>;
  callSummary: string;
  updatedBy: string;
  finalizedAt: string | null;
  finalizedBy: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SiteInspectionRequest = {
  id: string;
  leadId: string;
  status: InspectionRequestStatus;
  reason: string;
  inspectionTriggers: string[];
  preferredDate: string | null;
  scheduledFor: string | null;
  assignedTechnicalName: string | null;
  technicalNotes: string | null;
  requestedBy: string;
  requestedByRole: StaffRole;
  createdAt: string;
  updatedAt: string;
};

export type SaveCallRecordInput = {
  checks: Record<string, boolean>;
  comments: Record<string, string>;
  callSummary: string;
  actorName: string;
};

export type StoredLead = {
  id: string;
  referenceCode: string;
  source: LeadSource;
  status: LeadStatus;
  classification: LeadClassification;
  reviewedClassification: LeadClassification | null;
  qualificationDecision: QualificationDecision | null;
  qualificationReviewReason: string | null;
  qualificationReviewedBy: string | null;
  qualificationReviewedAt: string | null;
  confirmedInspectionTriggers: string[];
  qualificationScore: number;
  classificationReasons: string[];
  customerName: string;
  phone: string;
  email: string | null;
  service: string;
  cityMunicipality: string;
  barangay: string;
  addressLine: string | null;
  houseUnitNumber: string | null;
  answers: Record<string, unknown>;
  estimate: EstimateSnapshot | null;
  missingQuestions: string[];
  inspectionTriggers: string[];
  assignedTo: string | null;
  consentedAt: string;
  createdAt: string;
  updatedAt: string;
  activities?: LeadActivity[];
  siteInspectionRequest?: SiteInspectionRequest | null;
};

type BaseLeadInput = {
  source: "assessment" | "estimator";
  customer: {
    name: string;
    phone: string;
    consentedAt: string;
  };
  project: {
    service: string;
    cityMunicipality: string;
    barangay: string;
    addressLine?: string;
    houseUnitNumber?: string;
  };
  answers: Record<string, unknown>;
  missingQuestions: string[];
  projectSignals: {
    requiresDrilling: boolean;
    unclearPipeRoute: boolean;
    multipleFloors: boolean;
    existingSystemModification: boolean;
    commercialProperty: boolean;
    safetyConcern: boolean;
  };
};

export type AssessmentLeadInput = BaseLeadInput & { source: "assessment" };

export type EstimatorLeadInput = BaseLeadInput & {
  source: "estimator";
  estimate: {
    currency: "PHP";
    minimum: number;
    maximum: number;
    assumptions: string[];
  };
};

export type CreatedLead = {
  id: string;
  referenceCode: string;
  classification: LeadClassification;
  qualificationScore: number;
  classificationReasons: string[];
  createdAt: string;
};

type LeadResponse = { data: CreatedLead };
type LeadListResponse = { data: StoredLead[] };
type LeadDetailResponse = { data: StoredLead };

export class LeadApiError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = "LeadApiError";
  }
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

function getApiUrl() {
  if (!apiUrl) throw new LeadApiError("The lead service is not configured. Please contact the system administrator.");
  return apiUrl.replace(/\/$/, "");
}

async function readApiResponse<T>(response: Response, fallbackMessage: string): Promise<T> {
  const payload = await response.json().catch(() => null) as T | { error?: string } | null;
  if (!response.ok) {
    const message = payload && typeof payload === "object" && "error" in payload && payload.error
      ? payload.error
      : fallbackMessage;
    throw new LeadApiError(message, response.status);
  }
  if (!payload) throw new LeadApiError("The lead service returned an empty response.");
  return payload as T;
}

async function createLead(input: AssessmentLeadInput | EstimatorLeadInput): Promise<CreatedLead> {
  const baseUrl = getApiUrl();
  let response: Response;
  try {
    response = await fetch(`${baseUrl}/api/v1/leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  } catch {
    throw new LeadApiError("We could not reach the BNM3 assessment service. Please check your connection and try again.");
  }

  const payload = await response.json().catch(() => null) as LeadResponse | { error?: string } | null;
  if (!response.ok) {
    const message = payload && "error" in payload && payload.error
      ? payload.error
      : "We could not submit your assessment. Please review your details and try again.";
    throw new LeadApiError(message, response.status);
  }

  if (!payload || !("data" in payload) || !payload.data?.id || !payload.data.referenceCode) {
    throw new LeadApiError("The assessment service returned an incomplete confirmation. Please contact BNM3 before submitting again.");
  }

  return payload.data;
}

export async function getLeads(options: { status?: LeadStatus; source?: LeadSource; limit?: number; signal?: AbortSignal } = {}) {
  const query = new URLSearchParams();
  if (options.status) query.set("status", options.status);
  if (options.source) query.set("source", options.source);
  query.set("limit", String(options.limit ?? 100));

  const baseUrl = getApiUrl();
  let response: Response;
  try {
    response = await fetch(`${baseUrl}/api/v1/leads?${query.toString()}`, { signal: options.signal, cache: "no-store" });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new LeadApiError("We could not load leads from the BNM3 service. Check the connection and try again.");
  }
  const payload = await readApiResponse<LeadListResponse>(response, "We could not load the lead inbox.");
  return payload.data;
}

export async function getLeadById(id: string, signal?: AbortSignal) {
  const baseUrl = getApiUrl();
  let response: Response;
  try {
    response = await fetch(`${baseUrl}/api/v1/leads/${encodeURIComponent(id)}`, { signal, cache: "no-store" });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new LeadApiError("We could not load this lead from the BNM3 service. Check the connection and try again.");
  }
  const payload = await readApiResponse<LeadDetailResponse>(response, "We could not load this lead record.");
  return payload.data;
}

export async function getCallRecord(leadId: string, signal?: AbortSignal) {
  const response = await fetch(`${getApiUrl()}/api/v1/leads/${encodeURIComponent(leadId)}/call-record`, { signal, cache: "no-store" });
  const payload = await readApiResponse<{ data: StoredCallRecord | null }>(response, "We could not load the call record.");
  return payload.data;
}

export async function saveCallRecord(leadId: string, input: SaveCallRecordInput) {
  const response = await fetch(`${getApiUrl()}/api/v1/leads/${encodeURIComponent(leadId)}/call-record`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
  const payload = await readApiResponse<{ data: StoredCallRecord }>(response, "We could not save the call record.");
  return payload.data;
}

export async function finalizeCallRecord(leadId: string, input: SaveCallRecordInput & { requiredCheckIds: string[]; requiredCommentIds: string[] }) {
  const response = await fetch(`${getApiUrl()}/api/v1/leads/${encodeURIComponent(leadId)}/call-record/finalize`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
  const payload = await readApiResponse<{ data: StoredCallRecord }>(response, "We could not finalize the call record.");
  return payload.data;
}

export async function addManagerQuestion(leadId: string, question: string, actorName: string) {
  const response = await fetch(`${getApiUrl()}/api/v1/leads/${encodeURIComponent(leadId)}/manager-questions`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question, actorName }) });
  const payload = await readApiResponse<{ data: LeadActivity }>(response, "We could not save the manager question.");
  return payload.data;
}

export async function saveQualificationReview(leadId: string, input: { decision: QualificationDecision; classification: LeadClassification; reason: string; inspectionTriggers: string[]; actorName: string; actorRole: StaffRole }) {
  const response = await fetch(`${getApiUrl()}/api/v1/leads/${encodeURIComponent(leadId)}/qualification`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
  const payload = await readApiResponse<{ data: StoredLead }>(response, "We could not save the qualification review.");
  return payload.data;
}

export async function updateLeadStatus(leadId: string, input: { status: LeadStatus; note: string; actorName: string; actorRole: StaffRole }) {
  const response = await fetch(`${getApiUrl()}/api/v1/leads/${encodeURIComponent(leadId)}/status`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
  const payload = await readApiResponse<{ data: StoredLead }>(response, "We could not update the lead status.");
  return payload.data;
}

export async function createSiteInspectionRequest(leadId: string, input: { reason: string; inspectionTriggers: string[]; preferredDate?: string; actorName: string; actorRole: StaffRole }) {
  const response = await fetch(`${getApiUrl()}/api/v1/leads/${encodeURIComponent(leadId)}/site-inspection`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
  const payload = await readApiResponse<{ data: SiteInspectionRequest }>(response, "We could not create the site-inspection request.");
  return payload.data;
}

export async function updateSiteInspectionRequest(leadId: string, input: { status: Exclude<InspectionRequestStatus, "requested">; scheduledFor?: string; assignedTechnicalName?: string; technicalNotes?: string; actorName: string; actorRole: StaffRole }) {
  const response = await fetch(`${getApiUrl()}/api/v1/leads/${encodeURIComponent(leadId)}/site-inspection`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
  const payload = await readApiResponse<{ data: SiteInspectionRequest }>(response, "We could not update the site-inspection request.");
  return payload.data;
}

export function createAssessmentLead(input: AssessmentLeadInput) {
  return createLead(input);
}

export function createEstimatorLead(input: EstimatorLeadInput) {
  return createLead(input);
}
