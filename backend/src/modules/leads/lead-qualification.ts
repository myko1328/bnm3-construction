import type { CreateLeadInput } from "./lead.schemas.js";

const supportedLocations = [
  "iligan",
  "cebu city",
  "cagayan de oro",
  "negros",
  "bukidnon",
  "malaybalay",
  "valencia city",
  "manolo fortich",
];

const inspectionSignalLabels: Record<keyof CreateLeadInput["projectSignals"], string> = {
  requiresDrilling: "Possible drilling or wall penetration",
  unclearPipeRoute: "Pipe route is unclear",
  multipleFloors: "Installation spans multiple floors",
  existingSystemModification: "Existing LPG system will be modified",
  commercialProperty: "Commercial or managed property",
  safetyConcern: "Possible safety concern",
};

export function qualifyLead(input: CreateLeadInput) {
  const normalizedLocation = input.project.cityMunicipality.toLowerCase();
  const withinServiceArea = supportedLocations.some((location) => normalizedLocation.includes(location));
  const inspectionTriggers = Object.entries(input.projectSignals)
    .filter(([, active]) => active)
    .map(([signal]) => inspectionSignalLabels[signal as keyof typeof inspectionSignalLabels]);

  if (!withinServiceArea) {
    return {
      score: 20,
      classification: "outside_service_area" as const,
      reasons: ["Project location is outside the current configured service area."],
      inspectionTriggers,
    };
  }

  if (input.projectSignals.safetyConcern) {
    return {
      score: 100,
      classification: "priority_review" as const,
      reasons: ["Customer response indicates a possible safety concern requiring prompt human review."],
      inspectionTriggers,
    };
  }

  if (input.missingQuestions.length > 0) {
    return {
      score: 55,
      classification: "needs_clarification" as const,
      reasons: [`${input.missingQuestions.length} qualification question(s) still require an answer.`],
      inspectionTriggers,
    };
  }

  if (inspectionTriggers.length > 0) {
    return {
      score: 80,
      classification: "site_inspection_likely" as const,
      reasons: ["One or more project conditions require technical confirmation."],
      inspectionTriggers,
    };
  }

  return {
    score: input.source === "estimator" ? 75 : 70,
    classification: "qualified" as const,
    reasons: ["The service and location are supported and the initial information is complete."],
    inspectionTriggers,
  };
}
