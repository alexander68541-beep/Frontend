"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { TEMPLATE_KEYS } from "@/templates";
import { Button } from "@/components/ui/Button";

interface CT { id: string; key: string; name: string; category: string; plan: string; is_published: boolean; }

export function TemplateBuilder() {
  const qc = useQueryClient();
  const list = useQuery({ queryKey: ["admin-templates"], queryFn: () => apiFetch<CT[]>("/admin/templates"), refetchOnWindowFocus: true });

  const [key, setKey] = useState(TEMPLATE_KEYS[0] ?? "");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Custom");
  const [plan, setPlan] = useState("free");

  const create = useMutation({
    mutationFn: () => apiFetch("/admin/templates", { method: "POST", body: JSON.stringify({ key, name, category, plan, is_published: true }) }),
    onSuccess: () => { setName(""); qc.invalidateQueries({ queryKey: ["admin-templates"] }); qc.invalidateQueries({ queryKey: ["templates"] }); },
  });
  const patch = useMutation({
    mutationFn: (v: { id: string; body: Record<string, unknown> }) => apiFetch(`/admin/templates/${v.id}`, { method: "PATCH", body: JSON.stringify(v.body) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-templates"] }); qc.invalidateQueries({ queryKey: ["templates"] }); },
  });
  const del = useMutation({
    mutationFn: (id: string) => apiFetch(`/admin/templates/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-templates"] }); qc.invalidateQueries({ queryKey: ["templates"] }); },
  });

  return (
    <div className="card" style={{ borderColor: "rgba(124,108,255,0.35)" }}>
      <h2 className="card-title">Template listings (admin)</h2>
      <p className="muted small">
        Templates are coded in <code>src/templates/</code> and registered by key. Here you list them,
        set category/plan and turn them on/off. Coded keys available: {TEMPLATE_KEYS.join(", ")}.
      </p>
      <div className="form-grid mt-4">
        <div className="field"><label className="label">Coded key</label>
          <select className="input" value={key} onChange={(e) => setKey(e.target.value)}>
            {TEMPLATE_KEYS.map((k) => <option key={k} value={k}>{k}</option>)}
          </select></div>
        <div className="field"><label className="label">Name</label><input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Aurora" /></div>
        <div className="field"><label className="label">Category</label><input className="input" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Creative" /></div>
        <div className="field"><label className="label">Plan</label>
          <select className="input" value={plan} onChange={(e) => setPlan(e.target.value)}><option value="free">Free</option><option value="pro">Pro</option></select></div>
      </div>
      <div className="mt-4"><Button variant="accent" loading={create.isPending} disabled={!name.trim() || !key} onClick={() => create.mutate()}>Add listing</Button></div>

      {(list.data ?? []).length > 0 && (
        <div className="table-wrap mt-6">
          <table className="tbl">
            <thead><tr><th>Name</th><th>Key</th><th>Category</th><th>Plan</th><th>Active</th><th></th></tr></thead>
            <tbody>
              {(list.data ?? []).map((t) => {
                const coded = TEMPLATE_KEYS.includes(t.key);
                return (
                  <tr key={t.id}>
                    <td>{t.name}{!coded && <span className="badge badge-error" style={{ marginLeft: 8 }}>no code</span>}</td>
                    <td>{t.key}</td><td>{t.category}</td>
                    <td>
                      <select className="input" style={{ padding: "4px 8px", maxWidth: 100 }} value={t.plan} onChange={(e) => patch.mutate({ id: t.id, body: { plan: e.target.value } })}>
                        <option value="free">free</option><option value="pro">pro</option>
                      </select>
                    </td>
                    <td>
                      <button className={`btn btn-sm ${t.is_published ? "btn-accent" : ""}`} onClick={() => patch.mutate({ id: t.id, body: { is_published: !t.is_published } })}>
                        {t.is_published ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td><button className="btn btn-sm btn-danger" onClick={() => { if (confirm("Delete listing?")) del.mutate(t.id); }}>Delete</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
