"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { addManagerQuestion, finalizeCallRecord, getCallRecord, getLeadById, saveCallRecord } from "@/lib/api/leads";
import { buildChecklist, toDashboardLead, type DashboardLead } from "@/lib/dashboard-leads";

type CallRecord = {
  checks: Record<string, boolean>;
  comments: Record<string, string>;
  callSummary: string;
  managerQuestion: string;
  finalized: boolean;
  finalizedAt?: string;
  updatedAt?: string;
};

const EMPTY_RECORD: CallRecord = { checks: {}, comments: {}, callSummary: "", managerQuestion: "", finalized: false };
const ACTOR_NAME = "Admin Demo";

function AccordionChevron() {
  return <svg className="accordion-chevron" aria-hidden="true" viewBox="0 0 16 16"><path d="m3.5 6 4.5 4 4.5-4" /></svg>;
}

function formatTimestamp(value?: string) {
  return value ? new Date(value).toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Manila" }) : undefined;
}

export default function LeadRecord({ leadId }: { leadId: string }) {
  const [lead, setLead] = useState<DashboardLead | null>(null);
  const [record, setRecord] = useState<CallRecord>(EMPTY_RECORD);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "finalizing" | "question">("idle");
  const [reloadKey, setReloadKey] = useState(0);
  const storageKey = `bnm3-call-record-${leadId}`;
  const checklist = useMemo(() => lead ? buildChecklist(lead) : { captured: [], verify: [], next: [] }, [lead]);
  const requiredItems = [...checklist.verify, ...checklist.next];
  const completedItems = requiredItems.filter((item) => record.checks[item.id]).length;

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([getLeadById(leadId, controller.signal), getCallRecord(leadId, controller.signal)])
      .then(([storedLead, storedRecord]) => {
        setLead(toDashboardLead(storedLead));
        if (storedRecord) {
          setRecord({ checks: storedRecord.checks, comments: storedRecord.comments, callSummary: storedRecord.callSummary, managerQuestion: "", finalized: Boolean(storedRecord.finalizedAt), finalizedAt: formatTimestamp(storedRecord.finalizedAt ?? undefined), updatedAt: formatTimestamp(storedRecord.updatedAt) });
          window.localStorage.removeItem(storageKey);
        } else {
          const browserBackup = window.localStorage.getItem(storageKey);
          if (browserBackup) {
            try { setRecord({ ...EMPTY_RECORD, ...JSON.parse(browserBackup), finalized: false, finalizedAt: undefined }); } catch { /* Ignore invalid browser backup. */ }
          }
        }
        setLoadError("");
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setLoadError(error instanceof Error ? error.message : "We could not load this lead record.");
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [leadId, reloadKey, storageKey]);

  const refreshLeadActivity = async () => setLead(toDashboardLead(await getLeadById(leadId)));
  const updateRecord = (changes: Partial<CallRecord>) => {
    if (record.finalized) return;
    setRecord((current) => ({ ...current, ...changes }));
    setSaveState("idle");
    setActionError("");
  };

  const persistDraft = async () => {
    if (record.finalized || saveState !== "idle") return;
    setSaveState("saving");
    setActionError("");
    try {
      const saved = await saveCallRecord(leadId, { checks: record.checks, comments: record.comments, callSummary: record.callSummary, actorName: ACTOR_NAME });
      setRecord((current) => ({ ...current, updatedAt: formatTimestamp(saved.updatedAt) }));
      window.localStorage.removeItem(storageKey);
      await refreshLeadActivity();
      setSaveState("saved");
    } catch (error) {
      window.localStorage.setItem(storageKey, JSON.stringify(record));
      setActionError(`${error instanceof Error ? error.message : "We could not save the call record."} A browser backup was kept.`);
      setSaveState("idle");
    }
  };

  const submitManagerQuestion = async () => {
    const question = record.managerQuestion.trim();
    if (!question || saveState !== "idle") return;
    setSaveState("question");
    setActionError("");
    try {
      await addManagerQuestion(leadId, question, "Manager Demo");
      setRecord((current) => ({ ...current, managerQuestion: "" }));
      await refreshLeadActivity();
      setSaveState("saved");
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "We could not save the manager question.");
      setSaveState("idle");
    }
  };

  const submitFinalRecord = async () => {
    const incompleteItems = requiredItems.filter((item) => !record.checks[item.id]);
    const missingResponses = checklist.verify.filter((item) => !record.comments[item.id]?.trim());
    if (incompleteItems.length || missingResponses.length || !record.callSummary.trim()) {
      const missing: string[] = [];
      if (incompleteItems.length) missing.push(`${incompleteItems.length} unchecked call item${incompleteItems.length === 1 ? "" : "s"}`);
      if (missingResponses.length) missing.push(`${missingResponses.length} missing customer response${missingResponses.length === 1 ? "" : "s"}`);
      if (!record.callSummary.trim()) missing.push("the call summary");
      setActionError(`Complete ${missing.join(", ")} before finalizing.`);
      return;
    }
    setSaveState("finalizing");
    setActionError("");
    try {
      const finalized = await finalizeCallRecord(leadId, { checks: record.checks, comments: record.comments, callSummary: record.callSummary, actorName: ACTOR_NAME, requiredCheckIds: requiredItems.map((item) => item.id), requiredCommentIds: checklist.verify.map((item) => item.id) });
      setRecord((current) => ({ ...current, finalized: true, finalizedAt: formatTimestamp(finalized.finalizedAt ?? undefined), updatedAt: formatTimestamp(finalized.updatedAt) }));
      window.localStorage.removeItem(storageKey);
      await refreshLeadActivity();
      setSaveState("saved");
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "We could not finalize the call record.");
      setSaveState("idle");
    }
  };

  const exportPdf = () => {
    const previousTitle = document.title;
    const safeName = lead?.name.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "Customer";
    document.title = `BNM3_${lead?.referenceCode || leadId}_${safeName}_${record.finalized ? "Final" : "Draft"}_Call-Record`;
    window.print();
    window.setTimeout(() => { document.title = previousTitle; }, 500);
  };

  if (loading) return <main className="record-missing" role="status"><span className="lead-loader" aria-hidden="true" /><h1>Loading lead record</h1><p>Retrieving the submission and call record from Neon…</p></main>;
  if (loadError || !lead) return <main className="record-missing" role="alert"><h1>Lead unavailable</h1><p>{loadError || "The requested lead could not be found."}</p><button type="button" onClick={() => { setLoading(true); setLoadError(""); setReloadKey((value) => value + 1); }}>Try again</button><Link href="/dashboard">Return to dashboard</Link></main>;

  const disabled = record.finalized || saveState !== "idle" && saveState !== "saved";
  const renderActionItems = (items: typeof checklist.verify, group: "verify" | "next") => <ul className="record-check-list">{items.map((item) => <li key={item.id} className={record.checks[item.id] ? "completed" : ""}><div className="record-check-row"><label><input disabled={record.finalized} type="checkbox" checked={Boolean(record.checks[item.id])} onChange={() => updateRecord({ checks: { ...record.checks, [item.id]: !record.checks[item.id] } })} /><span>{item.label}</span></label><span className="record-state">{record.checks[item.id] ? "Verified" : "Pending"}</span></div><label className="record-comment"><span>{group === "verify" ? "Customer response / personnel note" : "Outcome / supporting note"}</span><textarea disabled={record.finalized} rows={2} placeholder="Record exactly what was confirmed, explained, or requested..." value={record.comments[item.id] || ""} onChange={(event) => updateRecord({ comments: { ...record.comments, [item.id]: event.target.value } })} /><span className="print-value">{record.comments[item.id]?.trim() || "No response recorded."}</span></label></li>)}</ul>;

  return <div className="record-shell">
    <header className="record-topbar"><Link className="dash-brand record-brand" href="/dashboard"><Image src="/bnm3-logo.png" alt="BNM3 Construction" width={259} height={188} /><span><strong>BNM3</strong><small>Lead record</small></span></Link><div><Link href="/dashboard">← Lead dashboard</Link><span>Neon-backed call record</span></div></header>
    <main className="record-main">
      <section className="print-document-header"><Image src="/bnm3-logo.png" alt="BNM3 Construction" width={259} height={188} /><div><strong>BNM3 Construction</strong><span>Customer call record</span></div><dl><div><dt>Lead ID</dt><dd>{lead.referenceCode}</dd></div><div><dt>Record</dt><dd>{record.finalized ? "Finalized" : "Draft"}</dd></div><div><dt>Prepared</dt><dd>{record.finalizedAt || record.updatedAt || new Date().toLocaleDateString("en-PH", { dateStyle: "medium" })}</dd></div></dl></section>
      <section className="record-hero"><div><span>{lead.referenceCode} · {lead.service}</span><h1>{lead.name}</h1><p>{lead.phone} · {lead.address}</p></div><div className="record-completion"><strong>{completedItems}/{requiredItems.length}</strong><span>call items completed</span><progress value={completedItems} max={requiredItems.length}>{completedItems} of {requiredItems.length}</progress></div></section>
      <section className="record-toolbar" aria-label="Call record actions"><div><span className={`record-status ${record.finalized ? "is-final" : ""}`}>{record.finalized ? "Finalized" : "Draft"}</span><p>{record.finalized ? `Locked after finalization ${record.finalizedAt}` : record.updatedAt ? `Last saved to Neon ${record.updatedAt}` : "Not yet saved to Neon."}</p></div><div><button className="export-record" type="button" onClick={exportPdf}>Export {record.finalized ? "final" : "draft"} PDF</button><button className="finalize-record" type="button" onClick={submitFinalRecord} disabled={disabled}>{record.finalized ? "Record finalized" : saveState === "finalizing" ? "Finalizing…" : "Finalize call record"}</button></div></section>
      {actionError && <p className="record-validation" role="alert">{actionError}</p>}
      <div className="record-layout"><div className="record-content">
        <section className="record-card captured-record"><header><div><span>01</span><h2>Customer submission</h2></div><small>Customer-provided · unverified</small></header><ul>{checklist.captured.map((item) => <li key={item.id}><span aria-hidden="true">✓</span><div><strong>{item.label}</strong><small>{item.detail}</small></div></li>)}</ul></section>
        <details className="record-card record-accordion" open><summary><div><span>02</span><h2>Verify during the call</h2></div><div className="accordion-meta"><small>Personnel confirmation</small><AccordionChevron /></div></summary><div className="accordion-content"><p className="record-guidance">Check an item only after the customer confirms it. Record the answer so management can review the conversation without reconstructing it.</p>{renderActionItems(checklist.verify, "verify")}</div></details>
        <details className="record-card record-accordion"><summary><div><span>03</span><h2>Arrange the next action</h2></div><div className="accordion-meta"><small>Call outcome</small><AccordionChevron /></div></summary><div className="accordion-content">{renderActionItems(checklist.next, "next")}</div></details>
        <details className="record-card record-accordion call-summary"><summary><div><span>04</span><h2>Call summary</h2></div><div className="accordion-meta"><small>Required handoff context</small><AccordionChevron /></div></summary><div className="accordion-content"><label><span>Overall summary and unresolved questions</span><textarea disabled={record.finalized} rows={5} placeholder="Summarize the call, customer concerns, commitments made, and anything the next person must know..." value={record.callSummary} onChange={(event) => updateRecord({ callSummary: event.target.value })} /><span className="print-value">{record.callSummary.trim() || "No call summary recorded."}</span></label><div className="record-save-row"><button type="button" onClick={persistDraft} disabled={disabled}>{saveState === "saving" ? "Saving to Neon…" : "Save call record"}</button>{saveState === "saved" && <span role="status">Saved to Neon</span>}</div></div></details>
      </div><aside className="record-sidebar">
        <section><h2>Lead context</h2><dl><div><dt>Status</dt><dd>{lead.statusLabel}</dd></div><div><dt>Assigned to</dt><dd>{lead.assignee}</dd></div><div><dt>Priority</dt><dd>{lead.priority}</dd></div><div><dt>Source</dt><dd>{lead.sourceLabel}</dd></div><div><dt>Classification</dt><dd>{lead.classificationLabel} · {lead.qualificationScore}/100</dd></div><div><dt>Submitted</dt><dd>{lead.createdAtLabel}</dd></div><div><dt>Scope</dt><dd>{lead.scope}</dd></div><div><dt>Equipment</dt><dd>{lead.equipment.join(", ")}</dd></div><div><dt>Preliminary budget</dt><dd>{lead.budget}</dd></div></dl></section>
        <section className="manager-followup"><h2>Manager follow-up</h2><p>Add a question after reviewing the personnel record.</p><textarea rows={3} placeholder="Ask a follow-up question..." value={record.managerQuestion} onChange={(event) => updateRecord({ managerQuestion: event.target.value })} /><button type="button" disabled={!record.managerQuestion.trim() || saveState === "question"} onClick={submitManagerQuestion}>{saveState === "question" ? "Adding…" : "Add question"}</button></section>
        <section className="record-activity"><h2>Record activity</h2><ol>{lead.activities.length ? lead.activities.map((activity) => <li key={activity.id}><span>{activity.author}</span><p>{activity.message}</p><time>{activity.time}</time></li>) : <li className="empty-activity"><p>No saved activity yet.</p></li>}</ol></section>
      </aside></div>
    </main>
  </div>;
}
