import { Header } from "@/components/Header";
import { TemplatePreview } from "@/components/TemplatePreview";
import { HeroCta } from "@/components/HeroCta";
import { AuthCta } from "@/components/AuthCta";
import { Reveal } from "@/components/Reveal";
import { TemplateShowcase } from "@/components/TemplateShowcase";
import { Brand } from "@/components/Brand";
import { PricingSection } from "@/components/PricingSection";

const FEATURES = [
  { title: "One universal data model", body: "Enter your profile, projects, experience and more once. It's stored as your data — never trapped inside a theme.", icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><ellipse cx="12" cy="5" rx="8" ry="3" /><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" /></svg>) },
  { title: "Swap templates freely", body: "Change your whole look in one click. The template only presents your data — switching never edits or deletes a thing.", icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 7h13l-3-3M21 17H8l3 3" /></svg>) },
  { title: "Your own address", body: "Claim a clean, memorable link that's yours — and change it whenever you like.", icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" /></svg>) },
  { title: "Publish on your terms", body: "Draft privately, publish when ready, unpublish any time. You're always in control of what's public.", icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 3v12M8 7l4-4 4 4" /><path d="M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" /></svg>) },
  { title: "Media that just works", body: "Images and galleries served fast and responsive, so your work looks sharp on every screen.", icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="2" /><path d="M3 17l5-4 4 3 3-2 6 5" /></svg>) },
  { title: "Yours, and secure", body: "Row-level security and strict ownership checks mean only you can touch your data. Export-friendly, no lock-in.", icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 3l7 3v6c0 5-3 7-7 9-4-2-7-4-7-9V6z" /><path d="M9 12l2 2 4-4" /></svg>) },
];

const STATS = [
  { n: "5+", l: "beautiful templates" },
  { n: "1-click", l: "template switching" },
  { n: "0", l: "code required" },
  { n: "100%", l: "your data" },
];

export default function Home() {
  return (
    <>
      <Header />

      <section className="hero">
        <div className="aurora" aria-hidden><span className="a1" /><span className="a2" /><span className="a3" /></div>
        <div className="container hero-inner">
          <div className="hero-copy">
            <span className="hero-badge rise d1">✨ Your portfolio, your data</span>
            <h1 className="display rise d1">
              A portfolio you own, in a template you didn&apos;t have to <span className="grad">build</span>.
            </h1>
            <p className="lede rise d2">
              Enter your work once. Switch templates whenever you like — your data stays
              exactly where it is, never locked to a design, never rebuilt from scratch.
            </p>
            <div className="rise d3"><HeroCta /></div>
            <div className="hero-secondary rise d3">
              <a href="/explore" className="btn">Explore portfolios →</a>
              <span className="assure">Free to start. No code, no lock-in.</span>
            </div>
          </div>
          <TemplatePreview />
        </div>

        <div className="container">
          <Reveal className="stat-strip">
            {STATS.map((s) => (
              <div key={s.l} className="stat-pill"><strong>{s.n}</strong><span>{s.l}</span></div>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="band">
        <div className="container">
          <Reveal className="section-head">
            <h2>Everything your work deserves, none of the busywork.</h2>
            <p>Folio keeps your content and its presentation cleanly apart — the secret to a
              portfolio that grows with you instead of fighting you.</p>
          </Reveal>
          <div className="feature-grid">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={(i % 3) * 80}>
                <div className="feature">
                  <span className="feature-ic">{f.icon}</span>
                  <h3>{f.title}</h3>
                  <p>{f.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="band band-alt">
        <div className="container">
          <Reveal className="section-head">
            <h2>Templates that make your work shine.</h2>
            <p>Preview any template live — your content flows into every one without a single edit.</p>
          </Reveal>
          <Reveal><TemplateShowcase /></Reveal>
        </div>
      </section>

      <section className="band">
        <div className="container">
          <Reveal className="section-head">
            <h2>Three steps from empty to live.</h2>
            <p>Each step is independent — so nothing you do ever undoes the last.</p>
          </Reveal>
          <div className="steps">
            {[
              { n: "01", h: "Add your work", p: "Fill in your profile, projects and experience once. It's saved as your data, independent of any template." },
              { n: "02", h: "Pick a template", p: "Choose a look and preview instantly. Try another any time — nothing you entered has to change." },
              { n: "03", h: "Publish", p: "Claim your address and go live. Unpublish or restyle whenever you want, fully in control." },
            ].map((s, i) => (
              <Reveal key={s.n} delay={i * 100}>
                <div className="step"><span className="n">{s.n}</span><h3>{s.h}</h3><p>{s.p}</p></div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="band"><div className="container"><Reveal className="custom-banner"><div><h3>Want a fully custom-designed portfolio website?</h3><p className="muted">Beyond templates — we can design and build a bespoke site for you.</p></div><a href="/contact-us" className="btn btn-accent">Contact us →</a></Reveal></div></section>

      <section className="cta-band">
        <div className="aurora" aria-hidden><span className="a1" /><span className="a2" /></div>
        <div className="container cta-inner">
          <Reveal>
            <h2>Your work, presented properly.</h2>
            <p className="muted">Set up your portfolio in minutes — and keep it yours forever.</p>
            <AuthCta kind="band" />
          </Reveal>
        </div>
      </section>

      <footer className="footer">
        <div className="container footer-grid">
          <div>
            <Brand />
            <p className="muted small mt-2" style={{ maxWidth: "28em" }}>
              Build a professional portfolio from beautiful templates, without giving up ownership of your data.
            </p>
          </div>
          <AuthCta kind="footer" />
        </div>
        <div className="container foot-base">
          <span className="muted small">© {new Date().getFullYear()} Folio — part of assetprim.</span>
          <nav className="foot-links">
            <a href="/pricing">Pricing</a>
            <a href="/docs">Docs</a>
            <a href="/explore">Explore</a>
            <a href="/contact-us">Contact</a>
            <a href="/faq">FAQ</a>
            <a href="/privacy">Privacy</a>
            <a href="/terms">Terms</a>
          </nav>
        </div>
      </footer>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org", "@type": "WebSite",
          name: "Folio", url: process.env.NEXT_PUBLIC_APP_URL || undefined,
          potentialAction: { "@type": "SearchAction", target: `${process.env.NEXT_PUBLIC_APP_URL || ""}/explore?q={query}`, "query-input": "required name=query" },
        }) }}
      />
    </>
  );
}
