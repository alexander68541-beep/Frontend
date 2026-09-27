"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { FEATURE_CATALOG } from "@/lib/features";
import { Button } from "@/components/ui/Button";

interface Method { name: string; value: string; }
interface EmailAcct { name?: string; from: string; api_key: string; active?: boolean; }
interface CloudAcct { name?: string; cloud_name: string; api_key: string; api_secret: string; folder?: string; active?: boolean; }
interface Settings {
  pro_price: string | null; currency: string | null; pro_features: string[]; payment_note: string | null;
  payment_methods: Method[]; flags: Record<string, boolean>;
  email_enabled: boolean; email_accounts: EmailAcct[]; cloudinary_accounts: CloudAcct[];
}

const FLAGS = [
  { key: "enable_registration", label: "Allow new sign-ups" },
  { key: "enable_public_portfolios", label: "Public portfolios enabled" },
  { key: "enable_contact", label: "Contact form enabled" },
];

export function AdminSettings() {
  const qc = useQueryClient();
  const settings = useQuery({ queryKey: ["admin-settings"], queryFn: () => apiFetch<Settings>("/admin/settings") });

  const [price, setPrice] = useState(""); const [currency, setCurrency] = useState(""); const [note, setNote] = useState("");
  const [methods, setMethods] = useState<Method[]>([]); const [pro, setPro] = useState<string[]>([]);
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [emailAccounts, setEmailAccounts] = useState<EmailAcct[]>([]);
  const [cloudAccounts, setCloudAccounts] = useState<CloudAcct[]>([]);
  const [testRes, setTestRes] = useState<{ ok: boolean; detail?: string; error?: string } | null>(null);

  useEffect(() => {
    const d = settings.data; if (!d) return;
    setPrice(d.pro_price ?? ""); setCurrency(d.currency ?? ""); setNote(d.payment_note ?? "");
    setMethods(d.payment_methods ?? []); setPro(d.pro_features ?? []); setFlags(d.flags ?? {});
    setEmailEnabled(d.email_enabled ?? true);
    setEmailAccounts(d.email_accounts ?? []); setCloudAccounts(d.cloudinary_accounts ?? []);
  }, [settings.data]);

  const save = useMutation({
    mutationFn: () => apiFetch("/admin/settings", { method: "PATCH", body: JSON.stringify({
      pro_price: price || null, currency: currency || null, payment_note: note || null, pro_features: pro,
      payment_methods: methods.filter((m) => m.name.trim() && m.value.trim()), flags,
      email_enabled: emailEnabled,
      email_accounts: emailAccounts.filter((a) => a.from?.trim() && a.api_key?.trim()),
      cloudinary_accounts: cloudAccounts.filter((a) => a.cloud_name?.trim() && a.api_key?.trim() && a.api_secret?.trim()),
    }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-settings"] }),
  });
  const test = useMutation({
    mutationFn: () => apiFetch<{ ok: boolean; detail?: string; error?: string }>("/admin/test-email", { method: "POST" }),
    onSuccess: (r) => setTestRes(r), onError: () => setTestRes({ ok: false, error: "Request failed." }),
  });

  const togglePro = (k: string) => setPro((p) => (p.includes(k) ? p.filter((x) => x !== k) : [...p, k]));
  const setMethod = (i: number, f: "name" | "value", v: string) => setMethods((ms) => ms.map((m, idx) => (idx === i ? { ...m, [f]: v } : m)));
  const setEA = (i: number, f: keyof EmailAcct, v: string | boolean) => setEmailAccounts((a) => a.map((x, idx) => (idx === i ? { ...x, [f]: v } : x)));
  const setCA = (i: number, f: keyof CloudAcct, v: string | boolean) => setCloudAccounts((a) => a.map((x, idx) => (idx === i ? { ...x, [f]: v } : x)));

  return (
    <div className="stack gap-6">
      <div className="card">
        <h2 className="card-title">Pricing &amp; features</h2>
        <div className="stack gap-4 mt-4">
          <div className="form-grid">
            <div className="field"><label className="label">Pro price</label><input className="input" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="10" /></div>
            <div className="field"><label className="label">Currency</label><input className="input" value={currency} onChange={(e) => setCurrency(e.target.value)} placeholder="USD" /></div>
          </div>
          <div><label className="label">Which features are Pro?</label>
            <div className="stack gap-2 mt-2">{FEATURE_CATALOG.map((f) => (
              <label key={f.key} className="check-row"><input type="checkbox" checked={pro.includes(f.key)} onChange={() => togglePro(f.key)} /><span><strong>{f.label}</strong> — <span className="muted">{f.desc}</span></span></label>
            ))}</div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">Payment methods</h2>
        <div className="stack gap-3 mt-4">
          {methods.map((m, i) => (
            <div key={i} className="row gap-2 wrap">
              <input className="input" style={{ maxWidth: 180 }} placeholder="Name" value={m.name} onChange={(e) => setMethod(i, "name", e.target.value)} />
              <input className="input" style={{ flex: 1, minWidth: 200 }} placeholder="Address / number" value={m.value} onChange={(e) => setMethod(i, "value", e.target.value)} />
              <button className="btn btn-sm btn-danger" onClick={() => setMethods((ms) => ms.filter((_, idx) => idx !== i))}>Remove</button>
            </div>
          ))}
          <div><button className="btn btn-sm" onClick={() => setMethods((ms) => [...ms, { name: "", value: "" }])}>+ Add method</button></div>
          <div className="field"><label className="label">Payment note</label><textarea className="textarea" value={note} onChange={(e) => setNote(e.target.value)} /></div>
        </div>
      </div>

      <div className="card">
        <div className="row between wrap gap-3">
          <h2 className="card-title">Email accounts (Resend)</h2>
          <label className="check-row"><input type="checkbox" checked={emailEnabled} onChange={(e) => setEmailEnabled(e.target.checked)} /><span>Email enabled</span></label>
        </div>
        <p className="muted small">Add one or more sender accounts — tried in order (fallback) until one sends. From must be a Resend-verified domain.</p>
        <div className="stack gap-3 mt-4">
          {emailAccounts.map((a, i) => (
            <div key={i} className="row gap-2 wrap">
              <input className="input" style={{ maxWidth: 130 }} placeholder="Label" value={a.name ?? ""} onChange={(e) => setEA(i, "name", e.target.value)} />
              <input className="input" style={{ minWidth: 180 }} placeholder="From (noreply@domain.com)" value={a.from ?? ""} onChange={(e) => setEA(i, "from", e.target.value)} />
              <input className="input" style={{ flex: 1, minWidth: 160 }} type="password" placeholder="Resend API key (re_...)" value={a.api_key ?? ""} onChange={(e) => setEA(i, "api_key", e.target.value)} />
              <label className="check-row"><input type="checkbox" checked={a.active !== false} onChange={(e) => setEA(i, "active", e.target.checked)} /><span>on</span></label>
              <button className="btn btn-sm btn-danger" onClick={() => setEmailAccounts((x) => x.filter((_, idx) => idx !== i))}>Remove</button>
            </div>
          ))}
          <div className="row gap-3 wrap">
            <button className="btn btn-sm" onClick={() => setEmailAccounts((x) => [...x, { name: "", from: "", api_key: "", active: true }])}>+ Add email account</button>
            <Button className="btn-sm" loading={test.isPending} onClick={() => { setTestRes(null); test.mutate(); }}>Send test email</Button>
          </div>
          {testRes && <div className={`alert ${testRes.ok ? "alert-ok" : "alert-error"}`}>{testRes.ok ? "Sent ✓ — check inbox/spam." : (testRes.error || `Failed: ${testRes.detail}`)}</div>}
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">Cloudinary accounts (storage)</h2>
        <p className="muted small">Add one or more — uploads try them in order (fallback A→B→C).</p>
        <div className="stack gap-3 mt-4">
          {cloudAccounts.map((a, i) => (
            <div key={i} className="row gap-2 wrap">
              <input className="input" style={{ maxWidth: 110 }} placeholder="Label" value={a.name ?? ""} onChange={(e) => setCA(i, "name", e.target.value)} />
              <input className="input" style={{ maxWidth: 150 }} placeholder="Cloud name" value={a.cloud_name ?? ""} onChange={(e) => setCA(i, "cloud_name", e.target.value)} />
              <input className="input" style={{ maxWidth: 150 }} placeholder="API key" value={a.api_key ?? ""} onChange={(e) => setCA(i, "api_key", e.target.value)} />
              <input className="input" style={{ flex: 1, minWidth: 150 }} type="password" placeholder="API secret" value={a.api_secret ?? ""} onChange={(e) => setCA(i, "api_secret", e.target.value)} />
              <label className="check-row"><input type="checkbox" checked={a.active !== false} onChange={(e) => setCA(i, "active", e.target.checked)} /><span>on</span></label>
              <button className="btn btn-sm btn-danger" onClick={() => setCloudAccounts((x) => x.filter((_, idx) => idx !== i))}>Remove</button>
            </div>
          ))}
          <div><button className="btn btn-sm" onClick={() => setCloudAccounts((x) => [...x, { name: "", cloud_name: "", api_key: "", api_secret: "", active: true }])}>+ Add Cloudinary account</button></div>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">Feature flags</h2>
        <div className="stack gap-2 mt-4">{FLAGS.map((f) => (
          <label key={f.key} className="check-row"><input type="checkbox" checked={flags[f.key] !== false} onChange={(e) => setFlags((p) => ({ ...p, [f.key]: e.target.checked }))} /><span>{f.label}</span></label>
        ))}</div>
      </div>

      <div><Button variant="accent" loading={save.isPending} onClick={() => save.mutate()}>{save.isSuccess ? "Saved ✓" : "Save all settings"}</Button></div>
    </div>
  );
}
