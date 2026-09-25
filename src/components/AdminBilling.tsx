"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/Button";

interface Settings {
  pro_price: string | null; currency: string | null; pro_features: string[];
  bep20_address: string | null; nagad_number: string | null; bkash_number: string | null; payment_note: string | null;
}
interface Pay { id: string; method: string; amount: string | null; tx_id: string | null; screenshot_url: string | null; status: string; email: string | null; }

export function AdminBilling() {
  const qc = useQueryClient();
  const settings = useQuery({ queryKey: ["admin-settings"], queryFn: () => apiFetch<Settings>("/admin/settings") });
  const payments = useQuery({ queryKey: ["admin-payments"], queryFn: () => apiFetch<Pay[]>("/admin/payments") });

  const [f, setF] = useState<Record<string, string>>({});
  useEffect(() => {
    if (settings.data) {
      setF({
        pro_price: settings.data.pro_price ?? "",
        currency: settings.data.currency ?? "",
        pro_features: (settings.data.pro_features ?? []).join(", "),
        bep20_address: settings.data.bep20_address ?? "",
        nagad_number: settings.data.nagad_number ?? "",
        bkash_number: settings.data.bkash_number ?? "",
        payment_note: settings.data.payment_note ?? "",
      });
    }
  }, [settings.data]);

  const save = useMutation({
    mutationFn: () =>
      apiFetch("/admin/settings", {
        method: "PATCH",
        body: JSON.stringify({
          pro_price: f.pro_price || null,
          currency: f.currency || null,
          pro_features: (f.pro_features || "").split(",").map((s) => s.trim()).filter(Boolean),
          bep20_address: f.bep20_address || null,
          nagad_number: f.nagad_number || null,
          bkash_number: f.bkash_number || null,
          payment_note: f.payment_note || null,
        }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-settings"] }),
  });

  const act = useMutation({
    mutationFn: (v: { id: string; action: "approve" | "reject" }) =>
      apiFetch(`/admin/payments/${v.id}/${v.action}`, { method: "POST" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-payments"] }); qc.invalidateQueries({ queryKey: ["admin-users"] }); },
  });

  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));

  return (
    <>
      <div className="card">
        <h2 className="card-title">Billing settings</h2>
        <p className="muted small">Price, pro features and manual payment details shown to users.</p>
        <div className="stack gap-4 mt-4">
          <div className="form-grid">
            <div className="field"><label className="label">Pro price</label><input className="input" value={f.pro_price ?? ""} onChange={(e) => set("pro_price", e.target.value)} placeholder="10" /></div>
            <div className="field"><label className="label">Currency</label><input className="input" value={f.currency ?? ""} onChange={(e) => set("currency", e.target.value)} placeholder="USD" /></div>
          </div>
          <div className="field"><label className="label">Pro features (comma separated)</label><input className="input" value={f.pro_features ?? ""} onChange={(e) => set("pro_features", e.target.value)} placeholder="Premium templates, Custom accent, Priority support" /></div>
          <div className="form-grid">
            <div className="field"><label className="label">USDT BEP-20 address</label><input className="input" value={f.bep20_address ?? ""} onChange={(e) => set("bep20_address", e.target.value)} placeholder="0x…" /></div>
            <div className="field"><label className="label">Nagad number</label><input className="input" value={f.nagad_number ?? ""} onChange={(e) => set("nagad_number", e.target.value)} placeholder="01…" /></div>
            <div className="field"><label className="label">bKash number</label><input className="input" value={f.bkash_number ?? ""} onChange={(e) => set("bkash_number", e.target.value)} placeholder="01…" /></div>
          </div>
          <div className="field"><label className="label">Payment note</label><textarea className="textarea" value={f.payment_note ?? ""} onChange={(e) => set("payment_note", e.target.value)} placeholder="Send exact amount, then submit TxID + screenshot." /></div>
          <div><Button variant="accent" loading={save.isPending} onClick={() => save.mutate()}>Save settings</Button></div>
        </div>
      </div>

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
                  <td>
                    {p.status === "pending" && (
                      <div className="row gap-2 wrap">
                        <button className="btn btn-sm btn-accent" disabled={act.isPending} onClick={() => act.mutate({ id: p.id, action: "approve" })}>Approve</button>
                        <button className="btn btn-sm btn-danger" disabled={act.isPending} onClick={() => act.mutate({ id: p.id, action: "reject" })}>Reject</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
