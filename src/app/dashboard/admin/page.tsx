"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, ApiError } from "@/lib/api";
import { useAccount } from "@/lib/hooks";
import { Button } from "@/components/ui/Button";
import { AdminSettings } from "@/components/AdminSettings";
import { AdminPayments } from "@/components/AdminPayments";
import { AdminMessages } from "@/components/AdminMessages";

interface Stats { users: number; portfolios: number; published: number; }
interface Row { id: string; username: string | null; status: string; template: string; email: string | null; }
interface User { id: string; email: string | null; role: string; }
interface Reserved { name: string; note: string | null; }

const TABS = ["Overview", "Portfolios", "Users", "Payments", "Messages", "Billing", "Reserved"] as const;
type Tab = (typeof TABS)[number];

export default function AdminPage() {
  const qc = useQueryClient();
  const account = useAccount();
  const isAdmin = account.data?.role === "admin";
  const [tab, setTab] = useState<Tab>("Overview");
  const [newReserved, setNewReserved] = useState("");

  const stats = useQuery({ queryKey: ["admin-stats"], queryFn: () => apiFetch<Stats>("/admin/stats"), enabled: isAdmin, refetchInterval: 15000, refetchOnWindowFocus: true });
  const rows = useQuery({ queryKey: ["admin-portfolios"], queryFn: () => apiFetch<Row[]>("/admin/portfolios"), enabled: isAdmin, refetchInterval: 12000, refetchOnWindowFocus: true });
  const users = useQuery({ queryKey: ["admin-users"], queryFn: () => apiFetch<User[]>("/admin/users"), enabled: isAdmin, refetchInterval: 15000, refetchOnWindowFocus: true });
  const reserved = useQuery({ queryKey: ["admin-reserved"], queryFn: () => apiFetch<Reserved[]>("/admin/reserved"), enabled: isAdmin, refetchInterval: 20000 });

  const setStatus = useMutation({
    mutationFn: (v: { id: string; status: string }) => apiFetch(`/admin/portfolios/${v.id}/status`, { method: "PATCH", body: JSON.stringify({ status: v.status }) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-portfolios"] }); qc.invalidateQueries({ queryKey: ["admin-stats"] }); },
  });
  const del = useMutation({
    mutationFn: (id: string) => apiFetch(`/admin/portfolios/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-portfolios"] }); qc.invalidateQueries({ queryKey: ["admin-stats"] }); },
  });
  const setRole = useMutation({
    mutationFn: (v: { id: string; role: string }) => apiFetch(`/admin/users/${v.id}/role`, { method: "PATCH", body: JSON.stringify({ role: v.role }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
  });
  const addReserved = useMutation({
    mutationFn: (name: string) => apiFetch("/admin/reserved", { method: "POST", body: JSON.stringify({ name }) }),
    onSuccess: () => { setNewReserved(""); qc.invalidateQueries({ queryKey: ["admin-reserved"] }); },
  });
  const delReserved = useMutation({
    mutationFn: (name: string) => apiFetch(`/admin/reserved/${encodeURIComponent(name)}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-reserved"] }),
  });

  if (account.isLoading) return <p className="muted">Loading…</p>;
  if (!isAdmin) return <div className="alert alert-error">Admins only.</div>;

  const err = [stats.error, rows.error, users.error, reserved.error].find((e) => e instanceof ApiError);
  const errMsg = err instanceof ApiError ? err.message : null;

  return (
    <div className="stack gap-6">
      <div>
        <h1 className="page-title">Admin</h1>
        <p className="muted">Manage everything — updates live.</p>
      </div>

      <div className="tabs">
        {TABS.map((t) => (
          <button key={t} className={`tab ${tab === t ? "is-active" : ""}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {errMsg && <div className="alert alert-error">{errMsg}</div>}

      {tab === "Overview" && (
        <div className="stat-row">
          <div className="stat-card"><span className="stat-label">Users</span><span className="stat-value">{stats.data?.users ?? "—"}</span></div>
          <div className="stat-card"><span className="stat-label">Portfolios</span><span className="stat-value">{stats.data?.portfolios ?? "—"}</span></div>
          <div className="stat-card"><span className="stat-label">Published</span><span className="stat-value">{stats.data?.published ?? "—"}</span></div>
        </div>
      )}

      {tab === "Portfolios" && (
        <div className="card">
          <h2 className="card-title">Portfolios</h2>
          <div className="table-wrap mt-4">
            <table className="tbl">
              <thead><tr><th>Email</th><th>Username</th><th>Status</th><th>Template</th><th>Actions</th></tr></thead>
              <tbody>
                {(rows.data ?? []).map((r) => {
                  const suspended = r.status === "suspended";
                  return (
                    <tr key={r.id}>
                      <td>{r.email ?? "—"}</td><td>{r.username ?? "—"}</td>
                      <td><span className={`badge ${r.status === "published" ? "badge-published" : suspended ? "badge-error" : "badge-draft"}`}>{r.status}</span></td>
                      <td>{r.template}</td>
                      <td><div className="row gap-2 wrap">
                        {suspended
                          ? <button className="btn btn-sm" disabled={setStatus.isPending} onClick={() => setStatus.mutate({ id: r.id, status: "unpublished" })}>Unsuspend</button>
                          : <button className="btn btn-sm" disabled={setStatus.isPending} onClick={() => setStatus.mutate({ id: r.id, status: "suspended" })}>Suspend</button>}
                        <button className="btn btn-sm btn-danger" disabled={del.isPending} onClick={() => { if (confirm("Delete this portfolio?")) del.mutate(r.id); }}>Delete</button>
                      </div></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "Users" && (
        <div className="card">
          <h2 className="card-title">Users &amp; roles</h2>
          <div className="table-wrap mt-4">
            <table className="tbl">
              <thead><tr><th>Email</th><th>Role</th><th>Actions</th></tr></thead>
              <tbody>
                {(users.data ?? []).map((u) => (
                  <tr key={u.id}>
                    <td>{u.email ?? "—"}</td><td><span className="badge">{u.role}</span></td>
                    <td>{u.role === "admin"
                      ? <button className="btn btn-sm" disabled={setRole.isPending} onClick={() => setRole.mutate({ id: u.id, role: "user" })}>Remove admin</button>
                      : <button className="btn btn-sm" disabled={setRole.isPending} onClick={() => setRole.mutate({ id: u.id, role: "admin" })}>Make admin</button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "Payments" && <AdminPayments />}
      {tab === "Messages" && <AdminMessages />}
      {tab === "Billing" && <AdminSettings />}

      {tab === "Reserved" && (
        <div className="card">
          <h2 className="card-title">Reserved usernames</h2>
          <div className="row gap-2 mt-4 wrap">
            <input className="input" style={{ maxWidth: 220 }} placeholder="add a name…" value={newReserved} onChange={(e) => setNewReserved(e.target.value)} />
            <Button className="btn-sm" loading={addReserved.isPending} disabled={!newReserved.trim()} onClick={() => addReserved.mutate(newReserved.trim().toLowerCase())}>Add</Button>
          </div>
          <div className="chips mt-4">
            {(reserved.data ?? []).map((r) => (
              <span key={r.name} className="chip" style={{ cursor: "default" }}>{r.name}
                <button className="chip-x" aria-label={`Remove ${r.name}`} onClick={() => delReserved.mutate(r.name)}>×</button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
