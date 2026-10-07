import type { Metadata } from "next";
import LeadRecord from "./LeadRecord";
import "../../dashboard.css";
import "./record.css";

export const metadata: Metadata = {
  title: "Lead Review | BNM3 Construction",
  description: "Detailed personnel call record and assessment verification checklist.",
};

export default async function LeadRecordPage({ params }: { params: Promise<{ leadId: string }> }) {
  const { leadId } = await params;
  return <LeadRecord leadId={leadId} />;
}
