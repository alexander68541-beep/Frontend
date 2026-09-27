"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { portfolioUrl } from "@/lib/urls";

interface Card { username: string; display_name: string; title: string | null; tagline: string | null; location: string | null; avatar_url: string | null; }

export default function SavedPage() {
  const q = useQuery({ queryKey: ["saved"], queryFn: () => apiFetch<Card[]>("/social/saved"), refetchOnWindowFocus: true });

  return (
    <div className="stack gap-6">
      <div><h1 className="page-title">Saved</h1><p className="muted">Portfolios you&apos;ve bookmarked.</p></div>
      {q.isLoading ? <p className="muted">Loading…</p> : (q.data ?? []).length === 0 ? (
        <div className="card center muted empty-lg">Nothing saved yet. Tap 🔖 Save on any portfolio to keep it here.</div>
      ) : (
        <div className="explore-grid">
          {(q.data ?? []).map((c) => (
            <a key={c.username} href={portfolioUrl(c.username)} target="_blank" rel="noreferrer" className="explore-card">
              <div className="explore-avatar">{c.avatar_url ? <img src={c.avatar_url} alt={c.display_name} /> : <span>{c.display_name.slice(0, 1).toUpperCase()}</span>}</div>
              <div className="explore-info">
                <strong>{c.display_name}</strong>
                {c.title && <span className="muted small">{c.title}</span>}
                {c.tagline && <p className="muted small explore-tagline">{c.tagline}</p>}
                {c.location && <span className="muted xs">📍 {c.location}</span>}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
