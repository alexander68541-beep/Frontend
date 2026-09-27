import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "Documentation — how it works",
  description: "How Folio works: build a portfolio, switch templates freely, publish, plans and features explained.",
};

export default function DocsPage() {
  return (
    <>
      <Header />
      <main className="legal">
        <Link href="/" className="legal-back">← Home</Link>
        <h1>Documentation</h1>
        <p className="muted">Everything about how Folio works — building your portfolio, templates, publishing, plans and features.</p>

        <h2 id="what">What is Folio?</h2>
        <p>Folio is a portfolio builder. You enter your work once — profile, projects, experience, skills, and more — and it&apos;s stored as <strong>your data</strong>, independent of any design. You then pick a template to present it, and publish a professional portfolio website. No coding required.</p>

        <h2 id="how">How it works</h2>
        <ol>
          <li><strong>Add your work.</strong> Fill in your profile and sections from the dashboard. Everything is saved as you go, and single-record editors keep an unsaved draft so you never lose work.</li>
          <li><strong>Pick a template.</strong> Choose a design and preview it live with your own data. Switch any time — changing templates never edits or deletes your content.</li>
          <li><strong>Customize.</strong> Choose a font, show/hide sections, reorder them, and (on eligible plans) set a custom accent colour.</li>
          <li><strong>Publish.</strong> Claim your username and go live at your own address. Publishing takes a snapshot; keep editing as a private draft and hit <em>Publish changes</em> when ready.</li>
        </ol>

        <h2 id="url">Your address &amp; privacy</h2>
        <p>Your portfolio lives at your own username-based address. You control visibility: <strong>Public</strong> (listed and discoverable), <strong>Unlisted</strong> (only people with the link), or <strong>Private</strong> (hidden). You can export all your data as JSON any time — no lock-in.</p>

        <h2 id="templates">Templates</h2>
        <p>Templates only present your data. The same content flows into every template without changes. Some templates are premium and require a plan that includes premium templates. Preview any template live before applying it.</p>

        <h2 id="plans">Plans &amp; pricing</h2>
        <p>Start free. Paid plans unlock premium features and higher limits. See the <Link href="/pricing">pricing page</Link> for current plans, prices (monthly / yearly / lifetime) and exactly what each plan includes, along with how many items you can add per section on each plan.</p>
        <ul>
          <li><strong>Free</strong> — build and publish your portfolio with core templates and sensible limits.</li>
          <li><strong>Paid plans (e.g. Pro / Max)</strong> — unlock premium templates, custom accent, remove branding, analytics, custom domain and higher (often unlimited) limits, depending on the plan.</li>
        </ul>
        <p>You can upgrade, switch, or downgrade from your dashboard&apos;s <strong>Billing</strong> page. Upgrades are submitted with your payment details and activated after review; downgrading to Free is instant.</p>

        <h2 id="features">Features explained</h2>
        <ul>
          <li><strong>Premium templates</strong> — access to premium designs.</li>
          <li><strong>Custom accent colour</strong> — any colour, not just the presets.</li>
          <li><strong>Remove branding</strong> — hide the &ldquo;Made with Folio&rdquo; footer on your public page.</li>
          <li><strong>Analytics</strong> — privacy-safe visitor and view stats (unique visitors, referrers, devices, countries).</li>
          <li><strong>Custom domain</strong> — connect your own domain.</li>
        </ul>
        <p>You get exactly the features your plan includes — nothing more, nothing less.</p>

        <h2 id="limits">Limits</h2>
        <p>Each plan can cap how many items you add per section (for example projects, skills, gallery). When you reach a limit, you&apos;re prompted to upgrade. Limits are shown on the pricing page for each plan.</p>

        <h2 id="analytics">Analytics</h2>
        <p>On plans that include analytics, your dashboard shows total and unique visitors, a daily views chart, top referrers, device split and top countries. Analytics are privacy-safe — no raw IP addresses are stored.</p>

        <h2 id="support">Support &amp; custom work</h2>
        <p>Message our team from the dashboard&apos;s <strong>Support</strong> page, or reach us via the <Link href="/contact-us">Contact page</Link>. Want a fully custom-designed portfolio beyond templates? Contact us — we can build a bespoke site for you.</p>

        <p className="legal-links">
          <Link href="/pricing">Pricing</Link> · <Link href="/faq">FAQ</Link> · <Link href="/contact-us">Contact</Link> · <Link href="/privacy">Privacy</Link> · <Link href="/terms">Terms</Link>
        </p>
      </main>
    </>
  );
}
