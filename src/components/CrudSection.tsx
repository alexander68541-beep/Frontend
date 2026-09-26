import Link from "next/link";
"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, ApiError } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { ImageUpload } from "@/components/ImageUpload";

export type FieldType = "text" | "textarea" | "url" | "tags" | "checkbox" | "number" | "image";

export interface CrudField {
  name: string;
  label: string;
  type?: FieldType;
  placeholder?: string;
  required?: boolean;
  half?: boolean; // render in a 2-col row
}

interface Props {
  title: string;
  subtitle?: string;
  endpoint: string;
  queryKey: string;
  fields: CrudField[];
  primary: string;
  secondary?: string;
  addLabel?: string;
  emptyText?: string;
}

type Item = Record<string, unknown> & { id: string };
type FormValues = Record<string, string | boolean>;

function emptyForm(fields: CrudField[]): FormValues {
  const v: FormValues = {};
  for (const f of fields) v[f.name] = f.type === "checkbox" ? false : "";
  return v;
}

function itemToForm(fields: CrudField[], item: Item): FormValues {
  const v: FormValues = {};
  for (const f of fields) {
    const raw = item[f.name];
    if (f.type === "checkbox") v[f.name] = !!raw;
    else if (f.type === "tags") v[f.name] = Array.isArray(raw) ? raw.join(", ") : "";
    else v[f.name] = raw == null ? "" : String(raw);
  }
  return v;
}

function toPayload(fields: CrudField[], values: FormValues): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const f of fields) {
    const val = values[f.name];
    if (f.type === "tags") {
      out[f.name] = String(val ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    } else if (f.type === "checkbox") {
      out[f.name] = !!val;
    } else if (f.type === "number") {
      const n = parseInt(String(val ?? ""), 10);
      out[f.name] = Number.isFinite(n) ? n : null;
    } else {
      const s = String(val ?? "").trim();
      out[f.name] = s === "" ? null : s;
    }
  }
  return out;
}

export function CrudSection(props: Props) {
  const { title, subtitle, endpoint, queryKey, fields, primary, secondary, addLabel, emptyText } = props;
  const qc = useQueryClient();

  const list = useQuery({ queryKey: [queryKey], queryFn: () => apiFetch<Item[]>(endpoint) });
  const limitsQ = useQuery({ queryKey: ["portfolio-limits"], queryFn: () => apiFetch<{ plan: string; limits: Record<string, number> }>("/portfolio/limits"), staleTime: 60000 });
  const entityKey = endpoint.split("/").filter(Boolean).pop() ?? "";
  const limit = limitsQ.data?.limits?.[entityKey];

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormValues>(() => emptyForm(fields));
  const [formError, setFormError] = useState<string | null>(null);

  function startAdd() {
    setEditingId(null);
    setForm(emptyForm(fields));
    setFormError(null);
    setOpen(true);
  }
  function startEdit(item: Item) {
    setEditingId(item.id);
    setForm(itemToForm(fields, item));
    setFormError(null);
    setOpen(true);
  }
  function close() {
    setOpen(false);
    setEditingId(null);
    setFormError(null);
  }

  const save = useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      editingId
        ? apiFetch(`${endpoint}/${editingId}`, { method: "PATCH", body: JSON.stringify(payload) })
        : apiFetch(endpoint, { method: "POST", body: JSON.stringify(payload) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [queryKey] });
      close();
    },
    onError: (e) => setFormError(e instanceof ApiError ? e.message : "Couldn't save. Try again."),
  });

  const remove = useMutation({
    mutationFn: (id: string) => apiFetch(`${endpoint}/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [queryKey] }),
  });

  const reorder = useMutation({
    mutationFn: (ids: string[]) =>
      apiFetch(`${endpoint}/reorder`, { method: "POST", body: JSON.stringify({ ids }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [queryKey] }),
  });

  function move(index: number, dir: -1 | 1) {
    const ids = (list.data ?? []).map((it) => it.id);
    const j = index + dir;
    if (j < 0 || j >= ids.length) return;
    const tmp = ids[index];
    ids[index] = ids[j];
    ids[j] = tmp;
    reorder.mutate(ids);
  }

  function submit() {
    setFormError(null);
    for (const f of fields) {
      if (f.required && !String(form[f.name] ?? "").trim()) {
        setFormError(`${f.label} is required.`);
        return;
      }
    }
    save.mutate(toPayload(fields, form));
  }

  function setField(name: string, value: string | boolean) {
    setForm((f) => ({ ...f, [name]: value }));
  }

  const items = list.data ?? [];
  const atLimit = typeof limit === "number" && items.length >= limit;

  return (
    <div className="stack gap-6">
      <div className="row between wrap gap-3">
        <div>
          <h1 className="page-title">{title}</h1>
          {subtitle && <p className="muted">{subtitle}</p>}
        </div>
        {!open && (
          <div className="stack gap-1" style={{ alignItems: "flex-end" }}>
            {typeof limit === "number" && <span className="muted small">{items.length} / {limit}</span>}
            {atLimit ? (
              <div className="row gap-2 wrap" style={{ alignItems: "center" }}>
                <span className="muted small">Plan limit reached</span>
                <Link href="/dashboard/billing" className="btn btn-sm btn-accent">Upgrade</Link>
              </div>
            ) : (
              <Button variant="accent" onClick={startAdd}>
                {addLabel ?? `Add ${title.replace(/s$/, "").toLowerCase()}`}
              </Button>
            )}
          </div>
        )}
      </div>

      {open && (
        <div className="card">
          <h2 className="card-title">{editingId ? "Edit" : "Add new"}</h2>
          <div className="stack gap-4 mt-4">
            {formError && <div className="alert alert-error">{formError}</div>}
            <div className="form-grid">
              {fields.map((f) => {
                const val = form[f.name];
                if (f.type === "image") {
                  return (
                    <ImageUpload
                      key={f.name}
                      label={f.label}
                      value={String(val ?? "")}
                      onChange={(url) => setField(f.name, url)}
                    />
                  );
                }
                if (f.type === "checkbox") {
                  return (
                    <label key={f.name} className="check-row full">
                      <input
                        type="checkbox"
                        checked={!!val}
                        onChange={(e) => setField(f.name, e.target.checked)}
                      />
                      <span>{f.label}</span>
                    </label>
                  );
                }
                const cls = f.half ? "field" : "field full";
                if (f.type === "textarea") {
                  return (
                    <div key={f.name} className="field full">
                      <label className="label">{f.label}</label>
                      <textarea
                        className="textarea"
                        placeholder={f.placeholder}
                        value={String(val ?? "")}
                        onChange={(e) => setField(f.name, e.target.value)}
                      />
                    </div>
                  );
                }
                return (
                  <div key={f.name} className={cls}>
                    <label className="label">
                      {f.label} {f.required && <span className="req">*</span>}
                    </label>
                    <input
                      className="input"
                      type={f.type === "number" ? "number" : "text"}
                      inputMode={f.type === "number" ? "numeric" : undefined}
                      placeholder={f.placeholder}
                      value={String(val ?? "")}
                      onChange={(e) => setField(f.name, e.target.value)}
                    />
                  </div>
                );
              })}
            </div>
            <div className="row gap-3">
              <Button variant="accent" loading={save.isPending} onClick={submit}>
                {editingId ? "Save changes" : "Add"}
              </Button>
              <Button variant="ghost" onClick={close}>Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {list.isLoading ? (
        <p className="muted">Loading…</p>
      ) : list.isError ? (
        <div className="alert alert-error">
          {list.error instanceof ApiError ? list.error.message : "Couldn't load."}
        </div>
      ) : items.length === 0 && !open ? (
        <div className="card center muted empty-lg">
          {emptyText ?? "Nothing here yet."}
          <div className="mt-4"><Button variant="accent" onClick={startAdd}>{addLabel ?? "Add your first"}</Button></div>
        </div>
      ) : (
        <div className="crud-list">
          {items.map((item, idx) => (
            <div key={item.id} className="crud-item">
              <div className="crud-item-main">
                <div className="crud-item-title">{String(item[primary] ?? "Untitled")}</div>
                {secondary && item[secondary] ? (
                  <div className="muted small">{String(item[secondary])}</div>
                ) : null}
                {Array.isArray(item.tags) && item.tags.length > 0 && (
                  <div className="chips mt-2">
                    {(item.tags as string[]).map((t) => (
                      <span key={t} className="chip" style={{ cursor: "default" }}>{t}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="row gap-2">
                <div className="reorder">
                  <button
                    className="reorder-btn"
                    aria-label="Move up"
                    disabled={idx === 0 || reorder.isPending}
                    onClick={() => move(idx, -1)}
                  >↑</button>
                  <button
                    className="reorder-btn"
                    aria-label="Move down"
                    disabled={idx === items.length - 1 || reorder.isPending}
                    onClick={() => move(idx, 1)}
                  >↓</button>
                </div>
                <button className="btn btn-sm" onClick={() => startEdit(item)}>Edit</button>
                <button
                  className="btn btn-sm btn-danger"
                  disabled={remove.isPending}
                  onClick={() => {
                    if (confirm("Delete this item?")) remove.mutate(item.id);
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
