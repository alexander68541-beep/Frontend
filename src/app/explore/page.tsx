"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { portfolioUrl } from "@/lib/urls";

interface Card {
  username: string; template: string; display_name: string;
  title: string | null; tagline: string | null; location: string | null; avatar_url: string | null;
}

export default function ExplorePage() {
  const [q, setQ] = useState("");
  const [term, setTerm] = useState("");
  const list = useQuery({
    queryKey: ["explore", term],
    queryFn: async (): Promise<Card[]> => {
      const base = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${base}/api/v1/public/explore${term ? `?q=${encodeURIComponent(term)}` : ""}`);
      if (!res.ok) throw new Error("failed");
      return (await res.json()) as Card[];
    },
  });

  return (
    <div className="explore-wrap">
      <header className="explore-head">
        <Link href="/" className="explore-logo">Folio</Link>
        <Link href="/dashboard" className="btn btn-sm">Dashboard</Link>
      </header>

      <div className="explore-hero">
        <h1 className="explore-title">Explore portfolios</h1>
        <p className="muted">Discover people and their work.</p>
        <form className="explore-search" onSubmit={(e) => { e.preventDefault(); setTerm(q.trim()); }}>
          <input className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, role, skill or place…" />
          <button className="btn btn-accent" type="submit">Search</button>
        </form>
      </div>

      {list.isLoading ? (
        <p className="muted center">Loading…</p>
      ) : (list.data ?? []).length === 0 ? (
        <div className="card center muted empty-lg">{term ? `No portfolios found for “${term}”.` : "No public portfolios yet."}</div>
      ) : (
        <div className="explore-grid">
          {(list.data ?? []).map((c) => (
            <a key={c.username} href={portfolioUrl(c.username)} target="_blank" rel="noreferrer" className="explore-card">
              <div className="explore-avatar">
                {c.avatar_url ? <img src={c.avatar_url} alt={c.display_name} /> : <span>{c.display_name.slice(0, 1).toUpperCase()}</span>}
              </div>
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
