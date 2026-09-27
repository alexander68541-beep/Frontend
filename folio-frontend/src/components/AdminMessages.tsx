"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/Button";

interface Thread { user_id: string; email: string | null; last_body: string; last_at: string; unread: number; }
interface Msg { id: string; sender: string; body: string; created_at: string; }

export function AdminMessages() {
  const qc = useQueryClient();
  const [sel, setSel] = useState<string | null>(null);
  const [body, setBody] = useState("");

  const threads = useQuery({ queryKey: ["admin-messages"], queryFn: () => apiFetch<Thread[]>("/admin/messages"), refetchInterval: 8000, refetchOnWindowFocus: true });
  const thread = useQuery({ queryKey: ["admin-thread", sel], queryFn: () => apiFetch<Msg[]>(`/admin/messages/${sel}`), enabled: !!sel, refetchInterval: 6000 });
  const reply = useMutation({
    mutationFn: () => apiFetch(`/admin/messages/${sel}`, { method: "POST", body: JSON.stringify({ body }) }),
    onSuccess: () => { setBody(""); qc.invalidateQueries({ queryKey: ["admin-thread", sel] }); qc.invalidateQueries({ queryKey: ["admin-messages"] }); },
  });

  return (
    <div className="msg-grid">
      <div className="card msg-threads">
        <h2 className="card-title">Inbox</h2>
        <div className="stack gap-2 mt-4">
          {(threads.data ?? []).length === 0 && <p className="muted small">No conversations yet.</p>}
          {(threads.data ?? []).map((t) => (
            <button key={t.user_id} className={`thread-item ${sel === t.user_id ? "is-active" : ""}`} onClick={() => setSel(t.user_id)}>
              <div className="row between">
                <strong className="small">{t.email ?? "user"}</strong>
                {t.unread > 0 && <span className="badge badge-error" style={{ padding: "1px 8px" }}>{t.unread}</span>}
              </div>
              <span className="muted small ellipsis">{t.last_body}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        {!sel ? (
          <p className="muted center" style={{ padding: "40px 0" }}>Select a conversation.</p>
        ) : (
          <>
            <div className="chat">
              {(thread.data ?? []).map((m) => (
                <div key={m.id} className={`bubble ${m.sender === "admin" ? "me" : "them"}`}>
                  <span className="bubble-who">{m.sender === "admin" ? "You (admin)" : "User"}</span>
                  {m.body}
                </div>
              ))}
            </div>
            <form className="chat-input" onSubmit={(e) => { e.preventDefault(); if (body.trim()) reply.mutate(); }}>
              <input className="input" placeholder="Reply…" value={body} onChange={(e) => setBody(e.target.value)} />
              <Button variant="accent" type="submit" loading={reply.isPending} disabled={!body.trim()}>Send</Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
