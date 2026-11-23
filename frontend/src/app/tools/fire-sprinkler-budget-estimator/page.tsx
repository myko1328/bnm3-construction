import type { Metadata } from "next";
import FireSprinklerExperience from "../../assessment/fire-sprinkler/FireSprinklerExperience";
import "../../assessment/residential-lpg/assessment.css";
import "../../assessment/fire-sprinkler/sprinkler.css";

export const metadata: Metadata = {
  title: "Fire Sprinkler Initial Quote | BNM3 Construction",
  description: "Explore an indicative area-based sprinkler-head allowance before qualified design and final pricing review.",
};

export default function FireSprinklerBudgetEstimatorPage() {
  return <FireSprinklerExperience mode="estimator" />;
}
