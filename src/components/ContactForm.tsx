"use client";

import { useState } from "react";

export function ContactForm({ username }: { username: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    setStatus("sending");
    const base = process.env.NEXT_PUBLIC_API_URL;
    try {
      const res = await fetch(`${base}/api/v1/public/${encodeURIComponent(username)}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, website }),
      });
      if (!res.ok) throw new Error();
      setStatus("sent");
      setName(""); setEmail(""); setMessage("");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return <p className="pubcontact-done">Thanks — your message was sent. ✓</p>;
  }

  return (
    <form className="pubcontact" onSubmit={submit}>
      <div className="pubcontact-row">
        <input className="pubcontact-in" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="pubcontact-in" type="email" placeholder="Your email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <textarea className="pubcontact-in" placeholder="Your message…" rows={4} value={message} onChange={(e) => setMessage(e.target.value)} required />
      {/* honeypot — hidden from humans */}
      <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)}
        style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }} aria-hidden />
      {status === "error" && <span className="pubcontact-err">Couldn&apos;t send. Please try again.</span>}
      <button className="pubcontact-btn" type="submit" disabled={status === "sending" || !message.trim()}>
        {status === "sending" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
