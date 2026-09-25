"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch, ApiError } from "@/lib/api";
import { useAccount } from "@/lib/hooks";

interface Stats { users: number; portfolios: number; published: number; }
interface Row { id: string; username: string | null; status: string; template: string; email: string | null; created_at: string | null; }

export default function AdminPage() {
  const account = useAccount();
  const isAdmin = account.data?.role === "admin";

  const stats = useQuery({ queryKey: ["admin-stats"], queryFn: () => apiFetch<Stats>("/admin/stats"), enabled: isAdmin });
  const rows = useQuery({ queryKey: ["admin-portfolios"], queryFn: () => apiFetch<Row[]>("/admin/portfolios"), enabled: isAdmin });

  if (account.isLoading) return <p className="muted">Loading…</p>;
  if (!isAdmin) return <div className="alert alert-error">Admins only.</div>;

  const err = (stats.error instanceof ApiError && stats.error.message) || (rows.error instanceof ApiError && rows.error.message) || null;

  return (
    <div className="stack gap-6">
      <div>
        <h1 className="page-title">Admin</h1>
        <p className="muted">Platform overview and all portfolios.</p>
      </div>
      {err && <div className="alert alert-error">{err}</div>}

      <div className="stat-row">
        <div className="stat-card"><span className="stat-label">Users</span><span className="stat-value">{stats.data?.users ?? "—"}</span></div>
        <div className="stat-card"><span className="stat-label">Portfolios</span><span className="stat-value">{stats.data?.portfolios ?? "—"}</span></div>
        <div className="stat-card"><span className="stat-label">Published</span><span className="stat-value">{stats.data?.published ?? "—"}</span></div>
      </div>

      <div className="card">
        <h2 className="card-title">Portfolios</h2>
        {rows.isLoading ? (
          <p className="muted">Loading…</p>
        ) : (
          <div className="table-wrap mt-4">
            <table className="tbl">
              <thead><tr><th>Email</th><th>Username</th><th>Status</th><th>Template</th></tr></thead>
              <tbody>
                {(rows.data ?? []).map((r) => (
                  <tr key={r.id}>
                    <td>{r.email ?? "—"}</td>
                    <td>{r.username ?? "—"}</td>
                    <td><span className={`badge ${r.status === "published" ? "badge-published" : "badge-draft"}`}>{r.status}</span></td>
                    <td>{r.template}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
