"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, ApiError } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { ImageUpload } from "@/components/ImageUpload";

interface Method { name: string; value: string; }
interface Feature { key: string; label: string; desc: string; pro: boolean; has: boolean; }
interface Plan { key: string; name: string; features?: string[]; periods?: Record<string, string>; highlight?: boolean; }
interface Info {
  plan: string; is_pro: boolean; plan_expires_at: string | null; currency: string | null; payment_note: string | null;
  payment_methods: Method[]; features: Feature[]; plans: Plan[];
}
interface Payment { id: string; method: string; plan?: string; period?: string; amount: string | null; tx_id: string | null; status: string; }

const PERIODS = ["monthly", "yearly", "lifetime"] as const;

export default function BillingPage() {
  const qc = useQueryClient();
  const info = useQuery({ queryKey: ["billing-info"], queryFn: () => apiFetch<Info>("/billing/info"), refetchInterval: 8000, refetchOnWindowFocus: true });
  const mine = useQuery({ queryKey: ["billing-my"], queryFn: () => apiFetch<Payment[]>("/billing/my"), refetchInterval: 8000, refetchOnWindowFocus: true });

  const [period, setPeriod] = useState<string>("lifetime");
  const [planKey, setPlanKey] = useState<string>("");
  const [method, setMethod] = useState("");
  const [txId, setTxId] = useState("");
  const [shot, setShot] = useState("");

  const d = info.data;
  const availablePeriods = useMemo(() => PERIODS.filter((per) => (d?.plans ?? []).some((pl) => pl.periods?.[per])), [d?.plans]);
  useEffect(() => {
    if (availablePeriods.length && !availablePeriods.includes(period as typeof PERIODS[number])) setPeriod(availablePeriods[0]);
  }, [availablePeriods, period]);

  const featLabel = useMemo(() => {
    const m: Record<string, string> = {};
    d?.features.forEach((f) => { m[f.key] = f.label; });
    return m;
  }, [d?.features]);

  const selectedPlan = d?.plans.find((p) => p.key === planKey);
  const price = selectedPlan?.periods?.[period] ?? "";

  const submit = useMutation({
    mutationFn: () => apiFetch("/billing/submit", { method: "POST", body: JSON.stringify({ plan: planKey, period, method, amount: price, tx_id: txId, screenshot_url: shot }) }),
    onSuccess: () => { setTxId(""); setShot(""); setPlanKey(""); qc.invalidateQueries({ queryKey: ["billing-my"] }); },
  });
  const downgrade = useMutation({
    mutationFn: () => apiFetch("/billing/downgrade", { method: "POST" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["billing-info"] }); },
  });

  if (info.isLoading) return <p className="muted">Loading…</p>;
  if (info.isError || !d) return <div className="alert alert-error">Couldn&apos;t load billing.</div>;

  const submitErr = submit.error instanceof ApiError ? submit.error.message : null;
  const current = d.plan || "free";
  const plans = d.plans ?? [];
  const allKeys = d.features.map((f) => f.key);

  return (
    <div className="stack gap-6">
      <div><h1 className="page-title">Billing</h1><p className="muted">Your plan, features and upgrades.</p></div>

      <div className="card">
        <div className="row between wrap gap-3">
          <div>
            <h2 className="card-title">You&apos;re on {current === "free" ? "Free" : (plans.find((p) => p.key === current)?.name || current)}</h2>
            <p className="muted small mt-1">You can upgrade or switch plans below{current !== "free" ? ", or downgrade to Free" : ""}.</p>
            {current !== "free" && (
              d.plan_expires_at ? (() => {
                const ms = new Date(d.plan_expires_at).getTime() - Date.now();
                const days = Math.max(0, Math.ceil(ms / 86400000));
                return <p className="small mt-1" style={{ color: days <= 5 ? "#e0a458" : "var(--muted)" }}>⏳ Expires {new Date(d.plan_expires_at!).toLocaleDateString()} — {days} day{days === 1 ? "" : "s"} left</p>;
              })() : <p className="muted small mt-1">♾️ Lifetime — never expires</p>
            )}
          </div>
          <span className={`badge ${current !== "free" ? "badge-published" : ""}`}><span className="dot" />{current}</span>
        </div>
        {current !== "free" && (
          <div className="mt-4">
            <Button className="btn-sm" loading={downgrade.isPending} onClick={() => { if (confirm("Downgrade to the Free plan? Premium features will be locked.")) downgrade.mutate(); }}>Downgrade to Free</Button>
          </div>
        )}
      </div>

      {plans.length === 0 ? (
        <div className="card muted">No paid plans configured yet.</div>
      ) : (
        <>
          {availablePeriods.length > 1 && (
            <div className="row gap-2 wrap">
              {availablePeriods.map((p) => (
                <button key={p} className={`btn btn-sm ${period === p ? "btn-accent" : ""}`} onClick={() => setPeriod(p)} style={{ textTransform: "capitalize" }}>{p}</button>
              ))}
            </div>
          )}
          <div className="tpl-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
            {plans.map((pl) => {
              const pr = pl.periods?.[period];
              const isCurrent = pl.key === current;
              const active = planKey === pl.key;
              return (
                <div key={pl.key} className={`card ${pl.highlight ? "upgrade-hero" : ""}`} style={active ? { borderColor: "var(--iris)", boxShadow: "0 0 0 2px var(--iris) inset" } : undefined}>
                  <div className="row between"><h2 className="card-title">{pl.name}</h2>{isCurrent ? <span className="badge badge-published">Current</span> : pl.highlight && <span className="badge">Best</span>}</div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 30, marginTop: 6 }}>{pr ? `${d.currency || ""} ${pr}` : "—"}<span className="muted small"> /{period}</span></div>
                  <ul className="feat-list mt-4">
                    {allKeys.map((k) => (
                      <li key={k} className={(pl.features ?? []).includes(k) ? "" : "off"}><span className="feat-mark">{(pl.features ?? []).includes(k) ? "✓" : "✕"}</span><span>{featLabel[k] ?? k}</span></li>
                    ))}
                  </ul>
                  <div className="mt-4">
                    {isCurrent ? (
                      <Button disabled>Current plan</Button>
                    ) : (
                      <Button variant={active ? "accent" : undefined} disabled={!pr} onClick={() => setPlanKey(pl.key)}>{active ? "Selected ✓" : "Choose " + pl.name}</Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {selectedPlan && (
        <>
          <div className="card">
            <h2 className="card-title">How to pay — {selectedPlan.name} ({period}) · {d.currency || ""} {price}</h2>
            {d.payment_note && <p className="muted small mt-2">{d.payment_note}</p>}
            {d.payment_methods.length === 0 ? (
              <p className="muted mt-4">Payment methods aren&apos;t configured yet.</p>
            ) : (
              <div className="stack gap-3 mt-4">
                {d.payment_methods.map((m) => (
                  <div key={m.name} className="pay-method"><span className="pay-label">{m.name}</span><code className="pay-value">{m.value}</code><button className="btn btn-sm" onClick={() => navigator.clipboard?.writeText(m.value)}>Copy</button></div>
                ))}
              </div>
            )}
          </div>
          {d.payment_methods.length > 0 && (
            <div className="card">
              <h2 className="card-title">Submit your payment</h2>
              <p className="muted small">After paying, send the details. Admin verifies and switches your plan.</p>
              <div className="stack gap-4 mt-4">
                {submitErr && <div className="alert alert-error">{submitErr}</div>}
                {submit.isSuccess && <div className="alert alert-ok">Submitted — pending admin review.</div>}
                <div className="field"><label className="label">Method</label>
                  <select className="input" value={method} onChange={(e) => setMethod(e.target.value)}>
                    <option value="">Select…</option>
                    {d.payment_methods.map((m) => <option key={m.name} value={m.name}>{m.name}</option>)}
                  </select></div>
                <div className="field"><label className="label">Transaction ID (optional)</label><input className="input" value={txId} onChange={(e) => setTxId(e.target.value)} placeholder="TxID / TrxID" /></div>
                <ImageUpload label="Payment screenshot (optional)" value={shot} onChange={setShot} />
                <div><Button variant="accent" loading={submit.isPending} disabled={!method || submit.isPending} onClick={() => submit.mutate()}>Submit for review</Button></div>
              </div>
            </div>
          )}
        </>
      )}

      <div className="card">
        <h2 className="card-title">Your features</h2>
        <ul className="feat-list mt-4">{d.features.map((f) => (
          <li key={f.key}><span className="feat-mark">{f.has ? "✓" : "🔒"}</span><span><strong>{f.label}</strong> <span className="muted small">— {f.desc}</span></span></li>
        ))}</ul>
      </div>

      {(mine.data ?? []).length > 0 && (
        <div className="card">
          <h2 className="card-title">Your submissions</h2>
          <div className="table-wrap mt-4"><table className="tbl">
            <thead><tr><th>Plan</th><th>Period</th><th>Amount</th><th>Tx ID</th><th>Status</th></tr></thead>
            <tbody>{(mine.data ?? []).map((p) => (
              <tr key={p.id}><td>{p.plan ?? "—"}</td><td>{p.period ?? "—"}</td><td>{p.amount ?? "—"}</td><td>{p.tx_id ?? "—"}</td>
                <td><span className={`badge ${p.status === "approved" ? "badge-published" : p.status === "rejected" ? "badge-error" : "badge-draft"}`}>{p.status}</span></td></tr>
            ))}</tbody>
          </table></div>
        </div>
      )}
    </div>
  );
}
