import type { CSSProperties, ReactNode } from "react";
import { Fragment } from "react";
import type { PublicPortfolio } from "@/lib/publicTypes";
import { dateRange, videoEmbed, ext } from "@/lib/publicTypes";
import { ZoomImage } from "@/components/ZoomImage";
import { ContactForm } from "@/components/ContactForm";

/* =====================================================================
   GlassTemplate — "Aurora Pro" glass look
   Premium minimal + soft glassmorphism portfolio template for Folio.
   PURE PRESENTATION. Everything comes from `data`. No fetch / DB / auth.
   All styles are self-contained in the <style> block below and prefixed
   with `.aup-` so they never clash with other templates.
   ===================================================================== */

/* ---------- small, pure helpers (safe for any/empty data) ---------- */

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
  "process", // static template chrome (see note at bottom of file)
  "testimonials",
];

function resolveOrder(settings: PublicPortfolio["settings"]): string[] {
  const custom = settings?.section_order;
  const order = custom && custom.length ? [...custom] : [...DEFAULT_ORDER];
  // Keep "process" chrome positioned just before testimonials if the app
  // supplied an order that doesn't know about it.
  if (!order.includes("process")) {
    const ti = order.indexOf("testimonials");
    if (ti >= 0) order.splice(ti, 0, "process");
    else order.push("process");
  }
  // Make sure every known section still gets a chance to render.
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

/* ------------------------------- component ------------------------------- */

export function GlassTemplate({ data }: { data: PublicPortfolio }) {
  const p = data.profile;
  const accent = data.accent || "#7c6cff";

  const hidden = new Set(data.settings?.hidden ?? []);
  const sv = (k: string) => !hidden.has(k);

  // Narrow to a local so TS keeps `string` inside the JSX below
  // (a boolean like `has.contact` does NOT narrow `data.username`).
  const username = data.username;

  const name = p?.display_name || username || "Your Name";
  const mono = initials(p?.display_name, username);

  // What actually renders — drives the nav so it never links to an empty spot.
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

  /* --- reusable bits --- */
  const eyebrow = (t: string) => <span className="aup-eyebrow">{t}</span>;

  const socialChips = (extra?: string) =>
    data.links.length > 0 && (
      <div className={`aup-chips ${extra || ""}`}>
        {data.links.map((l) => (
          <a key={l.id} className="aup-chip aup-chip-link" href={ext(l.url)} target="_blank" rel="noopener noreferrer">
            <span className="aup-chip-mono">{initials(l.label || l.platform, l.platform)}</span>
            <span>{l.label || l.platform}</span>
          </a>
        ))}
      </div>
    );

  /* --- section renderers (each returns null when there's nothing to show) --- */
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
        <section id="about" data-sec="about" className="aup-section">
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
                <a className="aup-btn aup-btn-ghost aup-mt" href={ext(p.resume_url)} target="_blank" rel="noopener noreferrer">
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
        <section id="services" data-sec="services" className="aup-section">
          <div className="aup-sechead">
            <div>
              {eyebrow("What I do")}
              <h2 className="aup-h2">Services I offer</h2>
            </div>
          </div>
          <div className="aup-grid-4">
            {data.services.map((s) => (
              <article key={s.id} className="aup-card">
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
        <section id="skills" data-sec="skills" className="aup-section">
          <div className="aup-sechead">
            <div>
              {eyebrow("Tools & skills")}
              <h2 className="aup-h2">Technologies I use</h2>
            </div>
          </div>
          <div className="aup-panel aup-glass">
            <div className="aup-chips">
              {sorted.map((s) => (
                <span key={s.id} className="aup-chip" title={s.category || undefined}>
                  <span className="aup-chip-mono">{initials(s.name, "•")}</span>
                  <span>{s.name}</span>
                  {s.level && <span className="aup-chip-level">{s.level}</span>}
                </span>
              ))}
            </div>
          </div>
        </section>
      );
    },

    projects: () => {
      if (!has.projects) return null;
      const ordered = [...data.projects].sort((a, b) => Number(!!b.is_featured) - Number(!!a.is_featured));
      return (
        <section id="work" data-sec="projects" className="aup-section">
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
              const Card = (
                <>
                  <div className="aup-proj-media">
                    {pr.image_url ? (
                      <ZoomImage src={pr.image_url} alt={pr.title || "Project image"} />
                    ) : (
                      <div className="aup-proj-ph" aria-hidden>{initials(pr.title, "P")}</div>
                    )}
                    {pr.is_featured && <span className="aup-badge">Featured</span>}
                  </div>
                  <div className="aup-proj-body">
                    <h3 className="aup-card-title">{pr.title || "Untitled project"}</h3>
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
                </>
              );
              return pr.url ? (
                <a key={pr.id} className="aup-proj aup-glass aup-proj-link" href={ext(pr.url)} target="_blank" rel="noopener noreferrer">
                  {Card}
                  <span className="aup-proj-arrow" aria-hidden>↗</span>
                </a>
              ) : (
                <article key={pr.id} className="aup-proj aup-glass">{Card}</article>
              );
            })}
          </div>
        </section>
      );
    },

    experience: () => {
      if (!(sv("experience") && data.experience.length > 0)) return null;
      return (
        <section id="experience" data-sec="experience" className="aup-section">
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
                <p className="aup-time-meta">
                  {[e.company, e.location].filter(Boolean).join(" · ")}
                </p>
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
        <section id="education" data-sec="education" className="aup-section">
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
        <section id="certifications" data-sec="certifications" className="aup-section">
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
                <a key={c.id} className="aup-card aup-card-link" href={ext(c.url)} target="_blank" rel="noopener noreferrer">
                  {body}<span className="aup-arrow" aria-hidden>↗</span>
                </a>
              ) : (
                <article key={c.id} className="aup-card">{body}</article>
              );
            })}
          </div>
        </section>
      );
    },

    achievements: () => {
      if (!(sv("achievements") && data.achievements.length > 0)) return null;
      return (
        <section id="achievements" data-sec="achievements" className="aup-section">
          <div className="aup-sechead">
            <div>
              {eyebrow("Highlights")}
              <h2 className="aup-h2">Achievements</h2>
            </div>
          </div>
          <div className="aup-grid-3">
            {data.achievements.map((a) => (
              <article key={a.id} className="aup-card">
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
        <section id="publications" data-sec="publications" className="aup-section">
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
                <a key={pub.id} className="aup-time-item aup-glass aup-time-link" href={ext(pub.url)} target="_blank" rel="noopener noreferrer">
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
        <section id="gallery" data-sec="gallery" className="aup-section">
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
                  <ZoomImage src={g.image_url} alt={g.caption || "Gallery image"} />
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
        <section id="videos" data-sec="videos" className="aup-section">
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
      // Static template chrome — profession-neutral, no owner data involved.
      const steps = [
        { t: "Discover", d: "Understand the goals, audience and the problem worth solving." },
        { t: "Define", d: "Shape the scope, constraints and what success looks like." },
        { t: "Ideate", d: "Explore directions, sketch options and pressure-test ideas." },
        { t: "Create", d: "Build the real thing with craft, clarity and attention to detail." },
        { t: "Refine", d: "Test, iterate and polish until it truly lands." },
      ];
      return (
        <section id="process" data-sec="process" className="aup-section">
          <div className="aup-sechead">
            <div>
              {eyebrow("My process")}
              <h2 className="aup-h2">How I work</h2>
            </div>
          </div>
          <div className="aup-grid-5">
            {steps.map((s, i) => (
              <article key={s.t} className="aup-step aup-glass">
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
        <section id="testimonials" data-sec="testimonials" className="aup-section">
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
                    {t.avatar_url ? (
                      <img src={t.avatar_url} alt="" loading="lazy" />
                    ) : (
                      initials(t.author, "•")
                    )}
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

  /* --- hero floating data (only rendered if the data exists) --- */
  const floatA = p?.availability;
  const floatB = data.projects.length > 0 ? data.projects.length : null;

  return (
    <div
      className="aup-root"
      id="top"
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
            <div className="aup-portrait">
              <div className="aup-portrait-frame aup-glass">
                {p?.avatar_url ? (
                  <img src={p.avatar_url} alt={name} loading="eager" />
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
        </header>

        {/* ---------------- DATA SECTIONS (ordered + hideable) ---------------- */}
        {order.map((k) => (
          <Fragment key={k}>{sections[k] ? sections[k]() : null}</Fragment>
        ))}

        {/* ---------------- CONTACT ---------------- */}
        {username && (
          <section id="contact" className="aup-section">
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
        <div className="aup-shell aup-footer-inner">
          <a className="aup-brand aup-brand-foot" href="#top">
            <span className="aup-brand-logo" aria-hidden>{mono}</span>
            <b>{name}</b>
          </a>

          {data.links.length > 0 && (
            <nav className="aup-foot-links" aria-label="Social">
              {data.links.map((l) => (
                <a key={l.id} href={ext(l.url)} target="_blank" rel="noopener noreferrer">
                  {l.label || l.platform}
                </a>
              ))}
            </nav>
          )}

          <div className="aup-foot-right">
            <span>© {new Date().getFullYear()} {name}</span>
            {!data.hide_branding && (
              <a href="https://folio.assetprim.com" target="_blank" rel="noopener noreferrer" className="aup-madewith">
                Made with Folio
              </a>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}

export default GlassTemplate;

/* =====================================================================
   STYLES — self-contained, all prefixed `.aup-` and scoped under
   `.aup-root` so nothing leaks into the app or other templates.
   ===================================================================== */

const AUP_CSS = `
.aup-root{
  --aup-bg:#F7F7FA; --aup-bg2:#F1F1F7;
  --aup-ink:#11131A; --aup-ink2:#6F7280;
  --aup-white:#fff; --aup-lilac:#E9E1FF; --aup-blue:#E5E7FF;
  --aup-accent: var(--tpl-accent, #7c6cff);
  --aup-accent2: color-mix(in srgb, var(--aup-accent) 55%, #6366F1);
  --aup-tint: color-mix(in srgb, var(--aup-accent) 14%, #ffffff);
  --aup-glass: rgba(255,255,255,0.55);
  --aup-glass-2: rgba(255,255,255,0.72);
  --aup-border: rgba(255,255,255,0.70);
  --aup-hair: rgba(17,19,26,0.07);
  --aup-shadow: 0 24px 60px -30px rgba(84,72,160,0.35);
  --aup-shadow-sm: 0 12px 30px -18px rgba(84,72,160,0.30);
  --aup-r: 24px; --aup-r-lg: 30px;
  --aup-font: "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  --aup-display: "Bricolage Grotesque", "Inter", ui-sans-serif, system-ui, sans-serif;

  position:relative; isolation:isolate;
  background:
    radial-gradient(1200px 700px at 85% -5%, color-mix(in srgb, var(--aup-accent) 10%, transparent), transparent 60%),
    radial-gradient(900px 600px at 0% 10%, var(--aup-blue), transparent 55%),
    var(--aup-bg);
  color:var(--aup-ink); font-family:var(--aup-font);
  line-height:1.62; font-size:16px; -webkit-font-smoothing:antialiased;
  overflow-x:clip; min-height:100%; scroll-behavior:smooth;
}
.aup-root *{ box-sizing:border-box; }
.aup-root img{ max-width:100%; display:block; }
.aup-root a{ color:inherit; }
.aup-root h1,.aup-root h2,.aup-root h3{ overflow-wrap:anywhere; }
.aup-root p, .aup-root blockquote{ overflow-wrap:anywhere; }

/* ---- decorative background ---- */
.aup-bg{ position:absolute; inset:0; z-index:-1; overflow:hidden; pointer-events:none; }
.aup-blob{ position:absolute; border-radius:50%; filter:blur(80px); opacity:.55; }
.aup-blob-1{ width:460px;height:460px; top:-120px; right:-80px;
  background:radial-gradient(circle at 30% 30%, color-mix(in srgb,var(--aup-accent) 45%, #fff), transparent 70%); }
.aup-blob-2{ width:520px;height:520px; top:520px; left:-160px;
  background:radial-gradient(circle at 40% 40%, var(--aup-blue), transparent 70%); opacity:.7; }
.aup-blob-3{ width:400px;height:400px; bottom:60px; right:-120px;
  background:radial-gradient(circle at 50% 50%, var(--aup-lilac), transparent 70%); opacity:.6; }

/* ---- shell ---- */
.aup-shell{ width:100%; max-width:1220px; margin-inline:auto; padding-inline:clamp(16px,4vw,40px); }

/* ---- typography helpers ---- */
.aup-eyebrow{ display:inline-flex; align-items:center; gap:8px; margin-bottom:12px;
  font-size:.72rem; font-weight:700; letter-spacing:.16em; text-transform:uppercase;
  color:var(--aup-accent); }
.aup-h2{ font-family:var(--aup-display); font-weight:700; margin:0;
  font-size:clamp(1.7rem,3.4vw,2.6rem); letter-spacing:-.02em; line-height:1.08; }
.aup-lead{ color:var(--aup-ink2); font-size:1.02rem; margin:14px 0 0; max-width:46ch; }
.aup-muted{ color:var(--aup-ink2); margin:6px 0 0; }
.aup-small{ font-size:.85rem; }
.aup-mt{ margin-top:16px; }
.aup-clamp-3,.aup-clamp-4{ display:-webkit-box; -webkit-box-orient:vertical; overflow:hidden; }
.aup-clamp-3{ -webkit-line-clamp:3; }
.aup-clamp-4{ -webkit-line-clamp:4; }

/* ---- glass + buttons ---- */
.aup-glass{ background:var(--aup-glass); backdrop-filter:blur(20px) saturate(150%);
  -webkit-backdrop-filter:blur(20px) saturate(150%);
  border:1px solid var(--aup-border); box-shadow:var(--aup-shadow); }
.aup-btn{ display:inline-flex; align-items:center; gap:8px; padding:12px 20px;
  border-radius:14px; font-weight:600; font-size:.94rem; text-decoration:none;
  border:1px solid transparent; cursor:pointer; white-space:nowrap;
  transition:transform .18s ease, box-shadow .18s ease, background .18s ease; }
.aup-btn:focus-visible{ outline:2px solid var(--aup-accent); outline-offset:3px; }
.aup-btn-primary{ color:#fff;
  background:linear-gradient(135deg,var(--aup-accent),var(--aup-accent2));
  box-shadow:0 16px 30px -14px color-mix(in srgb,var(--aup-accent) 75%, transparent); }
.aup-btn-primary:hover{ transform:translateY(-2px); }
.aup-btn-ghost{ background:var(--aup-glass-2); color:var(--aup-ink); border-color:var(--aup-border);
  backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px); }
.aup-btn-ghost:hover{ transform:translateY(-2px); }

/* ---- sections ---- */
.aup-section{ padding-block:clamp(46px,7vw,92px); scroll-margin-top:96px; }
.aup-sechead{ display:flex; align-items:flex-end; justify-content:space-between;
  gap:16px; flex-wrap:wrap; margin-bottom:clamp(24px,3vw,40px); }
.aup-count-pill{ padding:8px 14px; border-radius:999px; font-size:.82rem; font-weight:600;
  color:var(--aup-accent); background:var(--aup-tint);
  border:1px solid color-mix(in srgb,var(--aup-accent) 22%, transparent); }

/* ---- navbar ---- */
.aup-navwrap{ position:sticky; top:14px; z-index:60; padding-top:16px; }
.aup-nav{ display:flex; align-items:center; justify-content:space-between; gap:14px;
  padding:10px 12px 10px 16px; border-radius:20px; }
.aup-brand{ display:flex; align-items:center; gap:10px; text-decoration:none; min-width:0; }
.aup-brand-logo{ width:38px; height:38px; flex:0 0 auto; border-radius:11px; display:grid;
  place-items:center; font-weight:800; font-size:.9rem; color:#fff;
  background:linear-gradient(135deg,var(--aup-accent),var(--aup-accent2)); }
.aup-brand-txt{ display:flex; flex-direction:column; line-height:1.1; min-width:0; }
.aup-brand-txt b{ font-weight:700; font-size:.92rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:38vw; }
.aup-brand-txt em{ font-style:normal; font-size:.72rem; color:var(--aup-ink2); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:38vw; }
.aup-navlinks{ display:flex; gap:4px; list-style:none; margin:0; padding:0; }
.aup-navlinks a{ text-decoration:none; color:var(--aup-ink2); font-weight:500; font-size:.9rem;
  padding:8px 12px; border-radius:11px; transition:background .16s, color .16s; }
.aup-navlinks a:hover{ color:var(--aup-ink); background:var(--aup-glass-2); }
.aup-nav-right{ display:flex; align-items:center; gap:8px; }
.aup-nav-cta{ padding:10px 16px; }

/* mobile disclosure menu (pure HTML/CSS, no JS) */
.aup-menu{ display:none; position:relative; }
.aup-menu summary{ list-style:none; width:42px; height:42px; border-radius:12px; cursor:pointer;
  display:grid; place-items:center; gap:4px; background:var(--aup-glass-2); border:1px solid var(--aup-border); }
.aup-menu summary::-webkit-details-marker{ display:none; }
.aup-menu summary span{ display:block; width:18px; height:2px; border-radius:2px; background:var(--aup-ink); }
.aup-menu ul{ position:absolute; right:0; top:52px; min-width:180px; list-style:none; margin:0; padding:8px;
  border-radius:16px; background:var(--aup-glass-2); backdrop-filter:blur(20px);
  -webkit-backdrop-filter:blur(20px); border:1px solid var(--aup-border); box-shadow:var(--aup-shadow); }
.aup-menu ul a{ display:block; padding:10px 12px; border-radius:10px; text-decoration:none;
  color:var(--aup-ink); font-weight:500; font-size:.92rem; }
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
.aup-hero-meta{ display:flex; flex-wrap:wrap; gap:16px 20px; margin-top:22px;
  color:var(--aup-ink2); font-size:.9rem; }
.aup-dot-avail{ color:color-mix(in srgb, #12b76a 80%, var(--aup-ink)); font-weight:600; }
.aup-hero-socials{ margin-top:22px; }

.aup-hero-right{ display:flex; justify-content:center; }
.aup-portrait{ position:relative; width:min(420px,100%); }
.aup-portrait-frame{ position:relative; border-radius:36px 36px 36px 64px; overflow:hidden;
  aspect-ratio:4/5; background:linear-gradient(160deg, #fff, var(--aup-blue)); }
.aup-portrait-frame img{ width:100%; height:100%; object-fit:cover; }
.aup-portrait-ph{ width:100%; height:100%; display:grid; place-items:center;
  font-family:var(--aup-display); font-size:4rem; font-weight:700; color:#fff;
  background:linear-gradient(150deg,var(--aup-accent),var(--aup-accent2)); }
.aup-float{ position:absolute; display:flex; flex-direction:column; gap:1px;
  padding:12px 16px; border-radius:16px; box-shadow:var(--aup-shadow-sm); }
.aup-float b{ font-family:var(--aup-display); font-size:1.15rem; line-height:1; }
.aup-float span{ font-size:.74rem; color:var(--aup-ink2); }
.aup-float-a{ top:20px; right:-10px; }
.aup-float-b{ bottom:26px; left:-14px; }
.aup-orb{ position:absolute; width:94px; height:94px; right:-24px; bottom:-18px; border-radius:50%;
  background:radial-gradient(circle at 32% 30%, #fff, var(--aup-blue) 55%, color-mix(in srgb,var(--aup-accent) 30%, transparent) 100%);
  box-shadow:var(--aup-shadow-sm); opacity:.9; }

/* ---- about ---- */
.aup-about{ display:grid; grid-template-columns:1fr 1fr; gap:clamp(24px,4vw,48px); align-items:start; }
.aup-about-right{ padding:clamp(22px,3vw,32px); border-radius:var(--aup-r-lg); }
.aup-about-right p{ margin:0 0 14px; }
.aup-about-right p:last-child{ margin-bottom:0; }
.aup-stats{ display:grid; grid-template-columns:repeat(auto-fit,minmax(110px,1fr)); gap:12px;
  padding:18px; border-radius:20px; margin-top:22px; }
.aup-stat{ display:flex; flex-direction:column; gap:2px; }
.aup-stat b{ font-family:var(--aup-display); font-size:1.7rem; line-height:1;
  color:var(--aup-accent); }
.aup-stat span{ font-size:.82rem; color:var(--aup-ink2); }

/* ---- cards / grids ---- */
.aup-grid-4{ display:grid; grid-template-columns:repeat(4,1fr); gap:clamp(14px,1.6vw,20px); }
.aup-grid-3{ display:grid; grid-template-columns:repeat(3,1fr); gap:clamp(16px,2vw,24px); }
.aup-grid-2{ display:grid; grid-template-columns:repeat(2,1fr); gap:clamp(16px,2vw,22px); }
.aup-grid-5{ display:grid; grid-template-columns:repeat(5,1fr); gap:14px; }

.aup-card{ position:relative; display:flex; flex-direction:column; gap:8px;
  padding:22px; border-radius:22px; background:var(--aup-glass);
  backdrop-filter:blur(20px) saturate(150%); -webkit-backdrop-filter:blur(20px) saturate(150%);
  border:1px solid var(--aup-border); box-shadow:var(--aup-shadow-sm);
  transition:transform .2s ease, box-shadow .2s ease; text-decoration:none; color:inherit; }
.aup-card-link:hover, .aup-card:hover{ transform:translateY(-4px); box-shadow:var(--aup-shadow); }
.aup-icon{ width:46px; height:46px; border-radius:14px; display:grid; place-items:center;
  font-family:var(--aup-display); font-weight:700; font-size:.95rem; color:var(--aup-accent);
  background:var(--aup-tint);
  border:1px solid color-mix(in srgb,var(--aup-accent) 18%, transparent); }
.aup-icon-sm{ width:38px; height:38px; border-radius:11px; font-size:.9rem; }
.aup-card-title{ font-family:var(--aup-display); font-weight:700; font-size:1.1rem; margin:4px 0 0; letter-spacing:-.01em; }
.aup-card-foot{ display:flex; align-items:center; justify-content:space-between; gap:10px; margin-top:auto; padding-top:8px; flex-wrap:wrap; }
.aup-price{ font-weight:700; color:var(--aup-accent); }
.aup-arrow{ color:var(--aup-accent); font-weight:700; }

/* ---- skills panel ---- */
.aup-panel{ padding:clamp(20px,3vw,32px); border-radius:26px; }
.aup-chips{ display:flex; flex-wrap:wrap; gap:10px; }
.aup-chip{ display:inline-flex; align-items:center; gap:8px; padding:9px 14px; border-radius:12px;
  background:var(--aup-glass-2); border:1px solid var(--aup-border); font-weight:600; font-size:.9rem;
  text-decoration:none; color:inherit; transition:transform .16s ease, box-shadow .16s ease; }
.aup-chip-link:hover{ transform:translateY(-2px); box-shadow:var(--aup-shadow-sm); }
.aup-chip-mono{ width:22px; height:22px; border-radius:7px; display:grid; place-items:center;
  font-size:.66rem; color:#fff; background:linear-gradient(135deg,var(--aup-accent),var(--aup-accent2)); }
.aup-chip-level{ font-size:.72rem; color:var(--aup-ink2); font-weight:500;
  padding-left:8px; margin-left:2px; border-left:1px solid var(--aup-hair); }

/* ---- projects ---- */
.aup-proj{ position:relative; display:flex; flex-direction:column; padding:12px;
  border-radius:24px; text-decoration:none; color:inherit;
  transition:transform .2s ease, box-shadow .2s ease; }
.aup-proj-link:hover{ transform:translateY(-5px); box-shadow:var(--aup-shadow); }
.aup-proj-media{ position:relative; border-radius:16px; overflow:hidden; aspect-ratio:16/11;
  background:linear-gradient(150deg,#fff,var(--aup-blue)); }
.aup-proj-media img{ width:100%; height:100%; object-fit:cover; }
.aup-proj-media :where(button, .zoom, span, div){ height:100%; }
.aup-proj-ph{ width:100%; height:100%; display:grid; place-items:center;
  font-family:var(--aup-display); font-size:2.4rem; font-weight:700; color:#fff;
  background:linear-gradient(150deg,var(--aup-accent),var(--aup-accent2)); }
.aup-badge{ position:absolute; top:10px; left:10px; padding:5px 10px; border-radius:999px;
  font-size:.7rem; font-weight:700; color:#fff; background:color-mix(in srgb,var(--aup-accent) 85%, #000 4%); }
.aup-proj-body{ padding:14px 8px 6px; display:flex; flex-direction:column; gap:6px; }
.aup-proj-cat{ color:var(--aup-accent); font-weight:600; font-size:.85rem; margin:0; }
.aup-tags{ display:flex; flex-wrap:wrap; gap:6px; margin-top:6px; }
.aup-tag{ font-size:.72rem; padding:4px 9px; border-radius:8px; color:var(--aup-ink2);
  background:var(--aup-bg2); border:1px solid var(--aup-hair); }
.aup-proj-arrow{ position:absolute; top:22px; right:22px; color:#fff; font-weight:700;
  width:30px; height:30px; border-radius:9px; display:grid; place-items:center;
  background:color-mix(in srgb,var(--aup-accent) 80%, transparent); }

/* ---- timeline (experience / education / publications) ---- */
.aup-time{ display:flex; flex-direction:column; gap:14px; }
.aup-time-item{ padding:20px 22px; border-radius:20px; text-decoration:none; color:inherit;
  transition:transform .18s ease, box-shadow .18s ease; }
.aup-time-link:hover{ transform:translateY(-3px); box-shadow:var(--aup-shadow); }
.aup-time-head{ display:flex; align-items:baseline; justify-content:space-between; gap:12px; flex-wrap:wrap; }
.aup-time-role{ font-family:var(--aup-display); font-weight:700; font-size:1.14rem; margin:0; letter-spacing:-.01em; }
.aup-time-date{ font-size:.84rem; color:var(--aup-accent); font-weight:600; white-space:nowrap; }
.aup-time-meta{ color:var(--aup-ink2); font-size:.92rem; margin:4px 0 0; }

/* ---- process ---- */
.aup-step{ padding:22px 20px; border-radius:20px; display:flex; flex-direction:column; gap:6px; }
.aup-step-n{ font-family:var(--aup-display); font-weight:700; font-size:1.5rem; color:var(--aup-accent); opacity:.55; }
.aup-step-t{ font-family:var(--aup-display); font-weight:700; font-size:1.08rem; margin:2px 0 0; }

/* ---- gallery ---- */
.aup-gallery{ columns:3 260px; column-gap:16px; }
.aup-gitem{ break-inside:avoid; margin:0 0 16px; padding:8px; border-radius:18px; }
.aup-gitem img{ width:100%; border-radius:12px; }
.aup-gitem figcaption{ padding:8px 6px 4px; }

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
  font-weight:700; font-size:.85rem; color:#fff;
  background:linear-gradient(135deg,var(--aup-accent),var(--aup-accent2)); }
.aup-avatar img{ width:100%; height:100%; object-fit:cover; }

/* ---- contact ---- */
.aup-contact{ display:grid; grid-template-columns:.9fr 1.1fr; gap:clamp(24px,4vw,48px); align-items:start; }
.aup-contact-rows{ display:flex; flex-direction:column; gap:10px; margin-top:22px; }
.aup-contact-row{ display:flex; align-items:center; gap:12px; text-decoration:none; color:inherit;
  font-weight:500; word-break:break-word; }
.aup-contact-row:hover .aup-icon-sm{ transform:translateY(-2px); }
.aup-formcard{ position:relative; padding:clamp(22px,3vw,34px); border-radius:var(--aup-r-lg); overflow:hidden; }
.aup-orb-contact{ position:absolute; right:-30px; bottom:-30px; width:120px; height:120px; opacity:.8; }

/* ---- footer ---- */
.aup-footer{ margin-top:clamp(40px,6vw,72px); border-top:1px solid var(--aup-hair);
  background:color-mix(in srgb, var(--aup-white) 55%, transparent);
  backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px); }
.aup-footer-inner{ display:flex; align-items:center; justify-content:space-between; gap:16px;
  flex-wrap:wrap; padding-block:26px; }
.aup-brand-foot b{ font-weight:700; }
.aup-foot-links{ display:flex; flex-wrap:wrap; gap:16px; }
.aup-foot-links a{ text-decoration:none; color:var(--aup-ink2); font-size:.88rem; }
.aup-foot-links a:hover{ color:var(--aup-ink); }
.aup-foot-right{ display:flex; align-items:center; gap:14px; color:var(--aup-ink2); font-size:.85rem; flex-wrap:wrap; }
.aup-madewith{ text-decoration:none; font-weight:600; color:var(--aup-accent); }

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
  .aup-tgrid{ display:flex; overflow-x:auto; gap:16px; scroll-snap-type:x mandatory;
    padding-bottom:8px; margin-inline:calc(-1 * clamp(16px,4vw,40px)); padding-inline:clamp(16px,4vw,40px); }
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
}
@media (max-width:560px){
  .aup-grid-4{ grid-template-columns:1fr; }
  .aup-grid-3{ grid-template-columns:1fr; }
  .aup-grid-5{ grid-template-columns:1fr; }
  .aup-nav-cta{ display:none; }
  .aup-brand-txt em{ display:none; }
  .aup-float-a{ right:6px; }
  .aup-float-b{ left:6px; }
}
@media (max-width:420px){
  .aup-gallery{ columns:1; }
}

@media (prefers-reduced-motion: reduce){
  .aup-root{ scroll-behavior:auto; }
  .aup-root *{ transition:none !important; }
}
`;
