"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch, ApiError } from "@/lib/api";
import type { Portfolio } from "@/lib/types";
import { usePortfolio } from "@/lib/hooks";
import { TEMPLATES } from "@/templates";
import { Button } from "@/components/ui/Button";
import { portfolioUrl, portfolioLabel } from "@/lib/urls";

const PRESET_ACCENTS = ["#7c6cff", "#38d2c6", "#ff8a6b", "#f0b869", "#4b9fff", "#ff5f9e", "#46d296", "#e0b34d"];

export default function AppearancePage() {
  const qc = useQueryClient();
  const portfolio = usePortfolio();
  const current = portfolio.data?.template ?? "minimal";
  const accent = portfolio.data?.accent ?? "#7c6cff";
  const published = portfolio.data?.status === "published";
  const username = portfolio.data?.username;
  const [custom, setCustom] = useState(accent);

  const setTemplate = useMutation({
    mutationFn: (template: string) =>
      apiFetch<Portfolio>("/portfolio/template", { method: "PATCH", body: JSON.stringify({ template }) }),
    onSuccess: (data) => qc.setQueryData(["portfolio"], data),
  });
  const setAccent = useMutation({
    mutationFn: (a: string) =>
      apiFetch<Portfolio>("/portfolio/accent", { method: "PATCH", body: JSON.stringify({ accent: a }) }),
    onSuccess: (data) => qc.setQueryData(["portfolio"], data),
  });

  const err =
    (setTemplate.error instanceof ApiError && setTemplate.error.message) ||
    (setAccent.error instanceof ApiError && setAccent.error.message) ||
    null;

  return (
    <div className="stack gap-6">
      <div className="row between wrap gap-3">
        <div>
          <h1 className="page-title">Appearance</h1>
          <p className="muted">Pick a template and an accent colour. Your data never changes.</p>
        </div>
        <div className="row gap-2 wrap">
          <a className="btn btn-sm" href="/preview" target="_blank" rel="noreferrer">Live preview ↗</a>
          {username && published && (
            <a className="btn btn-sm btn-accent" href={portfolioUrl(username)} target="_blank" rel="noreferrer">View live page ↗</a>
          )}
        </div>
      </div>

      {err && <div className="alert alert-error">{err}</div>}
      {!username && <div className="alert">Claim a username first (Overview) to preview your page.</div>}

      <div className="tpl-grid">
        {TEMPLATES.map((t) => {
          const active = current === t.id;
          return (
            <div key={t.id} className={`tpl-card ${active ? "is-active" : ""}`}>
              <div className={`tpl-thumb ${t.id === "bold" ? "thumb-1" : "thumb-0"}`} aria-hidden>
                <span className="tt-avatar" /><span className="tt-line w60" /><span className="tt-line w40" />
                <span className="tt-row"><span /><span /></span>
              </div>
              <div className="row between">
                <div>
                  <h3 className="tpl-name">{t.name}</h3>
                  <p className="muted small">{t.desc}</p>
                </div>
                {active ? (
                  <span className="badge badge-published"><span className="dot" />Active</span>
                ) : (
                  <Button variant="accent" className="btn-sm" loading={setTemplate.isPending} onClick={() => setTemplate.mutate(t.id)}>Use</Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="card">
        <h2 className="card-title">Accent colour</h2>
        <p className="muted small">Used for links, highlights and headings on your page.</p>
        <div className="swatches mt-4">
          {PRESET_ACCENTS.map((c) => (
            <button
              key={c}
              type="button"
              className={`swatch ${accent.toLowerCase() === c.toLowerCase() ? "is-active" : ""}`}
              style={{ background: c }}
              aria-label={c}
              onClick={() => setAccent.mutate(c)}
            />
          ))}
        </div>
        <div className="row gap-3 mt-4 wrap">
          <input type="color" className="color-input" value={custom} onChange={(e) => setCustom(e.target.value)} />
          <input className="input" style={{ maxWidth: 140 }} value={custom} onChange={(e) => setCustom(e.target.value)} />
          <Button className="btn-sm" loading={setAccent.isPending} onClick={() => setAccent.mutate(custom)}>Apply</Button>
        </div>
      </div>

      {username && (
        <div className="card">
          <h2 className="card-title">Your public link</h2>
          <p className="muted small">{published ? "Live now — share this link." : "Publish from Overview to make this link public."}</p>
          <p className="mt-2" style={{ wordBreak: "break-all" }}>{portfolioLabel(username)}</p>
        </div>
      )}
    </div>
  );
}
