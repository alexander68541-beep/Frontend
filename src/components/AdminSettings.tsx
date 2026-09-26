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
  cloudinary_cloud_name: string | null; cloudinary_api_key: string | null; cloudinary_folder: string | null; cloudinary_configured: boolean;
  email_from: string | null; email_configured: boolean;
  flags: Record<string, boolean>;
}

export function AdminSettings() {
  const qc = useQueryClient();
  const settings = useQuery({ queryKey: ["admin-settings"], queryFn: () => apiFetch<Settings>("/admin/settings") });

  const [price, setPrice] = useState(""); const [currency, setCurrency] = useState(""); const [note, setNote] = useState("");
  const [methods, setMethods] = useState<Method[]>([]); const [pro, setPro] = useState<string[]>([]);
  const [cloud, setCloud] = useState(""); const [key, setKey] = useState(""); const [secret, setSecret] = useState(""); const [folder, setFolder] = useState("");
  const [emailFrom, setEmailFrom] = useState(""); const [resendKey, setResendKey] = useState("");
  const [flags, setFlags] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const d = settings.data; if (!d) return;
    setPrice(d.pro_price ?? ""); setCurrency(d.currency ?? ""); setNote(d.payment_note ?? "");
    setMethods(d.payment_methods ?? []); setPro(d.pro_features ?? []);
    setCloud(d.cloudinary_cloud_name ?? ""); setKey(d.cloudinary_api_key ?? ""); setFolder(d.cloudinary_folder ?? "");
    setEmailFrom(d.email_from ?? "");
    setFlags(d.flags ?? {});
  }, [settings.data]);

  const save = useMutation({
    mutationFn: () => {
      const body: Record<string, unknown> = {
        pro_price: price || null, currency: currency || null, payment_note: note || null, pro_features: pro,
        payment_methods: methods.filter((m) => m.name.trim() && m.value.trim()),
        cloudinary_cloud_name: cloud || null, cloudinary_api_key: key || null, cloudinary_folder: folder || null,
      };
      if (secret.trim()) body.cloudinary_api_secret = secret.trim();
      body.email_from = emailFrom || null;
      body.flags = flags;
      if (resendKey.trim()) body.resend_api_key = resendKey.trim();
      return apiFetch("/admin/settings", { method: "PATCH", body: JSON.stringify(body) });
    },
    onSuccess: () => { setSecret(""); setResendKey(""); qc.invalidateQueries({ queryKey: ["admin-settings"] }); },
  });

  const [testRes, setTestRes] = useState<{ ok: boolean; detail?: string; error?: string } | null>(null);
  const testEmail = useMutation({
    mutationFn: () => apiFetch<{ ok: boolean; detail?: string; error?: string }>("/admin/test-email", { method: "POST" }),
    onSuccess: (r) => setTestRes(r),
    onError: () => setTestRes({ ok: false, error: "Request failed." }),
  });

  const togglePro = (k: string) => setPro((p) => (p.includes(k) ? p.filter((x) => x !== k) : [...p, k]));
  const setMethod = (i: number, f: "name" | "value", v: string) => setMethods((ms) => ms.map((m, idx) => (idx === i ? { ...m, [f]: v } : m)));

  return (
    <div className="stack gap-6">
      <div className="card">
        <h2 className="card-title">Pricing &amp; features</h2>
        <div className="stack gap-4 mt-4">
          <div className="form-grid">
            <div className="field"><label className="label">Pro price</label><input className="input" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="10" /></div>
            <div className="field"><label className="label">Currency</label><input className="input" value={currency} onChange={(e) => setCurrency(e.target.value)} placeholder="USD" /></div>
          </div>
          <div>
            <label className="label">Which features are Pro? (unticked = free)</label>
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
        <p className="muted small">Name + address/number. Nothing is hardcoded.</p>
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
        <h2 className="card-title">Storage (Cloudinary)</h2>
        <p className="muted small">{settings.data?.cloudinary_configured ? "✓ Configured." : "Not configured — media uploads disabled until set."}</p>
        <div className="form-grid mt-4">
          <div className="field"><label className="label">Cloud name</label><input className="input" value={cloud} onChange={(e) => setCloud(e.target.value)} /></div>
          <div className="field"><label className="label">API key</label><input className="input" value={key} onChange={(e) => setKey(e.target.value)} /></div>
          <div className="field"><label className="label">API secret</label><input className="input" type="password" value={secret} onChange={(e) => setSecret(e.target.value)} placeholder={settings.data?.cloudinary_configured ? "•••• (blank = keep)" : ""} /></div>
          <div className="field"><label className="label">Folder</label><input className="input" value={folder} onChange={(e) => setFolder(e.target.value)} placeholder="folio" /></div>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">Feature flags</h2>
        <p className="muted small">Turn platform features on/off. Unticked = disabled.</p>
        <div className="stack gap-2 mt-4">
          {[
            { key: "enable_registration", label: "Allow new sign-ups" },
            { key: "enable_public_portfolios", label: "Public portfolios enabled" },
            { key: "enable_contact", label: "Contact form enabled" },
          ].map((f) => (
            <label key={f.key} className="check-row">
              <input type="checkbox" checked={flags[f.key] !== false} onChange={(e) => setFlags((p) => ({ ...p, [f.key]: e.target.checked }))} />
              <span>{f.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">Email (Resend)</h2>
        <p className="muted small">Transactional email for contact messages & billing. {settings.data?.email_configured ? "✓ Configured." : "Not configured."}</p>
        <div className="form-grid mt-4">
          <div className="field"><label className="label">From address</label><input className="input" value={emailFrom} onChange={(e) => setEmailFrom(e.target.value)} placeholder="noreply@yourdomain.com" /></div>
          <div className="field"><label className="label">Resend API key</label><input className="input" type="password" value={resendKey} onChange={(e) => setResendKey(e.target.value)} placeholder={settings.data?.email_configured ? "•••• (blank = keep)" : "re_..."} /></div>
        </div>
        <p className="muted small mt-4">Save first, then test. The From address must be on a domain verified in Resend.</p>
        <div className="row gap-3 mt-2 wrap">
          <Button className="btn-sm" loading={testEmail.isPending} onClick={() => { setTestRes(null); testEmail.mutate(); }}>Send test email</Button>
        </div>
        {testRes && (
          <div className={`alert mt-4 ${testRes.ok ? "alert-ok" : "alert-error"}`}>
            {testRes.ok ? "Sent ✓ — check your inbox (and spam)." : (testRes.error || `Failed: ${testRes.detail}`)}
          </div>
        )}
      </div>

      <div><Button variant="accent" loading={save.isPending} onClick={() => save.mutate()}>{save.isSuccess ? "Saved ✓" : "Save all settings"}</Button></div>
    </div>
  );
}
