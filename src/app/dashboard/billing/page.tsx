"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, ApiError } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { ImageUpload } from "@/components/ImageUpload";

interface Method { name: string; value: string; }
interface Feature { key: string; label: string; desc: string; pro: boolean; has: boolean; }
interface Info {
  plan: string; is_pro: boolean; pro_price: string | null; currency: string | null; payment_note: string | null;
  payment_methods: Method[]; features: Feature[];
}
interface Payment { id: string; method: string; amount: string | null; tx_id: string | null; status: string; }

export default function BillingPage() {
  const qc = useQueryClient();
  const info = useQuery({ queryKey: ["billing-info"], queryFn: () => apiFetch<Info>("/billing/info") });
  const mine = useQuery({ queryKey: ["billing-my"], queryFn: () => apiFetch<Payment[]>("/billing/my") });

  const [method, setMethod] = useState("");
  const [amount, setAmount] = useState("");
  const [txId, setTxId] = useState("");
  const [shot, setShot] = useState("");

  const submit = useMutation({
    mutationFn: () => apiFetch("/billing/submit", { method: "POST", body: JSON.stringify({ method, amount, tx_id: txId, screenshot_url: shot }) }),
    onSuccess: () => { setAmount(""); setTxId(""); setShot(""); qc.invalidateQueries({ queryKey: ["billing-my"] }); },
  });

  if (info.isLoading) return <p className="muted">Loading…</p>;
  if (info.isError || !info.data) return <div className="alert alert-error">Couldn&apos;t load billing.</div>;

  const d = info.data;
  const proFeatures = d.features.filter((f) => f.pro);
  const submitErr = submit.error instanceof ApiError ? submit.error.message : null;

  const FeatureList = () => (
    <ul className="feat-list">
      {d.features.map((f) => (
        <li key={f.key} className={f.pro ? "" : "is-free"}>
          <span className="feat-mark">{f.has ? "✓" : "🔒"}</span>
          <span><strong>{f.label}</strong> <span className="muted small">— {f.desc}</span></span>
          <span className={`badge ${f.pro ? "badge-draft" : "badge-published"}`}>{f.pro ? "Pro" : "Free"}</span>
        </li>
      ))}
    </ul>
  );

  if (d.is_pro) {
    return (
      <div className="stack gap-6">
        <div><h1 className="page-title">Billing</h1><p className="muted">Your plan and features.</p></div>
        <div className="card"><div className="row between"><h2 className="card-title">You&apos;re on Pro 🎉</h2><span className="badge badge-published"><span className="dot" />Pro</span></div>
          <p className="muted small mt-2">All pro features are unlocked.</p></div>
        <div className="card"><h2 className="card-title">Your features</h2><div className="mt-4"><FeatureList /></div></div>
      </div>
    );
  }

  return (
    <div className="stack gap-6">
      <div><h1 className="page-title">Upgrade to Pro</h1><p className="muted">Unlock premium features.</p></div>

      <div className="card upgrade-hero">
        <div className="row between wrap gap-3">
          <div><h2 className="card-title">Pro plan</h2><p className="muted small">Set by admin.</p></div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 32 }}>{d.pro_price ? `${d.currency || ""} ${d.pro_price}` : "—"}</div>
        </div>
        <div className="mt-4"><FeatureList /></div>
        {proFeatures.length === 0 && <p className="muted small mt-2">No pro features configured yet.</p>}
      </div>

      <div className="card">
        <h2 className="card-title">How to pay</h2>
        {d.payment_note && <p className="muted small mt-2">{d.payment_note}</p>}
        {d.payment_methods.length === 0 ? (
          <p className="muted mt-4">Payment methods aren&apos;t configured yet. Please check back soon.</p>
        ) : (
          <div className="stack gap-3 mt-4">
            {d.payment_methods.map((m) => (
              <div key={m.name} className="pay-method">
                <span className="pay-label">{m.name}</span>
                <code className="pay-value">{m.value}</code>
                <button className="btn btn-sm" onClick={() => navigator.clipboard?.writeText(m.value)}>Copy</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {d.payment_methods.length > 0 && (
        <div className="card">
          <h2 className="card-title">Submit your payment</h2>
          <p className="muted small">After paying, send the details. Admin verifies and upgrades you.</p>
          <div className="stack gap-4 mt-4">
            {submitErr && <div className="alert alert-error">{submitErr}</div>}
            {submit.isSuccess && <div className="alert alert-ok">Submitted — pending admin review.</div>}
            <div className="form-grid">
              <div className="field"><label className="label">Method</label>
                <select className="input" value={method} onChange={(e) => setMethod(e.target.value)}>
                  <option value="">Select…</option>
                  {d.payment_methods.map((m) => <option key={m.name} value={m.name}>{m.name}</option>)}
                </select></div>
              <div className="field"><label className="label">Amount</label><input className="input" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="10" /></div>
            </div>
            <div className="field"><label className="label">Transaction ID</label><input className="input" value={txId} onChange={(e) => setTxId(e.target.value)} placeholder="TxID / TrxID" /></div>
            <ImageUpload label="Payment screenshot" value={shot} onChange={setShot} />
            <div><Button variant="accent" loading={submit.isPending} disabled={!method} onClick={() => submit.mutate()}>Submit for review</Button></div>
          </div>
        </div>
      )}

      {(mine.data ?? []).length > 0 && (
        <div className="card">
          <h2 className="card-title">Your submissions</h2>
          <div className="table-wrap mt-4"><table className="tbl">
            <thead><tr><th>Method</th><th>Amount</th><th>Tx ID</th><th>Status</th></tr></thead>
            <tbody>{(mine.data ?? []).map((p) => (
              <tr key={p.id}><td>{p.method}</td><td>{p.amount ?? "—"}</td><td>{p.tx_id ?? "—"}</td>
                <td><span className={`badge ${p.status === "approved" ? "badge-published" : p.status === "rejected" ? "badge-error" : "badge-draft"}`}>{p.status}</span></td></tr>
            ))}</tbody>
          </table></div>
        </div>
      )}
    </div>
  );
}
