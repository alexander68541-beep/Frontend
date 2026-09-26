"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

interface R { id: string; username: string | null; reason: string; detail: string | null; status: string; created_at: string | null; }

export function AdminReports() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["admin-reports"], queryFn: () => apiFetch<R[]>("/admin/reports"), refetchInterval: 15000, refetchOnWindowFocus: true });
  const resolve = useMutation({
    mutationFn: (v: { id: string; action: "suspend" | "dismiss" }) => apiFetch(`/admin/reports/${v.id}/resolve?action=${v.action}`, { method: "POST" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-reports"] }); qc.invalidateQueries({ queryKey: ["admin-portfolios"] }); },
  });
  return (
    <div className="card">
      <h2 className="card-title">Reports</h2>
      <div className="table-wrap mt-4">
        <table className="tbl">
          <thead><tr><th>When</th><th>Portfolio</th><th>Reason</th><th>Detail</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {(q.data ?? []).map((r) => (
              <tr key={r.id}>
                <td className="muted small">{r.created_at ? new Date(r.created_at).toLocaleDateString() : "—"}</td>
                <td>{r.username ?? "—"}</td>
                <td><span className="badge badge-draft">{r.reason}</span></td>
                <td className="muted small">{r.detail ?? ""}</td>
                <td><span className={`badge ${r.status === "actioned" ? "badge-error" : r.status === "dismissed" ? "badge-published" : "badge-draft"}`}>{r.status}</span></td>
                <td>{r.status === "pending" && (
                  <div className="row gap-2 wrap">
                    <button className="btn btn-sm btn-danger" disabled={resolve.isPending} onClick={() => resolve.mutate({ id: r.id, action: "suspend" })}>Suspend</button>
                    <button className="btn btn-sm" disabled={resolve.isPending} onClick={() => resolve.mutate({ id: r.id, action: "dismiss" })}>Dismiss</button>
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
