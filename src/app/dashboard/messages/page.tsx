"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/Button";

interface Msg { id: string; sender: string; body: string; created_at: string; }

export default function MessagesPage() {
  const qc = useQueryClient();
  const [body, setBody] = useState("");
  const thread = useQuery({ queryKey: ["messages"], queryFn: () => apiFetch<Msg[]>("/messages"), refetchInterval: 6000, refetchOnWindowFocus: true });
  const send = useMutation({
    mutationFn: () => apiFetch("/messages", { method: "POST", body: JSON.stringify({ body }) }),
    onSuccess: () => { setBody(""); qc.invalidateQueries({ queryKey: ["messages"] }); },
  });

  return (
    <div className="stack gap-6">
      <div><h1 className="page-title">Messages</h1><p className="muted">Chat with the Folio team — e.g. request a custom template.</p></div>
      <div className="card">
        <div className="chat">
          {(thread.data ?? []).length === 0 ? (
            <p className="muted center" style={{ padding: "24px 0" }}>No messages yet. Say hello 👋</p>
          ) : (
            (thread.data ?? []).map((m) => (
              <div key={m.id} className={`bubble ${m.sender === "user" ? "me" : "them"}`}>
                <span className="bubble-who">{m.sender === "user" ? "You" : "Folio team"}</span>
                {m.body}
              </div>
            ))
          )}
        </div>
        <form className="chat-input" onSubmit={(e) => { e.preventDefault(); if (body.trim()) send.mutate(); }}>
          <input className="input" placeholder="Type a message…" value={body} onChange={(e) => setBody(e.target.value)} />
          <Button variant="accent" type="submit" loading={send.isPending} disabled={!body.trim()}>Send</Button>
        </form>
      </div>
    </div>
  );
}
