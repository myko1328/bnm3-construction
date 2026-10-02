"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

export type LeadStatus = "New" | "Contacted" | "Qualified" | "Inspection scheduled" | "Estimating" | "Quoted";

export type Lead = {
  id: string;
  name: string;
  phone: string;
  service: string;
  property: string;
  address: string;
  city: string;
  received: string;
  status: LeadStatus;
  priority: "High" | "Normal";
  source: string;
  assignee: string;
  budget: string;
  equipment: string[];
  scope: string;
  nextAction: string;
  nextActionDate: string;
  notes: string;
};

export type ChecklistItem = { id: string; label: string; detail?: string };

export const initialLeads: Lead[] = [
  { id: "LPG-0261", name: "Maria Santos", phone: "0917 555 0142", service: "Residential LPG", property: "Detached house", address: "24 Mabini Street, Brgy. Poblacion, Iligan City", city: "Iligan City", received: "8 min ago", status: "New", priority: "High", source: "Google Search", assignee: "Unassigned", budget: "₱39,500–₱62,000", equipment: ["Built-in gas hob × 1", "Gas oven × 1"], scope: "New LPG installation · 6–10 m exposed route · 1 floor", nextAction: "Call and validate project details", nextActionDate: "Today, 10:30 AM", notes: "Customer explored the online budget before requesting an assessment." },
  { id: "LPG-0260", name: "Paolo Lim", phone: "0928 441 8093", service: "Residential LPG", property: "Condominium unit", address: "Unit 9C, Salinas Drive, Brgy. Lahug, Cebu City", city: "Cebu City", received: "42 min ago", status: "Contacted", priority: "Normal", source: "Facebook", assignee: "Ana R.", budget: "Not calculated", equipment: ["Tabletop gas stove × 1"], scope: "Replace or upgrade existing system · building approval uncertain", nextAction: "Request building LPG guidelines", nextActionDate: "Today, 1:00 PM", notes: "Reached customer. Waiting for condominium administration requirements." },
  { id: "LPG-0259", name: "Jessa Mercado", phone: "0995 230 1178", service: "Residential LPG", property: "Townhouse / duplex", address: "Block 4 Lot 8, Brgy. Carmen, Cagayan De Oro City", city: "Cagayan De Oro City", received: "Yesterday", status: "Qualified", priority: "Normal", source: "Direct", assignee: "Mark T.", budget: "₱31,000–₱48,500", equipment: ["Freestanding gas range × 1"], scope: "New LPG installation · up to 5 m route · detector requested", nextAction: "Confirm inspection availability", nextActionDate: "Today, 3:00 PM", notes: "Customer is available on weekday afternoons." },
  { id: "LPG-0258", name: "Carlo Villanueva", phone: "0918 773 4601", service: "Residential LPG", property: "Home with business use", address: "Rizal Street, Brgy. 2, Bacolod City", city: "Bacolod City", received: "Sep 29", status: "Inspection scheduled", priority: "High", source: "Referral", assignee: "Joel M.", budget: "₱68,000–₱103,000", equipment: ["Commercial cooking range × 1", "Gas deep fryer × 2"], scope: "Mixed-use kitchen · 11–20 m ceiling route · automatic shutoff", nextAction: "Site inspection", nextActionDate: "Oct 2, 9:00 AM", notes: "Confirm parking and rear service access before dispatch." },
  { id: "LPG-0257", name: "Elaine Ramos", phone: "0906 882 0315", service: "Residential LPG", property: "Detached house", address: "Pine Hills, Brgy. Casisang, Malaybalay City", city: "Malaybalay City", received: "Sep 28", status: "Estimating", priority: "Normal", source: "Google Search", assignee: "Ana R.", budget: "₱45,000–₱71,500", equipment: ["Built-in gas hob × 1", "LPG water heater × 2"], scope: "New installation · 11–20 m exposed route · 2 floors", nextAction: "Complete material takeoff", nextActionDate: "Oct 1", notes: "Inspection measurements uploaded by assigned technician." },
  { id: "LPG-0256", name: "Noel Garcia", phone: "0916 440 7720", service: "Residential LPG", property: "Detached house", address: "Brgy. Balulang, Cagayan De Oro City", city: "Cagayan De Oro City", received: "Sep 27", status: "Quoted", priority: "Normal", source: "Facebook", assignee: "Mark T.", budget: "₱28,500–₱41,000", equipment: ["Tabletop gas stove × 1"], scope: "Existing system inspection and regulator replacement", nextAction: "Follow up on quotation", nextActionDate: "Oct 3", notes: "Quotation Q-2026-014 sent through email and Messenger." },
];

const statuses: Array<"All" | LeadStatus> = ["All", "New", "Contacted", "Qualified", "Inspection scheduled", "Estimating", "Quoted"];

export function buildChecklist(lead: Lead) {
  const captured: ChecklistItem[] = [
    { id: "service", label: "Requested service identified", detail: lead.service },
    { id: "property", label: "Property type provided", detail: lead.property },
    { id: "equipment", label: "Equipment and quantities provided", detail: lead.equipment.join(", ") },
    { id: "address", label: "Project address provided", detail: lead.address },
    { id: "contact", label: "Contact number and consent provided", detail: lead.phone },
  ];
  if (lead.budget !== "Not calculated") captured.push({ id: "budget", label: "Preliminary budget explored", detail: lead.budget });

  const verify: ChecklistItem[] = [
    { id: "confirm-scope", label: "Confirm the requested work and intended outcome" },
    { id: "confirm-equipment", label: "Verify equipment types, quantities, and expected use" },
    { id: "confirm-address", label: "Verify the address, access instructions, and service coverage" },
  ];
  if (/existing|replace|upgrade|inspection/i.test(lead.scope)) verify.push({ id: "existing-condition", label: "Ask about system age, modifications, damage, and recurring issues" });
  if (/condominium|multi|business/i.test(lead.property)) verify.push({ id: "building-approval", label: "Confirm building or administration LPG approval and work restrictions" });
  if (lead.equipment.some((item) => /commercial|fryer|range|oven|water heater/i.test(item))) verify.push({ id: "equipment-ratings", label: "Request appliance ratings or nameplate information" });
  if (/ceiling|concealed|masonry|underground|floor/i.test(lead.scope)) verify.push({ id: "route-access", label: "Validate the proposed pipe route, floors, and difficult access" });
  if (/detector|shutoff/i.test(lead.scope)) verify.push({ id: "safety-system", label: "Confirm detector, shutoff, controller, and electrical requirements" });
  if (lead.budget !== "Not calculated") verify.push({ id: "budget-disclaimer", label: "Explain that the online budget is preliminary, not a formal quotation" });

  const next: ChecklistItem[] = [
    { id: "contacted", label: "Customer successfully contacted" },
    { id: "serviceable", label: "Project appears within BNM3 service capability" },
    { id: "inspection-decision", label: "Decide whether a site inspection is required" },
    { id: "availability", label: "Discuss customer availability for the next action" },
    { id: "documents", label: "Record any photos, plans, or documents requested" },
    { id: "assigned", label: "Assign the responsible technical personnel" },
    { id: "follow-up", label: "Record the next action and follow-up date" },
  ];
  return { captured, verify, next };
}

function SearchIcon() {
  return <svg aria-hidden="true" viewBox="0 0 20 20"><circle cx="8.5" cy="8.5" r="5.5" /><path d="m13 13 4 4" /></svg>;
}

export default function PersonnelDashboard() {
  const [leads, setLeads] = useState(initialLeads);
  const [selectedId, setSelectedId] = useState(initialLeads[0].id);
  const [statusFilter, setStatusFilter] = useState<(typeof statuses)[number]>("All");
  const [query, setQuery] = useState("");
  const selectedLead = leads.find((lead) => lead.id === selectedId) ?? leads[0];

  const filteredLeads = useMemo(() => leads.filter((lead) => {
    const matchesStatus = statusFilter === "All" || lead.status === statusFilter;
    const search = query.trim().toLowerCase();
    const matchesSearch = !search || [lead.name, lead.id, lead.city, lead.phone].some((value) => value.toLowerCase().includes(search));
    return matchesStatus && matchesSearch;
  }), [leads, query, statusFilter]);

  const updateLead = (changes: Partial<Lead>) => setLeads((current) => current.map((lead) => lead.id === selectedLead.id ? { ...lead, ...changes } : lead));

  return (
    <div className="dash-shell">
      <aside className="dash-sidebar">
        <Link className="dash-brand" href="/"><Image src="/bnm3-logo.png" alt="BNM3 Construction" width={259} height={188} /><span><strong>BNM3</strong><small>Personnel</small></span></Link>
        <nav aria-label="Dashboard navigation"><a className="active" href="#leads"><span>01</span> Leads</a><a href="#pipeline"><span>02</span> Pipeline</a><a href="#schedule"><span>03</span> Inspections</a><a href="#quotes"><span>04</span> Quotations</a></nav>
        <div className="dash-poc"><strong>Frontend POC</strong><p>Mock data only. Changes reset when the page reloads.</p></div>
        <Link className="dash-site-link" href="/">View public website →</Link>
      </aside>

      <main className="dash-main">
        <header className="dash-topbar"><div><span>Operations / Leads</span><h1>Lead dashboard</h1></div><div className="dash-user"><span>AD</span><div><strong>Admin Demo</strong><small>Operations</small></div></div></header>

        <section className="dash-metrics" aria-label="Lead summary">
          <article><span>New leads</span><strong>{leads.filter((lead) => lead.status === "New").length}</strong><small>Awaiting first contact</small></article>
          <article><span>Follow-ups today</span><strong>3</strong><small>Calls and clarifications</small></article>
          <article><span>Inspections</span><strong>{leads.filter((lead) => lead.status === "Inspection scheduled").length}</strong><small>Currently scheduled</small></article>
          <article><span>Open estimates</span><strong>{leads.filter((lead) => ["Estimating", "Quoted"].includes(lead.status)).length}</strong><small>Pricing or customer review</small></article>
        </section>

        <section className="dash-workspace" id="leads">
          <div className="lead-panel">
            <div className="lead-panel-heading"><div><span>Lead inbox</span><strong>{filteredLeads.length} records</strong></div><label className="lead-search"><SearchIcon /><input aria-label="Search leads" placeholder="Search name, ID, city..." value={query} onChange={(event) => setQuery(event.target.value)} /></label></div>
            <div className="lead-filters" aria-label="Filter leads by status">{statuses.map((status) => <button className={statusFilter === status ? "active" : ""} type="button" key={status} onClick={() => setStatusFilter(status)}>{status}</button>)}</div>
            <div className="lead-list">{filteredLeads.map((lead) => <button className={selectedLead.id === lead.id ? "lead-row selected" : "lead-row"} type="button" key={lead.id} onClick={() => setSelectedId(lead.id)}><div className="lead-row-top"><span className={`status-dot status-${lead.status.toLowerCase().replaceAll(" ", "-")}`} /><strong>{lead.name}</strong><time>{lead.received}</time></div><div className="lead-row-meta"><span>{lead.id}</span><span>{lead.city}</span></div><div className="lead-row-bottom"><span className="lead-service">{lead.service}</span><span className={`priority priority-${lead.priority.toLowerCase()}`}>{lead.priority}</span></div></button>)}</div>
            {!filteredLeads.length && <p className="lead-empty">No leads match the current filter.</p>}
          </div>

          <article className="lead-detail">
            <header className="detail-header"><div><span>{selectedLead.id}</span><h2>{selectedLead.name}</h2><p>{selectedLead.service} · {selectedLead.city}</p></div><span className={`detail-priority priority-${selectedLead.priority.toLowerCase()}`}>{selectedLead.priority} priority</span></header>

            <div className="detail-actions"><label>Status<select value={selectedLead.status} onChange={(event) => updateLead({ status: event.target.value as LeadStatus })}>{statuses.slice(1).map((status) => <option key={status}>{status}</option>)}</select></label><label>Assigned to<select value={selectedLead.assignee} onChange={(event) => updateLead({ assignee: event.target.value })}><option>Unassigned</option><option>Ana R.</option><option>Mark T.</option><option>Joel M.</option></select></label></div>

            <section className="detail-next"><div><span>Next action</span><strong>{selectedLead.nextAction}</strong><small>{selectedLead.nextActionDate}</small></div><Link className="open-record-link" href={`/dashboard/leads/${selectedLead.id}`}>Open full record →</Link></section>

            <div className="detail-grid">
              <section><h3>Customer</h3><dl><div><dt>Mobile</dt><dd><a href={`tel:${selectedLead.phone.replaceAll(" ", "")}`}>{selectedLead.phone}</a></dd></div><div><dt>Address</dt><dd>{selectedLead.address}</dd></div><div><dt>Lead source</dt><dd>{selectedLead.source}</dd></div></dl></section>
              <section><h3>Assessment</h3><dl><div><dt>Property</dt><dd>{selectedLead.property}</dd></div><div><dt>Scope</dt><dd>{selectedLead.scope}</dd></div><div><dt>Equipment</dt><dd>{selectedLead.equipment.join(", ")}</dd></div></dl></section>
            </div>

            <section className="detail-budget"><div><span>Customer-generated budget</span><strong>{selectedLead.budget}</strong></div><p>Preliminary tool result only. Personnel must validate assumptions before preparing a quotation.</p></section>

            <section className="detail-notes"><div><h3>Internal notes</h3><span>Visible to personnel only</span></div><textarea value={selectedLead.notes} onChange={(event) => updateLead({ notes: event.target.value })} rows={4} /><button type="button">Save note</button></section>
          </article>
        </section>
      </main>
    </div>
  );
}
