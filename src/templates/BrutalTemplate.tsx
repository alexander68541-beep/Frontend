"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import type { PublicPortfolio } from "@/lib/publicTypes";
import { dateRange, videoEmbed, ext } from "@/lib/publicTypes";
import { ContactForm } from "@/components/ContactForm";

/* =====================================================================
   BrutalTemplate — "Brutal" — neo-brutalist Web3-marketplace theme.
   UPDATED: True Neo-Brutalist Grid (Bento Box), Purple/Yellow Theme,
   Sharp Black Shadows, Clean Smooth Scrolling.
   ===================================================================== */

const DEFAULT_ORDER = [
  "about", "projects", "skills", "services", "experience",
  "education", "certifications", "achievements", "publications",
  "gallery", "videos", "testimonials",
];
function resolveOrder(settings: PublicPortfolio["settings"]): string[] {
  const custom = settings?.section_order;
  const order = custom && custom.length ? [...custom] : [...DEFAULT_ORDER];
  for (const k of DEFAULT_ORDER) if (!order.includes(k)) order.push(k);
  return order;
}
function initials(name: string | null | undefined, fallback: string | null | undefined): string {
  const src = (name || fallback || "").trim();
  if (!src) return "◆";
  const parts = src.split(/\s+/).filter(Boolean);
  return (parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : src.slice(0, 2)).toUpperCase();
}
function firstWord(n: string) { return n.split(/\s+/)[0] || n; }
function oneDate(s: string | null): string | null {
  if (!s) return null;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short" });
}
function levelPct(level: unknown): number | null {
  if (level === null || level === undefined || level === "") return null;
  const clamp = (n: number) => Math.max(0, Math.min(100, n));
  if (typeof level === "number") { if (Number.isNaN(level)) return null; return clamp(level <= 5 ? (level / 5) * 100 : level); }
  const s = String(level).trim().toLowerCase();
  const num = parseFloat(s);
  if (!Number.isNaN(num) && /^[\d.]+\s*%?$/.test(s)) return clamp(s.includes("%") ? num : num <= 5 ? (num / 5) * 100 : num);
  const map: Record<string, number> = { beginner: 35, basic: 35, novice: 30, elementary: 40, learning: 30, intermediate: 60, competent: 62, proficient: 75, skilled: 72, advanced: 85, expert: 95, master: 100, fluent: 95, native: 100 };
  for (const k in map) if (s.includes(k)) return map[k];
  return null;
}

/* ---- social brand icons ---- */
const SOCIAL_ICONS: Record<string, string> = {
  github: "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12",
  gitlab: "M23.955 13.587l-1.342-4.135-2.664-8.189c-.135-.423-.73-.423-.867 0L16.418 9.45H7.582L4.919 1.263C4.783.84 4.185.84 4.05 1.263L1.386 9.452.044 13.587c-.121.375.014.789.331 1.023L12 23.054l11.625-8.443c.318-.235.453-.647.33-1.024",
  linkedin: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z",
  youtube: "M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
  instagram: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.332.014 7.052.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z",
  twitter: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  globe: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z",
};
function detectSocial(platform: string | null, url: string | null, label: string | null): string {
  let host = "";
  try { host = new URL(ext(url || "")).hostname.replace(/^www\./, "").toLowerCase(); } catch { host = ""; }
  const H = `${platform || ""} ${label || ""} ${url || ""} ${host}`.toLowerCase();
  if ((url || "").startsWith("mailto:") || /\bemail\b|\be-mail\b|\bmail\b|gmail|proton\.me|outlook\.com/.test(H)) return "mail";
  if (/github/.test(H)) return "github";
  if (/linkedin|lnkd\.in/.test(H)) return "linkedin";
  if (/youtube|youtu\.be/.test(H)) return "youtube";
  if (/instagram|instagr\.am/.test(H)) return "instagram";
  if (/twitter|x\.com|\btweet\b|(^|\s)x(\s|$)/.test(H)) return "twitter";
  return "globe";
}
function SocialIcon({ name }: { name: string }) {
  return (<svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden focusable="false"><path d={SOCIAL_ICONS[name] || SOCIAL_ICONS.globe} /></svg>);
}

const SEC_ID: Record<string, string> = {
  about: "about", projects: "work", skills: "skills", services: "services", experience: "experience",
  education: "education", certifications: "certifications", achievements: "achievements",
  publications: "publications", gallery: "gallery", videos: "videos", testimonials: "testimonials",
};

/* ------------------------------ component ------------------------------ */

export function BrutalTemplate({ data }: { data: PublicPortfolio }) {
  const p = data.profile;
  const accent = data.accent || "#5835FF"; // Purple Default

  const hidden = new Set(data.settings?.hidden ?? []);
  const sv = (k: string) => !hidden.has(k);
  const username = data.username;
  const name = p?.display_name || username || "Your Name";
  const mono = initials(p?.display_name, username);
  const nick = firstWord(name);

  const [lb, setLb] = useState<{ src: string; alt: string; cap?: string } | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const tiltRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const openLb = useCallback((src: string, alt: string, cap?: string) => setLb({ src, alt, cap }), []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    root.classList.add("br-ready");
    const reduce = typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const targets = root.querySelectorAll("[data-reveal]");
    if (reduce || typeof IntersectionObserver === "undefined") { targets.forEach((el) => el.classList.add("br-in")); return; }
    
    // Smooth reveal observer
    const io = new IntersectionObserver((entries) => entries.forEach((e) => { 
      if (e.isIntersecting) { 
        e.target.classList.add("br-in"); 
        io.unobserve(e.target); 
      } 
    }), { threshold: 0.05, rootMargin: "0px 0px -20px 0px" });
    
    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!lb) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setLb(null); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [lb]);

  const has = {
    about: sv("about") && !!(p?.about || p?.bio || p?.tagline),
    projects: sv("projects") && data.projects.length > 0,
    skills: sv("skills") && data.skills.length > 0,
    services: sv("services") && data.services.length > 0,
    experience: sv("experience") && data.experience.length > 0,
    testimonials: sv("testimonials") && data.testimonials.length > 0,
    contact: !!username,
  };
  const contactHref = username ? "#contact" : p?.email ? `mailto:${p.email}` : undefined;
  const LEN: Record<string, number> = {
    projects: data.projects.length, skills: data.skills.length, services: data.services.length,
    experience: data.experience.length, education: data.education.length, certifications: data.certifications.length,
    achievements: data.achievements.length, publications: data.publications.length, gallery: data.gallery.length,
    videos: data.videos.length, testimonials: data.testimonials.length,
  };
  const panelHas = (k: string) => (k === "about" ? has.about : sv(k) && (LEN[k] ?? 0) > 0);
  const order = resolveOrder(data.settings).filter(panelHas);
  const navSpec: { href: string; label: string; on: boolean }[] = [
    { href: "#top", label: "Home", on: true },
    { href: "#work", label: "Work", on: has.projects },
    { href: "#skills", label: "Skills", on: has.skills },
    { href: "#about", label: "About", on: has.about },
    { href: "#contact", label: "Contact", on: has.contact },
  ];
  const navItems = navSpec.filter((n) => n.on);

  const ZImg = useCallback(({ src, alt, cap, className }: { src: string; alt: string; cap?: string; className?: string }) => (
    <button type="button" className={`br-zoom ${className || ""}`} onClick={() => openLb(src, alt, cap)} aria-label={alt ? `View image: ${alt}` : "View image"}>
      <img className="br-zoom-bg" src={src} alt="" aria-hidden loading="lazy" />
      <img className="br-zoom-img" src={src} alt={alt} loading="lazy" />
    </button>
  ), [openLb]);

  const socialRow = (extra?: string) =>
    data.links.length > 0 ? (
      <div className={`br-socials ${extra || ""}`}>
        {data.links.map((l) => (<a key={l.id} className="br-soc" href={ext(l.url)} target="_blank" rel="noopener noreferrer" aria-label={l.label || l.platform} title={l.label || l.platform}><SocialIcon name={detectSocial(l.platform, l.url, l.label)} /></a>))}
      </div>
    ) : null;

  const bar = (title: string, customClass?: string) => (
    <div className={`br-bar ${customClass || ""}`}><span className="br-dots" aria-hidden><i /><i /><i /></span><span className="br-bar-title">{title}</span><span className="br-bar-x" aria-hidden>⤢</span></div>
  );

  const sections: Record<string, () => ReactNode> = {
    about: () => {
      const aboutText = p?.about ?? p?.bio ?? null;
      return (
        <div className="br-window br-window-lime">
          {bar("LATEST EVENT", "br-bar-lime")}
          <div className="br-window-in">
            <h3 className="br-lime-h">{p?.tagline || `${nick} V2 IS LIVE`}</h3>
            {aboutText && aboutText.split(/\n{2,}/).slice(0, 2).map((para, i) => <p key={i} className="br-lime-p">{para}</p>)}
            {p?.resume_url && <a className="br-btn br-btn-dark br-mt" href={ext(p.resume_url)} target="_blank" rel="noopener noreferrer">Learn More <span aria-hidden>→</span></a>}
          </div>
        </div>
      );
    },
    projects: () => {
      const ordered = [...data.projects].sort((a, b) => Number(!!b.is_featured) - Number(!!a.is_featured));
      return (
        <div className="br-window">
          {bar("TRENDING COLLECTIONS")}
          <div className="br-window-in"><div className="br-grid-2">
            {ordered.map((pr) => {
              const category = pr.role || (pr.tags && pr.tags[0]) || null;
              return (
                <article key={pr.id} className="br-nft">
                  <div className="br-nft-media">{pr.image_url ? <ZImg src={pr.image_url} alt={pr.title || "Project"} cap={pr.title || undefined} /> : <div className="br-ph" aria-hidden>{initials(pr.title, "P")}</div>}{pr.is_featured && <span className="br-nft-badge">★</span>}</div>
                  <div className="br-nft-body">
                    <div className="br-nft-titlerow"><h4 className="br-nft-title">{pr.title || "Untitled"}</h4>{pr.url && <a className="br-nft-go" href={ext(pr.url)} target="_blank" rel="noopener noreferrer" aria-label="Open">↗</a>}</div>
                    {category && <p className="br-nft-cat">{category}</p>}
                    {pr.tags && pr.tags.length > 0 && <span className="br-floor">{pr.tags[0]}</span>}
                  </div>
                </article>
              );
            })}
          </div></div>
        </div>
      );
    },
    skills: () => {
      const sorted = [...data.skills].map((s) => ({ s, lvl: levelPct(s.level) })).sort((a, b) => (b.lvl ?? 0) - (a.lvl ?? 0));
      return (
        <div className="br-window">
          {bar("TOP SKILLS (7D)")}
          <div className="br-window-in"><ol className="br-lead">
            {sorted.map(({ s, lvl }, i) => (
              <li key={s.id} className="br-lead-row" style={{ ["--pct" as string]: `${lvl ?? 0}%` } as CSSProperties}>
                <span className="br-rank">{String(i + 1).padStart(2, "0")}</span>
                <span className="br-lead-ic" aria-hidden>{initials(s.name, "•")}</span>
                <span className="br-lead-name">{s.name}{s.category && <em>{s.category}</em>}</span>
                <span className="br-lead-bar" role={lvl != null ? "progressbar" : undefined} aria-valuenow={lvl != null ? Math.round(lvl) : undefined} aria-valuemin={0} aria-valuemax={100} aria-label={lvl != null ? `${s.name} level` : undefined}><span className="br-lead-fill" /></span>
                <span className="br-lead-val">{lvl != null ? `${Math.round(lvl)}%` : (typeof s.level === "string" ? s.level : "")}</span>
              </li>
            ))}
          </ol></div>
        </div>
      );
    },
    services: () => (
      <div className="br-window br-window-dark">
        {bar(`WHY ${nick.toUpperCase()}?`, "br-bar-dark")}
        <div className="br-window-in"><div className="br-feats">
          {data.services.map((s) => (<div key={s.id} className="br-feat"><span className="br-feat-ic" aria-hidden>⚡</span><div><h4 className="br-feat-h">{s.title}</h4>{s.description && <p className="br-feat-p">{s.description}</p>}{s.price && <span className="br-floor">{s.price}</span>}</div></div>))}
        </div></div>
      </div>
    ),
    experience: () => (
      <div className="br-window br-window-dark">
        {bar("EXPERIENCE / TIMELINE", "br-bar-dark")}
        <div className="br-window-in"><div className="br-tl">
          {data.experience.map((e) => (<div key={e.id} className="br-tl-row"><span className="br-tl-date">{dateRange(e.start_date, e.end_date, e.is_current)}</span><div><h4 className="br-feat-h">{e.title || e.company || "Role"}</h4><p className="br-muted br-small">{[e.company, e.location].filter(Boolean).join(" · ")}</p>{e.description && <p className="br-muted">{e.description}</p>}</div></div>))}
        </div></div>
      </div>
    ),
    education: () => (
      <div className="br-window">{bar("EDUCATION")}<div className="br-window-in"><div className="br-grid-2">
        {data.education.map((ed) => (<div key={ed.id} className="br-mini"><div className="br-mini-top"><h4 className="br-feat-h">{ed.school || "School"}</h4><span className="br-floor">{dateRange(ed.start_date, ed.end_date)}</span></div>{(ed.degree || ed.field) && <p className="br-muted">{[ed.degree, ed.field].filter(Boolean).join(", ")}</p>}{ed.description && <p className="br-muted br-small">{ed.description}</p>}</div>))}
      </div></div></div>
    ),
    certifications: () => (
      <div className="br-window">{bar("CERTIFICATIONS")}<div className="br-window-in"><div className="br-grid-2">
        {data.certifications.map((c) => { const body = (<><span className="br-feat-ic" aria-hidden>✓</span><h4 className="br-feat-h">{c.name}</h4>{c.issuer && <p className="br-muted br-small">{c.issuer}</p>}{oneDate(c.issue_date) && <span className="br-floor">{oneDate(c.issue_date)}</span>}</>); return c.url ? <a key={c.id} className="br-mini br-mini-link" href={ext(c.url)} target="_blank" rel="noopener noreferrer">{body}</a> : <div key={c.id} className="br-mini">{body}</div>; })}
      </div></div></div>
    ),
    achievements: () => (
      <div className="br-window">{bar("ACHIEVEMENTS")}<div className="br-window-in"><div className="br-grid-2">
        {data.achievements.map((a) => (<div key={a.id} className="br-mini"><span className="br-feat-ic" aria-hidden>★</span><h4 className="br-feat-h">{a.title}</h4>{oneDate(a.date) && <span className="br-floor">{oneDate(a.date)}</span>}{a.description && <p className="br-muted br-small">{a.description}</p>}</div>))}
      </div></div></div>
    ),
    publications: () => (
      <div className="br-window">{bar("PUBLICATIONS")}<div className="br-window-in"><div className="br-list">
        {data.publications.map((pub) => { const meta = [pub.publisher, oneDate(pub.date)].filter(Boolean).join(" · "); const body = (<><div className="br-mini-top"><h4 className="br-feat-h">{pub.title}</h4>{pub.url && <span aria-hidden>↗</span>}</div>{meta && <p className="br-muted br-small">{meta}</p>}{pub.description && <p className="br-muted">{pub.description}</p>}</>); return pub.url ? <a key={pub.id} className="br-listitem br-mini-link" href={ext(pub.url)} target="_blank" rel="noopener noreferrer">{body}</a> : <div key={pub.id} className="br-listitem">{body}</div>; })}
      </div></div></div>
    ),
    gallery: () => (
      <div className="br-window">{bar("GALLERY")}<div className="br-window-in"><div className="br-gallery">
        {data.gallery.map((g) => g.image_url ? (<figure key={g.id} className="br-gitem"><ZImg src={g.image_url} alt={g.caption || "Gallery image"} cap={g.caption || undefined} />{g.caption && <figcaption className="br-muted br-small">{g.caption}</figcaption>}</figure>) : null)}
      </div></div></div>
    ),
    videos: () => (
      <div className="br-window">{bar("VIDEOS")}<div className="br-window-in"><div className="br-grid-2">
        {data.videos.map((v) => { const src = v.url ? videoEmbed(v.url) : null; if (!src) return null; return (<figure key={v.id} className="br-video"><div className="br-video-frame"><iframe src={src} title={v.title || "Video"} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div>{v.title && <figcaption className="br-muted br-small">{v.title}</figcaption>}</figure>); })}
      </div></div></div>
    ),
    testimonials: () => (
      <div className="br-window">{bar("WHAT CLIENTS SAY")}<div className="br-window-in"><div className="br-list">
        {data.testimonials.map((t) => (<figure key={t.id} className="br-quote"><span className="br-quote-mark" aria-hidden>&ldquo;</span>{t.quote && <blockquote>{t.quote}</blockquote>}<figcaption className="br-quote-by"><span className="br-lead-ic" aria-hidden>{t.avatar_url ? <img src={t.avatar_url} alt="" loading="lazy" /> : initials(t.author, "•")}</span><span>{t.author && <b>{t.author}</b>}{t.role && <em className="br-muted">{t.role}</em>}</span></figcaption></figure>))}
      </div></div></div>
    ),
  };

  const headlineText = p?.tagline || `BUILT FOR ${nick.toUpperCase()}. MADE FOR THE FUTURE.`;
  const heroStats = [
    { n: data.projects.length, label: "Projects" },
    { n: data.skills.length, label: "Skills" },
    { n: data.testimonials.length, label: "Clients" },
  ].filter((s) => s.n > 0).slice(0, 3);
  const tickerWords = ["LIVE TRADING", "SCALABLE", "SECURE", "COMMUNITY DRIVEN"];
  const ticker = tickerWords.join("  •  ");
  const year = new Date().getFullYear();

  return (
    <div ref={rootRef} className="br-root" id="top" data-theme="brutal" style={{ ["--tpl-accent" as string]: accent } as CSSProperties}>
      <style dangerouslySetInnerHTML={{ __html: BR_CSS }} />

      {/* NAV */}
      <header className="br-nav">
        <div className="br-shell br-nav-in">
          <a className="br-logo" href="#top"><span className="br-logo-box" aria-hidden>{mono}</span><span className="br-logo-txt"><b>{name}</b>{p?.title && <em>{p.title}</em>}</span></a>
          {navItems.length > 1 && <nav className="br-navlinks" aria-label="Primary">{navItems.map((it, i) => <a key={it.href} href={it.href} className={i === 0 ? "is-active" : ""}>{it.label}</a>)}</nav>}
          <div className="br-nav-right">
            {contactHref && <a className="br-btn br-btn-lime br-nav-cta" href={contactHref}>Connect Wallet</a>}
            {navItems.length > 1 && <details className="br-menu">
              <summary aria-label="Menu">
                <span className="br-menu-line"></span>
                <span className="br-menu-line"></span>
                <span className="br-menu-line"></span>
              </summary>
              <ul>{navItems.map((it) => <li key={it.href}><a href={it.href}>{it.label}</a></li>)}</ul>
            </details>}
          </div>
        </div>
      </header>

      {/* TICKER */}
      <div className="br-ticker" aria-hidden><div className="br-ticker-track"><span>{` •  ${ticker}  `.repeat(6)}</span><span>{` •  ${ticker}  `.repeat(6)}</span></div></div>

      {/* PANELS GRID (Bento Box Style without overlaps) */}
      <main className="br-shell br-stack">
        
        {/* HERO SECTION - Span Full Width */}
        <section className="br-panel-hero" data-reveal>
          <div className="br-hero">
            <div className="br-hero-left">
              <h1 className="br-headline">{headlineText.split(/\s+/).map((w, i) => <span key={i} className="br-hl">{w} </span>)}</h1>
              {p?.bio && <p className="br-sub">{p.bio}</p>}
              <div className="br-btnrow">
                {has.projects && <a className="br-btn br-btn-lime" href="#work">START TRADING <span aria-hidden>→</span></a>}
                {contactHref && <a className="br-btn br-btn-light" href={contactHref}>EXPLORE MARKET <span aria-hidden>→</span></a>}
              </div>
            </div>

            <div className="br-hero-right br-tilt" ref={tiltRef}>
              <div className="br-window">
                {bar("MARKET OVERVIEW")}
                <div className="br-window-in">
                  <div className="br-ov-top">
                    <div><span className="br-ov-label">TOTAL VOLUME</span><div className="br-ov-big">$ 2.48B</div></div>
                    {p?.location && <span className="br-ov-chip">+24.5%</span>}
                  </div>
                  <svg className="br-chart" viewBox="0 0 300 80" preserveAspectRatio="none" aria-hidden>
                    <path d="M0 62 L30 54 L60 58 L90 40 L120 46 L150 26 L180 36 L210 20 L240 30 L270 12 L300 22" fill="none" stroke="var(--tpl-accent)" strokeWidth="3" />
                    <path d="M0 62 L30 54 L60 58 L90 40 L120 46 L150 26 L180 36 L210 20 L240 30 L270 12 L300 22 L300 80 L0 80 Z" fill="var(--tpl-accent)" opacity=".14" />
                  </svg>
                  {heroStats.length > 0 && (
                    <div className="br-ov-stats">{heroStats.map((s) => (<div key={s.label} className="br-ov-stat"><b>{s.n}</b><span>{s.label}</span></div>))}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* DATA SECTION PANELS */}
        {order.map((k) => (
          <section key={k} id={SEC_ID[k] || k} className={`br-panel br-${k}`} data-reveal>
            {sections[k] ? sections[k]() : null}
          </section>
        ))}

        {/* CONTACT PANEL */}
        {username && (
          <section id="contact" className="br-panel br-contact-sec" data-reveal>
            <div className="br-window">
              {bar("JOIN THE FUTURE")}
              <div className="br-window-in br-contact">
                <div className="br-contact-left">
                  <h3 className="br-join-h">OF DIGITAL OWNERSHIP.</h3>
                  <p className="br-muted-dark">Trade. Collect. Earn. All in one place.</p>
                  <div className="br-contact-rows">
                    {p?.email && <a className="br-crow" href={`mailto:${p.email}`}><span aria-hidden>✉</span><span>{p.email}</span></a>}
                    {p?.phone && <a className="br-crow" href={`tel:${p.phone}`}><span aria-hidden>☎</span><span>{p.phone}</span></a>}
                    {p?.website && <a className="br-crow" href={ext(p.website)} target="_blank" rel="noopener noreferrer"><span aria-hidden>◈</span><span>{p.website.replace(/^https?:\/\//, "")}</span></a>}
                  </div>
                  {socialRow()}
                </div>
                <div className="br-formcard"><ContactForm username={username} /></div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* FOOTER */}
      <footer className="br-footer">
        <div className="br-shell br-footer-in">
          <div className="br-foot-col">
            <a className="br-logo br-logo-foot" href="#top"><span className="br-logo-box" aria-hidden>{mono}</span><span className="br-logo-txt"><b>{name}</b></span></a>
            <div className="br-foot-soc">{socialRow()}</div>
            <span className="br-foot-copy">© {year} {name}. All rights reserved.</span>
          </div>
          {navItems.length > 1 && (
            <div className="br-foot-col">
              <span className="br-foot-label">MARKET</span>
              <nav className="br-footer-nav" aria-label="Footer">{navItems.filter((n) => n.href !== "#top").map((it) => <a key={it.href} href={it.href}>{it.label}</a>)}</nav>
            </div>
          )}
          <div className="br-foot-col">
             <span className="br-foot-label">STAY UPDATED</span>
             <a className="br-btn br-btn-lime br-mt" href={contactHref || "#"}>SUBSCRIBE <span aria-hidden>→</span></a>
          </div>
        </div>
      </footer>

      {/* LIGHTBOX */}
      {lb && (
        <div className="br-lb" role="dialog" aria-modal="true" aria-label="Image viewer" onClick={() => setLb(null)}>
          <button ref={closeRef} type="button" className="br-lb-close" onClick={() => setLb(null)} aria-label="Close image viewer">✕</button>
          <figure className="br-lb-fig" onClick={(e) => e.stopPropagation()}><img src={lb.src} alt={lb.alt} />{lb.cap && <figcaption>{lb.cap}</figcaption>}</figure>
        </div>
      )}
    </div>
  );
}

export default BrutalTemplate;

/* =====================================================================
   STYLES — neo-brutalist. Pure grid, sharp shadows, high contrast.
   ===================================================================== */

const BR_CSS = `
.br-root{
  --acc-bg:var(--tpl-accent,#5835FF); 
  --accent:#D4FF33; 
  --on-accent:#000000;
  --card:#ffffff; 
  --card-dark:#000000;
  --text-main:#000000;
  --text-light:#ffffff;
  --border:#000000;
  --muted:#555555;
  --nav-h:66px;
  
  --sh:6px 6px 0 #000000; 
  --sh-sm:4px 4px 0 #000000;
  
  --display:"Archivo Black","Bricolage Grotesque","Inter",ui-sans-serif,system-ui,sans-serif;
  --mono:ui-monospace,"JetBrains Mono",Menlo,Consolas,monospace;
  --body:"Inter",ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  
  position:relative; isolation:isolate; color:var(--text-main);
  font-family:var(--body); font-size:16px; font-weight:600; line-height:1.6; -webkit-font-smoothing:antialiased;
  overflow-x:hidden; min-height:100%; scroll-behavior:smooth;
  
  background-color:var(--acc-bg);
}
.br-root *{ box-sizing:border-box; }
.br-root img{ max-width:100%; display:block; }
.br-root a{ color:inherit; }
.br-root h1,.br-root h2,.br-root h3,.br-root h4,.br-root p,.br-root blockquote{ overflow-wrap:anywhere; }
.br-shell{ width:100%; max-width:1280px; margin-inline:auto; padding-inline:clamp(16px,4vw,40px); }
.br-muted{ color:var(--muted); margin:6px 0 0; font-weight:600; }
.br-muted-dark{ color:#aaaaaa; margin:6px 0 0; font-weight:600; }
.br-small{ font-size:.86rem; }
.br-mt{ margin-top:16px; }

/* SMOOTH REVEAL ANIMATIONS */
.br-root.br-ready [data-reveal]{ 
  opacity:0; 
  transform:translateY(30px); 
  transition: opacity 0.5s ease, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1); 
  will-change:opacity, transform; 
}
.br-root.br-ready [data-reveal].br-in{ 
  opacity:1; 
  transform:translateY(0); 
}

/* buttons */
.br-btn{ display:inline-flex; align-items:center; justify-content:center; gap:10px; padding:12px 24px; font-family:var(--display); text-transform:uppercase; font-size:.9rem; font-weight:800; letter-spacing:.02em; border:3px solid var(--border); border-radius:0px; cursor:pointer; text-decoration:none; box-shadow:var(--sh-sm); transition:transform .1s ease, box-shadow .1s ease; }
.br-btn:hover, .br-btn:active{ transform:translate(3px,3px); box-shadow:1px 1px 0 var(--border); }
.br-btn:focus-visible{ outline:3px solid var(--border); outline-offset:2px; }
.br-btn-lime{ background:var(--accent); color:var(--on-accent); }
.br-btn-dark{ background:var(--card-dark); color:var(--text-light); }
.br-btn-light{ background:var(--card); color:var(--text-main); }
.br-btnrow{ display:flex; flex-wrap:wrap; gap:16px; margin-top:28px; }

/* nav */
.br-nav{ position:sticky; top:0; z-index:60; background:#000000; border-bottom:3px solid var(--border); color:var(--text-light); }
.br-nav-in{ display:flex; align-items:center; gap:20px; padding-block:12px; }
.br-logo{ display:flex; align-items:center; gap:12px; text-decoration:none; min-width:0; }
.br-logo-box{ width:42px; height:42px; flex:0 0 auto; display:grid; place-items:center; border:2.5px solid var(--text-light); border-radius:0px; background:transparent; color:var(--text-light); font-family:var(--display); font-size:.95rem; }
.br-logo-txt{ display:flex; flex-direction:column; line-height:1; min-width:0; }
.br-logo-txt b{ font-family:var(--display); font-size:1.1rem; font-weight:800; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:40vw; text-transform:uppercase; }
.br-logo-txt em{ font-style:normal; font-family:var(--mono); font-size:.66rem; letter-spacing:.1em; color:var(--accent); margin-top:4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:40vw; text-transform:uppercase; }
.br-navlinks{ display:flex; gap:18px; margin-inline:auto; }
.br-navlinks a{ text-decoration:none; color:var(--text-light); font-family:var(--display); text-transform:uppercase; font-size:.8rem; font-weight:700; padding:8px 12px; border:2px solid transparent;}
.br-navlinks a:hover{ color:var(--accent); border-bottom-color:var(--accent); }
.br-navlinks a.is-active{ color:var(--accent); border-bottom-color:var(--accent); }
.br-nav-right{ display:flex; align-items:center; gap:12px; }
.br-nav-cta{ padding:10px 20px; font-size:.8rem; box-shadow: 4px 4px 0px var(--accent); border-color:var(--accent); color:var(--text-light); background:transparent; }
.br-nav-cta:hover{ box-shadow: 1px 1px 0px var(--accent); color:var(--text-light); }
.br-menu{ position:relative; display:none; }
.br-menu summary{ list-style:none; width:48px; height:48px; border-radius:0px; cursor:pointer; display:grid; place-items:center; gap:5px; border:2.5px solid var(--text-light); background:transparent; padding:10px; }
.br-menu summary::-webkit-details-marker{ display:none; }
.br-menu-line{ display:block; width:100%; height:3px; background:var(--text-light); }
.br-menu[open] summary .br-menu-line:nth-child(1){ transform:translateY(8px) rotate(45deg); transition:all .2s; }
.br-menu[open] summary .br-menu-line:nth-child(2){ opacity:0; }
.br-menu[open] summary .br-menu-line:nth-child(3){ transform:translateY(-8px) rotate(-45deg); transition:all .2s; }
.br-menu ul{ position:absolute; right:0; top:60px; min-width:220px; list-style:none; margin:0; padding:10px; z-index:50; border:3px solid var(--border); border-radius:0px; background:#ffffff; box-shadow:var(--sh); }
.br-menu ul a{ display:block; padding:12px 14px; text-decoration:none; color:var(--text-main); font-family:var(--display); text-transform:uppercase; font-size:.85rem; font-weight:700; margin-bottom:4px; border: 2px solid transparent;}
.br-menu ul a:hover{ background:var(--accent); border-color:var(--border); }

/* ticker */
.br-ticker{ position:relative; z-index:50; background:var(--accent); border-bottom:4px solid var(--border); overflow:hidden; padding:12px 0; }
.br-ticker-track{ display:flex; white-space:nowrap; font-family:var(--mono); font-weight:800; text-transform:uppercase; font-size:.9rem; letter-spacing:.14em; color:var(--on-accent); animation:br-scroll 20s linear infinite; }
.br-ticker-track span{ padding-right:.5em; }
@keyframes br-scroll{ from{ transform:translateX(0); } to{ transform:translateX(-50%); } }

/* ---- MASONRY / BENTO GRID LAYOUT ---- */
.br-stack{ 
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: clamp(24px, 3vw, 40px);
  padding-block: clamp(40px, 6vh, 80px);
  align-items: start;
}
.br-panel-hero { grid-column: span 12; margin-bottom: 20px;}
.br-panel { grid-column: span 6; display: flex; flex-direction: column; height: 100%;}
.br-about, .br-projects, .br-skills, .br-services, .br-experience, .br-contact-sec { grid-column: span 6; }
.br-gallery, .br-videos, .br-testimonials { grid-column: span 12; }

/* hero */
.br-hero{ display:grid; grid-template-columns:1.2fr 1fr; gap:clamp(30px, 4vw, 60px); align-items:center; }
.br-headline{ font-family:var(--display); font-weight:900; text-transform:uppercase; font-size:clamp(3rem, 6vw, 5.5rem); line-height:.92; letter-spacing:-.02em; margin:0; color:var(--text-light); }
.br-hl{ background:transparent; color:var(--text-light); display:inline-block; }
.br-sub{ margin:20px 0 0; color:var(--text-light); font-size:1.2rem; font-weight:600; max-width:48ch; }
.br-hero-right{ perspective:1100px; }
.br-tilt{ transform-style:preserve-3d; transform:perspective(1100px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg)); transition:transform .2s ease; }
.br-tilt .br-window{ transform:translateZ(0); }

/* overview card inside hero */
.br-ov-top{ display:flex; align-items:flex-start; justify-content:space-between; gap:12px; flex-wrap:wrap; border-bottom: 2px solid var(--border); padding-bottom: 16px;}
.br-ov-label{ font-family:var(--mono); font-weight:700; font-size:.75rem; letter-spacing:.1em; color:var(--muted); text-transform:uppercase;}
.br-ov-big{ font-family:var(--display); font-weight:900; font-size:2.2rem; margin-top:4px; color:var(--text-main); }
.br-ov-chip{ font-family:var(--mono); font-weight:800; font-size:.8rem; padding:6px 12px; background:var(--acc-bg); color:var(--text-light); border-radius: 4px;}
.br-chart{ width:100%; height:90px; margin-top: 16px;}
.br-chart path:first-child{ stroke-dasharray:640; stroke-dashoffset:640; animation:br-draw 1.9s .3s cubic-bezier(.2,.8,.25,1) forwards; }
.br-ov-stats{ display:grid; grid-template-columns:repeat(3,1fr); gap:0; border-top: 2px solid var(--border); margin-top: 16px; padding-top:16px;}
.br-ov-stat{ padding:0 12px; border-right: 2px solid var(--border);}
.br-ov-stat:last-child { border-right: none; }
.br-ov-stat b{ display:block; font-family:var(--display); font-weight:900; font-size:1.6rem; color:var(--text-main); }
.br-ov-stat span{ font-family:var(--mono); font-weight:700; font-size:.7rem; letter-spacing:.05em; color:var(--muted); text-transform:uppercase; }

/* windows (Bento Cards) */
.br-window{ background:var(--card); border:4px solid var(--border); border-radius:4px; box-shadow:var(--sh); overflow:hidden; height:100%; display:flex; flex-direction:column;}
.br-bar{ display:flex; align-items:center; gap:12px; padding:12px 18px; background:var(--card); border-bottom:4px solid var(--border); }
.br-dots{ display:flex; gap:8px; }
.br-dots i{ width:14px; height:14px; border:2.5px solid var(--text-main); }
.br-dots i:nth-child(1){ border-radius:50%; }
.br-dots i:nth-child(2){ border-radius:0px; }
.br-dots i:nth-child(3){ border-radius:0px; }
.br-bar-title{ font-family:var(--display); font-weight:800; font-size:.85rem; letter-spacing:.05em; text-transform:uppercase; color:var(--text-main); }
.br-bar-x{ margin-left:auto; color:var(--text-main); font-weight:800; font-size:1.2rem; }
.br-window-in{ padding:clamp(20px,3vw,32px); flex-grow:1;}

/* Specific Card Themes */
.br-window-lime{ background:var(--accent); color:var(--on-accent); }
.br-bar-lime{ background:var(--accent); }
.br-lime-h{ font-family:var(--display); font-weight:900; font-size:clamp(2rem,3.4vw,3rem); text-transform:uppercase; line-height:1.02; margin:0; color:var(--on-accent); }
.br-lime-p{ margin:16px 0 0; color:var(--on-accent); font-weight:700; font-size:1.1rem; }

.br-window-dark{ background:var(--card-dark); color:var(--text-light); }
.br-bar-dark{ background:var(--card-dark); color:var(--text-light); border-bottom-color: #333; }
.br-bar-dark .br-bar-title, .br-bar-dark .br-bar-x { color: var(--text-light); }
.br-bar-dark .br-dots i { border-color: var(--text-light); }

/* sections */
.br-grid-3{ display:grid; grid-template-columns:repeat(3,1fr); gap:20px; }
.br-grid-2{ display:grid; grid-template-columns:repeat(2,1fr); gap:20px; }
.br-list{ display:flex; flex-direction:column; gap:16px; }

/* nft cards */
.br-nft{ border:3px solid var(--border); border-radius:4px; background:var(--card); box-shadow:var(--sh-sm); overflow:hidden; display:flex; flex-direction:column; transition:transform .1s ease, box-shadow .1s ease; }
.br-nft:hover{ transform:translate(-2px,-4px); box-shadow:6px 8px 0 var(--border); }
.br-nft-media{ position:relative; aspect-ratio:1/1; border-bottom:3px solid var(--border); }
.br-nft-media .br-zoom{ width:100%; height:100%; }
.br-ph{ width:100%; height:100%; display:grid; place-items:center; font-family:var(--display); font-weight:900; font-size:3rem; color:var(--on-accent); background:var(--acc-bg); }
.br-nft-badge{ position:absolute; top:12px; left:12px; width:34px; height:34px; display:grid; place-items:center; border:3px solid var(--border); border-radius:0px; background:var(--accent); color:var(--on-accent); font-weight:900; z-index:2; }
.br-nft-body{ padding:16px; }
.br-nft-titlerow{ display:flex; align-items:center; justify-content:space-between; gap:10px; }
.br-nft-title{ font-family:var(--display); font-weight:900; text-transform:uppercase; font-size:1.05rem; margin:0; }
.br-nft-go{ text-decoration:none; font-weight:900; font-size: 1.2rem; color:var(--text-main); }
.br-nft-cat{ color:var(--muted); font-size:.9rem; margin:4px 0 0; }
.br-floor{ display:inline-block; margin-top:12px; font-family:var(--mono); font-weight:800; font-size:.8rem; color:var(--text-main); background:transparent; padding:0; }

/* leaderboard */
.br-lead{ list-style:none; margin:0; padding:0; display:flex; flex-direction:column; }
.br-lead-row{ display:grid; grid-template-columns:auto auto 1fr auto; align-items:center; gap:16px; padding:16px 0; border-bottom:2px solid #eeeeee; }
.br-lead-row:last-child{ border-bottom:0; }
.br-rank{ font-family:var(--display); font-weight:900; color:var(--text-main); font-size:1.1rem; width:28px; }
.br-lead-ic{ width:44px; height:44px; flex:0 0 auto; display:grid; place-items:center; border:3px solid var(--border); border-radius:0px; background:var(--accent); color:var(--text-main); font-family:var(--display); font-weight:900; font-size:1rem; overflow:hidden; }
.br-lead-ic img{ width:100%; height:100%; object-fit:cover; }
.br-lead-name{ font-weight:800; min-width:0; font-size:1.1rem; text-transform:uppercase;}
.br-lead-name em{ display:block; font-style:normal; font-family:var(--mono); font-weight:700; font-size:.75rem; color:var(--muted); text-transform:uppercase; letter-spacing:.05em; }
.br-lead-bar{ display:none; }
.br-lead-val{ font-family:var(--mono); font-weight:900; font-size:.95rem; color:var(--text-main); text-align:right; }

/* features (Why XChange / Services) */
.br-feats{ display:grid; grid-template-columns:1fr; gap:24px; }
.br-feat{ display:flex; gap:16px; align-items:flex-start; padding:0; border:none; background:transparent; }
.br-feat-ic{ width:32px; height:32px; flex:0 0 auto; display:grid; place-items:center; border:2px solid var(--accent); border-radius:0px; background:transparent; color:var(--accent); font-weight:900; font-size:1.1rem;}
.br-feat-h{ font-family:var(--display); font-weight:800; text-transform:uppercase; font-size:1.1rem; margin:0; letter-spacing:0.02em;}
.br-feat-p{ color:var(--muted-dark); font-size:.95rem; margin:6px 0 0; }

/* mini / timeline / list */
.br-tl{ display:flex; flex-direction:column; gap:24px; }
.br-tl-row{ display:grid; grid-template-columns:1fr; gap:8px; border-bottom: 2px solid #333; padding-bottom: 20px;}
.br-tl-row:last-child { border-bottom: none; padding-bottom:0;}
.br-tl-date{ font-family:var(--mono); font-weight:800; color:var(--accent); font-size:.85rem; }

.br-mini{ border:3px solid var(--border); border-radius:4px; background:var(--card); padding:20px; display:flex; flex-direction:column; gap:10px; text-decoration:none; color:inherit; box-shadow:var(--sh-sm); transition:transform .1s ease;}
.br-mini-link:hover{ transform:translate(-2px,-2px); box-shadow:6px 6px 0 var(--border); }
.br-mini-top{ display:flex; align-items:baseline; justify-content:space-between; gap:12px; }

.br-listitem{ border:3px solid var(--border); border-radius:4px; background:var(--card); padding:20px 24px; text-decoration:none; color:inherit; box-shadow:var(--sh-sm);}

/* gallery / video */
.br-gallery{ display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); gap:20px; }
.br-gitem{ border:4px solid var(--border); border-radius:4px; overflow:hidden; background:var(--card); box-shadow:var(--sh-sm); }
.br-gitem .br-zoom{ width:100%; aspect-ratio:1/1; }
.br-gitem figcaption{ padding:12px 16px; font-weight:700; border-top:3px solid var(--border);}
.br-video{ border:4px solid var(--border); border-radius:4px; overflow:hidden; background:var(--card); box-shadow:var(--sh-sm); }
.br-video-frame{ position:relative; aspect-ratio:16/9; background:#000; border-bottom:3px solid var(--border);}
.br-video-frame iframe{ position:absolute; inset:0; width:100%; height:100%; border:0; }
.br-video figcaption{ padding:14px 18px; font-weight:700; }

/* zoom blur-fill */
.br-zoom{ position:relative; display:block; padding:0; border:0; cursor:zoom-in; color:inherit; overflow:hidden; background:#000; }
.br-zoom-bg{ position:absolute; inset:0; width:100%; height:100%; object-fit:cover; filter:blur(20px) saturate(1.5); transform:scale(1.2); opacity:.6; }
.br-zoom-img{ position:relative; z-index:1; width:100%; height:100%; object-fit:contain; transition:transform .3s ease; }
.br-zoom:hover .br-zoom-img{ transform:scale(1.05); }

/* testimonials */
.br-quote{ border:3px solid var(--border); border-radius:4px; background:var(--card); padding:24px; display:flex; flex-direction:column; gap:16px; box-shadow:var(--sh-sm);}
.br-quote-mark{ font-family:var(--display); font-weight:900; color:var(--acc-bg); font-size:4rem; line-height:.4; height:24px; }
.br-quote blockquote{ margin:0; font-weight:700; font-size:1.1rem; }
.br-quote-by{ display:flex; align-items:center; gap:16px; margin-top:auto; padding-top: 16px; border-top: 2px solid #eee;}
.br-quote-by span{ display:flex; flex-direction:column; line-height:1.3; }
.br-quote-by b{ font-weight:900; font-size:1rem; text-transform:uppercase;}
.br-quote-by em{ font-style:normal; font-weight:700; font-size:.85rem; color:var(--muted); }

/* socials */
.br-socials{ display:flex; flex-wrap:wrap; gap:14px; }
.br-soc{ width:48px; height:48px; display:grid; place-items:center; border:3px solid var(--border); border-radius:0px; background:var(--card); color:var(--text-main); text-decoration:none; box-shadow:var(--sh-sm); transition:transform .1s, box-shadow .1s, background .1s; }
.br-soc:hover{ transform:translate(2px,2px); box-shadow:2px 2px 0 var(--border); background:var(--accent); }
.br-soc svg{ width:22px; height:22px; }

/* contact */
.br-contact{ display:grid; grid-template-columns:1fr; gap:30px; }
.br-join-h{ font-family:var(--display); font-weight:900; text-transform:uppercase; font-size:clamp(1.8rem,4vw,2.5rem); line-height:1.05; margin:0; }
.br-contact-rows{ display:flex; flex-direction:column; gap:16px; margin-block:24px; }
.br-crow{ display:flex; align-items:center; gap:16px; text-decoration:none; color:inherit; word-break:break-word; font-weight:700; font-size:1.1rem; }
.br-crow span:first-child{ color:var(--acc-bg); width:28px; text-align:center; flex:0 0 auto; font-size:1.4rem; font-weight:900; }
.br-crow:hover{ color:var(--acc-bg); }
.br-formcard{ border:3px solid var(--border); border-radius:4px; background:var(--card); padding:clamp(20px,3vw,32px); box-shadow:var(--sh-sm);}
.br-formcard :where(input, textarea, select){ width:100%; font-family:var(--mono); font-weight:700; font-size:1rem; color:var(--text-main); background:#f4f4f4; border:3px solid var(--border); border-radius:0px; padding:14px 18px; margin-bottom:18px; }
.br-formcard :where(input, textarea, select):focus{ outline:none; background:#ffffff; border-color:var(--acc-bg); }
.br-formcard :where(input, textarea, select)::placeholder{ color:#888888; font-weight:600; }
.br-formcard textarea{ min-height:140px; resize:vertical; }
.br-formcard :where(button, [type="submit"]){ width:100%; font-family:var(--display); font-weight:900; font-size:1.1rem; text-transform:uppercase; cursor:pointer; color:var(--on-accent); background:var(--accent); border:3px solid var(--border); border-radius:0px; padding:16px 20px; box-shadow:var(--sh-sm); transition:transform .1s, box-shadow .1s; }
.br-formcard :where(button, [type="submit"]):hover{ transform:translate(3px,3px); box-shadow:1px 1px 0 var(--border); }
.br-formcard label{ color:var(--text-main); font-weight:800; font-size:.9rem; text-transform:uppercase; margin-bottom: 6px; display:block;}

/* footer - Pure Black matching the image */
.br-footer{ position:relative; z-index:20; background:#000000; color:#ffffff; border-top:4px solid var(--border);}
.br-footer-in{ display:grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap:40px; padding-block:60px 40px; }
.br-foot-col { display: flex; flex-direction: column; gap: 16px; }
.br-footer .br-logo-box{ border-color:#ffffff; color:#ffffff;}
.br-foot-label { font-family:var(--mono); font-size:0.8rem; font-weight:700; color:#888; text-transform:uppercase; margin-bottom: 8px;}
.br-footer-nav{ display:flex; flex-direction:column; gap:12px; }
.br-footer-nav a{ text-decoration:none; color:#cccccc; font-family:var(--body); font-weight:600; font-size:.95rem; }
.br-footer-nav a:hover{ color:var(--accent); }
.br-foot-soc .br-soc{ width:40px; height:40px; box-shadow:none; border-color:#333; background:transparent; color:#fff;}
.br-foot-soc .br-soc:hover{ background:var(--accent); border-color:var(--accent); color:#000;}
.br-foot-copy{ color:#666666; font-weight:600; font-size:.85rem; margin-top: auto; padding-top:20px;}

/* lightbox */
.br-lb{ position:fixed; inset:0; z-index:1000; display:grid; place-items:center; padding:clamp(16px,4vw,48px); background:rgba(0,0,0,.9); animation:br-fade .2s ease both; }
.br-lb-fig{ margin:0; max-width:94vw; max-height:92vh; display:flex; flex-direction:column; gap:12px; align-items:center; animation:br-pop .3s cubic-bezier(.2,.85,.25,1) both; }
.br-lb-fig img{ max-width:92vw; max-height:84vh; width:auto; height:auto; object-fit:contain; border:4px solid var(--border); background:#fff; }
.br-lb-fig figcaption{ color:#ffffff; font-weight:800; font-size:1rem; text-align:center; text-transform:uppercase;}
.br-lb-close{ position:fixed; top:24px; right:24px; z-index:1001; width:50px; height:50px; border:4px solid var(--border); border-radius:0; cursor:pointer; color:var(--on-accent); background:var(--accent); font-size:1.4rem; font-weight:900; box-shadow:var(--sh-sm); transition:transform .1s, box-shadow .1s; }
.br-lb-close:hover{ transform:translate(3px,3px); box-shadow:2px 2px 0 var(--border); }
.br-lb-close:focus-visible{ outline:3px solid #fff; }
@keyframes br-fade{ from{opacity:0;} to{opacity:1;} }
@keyframes br-pop{ from{opacity:0; transform:translateY(30px) scale(.97);} to{opacity:1; transform:none;} }

/* responsive */
@media (max-width:1080px){ 
  .br-stack { grid-template-columns: repeat(2, 1fr); }
  .br-panel { grid-column: span 2; }
  .br-about, .br-projects, .br-skills, .br-services, .br-experience, .br-contact-sec { grid-column: span 2; }
}
@media (max-width:880px){
  .br-hero{ grid-template-columns:1fr; }
  .br-navlinks{ display:none; }
  .br-menu{ display:block; }
  .br-contact{ grid-template-columns:1fr; }
  .br-headline{ font-size: 3.5rem; }
}
@media (max-width:620px){
  .br-grid-2, .br-grid-3{ grid-template-columns:1fr; }
  .br-lead-row{ grid-template-columns:auto auto 1fr auto; }
  .br-tl-row{ grid-template-columns:1fr; gap:6px; }
  .br-ov-stats{ grid-template-columns:1fr 1fr; border-right:none;}
  .br-ov-stat:nth-child(2) { border-right:none; }
  .br-ov-stat:nth-child(3) { grid-column: span 2; border-top: 2px solid var(--border); padding-top:12px; margin-top:12px;}
  .br-nav-cta{ display:none; }
}

@media (prefers-reduced-motion: reduce){
  .br-root{ scroll-behavior:auto; }
  .br-root *{ animation:none !important; transition:none !important; }
  .br-root.br-ready [data-reveal]{ opacity:1 !important; transform:none !important; }
  .br-chart path{ stroke-dashoffset:0 !important; }
  .br-tilt{ transform:none !important; }
}
`;
