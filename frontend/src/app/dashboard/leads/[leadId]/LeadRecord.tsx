"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { buildChecklist, initialLeads } from "../../PersonnelDashboard";

type Activity = { id: string; author: string; message: string; time: string };
type CallRecord = {
  checks: Record<string, boolean>;
  comments: Record<string, string>;
  callSummary: string;
  managerQuestion: string;
  activities: Activity[];
  finalized: boolean;
  finalizedAt?: string;
};

function AccordionChevron() {
  return <svg className="accordion-chevron" aria-hidden="true" viewBox="0 0 16 16"><path d="m3.5 6 4.5 4 4.5-4" /></svg>;
}

const EMPTY_RECORD: CallRecord = { checks: {}, comments: {}, callSummary: "", managerQuestion: "", activities: [], finalized: false };

export default function LeadRecord({ leadId }: { leadId: string }) {
  const lead = initialLeads.find((item) => item.id === leadId);
  const storageKey = `bnm3-call-record-${leadId}`;
  const [record, setRecord] = useState<CallRecord>(EMPTY_RECORD);
  const [ready, setReady] = useState(false);
  const [saved, setSaved] = useState(false);
  const [validationError, setValidationError] = useState("");
  const checklist = useMemo(() => lead ? buildChecklist(lead) : { captured: [], verify: [], next: [] }, [lead]);
  const totalItems = checklist.verify.length + checklist.next.length;
  const completedItems = [...checklist.verify, ...checklist.next].filter((item) => record.checks[item.id]).length;

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const savedRecord = window.localStorage.getItem(storageKey);
      if (savedRecord) {
        try { setRecord({ ...EMPTY_RECORD, ...JSON.parse(savedRecord) }); } catch { /* Ignore invalid POC data. */ }
      }
      setReady(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [storageKey]);

  const updateRecord = (changes: Partial<CallRecord>) => {
    setRecord((current) => ({ ...current, ...changes, finalized: false, finalizedAt: undefined }));
    setSaved(false);
    setValidationError("");
  };

  const saveRecord = () => {
    const now = new Date();
    const activity: Activity = { id: String(now.getTime()), author: "Admin Demo", message: "Updated the customer call record.", time: now.toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" }) };
    const nextRecord = { ...record, activities: [activity, ...record.activities] };
    setRecord(nextRecord);
    window.localStorage.setItem(storageKey, JSON.stringify(nextRecord));
    setSaved(true);
  };

  const addManagerQuestion = () => {
    const question = record.managerQuestion.trim();
    if (!question) return;
    const now = new Date();
    const activity: Activity = { id: String(now.getTime()), author: "Manager Demo", message: `Follow-up question: ${question}`, time: now.toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" }) };
    const nextRecord = { ...record, managerQuestion: "", activities: [activity, ...record.activities] };
    setRecord(nextRecord);
    window.localStorage.setItem(storageKey, JSON.stringify(nextRecord));
  };

  const finalizeRecord = () => {
    const incompleteItems = [...checklist.verify, ...checklist.next].filter((item) => !record.checks[item.id]);
    const missingResponses = checklist.verify.filter((item) => !record.comments[item.id]?.trim());
    if (incompleteItems.length || missingResponses.length || !record.callSummary.trim()) {
      const missing: string[] = [];
      if (incompleteItems.length) missing.push(`${incompleteItems.length} unchecked call item${incompleteItems.length === 1 ? "" : "s"}`);
      if (missingResponses.length) missing.push(`${missingResponses.length} missing customer response${missingResponses.length === 1 ? "" : "s"}`);
      if (!record.callSummary.trim()) missing.push("the call summary");
      setValidationError(`Complete ${missing.join(", ")} before finalizing.`);
      return;
    }

    const now = new Date();
    const finalizedAt = now.toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" });
    const activity: Activity = { id: String(now.getTime()), author: "Admin Demo", message: "Finalized the customer call record.", time: finalizedAt };
    const nextRecord = { ...record, finalized: true, finalizedAt, activities: [activity, ...record.activities] };
    setRecord(nextRecord);
    window.localStorage.setItem(storageKey, JSON.stringify(nextRecord));
    setSaved(true);
    setValidationError("");
  };

  const exportPdf = () => {
    const previousTitle = document.title;
    const safeName = lead?.name.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "Customer";
    document.title = `BNM3_${leadId}_${safeName}_${record.finalized ? "Final" : "Draft"}_Call-Record`;
    window.print();
    window.setTimeout(() => { document.title = previousTitle; }, 500);
  };

  if (!lead) return <main className="record-missing"><h1>Lead not found</h1><Link href="/dashboard">Return to dashboard</Link></main>;
  if (!ready) return null;

  const renderActionItems = (items: typeof checklist.verify, group: "verify" | "next") => <ul className="record-check-list">{items.map((item) => <li key={item.id} className={record.checks[item.id] ? "completed" : ""}><div className="record-check-row"><label><input type="checkbox" checked={Boolean(record.checks[item.id])} onChange={() => updateRecord({ checks: { ...record.checks, [item.id]: !record.checks[item.id] } })} /><span>{item.label}</span></label><span className="record-state">{record.checks[item.id] ? "Verified" : "Pending"}</span></div><label className="record-comment"><span>{group === "verify" ? "Customer response / personnel note" : "Outcome / supporting note"}</span><textarea rows={2} placeholder="Record exactly what was confirmed, explained, or requested..." value={record.comments[item.id] || ""} onChange={(event) => updateRecord({ comments: { ...record.comments, [item.id]: event.target.value } })} /><span className="print-value">{record.comments[item.id]?.trim() || "No response recorded."}</span></label></li>)}</ul>;

  return (
    <div className="record-shell">
      <header className="record-topbar"><Link className="dash-brand record-brand" href="/dashboard"><Image src="/bnm3-logo.png" alt="BNM3 Construction" width={259} height={188} /><span><strong>BNM3</strong><small>Lead record</small></span></Link><div><Link href="/dashboard">← Lead dashboard</Link><span>Frontend POC</span></div></header>

      <main className="record-main">
        <section className="print-document-header"><Image src="/bnm3-logo.png" alt="BNM3 Construction" width={259} height={188} /><div><strong>BNM3 Construction</strong><span>Customer call record</span></div><dl><div><dt>Lead ID</dt><dd>{lead.id}</dd></div><div><dt>Record</dt><dd>{record.finalized ? "Finalized" : "Draft"}</dd></div><div><dt>Prepared</dt><dd>{record.finalizedAt || new Date().toLocaleDateString("en-PH", { dateStyle: "medium" })}</dd></div></dl></section>
        <section className="record-hero"><div><span>{lead.id} · {lead.service}</span><h1>{lead.name}</h1><p>{lead.phone} · {lead.address}</p></div><div className="record-completion"><strong>{completedItems}/{totalItems}</strong><span>call items completed</span><progress value={completedItems} max={totalItems}>{completedItems} of {totalItems}</progress></div></section>

        <section className="record-toolbar" aria-label="Call record actions"><div><span className={`record-status ${record.finalized ? "is-final" : ""}`}>{record.finalized ? "Finalized" : "Draft"}</span><p>{record.finalized ? `Finalized ${record.finalizedAt}` : "Edits remain a draft until the record is finalized."}</p></div><div><button className="export-record" type="button" onClick={exportPdf}>Export {record.finalized ? "final" : "draft"} PDF</button><button className="finalize-record" type="button" onClick={finalizeRecord} disabled={record.finalized}>{record.finalized ? "Record finalized" : "Finalize call record"}</button></div></section>
        {validationError && <p className="record-validation" role="alert">{validationError}</p>}

        <div className="record-layout">
          <div className="record-content">
            <section className="record-card captured-record"><header><div><span>01</span><h2>Customer submission</h2></div><small>Customer-provided · unverified</small></header><ul>{checklist.captured.map((item) => <li key={item.id}><span aria-hidden="true">✓</span><div><strong>{item.label}</strong><small>{item.detail}</small></div></li>)}</ul></section>

            <details className="record-card record-accordion" open><summary><div><span>02</span><h2>Verify during the call</h2></div><div className="accordion-meta"><small>Personnel confirmation</small><AccordionChevron /></div></summary><div className="accordion-content"><p className="record-guidance">Check an item only after the customer confirms it. Record the customer&apos;s answer or relevant context so management can review the conversation without asking personnel to reconstruct it.</p>{renderActionItems(checklist.verify, "verify")}</div></details>

            <details className="record-card record-accordion"><summary><div><span>03</span><h2>Arrange the next action</h2></div><div className="accordion-meta"><small>Call outcome</small><AccordionChevron /></div></summary><div className="accordion-content">{renderActionItems(checklist.next, "next")}</div></details>

            <details className="record-card record-accordion call-summary"><summary><div><span>04</span><h2>Call summary</h2></div><div className="accordion-meta"><small>Required handoff context</small><AccordionChevron /></div></summary><div className="accordion-content"><label><span>Overall summary and unresolved questions</span><textarea rows={5} placeholder="Summarize the call, customer concerns, commitments made, and anything the next person must know..." value={record.callSummary} onChange={(event) => updateRecord({ callSummary: event.target.value })} /><span className="print-value">{record.callSummary.trim() || "No call summary recorded."}</span></label><div className="record-save-row"><button type="button" onClick={saveRecord}>Save call record</button>{saved && <span role="status">Saved in this browser</span>}</div></div></details>
          </div>

          <aside className="record-sidebar">
            <section><h2>Lead context</h2><dl><div><dt>Status</dt><dd>{lead.status}</dd></div><div><dt>Assigned to</dt><dd>{lead.assignee}</dd></div><div><dt>Priority</dt><dd>{lead.priority}</dd></div><div><dt>Source</dt><dd>{lead.source}</dd></div><div><dt>Scope</dt><dd>{lead.scope}</dd></div><div><dt>Equipment</dt><dd>{lead.equipment.join(", ")}</dd></div><div><dt>Preliminary budget</dt><dd>{lead.budget}</dd></div></dl></section>

            <section className="manager-followup"><h2>Manager follow-up</h2><p>Add a question after reviewing the personnel record.</p><textarea rows={3} placeholder="Ask a follow-up question..." value={record.managerQuestion} onChange={(event) => updateRecord({ managerQuestion: event.target.value })} /><button type="button" onClick={addManagerQuestion}>Add question</button></section>

            <section className="record-activity"><h2>Record activity</h2><ol>{record.activities.length ? record.activities.map((activity) => <li key={activity.id}><span>{activity.author}</span><p>{activity.message}</p><time>{activity.time}</time></li>) : <li className="empty-activity"><p>No saved activity yet.</p></li>}</ol></section>
          </aside>
        </div>
      </main>
    </div>
  );
}
