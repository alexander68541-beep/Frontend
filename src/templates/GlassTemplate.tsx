"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import type { PublicPortfolio } from "@/lib/publicTypes";
import { dateRange, videoEmbed, ext } from "@/lib/publicTypes";
import { ContactForm } from "@/components/ContactForm";

/* =====================================================================
   GlassTemplate — "Aurora Pro" glass look
   Premium minimal + soft glassmorphism portfolio template for Folio.
   PURE PRESENTATION. Everything comes from `data`. No fetch / DB / auth.
   Client component only for UI behaviour (theme toggle, lightbox,
   scroll-reveal, 3D tilt) — it still just renders the `data` prop.
   All styles are self-contained in the <style> block below, prefixed
   `.aup-` and scoped under `.aup-root` so they never clash.
   ===================================================================== */

/* ---------------------------- pure helpers ---------------------------- */

const DEFAULT_ORDER = [
  "about",
  "services",
  "skills",
  "projects",
  "experience",
  "education",
  "certifications",
  "achievements",
  "publications",
  "gallery",
  "videos",
  "process",
  "testimonials",
];

function resolveOrder(settings: PublicPortfolio["settings"]): string[] {
  const custom = settings?.section_order;
  const order = custom && custom.length ? [...custom] : [...DEFAULT_ORDER];
  if (!order.includes("process")) {
    const ti = order.indexOf("testimonials");
    if (ti >= 0) order.splice(ti, 0, "process");
    else order.push("process");
  }
  for (const k of DEFAULT_ORDER) if (!order.includes(k)) order.push(k);
  return order;
}

function initials(name: string | null | undefined, fallback: string | null | undefined): string {
  const src = (name || fallback || "").trim();
  if (!src) return "◆";
  const parts = src.split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : src.slice(0, 2);
  return letters.toUpperCase();
}

function oneDate(s: string | null): string | null {
  if (!s) return null;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short" });
}

// Turn any `level` shape (1-5 number, 0-100, "Expert", "80%"…) into a %.
function levelPct(level: unknown): number | null {
  if (level === null || level === undefined || level === "") return null;
  const clamp = (n: number) => Math.max(0, Math.min(100, n));
  if (typeof level === "number") {
    if (Number.isNaN(level)) return null;
    return clamp(level <= 5 ? (level / 5) * 100 : level);
  }
  const s = String(level).trim().toLowerCase();
  const num = parseFloat(s);
  if (!Number.isNaN(num) && /^[\d.]+\s*%?$/.test(s)) {
    return clamp(s.includes("%") ? num : num <= 5 ? (num / 5) * 100 : num);
  }
  const map: Record<string, number> = {
    beginner: 35, basic: 35, novice: 30, elementary: 40, learning: 30,
    intermediate: 60, competent: 62, proficient: 75, skilled: 72,
    advanced: 85, expert: 95, master: 100, fluent: 95, native: 100,
  };
  for (const k in map) if (s.includes(k)) return map[k];
  return null;
}

/* ------------------------------ component ------------------------------ */

export function GlassTemplate({ data }: { data: PublicPortfolio }) {
  const p = data.profile;
  const accent = data.accent || "#7c6cff";

  const hidden = new Set(data.settings?.hidden ?? []);
  const sv = (k: string) => !hidden.has(k);

  // Narrow to a local so TS keeps `string` inside the JSX below.
  const username = data.username;

  const name = p?.display_name || username || "Your Name";
  const mono = initials(p?.display_name, username);

  /* ---- UI state ---- */
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [lb, setLb] = useState<{ src: string; alt: string; cap?: string } | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const portraitRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);

  const openLb = useCallback((src: string, alt: string, cap?: string) => setLb({ src, alt, cap }), []);

  // mount: enable animations, pick up system theme, wire scroll-reveal
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    root.classList.add("aup-anim-ready");

    const mm = (q: string) => (typeof window.matchMedia === "function" ? window.matchMedia(q) : null);
    if (mm("(prefers-color-scheme: dark)")?.matches) setTheme("dark");

    const reduce = mm("(prefers-reduced-motion: reduce)")?.matches;
    const targets = root.querySelectorAll("[data-reveal],[data-bar]");
    if (reduce || typeof IntersectionObserver === "undefined") {
      targets.forEach((el) => el.classList.add("aup-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("aup-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -6% 0px" }
    );
    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // hero 3D tilt (desktop pointer only)
  useEffect(() => {
    const el = portraitRef.current;
    if (!el) return;
    const mm = (q: string) => (typeof window.matchMedia === "function" ? window.matchMedia(q) : null);
    if (mm("(prefers-reduced-motion: reduce)")?.matches) return;
    if (mm("(pointer: fine)") && !mm("(pointer: fine)")!.matches) return;

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty("--rx", `${(-y * 9).toFixed(2)}deg`);
      el.style.setProperty("--ry", `${(x * 11).toFixed(2)}deg`);
      el.style.setProperty("--tz", "18px");
    };
    const reset = () => {
      el.style.setProperty("--rx", "0deg");
      el.style.setProperty("--ry", "0deg");
      el.style.setProperty("--tz", "0px");
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", reset);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", reset);
    };
  }, []);

  // lightbox: Esc to close, lock scroll, focus the close button
  useEffect(() => {
    if (!lb) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLb(null);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [lb]);

  /* ---- derived visibility (drives the nav) ---- */
  const has = {
    about: sv("about") && !!(p?.about || p?.bio || p?.tagline),
    services: sv("services") && data.services.length > 0,
    skills: sv("skills") && data.skills.length > 0,
    projects: sv("projects") && data.projects.length > 0,
    process: sv("process"),
    testimonials: sv("testimonials") && data.testimonials.length > 0,
    contact: !!username,
  };

  const contactHref = username ? "#contact" : p?.email ? `mailto:${p.email}` : undefined;

  const navItems: { href: string; label: string }[] = [
    { href: "#top", label: "Home" },
    has.about && { href: "#about", label: "About" },
    has.services && { href: "#services", label: "Services" },
    has.projects && { href: "#work", label: "Work" },
    has.process && { href: "#process", label: "Process" },
    has.testimonials && { href: "#testimonials", label: "Reviews" },
    has.contact && { href: "#contact", label: "Contact" },
  ].filter(Boolean) as { href: string; label: string }[];

  /* ---- small reusable renderers ---- */
  const eyebrow = (t: string) => <span className="aup-eyebrow">{t}</span>;

  const themeBtn = (extra?: string) => (
    <button
      type="button"
      className={`aup-theme-btn ${extra || ""}`}
      onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      aria-pressed={theme === "dark"}
      title="Toggle theme"
    >
      <span className="aup-theme-ic" aria-hidden>
        {theme === "dark" ? "☀" : "☾"}
      </span>
    </button>
  );

  const ZImg = ({
    src,
    alt,
    cap,
    className,
  }: {
    src: string;
    alt: string;
    cap?: string;
    className?: string;
  }) => (
    <button
      type="button"
      className={`aup-zoom ${className || ""}`}
      onClick={() => openLb(src, alt, cap)}
      aria-label={alt ? `View image: ${alt}` : "View image"}
    >
      <img src={src} alt={alt} loading="lazy" />
      <span className="aup-zoom-ic" aria-hidden>⤢</span>
    </button>
  );

  const socialChips = (extra?: string) =>
    data.links.length > 0 ? (
      <div className={`aup-chips ${extra || ""}`}>
        {data.links.map((l) => (
          <a
            key={l.id}
            className="aup-chip aup-chip-link"
            href={ext(l.url)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="aup-chip-mono">{initials(l.label || l.platform, l.platform)}</span>
            <span>{l.label || l.platform}</span>
          </a>
        ))}
      </div>
    ) : null;

  /* ---- section renderers (null when there's nothing to show) ---- */
  const sections: Record<string, () => ReactNode> = {
    about: () => {
      if (!has.about) return null;
      const aboutText = p?.about ?? null;
      const stats = [
        { n: data.projects.length, label: "Projects" },
        { n: data.experience.length, label: "Roles" },
        { n: data.testimonials.length, label: "Clients" },
        { n: data.skills.length, label: "Skills" },
      ].filter((s) => s.n > 0);
      return (
        <section id="about" data-sec="about" data-reveal className="aup-section">
          <div className="aup-about">
            <div className="aup-about-left">
              {eyebrow("About me")}
              <h2 className="aup-h2">{p?.tagline || "A little about the work"}</h2>
              {p?.bio && <p className="aup-lead">{p.bio}</p>}
              {stats.length > 0 && (
                <div className="aup-stats aup-glass">
                  {stats.map((s) => (
                    <div key={s.label} className="aup-stat">
                      <b>{s.n}</b>
                      <span>{s.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="aup-about-right aup-glass">
              {aboutText
                ? aboutText.split(/\n{2,}/).map((para, i) => <p key={i}>{para}</p>)
                : <p>{p?.bio}</p>}
              {p?.resume_url && (
                <a
                  className="aup-btn aup-btn-ghost aup-mt"
                  href={ext(p.resume_url)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View résumé <span aria-hidden>↗</span>
                </a>
              )}
            </div>
          </div>
        </section>
      );
    },

    services: () => {
      if (!has.services) return null;
      return (
        <section id="services" data-sec="services" data-reveal className="aup-section">
          <div className="aup-sechead">
            <div>
              {eyebrow("What I do")}
              <h2 className="aup-h2">Services I offer</h2>
            </div>
          </div>
          <div className="aup-grid-4">
            {data.services.map((s) => (
              <article key={s.id} className="aup-card aup-tilt">
                <span className="aup-icon" aria-hidden>{initials(s.title, "S")}</span>
                <h3 className="aup-card-title">{s.title}</h3>
                {s.description && <p className="aup-muted aup-clamp-4">{s.description}</p>}
                <div className="aup-card-foot">
                  {s.price && <span className="aup-price">{s.price}</span>}
                  <span className="aup-arrow" aria-hidden>↗</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      );
    },

    skills: () => {
      if (!has.skills) return null;
      const sorted = [...data.skills].sort((a, b) => (a.category || "").localeCompare(b.category || ""));
      return (
        <section id="skills" data-sec="skills" data-reveal className="aup-section">
          <div className="aup-sechead">
            <div>
              {eyebrow("Tools & skills")}
              <h2 className="aup-h2">Skills &amp; expertise</h2>
            </div>
          </div>
          <div className="aup-panel aup-glass">
            <div className="aup-skills-grid">
              {sorted.map((s) => {
                const pct = levelPct(s.level);
                const raw = s.level as unknown;
                const badge =
                  (typeof raw === "number" || typeof raw === "string") &&
                  String(raw).trim() &&
                  String(raw).length <= 10
                    ? String(raw)
                    : null;
                return (
                  <div
                    key={s.id}
                    className="aup-skill"
                    data-bar
                    style={{ ["--pct" as string]: `${pct ?? 0}%` } as CSSProperties}
                  >
                    <div className="aup-skill-top">
                      <span className="aup-chip-mono" aria-hidden>{initials(s.name, "•")}</span>
                      <span className="aup-skill-name">{s.name}</span>
                      {badge && <span className="aup-skill-badge">{badge}</span>}
                    </div>
                    {pct != null && (
                      <div
                        className="aup-lvl"
                        role="progressbar"
                        aria-valuenow={Math.round(pct)}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${s.name} proficiency`}
                      >
                        <span className="aup-lvl-fill" />
                      </div>
                    )}
                    {s.category && <span className="aup-skill-cat">{s.category}</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      );
    },

    projects: () => {
      if (!has.projects) return null;
      const ordered = [...data.projects].sort((a, b) => Number(!!b.is_featured) - Number(!!a.is_featured));
      return (
        <section id="work" data-sec="projects" data-reveal className="aup-section">
          <div className="aup-sechead">
            <div>
              {eyebrow("Selected work")}
              <h2 className="aup-h2">Featured projects</h2>
            </div>
            <span className="aup-count-pill">{data.projects.length} total</span>
          </div>
          <div className="aup-grid-3">
            {ordered.map((pr) => {
              const category = pr.role || (pr.tags && pr.tags[0]) || null;
              return (
                <article key={pr.id} className="aup-proj aup-glass aup-tilt">
                  <div className="aup-proj-media">
                    {pr.image_url ? (
                      <ZImg src={pr.image_url} alt={pr.title || "Project image"} cap={pr.title || undefined} />
                    ) : (
                      <div className="aup-proj-ph" aria-hidden>{initials(pr.title, "P")}</div>
                    )}
                    {pr.is_featured && <span className="aup-badge">Featured</span>}
                  </div>
                  <div className="aup-proj-body">
                    <h3 className="aup-card-title">
                      {pr.url ? (
                        <a className="aup-proj-title-link" href={ext(pr.url)} target="_blank" rel="noopener noreferrer">
                          {pr.title || "Untitled project"} <span aria-hidden>↗</span>
                        </a>
                      ) : (
                        pr.title || "Untitled project"
                      )}
                    </h3>
                    {category && <p className="aup-muted aup-proj-cat">{category}</p>}
                    {pr.description && <p className="aup-muted aup-clamp-3">{pr.description}</p>}
                    {pr.tags && pr.tags.length > 0 && (
                      <div className="aup-tags">
                        {pr.tags.slice(0, 4).map((t) => (
                          <span key={t} className="aup-tag">{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      );
    },

    experience: () => {
      if (!(sv("experience") && data.experience.length > 0)) return null;
      return (
        <section id="experience" data-sec="experience" data-reveal className="aup-section">
          <div className="aup-sechead">
            <div>
              {eyebrow("Career")}
              <h2 className="aup-h2">Experience</h2>
            </div>
          </div>
          <div className="aup-time">
            {data.experience.map((e) => (
              <article key={e.id} className="aup-time-item aup-glass">
                <div className="aup-time-head">
                  <h3 className="aup-time-role">{e.title || e.company || "Role"}</h3>
                  <span className="aup-time-date">{dateRange(e.start_date, e.end_date, e.is_current)}</span>
                </div>
                <p className="aup-time-meta">{[e.company, e.location].filter(Boolean).join(" · ")}</p>
                {e.description && <p className="aup-muted">{e.description}</p>}
              </article>
            ))}
          </div>
        </section>
      );
    },

    education: () => {
      if (!(sv("education") && data.education.length > 0)) return null;
      return (
        <section id="education" data-sec="education" data-reveal className="aup-section">
          <div className="aup-sechead">
            <div>
              {eyebrow("Learning")}
              <h2 className="aup-h2">Education</h2>
            </div>
          </div>
          <div className="aup-grid-2">
            {data.education.map((ed) => (
              <article key={ed.id} className="aup-time-item aup-glass">
                <div className="aup-time-head">
                  <h3 className="aup-time-role">{ed.school || "School"}</h3>
                  <span className="aup-time-date">{dateRange(ed.start_date, ed.end_date)}</span>
                </div>
                {(ed.degree || ed.field) && (
                  <p className="aup-time-meta">{[ed.degree, ed.field].filter(Boolean).join(", ")}</p>
                )}
                {ed.description && <p className="aup-muted">{ed.description}</p>}
              </article>
            ))}
          </div>
        </section>
      );
    },

    certifications: () => {
      if (!(sv("certifications") && data.certifications.length > 0)) return null;
      return (
        <section id="certifications" data-sec="certifications" data-reveal className="aup-section">
          <div className="aup-sechead">
            <div>
              {eyebrow("Credentials")}
              <h2 className="aup-h2">Certifications</h2>
            </div>
          </div>
          <div className="aup-grid-3">
            {data.certifications.map((c) => {
              const body = (
                <>
                  <span className="aup-icon" aria-hidden>{initials(c.issuer || c.name, "C")}</span>
                  <h3 className="aup-card-title">{c.name}</h3>
                  {c.issuer && <p className="aup-muted">{c.issuer}</p>}
                  <div className="aup-card-foot">
                    {oneDate(c.issue_date) && <span className="aup-muted aup-small">{oneDate(c.issue_date)}</span>}
                    {c.credential_id && <span className="aup-muted aup-small">ID: {c.credential_id}</span>}
                  </div>
                </>
              );
              return c.url ? (
                <a
                  key={c.id}
                  className="aup-card aup-card-link aup-tilt"
                  href={ext(c.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {body}
                  <span className="aup-arrow" aria-hidden>↗</span>
                </a>
              ) : (
                <article key={c.id} className="aup-card aup-tilt">{body}</article>
              );
            })}
          </div>
        </section>
      );
    },

    achievements: () => {
      if (!(sv("achievements") && data.achievements.length > 0)) return null;
      return (
        <section id="achievements" data-sec="achievements" data-reveal className="aup-section">
          <div className="aup-sechead">
            <div>
              {eyebrow("Highlights")}
              <h2 className="aup-h2">Achievements</h2>
            </div>
          </div>
          <div className="aup-grid-3">
            {data.achievements.map((a) => (
              <article key={a.id} className="aup-card aup-tilt">
                <span className="aup-icon" aria-hidden>★</span>
                <h3 className="aup-card-title">{a.title}</h3>
                {oneDate(a.date) && <p className="aup-muted aup-small">{oneDate(a.date)}</p>}
                {a.description && <p className="aup-muted aup-clamp-4">{a.description}</p>}
              </article>
            ))}
          </div>
        </section>
      );
    },

    publications: () => {
      if (!(sv("publications") && data.publications.length > 0)) return null;
      return (
        <section id="publications" data-sec="publications" data-reveal className="aup-section">
          <div className="aup-sechead">
            <div>
              {eyebrow("Writing")}
              <h2 className="aup-h2">Publications</h2>
            </div>
          </div>
          <div className="aup-time">
            {data.publications.map((pub) => {
              const meta = [pub.publisher, oneDate(pub.date)].filter(Boolean).join(" · ");
              const body = (
                <>
                  <div className="aup-time-head">
                    <h3 className="aup-time-role">{pub.title}</h3>
                    {pub.url && <span className="aup-arrow" aria-hidden>↗</span>}
                  </div>
                  {meta && <p className="aup-time-meta">{meta}</p>}
                  {pub.description && <p className="aup-muted">{pub.description}</p>}
                </>
              );
              return pub.url ? (
                <a
                  key={pub.id}
                  className="aup-time-item aup-glass aup-time-link"
                  href={ext(pub.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {body}
                </a>
              ) : (
                <article key={pub.id} className="aup-time-item aup-glass">{body}</article>
              );
            })}
          </div>
        </section>
      );
    },

    gallery: () => {
      if (!(sv("gallery") && data.gallery.length > 0)) return null;
      return (
        <section id="gallery" data-sec="gallery" data-reveal className="aup-section">
          <div className="aup-sechead">
            <div>
              {eyebrow("Visuals")}
              <h2 className="aup-h2">Gallery</h2>
            </div>
          </div>
          <div className="aup-gallery">
            {data.gallery.map((g) =>
              g.image_url ? (
                <figure key={g.id} className="aup-gitem aup-glass">
                  <ZImg src={g.image_url} alt={g.caption || "Gallery image"} cap={g.caption || undefined} className="aup-zoom-gallery" />
                  {g.caption && <figcaption className="aup-muted aup-small">{g.caption}</figcaption>}
                </figure>
              ) : null
            )}
          </div>
        </section>
      );
    },

    videos: () => {
      if (!(sv("videos") && data.videos.length > 0)) return null;
      return (
        <section id="videos" data-sec="videos" data-reveal className="aup-section">
          <div className="aup-sechead">
            <div>
              {eyebrow("Watch")}
              <h2 className="aup-h2">Videos</h2>
            </div>
          </div>
          <div className="aup-grid-2">
            {data.videos.map((v) => {
              const src = v.url ? videoEmbed(v.url) : null;
              if (!src) return null;
              return (
                <figure key={v.id} className="aup-video aup-glass">
                  <div className="aup-video-frame">
                    <iframe
                      src={src}
                      title={v.title || "Video"}
                      loading="lazy"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  {v.title && <figcaption className="aup-muted aup-small">{v.title}</figcaption>}
                </figure>
              );
            })}
          </div>
        </section>
      );
    },

    process: () => {
      if (!has.process) return null;
      // Static, profession-neutral template chrome (no owner data).
      const steps = [
        { t: "Discover", d: "Understand the goals, audience and the problem worth solving." },
        { t: "Define", d: "Shape the scope, constraints and what success looks like." },
        { t: "Ideate", d: "Explore directions, sketch options and pressure-test ideas." },
        { t: "Create", d: "Build the real thing with craft, clarity and attention to detail." },
        { t: "Refine", d: "Test, iterate and polish until it truly lands." },
      ];
      return (
        <section id="process" data-sec="process" data-reveal className="aup-section">
          <div className="aup-sechead">
            <div>
              {eyebrow("My process")}
              <h2 className="aup-h2">How I work</h2>
            </div>
          </div>
          <div className="aup-grid-5">
            {steps.map((s, i) => (
              <article key={s.t} className="aup-step aup-glass aup-tilt">
                <span className="aup-step-n">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="aup-step-t">{s.t}</h3>
                <p className="aup-muted aup-small">{s.d}</p>
              </article>
            ))}
          </div>
        </section>
      );
    },

    testimonials: () => {
      if (!has.testimonials) return null;
      return (
        <section id="testimonials" data-sec="testimonials" data-reveal className="aup-section">
          <div className="aup-sechead">
            <div>
              {eyebrow("Testimonials")}
              <h2 className="aup-h2">What clients say</h2>
            </div>
          </div>
          <div className="aup-tgrid">
            {data.testimonials.map((t) => (
              <figure key={t.id} className="aup-quote aup-glass">
                <span className="aup-quote-mark" aria-hidden>”</span>
                {t.quote && <blockquote>{t.quote}</blockquote>}
                <figcaption className="aup-quote-by">
                  <span className="aup-avatar" aria-hidden>
                    {t.avatar_url ? <img src={t.avatar_url} alt="" loading="lazy" /> : initials(t.author, "•")}
                  </span>
                  <span>
                    {t.author && <b>{t.author}</b>}
                    {t.role && <em className="aup-muted">{t.role}</em>}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      );
    },
  };

  const order = resolveOrder(data.settings);
  const floatA = p?.availability;
  const floatB = data.projects.length > 0 ? data.projects.length : null;
  const year = new Date().getFullYear();

  return (
    <div
      ref={rootRef}
      className="aup-root"
      id="top"
      data-theme={theme}
      style={{ ["--tpl-accent" as string]: accent } as CSSProperties}
    >
      <style dangerouslySetInnerHTML={{ __html: AUP_CSS }} />

      {/* decorative, behind everything */}
      <div className="aup-bg" aria-hidden>
        <span className="aup-blob aup-blob-1" />
        <span className="aup-blob aup-blob-2" />
        <span className="aup-blob aup-blob-3" />
      </div>

      <div className="aup-shell">
        {/* ---------------- NAVBAR ---------------- */}
        <div className="aup-navwrap">
          <nav className="aup-nav aup-glass" aria-label="Primary">
            <a className="aup-brand" href="#top">
              <span className="aup-brand-logo" aria-hidden>{mono}</span>
              <span className="aup-brand-txt">
                <b>{name}</b>
                {p?.title && <em>{p.title}</em>}
              </span>
            </a>

            {navItems.length > 1 && (
              <ul className="aup-navlinks">
                {navItems.map((it) => (
                  <li key={it.href}>
                    <a href={it.href}>{it.label}</a>
                  </li>
                ))}
              </ul>
            )}

            <div className="aup-nav-right">
              {themeBtn()}
              {contactHref && (
                <a className="aup-btn aup-btn-primary aup-nav-cta" href={contactHref}>
                  Let’s talk <span aria-hidden>↗</span>
                </a>
              )}
              {navItems.length > 1 && (
                <details className="aup-menu">
                  <summary aria-label="Menu">
                    <span /><span /><span />
                  </summary>
                  <ul>
                    {navItems.map((it) => (
                      <li key={it.href}>
                        <a href={it.href}>{it.label}</a>
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          </nav>
        </div>

        {/* ---------------- HERO ---------------- */}
        <header className="aup-hero">
          <div className="aup-hero-left">
            {eyebrow(p?.pronouns ? `Hello — ${p.pronouns}` : "Hello, I’m")}
            <h1 className="aup-hero-name">{name}</h1>
            {p?.title && <p className="aup-hero-title">{p.title}</p>}
            {(p?.tagline || p?.bio) && <p className="aup-hero-intro">{p?.tagline || p?.bio}</p>}

            <div className="aup-hero-cta">
              {has.projects && (
                <a className="aup-btn aup-btn-primary" href="#work">
                  View my work <span aria-hidden>↗</span>
                </a>
              )}
              {p?.resume_url && (
                <a className="aup-btn aup-btn-ghost" href={ext(p.resume_url)} target="_blank" rel="noopener noreferrer">
                  Download CV <span aria-hidden>↓</span>
                </a>
              )}
              {!has.projects && !p?.resume_url && contactHref && (
                <a className="aup-btn aup-btn-primary" href={contactHref}>
                  Get in touch <span aria-hidden>↗</span>
                </a>
              )}
            </div>

            {(p?.location || p?.availability) && (
              <p className="aup-hero-meta">
                {p?.location && <span>📍 {p.location}</span>}
                {p?.availability && <span className="aup-dot-avail">● {p.availability}</span>}
              </p>
            )}

            {socialChips("aup-hero-socials")}
          </div>

          <div className="aup-hero-right">
            <div className="aup-portrait" ref={portraitRef}>
              <div className="aup-portrait-tilt">
                <div className="aup-portrait-frame aup-glass">
                  {p?.avatar_url ? (
                    <ZImg src={p.avatar_url} alt={name} className="aup-zoom-fill" />
                  ) : (
                    <div className="aup-portrait-ph" aria-hidden>{mono}</div>
                  )}
                </div>

                {floatA && (
                  <div className="aup-float aup-float-a aup-glass">
                    <b>Available</b>
                    <span>{floatA}</span>
                  </div>
                )}
                {floatB && (
                  <div className="aup-float aup-float-b aup-glass">
                    <b>{floatB}+</b>
                    <span>Projects</span>
                  </div>
                )}
                <span className="aup-orb" aria-hidden />
              </div>
            </div>
          </div>
        </header>

        {/* ---------------- DATA SECTIONS (ordered + hideable) ---------------- */}
        {order.map((k) => (
          <Fragment key={k}>{sections[k] ? sections[k]() : null}</Fragment>
        ))}

        {/* ---------------- CONTACT ---------------- */}
        {username && (
          <section id="contact" data-reveal className="aup-section">
            <div className="aup-contact">
              <div className="aup-contact-left">
                {eyebrow("Let’s connect")}
                <h2 className="aup-h2">Have a project in mind?</h2>
                <p className="aup-lead">Tell me a little about what you’re building and I’ll get back to you.</p>

                <div className="aup-contact-rows">
                  {p?.email && (
                    <a className="aup-contact-row" href={`mailto:${p.email}`}>
                      <span className="aup-icon aup-icon-sm" aria-hidden>✉</span>
                      <span>{p.email}</span>
                    </a>
                  )}
                  {p?.phone && (
                    <a className="aup-contact-row" href={`tel:${p.phone}`}>
                      <span className="aup-icon aup-icon-sm" aria-hidden>☎</span>
                      <span>{p.phone}</span>
                    </a>
                  )}
                  {p?.website && (
                    <a className="aup-contact-row" href={ext(p.website)} target="_blank" rel="noopener noreferrer">
                      <span className="aup-icon aup-icon-sm" aria-hidden>🌐</span>
                      <span>{p.website.replace(/^https?:\/\//, "")}</span>
                    </a>
                  )}
                  {p?.location && (
                    <div className="aup-contact-row">
                      <span className="aup-icon aup-icon-sm" aria-hidden>📍</span>
                      <span>{p.location}</span>
                    </div>
                  )}
                </div>

                {socialChips()}
              </div>

              <div className="aup-formcard aup-glass">
                <span className="aup-orb aup-orb-contact" aria-hidden />
                <ContactForm username={username} />
              </div>
            </div>
          </section>
        )}
      </div>

      {/* ---------------- FOOTER ---------------- */}
      <footer className="aup-footer">
        <div className="aup-shell">
          <div className="aup-footer-card aup-glass">
            <span className="aup-footer-glow" aria-hidden />
            <div className="aup-footer-top">
              <a className="aup-footer-brand" href="#top">
                <span className="aup-brand-logo" aria-hidden>{mono}</span>
                <span>
                  <b>{name}</b>
                  {p?.title && <em>{p.title}</em>}
                </span>
              </a>
              {(p?.tagline || p?.bio) && <p className="aup-footer-tag">{p?.tagline || p?.bio}</p>}
              <a className="aup-totop" href="#top" aria-label="Back to top">↑</a>
            </div>

            {(navItems.length > 1 || data.links.length > 0) && (
              <div className="aup-footer-cols">
                {navItems.length > 1 && (
                  <nav className="aup-footer-nav" aria-label="Footer">
                    {navItems.map((it) => (
                      <a key={it.href} href={it.href}>{it.label}</a>
                    ))}
                  </nav>
                )}
                {data.links.length > 0 && (
                  <nav className="aup-footer-soc" aria-label="Social">
                    {data.links.map((l) => (
                      <a key={l.id} href={ext(l.url)} target="_blank" rel="noopener noreferrer">
                        {l.label || l.platform}
                      </a>
                    ))}
                  </nav>
                )}
              </div>
            )}

            <div className="aup-footer-bottom">
              <span>© {year} {name}</span>
              <div className="aup-footer-bottom-r">
                {themeBtn("aup-theme-foot")}
                {!data.hide_branding && (
                  <a
                    href="https://folio.assetprim.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="aup-madewith"
                  >
                    Made with <b>Folio</b>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* ---------------- LIGHTBOX ---------------- */}
      {lb && (
        <div className="aup-lb" role="dialog" aria-modal="true" aria-label="Image viewer" onClick={() => setLb(null)}>
          <button ref={closeRef} type="button" className="aup-lb-close" onClick={() => setLb(null)} aria-label="Close image viewer">
            ✕
          </button>
          <figure className="aup-lb-fig" onClick={(e) => e.stopPropagation()}>
            <img src={lb.src} alt={lb.alt} />
            {lb.cap && <figcaption>{lb.cap}</figcaption>}
          </figure>
        </div>
      )}
    </div>
  );
}

export default GlassTemplate;

/* =====================================================================
   STYLES — self-contained, all prefixed `.aup-`, scoped under `.aup-root`.
   Light is the default; dark overrides live under [data-theme="dark"].
   ===================================================================== */

const AUP_CSS = `
.aup-root{
  /* ---- light tokens (default) ---- */
  --aup-bg:#F7F7FA; --aup-bg2:#F1F1F7; --aup-surface:#ffffff;
  --aup-ink:#11131A; --aup-ink2:#6F7280;
  --aup-lilac:#E9E1FF; --aup-blue:#E5E7FF;
  --aup-accent: var(--tpl-accent, #7c6cff);
  --aup-accent2: color-mix(in srgb, var(--aup-accent) 55%, #6366F1);
  --aup-tint: color-mix(in srgb, var(--aup-accent) 14%, var(--aup-surface));
  --aup-glass: rgba(255,255,255,0.55);
  --aup-glass-2: rgba(255,255,255,0.72);
  --aup-border: rgba(255,255,255,0.70);
  --aup-hair: rgba(17,19,26,0.07);
  --aup-track: color-mix(in srgb, var(--aup-ink) 10%, transparent);
  --aup-shadow: 0 24px 60px -30px rgba(84,72,160,0.35);
  --aup-shadow-sm: 0 12px 30px -18px rgba(84,72,160,0.30);
  --aup-r: 24px; --aup-r-lg: 30px;
  --aup-font: "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  --aup-display: "Bricolage Grotesque", "Inter", ui-sans-serif, system-ui, sans-serif;

  position:relative; isolation:isolate;
  background:
    radial-gradient(1200px 700px at 85% -5%, color-mix(in srgb, var(--aup-accent) 12%, transparent), transparent 60%),
    radial-gradient(900px 600px at 0% 10%, color-mix(in srgb, var(--aup-blue) 70%, transparent), transparent 55%),
    var(--aup-bg);
  color:var(--aup-ink); font-family:var(--aup-font);
  line-height:1.62; font-size:16px; -webkit-font-smoothing:antialiased;
  overflow-x:clip; min-height:100%; scroll-behavior:smooth;
  transition:background-color .45s ease, color .3s ease;
}
/* ---- dark tokens ---- */
.aup-root[data-theme="dark"]{
  --aup-bg:#0A0A12; --aup-bg2:#14141F; --aup-surface:#191926;
  --aup-ink:#F3F3F8; --aup-ink2:#A3A3B6;
  --aup-lilac:#241E3A; --aup-blue:#1B1E3C;
  --aup-tint: color-mix(in srgb, var(--aup-accent) 26%, #12121c);
  --aup-glass: rgba(28,28,44,0.55);
  --aup-glass-2: rgba(42,42,62,0.62);
  --aup-border: rgba(255,255,255,0.10);
  --aup-hair: rgba(255,255,255,0.10);
  --aup-track: color-mix(in srgb, #ffffff 12%, transparent);
  --aup-shadow: 0 30px 70px -30px rgba(0,0,0,0.72);
  --aup-shadow-sm: 0 16px 36px -18px rgba(0,0,0,0.6);
}

.aup-root *{ box-sizing:border-box; }
.aup-root img{ max-width:100%; display:block; }
.aup-root a{ color:inherit; }
.aup-root h1,.aup-root h2,.aup-root h3{ overflow-wrap:anywhere; }
.aup-root p,.aup-root blockquote{ overflow-wrap:anywhere; }

/* ---- background decoration (subtle drift) ---- */
.aup-bg{ position:absolute; inset:0; z-index:-1; overflow:hidden; pointer-events:none; }
.aup-blob{ position:absolute; border-radius:50%; filter:blur(80px); opacity:.55; will-change:transform; }
.aup-blob-1{ width:460px;height:460px; top:-120px; right:-80px; animation:aup-drift 24s ease-in-out infinite;
  background:radial-gradient(circle at 30% 30%, color-mix(in srgb,var(--aup-accent) 55%, transparent), transparent 70%); }
.aup-blob-2{ width:520px;height:520px; top:520px; left:-160px; opacity:.7; animation:aup-drift 30s ease-in-out infinite reverse;
  background:radial-gradient(circle at 40% 40%, color-mix(in srgb,var(--aup-blue) 90%, var(--aup-accent) 20%), transparent 70%); }
.aup-blob-3{ width:400px;height:400px; bottom:60px; right:-120px; opacity:.6; animation:aup-drift 27s ease-in-out infinite;
  background:radial-gradient(circle at 50% 50%, color-mix(in srgb,var(--aup-lilac) 90%, var(--aup-accent) 22%), transparent 70%); }
.aup-root[data-theme="dark"] .aup-blob{ opacity:.4; filter:blur(90px); }

/* ---- shell ---- */
.aup-shell{ width:100%; max-width:1220px; margin-inline:auto; padding-inline:clamp(16px,4vw,40px); }

/* ---- typography ---- */
.aup-eyebrow{ display:inline-flex; align-items:center; gap:8px; margin-bottom:12px;
  font-size:.72rem; font-weight:700; letter-spacing:.16em; text-transform:uppercase; color:var(--aup-accent); }
.aup-h2{ font-family:var(--aup-display); font-weight:700; margin:0;
  font-size:clamp(1.7rem,3.4vw,2.6rem); letter-spacing:-.02em; line-height:1.08; }
.aup-lead{ color:var(--aup-ink2); font-size:1.02rem; margin:14px 0 0; max-width:46ch; }
.aup-muted{ color:var(--aup-ink2); margin:6px 0 0; }
.aup-small{ font-size:.85rem; }
.aup-mt{ margin-top:16px; }
.aup-clamp-3,.aup-clamp-4{ display:-webkit-box; -webkit-box-orient:vertical; overflow:hidden; }
.aup-clamp-3{ -webkit-line-clamp:3; } .aup-clamp-4{ -webkit-line-clamp:4; }

/* ---- glass + buttons ---- */
.aup-glass{ background:var(--aup-glass); backdrop-filter:blur(20px) saturate(150%);
  -webkit-backdrop-filter:blur(20px) saturate(150%);
  border:1px solid var(--aup-border); box-shadow:var(--aup-shadow);
  transition:background-color .4s ease, border-color .4s ease, box-shadow .3s ease; }
.aup-btn{ display:inline-flex; align-items:center; gap:8px; padding:12px 20px;
  border-radius:14px; font-weight:600; font-size:.94rem; text-decoration:none;
  border:1px solid transparent; cursor:pointer; white-space:nowrap;
  transition:transform .18s ease, box-shadow .18s ease, background .3s ease, color .3s ease; }
.aup-btn:focus-visible{ outline:2px solid var(--aup-accent); outline-offset:3px; }
.aup-btn-primary{ color:#fff; background:linear-gradient(135deg,var(--aup-accent),var(--aup-accent2));
  box-shadow:0 16px 30px -14px color-mix(in srgb,var(--aup-accent) 75%, transparent); }
.aup-btn-primary:hover{ transform:translateY(-2px); }
.aup-btn-ghost{ background:var(--aup-glass-2); color:var(--aup-ink); border-color:var(--aup-border);
  backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px); }
.aup-btn-ghost:hover{ transform:translateY(-2px); }

/* ---- theme toggle ---- */
.aup-theme-btn{ width:42px; height:42px; flex:0 0 auto; border-radius:12px; cursor:pointer;
  display:grid; place-items:center; color:var(--aup-ink);
  background:var(--aup-glass-2); border:1px solid var(--aup-border);
  transition:transform .18s ease, background .3s ease, color .3s ease; }
.aup-theme-btn:hover{ transform:translateY(-2px) rotate(-8deg); }
.aup-theme-btn:focus-visible{ outline:2px solid var(--aup-accent); outline-offset:3px; }
.aup-theme-ic{ font-size:1.05rem; line-height:1; }

/* ---- sections ---- */
.aup-section{ padding-block:clamp(46px,7vw,92px); scroll-margin-top:96px; }
.aup-sechead{ display:flex; align-items:flex-end; justify-content:space-between; gap:16px;
  flex-wrap:wrap; margin-bottom:clamp(24px,3vw,40px); }
.aup-count-pill{ padding:8px 14px; border-radius:999px; font-size:.82rem; font-weight:600;
  color:var(--aup-accent); background:var(--aup-tint);
  border:1px solid color-mix(in srgb,var(--aup-accent) 22%, transparent); }

/* ---- reveal-on-scroll (only active once JS marks the root) ---- */
.aup-root.aup-anim-ready [data-reveal]{ opacity:0; transform:translateY(26px) scale(.992);
  transition:opacity .7s ease, transform .8s cubic-bezier(.22,1,.36,1); will-change:opacity, transform; }
.aup-root.aup-anim-ready [data-reveal].aup-in{ opacity:1; transform:none; }

/* ---- navbar ---- */
.aup-navwrap{ position:sticky; top:14px; z-index:60; padding-top:16px; }
.aup-nav{ display:flex; align-items:center; justify-content:space-between; gap:14px;
  padding:10px 12px 10px 16px; border-radius:20px; }
.aup-brand{ display:flex; align-items:center; gap:10px; text-decoration:none; min-width:0; }
.aup-brand-logo{ width:38px; height:38px; flex:0 0 auto; border-radius:11px; display:grid; place-items:center;
  font-weight:800; font-size:.9rem; color:#fff; background:linear-gradient(135deg,var(--aup-accent),var(--aup-accent2)); }
.aup-brand-txt{ display:flex; flex-direction:column; line-height:1.1; min-width:0; }
.aup-brand-txt b{ font-weight:700; font-size:.92rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:38vw; }
.aup-brand-txt em{ font-style:normal; font-size:.72rem; color:var(--aup-ink2); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:38vw; }
.aup-navlinks{ display:flex; gap:4px; list-style:none; margin:0; padding:0; }
.aup-navlinks a{ text-decoration:none; color:var(--aup-ink2); font-weight:500; font-size:.9rem;
  padding:8px 12px; border-radius:11px; transition:background .16s, color .16s; }
.aup-navlinks a:hover{ color:var(--aup-ink); background:var(--aup-glass-2); }
.aup-nav-right{ display:flex; align-items:center; gap:8px; }
.aup-nav-cta{ padding:10px 16px; }

.aup-menu{ display:none; position:relative; }
.aup-menu summary{ list-style:none; width:42px; height:42px; border-radius:12px; cursor:pointer;
  display:grid; place-items:center; gap:4px; background:var(--aup-glass-2); border:1px solid var(--aup-border); }
.aup-menu summary::-webkit-details-marker{ display:none; }
.aup-menu summary span{ display:block; width:18px; height:2px; border-radius:2px; background:var(--aup-ink); }
.aup-menu ul{ position:absolute; right:0; top:52px; min-width:180px; list-style:none; margin:0; padding:8px;
  border-radius:16px; background:var(--aup-glass-2); backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px);
  border:1px solid var(--aup-border); box-shadow:var(--aup-shadow); }
.aup-menu ul a{ display:block; padding:10px 12px; border-radius:10px; text-decoration:none; color:var(--aup-ink); font-weight:500; font-size:.92rem; }
.aup-menu ul a:hover{ background:var(--aup-tint); }

/* ---- hero ---- */
.aup-hero{ display:grid; grid-template-columns:1.05fr .95fr; gap:clamp(28px,4vw,56px);
  align-items:center; padding-block:clamp(34px,5vw,66px) clamp(40px,6vw,84px); }
.aup-hero-name{ font-family:var(--aup-display); font-weight:700; margin:6px 0 0;
  font-size:clamp(2.4rem,6.4vw,4.1rem); line-height:1.02; letter-spacing:-.03em; }
.aup-hero-title{ margin:6px 0 0; font-family:var(--aup-display); font-weight:700;
  font-size:clamp(1.3rem,3.4vw,2rem); letter-spacing:-.01em;
  background:linear-gradient(100deg,var(--aup-accent),var(--aup-accent2));
  -webkit-background-clip:text; background-clip:text; color:transparent; }
.aup-hero-intro{ margin:18px 0 0; color:var(--aup-ink2); font-size:1.06rem; max-width:44ch; }
.aup-hero-cta{ display:flex; flex-wrap:wrap; gap:12px; margin-top:26px; }
.aup-hero-meta{ display:flex; flex-wrap:wrap; gap:16px 20px; margin-top:22px; color:var(--aup-ink2); font-size:.9rem; }
.aup-dot-avail{ color:color-mix(in srgb, #12b76a 80%, var(--aup-ink)); font-weight:600; }
.aup-hero-socials{ margin-top:22px; }

.aup-hero-right{ display:flex; justify-content:center; }
.aup-portrait{ position:relative; width:min(420px,100%); perspective:1000px; }
.aup-portrait-tilt{ position:relative; transform-style:preserve-3d;
  transform:perspective(1000px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg)) translateZ(var(--tz,0px));
  transition:transform .25s ease; }
.aup-portrait-frame{ position:relative; border-radius:36px 36px 36px 64px; overflow:hidden; aspect-ratio:4/5;
  background:linear-gradient(160deg, var(--aup-surface), color-mix(in srgb,var(--aup-accent) 18%, var(--aup-surface))); }
.aup-portrait-frame .aup-zoom, .aup-portrait-frame .aup-zoom img{ width:100%; height:100%; }
.aup-portrait-frame .aup-zoom img{ object-fit:cover; }
.aup-portrait-ph{ width:100%; height:100%; display:grid; place-items:center;
  font-family:var(--aup-display); font-size:4rem; font-weight:700; color:#fff;
  background:linear-gradient(150deg,var(--aup-accent),var(--aup-accent2)); }
.aup-float{ position:absolute; display:flex; flex-direction:column; gap:1px; padding:12px 16px; border-radius:16px;
  box-shadow:var(--aup-shadow-sm); transform:translateZ(40px); animation:aup-float 6s ease-in-out infinite; }
.aup-float b{ font-family:var(--aup-display); font-size:1.15rem; line-height:1; }
.aup-float span{ font-size:.74rem; color:var(--aup-ink2); }
.aup-float-a{ top:20px; right:-10px; }
.aup-float-b{ bottom:26px; left:-14px; animation-delay:-3s; }
.aup-orb{ position:absolute; width:94px; height:94px; right:-24px; bottom:-18px; border-radius:50%;
  transform:translateZ(60px); animation:aup-float 7s ease-in-out infinite;
  background:radial-gradient(circle at 32% 30%, #fff, var(--aup-blue) 55%, color-mix(in srgb,var(--aup-accent) 40%, transparent) 100%);
  box-shadow:var(--aup-shadow-sm); opacity:.92; }

/* ---- about ---- */
.aup-about{ display:grid; grid-template-columns:1fr 1fr; gap:clamp(24px,4vw,48px); align-items:start; }
.aup-about-right{ padding:clamp(22px,3vw,32px); border-radius:var(--aup-r-lg); }
.aup-about-right p{ margin:0 0 14px; } .aup-about-right p:last-child{ margin-bottom:0; }
.aup-stats{ display:grid; grid-template-columns:repeat(auto-fit,minmax(110px,1fr)); gap:12px; padding:18px; border-radius:20px; margin-top:22px; }
.aup-stat{ display:flex; flex-direction:column; gap:2px; }
.aup-stat b{ font-family:var(--aup-display); font-size:1.7rem; line-height:1; color:var(--aup-accent); }
.aup-stat span{ font-size:.82rem; color:var(--aup-ink2); }

/* ---- cards / grids ---- */
.aup-grid-4{ display:grid; grid-template-columns:repeat(4,1fr); gap:clamp(14px,1.6vw,20px); }
.aup-grid-3{ display:grid; grid-template-columns:repeat(3,1fr); gap:clamp(16px,2vw,24px); }
.aup-grid-2{ display:grid; grid-template-columns:repeat(2,1fr); gap:clamp(16px,2vw,22px); }
.aup-grid-5{ display:grid; grid-template-columns:repeat(5,1fr); gap:14px; }

.aup-card{ position:relative; display:flex; flex-direction:column; gap:8px; padding:22px; border-radius:22px;
  background:var(--aup-glass); backdrop-filter:blur(20px) saturate(150%); -webkit-backdrop-filter:blur(20px) saturate(150%);
  border:1px solid var(--aup-border); box-shadow:var(--aup-shadow-sm); text-decoration:none; color:inherit;
  transition:transform .22s cubic-bezier(.22,1,.36,1), box-shadow .22s ease, background .4s ease, border-color .4s ease; }
.aup-tilt:hover{ transform:translateY(-5px) rotateX(3deg); box-shadow:var(--aup-shadow); }
.aup-icon{ width:46px; height:46px; border-radius:14px; display:grid; place-items:center;
  font-family:var(--aup-display); font-weight:700; font-size:.95rem; color:var(--aup-accent); background:var(--aup-tint);
  border:1px solid color-mix(in srgb,var(--aup-accent) 18%, transparent); }
.aup-icon-sm{ width:38px; height:38px; border-radius:11px; font-size:.9rem; }
.aup-card-title{ font-family:var(--aup-display); font-weight:700; font-size:1.1rem; margin:4px 0 0; letter-spacing:-.01em; }
.aup-card-foot{ display:flex; align-items:center; justify-content:space-between; gap:10px; margin-top:auto; padding-top:8px; flex-wrap:wrap; }
.aup-price{ font-weight:700; color:var(--aup-accent); }
.aup-arrow{ color:var(--aup-accent); font-weight:700; }

/* ---- skills + animated level bars ---- */
.aup-panel{ padding:clamp(18px,2.4vw,28px); border-radius:26px; }
.aup-skills-grid{ display:grid; grid-template-columns:repeat(auto-fill,minmax(210px,1fr)); gap:12px; }
.aup-skill{ position:relative; display:flex; flex-direction:column; gap:9px; padding:13px 15px; border-radius:15px;
  background:var(--aup-glass-2); border:1px solid var(--aup-border); box-shadow:var(--aup-shadow-sm);
  transition:transform .2s ease, box-shadow .2s ease, background .4s ease, border-color .4s ease; }
.aup-skill:hover{ transform:translateY(-3px); box-shadow:var(--aup-shadow); }
.aup-skill-top{ display:flex; align-items:center; gap:9px; }
.aup-skill-name{ font-weight:600; font-size:.92rem; flex:1; min-width:0; overflow-wrap:anywhere; }
.aup-skill-badge{ font-size:.72rem; font-weight:700; color:var(--aup-accent); padding:2px 8px; border-radius:7px;
  background:var(--aup-tint); border:1px solid color-mix(in srgb,var(--aup-accent) 20%, transparent); }
.aup-skill-cat{ font-size:.68rem; color:var(--aup-ink2); text-transform:uppercase; letter-spacing:.08em; }
.aup-lvl{ height:8px; border-radius:99px; background:var(--aup-track); overflow:hidden; }
.aup-lvl-fill{ display:block; height:100%; width:var(--pct); border-radius:99px;
  background:linear-gradient(90deg,var(--aup-accent),var(--aup-accent2));
  box-shadow:0 0 12px -2px color-mix(in srgb,var(--aup-accent) 60%, transparent);
  transition:width 1.15s cubic-bezier(.22,1,.36,1); }
.aup-root.aup-anim-ready .aup-skill[data-bar] .aup-lvl-fill{ width:0; }
.aup-root.aup-anim-ready .aup-skill[data-bar].aup-in .aup-lvl-fill{ width:var(--pct); }

/* ---- projects ---- */
.aup-proj{ position:relative; display:flex; flex-direction:column; padding:12px; border-radius:24px;
  text-decoration:none; color:inherit;
  transition:transform .22s cubic-bezier(.22,1,.36,1), box-shadow .22s ease, background .4s ease, border-color .4s ease; }
.aup-proj-media{ position:relative; border-radius:16px; overflow:hidden; aspect-ratio:16/11;
  background:linear-gradient(150deg, var(--aup-surface), color-mix(in srgb,var(--aup-accent) 16%, var(--aup-surface))); }
.aup-proj-media .aup-zoom, .aup-proj-media .aup-zoom img{ width:100%; height:100%; }
.aup-proj-media .aup-zoom img{ object-fit:cover; }
.aup-proj-ph{ width:100%; height:100%; display:grid; place-items:center;
  font-family:var(--aup-display); font-size:2.4rem; font-weight:700; color:#fff;
  background:linear-gradient(150deg,var(--aup-accent),var(--aup-accent2)); }
.aup-badge{ position:absolute; top:10px; left:10px; padding:5px 10px; border-radius:999px; font-size:.7rem; font-weight:700;
  color:#fff; background:color-mix(in srgb,var(--aup-accent) 85%, #000 4%); z-index:2; }
.aup-proj-body{ padding:14px 8px 6px; display:flex; flex-direction:column; gap:6px; }
.aup-proj-cat{ color:var(--aup-accent); font-weight:600; font-size:.85rem; margin:0; }
.aup-proj-title-link{ text-decoration:none; }
.aup-proj-title-link:hover{ color:var(--aup-accent); }
.aup-tags{ display:flex; flex-wrap:wrap; gap:6px; margin-top:6px; }
.aup-tag{ font-size:.72rem; padding:4px 9px; border-radius:8px; color:var(--aup-ink2); background:var(--aup-bg2); border:1px solid var(--aup-hair); }

/* ---- timeline ---- */
.aup-time{ display:flex; flex-direction:column; gap:14px; }
.aup-time-item{ padding:20px 22px; border-radius:20px; text-decoration:none; color:inherit;
  transition:transform .18s ease, box-shadow .18s ease, background .4s ease, border-color .4s ease; }
.aup-time-link:hover{ transform:translateY(-3px); box-shadow:var(--aup-shadow); }
.aup-time-head{ display:flex; align-items:baseline; justify-content:space-between; gap:12px; flex-wrap:wrap; }
.aup-time-role{ font-family:var(--aup-display); font-weight:700; font-size:1.14rem; margin:0; letter-spacing:-.01em; }
.aup-time-date{ font-size:.84rem; color:var(--aup-accent); font-weight:600; white-space:nowrap; }
.aup-time-meta{ color:var(--aup-ink2); font-size:.92rem; margin:4px 0 0; }

/* ---- process ---- */
.aup-step{ padding:22px 20px; border-radius:20px; display:flex; flex-direction:column; gap:6px; }
.aup-step-n{ font-family:var(--aup-display); font-weight:700; font-size:1.5rem; color:var(--aup-accent); opacity:.55; }
.aup-step-t{ font-family:var(--aup-display); font-weight:700; font-size:1.08rem; margin:2px 0 0; }

/* ---- gallery (responsive masonry, boxes fit each image) ---- */
.aup-gallery{ columns:3 260px; column-gap:16px; }
.aup-gitem{ break-inside:avoid; margin:0 0 16px; padding:8px; border-radius:18px; }
.aup-gitem .aup-zoom{ width:100%; border-radius:12px; overflow:hidden; }
.aup-gitem .aup-zoom img{ width:100%; height:auto; }
.aup-gitem figcaption{ padding:8px 6px 4px; }

/* ---- zoomable image button ---- */
.aup-zoom{ position:relative; display:block; padding:0; margin:0; border:0; background:none; cursor:zoom-in; color:inherit; }
.aup-zoom img{ transition:transform .5s cubic-bezier(.22,1,.36,1); }
.aup-zoom:hover img{ transform:scale(1.05); }
.aup-zoom:focus-visible{ outline:2px solid var(--aup-accent); outline-offset:3px; }
.aup-zoom-ic{ position:absolute; top:10px; right:10px; width:30px; height:30px; border-radius:9px; display:grid; place-items:center;
  font-size:.9rem; color:#fff; background:color-mix(in srgb,var(--aup-accent) 78%, transparent);
  opacity:0; transform:translateY(-4px); transition:opacity .2s ease, transform .2s ease; pointer-events:none; }
.aup-zoom:hover .aup-zoom-ic, .aup-zoom:focus-visible .aup-zoom-ic{ opacity:1; transform:none; }

/* ---- videos ---- */
.aup-video{ padding:8px; border-radius:18px; }
.aup-video-frame{ position:relative; aspect-ratio:16/9; border-radius:12px; overflow:hidden; background:#000; }
.aup-video-frame iframe{ position:absolute; inset:0; width:100%; height:100%; border:0; }
.aup-video figcaption{ padding:8px 6px 4px; }

/* ---- testimonials ---- */
.aup-tgrid{ display:grid; grid-template-columns:repeat(3,1fr); gap:20px; }
.aup-quote{ position:relative; padding:26px 24px; border-radius:22px; display:flex; flex-direction:column; gap:14px; }
.aup-quote-mark{ font-family:var(--aup-display); font-size:3rem; line-height:.4; color:var(--aup-accent); opacity:.35; height:22px; }
.aup-quote blockquote{ margin:0; font-size:1rem; color:var(--aup-ink); }
.aup-quote-by{ display:flex; align-items:center; gap:12px; margin-top:auto; }
.aup-quote-by span{ display:flex; flex-direction:column; line-height:1.2; }
.aup-quote-by b{ font-weight:700; font-size:.94rem; }
.aup-quote-by em{ font-style:normal; font-size:.82rem; }
.aup-avatar{ width:44px; height:44px; flex:0 0 auto; border-radius:50%; overflow:hidden; display:grid; place-items:center;
  font-weight:700; font-size:.85rem; color:#fff; background:linear-gradient(135deg,var(--aup-accent),var(--aup-accent2)); }
.aup-avatar img{ width:100%; height:100%; object-fit:cover; }

/* ---- contact ---- */
.aup-contact{ display:grid; grid-template-columns:.9fr 1.1fr; gap:clamp(24px,4vw,48px); align-items:start; }
.aup-contact-rows{ display:flex; flex-direction:column; gap:10px; margin-top:22px; }
.aup-contact-row{ display:flex; align-items:center; gap:12px; text-decoration:none; color:inherit; font-weight:500; word-break:break-word; }
.aup-contact-row .aup-icon-sm{ transition:transform .18s ease; }
.aup-contact-row:hover .aup-icon-sm{ transform:translateY(-2px); }
.aup-formcard{ position:relative; padding:clamp(22px,3vw,34px); border-radius:var(--aup-r-lg); overflow:hidden; }
.aup-orb-contact{ position:absolute; right:-30px; bottom:-30px; width:120px; height:120px; opacity:.8; animation:aup-float 8s ease-in-out infinite; }

/* ---- footer ---- */
.aup-footer{ margin-top:clamp(40px,6vw,72px); padding-bottom:clamp(20px,4vw,40px); }
.aup-footer-card{ position:relative; overflow:hidden; padding:clamp(22px,3.4vw,40px); border-radius:var(--aup-r-lg); }
.aup-footer-glow{ position:absolute; top:-70px; left:50%; transform:translateX(-50%); width:60%; height:180px; pointer-events:none;
  background:radial-gradient(circle, color-mix(in srgb,var(--aup-accent) 30%, transparent), transparent 70%); filter:blur(30px); opacity:.6; }
.aup-footer-top{ position:relative; display:flex; align-items:center; gap:16px 24px; flex-wrap:wrap; }
.aup-footer-brand{ display:flex; align-items:center; gap:12px; text-decoration:none; color:inherit; }
.aup-footer-brand span{ display:flex; flex-direction:column; line-height:1.2; }
.aup-footer-brand b{ font-family:var(--aup-display); font-weight:700; font-size:1.05rem; }
.aup-footer-brand em{ font-style:normal; font-size:.8rem; color:var(--aup-ink2); }
.aup-footer-tag{ color:var(--aup-ink2); font-size:.92rem; margin:0; max-width:42ch; flex:1 1 240px; }
.aup-totop{ margin-left:auto; width:44px; height:44px; flex:0 0 auto; border-radius:12px; display:grid; place-items:center;
  text-decoration:none; font-weight:700; color:var(--aup-accent); background:var(--aup-tint);
  border:1px solid color-mix(in srgb,var(--aup-accent) 20%, transparent); transition:transform .18s ease; }
.aup-totop:hover{ transform:translateY(-3px); }
.aup-footer-cols{ position:relative; display:flex; flex-wrap:wrap; gap:14px 40px; justify-content:space-between;
  margin-top:24px; padding-top:22px; border-top:1px solid var(--aup-hair); }
.aup-footer-nav, .aup-footer-soc{ display:flex; flex-wrap:wrap; gap:8px 18px; }
.aup-footer-nav a, .aup-footer-soc a{ text-decoration:none; color:var(--aup-ink2); font-size:.9rem; transition:color .16s ease; }
.aup-footer-nav a:hover, .aup-footer-soc a:hover{ color:var(--aup-accent); }
.aup-footer-bottom{ position:relative; display:flex; align-items:center; justify-content:space-between; gap:14px; flex-wrap:wrap;
  margin-top:22px; padding-top:20px; border-top:1px solid var(--aup-hair); color:var(--aup-ink2); font-size:.85rem; }
.aup-footer-bottom-r{ display:flex; align-items:center; gap:12px; }
.aup-theme-foot{ width:38px; height:38px; border-radius:10px; }
.aup-madewith{ text-decoration:none; color:var(--aup-ink2); }
.aup-madewith b{ color:var(--aup-accent); font-weight:700; }

/* ---- lightbox ---- */
.aup-lb{ position:fixed; inset:0; z-index:1000; display:grid; place-items:center; padding:clamp(16px,4vw,48px);
  background:color-mix(in srgb, #05050c 78%, transparent); backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px);
  animation:aup-lb-in .25s ease both; }
.aup-lb-fig{ margin:0; max-width:94vw; max-height:92vh; display:flex; flex-direction:column; gap:10px; align-items:center;
  animation:aup-lb-pop .32s cubic-bezier(.22,1,.36,1) both; }
.aup-lb-fig img{ max-width:92vw; max-height:84vh; width:auto; height:auto; object-fit:contain;
  border-radius:16px; box-shadow:0 40px 90px -30px rgba(0,0,0,.8); }
.aup-lb-fig figcaption{ color:#f4f4f8; font-size:.9rem; text-align:center; max-width:80ch; }
.aup-lb-close{ position:fixed; top:18px; right:18px; width:46px; height:46px; border-radius:13px; cursor:pointer; z-index:1001;
  display:grid; place-items:center; font-size:1.1rem; color:#fff;
  background:rgba(255,255,255,.14); border:1px solid rgba(255,255,255,.25); backdrop-filter:blur(8px);
  transition:transform .18s ease, background .18s ease; }
.aup-lb-close:hover{ transform:rotate(90deg) scale(1.05); background:rgba(255,255,255,.24); }
.aup-lb-close:focus-visible{ outline:2px solid #fff; outline-offset:2px; }

/* ---- keyframes ---- */
@keyframes aup-float{ 0%,100%{ transform:translateY(0) translateZ(var(--tz,40px)); } 50%{ transform:translateY(-10px) translateZ(var(--tz,40px)); } }
@keyframes aup-drift{ 0%,100%{ transform:translate(0,0) scale(1); } 33%{ transform:translate(24px,-18px) scale(1.05); } 66%{ transform:translate(-18px,14px) scale(.97); } }
@keyframes aup-lb-in{ from{ opacity:0; } to{ opacity:1; } }
@keyframes aup-lb-pop{ from{ opacity:0; transform:scale(.92); } to{ opacity:1; transform:none; } }

/* ---- responsive ---- */
@media (max-width:1000px){
  .aup-grid-4{ grid-template-columns:repeat(2,1fr); }
  .aup-grid-5{ grid-template-columns:repeat(3,1fr); }
}
@media (max-width:900px){
  .aup-hero{ grid-template-columns:1fr; }
  .aup-hero-right{ order:-1; }
  .aup-portrait{ width:min(360px,100%); }
  .aup-grid-3{ grid-template-columns:repeat(2,1fr); }
  .aup-tgrid{ display:flex; overflow-x:auto; gap:16px; scroll-snap-type:x mandatory; padding-bottom:8px;
    margin-inline:calc(-1 * clamp(16px,4vw,40px)); padding-inline:clamp(16px,4vw,40px); }
  .aup-tgrid .aup-quote{ flex:0 0 82%; scroll-snap-align:start; }
  .aup-navlinks{ display:none; }
  .aup-menu{ display:block; }
}
@media (max-width:820px){
  .aup-about{ grid-template-columns:1fr; }
  .aup-contact{ grid-template-columns:1fr; }
}
@media (max-width:700px){
  .aup-grid-5{ grid-template-columns:repeat(2,1fr); }
  .aup-grid-2{ grid-template-columns:1fr; }
  .aup-gallery{ columns:2 160px; }
  .aup-skills-grid{ grid-template-columns:1fr 1fr; }
}
@media (max-width:560px){
  .aup-grid-4{ grid-template-columns:1fr; }
  .aup-grid-3{ grid-template-columns:1fr; }
  .aup-grid-5{ grid-template-columns:1fr; }
  .aup-skills-grid{ grid-template-columns:1fr; }
  .aup-nav-cta{ display:none; }
  .aup-brand-txt em{ display:none; }
  .aup-float-a{ right:6px; } .aup-float-b{ left:6px; }
}
@media (max-width:420px){ .aup-gallery{ columns:1; } }

@media (prefers-reduced-motion: reduce){
  .aup-root{ scroll-behavior:auto; }
  .aup-root *{ animation:none !important; transition:none !important; }
  .aup-portrait-tilt{ transform:none !important; }
}
`;
