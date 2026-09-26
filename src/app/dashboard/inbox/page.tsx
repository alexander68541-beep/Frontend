"use client";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

interface C { id: string; name: string | null; email: string | null; message: string; read: boolean; created_at: string; }

export default function InboxPage() {
  const q = useQuery({ queryKey: ["contact-inbox"], queryFn: () => apiFetch<C[]>("/contact"), refetchInterval: 20000, refetchOnWindowFocus: true });

  return (
    <div className="stack gap-6">
      <div><h1 className="page-title">Messages</h1><p className="muted">Messages sent to you from your public portfolio.</p></div>
      {q.isLoading ? <p className="muted">Loading…</p> : (q.data ?? []).length === 0 ? (
        <div className="card center muted empty-lg">No messages yet. When visitors use your contact form, they show up here.</div>
      ) : (
        <div className="stack gap-3">
          {(q.data ?? []).map((c) => (
            <div key={c.id} className="card">
              <div className="row between wrap gap-2">
                <strong>{c.name || "Anonymous"}{c.email ? ` · ${c.email}` : ""}</strong>
                <span className="muted small">{new Date(c.created_at).toLocaleString()}</span>
              </div>
              <p className="mt-2" style={{ whiteSpace: "pre-line" }}>{c.message}</p>
              {c.email && <a className="btn btn-sm mt-4" href={`mailto:${c.email}`}>Reply by email</a>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
