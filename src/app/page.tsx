import Link from "next/link";
import { Header } from "@/components/Header";
import { TemplatePreview } from "@/components/TemplatePreview";

export default function Home() {
  return (
    <>
      <Header />

      <section className="hero">
        <div className="aurora" aria-hidden>
          <span className="a1" />
          <span className="a2" />
          <span className="a3" />
        </div>
        <div className="container hero-inner">
          <div className="hero-copy">
            <h1 className="display rise d1">
              A portfolio you own, in a template you didn&apos;t have to build.
            </h1>
            <p className="lede rise d2">
              Enter your work once. Switch templates whenever you like — your data stays
              exactly where it is, never locked to a design, never rebuilt from scratch.
            </p>
            <div className="cta-row rise d3">
              <Link href="/register" className="btn btn-accent btn-lg">
                Create your portfolio
              </Link>
              <Link href="/login" className="btn btn-lg">
                Log in
              </Link>
            </div>
            <p className="assure rise d3">Free to start. No code, no lock-in.</p>
          </div>

          <TemplatePreview />
        </div>
      </section>

      <section className="steps-band">
        <div className="container">
          <div className="section-head">
            <h2>Three steps from empty to live.</h2>
            <p>
              Your content and its presentation are kept apart on purpose, so each step
              never undoes the last.
            </p>
          </div>
          <div className="steps">
            <div className="step">
              <span className="n">01</span>
              <h3>Add your work</h3>
              <p>
                Fill in your profile, projects, and experience once. It&apos;s stored as
                your data, independent of any template.
              </p>
            </div>
            <div className="step">
              <span className="n">02</span>
              <h3>Pick a template</h3>
              <p>
                Choose a look and preview it instantly. Try another any time — nothing you
                entered has to change.
              </p>
            </div>
            <div className="step">
              <span className="n">03</span>
              <h3>Publish</h3>
              <p>
                Claim your address and go live at folio.assetprim.com/p/your-name. Unpublish
                or restyle whenever you want.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container row between wrap gap-3">
          <span>Folio — part of assetprim</span>
          <span>Build your portfolio without giving up your data.</span>
        </div>
      </footer>
    </>
  );
}
