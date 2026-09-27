"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { FEATURE_CATALOG } from "@/lib/features";
import { Button } from "@/components/ui/Button";
import { ImageUpload } from "@/components/ImageUpload";

interface Method { name: string; value: string; }
interface EmailAcct { name?: string; from: string; api_key: string; active?: boolean; }
interface CloudAcct { name?: string; cloud_name: string; api_key: string; api_secret: string; folder?: string; active?: boolean; }
interface Plan { key: string; name: string; highlight?: boolean; features?: string[]; periods?: Record<string, string>; }
interface Settings {
  pro_price: string | null; currency: string | null; pro_features: string[]; payment_note: string | null;
  payment_methods: Method[]; flags: Record<string, boolean>;
  email_enabled: boolean; email_accounts: EmailAcct[]; cloudinary_accounts: CloudAcct[];
  plan_limits: Record<string, Record<string, number>>;
  plans: Plan[];
  site_name: string | null; logo_url: string | null; favicon_url: string | null;
  google_site_verification: string | null; seo_keywords: string | null; seo_description: string | null; footer_text: string | null;
}

const LIMIT_ENTITIES = ["projects","gallery","skills","experience","education","services","certifications","achievements","testimonials","publications","videos","links"];
const DEFAULT_FREE: Record<string, number> = { projects: 6, gallery: 12, skills: 30, experience: 10, education: 8, services: 8, certifications: 15, achievements: 15, testimonials: 10, publications: 15, videos: 6, links: 12 };

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
  const [freeLimits, setFreeLimits] = useState<Record<string, number>>({});
  const [plans, setPlans] = useState<Plan[]>([]);
  const [brand, setBrand] = useState<Record<string, string>>({});
  const [testRes, setTestRes] = useState<{ ok: boolean; detail?: string; error?: string } | null>(null);

  useEffect(() => {
    const d = settings.data; if (!d) return;
    setPrice(d.pro_price ?? ""); setCurrency(d.currency ?? ""); setNote(d.payment_note ?? "");
    setMethods(d.payment_methods ?? []); setPro(d.pro_features ?? []); setFlags(d.flags ?? {});
    setEmailEnabled(d.email_enabled ?? true);
    setEmailAccounts(d.email_accounts ?? []); setCloudAccounts(d.cloudinary_accounts ?? []);
    setFreeLimits({ ...DEFAULT_FREE, ...(d.plan_limits?.free ?? {}) });
    setPlans(d.plans ?? []);
    setBrand({
      site_name: d.site_name ?? "", logo_url: d.logo_url ?? "", favicon_url: d.favicon_url ?? "",
      google_site_verification: d.google_site_verification ?? "", seo_keywords: d.seo_keywords ?? "",
      seo_description: d.seo_description ?? "", footer_text: d.footer_text ?? "",
    });
  }, [settings.data]);

  const save = useMutation({
    mutationFn: () => apiFetch("/admin/settings", { method: "PATCH", body: JSON.stringify({
      pro_price: price || null, currency: currency || null, payment_note: note || null, pro_features: pro,
      payment_methods: methods.filter((m) => m.name.trim() && m.value.trim()), flags,
      email_enabled: emailEnabled,
      email_accounts: emailAccounts.filter((a) => a.from?.trim() && a.api_key?.trim()),
      cloudinary_accounts: cloudAccounts.filter((a) => a.cloud_name?.trim() && a.api_key?.trim() && a.api_secret?.trim()),
      plan_limits: { free: freeLimits },
      plans: plans.filter((p) => p.key?.trim() && p.name?.trim()),
      site_name: brand.site_name || null, logo_url: brand.logo_url || null, favicon_url: brand.favicon_url || null,
      google_site_verification: brand.google_site_verification || null, seo_keywords: brand.seo_keywords || null,
      seo_description: brand.seo_description || null, footer_text: brand.footer_text || null,
    }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-settings"] }),
  });
  const test = useMutation({
    mutationFn: () => apiFetch<{ ok: boolean; detail?: string; error?: string }>("/admin/test-email", { method: "POST" }),
    onSuccess: (r) => setTestRes(r), onError: () => setTestRes({ ok: false, error: "Request failed." }),
  });

  const togglePro = (k: string) => setPro((p) => (p.includes(k) ? p.filter((x) => x !== k) : [...p, k]));
  const setPlan = (i: number, patch: Partial<Plan>) => setPlans((ps) => ps.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));
  const setPlanPeriod = (i: number, per: string, val: string) => setPlans((ps) => ps.map((p, idx) => (idx === i ? { ...p, periods: { ...(p.periods ?? {}), [per]: val } } : p)));
  const setB = (k: string, v: string) => setBrand((b) => ({ ...b, [k]: v }));
  const togglePlanFeature = (i: number, k: string) => setPlans((ps) => ps.map((p, idx) => { if (idx !== i) return p; const f = p.features ?? []; return { ...p, features: f.includes(k) ? f.filter((x) => x !== k) : [...f, k] }; }));
  const setMethod = (i: number, f: "name" | "value", v: string) => setMethods((ms) => ms.map((m, idx) => (idx === i ? { ...m, [f]: v } : m)));
  const setEA = (i: number, f: keyof EmailAcct, v: string | boolean) => setEmailAccounts((a) => a.map((x, idx) => (idx === i ? { ...x, [f]: v } : x)));
  const setCA = (i: number, f: keyof CloudAcct, v: string | boolean) => setCloudAccounts((a) => a.map((x, idx) => (idx === i ? { ...x, [f]: v } : x)));

  if (settings.isLoading) return <p className="muted">Loading settings…</p>;
  if (settings.isError) return <div className="alert alert-error">Couldn&apos;t load settings. Make sure the latest DB migrations are applied, then retry.</div>;

  return (
    <div className="stack gap-6">
      <div className="card">
        <h2 className="card-title">Site branding &amp; SEO</h2>
        <p className="muted small">Controls your site name, logo, favicon and how it appears on Google.</p>
        <div className="form-grid mt-4">
          <div className="field"><label className="label">Site name</label><input className="input" value={brand.site_name ?? ""} onChange={(e) => setB("site_name", e.target.value)} placeholder="Folio" /></div>
          <div className="field"><label className="label">SEO keywords</label><input className="input" value={brand.seo_keywords ?? ""} onChange={(e) => setB("seo_keywords", e.target.value)} placeholder="portfolio, resume, personal site" /></div>
        </div>
        <div className="field mt-3"><label className="label">SEO description</label><textarea className="textarea" value={brand.seo_description ?? ""} onChange={(e) => setB("seo_description", e.target.value)} placeholder="Short description shown in Google results." /></div>
        <div className="form-grid mt-3">
          <ImageUpload label="Logo" value={brand.logo_url ?? ""} onChange={(u) => setB("logo_url", u)} />
          <ImageUpload label="Favicon (square, e.g. 512×512)" value={brand.favicon_url ?? ""} onChange={(u) => setB("favicon_url", u)} />
        </div>
        <div className="form-grid mt-3">
          <div className="field"><label className="label">Google Search Console verification</label><input className="input" value={brand.google_site_verification ?? ""} onChange={(e) => setB("google_site_verification", e.target.value)} placeholder="content value of the meta tag" /></div>
          <div className="field"><label className="label">Footer text</label><input className="input" value={brand.footer_text ?? ""} onChange={(e) => setB("footer_text", e.target.value)} placeholder="© 2026 Folio" /></div>
        </div>
      </div>

      <div className="card">
        <div className="row between wrap gap-3">
          <h2 className="card-title">Plans (Pro / Max / …)</h2>
          <div className="field" style={{ maxWidth: 130 }}><label className="label">Currency</label><input className="input" value={currency} onChange={(e) => setCurrency(e.target.value)} placeholder="USD" /></div>
        </div>
        <p className="muted small">Define tiers, their monthly/yearly/lifetime prices, and which features they advertise. Any paid plan unlocks all premium features.</p>
        <div className="stack gap-4 mt-4">
          {plans.map((pl, i) => (
            <div key={i} className="card" style={{ background: "var(--surface-2, rgba(255,255,255,0.02))" }}>
              <div className="row gap-2 wrap">
                <input className="input" style={{ maxWidth: 110 }} placeholder="key (pro)" value={pl.key} onChange={(e) => setPlan(i, { key: e.target.value })} />
                <input className="input" style={{ maxWidth: 150 }} placeholder="Name (Pro)" value={pl.name} onChange={(e) => setPlan(i, { name: e.target.value })} />
                <label className="check-row"><input type="checkbox" checked={!!pl.highlight} onChange={(e) => setPlan(i, { highlight: e.target.checked })} /><span>Highlight</span></label>
                <button className="btn btn-sm btn-danger" onClick={() => setPlans((ps) => ps.filter((_, idx) => idx !== i))}>Remove</button>
              </div>
              <div className="form-grid mt-3">
                {["monthly", "yearly", "lifetime"].map((per) => (
                  <div key={per} className="field"><label className="label" style={{ textTransform: "capitalize" }}>{per} price</label>
                    <input className="input" value={pl.periods?.[per] ?? ""} onChange={(e) => setPlanPeriod(i, per, e.target.value)} placeholder="—" /></div>
                ))}
              </div>
              <div className="mt-3"><label className="label">Advertised features</label>
                <div className="stack gap-1 mt-2">{FEATURE_CATALOG.map((f) => (
                  <label key={f.key} className="check-row"><input type="checkbox" checked={(pl.features ?? []).includes(f.key)} onChange={() => togglePlanFeature(i, f.key)} /><span>{f.label}</span></label>
                ))}</div>
              </div>
            </div>
          ))}
          <div><button className="btn btn-sm" onClick={() => setPlans((ps) => [...ps, { key: "", name: "", features: [], periods: {} }])}>+ Add plan</button></div>
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
              <input className="input" style={{ flex: 1, minWidth: 150 }} placeholder="API secret" value={a.api_secret ?? ""} onChange={(e) => setCA(i, "api_secret", e.target.value)} />
              <label className="check-row"><input type="checkbox" checked={a.active !== false} onChange={(e) => setCA(i, "active", e.target.checked)} /><span>on</span></label>
              <button className="btn btn-sm btn-danger" onClick={() => setCloudAccounts((x) => x.filter((_, idx) => idx !== i))}>Remove</button>
            </div>
          ))}
          <div><button className="btn btn-sm" onClick={() => setCloudAccounts((x) => [...x, { name: "", cloud_name: "", api_key: "", api_secret: "", active: true }])}>+ Add Cloudinary account</button></div>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">Free plan limits</h2>
        <p className="muted small">Max items a Free user can add per section. Pro/Max are unlimited. Set 0 to block a section on Free.</p>
        <div className="form-grid mt-4">
          {LIMIT_ENTITIES.map((k) => (
            <div key={k} className="field">
              <label className="label" style={{ textTransform: "capitalize" }}>{k}</label>
              <input className="input" type="number" min={0} value={freeLimits[k] ?? DEFAULT_FREE[k]} onChange={(e) => setFreeLimits((p) => ({ ...p, [k]: Math.max(0, Number(e.target.value) || 0) }))} />
            </div>
          ))}
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
