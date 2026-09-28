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
  const [order, setOrder] = useState<string[]>(SECTION_KEYS.map((s) => s.key));
  const [gaId, setGaId] = useState("");
  const [pixelId, setPixelId] = useState("");

  useEffect(() => {
    const st = portfolio.data?.settings;
    if (st) {
      setFont(st.font ?? "");
      setHidden(st.hidden ?? []);
      const saved = st.section_order ?? [];
      const merged = [...saved.filter((k) => SECTION_KEYS.some((s) => s.key === k)), ...SECTION_KEYS.map((s) => s.key).filter((k) => !saved.includes(k))];
      setOrder(merged);
      setGaId(st.ga_id ?? "");
      setPixelId(st.pixel_id ?? "");
    }
  }, [portfolio.data?.settings]);

  const save = useMutation({
    mutationFn: () => apiFetch<Portfolio>("/portfolio/settings", { method: "PATCH", body: JSON.stringify({ font, hidden, section_order: order, ga_id: gaId, pixel_id: pixelId }) }),
    onSuccess: (d) => qc.setQueryData(["portfolio"], d),
  });

  const toggle = (k: string) => setHidden((h) => (h.includes(k) ? h.filter((x) => x !== k) : [...h, k]));
  const move = (i: number, dir: -1 | 1) => setOrder((o) => {
    const j = i + dir; if (j < 0 || j >= o.length) return o;
    const n = [...o]; [n[i], n[j]] = [n[j], n[i]]; return n;
  });
  const labelOf = (k: string) => SECTION_KEYS.find((s) => s.key === k)?.label ?? k;

  if (portfolio.isLoading) return <p className="muted">Loading…</p>;

  return (
    <div className="stack gap-6">
      <div><h1 className="page-title">Customize</h1><p className="muted">Fine-tune how your portfolio looks — font and which sections appear.</p></div>

      <div className="card">
        <h2 className="card-title">Font</h2>
        <p className="muted small">Applies to your public portfolio.</p>
        <div className="tpl-grid mt-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}>
          {FONT_OPTIONS.map((o) => (
            <button
              key={o.key}
              onClick={() => setFont(o.key)}
              className="card"
              style={{
                textAlign: "left", cursor: "pointer", fontFamily: o.stack || undefined,
                borderColor: font === o.key ? "var(--iris)" : undefined,
                boxShadow: font === o.key ? "0 0 0 2px var(--iris) inset" : undefined,
              }}
            >
              <div style={{ fontSize: 22, fontWeight: 700 }}>Ag</div>
              <div className="muted small mt-2">{o.label}{font === o.key ? " ✓" : ""}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">Sections</h2>
        <p className="muted small">Untick to hide a section from your public portfolio. (Empty sections are hidden automatically.)</p>
        <p className="muted small">Drag order with the arrows; untick to hide.</p>
        <div className="stack gap-2 mt-4">
          {order.map((k, i) => (
            <div key={k} className="row between reorder-row">
              <label className="check-row">
                <input type="checkbox" checked={!hidden.includes(k)} onChange={() => toggle(k)} />
                <span>{labelOf(k)}</span>
              </label>
              <div className="row gap-1">
                <button className="reorder-btn" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move up">↑</button>
                <button className="reorder-btn" disabled={i === order.length - 1} onClick={() => move(i, 1)} aria-label="Move down">↓</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">Integrations</h2>
        <p className="muted small">Add your own tracking. Leave blank to disable. (Re-publish after changing.)</p>
        <div className="form-grid mt-4">
          <div className="field"><label className="label">Google Analytics ID</label><input className="input" value={gaId} onChange={(e) => setGaId(e.target.value)} placeholder="G-XXXXXXXXXX" /></div>
          <div className="field"><label className="label">Meta (Facebook) Pixel ID</label><input className="input" value={pixelId} onChange={(e) => setPixelId(e.target.value)} placeholder="1234567890" /></div>
        </div>
      </div>

      <div><Button variant="accent" loading={save.isPending} onClick={() => save.mutate()}>{save.isSuccess ? "Saved ✓" : "Save customization"}</Button></div>
    </div>
  );
}
