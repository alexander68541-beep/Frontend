"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, ApiError } from "@/lib/api";
import type { Portfolio } from "@/lib/types";
import { useAccount, usePortfolio } from "@/lib/hooks";
import { hasTemplate } from "@/templates";
import { Button } from "@/components/ui/Button";
import { portfolioUrl, portfolioLabel } from "@/lib/urls";
import { TemplateBuilder } from "@/components/TemplateBuilder";

const PRESET_ACCENTS = ["#7c6cff", "#38d2c6", "#ff8a6b", "#f0b869", "#4b9fff", "#ff5f9e", "#46d296", "#e0b34d"];

interface CT { id: string; key: string; name: string; category: string; plan: string; }

export default function TemplatesPage() {
  const qc = useQueryClient();
  const portfolio = usePortfolio();
  const account = useAccount();
  const isAdmin = account.data?.role === "admin";
  const isPro = isAdmin || account.data?.plan === "pro";
  const current = portfolio.data?.template ?? "minimal";
  const accent = portfolio.data?.accent ?? "#7c6cff";
  const published = portfolio.data?.status === "published";
  const username = portfolio.data?.username;
  const [custom, setCustom] = useState(accent);

  const list = useQuery({ queryKey: ["templates"], queryFn: () => apiFetch<CT[]>("/templates"), refetchOnWindowFocus: true });
  const billing = useQuery({ queryKey: ["billing-info"], queryFn: () => apiFetch<{ features: { key: string; has: boolean }[] }>("/billing/info") });
  const customAccentAllowed = billing.data?.features.find((f) => f.key === "custom_accent")?.has ?? true;

  const setTemplate = useMutation({
    mutationFn: (key: string) => apiFetch<Portfolio>("/portfolio/template", { method: "PATCH", body: JSON.stringify({ template: key }) }),
    onSuccess: (d) => qc.setQueryData(["portfolio"], d),
  });
  const setAccent = useMutation({
    mutationFn: (a: string) => apiFetch<Portfolio>("/portfolio/accent", { method: "PATCH", body: JSON.stringify({ accent: a }) }),
    onSuccess: (d) => qc.setQueryData(["portfolio"], d),
  });

  const err = [setTemplate.error, setAccent.error].map((e) => (e instanceof ApiError ? e.message : null)).find(Boolean) || null;

  // only show listings whose key has a coded component in the registry
  const items = (list.data ?? []).filter((t) => hasTemplate(t.key));
  const categories = Array.from(new Set(items.map((i) => i.category)));

  return (
    <div className="stack gap-6">
      <div className="row between wrap gap-3">
        <div><h1 className="page-title">Templates</h1><p className="muted">Pick a template and accent. Your data never changes.</p></div>
        <div className="row gap-2 wrap">
          <a className="btn btn-sm" href="/preview" target="_blank" rel="noreferrer">Live preview ↗</a>
          {username && published && <a className="btn btn-sm btn-accent" href={portfolioUrl(username)} target="_blank" rel="noreferrer">View live ↗</a>}
        </div>
      </div>

      {err && <div className="alert alert-error">{err}</div>}
      {!username && <div className="alert">Claim a username first (Overview) to preview your page.</div>}
      {items.length === 0 && !list.isLoading && <div className="alert">No templates are active yet.{isAdmin ? " Add one below." : ""}</div>}

      {categories.map((cat) => (
        <div key={cat} className="stack gap-3">
          <h2 className="cat-h">{cat}</h2>
          <div className="tpl-grid">
            {items.filter((i) => i.category === cat).map((it) => {
              const active = current === it.key;
              const pro = it.plan === "pro";
              const locked = pro && !isPro;
              return (
                <div key={it.id} className={`tpl-card ${active ? "is-active" : ""} ${locked ? "is-locked" : ""}`}>
                  <div className={`tpl-thumb ${it.key === "bold" || it.key === "studio" ? "thumb-1" : "thumb-0"}`} aria-hidden>
                    <span className="tt-avatar" /><span className="tt-line w60" /><span className="tt-line w40" /><span className="tt-row"><span /><span /></span>
                  </div>
                  <div className="row between">
                    <div><h3 className="tpl-name">{it.name} {pro && <span className="pro-tag">PRO</span>}</h3><p className="muted small">{it.key}</p></div>
                    {active ? <span className="badge badge-published"><span className="dot" />Active</span>
                      : locked ? <span className="badge badge-draft">Pro</span>
                      : <Button variant="accent" className="btn-sm" loading={setTemplate.isPending} onClick={() => setTemplate.mutate(it.key)}>Use</Button>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {isAdmin && <TemplateBuilder />}

      <div className="card">
        <h2 className="card-title">Accent colour</h2>
        <p className="muted small">Used for links, highlights and headings.</p>
        <div className="swatches mt-4">
          {PRESET_ACCENTS.map((c) => (
            <button key={c} type="button" className={`swatch ${accent.toLowerCase() === c.toLowerCase() ? "is-active" : ""}`} style={{ background: c }} aria-label={c} onClick={() => setAccent.mutate(c)} />
          ))}
        </div>
        {customAccentAllowed ? (
          <div className="row gap-3 mt-4 wrap">
            <input type="color" className="color-input" value={custom} onChange={(e) => setCustom(e.target.value)} />
            <input className="input" style={{ maxWidth: 140 }} value={custom} onChange={(e) => setCustom(e.target.value)} />
            <Button className="btn-sm" loading={setAccent.isPending} onClick={() => setAccent.mutate(custom)}>Apply</Button>
          </div>
        ) : (
          <p className="muted small mt-4">Custom colours are a Pro feature. <a href="/dashboard/billing" style={{ color: "var(--iris-bright)" }}>Upgrade →</a></p>
        )}
      </div>

      {username && (
        <div className="card">
          <h2 className="card-title">Your public link</h2>
          <p className="muted small">{published ? "Live now — share this link." : "Publish from Overview to make this public."}</p>
          <p className="mt-2" style={{ wordBreak: "break-all" }}>{portfolioLabel(username)}</p>
        </div>
      )}
    </div>
  );
}
