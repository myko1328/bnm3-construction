import type { Metadata } from "next";
import LpgAssessment from "../../assessment/residential-lpg/LpgAssessment";
import "../../assessment/residential-lpg/assessment.css";

export const metadata: Metadata = {
  title: "LPG Installation Budget Estimator | BNM3 Construction",
  description: "Explore a preliminary LPG installation budget based on equipment, pipe length, route, floors, and safety options.",
};

export default function LpgBudgetEstimatorPage() {
  return <LpgAssessment startWithEstimator />;
}
