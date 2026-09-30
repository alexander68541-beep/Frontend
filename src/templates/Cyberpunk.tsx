"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import type { PublicPortfolio } from "@/lib/publicTypes";
import { dateRange, videoEmbed, ext } from "@/lib/publicTypes";
import { ContactForm } from "@/components/ContactForm";

/* =====================================================================
   CyberpunkTemplate — Futuristic Dark Dashboard UI.
   Features: Scroll-jacking, Typing Effect, Lightbox Zoom, Neon Glows.
   Prefixed exclusively with `.cyb-` to prevent any CSS clashes.
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
  return null;
}

const CYB_COLORS = ["#00f3ff", "#ff007c", "#39ff14", "#b026ff", "#fde047"];
const cybColor = (i: number) => CYB_COLORS[((i % CYB_COLORS.length) + CYB_COLORS.length) % CYB_COLORS.length];

const SOCIAL_ICONS: Record<string, string> = {
  github: "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12",
  linkedin: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z",
  twitter: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  instagram: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.332.014 7.052.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z",
  globe: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z",
};

function detectSocial(platform: string | null, url: string | null, label: string | null): string {
  let host = "";
  try { host = new URL(ext(url || "")).hostname.replace(/^www\./, "").toLowerCase(); } catch { host = ""; }
  const H = `${platform || ""} ${label || ""} ${url || ""} ${host}`.toLowerCase();
  if (/github/.test(H)) return "github";
  if (/linkedin/.test(H)) return "linkedin";
  if (/twitter|x\.com/.test(H)) return "twitter";
  if (/instagram/.test(H)) return "instagram";
  return "globe";
}

function SocialIcon({ name }: { name: string }) {
  return (<svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor"><path d={SOCIAL_ICONS[name] || SOCIAL_ICONS.globe} /></svg>);
}

/* ------------------------------ component ------------------------------ */

export function CyberpunkTemplate({ data }: { data: PublicPortfolio }) {
  const p = data.profile;
  const username = data.username;
  const name = p?.display_name || username || "SYSTEM_ADMIN";
  const accent = data.accent || "#00f3ff";
  
  const [activeSlide, setActiveSlide] = useState(0);
  const isScrolling = useRef(false);
  const touchStartY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Typing Effect State
  const [typedText, setTypedText] = useState("");
  const headline = p?.tagline || p?.bio || "INITIALIZING PROTOCOLS... ESTABLISHING CONNECTION...";

  // Lightbox State
  const [lb, setLb] = useState<{ src: string; alt: string; cap?: string } | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);

  const openLb = useCallback((src: string, alt: string, cap?: string) => setLb({ src, alt, cap }), []);

  // Keyboard Accessibility for Lightbox
  useEffect(() => {
    if (!lb) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setLb(null); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [lb]);

  // Wow Vibe Typing Effect
  useEffect(() => {
    let i = 0;
    setTypedText("");
    const typing = setInterval(() => {
      setTypedText(headline.substring(0, i + 1));
      i++;
      if (i >= headline.length) clearInterval(typing);
    }, 45); // Speed of typing
    return () => clearInterval(typing);
  }, [headline]);

  const hidden = new Set(data.settings?.hidden ?? []);
  const sv = (k: string) => !hidden.has(k);

  const photo = p?.avatar_url || data.gallery.find((g) => g.image_url)?.image_url || null;

  // Zoomable Image Trigger
  const ZImg = useCallback(({ src, alt, cap, className }: { src: string; alt: string; cap?: string; className?: string }) => (
    <button type="button" className={`cyb-zoom-btn ${className || ""}`} onClick={() => openLb(src, alt, cap)} aria-label="Zoom image">
      <img src={src} alt={alt} loading="lazy" />
    </button>
  ), [openLb]);

  // Compile Dynamic Slides
  const slides: ReactNode[] = [];

  // SLIDE 0: Hero 
  slides.push(
    <div key="hero" className="cyb-slide-inner cyb-hero-slide">
       <div className="cyb-top-bar">
          <div className="cyb-nav-dots">
             <span className="cyb-dot-red"></span>
             <span className="cyb-dot-yellow"></span>
             <span className="cyb-dot-green"></span>
             <span className="cyb-system-text">SYS.VER_1.0.4</span>
          </div>
          {p?.email && <a href={`mailto:${p.email}`} className="cyb-glow-btn">INITIATE_CONTACT</a>}
       </div>

       <div className="cyb-hero-center">
          <p className="cyb-mono-sub">>> AUTHENTICATED_USER:</p>
          <h1 className="cyb-glitch-title" data-text={name}>{name}</h1>
          {p?.title && <h2 className="cyb-hero-role">{p.title}</h2>}
          
          <div className="cyb-typing-container">
             <span className="cyb-typing-text">{typedText}</span><span className="cyb-cursor">█</span>
          </div>
          
          <div className="cyb-hero-socials">
             {data.links.map((l, i) => (
                <a key={l.id} href={ext(l.url)} target="_blank" rel="noopener noreferrer" className="cyb-soc-icon" style={{ borderColor: cybColor(i), color: cybColor(i) }}>
                   <SocialIcon name={detectSocial(l.platform, l.url, l.label)} />
                </a>
             ))}
          </div>
          
          <div className="cyb-scroll-down">SCROLL_DOWN ↓</div>
       </div>
    </div>
  );

  // SLIDE 1: About & Skills
  if ((sv("about") && (p?.about || p?.bio)) || (sv("skills") && data.skills.length > 0)) {
    slides.push(
      <div key="about" className="cyb-slide-inner">
         <h2 className="cyb-section-title">> TARGET_PROFILE</h2>
         <div className="cyb-grid-2 cyb-full-height cyb-scrollable">
            <div className="cyb-col">
               <div className="cyb-cyber-box">
                  <div className="cyb-box-header">SYS.ABOUT</div>
                  <p className="cyb-body-text">{p?.about || p?.bio || "Data stream corrupted. Re-establishing link... Profile loaded successfully. Passionate tech operative ready for deployment."}</p>
                  {p?.resume_url && (
                    <a className="cyb-glow-btn cyb-mt-10" href={ext(p.resume_url)} target="_blank" rel="noopener noreferrer">DOWNLOAD_DATA_PACK ↗</a>
                  )}
               </div>

               {sv("skills") && data.skills.length > 0 && (
                 <div className="cyb-cyber-box cyb-mt-20">
                    <div className="cyb-box-header">SYS.SKILLS</div>
                    <div className="cyb-skills-wrapper">
                       {data.skills.map((s, i) => (
                         <span key={s.id} className="cyb-skill-pill" style={{ color: cybColor(i), borderColor: cybColor(i) }}>
                           {s.name} {s.level && <span className="cyb-skill-lvl">[{s.level}]</span>}
                         </span>
                       ))}
                    </div>
                 </div>
               )}
            </div>

            <div className="cyb-col cyb-center-all">
               {photo && (
                 <div className="cyb-hologram-frame">
                    <div className="cyb-scanline"></div>
                    <ZImg src={photo} alt={name} />
                 </div>
               )}
            </div>
         </div>
      </div>
    );
  }

  // SLIDE 2: Experience & Education
  if ((sv("experience") && data.experience.length > 0) || (sv("education") && data.education.length > 0)) {
    slides.push(
      <div key="journey" className="cyb-slide-inner">
         <h2 className="cyb-section-title">> SYSTEM_LOGS</h2>
         <div className="cyb-grid-2 cyb-full-height cyb-scrollable">
            {sv("experience") && data.experience.length > 0 && (
              <div className="cyb-col">
                 <div className="cyb-cyber-box">
                    <div className="cyb-box-header">EXPERIENCE_HISTORY</div>
                    <div className="cyb-timeline">
                       {data.experience.map((ex, i) => (
                         <div key={ex.id} className="cyb-tl-item" style={{ '--node-color': cybColor(i) } as CSSProperties}>
                            <strong className="cyb-tl-title">{ex.title}</strong>
                            <span className="cyb-tl-meta">{ex.company} // {dateRange(ex.start_date, ex.end_date, ex.is_current)}</span>
                            {ex.description && <p className="cyb-body-text cyb-tl-desc">{ex.description}</p>}
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
            )}
            {sv("education") && data.education.length > 0 && (
              <div className="cyb-col">
                 <div className="cyb-cyber-box">
                    <div className="cyb-box-header">EDUCATION_ARCHIVE</div>
                    <div className="cyb-timeline">
                       {data.education.map((ed, i) => (
                         <div key={ed.id} className="cyb-tl-item" style={{ '--node-color': cybColor(i+2) } as CSSProperties}>
                            <strong className="cyb-tl-title">{ed.school}</strong>
                            <span className="cyb-tl-meta">{[ed.degree, ed.field].filter(Boolean).join(" - ")} // {dateRange(ed.start_date, ed.end_date)}</span>
                            {ed.description && <p className="cyb-body-text cyb-tl-desc">{ed.description}</p>}
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
            )}
         </div>
      </div>
    );
  }

  // SLIDE 3: Projects
  if (sv("projects") && data.projects.length > 0) {
    slides.push(
      <div key="projects" className="cyb-slide-inner">
         <h2 className="cyb-section-title">> EXECUTABLE_FILES</h2>
         <div className="cyb-full-height cyb-scrollable">
            <div className="cyb-projects-grid">
               {data.projects.map((pr, i) => (
                 <div key={pr.id} className="cyb-project-card">
                    <div className="cyb-project-img">
                       {pr.image_url ? <ZImg src={pr.image_url} alt={pr.title || "Project"} /> : <div className="cyb-ph">NO_IMAGE</div>}
                       <div className="cyb-project-overlay"></div>
                    </div>
                    <div className="cyb-project-content" style={{ borderTopColor: cybColor(i) }}>
                       <span className="cyb-project-tags">{(pr.tags && pr.tags.length > 0) ? pr.tags[0].toUpperCase() : "MODULE"}</span>
                       <h3 className="cyb-project-title">{pr.title || "UNTITLED_FILE"}</h3>
                       <p className="cyb-body-text">{pr.role || pr.description}</p>
                       {pr.url && <a href={ext(pr.url)} target="_blank" rel="noopener noreferrer" className="cyb-link-btn">EXECUTE ↗</a>}
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </div>
    );
  }

  // SLIDE 4: Services & Testimonials
  if ((sv("services") && data.services.length > 0) || (sv("testimonials") && data.testimonials.length > 0)) {
    slides.push(
      <div key="services" className="cyb-slide-inner">
         <h2 className="cyb-section-title">> SUB_ROUTINES & COMM_LOGS</h2>
         <div className="cyb-grid-2 cyb-full-height cyb-scrollable">
            {sv("services") && data.services.length > 0 && (
              <div className="cyb-col">
                 <div className="cyb-cyber-box">
                    <div className="cyb-box-header">AVAILABLE_SERVICES</div>
                    <div className="cyb-services-list">
                       {data.services.map((svItem, i) => (
                         <div key={svItem.id} className="cyb-service-item" style={{ borderLeftColor: cybColor(i) }}>
                            <strong>{svItem.title}</strong>
                            {svItem.description && <p className="cyb-body-text">{svItem.description}</p>}
                            {svItem.price && <span className="cyb-price-badge">{svItem.price}</span>}
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
            )}
            {sv("testimonials") && data.testimonials.length > 0 && (
              <div className="cyb-col">
                 <div className="cyb-cyber-box">
                    <div className="cyb-box-header">CLIENT_FEEDBACK</div>
                    <div className="cyb-testi-list">
                       {data.testimonials.map((t, i) => (
                         <div key={t.id} className="cyb-testi-card">
                            <p className="cyb-quote-text">"{t.quote}"</p>
                            <div className="cyb-quote-author">
                               {t.avatar_url && <img src={t.avatar_url} alt={t.author || "User"} />}
                               <div>
                                  <strong style={{color: cybColor(i)}}>{t.author}</strong>
                                  <span>{t.role}</span>
                               </div>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
            )}
         </div>
      </div>
    );
  }

  // SLIDE 5: Certs, Achieves, Media
  const hasCerts = sv("certifications") && data.certifications.length > 0;
  const hasAchieves = sv("achievements") && data.achievements.length > 0;
  const hasMedia = (sv("gallery") && data.gallery.length > 0) || (sv("videos") && data.videos.length > 0) || (sv("publications") && data.publications.length > 0);

  if (hasCerts || hasAchieves || hasMedia) {
    slides.push(
      <div key="media" className="cyb-slide-inner">
         <h2 className="cyb-section-title">> ATTACHMENTS & DIRECTORIES</h2>
         <div className="cyb-grid-2 cyb-full-height cyb-scrollable">
            <div className="cyb-col">
               {hasCerts && (
                 <div className="cyb-cyber-box">
                    <div className="cyb-box-header">CERTIFICATIONS</div>
                    <ul className="cyb-tech-list">
                       {data.certifications.map(c => (
                         <li key={c.id}>
                           {c.url ? <a href={ext(c.url)} target="_blank" rel="noopener noreferrer" className="cyb-link-text">{c.name} ↗</a> : <strong>{c.name}</strong>}
                           <br/><span className="cyb-body-text">{c.issuer} // {oneDate(c.issue_date)}</span>
                         </li>
                       ))}
                    </ul>
                 </div>
               )}
               {hasAchieves && (
                 <div className="cyb-cyber-box cyb-mt-20">
                    <div className="cyb-box-header">ACHIEVEMENTS</div>
                    <ul className="cyb-tech-list">
                       {data.achievements.map(a => (
                         <li key={a.id}>
                            <strong>{a.title}</strong> - <span className="cyb-body-text">{oneDate(a.date)}</span>
                            <br/><span className="cyb-body-text">{a.description}</span>
                         </li>
                       ))}
                    </ul>
                 </div>
               )}
               {sv("publications") && data.publications.length > 0 && (
                 <div className="cyb-cyber-box cyb-mt-20">
                    <div className="cyb-box-header">PUBLICATIONS</div>
                    <ul className="cyb-tech-list">
                       {data.publications.map(p => (
                         <li key={p.id}>
                           {p.url ? <a href={ext(p.url)} target="_blank" rel="noopener noreferrer" className="cyb-link-text">{p.title} ↗</a> : <strong>{p.title}</strong>}
                           <br/><span className="cyb-body-text">{p.publisher} // {oneDate(p.date)}</span>
                         </li>
                       ))}
                    </ul>
                 </div>
               )}
            </div>

            <div className="cyb-col">
               {sv("gallery") && data.gallery.length > 0 && (
                 <div className="cyb-cyber-box">
                    <div className="cyb-box-header">IMAGE_CACHE</div>
                    <div className="cyb-mini-gallery">
                       {data.gallery.map((g, i) => g.image_url && (
                         <div key={g.id} style={{ borderColor: cybColor(i) }} className="cyb-gal-item">
                            <ZImg src={g.image_url} alt={g.caption || "Image"} cap={g.caption || undefined} />
                         </div>
                       ))}
                    </div>
                 </div>
               )}
               {sv("videos") && data.videos.length > 0 && (
                 <div className="cyb-cyber-box cyb-mt-20">
                    <div className="cyb-box-header">VIDEO_STREAM</div>
                    <div className="cyb-video-list">
                       {data.videos.map(v => {
                          const src = v.url ? videoEmbed(v.url) : null;
                          if (!src) return null;
                          return (
                            <div key={v.id} className="cyb-video-frame">
                               <iframe src={src} title={v.title || "Video"} loading="lazy" allowFullScreen />
                            </div>
                          )
                       })}
                    </div>
                 </div>
               )}
            </div>
         </div>
      </div>
    );
  }

  // SLIDE 6: Contact
  if (username) {
    slides.push(
      <div key="contact" className="cyb-slide-inner">
         <h2 className="cyb-section-title">> TERMINAL_ACCESS</h2>
         <div className="cyb-grid-2 cyb-full-height cyb-scrollable">
            <div className="cyb-col cyb-center-all">
               <h1 className="cyb-glitch-title" data-text="TRANSMIT">TRANSMIT</h1>
               <p className="cyb-body-text" style={{ textAlign: "center", maxWidth: "400px", marginTop: "20px" }}>
                 Open a secure channel. Transmit your inquiries or collaboration proposals directly to the server.
               </p>
               <div className="cyb-hero-socials" style={{ marginTop: "30px" }}>
                   {data.links.map((l, i) => (
                      <a key={l.id} href={ext(l.url)} target="_blank" rel="noopener noreferrer" className="cyb-soc-icon" style={{ borderColor: cybColor(i), color: cybColor(i) }}>
                         <SocialIcon name={detectSocial(l.platform, l.url, l.label)} />
                      </a>
                   ))}
               </div>
            </div>
            <div className="cyb-col">
               <div className="cyb-cyber-box cyb-contact-wrapper">
                  <div className="cyb-box-header">SECURE_FORM</div>
                  <ContactForm username={username} />
               </div>
            </div>
         </div>
         {!data.hide_branding && (
            <footer className="cyb-footer">SYSTEM_POWERED_BY_FOLIO_v1.0</footer>
         )}
      </div>
    );
  }

  const numSlides = slides.length;

  // Scroll Hijacking Logic
  const handleWheel = useCallback((e: WheelEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('.cyb-scrollable')) {
      const scrollable = target.closest('.cyb-scrollable') as HTMLElement;
      const isAtTop = scrollable.scrollTop === 0;
      const isAtBottom = Math.abs(scrollable.scrollHeight - scrollable.scrollTop - scrollable.clientHeight) <= 2;
      
      if (!((isAtTop && e.deltaY < 0) || (isAtBottom && e.deltaY > 0))) {
        return; 
      }
    }
    e.preventDefault();
    if (isScrolling.current) return;
    
    if (e.deltaY > 40) {
      setActiveSlide((prev) => Math.min(prev + 1, numSlides - 1));
      lockScroll();
    } else if (e.deltaY < -40) {
      setActiveSlide((prev) => Math.max(prev - 1, 0));
      lockScroll();
    }
  }, [numSlides]);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('.cyb-scrollable')) return;
    e.preventDefault(); 
  }, []);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    const touchEndY = e.changedTouches[0].clientY;
    const deltaY = touchStartY.current - touchEndY;
    
    const target = e.target as HTMLElement;
    if (target.closest('.cyb-scrollable')) {
      const scrollable = target.closest('.cyb-scrollable') as HTMLElement;
      const isAtTop = scrollable.scrollTop === 0;
      const isAtBottom = Math.abs(scrollable.scrollHeight - scrollable.scrollTop - scrollable.clientHeight) <= 2;
      
      if (!((isAtTop && deltaY < 0) || (isAtBottom && deltaY > 0))) {
        return; 
      }
    }
    if (isScrolling.current) return;

    if (deltaY > 50) {
      setActiveSlide((prev) => Math.min(prev + 1, numSlides - 1));
      lockScroll();
    } else if (deltaY < -50) {
      setActiveSlide((prev) => Math.max(prev - 1, 0));
      lockScroll();
    }
  }, [numSlides]);

  const lockScroll = () => {
    isScrolling.current = true;
    setTimeout(() => { isScrolling.current = false; }, 800);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleWheel, handleTouchStart, handleTouchMove, handleTouchEnd]);

  return (
    <div className="cyb-root" style={{ ["--cyb-accent" as string]: accent } as CSSProperties}>
      <style dangerouslySetInnerHTML={{ __html: CYB_CSS }} />

      {/* Cyberpunk Background Grid & Orbs */}
      <div className="cyb-bg-grid"></div>
      <div className="cyb-orb cyb-orb-1"></div>
      <div className="cyb-orb cyb-orb-2"></div>

      {/* Slide Navigation Dots */}
      <div className="cyb-dots">
        {slides.map((_, idx) => (
          <button 
            key={idx} 
            className={`cyb-dot ${activeSlide === idx ? 'cyb-dot-active' : ''}`} 
            onClick={() => { setActiveSlide(idx); lockScroll(); }}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>

      {/* Track Container */}
      <div 
        ref={containerRef} 
        className="cyb-track" 
        style={{ transform: `translateY(-${activeSlide * 100}vh)` }}
      >
        {slides.map((slide, idx) => (
          <div key={idx} className={`cyb-slide ${activeSlide === idx ? 'cyb-slide-active' : ''}`}>
             <div className="cyb-container">
               {slide}
             </div>
          </div>
        ))}
      </div>

      {/* LIGHTBOX (Zoom Overlay) */}
      {lb && (
        <div className="cyb-lb" role="dialog" aria-modal="true" aria-label="Image viewer" onClick={() => setLb(null)}>
          <div className="cyb-lb-card" onClick={(e) => e.stopPropagation()}>
            <button ref={closeRef} type="button" className="cyb-lb-close" onClick={() => setLb(null)} aria-label="Close">✕</button>
            <figure className="cyb-lb-fig">
               <img src={lb.src} alt={lb.alt} />
               {lb.cap && <figcaption className="cyb-lb-cap">{lb.cap}</figcaption>}
            </figure>
          </div>
        </div>
      )}
    </div>
  );
}

export default CyberpunkTemplate;

/* =====================================================================
   STYLES — Cyberpunk Dark Dashboard + Lightbox + Scroll Hijacking
   ===================================================================== */

const CYB_CSS = `
body, html {
  margin: 0; padding: 0;
  height: 100%;
  overflow: hidden;
  background-color: #050505;
}

.cyb-root {
  width: 100vw;
  height: 100vh;
  background-color: #050505;
  color: #fff;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  position: relative;
  overflow: hidden;
  --cyb-neon-cyan: #00f3ff;
  --cyb-neon-pink: #ff007c;
  --cyb-border: rgba(0, 243, 255, 0.3);
  --cyb-bg-card: rgba(10, 15, 20, 0.75);
}
.cyb-root * { box-sizing: border-box; }

/* Grid Background & Glowing Orbs */
.cyb-bg-grid {
  position: absolute; inset: 0; z-index: 0;
  background-image: 
    linear-gradient(rgba(0, 243, 255, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 243, 255, 0.05) 1px, transparent 1px);
  background-size: 40px 40px;
  pointer-events: none;
}
.cyb-orb { position: absolute; border-radius: 50%; filter: blur(120px); z-index: 0; opacity: 0.4; pointer-events: none; }
.cyb-orb-1 { width: 50vw; height: 50vw; top: -10%; left: -10%; background: var(--cyb-neon-pink); }
.cyb-orb-2 { width: 40vw; height: 40vw; bottom: -10%; right: -10%; background: var(--cyb-neon-cyan); }

/* Track & Slides */
.cyb-track {
  position: absolute; top: 0; left: 0; width: 100%; height: 100vh;
  transition: transform 0.8s cubic-bezier(0.8, 0, 0.2, 1);
  will-change: transform; z-index: 2;
}
.cyb-slide {
  width: 100vw; height: 100vh;
  display: flex; align-items: center; justify-content: center;
  padding: 40px clamp(20px, 5vw, 60px);
  opacity: 0.1; transform: scale(0.95);
  transition: opacity 0.8s ease, transform 0.8s ease;
}
.cyb-slide-active { opacity: 1; transform: scale(1); }

.cyb-container {
  width: 100%; max-width: 1100px; height: 100%; max-height: 85vh;
  position: relative;
}
.cyb-slide-inner { display: flex; flex-direction: column; height: 100%; position: relative; }
.cyb-full-height { flex: 1; min-height: 0; }
.cyb-scrollable { overflow-y: auto; scrollbar-width: none; padding-right: 10px; }
.cyb-scrollable::-webkit-scrollbar { display: none; }
.cyb-mt-10 { margin-top: 10px; }
.cyb-mt-20 { margin-top: 20px; }

/* Typography */
.cyb-section-title { font-size: clamp(1.5rem, 3vw, 2.5rem); margin: 0 0 20px 0; color: var(--cyb-neon-cyan); letter-spacing: 2px; text-shadow: 0 0 10px rgba(0,243,255,0.5); border-bottom: 1px dashed var(--cyb-border); padding-bottom: 10px; }
.cyb-body-text { font-size: 0.95rem; line-height: 1.6; color: #a0aec0; font-family: system-ui, -apple-system, sans-serif; margin: 0; }
.cyb-mono-sub { font-size: 0.9rem; color: var(--cyb-neon-pink); letter-spacing: 1px; }

/* Hero Specific */
.cyb-hero-slide { justify-content: space-between; }
.cyb-top-bar { display: flex; justify-content: space-between; align-items: center; background: var(--cyb-bg-card); border: 1px solid var(--cyb-border); padding: 10px 20px; box-shadow: 0 0 20px rgba(0,0,0,0.5); backdrop-filter: blur(10px); margin-bottom: 20px; }
.cyb-nav-dots { display: flex; gap: 8px; align-items: center; }
.cyb-nav-dots span[class^="cyb-dot-"] { width: 12px; height: 12px; border-radius: 50%; box-shadow: inset 0 0 5px rgba(0,0,0,0.5); }
.cyb-dot-red { background: #ff3b30; } .cyb-dot-yellow { background: #ffcc00; } .cyb-dot-green { background: #34c759; }
.cyb-system-text { font-size: 0.8rem; color: #666; margin-left: 10px; letter-spacing: 1px; }

.cyb-hero-center { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
.cyb-glitch-title { font-size: clamp(3rem, 8vw, 6rem); margin: 10px 0; color: #fff; letter-spacing: 4px; text-transform: uppercase; position: relative; }
.cyb-hero-role { font-size: clamp(1rem, 2vw, 1.5rem); font-weight: normal; color: var(--cyb-neon-cyan); letter-spacing: 5px; text-transform: uppercase; margin-bottom: 30px; }

/* Typing Effect */
.cyb-typing-container { font-size: clamp(1rem, 3vw, 1.8rem); color: #fff; background: rgba(0,0,0,0.6); padding: 10px 20px; border-left: 3px solid var(--cyb-neon-pink); max-width: 800px; display: inline-block; }
.cyb-cursor { display: inline-block; width: 10px; background-color: var(--cyb-neon-cyan); margin-left: 5px; animation: cyb-blink 1s step-end infinite; }
@keyframes cyb-blink { 50% { opacity: 0; } }

/* Buttons & Socials */
.cyb-glow-btn { display: inline-block; background: transparent; color: var(--cyb-neon-cyan); border: 1px solid var(--cyb-neon-cyan); padding: 8px 16px; font-size: 0.85rem; text-decoration: none; text-transform: uppercase; letter-spacing: 1px; transition: 0.3s; box-shadow: 0 0 10px rgba(0,243,255,0.2); cursor: pointer; }
.cyb-glow-btn:hover { background: var(--cyb-neon-cyan); color: #000; box-shadow: 0 0 20px rgba(0,243,255,0.6); }

.cyb-hero-socials { display: flex; gap: 15px; margin-top: 40px; }
.cyb-soc-icon { width: 45px; height: 45px; border: 1px solid; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; transition: 0.3s; background: rgba(0,0,0,0.5); }
.cyb-soc-icon:hover { transform: translateY(-3px); box-shadow: 0 0 15px currentColor; background: currentColor; }
.cyb-soc-icon:hover svg { fill: #000; }

.cyb-scroll-down { margin-top: auto; font-size: 0.85rem; color: #555; letter-spacing: 3px; animation: cyb-bounce 2s infinite; }
@keyframes cyb-bounce { 0%,20%,50%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-10px)} 60%{transform:translateY(-5px)} }

/* Grids & Layouts */
.cyb-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
.cyb-col { display: flex; flex-direction: column; }
.cyb-center-all { align-items: center; justify-content: center; }

/* Cyber Boxes */
.cyb-cyber-box { background: var(--cyb-bg-card); border: 1px solid var(--cyb-border); padding: 20px; backdrop-filter: blur(10px); position: relative; }
.cyb-cyber-box::before { content: ""; position: absolute; top: 0; left: 0; width: 20px; height: 2px; background: var(--cyb-neon-pink); }
.cyb-box-header { font-size: 0.85rem; color: var(--cyb-neon-pink); margin-bottom: 15px; letter-spacing: 2px; text-transform: uppercase; border-bottom: 1px solid rgba(255,0,124,0.3); padding-bottom: 5px; display: inline-block; }

/* Skills */
.cyb-skills-wrapper { display: flex; flex-wrap: wrap; gap: 10px; }
.cyb-skill-pill { border: 1px solid; padding: 6px 12px; font-size: 0.85rem; text-transform: uppercase; background: rgba(0,0,0,0.4); }
.cyb-skill-lvl { opacity: 0.7; font-size: 0.75rem; margin-left: 5px; }

/* Hologram Image (About) */
.cyb-hologram-frame { position: relative; width: 100%; max-width: 320px; aspect-ratio: 3/4; border: 1px solid var(--cyb-neon-cyan); padding: 10px; background: rgba(0,243,255,0.05); box-shadow: 0 0 20px rgba(0,243,255,0.2); }
.cyb-hologram-frame .cyb-zoom-btn { width: 100%; height: 100%; border: none; background: transparent; padding: 0; cursor: zoom-in; }
.cyb-hologram-frame img { width: 100%; height: 100%; object-fit: cover; filter: contrast(1.2) grayscale(0.2) drop-shadow(0 0 10px rgba(0,243,255,0.5)); transition: 0.3s; }
.cyb-scanline { position: absolute; top: 0; left: 0; width: 100%; height: 5px; background: rgba(0,243,255,0.5); box-shadow: 0 0 10px #00f3ff; opacity: 0.6; animation: scan 3s linear infinite; z-index: 2; pointer-events: none; }
@keyframes scan { 0% { top: 0; } 100% { top: 100%; } }

/* Timeline (Exp & Edu) */
.cyb-timeline { display: flex; flex-direction: column; gap: 20px; border-left: 1px dashed var(--cyb-border); padding-left: 20px; margin-left: 10px; }
.cyb-tl-item { position: relative; }
.cyb-tl-item::before { content: ""; position: absolute; left: -25px; top: 5px; width: 9px; height: 9px; background: var(--node-color); box-shadow: 0 0 10px var(--node-color); }
.cyb-tl-title { display: block; font-size: 1.1rem; color: #fff; text-transform: uppercase; }
.cyb-tl-meta { display: block; font-size: 0.8rem; color: var(--node-color); margin: 4px 0 8px 0; }
.cyb-tl-desc { color: #a0aec0; }

/* Projects Grid */
.cyb-projects-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px; }
.cyb-project-card { background: var(--cyb-bg-card); border: 1px solid var(--cyb-border); display: flex; flex-direction: column; transition: 0.3s; }
.cyb-project-card:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.8), 0 0 15px rgba(0,243,255,0.2); }
.cyb-project-img { height: 160px; position: relative; background: #000; overflow: hidden; }
.cyb-project-img .cyb-zoom-btn { display: block; width: 100%; height: 100%; padding: 0; border: none; background: transparent; cursor: zoom-in; }
.cyb-project-img img { width: 100%; height: 100%; object-fit: cover; opacity: 0.6; transition: 0.3s; filter: grayscale(50%); }
.cyb-project-card:hover .cyb-project-img img { opacity: 1; filter: grayscale(0%); transform: scale(1.05); }
.cyb-ph { display: flex; align-items: center; justify-content: center; height: 100%; font-size: 1.2rem; color: #444; }
.cyb-project-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.9), transparent); pointer-events: none; }
.cyb-project-content { padding: 20px; border-top: 2px solid; flex: 1; display: flex; flex-direction: column; }
.cyb-project-tags { font-size: 0.75rem; color: var(--cyb-neon-pink); letter-spacing: 1px; margin-bottom: 8px; }
.cyb-project-title { font-size: 1.2rem; margin: 0 0 10px 0; text-transform: uppercase; }
.cyb-link-btn { margin-top: auto; align-self: flex-start; display: inline-block; color: var(--cyb-neon-cyan); text-decoration: none; font-size: 0.85rem; border-bottom: 1px solid transparent; padding-top: 15px; transition: 0.3s; }
.cyb-link-btn:hover { border-bottom-color: var(--cyb-neon-cyan); text-shadow: 0 0 8px var(--cyb-neon-cyan); }

/* Services & Testimonials */
.cyb-services-list { display: flex; flex-direction: column; gap: 15px; }
.cyb-service-item { padding: 15px; border-left: 3px solid; background: rgba(0,0,0,0.4); }
.cyb-service-item strong { display: block; font-size: 1.1rem; color: #fff; margin-bottom: 5px; text-transform: uppercase; }
.cyb-price-badge { display: inline-block; margin-top: 10px; background: rgba(255,0,124,0.1); color: var(--cyb-neon-pink); padding: 4px 8px; font-size: 0.8rem; border: 1px solid var(--cyb-neon-pink); }
.cyb-testi-list { display: flex; flex-direction: column; gap: 15px; }
.cyb-testi-card { padding: 15px; background: rgba(0,0,0,0.4); border: 1px dashed rgba(255,255,255,0.1); }
.cyb-quote-text { font-style: italic; color: #d1d5db; font-family: system-ui, sans-serif; margin: 0 0 15px 0; font-size: 0.95rem; }
.cyb-quote-author { display: flex; align-items: center; gap: 15px; }
.cyb-quote-author img { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 1px solid #fff; }
.cyb-quote-author strong { display: block; font-size: 0.9rem; text-transform: uppercase; }
.cyb-quote-author span { font-size: 0.8rem; color: #666; font-family: system-ui, sans-serif; }

/* Lists (Certs, Achieves, Pubs) */
.cyb-tech-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px; }
.cyb-tech-list li { padding-left: 15px; border-left: 1px solid var(--cyb-border); }
.cyb-tech-list strong { color: #fff; font-size: 0.95rem; text-transform: uppercase; }
.cyb-link-text { color: var(--cyb-neon-cyan); text-decoration: none; font-weight: bold; transition: 0.3s; }
.cyb-link-text:hover { text-shadow: 0 0 8px var(--cyb-neon-cyan); }

/* Media (Gallery, Videos) */
.cyb-mini-gallery { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.cyb-gal-item { border: 1px solid; padding: 4px; background: #000; }
.cyb-gal-item .cyb-zoom-btn { width: 100%; height: 100%; display: block; border: none; background: transparent; padding: 0; cursor: zoom-in; }
.cyb-gal-item img { width: 100%; aspect-ratio: 1; object-fit: cover; opacity: 0.7; transition: 0.3s; display: block; }
.cyb-gal-item:hover img { opacity: 1; }
.cyb-video-list { display: flex; flex-direction: column; gap: 15px; }
.cyb-video-frame { position: relative; padding-bottom: 56.25%; border: 1px solid var(--cyb-border); background: #000; }
.cyb-video-frame iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: none; }

/* Contact Form */
.cyb-contact-wrapper :where(input, textarea) {
  width: 100%; background: rgba(0,0,0,0.6); border: 1px solid var(--cyb-border); color: #fff;
  padding: 12px; border-radius: 4px; margin-bottom: 15px; font-family: inherit; font-size: 0.9rem;
}
.cyb-contact-wrapper :where(input, textarea):focus { outline: none; border-color: var(--cyb-neon-cyan); box-shadow: 0 0 10px rgba(0,243,255,0.2); }
.cyb-contact-wrapper textarea { min-height: 120px; resize: vertical; }
.cyb-contact-wrapper button {
  width: 100%; background: transparent; color: var(--cyb-neon-cyan); border: 1px solid var(--cyb-neon-cyan);
  padding: 14px; font-family: inherit; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; cursor: pointer; transition: 0.3s;
}
.cyb-contact-wrapper button:hover { background: var(--cyb-neon-cyan); color: #000; box-shadow: 0 0 15px rgba(0,243,255,0.5); }
.cyb-footer { position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); font-size: 0.7rem; color: #444; letter-spacing: 2px; }

/* Slide Navigation Dots */
.cyb-dots { position: fixed; right: 20px; top: 50%; transform: translateY(-50%); display: flex; flex-direction: column; gap: 15px; z-index: 10; }
.cyb-dot { width: 8px; height: 8px; background: transparent; border: 1px solid #555; border-radius: 0; cursor: pointer; transition: 0.3s; padding: 0; }
.cyb-dot:hover { border-color: var(--cyb-neon-cyan); }
.cyb-dot-active { background: var(--cyb-neon-cyan); border-color: var(--cyb-neon-cyan); box-shadow: 0 0 10px var(--cyb-neon-cyan); transform: scale(1.5) rotate(45deg); }

/* LIGHTBOX (Zoom Overlay) */
.cyb-lb { position: fixed; inset: 0; z-index: 9999; display: grid; place-items: center; padding: 20px; background: rgba(0,0,0,0.9); backdrop-filter: blur(10px); animation: cyb-fade 0.2s ease both; }
.cyb-lb-card { position: relative; background: #050505; padding: 10px; border: 1px solid var(--cyb-neon-cyan); max-width: 95vw; max-height: 95vh; box-shadow: 0 0 30px rgba(0,243,255,0.2); animation: cyb-pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) both; }
.cyb-lb-fig { margin: 0; display: flex; flex-direction: column; gap: 10px; align-items: center; }
.cyb-lb-fig img { max-width: 90vw; max-height: 85vh; width: auto; height: auto; object-fit: contain; }
.cyb-lb-cap { font-family: system-ui, sans-serif; font-size: 0.9rem; color: var(--cyb-neon-cyan); text-transform: uppercase; letter-spacing: 1px; }
.cyb-lb-close { position: absolute; top: -15px; right: -15px; width: 40px; height: 40px; border-radius: 0; cursor: pointer; color: #000; background: var(--cyb-neon-cyan); border: none; font-size: 1.2rem; font-weight: bold; display: flex; align-items: center; justify-content: center; transition: 0.2s; clip-path: polygon(20% 0%, 100% 0, 100% 80%, 80% 100%, 0 100%, 0% 20%); }
.cyb-lb-close:hover { background: #fff; }
@keyframes cyb-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes cyb-pop { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: none; } }

/* Mobile */
@media (max-width: 800px) {
  .cyb-grid-2 { grid-template-columns: 1fr; }
  .cyb-slide { padding-right: 40px; padding-left: 20px; }
  .cyb-top-bar { flex-direction: column; gap: 15px; text-align: center; }
  .cyb-dots { right: 10px; }
  .cyb-hologram-frame { max-width: 250px; }
}
`;
