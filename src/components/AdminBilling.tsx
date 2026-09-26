"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { FEATURE_CATALOG } from "@/lib/features";
import { Button } from "@/components/ui/Button";

interface Method { name: string; value: string; }
interface Settings {
  pro_price: string | null; currency: string | null; pro_features: string[]; payment_note: string | null;
  payment_methods: Method[];
  cloudinary_cloud_name: string | null; cloudinary_api_key: string | null; cloudinary_folder: string | null;
  cloudinary_configured: boolean;
}
interface Pay { id: string; method: string; amount: string | null; tx_id: string | null; screenshot_url: string | null; status: string; email: string | null; }

export function AdminBilling() {
  const qc = useQueryClient();
  const settings = useQuery({ queryKey: ["admin-settings"], queryFn: () => apiFetch<Settings>("/admin/settings") });
  const payments = useQuery({ queryKey: ["admin-payments"], queryFn: () => apiFetch<Pay[]>("/admin/payments") });

  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("");
  const [note, setNote] = useState("");
  const [methods, setMethods] = useState<Method[]>([]);
  const [pro, setPro] = useState<string[]>([]);
  const [cloud, setCloud] = useState("");
  const [key, setKey] = useState("");
  const [secret, setSecret] = useState("");
  const [folder, setFolder] = useState("");

  useEffect(() => {
    const d = settings.data;
    if (!d) return;
    setPrice(d.pro_price ?? ""); setCurrency(d.currency ?? ""); setNote(d.payment_note ?? "");
    setMethods(d.payment_methods ?? []); setPro(d.pro_features ?? []);
    setCloud(d.cloudinary_cloud_name ?? ""); setKey(d.cloudinary_api_key ?? ""); setFolder(d.cloudinary_folder ?? "");
  }, [settings.data]);

  const save = useMutation({
    mutationFn: () => {
      const body: Record<string, unknown> = {
        pro_price: price || null, currency: currency || null, payment_note: note || null,
        pro_features: pro,
        payment_methods: methods.filter((m) => m.name.trim() && m.value.trim()),
        cloudinary_cloud_name: cloud || null, cloudinary_api_key: key || null, cloudinary_folder: folder || null,
      };
      if (secret.trim()) body.cloudinary_api_secret = secret.trim();
      return apiFetch("/admin/settings", { method: "PATCH", body: JSON.stringify(body) });
    },
    onSuccess: () => { setSecret(""); qc.invalidateQueries({ queryKey: ["admin-settings"] }); },
  });

  const act = useMutation({
    mutationFn: (v: { id: string; action: "approve" | "reject" }) => apiFetch(`/admin/payments/${v.id}/${v.action}`, { method: "POST" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-payments"] }); qc.invalidateQueries({ queryKey: ["admin-users"] }); },
  });

  const togglePro = (k: string) => setPro((p) => (p.includes(k) ? p.filter((x) => x !== k) : [...p, k]));
  const setMethod = (i: number, field: "name" | "value", v: string) =>
    setMethods((ms) => ms.map((m, idx) => (idx === i ? { ...m, [field]: v } : m)));

  return (
    <>
      <div className="card">
        <h2 className="card-title">Pricing &amp; features</h2>
        <div className="stack gap-4 mt-4">
          <div className="form-grid">
            <div className="field"><label className="label">Pro price</label><input className="input" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="10" /></div>
            <div className="field"><label className="label">Currency</label><input className="input" value={currency} onChange={(e) => setCurrency(e.target.value)} placeholder="USD" /></div>
          </div>
          <div>
            <label className="label">Which features are Pro? (unticked = free for everyone)</label>
            <div className="stack gap-2 mt-2">
              {FEATURE_CATALOG.map((f) => (
                <label key={f.key} className="check-row">
                  <input type="checkbox" checked={pro.includes(f.key)} onChange={() => togglePro(f.key)} />
                  <span><strong>{f.label}</strong> — <span className="muted">{f.desc}</span></span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">Payment methods</h2>
        <p className="muted small">Add any method — name + address/number. Shown to users on the Upgrade page.</p>
        <div className="stack gap-3 mt-4">
          {methods.map((m, i) => (
            <div key={i} className="row gap-2 wrap">
              <input className="input" style={{ maxWidth: 180 }} placeholder="Name (e.g. USDT BEP-20)" value={m.name} onChange={(e) => setMethod(i, "name", e.target.value)} />
              <input className="input" style={{ flex: 1, minWidth: 200 }} placeholder="Address / number" value={m.value} onChange={(e) => setMethod(i, "value", e.target.value)} />
              <button className="btn btn-sm btn-danger" onClick={() => setMethods((ms) => ms.filter((_, idx) => idx !== i))}>Remove</button>
            </div>
          ))}
          <div><button className="btn btn-sm" onClick={() => setMethods((ms) => [...ms, { name: "", value: "" }])}>+ Add method</button></div>
          <div className="field"><label className="label">Payment note</label><textarea className="textarea" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Send exact amount, then submit TxID + screenshot." /></div>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">Storage (Cloudinary)</h2>
        <p className="muted small">Configure media uploads here — no server env needed. {settings.data?.cloudinary_configured ? "✓ Currently configured." : "Not configured yet."}</p>
        <div className="form-grid mt-4">
          <div className="field"><label className="label">Cloud name</label><input className="input" value={cloud} onChange={(e) => setCloud(e.target.value)} /></div>
          <div className="field"><label className="label">API key</label><input className="input" value={key} onChange={(e) => setKey(e.target.value)} /></div>
          <div className="field"><label className="label">API secret</label><input className="input" type="password" value={secret} onChange={(e) => setSecret(e.target.value)} placeholder={settings.data?.cloudinary_configured ? "•••••• (leave blank to keep)" : ""} /></div>
          <div className="field"><label className="label">Folder</label><input className="input" value={folder} onChange={(e) => setFolder(e.target.value)} placeholder="folio" /></div>
        </div>
      </div>

      <div><Button variant="accent" loading={save.isPending} onClick={() => save.mutate()}>{save.isSuccess ? "Saved ✓" : "Save all settings"}</Button></div>

      <div className="card">
        <h2 className="card-title">Payment requests</h2>
        <div className="table-wrap mt-4">
          <table className="tbl">
            <thead><tr><th>Email</th><th>Method</th><th>Amount</th><th>Tx ID</th><th>Proof</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {(payments.data ?? []).map((p) => (
                <tr key={p.id}>
                  <td>{p.email ?? "—"}</td><td>{p.method}</td><td>{p.amount ?? "—"}</td><td>{p.tx_id ?? "—"}</td>
                  <td>{p.screenshot_url ? <a href={p.screenshot_url} target="_blank" rel="noreferrer">View</a> : "—"}</td>
                  <td><span className={`badge ${p.status === "approved" ? "badge-published" : p.status === "rejected" ? "badge-error" : "badge-draft"}`}>{p.status}</span></td>
                  <td>{p.status === "pending" && (
                    <div className="row gap-2 wrap">
                      <button className="btn btn-sm btn-accent" disabled={act.isPending} onClick={() => act.mutate({ id: p.id, action: "approve" })}>Approve</button>
                      <button className="btn btn-sm btn-danger" disabled={act.isPending} onClick={() => act.mutate({ id: p.id, action: "reject" })}>Reject</button>
                    </div>
                  )}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
