import type { Metadata } from "next";
import FireSprinklerExperience from "./FireSprinklerExperience";
import "../residential-lpg/assessment.css";
import "./sprinkler.css";

export const metadata: Metadata = {
  title: "Fire Sprinkler Assessment | BNM3 Construction",
  description: "Describe a building water-based fire sprinkler project in five questions and submit it for qualified BNM3 review.",
};

export default function FireSprinklerAssessmentPage() {
  return <FireSprinklerExperience mode="assessment" />;
}
