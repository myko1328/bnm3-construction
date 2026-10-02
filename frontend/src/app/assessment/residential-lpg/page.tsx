import type { Metadata } from "next";
import LpgAssessment from "./LpgAssessment";
import "./assessment.css";

export const metadata: Metadata = {
  title: "Residential LPG Project Assessment | BNM3 Construction",
  description: "Describe your residential LPG installation and receive an estimator-ready project summary from BNM3 Construction.",
};

export default function ResidentialLpgAssessmentPage() {
  return <LpgAssessment />;
}
