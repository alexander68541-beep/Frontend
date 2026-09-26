"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/Button";

interface CT { id: string; name: string; category: string; base: string; accent: string; plan: string; is_published: boolean; }
const BASES = ["minimal", "bold", "editorial", "studio"];

export function TemplateBuilder() {
  const qc = useQueryClient();
  const list = useQuery({ queryKey: ["admin-templates"], queryFn: () => apiFetch<CT[]>("/admin/templates"), refetchOnWindowFocus: true });
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Custom");
  const [base, setBase] = useState("minimal");
  const [accent, setAccent] = useState("#7c6cff");
  const [plan, setPlan] = useState("free");

  const create = useMutation({
    mutationFn: () => apiFetch("/admin/templates", { method: "POST", body: JSON.stringify({ name, category, base, accent, plan, is_published: true }) }),
    onSuccess: () => { setName(""); qc.invalidateQueries({ queryKey: ["admin-templates"] }); qc.invalidateQueries({ queryKey: ["templates"] }); },
  });
  const del = useMutation({
    mutationFn: (id: string) => apiFetch(`/admin/templates/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-templates"] }); qc.invalidateQueries({ queryKey: ["templates"] }); },
  });

  return (
    <div className="card" style={{ borderColor: "rgba(124,108,255,0.35)" }}>
      <h2 className="card-title">Create a template (admin)</h2>
      <p className="muted small">Build presets on any base layout. They appear for users by category.</p>
      <div className="stack gap-4 mt-4">
        <div className="form-grid">
          <div className="field"><label className="label">Name</label><input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Aurora" /></div>
          <div className="field"><label className="label">Category</label><input className="input" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Creative" /></div>
          <div className="field"><label className="label">Base layout</label>
            <select className="input" value={base} onChange={(e) => setBase(e.target.value)}>{BASES.map((b) => <option key={b} value={b}>{b}</option>)}</select></div>
          <div className="field"><label className="label">Plan</label>
            <select className="input" value={plan} onChange={(e) => setPlan(e.target.value)}><option value="free">Free</option><option value="pro">Pro</option></select></div>
          <div className="field"><label className="label">Accent</label>
            <div className="row gap-2"><input type="color" className="color-input" value={accent} onChange={(e) => setAccent(e.target.value)} /><input className="input" value={accent} onChange={(e) => setAccent(e.target.value)} /></div></div>
        </div>
        <div><Button variant="accent" loading={create.isPending} disabled={!name.trim()} onClick={() => create.mutate()}>Create template</Button></div>
      </div>

      {(list.data ?? []).length > 0 && (
        <div className="table-wrap mt-6">
          <table className="tbl">
            <thead><tr><th>Name</th><th>Category</th><th>Base</th><th>Plan</th><th></th></tr></thead>
            <tbody>
              {(list.data ?? []).map((t) => (
                <tr key={t.id}>
                  <td><span className="swatch" style={{ width: 14, height: 14, display: "inline-block", verticalAlign: "middle", marginRight: 8, background: t.accent }} />{t.name}</td>
                  <td>{t.category}</td><td>{t.base}</td>
                  <td><span className={`badge ${t.plan === "pro" ? "badge-draft" : "badge-published"}`}>{t.plan}</span></td>
                  <td><button className="btn btn-sm btn-danger" onClick={() => { if (confirm("Delete template?")) del.mutate(t.id); }}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
