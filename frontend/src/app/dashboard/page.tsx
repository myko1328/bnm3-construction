import type { Metadata } from "next";
import PersonnelDashboard from "./PersonnelDashboard";
import "./dashboard.css";

export const metadata: Metadata = {
  title: "Personnel Dashboard POC | BNM3 Construction",
  description: "Frontend proof of concept for reviewing and managing BNM3 project leads.",
};

export default function DashboardPage() {
  return <PersonnelDashboard />;
}
