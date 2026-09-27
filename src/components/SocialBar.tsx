"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { apiFetch } from "@/lib/api";

export function SocialBar({ username }: { username: string }) {
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [authed, setAuthed] = useState(false);
  const base = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (!username) return;
    (async () => {
      try {
        const r = await fetch(`${base}/api/v1/public/${encodeURIComponent(username)}/social`);
        if (r.ok) { const d = await r.json(); setLikes(d.likes || 0); }
      } catch { /* ignore */ }
      try {
        const { data } = await createClient().auth.getSession();
        if (data.session) {
          setAuthed(true);
          const s = await apiFetch<{ liked: boolean; saved: boolean; likes: number }>(`/social/${encodeURIComponent(username)}/status`);
          setLiked(s.liked); setSaved(s.saved); setLikes(s.likes);
        }
      } catch { /* ignore */ }
    })();
  }, [username, base]);

  async function like() {
    if (!authed) { window.location.href = "/login"; return; }
    try {
      const r = await apiFetch<{ liked: boolean; likes: number }>(`/social/${encodeURIComponent(username)}/like`, { method: "POST" });
      setLiked(r.liked); setLikes(r.likes);
    } catch { /* ignore */ }
  }
  async function save() {
    if (!authed) { window.location.href = "/login"; return; }
    try {
      const r = await apiFetch<{ saved: boolean }>(`/social/${encodeURIComponent(username)}/save`, { method: "POST" });
      setSaved(r.saved);
    } catch { /* ignore */ }
  }

  return (
    <div className="social-bar">
      <button className={`social-btn ${liked ? "on" : ""}`} onClick={like} aria-label="Like">
        <span>{liked ? "❤️" : "🤍"}</span> {likes}
      </button>
      <button className={`social-btn ${saved ? "on" : ""}`} onClick={save} aria-label="Save">
        🔖 {saved ? "Saved" : "Save"}
      </button>
    </div>
  );
}
