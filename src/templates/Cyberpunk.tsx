"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import type { PublicPortfolio } from "@/lib/publicTypes";
import { dateRange, videoEmbed, ext } from "@/lib/publicTypes";
import { ContactForm } from "@/components/ContactForm";

/* =====================================================================
   CyberScrollTemplate — Dark Cyberpunk Dashboard with Scroll Hijacking.
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

const SOCIAL_ICONS: Record<string, string> = {
  github: "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12",
  linkedin: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z",
  twitter: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  instagram: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.332.014 7.052.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z",
  facebook: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
  youtube: "M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
  globe: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z",
  dribbble: "M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zm9.885 11.441c-2.575-.422-4.943-.445-7.103-.073-.244-.563-.497-1.125-.767-1.68 2.31-1 4.165-2.358 5.548-4.082 1.35 1.594 2.197 3.619 2.322 5.835zm-3.842-7.282c-1.205 1.554-2.868 2.783-4.986 3.68-1.016-1.861-2.178-3.676-3.488-5.438.779-.197 1.591-.314 2.431-.314 2.275 0 4.368.809 6.043 2.072zM7.527 3.166c1.299 1.744 2.45 3.542 3.457 5.39-2.514.75-5.418.983-8.712.733.523-2.708 2.297-4.972 4.671-6.127.194.001.392.002.584.004zM2.096 12.42c3.639.284 6.847.021 9.616-.784.276.523.532 1.056.767 1.6-2.866.867-5.293 2.559-7.24 5.113C3.633 16.62 2.437 14.681 2.096 12.42zm4.674 6.89c1.774-2.33 3.964-3.832 6.564-4.566.828 2.145 1.451 4.421 1.865 6.827-2.86 1.219-6.058.73-8.429-2.261zm10.324.822c-.384-2.219-.959-4.339-1.72-6.352 1.842-.29 3.887-.211 6.135.234-.618 2.586-2.339 4.741-4.415 6.118z",
  behance: "M22 7h-7V5h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-1.729-5.564-5.675 0-3.91 2.325-5.92 5.466-5.92 3.082 0 4.964 1.782 5.375 4.426.078.506.109 1.188.095 2.14H15.97c.13 3.211 3.483 3.312 4.588 2.029h3.168zm-7.686-4h4.965c-.105-1.547-1.136-2.219-2.477-2.219-1.466 0-2.277.768-2.488 2.219zm-9.574 6.988H0V5.021h6.953c5.476.081 5.58 5.444 2.72 6.906 3.461 1.26 3.577 8.061-3.207 8.061zM3 11h3.584c2.508 0 2.906-3-.312-3H3v3zm3.391 3H3v3.016h3.341c3.055 0 2.868-3.016.05-3.016z",
  pinterest: "M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.749-7.252 7.926-7.252 4.163 0 7.398 2.967 7.398 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C24.007 5.367 18.635.001 12.017.001z",
};

function detectSocial(platform: string | null, url: string | null, label: string | null): string {
  let host = "";
  try { host = new URL(ext(url || "")).hostname.replace(/^www\./, "").toLowerCase(); } catch { host = ""; }
  const H = `${platform || ""} ${label || ""} ${url || ""} ${host}`.toLowerCase();
  if (/github/.test(H)) return "github";
  if (/linkedin|lnkd\.in/.test(H)) return "linkedin";
  if (/twitter|x\.com/.test(H)) return "twitter";
  if (/instagram/.test(H)) return "instagram";
  if (/facebook/.test(H)) return "facebook";
  if (/behance/.test(H)) return "behance";
  if (/pinterest/.test(H)) return "pinterest";
  if (/dribbble/.test(H)) return "dribbble";
  if (/youtube/.test(H)) return "youtube";
  return "globe";
}

function SocialIcon({ name }: { name: string }) {
  return (<svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor"><path d={SOCIAL_ICONS[name] || SOCIAL_ICONS.globe} /></svg>);
}

export function Cyberpunk({ data }: { data: PublicPortfolio }) {
  const p = data.profile;
  const username = data.username;
  const name = p?.display_name || username || "Your Name";
  
  const photo = p?.avatar_url || data.gallery.find((g) => g.image_url)?.image_url || null;
  const aboutText = p?.about ?? p?.bio ?? "Welcome to my interactive portfolio. Scroll down to explore my work and skills.";

  // Scroll Hijacking States
  const [activeSlide, setActiveSlide] = useState(0);
  const isScrolling = useRef(false);
  const touchStartY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter hidden sections
  const hidden = new Set(data.settings?.hidden ?? []);
  const sv = (k: string) => !hidden.has(k);

  // Grouping Data into Slides dynamically
  const slides: ReactNode[] = [];

  // SLIDE 1: Hero & About (Matching image layout)
  slides.push(
    <div key="slide-1" className="cyb-slide-content">
      {/* Header Inside Slide */}
      <header className="cyb-header">
        <div className="cyb-header-left">
          <h1 className="cyb-title">{name}</h1>
          {p?.title && <p className="cyb-subtitle">{p.title.toUpperCase()}</p>}
        </div>
        <div className="cyb-header-right">
          {p?.phone && <span>Contact no: {p.phone}</span>}
          {p?.email && <span>Email: {p.email}</span>}
        </div>
      </header>

      <div className="cyb-grid-top">
        <div className="cyb-box-dashed cyb-flex-col cyb-scrollable">
          <div className="cyb-box-solid cyb-mb">
            <span className="cyb-pill cyb-pill-pink">About Me</span>
            <p className="cyb-text">{aboutText}</p>
            {p?.resume_url && <a className="cyb-resume-btn" href={ext(p.resume_url)} target="_blank" rel="noopener noreferrer">Resume</a>}
          </div>

          {data.links.length > 0 && (
            <div className="cyb-box-solid cyb-social-box">
              <span className="cyb-pill cyb-pill-pink">Social Media</span>
              <div className="cyb-social-icons">
                {data.links.map((l) => (
                  <a key={l.id} href={ext(l.url)} target="_blank" rel="noopener noreferrer" className="cyb-soc-link" title={l.label || l.platform}>
                    <SocialIcon name={detectSocial(l.platform, l.url, l.label)} />
                  </a>
                ))}
                <span className="cyb-arrow">➡</span>
                <div className="cyb-qr-code"><div className="cyb-qr-inner">✽</div></div>
              </div>
            </div>
          )}
        </div>

        <div className="cyb-image-wrapper">
           {photo ? <img src={photo} alt={name} className="cyb-profile-img" /> : <div className="cyb-image-placeholder">PHOTO</div>}
        </div>
      </div>
      <div className="cyb-scroll-hint">Scroll down ↓</div>
    </div>
  );

  // SLIDE 2: Education & Skills
  if ((sv("education") && data.education.length > 0) || (sv("skills") && data.skills.length > 0)) {
    slides.push(
      <div key="slide-2" className="cyb-slide-content">
        <h2 className="cyb-bg-title">BACKGROUND</h2>
        <div className="cyb-box-dashed cyb-grid-mid cyb-full-height">
           <div className="cyb-section cyb-scrollable">
              <span className="cyb-pill cyb-pill-purple">Education</span>
              <ul className="cyb-list">
                {data.education.map((ed) => (
                  <li key={ed.id}>
                    <span className="cyb-star">✦</span>
                    <div className="cyb-list-text">
                      <strong>{ed.school}</strong>
                      <span className="cyb-block-sub">{[ed.degree, ed.field].filter(Boolean).join(" - ")}</span>
                      {ed.description && <span className="cyb-desc">{ed.description}</span>}
                    </div>
                  </li>
                ))}
              </ul>
           </div>
           <div className="cyb-section cyb-scrollable">
              <span className="cyb-pill cyb-pill-purple">Skills</span>
              <ul className="cyb-list">
                {data.skills.map((s) => (
                  <li key={s.id}>
                    <span className="cyb-star">✦</span>
                    <span className="cyb-list-text">{s.name} {s.level && <small>({s.level})</small>}</span>
                  </li>
                ))}
              </ul>
           </div>
        </div>
      </div>
    );
  }

  // SLIDE 3: Experience & Services
  if ((sv("experience") && data.experience.length > 0) || (sv("services") && data.services.length > 0)) {
    slides.push(
      <div key="slide-3" className="cyb-slide-content">
        <h2 className="cyb-bg-title">EXPERTISE</h2>
        <div className="cyb-box-dashed cyb-grid-mid cyb-full-height">
           {sv("experience") && data.experience.length > 0 && (
             <div className="cyb-section cyb-scrollable">
                <span className="cyb-pill cyb-pill-pink">Experience</span>
                <ul className="cyb-list">
                  {data.experience.map((ex) => (
                    <li key={ex.id}>
                      <span className="cyb-star">✦</span>
                      <div className="cyb-list-text">
                        <strong>{ex.title}</strong>
                        <span className="cyb-block-sub">{ex.company} ({dateRange(ex.start_date, ex.end_date, ex.is_current)})</span>
                        {ex.description && <span className="cyb-desc">{ex.description}</span>}
                      </div>
                    </li>
                  ))}
                </ul>
             </div>
           )}
           {sv("services") && data.services.length > 0 && (
             <div className="cyb-section cyb-scrollable">
                <span className="cyb-pill cyb-pill-pink">Services</span>
                <ul className="cyb-list">
                  {data.services.map((svItem) => (
                    <li key={svItem.id}>
                      <span className="cyb-star">✦</span>
                      <div className="cyb-list-text">
                        <strong>{svItem.title}</strong>
                        {svItem.description && <span className="cyb-desc">{svItem.description}</span>}
                      </div>
                    </li>
                  ))}
                </ul>
             </div>
           )}
        </div>
      </div>
    );
  }

  // SLIDE 4: Projects (Mapped to visual boxes)
  if (sv("projects") && data.projects.length > 0) {
    slides.push(
      <div key="slide-4" className="cyb-slide-content">
        <h2 className="cyb-bg-title">PORTFOLIO</h2>
        <div className="cyb-box-dashed cyb-full-height cyb-scrollable">
          <span className="cyb-pill cyb-pill-purple">Projects</span>
          <div className="cyb-projects-grid">
            {data.projects.map((pr) => (
              <a key={pr.id} href={pr.url ? ext(pr.url) : "#"} target="_blank" rel="noopener noreferrer" className="cyb-project-card">
                <div className="cyb-project-img">
                  {pr.image_url ? <img src={pr.image_url} alt={pr.title || "Project"} loading="lazy"/> : <div className="cyb-ph">P</div>}
                </div>
                <div className="cyb-project-info">
                  <strong>{pr.title || "Untitled"}</strong>
                  {pr.role && <span>{pr.role}</span>}
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // SLIDE 5: Certifications & Achievements
  if ((sv("certifications") && data.certifications.length > 0) || (sv("achievements") && data.achievements.length > 0)) {
    slides.push(
      <div key="slide-5" className="cyb-slide-content">
        <h2 className="cyb-bg-title">ACHIEVEMENTS</h2>
        <div className="cyb-box-dashed cyb-grid-mid cyb-full-height">
           {sv("certifications") && data.certifications.length > 0 && (
             <div className="cyb-section cyb-scrollable">
                <span className="cyb-pill cyb-pill-pink">Certifications</span>
                <ul className="cyb-list">
                  {data.certifications.map((cert) => (
                    <li key={cert.id}>
                      <span className="cyb-star">✦</span>
                      <div className="cyb-list-text">
                        <strong>{cert.name}</strong>
                        <span className="cyb-block-sub">{cert.issuer} {oneDate(cert.issue_date) && `(${oneDate(cert.issue_date)})`}</span>
                      </div>
                    </li>
                  ))}
                </ul>
             </div>
           )}
           {sv("achievements") && data.achievements.length > 0 && (
             <div className="cyb-section cyb-scrollable">
                <span className="cyb-pill cyb-pill-purple">Achievements</span>
                <ul className="cyb-list">
                  {data.achievements.map((ach) => (
                    <li key={ach.id}>
                      <span className="cyb-star">✦</span>
                      <div className="cyb-list-text">
                        <strong>{ach.title}</strong>
                        {ach.description && <span className="cyb-desc">{ach.description}</span>}
                      </div>
                    </li>
                  ))}
                </ul>
             </div>
           )}
        </div>
      </div>
    );
  }

  // SLIDE 6: Media (Gallery, Videos, Publications)
  const hasGallery = sv("gallery") && data.gallery.length > 0;
  const hasVideos = sv("videos") && data.videos.length > 0;
  const hasPubs = sv("publications") && data.publications.length > 0;

  if (hasGallery || hasVideos || hasPubs) {
    slides.push(
      <div key="slide-6" className="cyb-slide-content">
        <h2 className="cyb-bg-title">MEDIA</h2>
        <div className="cyb-box-dashed cyb-full-height cyb-scrollable">
           {hasGallery && (
             <div className="cyb-media-section">
               <span className="cyb-pill cyb-pill-pink">Gallery</span>
               <div className="cyb-gallery-grid">
                 {data.gallery.map(g => g.image_url && <img key={g.id} src={g.image_url} alt={g.caption || "Gallery"} className="cyb-gal-img"/>)}
               </div>
             </div>
           )}
           {hasVideos && (
             <div className="cyb-media-section">
               <span className="cyb-pill cyb-pill-purple">Videos</span>
               <div className="cyb-gallery-grid">
                 {data.videos.map(v => {
                   const src = v.url ? videoEmbed(v.url) : null;
                   return src ? <iframe key={v.id} src={src} title={v.title || "Video"} className="cyb-vid-iframe" allowFullScreen /> : null;
                 })}
               </div>
             </div>
           )}
           {hasPubs && (
             <div className="cyb-media-section">
               <span className="cyb-pill cyb-pill-pink">Publications</span>
               <ul className="cyb-list">
                 {data.publications.map(p => (
                   <li key={p.id}>
                     <span className="cyb-star">✦</span>
                     <div className="cyb-list-text">
                        {p.url ? <a href={ext(p.url)} target="_blank" rel="noopener noreferrer"><strong>{p.title} ↗</strong></a> : <strong>{p.title}</strong>}
                        <span className="cyb-block-sub">{p.publisher}</span>
                     </div>
                   </li>
                 ))}
               </ul>
             </div>
           )}
        </div>
      </div>
    );
  }

  // SLIDE 7: Contact & Testimonials
  if (username || (sv("testimonials") && data.testimonials.length > 0)) {
    slides.push(
      <div key="slide-7" className="cyb-slide-content">
        <h2 className="cyb-bg-title">CONNECT</h2>
        <div className="cyb-grid-mid cyb-full-height">
          {username && (
            <div className="cyb-box-dashed cyb-scrollable">
               <span className="cyb-pill cyb-pill-pink">Contact Me</span>
               <div className="cyb-contact-wrap">
                 <ContactForm username={username} />
               </div>
            </div>
          )}
          {sv("testimonials") && data.testimonials.length > 0 && (
            <div className="cyb-box-dashed cyb-scrollable">
               <span className="cyb-pill cyb-pill-purple">Testimonials</span>
               <div className="cyb-testi-list">
                 {data.testimonials.map(t => (
                   <div key={t.id} className="cyb-box-solid cyb-mb">
                     <p className="cyb-quote">"{t.quote}"</p>
                     <div className="cyb-testi-author">
                       <strong>{t.author}</strong> - <span>{t.role}</span>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const numSlides = slides.length;

  // --- Scroll Hijacking Handlers ---
  const handleWheel = useCallback((e: WheelEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('.cyb-scrollable')) {
      const scrollable = target.closest('.cyb-scrollable') as HTMLElement;
      const isAtTop = scrollable.scrollTop === 0;
      const isAtBottom = Math.abs(scrollable.scrollHeight - scrollable.scrollTop - scrollable.clientHeight) <= 2;
      
      if (!((isAtTop && e.deltaY < 0) || (isAtBottom && e.deltaY > 0))) {
        return; // Allow native scroll
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
    <div className="cyb-root">
      <style dangerouslySetInnerHTML={{ __html: CYB_CSS }} />
      
      <div className="cyb-glow cyb-glow-purple" />
      <div className="cyb-glow cyb-glow-pink" />

      {/* Slide Indicators */}
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
    </div>
  );
}

export default Cyberpunk;

/* =====================================================================
   STYLES — Exact Cyber Dashboard Style + Scroll Jacking
   ===================================================================== */

const CYB_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Inter:wght@400;500;600&display=swap');

body, html {
  margin: 0; padding: 0;
  height: 100%;
  overflow: hidden; /* Prevent native scroll */
  background-color: #0b0510;
}

.cyb-root {
  --bg-color: #0b0510;
  --grid-line: rgba(255, 255, 255, 0.07);
  --dashed-border: rgba(255, 255, 255, 0.4);
  --text-main: #ffffff;
  --text-muted: #e2e8f0;
  --pink: #ff66b2;
  --purple: #8a2be2;
  --dark-box: #1a0b2e; 
  
  background-color: var(--bg-color);
  background-image: 
    linear-gradient(var(--grid-line) 1px, transparent 1px),
    linear-gradient(90deg, var(--grid-line) 1px, transparent 1px);
  background-size: 40px 40px;
  background-position: center top;
  
  width: 100vw;
  height: 100vh;
  color: var(--text-main);
  font-family: 'Inter', sans-serif;
  position: relative;
  overflow: hidden;
}

.cyb-root * { box-sizing: border-box; }

/* Glowing Orbs */
.cyb-glow {
  position: absolute;
  width: 50vw;
  height: 50vw;
  border-radius: 50%;
  filter: blur(150px);
  z-index: 0;
  opacity: 0.4;
  pointer-events: none;
}
.cyb-glow-purple { top: 10%; left: -10%; background: var(--purple); }
.cyb-glow-pink { bottom: 0%; right: -10%; background: var(--pink); }

/* Track & Slides */
.cyb-track {
  position: absolute;
  top: 0; left: 0; width: 100%;
  height: 100vh;
  transition: transform 0.8s cubic-bezier(0.645, 0.045, 0.355, 1);
  will-change: transform;
  z-index: 2;
}
.cyb-slide {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  opacity: 0.3;
  transform: scale(0.95);
  transition: opacity 0.8s ease, transform 0.8s ease;
}
.cyb-slide-active { opacity: 1; transform: scale(1); }

/* Main Container per Slide */
.cyb-container {
  width: 100%;
  max-width: 900px;
  height: 100%;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
}

.cyb-slide-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
  height: 100%;
}

/* Background Title */
.cyb-bg-title {
  font-family: 'Cinzel', serif;
  font-size: clamp(2rem, 5vw, 4rem);
  margin: 0;
  color: rgba(255,255,255,0.05);
  text-align: center;
  letter-spacing: 5px;
  position: absolute;
  top: 5%; left: 50%; transform: translateX(-50%);
  pointer-events: none;
  z-index: -1;
}

/* Common Boxes */
.cyb-box-dashed {
  border: 1px dashed var(--dashed-border);
  border-radius: 12px;
  padding: 24px;
  background: rgba(11, 5, 16, 0.6);
  backdrop-filter: blur(5px);
  display: flex; flex-direction: column;
}
.cyb-box-solid {
  background: var(--dark-box);
  border-radius: 12px;
  padding: 20px;
}
.cyb-mb { margin-bottom: 20px; }
.cyb-flex-col { display: flex; flex-direction: column; }
.cyb-full-height { flex: 1; min-height: 0; }

/* Scrollable */
.cyb-scrollable {
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--pink) transparent;
}
.cyb-scrollable::-webkit-scrollbar { width: 6px; }
.cyb-scrollable::-webkit-scrollbar-track { background: transparent; }
.cyb-scrollable::-webkit-scrollbar-thumb { background-color: var(--pink); border-radius: 10px; }

/* Pills */
.cyb-pill {
  display: inline-block;
  padding: 4px 14px;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.95rem;
  margin-bottom: 16px;
  color: #fff;
  align-self: flex-start;
}
.cyb-pill-pink { background-color: var(--pink); border: 1px solid #ff99cc; }
.cyb-pill-purple { background-color: #5c4d99; border: 1px solid #8c7dd9; }

/* Header */
.cyb-header {
  display: flex; justify-content: space-between; align-items: flex-end;
  border: 1px dashed var(--dashed-border);
  border-radius: 12px; padding: 20px 24px;
  background: rgba(11, 5, 16, 0.6); flex-wrap: wrap; gap: 20px; flex-shrink: 0;
}
.cyb-title {
  font-family: 'Cinzel', serif; font-size: 2.8rem; margin: 0 0 5px 0;
  letter-spacing: 2px; text-shadow: 0 0 10px rgba(255,255,255,0.4);
}
.cyb-subtitle { margin: 0; font-size: 0.95rem; letter-spacing: 1px; color: var(--text-muted); }
.cyb-header-right { display: flex; flex-direction: column; align-items: flex-end; font-size: 0.85rem; gap: 5px; color: var(--text-muted); }

/* Slide 1 Top Row */
.cyb-grid-top { display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 24px; flex: 1; min-height: 0; }
.cyb-text { font-size: 0.95rem; line-height: 1.6; margin: 0; }

/* Resume Btn */
.cyb-resume-btn {
  display: inline-block; margin-top: 15px; padding: 8px 16px; border: 1px solid var(--pink);
  color: var(--pink); border-radius: 6px; text-decoration: none; font-weight: 600;
  transition: 0.3s;
}
.cyb-resume-btn:hover { background: var(--pink); color: #fff; box-shadow: 0 0 10px var(--pink); }

/* Social Box */
.cyb-social-box { display: flex; flex-direction: column; margin-top: auto; }
.cyb-social-icons { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.cyb-soc-link {
  width: 40px; height: 40px; border: 2px solid #3b82f6; border-radius: 8px;
  display: flex; justify-content: center; align-items: center; color: #3b82f6;
  font-size: 1.2rem; text-decoration: none; transition: all 0.2s;
}
.cyb-soc-link:nth-child(2n) { border-color: #ef4444; color: #ef4444; }
.cyb-soc-link:nth-child(3n) { border-color: #06b6d4; color: #06b6d4; }
.cyb-soc-link:hover { transform: translateY(-2px); filter: brightness(1.2); }
.cyb-arrow { color: #3b82f6; font-size: 1.5rem; margin: 0 10px; }
.cyb-qr-code { width: 60px; height: 60px; background: #fff; padding: 4px; display: flex; justify-content: center; align-items: center; }
.cyb-qr-inner { width: 100%; height: 100%; border: 2px dashed #000; display: flex; justify-content: center; align-items: center; color: #000; font-size: 1.5rem; }

/* Image Box */
.cyb-image-wrapper {
  background-color: var(--pink); border-radius: 12px; padding: 8px;
  display: flex; height: 100%; min-height: 250px;
}
.cyb-profile-img { width: 100%; height: 100%; object-fit: cover; border-radius: 8px; background: var(--dark-box); }
.cyb-image-placeholder { width: 100%; height: 100%; border-radius: 8px; background: var(--dark-box); display: flex; justify-content: center; align-items: center; font-weight: bold; letter-spacing: 2px; }

/* Middle Row Grids */
.cyb-grid-mid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
.cyb-section { display: flex; flex-direction: column; }
.cyb-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 16px; }
.cyb-list li { display: flex; align-items: flex-start; gap: 10px; }
.cyb-star { color: #fde047; font-size: 1.1rem; line-height: 1.2; }
.cyb-list-text { font-size: 0.95rem; line-height: 1.4; display: flex; flex-direction: column; }
.cyb-list-text strong { color: #fff; font-size: 1.05rem; }
.cyb-block-sub { color: var(--text-muted); font-size: 0.85rem; margin-top: 2px; }
.cyb-desc { color: #aaa; font-size: 0.85rem; margin-top: 5px; }

/* Projects Grid */
.cyb-projects-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; }
.cyb-project-card {
  display: block; border: 1px solid var(--dashed-border); border-radius: 8px; overflow: hidden; text-decoration: none;
  background: var(--dark-box); transition: 0.3s;
}
.cyb-project-card:hover { border-color: var(--pink); box-shadow: 0 0 15px rgba(255,102,178,0.4); transform: translateY(-4px); }
.cyb-project-img { height: 120px; background: #000; display: flex; justify-content: center; align-items: center; }
.cyb-project-img img { width: 100%; height: 100%; object-fit: cover; opacity: 0.7; transition: 0.3s; }
.cyb-project-card:hover .cyb-project-img img { opacity: 1; }
.cyb-ph { font-family: 'Cinzel', serif; font-size: 2rem; color: #555; }
.cyb-project-info { padding: 12px; display: flex; flex-direction: column; }
.cyb-project-info strong { color: #fff; font-size: 0.95rem; }
.cyb-project-info span { color: var(--text-muted); font-size: 0.8rem; margin-top: 4px; }

/* Media */
.cyb-media-section { margin-bottom: 24px; }
.cyb-gallery-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px; }
.cyb-gal-img { width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: 8px; border: 1px solid var(--dashed-border); }
.cyb-vid-iframe { width: 100%; aspect-ratio: 16/9; border: none; border-radius: 8px; }

/* Contact & Testimonials */
.cyb-contact-wrap :where(input, textarea) {
  width: 100%; background: var(--dark-box); border: 1px solid var(--dashed-border); color: #fff;
  padding: 12px; border-radius: 6px; margin-bottom: 12px; font-family: 'Inter', sans-serif;
}
.cyb-contact-wrap :where(input, textarea):focus { outline: none; border-color: var(--pink); }
.cyb-contact-wrap textarea { min-height: 100px; resize: vertical; }
.cyb-contact-wrap button {
  width: 100%; background: var(--pink); color: #fff; font-weight: bold; border: none; padding: 12px; border-radius: 6px; cursor: pointer;
}
.cyb-testi-list { display: flex; flex-direction: column; gap: 16px; }
.cyb-quote { font-style: italic; color: #ccc; margin: 0 0 10px 0; }
.cyb-testi-author { font-size: 0.9rem; color: var(--text-muted); }

/* Dots Navigation */
.cyb-dots {
  position: fixed; right: 20px; top: 50%; transform: translateY(-50%);
  display: flex; flex-direction: column; gap: 12px; z-index: 10;
}
.cyb-dot {
  width: 10px; height: 10px; border-radius: 50%; background: var(--dashed-border); border: none; cursor: pointer; transition: 0.3s;
}
.cyb-dot:hover { background: #fff; transform: scale(1.2); }
.cyb-dot-active { background: var(--pink); box-shadow: 0 0 10px var(--pink); transform: scale(1.3); }
.cyb-scroll-hint { text-align: center; color: var(--text-muted); font-size: 0.85rem; letter-spacing: 2px; animation: pulse 2s infinite; margin-top: 10px; }

@keyframes pulse {
  0%, 100% { opacity: 0.5; transform: translateY(0); }
  50% { opacity: 1; transform: translateY(5px); }
}

/* Responsive */
@media (max-width: 800px) {
  .cyb-grid-top { grid-template-columns: 1fr; }
  .cyb-grid-mid { grid-template-columns: 1fr; gap: 24px; }
  .cyb-header { flex-direction: column; align-items: center; text-align: center; }
  .cyb-header-right { align-items: center; margin-top: 10px; }
  .cyb-image-wrapper { aspect-ratio: 1; max-width: 300px; margin: 0 auto; min-height: unset; }
  .cyb-dots { right: 10px; }
  .cyb-slide { padding-right: 30px; } /* Room for dots */
}
`;
