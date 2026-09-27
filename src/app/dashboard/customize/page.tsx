"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { Portfolio } from "@/lib/types";
import { usePortfolio } from "@/lib/hooks";
import { FONT_OPTIONS, SECTION_KEYS } from "@/lib/fonts";
import { Button } from "@/components/ui/Button";

export default function CustomizePage() {
  const qc = useQueryClient();
  const portfolio = usePortfolio();

  const [font, setFont] = useState("");
  const [hidden, setHidden] = useState<string[]>([]);

  useEffect(() => {
    const st = portfolio.data?.settings;
    if (st) { setFont(st.font ?? ""); setHidden(st.hidden ?? []); }
  }, [portfolio.data?.settings]);

  const save = useMutation({
    mutationFn: () => apiFetch<Portfolio>("/portfolio/settings", { method: "PATCH", body: JSON.stringify({ font, hidden }) }),
    onSuccess: (d) => qc.setQueryData(["portfolio"], d),
  });

  const toggle = (k: string) => setHidden((h) => (h.includes(k) ? h.filter((x) => x !== k) : [...h, k]));

  if (portfolio.isLoading) return <p className="muted">Loading…</p>;

  return (
    <div className="stack gap-6">
      <div><h1 className="page-title">Customize</h1><p className="muted">Fine-tune how your portfolio looks — font and which sections appear.</p></div>

      <div className="card">
        <h2 className="card-title">Font</h2>
        <p className="muted small">Applies to your public portfolio.</p>
        <div className="tpl-grid mt-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}>
          {FONT_OPTIONS.map((o) => (
            <button key={o.key} className={`card ${font === o.key ? "tpl-card-active" : ""}`} onClick={() => setFont(o.key)} style={{ textAlign: "left", cursor: "pointer", fontFamily: o.stack || undefined }}>
              <div style={{ fontSize: 20, fontWeight: 700 }}>Aa</div>
              <div className="muted small mt-2">{o.label}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">Sections</h2>
        <p className="muted small">Untick to hide a section from your public portfolio. (Empty sections are hidden automatically.)</p>
        <div className="stack gap-2 mt-4">
          {SECTION_KEYS.map((s) => (
            <label key={s.key} className="check-row">
              <input type="checkbox" checked={!hidden.includes(s.key)} onChange={() => toggle(s.key)} />
              <span>{s.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div><Button variant="accent" loading={save.isPending} onClick={() => save.mutate()}>{save.isSuccess ? "Saved ✓" : "Save customization"}</Button></div>
    </div>
  );
}
