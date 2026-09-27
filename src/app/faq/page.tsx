import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "FAQ" };

const FAQS: { q: string; a: string }[] = [
  { q: "What is this?", a: "A portfolio builder. You enter your work once, pick a template, and publish a professional portfolio website — no coding required." },
  { q: "Do I need to know how to code?", a: "No. You fill in your details and choose a template. Everything else is handled for you." },
  { q: "Can I change templates later?", a: "Yes. Your data stays exactly where it is — switching templates only changes how it looks, never your content." },
  { q: "What's my portfolio URL?", a: "You get a personal address at your chosen username. You can share it anywhere." },
  { q: "Is it free?", a: "You can start for free. Paid plans (Pro / Max) unlock premium templates and extra features." },
  { q: "How do I upgrade?", a: "Open the Upgrade page, pick a plan and billing period, and submit your payment details. An admin reviews and activates your plan." },
  { q: "Can I control who sees my portfolio?", a: "Yes — set it to public, unlisted (link-only), or private." },
  { q: "Can I export my data?", a: "Yes. You can download all your portfolio data as JSON from Settings." },
  { q: "How do you handle my privacy?", a: "We store only what's needed and use privacy-safe analytics with no raw IP addresses. See our Privacy Policy." },
];

export default function FaqPage() {
  return (
    <main className="legal">
      <Link href="/" className="legal-back">← Home</Link>
      <h1>Frequently asked questions</h1>
      <div className="faq-list">
        {FAQS.map((f) => (
          <details key={f.q} className="faq-item">
            <summary>{f.q}</summary>
            <p>{f.a}</p>
          </details>
        ))}
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org", "@type": "FAQPage",
          mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
        }) }}
      />
      <p className="legal-links"><Link href="/privacy">Privacy Policy</Link> · <Link href="/terms">Terms of Service</Link></p>
    </main>
  );
}
