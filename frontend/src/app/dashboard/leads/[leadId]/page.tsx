import type { Metadata } from "next";
import LeadRecord from "./LeadRecord";
import "../../dashboard.css";
import "./record.css";

export const metadata: Metadata = {
  title: "Lead Review POC | BNM3 Construction",
  description: "Detailed personnel call record and assessment verification checklist.",
};

export function generateStaticParams() {
  return ["LPG-0261", "LPG-0260", "LPG-0259", "LPG-0258", "LPG-0257", "LPG-0256"].map((leadId) => ({ leadId }));
}

export default async function LeadRecordPage({ params }: { params: Promise<{ leadId: string }> }) {
  const { leadId } = await params;
  return <LeadRecord leadId={leadId} />;
}
