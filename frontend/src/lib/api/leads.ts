export type LeadClassification =
  | "qualified"
  | "needs_clarification"
  | "site_inspection_likely"
  | "outside_service_area"
  | "priority_review";

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

export class LeadApiError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = "LeadApiError";
  }
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

async function createLead(input: AssessmentLeadInput | EstimatorLeadInput): Promise<CreatedLead> {
  if (!apiUrl) {
    throw new LeadApiError("The assessment service is not configured. Please contact BNM3 directly.");
  }

  let response: Response;
  try {
    response = await fetch(`${apiUrl.replace(/\/$/, "")}/api/v1/leads`, {
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

export function createAssessmentLead(input: AssessmentLeadInput) {
  return createLead(input);
}

export function createEstimatorLead(input: EstimatorLeadInput) {
  return createLead(input);
}
