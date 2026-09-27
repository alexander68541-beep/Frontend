"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";

interface Contact {
  site_name?: string | null;
  contact_email?: string | null; contact_phone?: string | null; contact_whatsapp?: string | null;
  contact_address?: string | null; contact_note?: string | null;
}

export default function ContactUsPage() {
  const [c, setC] = useState<Contact>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_URL;
    if (!base) { setLoaded(true); return; }
    fetch(`${base}/api/v1/public/branding`)
      .then((r) => (r.ok ? r.json() : {}))
      .then((d) => setC(d || {}))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const wa = c.contact_whatsapp ? c.contact_whatsapp.replace(/[^0-9]/g, "") : "";
  const hasAny = c.contact_email || c.contact_phone || c.contact_whatsapp || c.contact_address;

  return (
    <>
      <Header />
      <main className="legal">
        <Link href="/" className="legal-back">← Home</Link>
        <h1>Contact us</h1>
        <p className="muted">Have a question, or want a fully custom-designed portfolio website? Reach out — we&apos;d love to help.</p>

        {c.contact_note && <div className="alert alert-info" style={{ marginTop: 16 }}>{c.contact_note}</div>}

        {loaded && !hasAny ? (
          <div className="card center muted empty-lg" style={{ marginTop: 24 }}>Contact details will appear here soon.</div>
        ) : (
          <div className="contact-cards">
            {c.contact_email && (
              <a className="contact-card" href={`mailto:${c.contact_email}`}>
                <span className="contact-ic">✉️</span>
                <div><strong>Email</strong><span className="muted">{c.contact_email}</span></div>
              </a>
            )}
            {c.contact_phone && (
              <a className="contact-card" href={`tel:${c.contact_phone}`}>
                <span className="contact-ic">📞</span>
                <div><strong>Phone</strong><span className="muted">{c.contact_phone}</span></div>
              </a>
            )}
            {c.contact_whatsapp && (
              <a className="contact-card" href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer">
                <span className="contact-ic">💬</span>
                <div><strong>WhatsApp</strong><span className="muted">{c.contact_whatsapp}</span></div>
              </a>
            )}
            {c.contact_address && (
              <div className="contact-card">
                <span className="contact-ic">📍</span>
                <div><strong>Address</strong><span className="muted">{c.contact_address}</span></div>
              </div>
            )}
          </div>
        )}

        <p className="muted small" style={{ marginTop: 28 }}>
          Already have an account? You can also message support from your <Link href="/dashboard/messages">dashboard</Link>.
        </p>
        <p className="legal-links"><Link href="/faq">FAQ</Link> · <Link href="/privacy">Privacy</Link> · <Link href="/terms">Terms</Link></p>
      </main>
    </>
  );
}
