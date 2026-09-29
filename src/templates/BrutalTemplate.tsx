"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import type { PublicPortfolio } from "@/lib/publicTypes";
import { dateRange, videoEmbed, ext } from "@/lib/publicTypes";
import { ContactForm } from "@/components/ContactForm";

/* =====================================================================
   BrutalTemplate — "Brutal" — neo-brutalist Web3-marketplace theme.
   UPDATED: Better typography, fixed scrolling overlap, improved mobile nav.
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

/* ---- social brand icons (auto-detected) ---- */
const SOCIAL_ICONS: Record<string, string> = {
  github: "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12",
  gitlab: "M23.955 13.587l-1.342-4.135-2.664-8.189c-.135-.423-.73-.423-.867 0L16.418 9.45H7.582L4.919 1.263C4.783.84 4.185.84 4.05 1.263L1.386 9.452.044 13.587c-.121.375.014.789.331 1.023L12 23.054l11.625-8.443c.318-.235.453-.647.33-1.024",
  linkedin: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z",
  youtube: "M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
  instagram: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.332.014 7.052.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z",
  facebook: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
  dribbble: "M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zm9.885 11.441c-2.575-.422-4.943-.445-7.103-.073-.244-.563-.497-1.125-.767-1.68 2.31-1 4.165-2.358 5.548-4.082 1.35 1.594 2.197 3.619 2.322 5.835zm-3.842-7.282c-1.205 1.554-2.868 2.783-4.986 3.68-1.016-1.861-2.178-3.676-3.488-5.438.779-.197 1.591-.314 2.431-.314 2.275 0 4.368.809 6.043 2.072zM7.527 3.166c1.299 1.744 2.45 3.542 3.457 5.39-2.514.75-5.418.983-8.712.733.523-2.708 2.297-4.972 4.671-6.127.194.001.392.002.584.004zM2.096 12.42c3.639.284 6.847.021 9.616-.784.276.523.532 1.056.767 1.6-2.866.867-5.293 2.559-7.24 5.113C3.633 16.62 2.437 14.681 2.096 12.42zm4.674 6.89c1.774-2.33 3.964-3.832 6.564-4.566.828 2.145 1.451 4.421 1.865 6.827-2.86 1.219-6.058.73-8.429-2.261zm10.324.822c-.384-2.219-.959-4.339-1.72-6.352 1.842-.29 3.887-.211 6.135.234-.618 2.586-2.339 4.741-4.415 6.118z",
  behance: "M22 7h-7V5h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-1.729-5.564-5.675 0-3.91 2.325-5.92 5.466-5.92 3.082 0 4.964 1.782 5.375 4.426.078.506.109 1.188.095 2.14H15.97c.13 3.211 3.483 3.312 4.588 2.029h3.168zm-7.686-4h4.965c-.105-1.547-1.136-2.219-2.477-2.219-1.466 0-2.277.768-2.488 2.219zm-9.574 6.988H0V5.021h6.953c5.476.081 5.58 5.444 2.72 6.906 3.461 1.26 3.577 8.061-3.207 8.061zM3 11h3.584c2.508 0 2.906-3-.312-3H3v3zm3.391 3H3v3.016h3.341c3.055 0 2.868-3.016.05-3.016z",
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
  if (/facebook|fb\.com|fb\.me/.test(H)) return "facebook";
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
  const accent = data.accent || "#6B4CF0";

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
    const io = new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("br-in"); io.unobserve(e.target); } }), { threshold: 0.1, rootMargin: "0px 0px -8% 0px" });
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

  // 3D pointer tilt
  useEffect(() => {
    const el = tiltRef.current;
    if (!el) return;
    const mm = (q: string) => (typeof window.matchMedia === "function" ? window.matchMedia(q) : null);
    if (mm("(prefers-reduced-motion: reduce)")?.matches) return;
    if (mm("(pointer: fine)") && !mm("(pointer: fine)")!.matches) return;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty("--rx", `${(-y * 6).toFixed(2)}deg`);
      el.style.setProperty("--ry", `${(x * 8).toFixed(2)}deg`);
    };
    const reset = () => { el.style.setProperty("--rx", "0deg"); el.style.setProperty("--ry", "0deg"); };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", reset);
    return () => { el.removeEventListener("pointermove", onMove); el.removeEventListener("pointerleave", reset); };
  }, []);

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

  const bar = (title: string) => (
    <div className="br-bar"><span className="br-dots" aria-hidden><i /><i /><i /></span><span className="br-bar-title">{title}</span><span className="br-bar-x" aria-hidden>⤢</span></div>
  );

  const sections: Record<string, () => ReactNode> = {
    about: () => {
      const aboutText = p?.about ?? p?.bio ?? null;
      return (
        <div className="br-window br-window-lime">
          {bar("ABOUT / LATEST")}
          <div className="br-window-in">
            <h3 className="br-lime-h">{p?.tagline || `${nick} is live.`}</h3>
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
          <div className="br-window-in"><div className="br-grid-3">
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
          {bar("TOP SKILLS · LEADERBOARD")}
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
      <div className="br-window">
        {bar(`WHY ${nick.toUpperCase()}?`)}
        <div className="br-window-in"><div className="br-feats">
          {data.services.map((s) => (<div key={s.id} className="br-feat"><span className="br-feat-ic" aria-hidden>◆</span><div><h4 className="br-feat-h">{s.title}</h4>{s.description && <p className="br-feat-p">{s.description}</p>}{s.price && <span className="br-floor">{s.price}</span>}</div></div>))}
        </div></div>
      </div>
    ),
    experience: () => (
      <div className="br-window">
        {bar("EXPERIENCE / TIMELINE")}
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
      <div className="br-window">{bar("CERTIFICATIONS")}<div className="br-window-in"><div className="br-grid-3">
        {data.certifications.map((c) => { const body = (<><span className="br-feat-ic" aria-hidden>✓</span><h4 className="br-feat-h">{c.name}</h4>{c.issuer && <p className="br-muted br-small">{c.issuer}</p>}{oneDate(c.issue_date) && <span className="br-floor">{oneDate(c.issue_date)}</span>}</>); return c.url ? <a key={c.id} className="br-mini br-mini-link" href={ext(c.url)} target="_blank" rel="noopener noreferrer">{body}</a> : <div key={c.id} className="br-mini">{body}</div>; })}
      </div></div></div>
    ),
    achievements: () => (
      <div className="br-window">{bar("ACHIEVEMENTS")}<div className="br-window-in"><div className="br-grid-3">
        {data.achievements.map((a) => (<div key={a.id} className="br-mini"><span className="br-feat-ic" aria-hidden>★</span><h4 className="br-feat-h">{a.title}</h4>{oneDate(a.date) && <span className="br-floor">{oneDate(a.date)}</span>}{a.description && <p className="br-muted br-small">{a.description}</p>}</div>))}
      </div></div></div>
    ),
    publications: () => (
      <div className="br-window">{bar("PUBLICATIONS")}<div className="br-window-in"><div className="br-list">
        {data.publications.map((pub) => { const meta = [pub.publisher, oneDate(pub.date)].filter(Boolean).join(" · "); const body = (<><div className="br-mini-top"><h4 className="br-feat-h">{pub.title}</h4>{pub.url && <span aria-hidden>↗</span>}</div>{meta && <p className="br-muted br-small">{meta}</p>}{pub.description && <p className="br-muted">{pub.description}</p>}</>); return pub.url ? <a key={pub.id} className="br-listitem br-mini-link" href={ext(pub.url)} target="_blank" rel="noopener noreferrer">{body}</a> : <div key={pub.id} className="br-listitem">{body}</div>; })}
      </div></div></div>
    ),
    gallery: () => (
      <div className="br-window">{bar("GALLERY / VAULT")}<div className="br-window-in"><div className="br-gallery">
        {data.gallery.map((g) => g.image_url ? (<figure key={g.id} className="br-gitem"><ZImg src={g.image_url} alt={g.caption || "Gallery image"} cap={g.caption || undefined} />{g.caption && <figcaption className="br-muted br-small">{g.caption}</figcaption>}</figure>) : null)}
      </div></div></div>
    ),
    videos: () => (
      <div className="br-window">{bar("VIDEOS")}<div className="br-window-in"><div className="br-grid-2">
        {data.videos.map((v) => { const src = v.url ? videoEmbed(v.url) : null; if (!src) return null; return (<figure key={v.id} className="br-video"><div className="br-video-frame"><iframe src={src} title={v.title || "Video"} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div>{v.title && <figcaption className="br-muted br-small">{v.title}</figcaption>}</figure>); })}
      </div></div></div>
    ),
    testimonials: () => (
      <div className="br-window">{bar("WHAT CLIENTS SAY")}<div className="br-window-in"><div className="br-grid-3">
        {data.testimonials.map((t) => (<figure key={t.id} className="br-quote"><span className="br-quote-mark" aria-hidden>&ldquo;</span>{t.quote && <blockquote>{t.quote}</blockquote>}<figcaption className="br-quote-by"><span className="br-lead-ic" aria-hidden>{t.avatar_url ? <img src={t.avatar_url} alt="" loading="lazy" /> : initials(t.author, "•")}</span><span>{t.author && <b>{t.author}</b>}{t.role && <em className="br-muted">{t.role}</em>}</span></figcaption></figure>))}
      </div></div></div>
    ),
  };

  const headlineText = p?.tagline || `${name}. Built different.`;
  const heroStats = [
    { n: data.projects.length, label: "Projects" },
    { n: data.skills.length, label: "Skills" },
    { n: data.testimonials.length, label: "Clients" },
  ].filter((s) => s.n > 0).slice(0, 3);
  const tickerWords = [name, p?.title, p?.location, p?.availability, "Portfolio"].filter(Boolean) as string[];
  const ticker = tickerWords.length ? tickerWords.join("  ✦  ") : "Portfolio  ✦  Available for work";
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
            {contactHref && <a className="br-btn br-btn-lime br-nav-cta" href={contactHref}>Connect</a>}
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
      <div className="br-ticker" aria-hidden><div className="br-ticker-track"><span>{`${ticker}  ✦  `.repeat(6)}</span><span>{`${ticker}  ✦  `.repeat(6)}</span></div></div>

      {/* STACKING PANELS */}
      <main className="br-stack">
        {/* HERO */}
        <section className="br-panel br-panel-first">
          <div className="br-shell br-panel-in" data-reveal>
            <div className="br-hero">
              <div className="br-hero-left">
                <span className="br-eyebrow">{p?.title || "Portfolio"}</span>
                <h1 className="br-headline">{headlineText.split(/\s+/).map((w, i) => <span key={i} className={i % 2 === 1 ? "br-hl" : "br-hlx"}>{w} </span>)}</h1>
                {p?.bio && <p className="br-sub">{p.bio}</p>}
                <div className="br-btnrow">
                  {has.projects && <a className="br-btn br-btn-lime" href="#work">Start Trading <span aria-hidden>→</span></a>}
                  {contactHref && <a className="br-btn br-btn-dark" href={contactHref}>Explore <span aria-hidden>→</span></a>}
                </div>
                {socialRow("br-hero-soc")}
              </div>

              <div className="br-hero-right br-tilt" ref={tiltRef}>
                {p?.avatar_url && (
                  <div className="br-window br-photo">
                    {bar("PROFILE")}
                    <div className="br-photo-in"><ZImg src={p.avatar_url} alt={name} /></div>
                  </div>
                )}
                <div className="br-window br-overview">
                  {bar("OVERVIEW")}
                  <div className="br-window-in">
                    <div className="br-ov-top">
                      <div><span className="br-ov-label">STATUS</span><div className="br-ov-big">{p?.availability || "Available"}</div></div>
                      {p?.location && <span className="br-ov-chip">{p.location}</span>}
                    </div>
                    <svg className="br-chart" viewBox="0 0 300 80" preserveAspectRatio="none" aria-hidden>
                      <path d="M0 62 L30 54 L60 58 L90 40 L120 46 L150 26 L180 36 L210 20 L240 30 L270 12 L300 22" fill="none" stroke="var(--accent)" strokeWidth="3" />
                      <path d="M0 62 L30 54 L60 58 L90 40 L120 46 L150 26 L180 36 L210 20 L240 30 L270 12 L300 22 L300 80 L0 80 Z" fill="var(--accent)" opacity=".14" />
                    </svg>
                    {heroStats.length > 0 && (
                      <div className="br-ov-stats">{heroStats.map((s) => (<div key={s.label} className="br-ov-stat"><b>{s.n}</b><span>{s.label}</span></div>))}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* DATA SECTION PANELS */}
        {order.map((k, i) => (
          <section key={k} id={SEC_ID[k] || k} className="br-panel" data-reveal style={{ zIndex: 2 + i } as CSSProperties}>
            <div className="br-shell br-panel-in">{sections[k] ? sections[k]() : null}</div>
          </section>
        ))}

        {/* CONTACT PANEL */}
        {username && (
          <section id="contact" className="br-panel" data-reveal style={{ zIndex: 2 + order.length } as CSSProperties}>
            <div className="br-shell br-panel-in">
              <div className="br-window">
                {bar("JOIN THE FUTURE")}
                <div className="br-window-in br-contact">
                  <div className="br-contact-left">
                    <h3 className="br-join-h">Let&apos;s build something together.</h3>
                    <div className="br-contact-rows">
                      {p?.email && <a className="br-crow" href={`mailto:${p.email}`}><span aria-hidden>✉</span><span>{p.email}</span></a>}
                      {p?.phone && <a className="br-crow" href={`tel:${p.phone}`}><span aria-hidden>☎</span><span>{p.phone}</span></a>}
                      {p?.website && <a className="br-crow" href={ext(p.website)} target="_blank" rel="noopener noreferrer"><span aria-hidden>◈</span><span>{p.website.replace(/^https?:\/\//, "")}</span></a>}
                      {p?.location && <div className="br-crow"><span aria-hidden>⌖</span><span>{p.location}</span></div>}
                    </div>
                    {socialRow()}
                  </div>
                  <div className="br-formcard"><ContactForm username={username} /></div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* FOOTER */}
      <footer className="br-footer">
        <div className="br-shell br-footer-in">
          <a className="br-logo br-logo-foot" href="#top"><span className="br-logo-box" aria-hidden>{mono}</span><span className="br-logo-txt"><b>{name}</b>{p?.title && <em>{p.title}</em>}</span></a>
          {navItems.length > 1 && <nav className="br-footer-nav" aria-label="Footer">{navItems.filter((n) => n.href !== "#top").map((it) => <a key={it.href} href={it.href}>{it.label}</a>)}</nav>}
          <div className="br-footer-right">{socialRow("br-foot-soc")}<span className="br-foot-copy">© {year} {name}{!data.hide_branding && <> · <a className="br-madewith" href="https://folio.assetprim.com" target="_blank" rel="noopener noreferrer">Folio</a></>}</span></div>
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
   STYLES — neo-brutalist. Canvas = data.accent; lime is the fixed pop.
   Sections are sticky-stacking cards: each rises and covers the prev.
   ===================================================================== */

const BR_CSS = `
.br-root{
  --acc-bg:var(--tpl-accent,#6B4CF0); --bg-solid:var(--acc-bg);
  --accent:#d4ff33; --on-accent:#0b0b10;
  --card:#101018; --card2:#181826; --wht:#ffffff; --muted:rgba(255,255,255,0.9);
  --nav-h:66px;
  --sh:6px 6px 0 #08060f; --sh-sm:4px 4px 0 #08060f;
  --display:"Archivo Black","Bricolage Grotesque","Inter",ui-sans-serif,system-ui,sans-serif;
  --mono:ui-monospace,"JetBrains Mono",Menlo,Consolas,monospace;
  --body:"Inter",ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  position:relative; isolation:isolate; color:var(--wht);
  font-family:var(--body); font-size:16px; font-weight:600; line-height:1.6; -webkit-font-smoothing:antialiased;
  overflow-x:clip; min-height:100%; scroll-behavior:smooth;
  background-color:var(--acc-bg);
  background-image:
    radial-gradient(120% 80% at 50% -12%, color-mix(in srgb, var(--acc-bg) 60%, #ffffff 40%), transparent 62%),
    linear-gradient(180deg, var(--acc-bg), color-mix(in srgb, var(--acc-bg) 70%, #000000 30%));
}
.br-root *{ box-sizing:border-box; }
.br-root img{ max-width:100%; display:block; }
.br-root a{ color:inherit; }
.br-root h1,.br-root h2,.br-root h3,.br-root h4,.br-root p,.br-root blockquote{ overflow-wrap:anywhere; }
.br-shell{ width:100%; max-width:1180px; margin-inline:auto; padding-inline:clamp(16px,3.5vw,32px); }
.br-muted{ color:var(--muted); margin:6px 0 0; font-weight:500; }
.br-small{ font-size:.86rem; }
.br-mt{ margin-top:16px; }

/* content rises up from below as it enters view */
.br-root.br-ready [data-reveal]{ opacity:0; transform:translateY(72px) scale(.985); transition:opacity .55s ease, transform .85s cubic-bezier(.16,.84,.28,1); will-change:opacity, transform; }
.br-root.br-ready [data-reveal].br-in{ opacity:1; transform:none; }

/* buttons */
.br-btn{ display:inline-flex; align-items:center; gap:9px; padding:13px 22px; font-family:var(--display); text-transform:uppercase; font-size:.85rem; font-weight:700; letter-spacing:.02em; border:2.5px solid #000; border-radius:5px; cursor:pointer; text-decoration:none; box-shadow:var(--sh-sm); transition:transform .1s ease, box-shadow .1s ease; }
.br-btn:hover, .br-btn:active{ transform:translate(3px,3px); box-shadow:1px 1px 0 #0a0a12; }
.br-btn:focus-visible{ outline:3px solid #000; outline-offset:2px; }
.br-btn-lime{ background:var(--accent); color:var(--on-accent); }
.br-btn-dark{ background:#0b0b10; color:var(--wht); }
.br-btnrow{ display:flex; flex-wrap:wrap; gap:14px; margin-top:26px; }

/* nav (sticky, always on top) */
.br-nav{ position:sticky; top:0; z-index:60; background:var(--bg); border-bottom:3px solid #000; }
.br-nav-in{ display:flex; align-items:center; gap:16px; padding-block:11px; }
.br-logo{ display:flex; align-items:center; gap:10px; text-decoration:none; min-width:0; }
.br-logo-box{ width:42px; height:42px; flex:0 0 auto; display:grid; place-items:center; border:2.5px solid #000; border-radius:6px; background:var(--accent); color:#0b0b10; font-family:var(--display); font-size:.95rem; box-shadow:3px 3px 0 #0a0a12; }
.br-logo-txt{ display:flex; flex-direction:column; line-height:1; min-width:0; }
.br-logo-txt b{ font-family:var(--display); font-size:1.1rem; font-weight:800; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:40vw; }
.br-logo-txt em{ font-style:normal; font-family:var(--mono); font-size:.66rem; letter-spacing:.1em; color:var(--wht); opacity:.85; margin-top:4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:40vw; }
.br-navlinks{ display:flex; gap:4px; margin-inline:auto; padding:5px; border:2.5px solid #000; border-radius:999px; background:#0b0b10; box-shadow:3px 3px 0 #0a0a12; }
.br-navlinks a{ text-decoration:none; color:var(--wht); font-family:var(--display); text-transform:uppercase; font-size:.76rem; font-weight:700; padding:8px 16px; border-radius:999px; }
.br-navlinks a:hover{ color:var(--accent); }
.br-navlinks a.is-active{ background:var(--accent); color:#0b0b10; }
.br-nav-right{ display:flex; align-items:center; gap:12px; }
.br-nav-cta{ padding:11px 20px; font-size:.8rem; }
.br-menu{ position:relative; display:none; }
.br-menu summary{ list-style:none; width:48px; height:48px; border-radius:8px; cursor:pointer; display:grid; place-items:center; gap:5px; border:2.5px solid #000; background:#0b0b10; box-shadow:3px 3px 0 #0a0a12; padding:10px; }
.br-menu summary::-webkit-details-marker{ display:none; }
.br-menu-line{ display:block; width:100%; height:3px; background:var(--wht); border-radius:2px; }
.br-menu[open] summary .br-menu-line:nth-child(1){ transform:translateY(8px) rotate(45deg); transition:all .2s; }
.br-menu[open] summary .br-menu-line:nth-child(2){ opacity:0; }
.br-menu[open] summary .br-menu-line:nth-child(3){ transform:translateY(-8px) rotate(-45deg); transition:all .2s; }
.br-menu ul{ position:absolute; right:0; top:60px; min-width:220px; list-style:none; margin:0; padding:10px; z-index:50; border:3px solid #000; border-radius:12px; background:#0b0b10; box-shadow:var(--sh); }
.br-menu ul a{ display:block; padding:12px 14px; border-radius:6px; text-decoration:none; color:var(--wht); font-family:var(--display); text-transform:uppercase; font-size:.85rem; font-weight:700; margin-bottom:4px; }
.br-menu ul a:hover{ background:var(--accent); color:#0b0b10; }

/* ticker */
.br-ticker{ position:relative; z-index:50; background:#0b0b10; border-bottom:3px solid #000; overflow:hidden; padding:10px 0; }
.br-ticker-track{ display:flex; white-space:nowrap; font-family:var(--display); font-weight:700; text-transform:uppercase; font-size:.86rem; letter-spacing:.14em; color:var(--accent); animation:br-scroll 26s linear infinite; }
.br-ticker-track span{ padding-right:.5em; }
@keyframes br-scroll{ from{ transform:translateX(0); } to{ transform:translateX(-50%); } }

/* ---- OVERLAP-STACKING PANELS (normal scroll; each covers the previous) ---- */
.br-stack{ position:relative; }
.br-panel{ position:relative; margin-top:-40px; border:3px solid #000; border-bottom:0; border-radius:34px 34px 0 0;
  background-color:var(--bg-solid);
  background-image:linear-gradient(180deg, color-mix(in srgb, var(--acc-bg) 82%, #ffffff 18%), var(--acc-bg) 44%);
  box-shadow:0 -22px 54px -12px rgba(6,4,22,.6), inset 0 3px 0 rgba(255,255,255,.18); }
.br-panel-first{ margin-top:0; border:0; border-radius:0; box-shadow:none; background:transparent; background-image:none; }
/* Added massive bottom padding to fix the overlap cutoff issue so every detail can be scrolled */
.br-panel-in{ min-height:calc(100svh - var(--nav-h)); display:flex; flex-direction:column; justify-content:center; padding-top:clamp(44px,7vh,92px); padding-bottom:clamp(80px,14vh,160px); }

/* hero */
.br-hero{ display:grid; grid-template-columns:1.12fr .88fr; gap:clamp(20px,3vw,44px); align-items:center; }
.br-eyebrow{ display:inline-block; font-family:var(--mono); text-transform:uppercase; font-weight:700; letter-spacing:.2em; font-size:.8rem; color:#0b0b10; background:var(--accent); padding:6px 14px; border:2px solid #000; box-shadow:3px 3px 0 #0a0a12; }
.br-headline{ font-family:var(--display); font-weight:900; text-transform:uppercase; font-size:clamp(2.4rem,6.4vw,4.6rem); line-height:.94; letter-spacing:-.01em; margin:22px 0 0; color:#0b0b10; }
.br-hl{ background:var(--wht); color:#0b0b10; box-shadow:4px 4px 0 #0a0a12; padding:0 .1em; margin-right:.06em; box-decoration-break:clone; -webkit-box-decoration-break:clone; }
.br-hlx{ margin-right:.06em; }
.br-sub{ margin:24px 0 0; color:var(--wht); font-size:1.12rem; font-weight:700; max-width:48ch; }
.br-hero-soc{ margin-top:26px; }
.br-hero-right{ display:flex; flex-direction:column; gap:16px; perspective:1100px; }
.br-tilt{ transform-style:preserve-3d; transform:perspective(1100px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg)); transition:transform .2s ease; }
.br-tilt .br-window{ transform:translateZ(0); }
.br-photo .br-photo-in{ aspect-ratio:16/10; border-top:2.5px solid #000; }
.br-photo .br-zoom{ width:100%; height:100%; }

.br-overview .br-window-in{ display:flex; flex-direction:column; gap:16px; }
.br-ov-top{ display:flex; align-items:flex-start; justify-content:space-between; gap:12px; flex-wrap:wrap; }
.br-ov-label{ font-family:var(--mono); font-weight:700; font-size:.7rem; letter-spacing:.16em; color:var(--muted); }
.br-ov-big{ font-family:var(--display); font-weight:800; font-size:1.6rem; text-transform:uppercase; margin-top:6px; color:var(--accent); }
.br-ov-chip{ font-family:var(--mono); font-weight:700; font-size:.76rem; padding:6px 12px; border:2px solid #000; border-radius:4px; background:var(--accent); color:#0b0b10; }
.br-chart{ width:100%; height:74px; }
.br-chart path:first-child{ stroke-dasharray:640; stroke-dashoffset:640; animation:br-draw 1.9s .3s cubic-bezier(.2,.8,.25,1) forwards; }
@keyframes br-draw{ to{ stroke-dashoffset:0; } }
.br-ov-stats{ display:grid; grid-template-columns:repeat(3,1fr); gap:12px; }
.br-ov-stat{ border:2px solid #000; border-radius:6px; padding:12px 14px; background:#0b0b10; }
.br-ov-stat b{ display:block; font-family:var(--display); font-weight:900; font-size:1.5rem; color:var(--accent); }
.br-ov-stat span{ font-family:var(--mono); font-weight:700; font-size:.66rem; letter-spacing:.1em; color:var(--muted); text-transform:uppercase; }

/* windows */
.br-window{ background:var(--card); border:3px solid #000; border-radius:12px; box-shadow:var(--sh); overflow:hidden; }
.br-bar{ display:flex; align-items:center; gap:12px; padding:12px 18px; background:#0b0b10; border-bottom:3px solid #000; }
.br-dots{ display:flex; gap:8px; }
.br-dots i{ width:14px; height:14px; border:2px solid var(--wht); }
.br-dots i:nth-child(1){ border-radius:50%; }
.br-dots i:nth-child(2){ border-radius:2px; }
.br-dots i:nth-child(3){ border-radius:2px; }
.br-bar-title{ font-family:var(--mono); font-weight:700; font-size:.76rem; letter-spacing:.16em; text-transform:uppercase; color:var(--accent); }
.br-bar-x{ margin-left:auto; color:var(--muted); font-weight:800; font-size:1.1rem; }
.br-window-in{ padding:clamp(20px,3vw,32px); }
.br-window-lime{ background:var(--accent); color:#0b0b10; }
.br-window-lime .br-bar{ background:var(--accent); }
.br-window-lime .br-bar-title{ color:#0b0b10; }
.br-window-lime .br-dots i{ border-color:#0b0b10; }
.br-window-lime .br-bar-x{ color:rgba(11,11,16,.7); }
.br-lime-h{ font-family:var(--display); font-weight:900; font-size:clamp(1.6rem,3.4vw,2.6rem); text-transform:uppercase; line-height:1.02; margin:0; color:#0b0b10; }
.br-lime-p{ margin:16px 0 0; max-width:62ch; color:#111119; font-weight:700; font-size:1.05rem; }
.br-window-lime .br-btn-dark{ margin-top:22px; }

/* sections */
.br-grid-3{ display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
.br-grid-2{ display:grid; grid-template-columns:repeat(2,1fr); gap:16px; }
.br-list{ display:flex; flex-direction:column; gap:14px; }

/* nft cards */
.br-nft{ border:2.5px solid #000; border-radius:8px; background:#0c0c14; box-shadow:var(--sh-sm); overflow:hidden; display:flex; flex-direction:column; transform-style:preserve-3d; transition:transform .16s ease, box-shadow .16s ease; }
.br-nft:hover{ transform:perspective(760px) rotateX(4deg) translate(-2px,-4px); box-shadow:9px 11px 0 #08060f; }
.br-nft-media{ position:relative; aspect-ratio:1/1; border-bottom:2.5px solid #000; }
.br-nft-media .br-zoom{ width:100%; height:100%; }
.br-ph{ width:100%; height:100%; display:grid; place-items:center; font-family:var(--display); font-weight:800; font-size:2.2rem; color:#0b0b10; background:var(--accent); }
.br-nft-badge{ position:absolute; top:10px; left:10px; width:30px; height:30px; display:grid; place-items:center; border:2px solid #000; border-radius:6px; background:var(--accent); color:#0b0b10; font-weight:800; z-index:2; }
.br-nft-body{ padding:14px 16px; }
.br-nft-titlerow{ display:flex; align-items:center; justify-content:space-between; gap:10px; }
.br-nft-title{ font-family:var(--display); font-weight:800; text-transform:uppercase; font-size:.98rem; margin:0; }
.br-nft-go{ text-decoration:none; font-weight:800; color:var(--accent); }
.br-nft-cat{ color:var(--muted); font-size:.85rem; margin:4px 0 0; }
.br-floor{ display:inline-block; margin-top:10px; font-family:var(--mono); font-weight:700; font-size:.76rem; color:#0b0b10; background:var(--accent); padding:4px 10px; border:2px solid #000; border-radius:6px; }

/* leaderboard */
.br-lead{ list-style:none; margin:0; padding:0; display:flex; flex-direction:column; }
.br-lead-row{ display:grid; grid-template-columns:auto auto 1fr 1.2fr auto; align-items:center; gap:14px; padding:14px 0; border-bottom:2px solid rgba(255,255,255,.15); }
.br-lead-row:last-child{ border-bottom:0; }
.br-rank{ font-family:var(--display); font-weight:800; color:var(--accent); font-size:1.1rem; width:28px; }
.br-lead-ic{ width:40px; height:40px; flex:0 0 auto; display:grid; place-items:center; border:2px solid #000; border-radius:8px; background:var(--accent); color:#0b0b10; font-family:var(--display); font-weight:800; font-size:.85rem; overflow:hidden; }
.br-lead-ic img{ width:100%; height:100%; object-fit:cover; }
.br-lead-name{ font-weight:800; min-width:0; font-size:1.05rem; }
.br-lead-name em{ display:block; font-style:normal; font-family:var(--mono); font-weight:700; font-size:.7rem; color:var(--muted); text-transform:uppercase; letter-spacing:.08em; }
.br-lead-bar{ height:14px; border:2px solid #000; border-radius:4px; background:#0b0b10; overflow:hidden; }
.br-lead-fill{ display:block; height:100%; width:var(--pct); background:var(--accent); }
.br-root.br-ready [data-reveal] .br-lead-fill{ width:0; }
.br-root.br-ready [data-reveal].br-in .br-lead-fill{ width:var(--pct); transition:width 1s cubic-bezier(.2,.85,.25,1); }
.br-lead-val{ font-family:var(--mono); font-weight:800; font-size:.85rem; color:var(--accent); text-align:right; }

/* features */
.br-feats{ display:grid; grid-template-columns:repeat(2,1fr); gap:18px; }
.br-feat{ display:flex; gap:14px; align-items:flex-start; padding:18px; border:2.5px solid #000; border-radius:10px; background:#0b0b10; }
.br-feat-ic{ width:38px; height:38px; flex:0 0 auto; display:grid; place-items:center; border:2px solid #000; border-radius:8px; background:var(--accent); color:#0b0b10; font-weight:800; }
.br-feat-h{ font-family:var(--display); font-weight:800; text-transform:uppercase; font-size:1.05rem; margin:0; }
.br-feat-p{ color:var(--muted); font-size:.95rem; margin:8px 0 0; }

/* mini / timeline / list */
.br-mini{ border:2.5px solid #000; border-radius:10px; background:#0b0b10; padding:18px; display:flex; flex-direction:column; gap:8px; text-decoration:none; color:inherit; }
.br-mini-link:hover{ box-shadow:var(--sh-sm); transform:translate(-2px,-2px); }
.br-mini-top{ display:flex; align-items:baseline; justify-content:space-between; gap:12px; }
.br-tl{ display:flex; flex-direction:column; gap:16px; }
.br-tl-row{ display:grid; grid-template-columns:140px 1fr; gap:20px; }
.br-tl-date{ font-family:var(--mono); font-weight:800; color:var(--accent); font-size:.85rem; }
.br-listitem{ border:2.5px solid #000; border-radius:10px; background:#0b0b10; padding:18px 20px; text-decoration:none; color:inherit; }

/* gallery / video */
.br-gallery{ display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:16px; }
.br-gitem{ border:3px solid #000; border-radius:10px; overflow:hidden; background:#0b0b10; box-shadow:var(--sh-sm); }
.br-gitem .br-zoom{ width:100%; aspect-ratio:1/1; }
.br-gitem figcaption{ padding:10px 14px; font-weight:600; }
.br-video{ border:3px solid #000; border-radius:10px; overflow:hidden; background:#0b0b10; box-shadow:var(--sh-sm); }
.br-video-frame{ position:relative; aspect-ratio:16/9; background:#000; }
.br-video-frame iframe{ position:absolute; inset:0; width:100%; height:100%; border:0; }
.br-video figcaption{ padding:12px 16px; font-weight:600; }

/* zoom blur-fill */
.br-zoom{ position:relative; display:block; padding:0; border:0; cursor:zoom-in; color:inherit; overflow:hidden; background:#08080e; }
.br-zoom-bg{ position:absolute; inset:0; width:100%; height:100%; object-fit:cover; filter:blur(26px) saturate(1.3); transform:scale(1.25); opacity:.5; }
.br-zoom-img{ position:relative; z-index:1; width:100%; height:100%; object-fit:contain; transition:transform .3s ease; }
.br-zoom:hover .br-zoom-img{ transform:scale(1.03); }
.br-zoom:focus-visible{ outline:3px solid var(--accent); outline-offset:-3px; }

/* testimonials */
.br-quote{ border:2.5px solid #000; border-radius:10px; background:#0b0b10; padding:24px; display:flex; flex-direction:column; gap:14px; }
.br-quote-mark{ font-family:var(--display); font-weight:900; color:var(--accent); font-size:3.6rem; line-height:.4; height:24px; }
.br-quote blockquote{ margin:0; font-weight:600; font-size:1.05rem; }
.br-quote-by{ display:flex; align-items:center; gap:14px; margin-top:auto; }
.br-quote-by span{ display:flex; flex-direction:column; line-height:1.3; }
.br-quote-by b{ font-weight:800; font-size:.95rem; }
.br-quote-by em{ font-style:normal; font-weight:600; font-size:.8rem; color:var(--muted); }

/* socials */
.br-socials{ display:flex; flex-wrap:wrap; gap:12px; }
.br-soc{ width:46px; height:46px; display:grid; place-items:center; border:2.5px solid #000; border-radius:8px; background:#0b0b10; color:var(--wht); text-decoration:none; box-shadow:3px 3px 0 #0a0a12; transition:transform .1s, box-shadow .1s, color .1s; }
.br-soc:hover{ transform:translate(2px,2px); box-shadow:1px 1px 0 #0a0a12; color:var(--accent); }
.br-soc svg{ width:20px; height:20px; }

/* contact */
.br-contact{ display:grid; grid-template-columns:.9fr 1.1fr; gap:clamp(20px,3vw,40px); align-items:start; }
.br-join-h{ font-family:var(--display); font-weight:900; text-transform:uppercase; font-size:clamp(1.5rem,3vw,2.2rem); line-height:1.02; margin:0 0 20px; }
.br-contact-rows{ display:flex; flex-direction:column; gap:14px; margin-bottom:20px; }
.br-crow{ display:flex; align-items:center; gap:14px; text-decoration:none; color:inherit; word-break:break-word; font-weight:600; font-size:1.05rem; }
.br-crow span:first-child{ color:var(--accent); width:24px; text-align:center; flex:0 0 auto; font-size:1.2rem; font-weight:800; }
.br-crow:hover{ color:var(--accent); }
.br-formcard{ border:3px solid #000; border-radius:12px; background:#0b0b10; padding:clamp(20px,3vw,30px); }
.br-formcard :where(input, textarea, select){ width:100%; font-family:var(--body); font-weight:600; font-size:1rem; color:var(--wht); background:#16161f; border:2.5px solid #000; border-radius:8px; padding:14px 16px; margin-bottom:16px; }
.br-formcard :where(input, textarea, select):focus{ outline:none; border-color:var(--accent); }
.br-formcard :where(input, textarea, select)::placeholder{ color:rgba(255,255,255,0.4); font-weight:500; }
.br-formcard textarea{ min-height:130px; resize:vertical; }
.br-formcard :where(button, [type="submit"]){ width:100%; font-family:var(--display); font-weight:800; font-size:1rem; text-transform:uppercase; cursor:pointer; color:#0b0b10; background:var(--accent); border:3px solid #000; border-radius:8px; padding:15px 20px; box-shadow:var(--sh-sm); transition:transform .1s, box-shadow .1s; }
.br-formcard :where(button, [type="submit"]):hover{ transform:translate(3px,3px); box-shadow:1px 1px 0 #0a0a12; }
.br-formcard label{ color:var(--muted); font-weight:700; font-size:.88rem; }

/* footer - Updated to solid Deep Black for better contrast */
.br-footer{ position:relative; z-index:20; border-top:5px solid var(--accent); background:#000000; box-shadow:0 -20px 50px -14px rgba(6,4,22,.8); }
.br-footer-in{ display:flex; align-items:center; justify-content:space-between; gap:20px; flex-wrap:wrap; padding-block:32px; }
.br-footer-nav{ display:flex; flex-wrap:wrap; gap:10px 20px; }
.br-footer-nav a{ text-decoration:none; color:var(--muted); font-family:var(--display); font-weight:800; text-transform:uppercase; font-size:.8rem; }
.br-footer-nav a:hover{ color:var(--accent); }
.br-footer-right{ display:flex; align-items:center; gap:20px; flex-wrap:wrap; }
.br-foot-soc .br-soc{ width:40px; height:40px; box-shadow:none; }
.br-foot-copy{ color:var(--muted); font-weight:600; font-size:.85rem; }
.br-madewith{ color:var(--accent); text-decoration:none; font-weight:800; }

/* lightbox */
.br-lb{ position:fixed; inset:0; z-index:1000; display:grid; place-items:center; padding:clamp(16px,4vw,48px); background:rgba(8,6,20,.95); animation:br-fade .2s ease both; }
.br-lb-fig{ margin:0; max-width:94vw; max-height:92vh; display:flex; flex-direction:column; gap:12px; align-items:center; animation:br-pop .3s cubic-bezier(.2,.85,.25,1) both; }
.br-lb-fig img{ max-width:92vw; max-height:84vh; width:auto; height:auto; object-fit:contain; border:3px solid #000; border-radius:8px; background:#0b0b10; }
.br-lb-fig figcaption{ color:var(--wht); font-weight:700; font-size:.95rem; text-align:center; }
.br-lb-close{ position:fixed; top:20px; right:20px; z-index:1001; width:48px; height:48px; border:3px solid #000; border-radius:8px; cursor:pointer; color:#0b0b10; background:var(--accent); font-size:1.2rem; font-weight:800; box-shadow:var(--sh-sm); transition:transform .1s, box-shadow .1s; }
.br-lb-close:hover{ transform:translate(3px,3px); box-shadow:1px 1px 0 #0a0a12; }
.br-lb-close:focus-visible{ outline:3px solid #000; outline-offset:2px; }
@keyframes br-fade{ from{opacity:0;} to{opacity:1;} }
@keyframes br-pop{ from{opacity:0; transform:translateY(30px) scale(.97);} to{opacity:1; transform:none;} }

/* responsive */
@media (max-width:1000px){ .br-grid-3{ grid-template-columns:repeat(2,1fr); } }
@media (max-width:880px){
  .br-hero{ grid-template-columns:1fr; }
  .br-navlinks{ display:none; }
  .br-menu{ display:block; }
  .br-feats{ grid-template-columns:1fr; }
  .br-contact{ grid-template-columns:1fr; }
}
@media (max-width:620px){
  .br-grid-2, .br-grid-3{ grid-template-columns:1fr; }
  .br-lead-row{ grid-template-columns:auto auto 1fr auto; }
  .br-lead-bar{ display:none; }
  .br-tl-row{ grid-template-columns:1fr; gap:6px; }
  .br-ov-stats{ grid-template-columns:1fr 1fr; }
  .br-nav-cta{ display:none; }
}

@media (prefers-reduced-motion: reduce){
  .br-root{ scroll-behavior:auto; }
  .br-root *{ animation:none !important; transition:none !important; }
  .br-root.br-ready [data-reveal]{ opacity:1 !important; transform:none !important; }
  .br-root.br-ready [data-reveal] .br-lead-fill{ width:var(--pct); }
  .br-chart path{ stroke-dashoffset:0 !important; }
  .br-tilt{ transform:none !important; }
}
`;
