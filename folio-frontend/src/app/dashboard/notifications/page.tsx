"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/Button";

interface N { id: string; type: string; title: string; body: string | null; read: boolean; created_at: string; }

export default function NotificationsPage() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["notifications"], queryFn: () => apiFetch<N[]>("/notifications"), refetchInterval: 20000, refetchOnWindowFocus: true });
  const readAll = useMutation({
    mutationFn: () => apiFetch("/notifications/read", { method: "POST" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["notifications"] }); qc.invalidateQueries({ queryKey: ["notif-unread"] }); },
  });

  return (
    <div className="stack gap-6">
      <div className="row between wrap gap-3">
        <div><h1 className="page-title">Notifications</h1><p className="muted">Updates about your account and portfolio.</p></div>
        <Button className="btn-sm" loading={readAll.isPending} onClick={() => readAll.mutate()}>Mark all read</Button>
      </div>
      {q.isLoading ? <p className="muted">Loading…</p> : (q.data ?? []).length === 0 ? (
        <div className="card center muted empty-lg">No notifications yet.</div>
      ) : (
        <div className="stack gap-3">
          {(q.data ?? []).map((n) => (
            <div key={n.id} className={`notif-item ${n.read ? "" : "unread"}`}>
              <div className="row between"><strong>{n.title}</strong><span className="muted small">{new Date(n.created_at).toLocaleDateString()}</span></div>
              {n.body && <p className="muted small mt-2">{n.body}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
