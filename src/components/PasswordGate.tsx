"use client";

import { useState } from "react";
import { TemplateRenderer } from "@/templates";
import { ViewBeacon } from "@/components/ViewBeacon";
import { SectionReorder } from "@/components/SectionReorder";
import { Tracking } from "@/components/Tracking";
import { fontStack } from "@/lib/fonts";
import type { PublicPortfolio } from "@/lib/publicTypes";

export function PasswordGate({ username, name }: { username: string; name: string }) {
  const [pw, setPw] = useState("");
  const [data, setData] = useState<PublicPortfolio | null>(null);
  const [err, setErr] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr(false);
    try {
      const base = process.env.NEXT_PUBLIC_API_URL;
      const r = await fetch(`${base}/api/v1/public/${encodeURIComponent(username)}/unlock`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: pw }),
      });
      if (!r.ok) { setErr(true); return; }
      setData((await r.json()) as PublicPortfolio);
    } catch { setErr(true); } finally { setBusy(false); }
  }

  if (data) {
    const stack = fontStack(data.settings?.font);
    return (
      <>
        {stack && <style dangerouslySetInnerHTML={{ __html: `#folio-font, #folio-font * { font-family: ${stack} !important; }` }} />}
        <Tracking gaId={data.settings?.ga_id} pixelId={data.settings?.pixel_id} />
        <ViewBeacon username={username} />
        <SectionReorder order={data.settings?.section_order} />
        <div id="folio-font"><TemplateRenderer data={data} /></div>
      </>
    );
  }

  return (
    <div className="pw-gate">
      <form className="pw-card" onSubmit={submit}>
        <div className="pw-lock">🔒</div>
        <h1>{name}</h1>
        <p className="muted">This portfolio is private. Enter the password to view it.</p>
        {err && <div className="alert alert-error">Incorrect password. Try again.</div>}
        <input className="input" type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Password" autoFocus />
        <button className="btn btn-accent" type="submit" disabled={busy || !pw}>{busy ? "Unlocking…" : "View portfolio"}</button>
      </form>
    </div>
  );
}
