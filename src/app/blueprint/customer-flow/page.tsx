import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import "./flow.css";

export const metadata: Metadata = {
  title: "Customer & Lead Flow Blueprint | BNM3 Construction",
  description: "A visual explanation of how BNM3's website turns customer interest into structured project leads and reviewed quotations.",
};

type Status = "Live" | "POC" | "Next" | "Later";

function Step({ number, status, title, text }: { number: string; status: Status; title: string; text: string }) {
  return <article className="flow-step"><div className="flow-step-top"><span className="flow-number">{number}</span><span className={`flow-status ${status.toLowerCase()}`}>{status}</span></div><h3>{title}</h3><p>{text}</p></article>;
}

function Arrow({ label }: { label?: string }) {
  return <div className="flow-arrow" aria-hidden="true"><span>{label}</span><b>↓</b></div>;
}

export default function CustomerFlowPage() {
  return (
    <main className="flow-page">
      <header className="flow-header">
        <Link href="/" className="flow-brand" aria-label="BNM3 Construction home"><Image src="/bnm3-logo.png" alt="" width={259} height={188} /><span><strong>BNM3</strong><small>Digital Blueprint</small></span></Link>
        <nav aria-label="Blueprint navigation"><a href="#customer-flow">Customer flow</a><a href="#lead-flow">Lead flow</a><Link href="/assessment/residential-lpg">Try the funnel</Link></nav>
      </header>

      <section className="flow-hero">
        <div><span className="flow-eyebrow">Proof-of-concept map</span><h1>From website visitor<br />to qualified project lead.</h1><p>This page explains how BNM3&apos;s digital funnel collects the right project information, routes risk safely, and prepares the team for technical review and quotation.</p></div>
        <div className="flow-legend" aria-label="Implementation status legend"><span><i className="live" />Live now</span><span><i className="poc" />Working POC</span><span><i className="next" />Next phase</span><span><i className="later" />Later phase</span></div>
      </section>

      <section className="flow-section" id="customer-flow">
        <div className="flow-heading"><span>01 / Customer experience</span><h2>What the customer sees</h2><p>A clear path replaces scattered calls and messages while still preserving professional review.</p></div>
        <div className="flow-stack">
          <Step number="01" status="Live" title="Landing page" text="A customer discovers BNM3, sees focused services and project credibility, then chooses the work that matches the property." />
          <Arrow label="Select a service" />
          <Step number="02" status="Live" title="Service entry point" text="Residential LPG opens its own assessment. Other services remain visible but will receive separate funnels later." />
          <Arrow label="Start assessment" />
          <Step number="03" status="POC" title="Guided LPG funnel" text="Nine short stages collect property, appliances, cylinders, route, safety options, access, location, and contact details." />
          <div className="flow-decision">
            <div className="decision-title"><span>Decision gate</span><strong>Possible active gas leak?</strong></div>
            <div className="decision-paths"><div className="danger"><b>YES / NOT SURE</b><span>Stop quotation flow and display safety guidance.</span></div><div className="safe"><b>NO</b><span>Continue the planned-project assessment.</span></div></div>
          </div>
          <Arrow label="Apply project rules" />
          <div className="flow-outcomes">
            <article><span>A</span><h3>Standard assessment</h3><p>Simple residential scope with enough information for initial estimator review.</p></article>
            <article><span>B</span><h3>Technical review</h3><p>Some details need verification, but the customer can still complete the funnel.</p></article>
            <article><span>C</span><h3>Site visit required</h3><p>Complex routing, property, supply arrangement, damage, or uncertainty needs inspection.</p></article>
          </div>
          <Arrow label="Transform answers" />
          <Step number="04" status="POC" title="Personalized project brief" text="The customer sees an interpreted scope, classification, missing-information list, assumptions, and the recommended next step—not a fake instant quote." />
        </div>
      </section>

      <section className="flow-section flow-dark" id="lead-flow">
        <div className="flow-heading"><span>02 / BNM3 operations</span><h2>What happens behind the funnel</h2><p>The project brief becomes a structured lead that the team can review consistently.</p></div>
        <div className="lead-rail">
          <Step number="05" status="Next" title="Lead submission" text="With customer consent, the completed brief is stored securely and the assigned BNM3 reviewer is notified." />
          <Arrow />
          <Step number="06" status="Next" title="Completeness check" text="Staff confirm the service area, contact details, measurements, photos, and missing technical information." />
          <Arrow />
          <Step number="07" status="Next" title="Technical triage" text="An estimator accepts the scope, requests clarification, or schedules a site assessment." />
          <Arrow />
          <Step number="08" status="Later" title="Reviewed quotation" text="Validated quantities and BNM3's price book produce a formal scope, price, exclusions, and schedule." />
          <Arrow />
          <Step number="09" status="Later" title="Project & handover" text="Accepted work moves through planning, installation, testing, documentation, and future maintenance." />
        </div>
      </section>

      <section className="flow-section flow-data">
        <div className="flow-heading"><span>03 / Information flow</span><h2>One answer set, multiple uses</h2></div>
        <div className="data-map"><div className="data-source"><strong>Customer answers</strong><span>Captured once</span></div><div className="data-lines" aria-hidden="true">→</div><div className="data-uses"><span>Estimator brief</span><span>Site-visit checklist</span><span>Quotation starting point</span><span>Future project record</span></div></div>
        <div className="flow-principle"><strong>The important distinction</strong><p>The funnel improves information collection and lead qualification. It does not replace the qualified person who verifies the system and approves the quotation.</p></div>
      </section>

      <section className="flow-cta"><span>See the proof of concept</span><h2>Try the exact customer journey.</h2><p>The current demonstration stores answers only in this browser and does not send customer data externally.</p><Link href="/assessment/residential-lpg">Open Residential LPG assessment <b aria-hidden="true">→</b></Link></section>

      <footer className="flow-footer"><span>BNM3 Construction Digital Blueprint</span><Link href="/">Return to landing page</Link></footer>
    </main>
  );
}
