"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getLeads, type LeadSource, type LeadStatus } from "@/lib/api/leads";
import { leadSources, leadStatuses, sourceLabel, statusLabel, toDashboardLead, type DashboardLead } from "@/lib/dashboard-leads";

type StatusFilter = "all" | LeadStatus;
type SourceFilter = "all" | LeadSource;

function SearchIcon() {
  return <svg aria-hidden="true" viewBox="0 0 20 20"><circle cx="8.5" cy="8.5" r="5.5" /><path d="m13 13 4 4" /></svg>;
}

export default function PersonnelDashboard() {
  const [leads, setLeads] = useState<DashboardLead[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    getLeads({ limit: 100, signal: controller.signal })
      .then((records) => {
        setLeads(records.map(toDashboardLead));
        setLoadError("");
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setLoadError(error instanceof Error ? error.message : "We could not load the lead inbox.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [reloadKey]);

  const filteredLeads = useMemo(() => leads.filter((lead) => {
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    const matchesSource = sourceFilter === "all" || lead.source === sourceFilter;
    const search = query.trim().toLowerCase();
    const matchesSearch = !search || [lead.name, lead.referenceCode, lead.city, lead.phone].some((value) => value.toLowerCase().includes(search));
    return matchesStatus && matchesSource && matchesSearch;
  }), [leads, query, sourceFilter, statusFilter]);

  const selectedLead = leads.find((lead) => lead.id === selectedId) ?? filteredLeads[0] ?? leads[0];
  const retry = () => {
    setLoading(true);
    setLoadError("");
    setReloadKey((value) => value + 1);
  };

  return (
    <div className="dash-shell">
      <aside className="dash-sidebar">
        <Link className="dash-brand" href="/"><Image src="/bnm3-logo.png" alt="BNM3 Construction" width={259} height={188} /><span><strong>BNM3</strong><small>Personnel</small></span></Link>
        <nav aria-label="Dashboard navigation"><a className="active" href="#leads"><span>01</span> Leads</a><a href="#pipeline"><span>02</span> Pipeline</a><a href="#schedule"><span>03</span> Inspections</a><a href="#quotes"><span>04</span> Quotations</a></nav>
        <div className="dash-poc"><strong>Connected POC</strong><p>Lead and call-record data are loaded from Neon. Staff authentication follows in Milestone 7.</p></div>
        <Link className="dash-site-link" href="/">View public website →</Link>
      </aside>

      <main className="dash-main">
        <header className="dash-topbar"><div><span>Operations / Leads</span><h1>Lead dashboard</h1></div><div className="dash-user"><span>AD</span><div><strong>Admin Demo</strong><small>Operations</small></div></div></header>

        <section className="dash-metrics" aria-label="Lead summary">
          <article><span>New leads</span><strong>{leads.filter((lead) => lead.status === "new").length}</strong><small>Awaiting first contact</small></article>
          <article><span>Needs clarification</span><strong>{leads.filter((lead) => lead.status === "needs_clarification").length}</strong><small>Missing customer details</small></article>
          <article><span>Inspections</span><strong>{leads.filter((lead) => ["site_inspection_recommended", "inspection_scheduled"].includes(lead.status)).length}</strong><small>Recommended or scheduled</small></article>
          <article><span>Ready to quote</span><strong>{leads.filter((lead) => lead.status === "ready_for_quotation").length}</strong><small>Technical review complete</small></article>
        </section>

        <section className="dash-workspace" id="leads">
          <div className="lead-panel">
            <div className="lead-panel-heading"><div><span>Lead inbox</span><strong>{filteredLeads.length} records</strong></div><label className="lead-search"><SearchIcon /><input aria-label="Search leads" placeholder="Search name, reference, city..." value={query} onChange={(event) => setQuery(event.target.value)} /></label></div>
            <div className="lead-filter-groups">
              <div className="lead-filters" aria-label="Filter leads by status"><button className={statusFilter === "all" ? "active" : ""} type="button" onClick={() => setStatusFilter("all")}>All statuses</button>{leadStatuses.map((status) => <button className={statusFilter === status ? "active" : ""} type="button" key={status} onClick={() => setStatusFilter(status)}>{statusLabel(status)}</button>)}</div>
              <div className="lead-filters lead-source-filters" aria-label="Filter leads by source"><button className={sourceFilter === "all" ? "active" : ""} type="button" onClick={() => setSourceFilter("all")}>All sources</button>{leadSources.map((source) => <button className={sourceFilter === source ? "active" : ""} type="button" key={source} onClick={() => setSourceFilter(source)}>{sourceLabel(source)}</button>)}</div>
            </div>

            {loading && <div className="lead-load-state" role="status"><span className="lead-loader" aria-hidden="true" /><strong>Loading live leads</strong><p>Connecting to the BNM3 lead service…</p></div>}
            {!loading && loadError && <div className="lead-load-state lead-load-error" role="alert"><strong>Lead inbox unavailable</strong><p>{loadError}</p><button type="button" onClick={retry}>Try again</button></div>}
            {!loading && !loadError && <div className="lead-list">{filteredLeads.map((lead) => <button className={selectedLead?.id === lead.id ? "lead-row selected" : "lead-row"} type="button" key={lead.id} onClick={() => setSelectedId(lead.id)}><div className="lead-row-top"><span className={`status-dot status-${lead.status}`} /><strong>{lead.name}</strong><time title={lead.createdAtLabel}>{lead.received}</time></div><div className="lead-row-meta"><span>{lead.referenceCode}</span><span>{lead.city}</span></div><div className="lead-row-bottom"><span className="lead-service">{lead.sourceLabel}</span><span className={`priority priority-${lead.priority.toLowerCase()}`}>{lead.qualificationScore}/100</span></div></button>)}</div>}
            {!loading && !loadError && !filteredLeads.length && <div className="lead-load-state"><strong>{leads.length ? "No matching leads" : "No leads yet"}</strong><p>{leads.length ? "Adjust the search or filters to see more records." : "Assessment and estimator opt-ins will appear here automatically."}</p>{leads.length > 0 && <button type="button" onClick={() => { setQuery(""); setStatusFilter("all"); setSourceFilter("all"); }}>Clear filters</button>}</div>}
          </div>

          {!loading && !loadError && selectedLead ? <article className="lead-detail">
            <header className="detail-header"><div><span>{selectedLead.referenceCode}</span><h2>{selectedLead.name}</h2><p>{selectedLead.service} · {selectedLead.city}</p></div><span className={`detail-priority priority-${selectedLead.priority.toLowerCase()}`}>{selectedLead.priority} priority</span></header>
            <div className="detail-signal-row"><span>{selectedLead.sourceLabel}</span><span>{selectedLead.classificationLabel}</span><strong>{selectedLead.qualificationScore}/100 score</strong></div>

            <div className="detail-actions"><label>Status<select value={selectedLead.status} disabled>{leadStatuses.map((status) => <option value={status} key={status}>{statusLabel(status)}</option>)}</select></label><label>Assigned to<select value={selectedLead.assignee} disabled><option>Unassigned</option><option>Assigned personnel</option></select></label></div>
            <p className="detail-preview-note">Open the full record to make a reasoned, audit-tracked workflow change.</p>

            <section className="detail-next"><div><span>Next action</span><strong>{selectedLead.nextAction}</strong><small>{selectedLead.nextActionDate}</small></div><Link className="open-record-link" href={`/dashboard/leads/${selectedLead.id}`}>Open full record →</Link></section>

            <div className="detail-grid">
              <section><h3>Customer</h3><dl><div><dt>Mobile</dt><dd><a href={`tel:${selectedLead.phone.replaceAll(" ", "")}`}>{selectedLead.phone}</a></dd></div><div><dt>Location</dt><dd>{selectedLead.address}</dd></div><div><dt>Submitted</dt><dd>{selectedLead.createdAtLabel}</dd></div><div><dt>Lead source</dt><dd>{selectedLead.sourceLabel}</dd></div></dl></section>
              <section><h3>Assessment</h3><dl><div><dt>Classification</dt><dd>{selectedLead.classificationLabel} · {selectedLead.qualificationScore}/100</dd></div><div><dt>Property</dt><dd>{selectedLead.property}</dd></div><div><dt>Scope</dt><dd>{selectedLead.scope}</dd></div><div><dt>Equipment</dt><dd>{selectedLead.equipment.join(", ")}</dd></div></dl></section>
            </div>

            <section className="detail-budget"><div><span>Customer-generated budget</span><strong>{selectedLead.budget}</strong></div><p>Preliminary tool result only. Personnel must validate assumptions before preparing a quotation.</p></section>
            <section className="detail-notes"><div><h3>Qualification context</h3><span>{selectedLead.qualificationDecision ? "Personnel-reviewed" : "Generated from submitted answers"}</span></div><textarea value={selectedLead.qualificationReviewReason || selectedLead.notes || "No qualification notes."} readOnly rows={4} /><Link className="open-record-link" href={`/dashboard/leads/${selectedLead.id}`}>Review workflow →</Link></section>
          </article> : <div className="lead-detail-placeholder"><strong>{loading ? "Loading lead details…" : loadError ? "Details unavailable" : "Select a lead"}</strong><p>{loading ? "The newest live lead will be selected automatically." : "Choose a lead from the inbox to review its submission."}</p></div>}
        </section>
      </main>
    </div>
  );
}
