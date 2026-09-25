"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch, ApiError } from "@/lib/api";
import type { Portfolio } from "@/lib/types";
import { usePortfolio } from "@/lib/hooks";
import { Button } from "@/components/ui/Button";

export interface PField {
  name: string;
  label: string;
  type?: "text" | "textarea" | "url" | "email";
  placeholder?: string;
  hint?: string;
  half?: boolean;
}

export function ProfileSection({
  title,
  subtitle,
  fields,
}: {
  title: string;
  subtitle?: string;
  fields: PField[];
}) {
  const qc = useQueryClient();
  const portfolio = usePortfolio();

  if (portfolio.isLoading) return <p className="muted">Loading…</p>;
  if (portfolio.isError || !portfolio.data)
    return <div className="alert alert-error">Couldn&apos;t load your profile.</div>;

  return (
    <Editor
      title={title}
      subtitle={subtitle}
      fields={fields}
      portfolio={portfolio.data}
      onSaved={(data) => qc.setQueryData(["portfolio"], data)}
    />
  );
}

function Editor({
  title,
  subtitle,
  fields,
  portfolio,
  onSaved,
}: {
  title: string;
  subtitle?: string;
  fields: PField[];
  portfolio: Portfolio;
  onSaved: (p: Portfolio) => void;
}) {
  const prof = (portfolio.profile ?? {}) as Record<string, unknown>;
  const [form, setForm] = useState<Record<string, string>>(() => {
    const v: Record<string, string> = {};
    for (const f of fields) v[f.name] = prof[f.name] == null ? "" : String(prof[f.name]);
    return v;
  });
  const [saved, setSaved] = useState(false);

  const save = useMutation({
    mutationFn: () => {
      const payload: Record<string, unknown> = {};
      for (const f of fields) {
        const s = (form[f.name] ?? "").trim();
        payload[f.name] = s === "" ? null : s;
      }
      return apiFetch<Portfolio>("/portfolio/profile", {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: (data) => {
      onSaved(data);
      setSaved(true);
    },
  });

  const err = save.error instanceof ApiError ? save.error.message : null;

  return (
    <div className="stack gap-6">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="muted">{subtitle}</p>}
      </div>
      <div className="card">
        <div className="stack gap-4">
          {err && <div className="alert alert-error">{err}</div>}
          {saved && <div className="alert alert-ok">Saved.</div>}
          <div className="form-grid">
            {fields.map((f) =>
              f.type === "textarea" ? (
                <div key={f.name} className="field full">
                  <label className="label">{f.label}</label>
                  <textarea
                    className="textarea"
                    placeholder={f.placeholder}
                    value={form[f.name] ?? ""}
                    onChange={(e) => { setSaved(false); setForm((v) => ({ ...v, [f.name]: e.target.value })); }}
                  />
                  {f.hint && <span className="field-hint">{f.hint}</span>}
                </div>
              ) : (
                <div key={f.name} className={f.half ? "field" : "field full"}>
                  <label className="label">{f.label}</label>
                  <input
                    className="input"
                    type={f.type === "email" ? "email" : "text"}
                    placeholder={f.placeholder}
                    value={form[f.name] ?? ""}
                    onChange={(e) => { setSaved(false); setForm((v) => ({ ...v, [f.name]: e.target.value })); }}
                  />
                  {f.hint && <span className="field-hint">{f.hint}</span>}
                </div>
              ),
            )}
          </div>
          <div><Button variant="accent" loading={save.isPending} onClick={() => save.mutate()}>Save</Button></div>
        </div>
      </div>
    </div>
  );
}
