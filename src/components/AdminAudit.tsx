"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/Button";

interface A { id: string; actor_email: string | null; action: string; target: string | null; meta: Record<string, unknown>; created_at: string | null; }

export function AdminAudit() {
  const [limit, setLimit] = useState(50);
  const q = useQuery({ queryKey: ["admin-audit", limit], queryFn: () => apiFetch<A[]>(`/admin/audit?limit=${limit}&offset=0`), refetchInterval: 20000 });
  return (
    <div className="card">
      <h2 className="card-title">Audit log</h2>
      <div className="table-wrap mt-4">
        <table className="tbl">
          <thead><tr><th>When</th><th>Actor</th><th>Action</th><th>Target</th></tr></thead>
          <tbody>
            {(q.data ?? []).map((a) => (
              <tr key={a.id}>
                <td className="muted small">{a.created_at ? new Date(a.created_at).toLocaleString() : "—"}</td>
                <td>{a.actor_email ?? "—"}</td>
                <td><span className="badge">{a.action}</span></td>
                <td className="muted small">{a.target ?? ""}{a.meta && Object.keys(a.meta).length ? ` · ${JSON.stringify(a.meta)}` : ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {(q.data ?? []).length >= limit && <div className="mt-4"><Button className="btn-sm" onClick={() => setLimit((l) => l + 50)}>Load more</Button></div>}
    </div>
  );
}
