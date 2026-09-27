"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

interface Pay { id: string; method: string; amount: string | null; tx_id: string | null; screenshot_url: string | null; status: string; email: string | null; }

export function AdminPayments() {
  const qc = useQueryClient();
  const payments = useQuery({
    queryKey: ["admin-payments"],
    queryFn: () => apiFetch<Pay[]>("/admin/payments"),
    refetchInterval: 8000,
    refetchOnWindowFocus: true,
  });
  const act = useMutation({
    mutationFn: (v: { id: string; action: "approve" | "reject" }) => apiFetch(`/admin/payments/${v.id}/${v.action}`, { method: "POST" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-payments"] }); qc.invalidateQueries({ queryKey: ["admin-users"] }); qc.invalidateQueries({ queryKey: ["admin-stats"] }); },
  });

  const pending = (payments.data ?? []).filter((p) => p.status === "pending").length;

  return (
    <div className="card">
      <div className="row between">
        <h2 className="card-title">Payment requests</h2>
        {pending > 0 && <span className="badge badge-draft">{pending} pending</span>}
      </div>
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
  );
}
