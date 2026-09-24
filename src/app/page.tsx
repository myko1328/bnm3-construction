import Image from "next/image";

const services = [
  {
    number: "01",
    audience: "Residential",
    title: "LPG Installation & Gas Safety",
    description:
      "Purpose-built LPG piping, leak detection, automatic shutoff, testing, and inspection for safer homes.",
    items: ["LPG piping installation", "Gas-leak detection", "Automatic shutoff"],
    href: "#assessment",
  },
  {
    number: "02",
    audience: "Commercial",
    title: "Kitchen LPG & Fire Suppression",
    description:
      "Coordinated gas and fire-safety systems for restaurants, mall tenants, and professional kitchens.",
    items: ["Commercial LPG systems", "Kitchen hood suppression", "Testing & commissioning"],
    href: "#assessment",
  },
  {
    number: "03",
    audience: "Industrial",
    title: "Lighting & Electrical Wiring",
    description:
      "Reliable lighting installation, LED retrofits, and associated branch wiring for demanding facilities.",
    items: ["New industrial lighting", "LED retrofit projects", "Electrical branch wiring"],
    href: "#assessment",
  },
];

const process = [
  ["01", "Tell us about the site", "Choose a service and share the details you already know."],
  ["02", "Technical review", "We check the scope, assumptions, access, and safety requirements."],
  ["03", "Site assessment", "Our team verifies actual conditions before final pricing."],
  ["04", "Proposal & delivery", "Receive a defined scope, formal quotation, and project plan."],
];

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" width="20" height="20">
      <path d="M4 10h11M11 5l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" width="20" height="20">
      <path d="m4 10 4 4 8-9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BlueprintMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 64 64" className="blueprint-mark">
      <path d="M8 52V14h20v12h28v26H8Z" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M18 52V39h13v13M17 22h5M17 30h5M36 34h6M48 34h2M36 42h6M48 42h2" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function ConstructionSystemsDiagram() {
  return (
    <svg className="construction-diagram" viewBox="0 0 560 300" aria-hidden="true">
      <defs>
        <pattern id="blueprint-grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0H0V20" fill="none" stroke="currentColor" strokeOpacity=".1" />
        </pattern>
      </defs>

      <rect width="560" height="300" fill="url(#blueprint-grid)" />
      <g className="diagram-structure" fill="none" stroke="currentColor" strokeWidth="4" strokeLinejoin="round">
        <path d="M78 238h404M112 238V112l84-52 84 52v126M280 238V96h164v142" />
        <path d="M135 238v-67h52v67M214 132h39v38h-39zM313 135h42v37h-42zM380 135h42v37h-42z" />
        <path d="M305 96V73h114v23M328 73V55h68v18" strokeDasharray="8 7" />
      </g>
      <g className="diagram-accent" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round">
        <path d="M99 255h382" />
        <path d="M196 60 280 112" />
      </g>
      <g className="diagram-badge">
        <circle cx="280" cy="197" r="31" />
        <path d="m284 166-22 36h17l-4 27 23-38h-17Z" />
      </g>
    </svg>
  );
}

export default function Home() {
  return (
    <div className="site-shell">
      <a className="skip-link" href="#main-content">Skip to main content</a>

      <header className="site-header">
        <div className="container nav-wrap">
          <a className="brand" href="#top" aria-label="BNM3 Construction home">
            <Image src="/bnm3-logo.png" alt="BNM3 Construction logo" width={259} height={188} priority />
            <span className="brand-copy"><strong>BNM3</strong><span>Construction</span></span>
          </a>
          <nav className="desktop-nav" aria-label="Main navigation">
            <a href="#services">Services</a><a href="#process">Process</a><a href="#projects">Projects</a><a href="#about">About</a>
          </nav>
          <a className="button button-small button-primary" href="#assessment">Request assessment <ArrowIcon /></a>
        </div>
      </header>

      <main id="main-content">
        <section className="hero" id="top">
          <div className="hero-grid" aria-hidden="true" />
          <div className="container hero-layout">
            <div className="hero-copy">
              <div className="eyebrow"><span /> Built for safety. Wired for performance.</div>
              <h1>Technical systems.<br /><em>Professionally delivered.</em></h1>
              <p className="hero-lead">LPG, fire-safety, and industrial electrical systems for homes, commercial kitchens, and industrial facilities.</p>
              <div className="hero-actions">
                <a className="button button-primary" href="#assessment">Start a project assessment <ArrowIcon /></a>
                <a className="text-link" href="#services">Explore our services <span>↓</span></a>
              </div>
              <div className="hero-proof" aria-label="Service strengths">
                <span><CheckIcon /> Structured assessment</span><span><CheckIcon /> Technical review</span><span><CheckIcon /> Documented handover</span>
              </div>
            </div>

            <div className="hero-visual" aria-label="BNM3 construction service overview">
              <div className="visual-frame">
                <div className="visual-topline"><span>BNM3 / SYSTEMS</span></div>
                <div className="visual-center"><ConstructionSystemsDiagram /></div>
                <div className="visual-system-list">
                  <div><span>01</span><strong>LPG & gas safety</strong></div>
                  <div><span>02</span><strong>Fire suppression</strong></div>
                  <div><span>03</span><strong>Industrial electrical</strong></div>
                </div>
              </div>
              <div className="safety-stripe" aria-hidden="true" />
            </div>
          </div>
        </section>

        <section className="trust-band" aria-label="Properties served">
          <div className="container trust-inner">
            <span className="trust-label">Systems for</span>
            <div><strong>Homes</strong><span>Residential safety</span></div>
            <div><strong>Restaurants</strong><span>Commercial kitchens</span></div>
            <div><strong>Facilities</strong><span>Industrial operations</span></div>
          </div>
        </section>

        <section className="section services-section" id="services">
          <div className="container">
            <div className="section-heading">
              <div><div className="eyebrow"><span /> Focused expertise</div><h2>Three systems.<br />One accountable team.</h2></div>
              <p>Start with the environment that matches your project. We’ll guide you through the right questions and next steps.</p>
            </div>
            <div className="service-grid">
              {services.map((service) => (
                <article className="service-card" key={service.number}>
                  <div className="card-index"><span>{service.number}</span><span>{service.audience}</span></div>
                  <div className="service-icon" aria-hidden="true"><BlueprintMark /></div>
                  <h3>{service.title}</h3><p>{service.description}</p>
                  <ul>{service.items.map((item) => <li key={item}><CheckIcon /> {item}</li>)}</ul>
                  <a href={service.href}>Assess this project <ArrowIcon /></a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section process-section" id="process">
          <div className="container process-layout">
            <div className="process-intro">
              <div className="eyebrow eyebrow-light"><span /> Clear from day one</div>
              <h2>A better way to begin construction work.</h2>
              <p>No vague “send us a message” process. Start with a structured assessment so our team can understand your project before the first call.</p>
              <a className="button button-light" href="#assessment">See assessment options <ArrowIcon /></a>
            </div>
            <ol className="process-list">
              {process.map(([number, title, description]) => (
                <li key={number}><span className="process-number">{number}</span><div><h3>{title}</h3><p>{description}</p></div></li>
              ))}
            </ol>
          </div>
        </section>

        <section className="section evidence-section" id="projects">
          <div className="container evidence-layout">
            <div className="evidence-board" aria-hidden="true">
              <div className="board-label">PROJECT STANDARD / BNM3</div>
              <div className="board-drawing"><BlueprintMark /></div>
              <div className="board-notes"><span>01 Scope defined</span><span>02 Site verified</span><span>03 System tested</span></div>
            </div>
            <div className="evidence-copy">
              <div className="eyebrow"><span /> Proof over promises</div>
              <h2>Every project should leave a clear record.</h2>
              <p>Our project experience becomes useful evidence: defined scope, installation details, testing, and documented handover—not just a gallery of finished photos.</p>
              <div className="evidence-points">
                <div><strong>Before</strong><span>Requirements, site conditions, and assumptions</span></div>
                <div><strong>During</strong><span>Progress visibility and coordinated execution</span></div>
                <div><strong>After</strong><span>Testing records and service-ready documentation</span></div>
              </div>
            </div>
          </div>
        </section>

        <section className="section about-section" id="about">
          <div className="container about-layout">
            <div><div className="eyebrow"><span /> Construction, made clearer</div><h2>Field experience supported by better systems.</h2></div>
            <div className="about-copy">
              <p>BNM3 combines practical installation experience with a more structured digital process—from the first inquiry through assessment, proposal, execution, and handover.</p>
              <p>The result is a project experience designed around clarity, technical accountability, and responsive service.</p>
            </div>
          </div>
        </section>

        <section className="assessment-section" id="assessment">
          <div className="container assessment-card">
            <div className="assessment-copy">
              <div className="eyebrow eyebrow-light"><span /> Start with the right scope</div>
              <h2>What are you planning?</h2>
              <p>Choose a project type. The next step will collect only the information relevant to your installation.</p>
            </div>
            <div className="assessment-options">
              {services.map((service) => (
                <a href="#top" key={service.number} aria-label={`Start ${service.title} assessment`}>
                  <span>{service.audience}</span><strong>{service.title}</strong><ArrowIcon />
                </a>
              ))}
            </div>
            <p className="assessment-note">Formal quotations remain subject to technical review and, where required, a site assessment.</p>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-main">
          <div className="brand footer-brand">
            <Image src="/bnm3-logo.png" alt="" width={259} height={188} />
            <span className="brand-copy"><strong>BNM3</strong><span>Construction</span></span>
          </div>
          <p>LPG, fire-safety, and industrial electrical systems.</p>
          <nav aria-label="Footer navigation"><a href="#services">Services</a><a href="#process">Process</a><a href="#projects">Projects</a><a href="#about">About</a></nav>
        </div>
        <div className="container footer-bottom"><span>© 2026 BNM3 Construction</span><span>Built for safer, better-documented projects.</span></div>
      </footer>
    </div>
  );
}
