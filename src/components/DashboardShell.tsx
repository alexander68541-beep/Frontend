"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAccount, usePortfolio } from "@/lib/hooks";

type NavItem = { href: string; label: string; icon: React.ReactNode; soon?: string };

const I = {
  overview: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" />
    </svg>
  ),
  profile: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
    </svg>
  ),
  templates: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 9v12" />
    </svg>
  ),
  analytics: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <circle cx="12" cy="12" r="3" />
      <path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.4-2.3 1a7 7 0 0 0-1.7-1L14.5 2h-5l-.4 2.6a7 7 0 0 0-1.7 1l-2.3-1-2 3.4L2.1 11a7 7 0 0 0 0 2l-2 1.5 2 3.4 2.3-1a7 7 0 0 0 1.7 1L9.5 22h5l.4-2.6a7 7 0 0 0 1.7-1l2.3 1 2-3.4-2-1.5c.1-.3.1-.7.1-1Z" />
    </svg>
  ),
  projects: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </svg>
  ),
  skills: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M12 2l2.4 5.5L20 8l-4 4 1 6-5-3-5 3 1-6-4-4 5.6-.5z" />
    </svg>
  ),
  experience: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  ),
  education: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M22 9L12 5 2 9l10 4 10-4z" /><path d="M6 11v5c0 1 2.7 3 6 3s6-2 6-3v-5" />
    </svg>
  ),
  links: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1" /><path d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1" />
    </svg>
  ),
};

const NAV: { section: string; items: NavItem[] }[] = [
  { section: "Main", items: [
    { href: "/dashboard", label: "Overview", icon: I.overview },
    { href: "/dashboard/profile", label: "Profile", icon: I.profile },
  ]},
  { section: "Content", items: [
    { href: "/dashboard/projects", label: "Projects", icon: I.projects },
    { href: "/dashboard/skills", label: "Skills", icon: I.skills },
    { href: "/dashboard/experience", label: "Experience", icon: I.experience },
    { href: "/dashboard/education", label: "Education", icon: I.education },
    { href: "/dashboard/links", label: "Social links", icon: I.links },
  ]},
  { section: "Design", items: [
    { href: "/dashboard/templates", label: "Templates", icon: I.templates, soon: "Phase 3" },
  ]},
  { section: "Insights", items: [
    { href: "/dashboard/analytics", label: "Analytics", icon: I.analytics, soon: "Soon" },
  ]},
  { section: "Account", items: [
    { href: "/dashboard/settings", label: "Settings", icon: I.settings },
  ]},
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const account = useAccount();
  const portfolio = usePortfolio();

  const pf = portfolio.data;
  const published = pf?.status === "published";

  async function signOut() {
    await createClient().auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname.startsWith(href);

  return (
    <div className={`dash ${open ? "is-open" : ""}`}>
      <aside className="dash-side">
        <Link href="/" className="dash-brand">
          <span className="mark" aria-hidden />
          Folio
        </Link>

        <nav className="dash-nav">
          {NAV.map((group) => (
            <div key={group.section} className="dash-group">
              <span className="dash-group-label">{group.section}</span>
              {group.items.map((it) => (
                <Link
                  key={it.href}
                  href={it.href}
                  className={`dash-link ${isActive(it.href) ? "is-active" : ""}`}
                  onClick={() => setOpen(false)}
                >
                  <span className="ic">{it.icon}</span>
                  <span>{it.label}</span>
                  {it.soon && <span className="soon">{it.soon}</span>}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <div className="dash-user">
          <div className="dash-user-meta">
            <span className="dash-avatar" aria-hidden>
              {(account.data?.email ?? "?").charAt(0).toUpperCase()}
            </span>
            <span className="dash-email" title={account.data?.email ?? ""}>
              {account.data?.email ?? "…"}
            </span>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={signOut}>Sign out</button>
        </div>
      </aside>

      <div className="dash-main">
        <header className="dash-top">
          <button className="dash-burger" onClick={() => setOpen((o) => !o)} aria-label="Menu">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <div className="dash-top-addr">
            {pf?.username ? (
              <span className="muted small">folio.assetprim.com/p/{pf.username}</span>
            ) : (
              <span className="muted small">No username yet</span>
            )}
          </div>
          <span className={`badge ${published ? "badge-published" : "badge-draft"}`}>
            <span className="dot" />
            {published ? "Published" : "Draft"}
          </span>
        </header>

        <main className="dash-content">{children}</main>
      </div>

      <button className="dash-scrim" aria-hidden onClick={() => setOpen(false)} />
    </div>
  );
}
