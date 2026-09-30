"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import type { PublicPortfolio } from "@/lib/publicTypes";
import { dateRange, videoEmbed, ext } from "@/lib/publicTypes";
import { ContactForm } from "@/components/ContactForm";

/* =====================================================================
   CyberTemplate — Dark Neon/Cyberpunk style with Scroll Hijacking.
   ===================================================================== */

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
  if (/youtube/.test(H)) return "youtube";
  return "globe";
}
function SocialIcon({ name }: { name: string }) {
  return (<svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor"><path d={SOCIAL_ICONS[name] || SOCIAL_ICONS.globe} /></svg>);
}

/* ------------------------------ component ------------------------------ */

export function Cyberpunk({ data }: { data: PublicPortfolio }) {
  const p = data.profile;
  const username = data.username;
  const name = p?.display_name || username || "Your Name";
  
  const [activeSlide, setActiveSlide] = useState(0);
  const isScrolling = useRef(false);
  const touchStartY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Group data into logical full-screen slides
  const slides: ReactNode[] = [];

  // Slide 0: Hero
  slides.push(
    <div className="cy-hero-wrapper" key="slide-hero">
      <div className="cy-header-bar">
        <h1 className="cy-main-title">{name}</h1>
        <div className="cy-contact-top">
          {p?.phone && <span>Contact no: {p.phone}</span>}
          {p?.email && <span>Email: {p.email}</span>}
        </div>
      </div>
      <div className="cy-hero-center">
         {p?.title && <h2 className="cy-subtitle">{p.title.toUpperCase()}</h2>}
         <p className="cy-scroll-hint">SCROLL TO EXPLORE ↓</p>
      </div>
    </div>
  );

  // Slide 1: About & Socials & Image
  const aboutText = p?.about ?? p?.bio ?? null;
  const photo = p?.avatar_url || data.gallery.find((g) => g.image_url)?.image_url || null;
  slides.push(
    <div className="cy-grid-2" key="slide-about">
      <div className="cy-col">
        <div className="cy-card">
          <span className="cy-pill">About Me</span>
          <p className="cy-text">{aboutText || "Welcome to my portfolio. Explore my work and skills."}</p>
          {p?.resume_url && <a className="cy-btn" href={ext(p.resume_url)} target="_blank" rel="noopener noreferrer">Download CV</a>}
        </div>
        
        {data.links.length > 0 && (
          <div className="cy-card">
            <span className="cy-pill">Social Media</span>
            <div className="cy-socials">
              {data.links.map((l) => (
                <a key={l.id} href={ext(l.url)} target="_blank" rel="noopener noreferrer" className="cy-soc-link">
                  <SocialIcon name={detectSocial(l.platform, l.url, l.label)} />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="cy-col cy-col-center">
        {photo && (
          <div className="cy-img-card">
            <img src={photo} alt={name} />
          </div>
        )}
      </div>
    </div>
  );

  // Slide 2: Education & Skills
  if (data.education.length > 0 || data.skills.length > 0) {
    slides.push(
      <div className="cy-grid-2" key="slide-eduskill">
        <div className="cy-card cy-scrollable">
          <span className="cy-pill">Education</span>
          <ul className="cy-list">
            {data.education.map((ed) => (
              <li key={ed.id}>
                <span className="cy-star">✦</span>
                <div>
                  <strong>{ed.school}</strong>
                  <span>{[ed.degree, ed.field].filter(Boolean).join(" - ")}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="cy-card cy-scrollable">
          <span className="cy-pill">Skills</span>
          <ul className="cy-list">
            {data.skills.map((s) => (
              <li key={s.id}>
                <span className="cy-star">✦</span>
                <div>
                   <strong>{s.name}</strong>
                   {s.level && <span className="cy-sub-text">({s.level})</span>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  // Slide 3: Experience & Services
  if (data.experience.length > 0 || data.services.length > 0) {
    slides.push(
      <div className="cy-grid-2" key="slide-expserv">
        {data.experience.length > 0 && (
          <div className="cy-card cy-scrollable">
            <span className="cy-pill">Experience</span>
            <ul className="cy-list">
              {data.experience.map((ex) => (
                <li key={ex.id}>
                  <span className="cy-star">✦</span>
                  <div>
                    <strong>{ex.title}</strong>
                    <span>{ex.company} ({dateRange(ex.start_date, ex.end_date, ex.is_current)})</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        {data.services.length > 0 && (
          <div className="cy-card cy-scrollable">
            <span className="cy-pill">Services</span>
            <ul className="cy-list">
              {data.services.map((sv) => (
                <li key={sv.id}>
                  <span className="cy-star">✦</span>
                  <div>
                    <strong>{sv.title}</strong>
                    {sv.description && <span className="cy-sub-text">{sv.description}</span>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  // Slide 4: Projects
  if (data.projects.length > 0) {
    slides.push(
      <div className="cy-full-col" key="slide-projects">
        <div className="cy-card cy-scrollable cy-full-height">
          <span className="cy-pill">Projects</span>
          <div className="cy-project-grid">
            {data.projects.map((pr) => (
              <a key={pr.id} href={pr.url ? ext(pr.url) : "#"} target="_blank" rel="noopener noreferrer" className="cy-project-card">
                <div className="cy-project-img">
                  {pr.image_url ? <img src={pr.image_url} alt={pr.title||"Project"} loading="lazy"/> : <div className="cy-ph">P</div>}
                </div>
                <div className="cy-project-info">
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

  // Slide 5: Contact Form
  if (username) {
    slides.push(
      <div className="cy-full-col cy-centered" key="slide-contact">
         <div className="cy-card cy-contact-card">
            <span className="cy-pill">Contact Me</span>
            <ContactForm username={username} />
         </div>
      </div>
    );
  }

  const numSlides = slides.length;

  // Scroll Hijacking Logic
  const handleWheel = useCallback((e: WheelEvent) => {
    // Ignore wheel if we are scrolling inside a scrollable card
    const target = e.target as HTMLElement;
    if (target.closest('.cy-scrollable')) {
      const scrollable = target.closest('.cy-scrollable') as HTMLElement;
      const isAtTop = scrollable.scrollTop === 0;
      const isAtBottom = scrollable.scrollHeight - scrollable.scrollTop <= scrollable.clientHeight + 1;
      
      if (!((isAtTop && e.deltaY < 0) || (isAtBottom && e.deltaY > 0))) {
        return; // Let native scroll happen inside the box
      }
    }

    e.preventDefault(); // Stop native page scroll
    
    if (isScrolling.current) return;
    
    if (e.deltaY > 30) {
      setActiveSlide((prev) => Math.min(prev + 1, numSlides - 1));
      lockScroll();
    } else if (e.deltaY < -30) {
      setActiveSlide((prev) => Math.max(prev - 1, 0));
      lockScroll();
    }
  }, [numSlides]);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('.cy-scrollable')) return; // let native touch scroll work inside cards
    e.preventDefault(); // stop pull-to-refresh and native scroll on the body
  }, []);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    const touchEndY = e.changedTouches[0].clientY;
    const deltaY = touchStartY.current - touchEndY;
    
    const target = e.target as HTMLElement;
    if (target.closest('.cy-scrollable')) {
      const scrollable = target.closest('.cy-scrollable') as HTMLElement;
      const isAtTop = scrollable.scrollTop === 0;
      const isAtBottom = scrollable.scrollHeight - scrollable.scrollTop <= scrollable.clientHeight + 1;
      
      if (!((isAtTop && deltaY < 0) || (isAtBottom && deltaY > 0))) {
        return; // Handled by internal scroll
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
    setTimeout(() => { isScrolling.current = false; }, 800); // 800ms cooldown for smooth snap
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // We must attach events with { passive: false } to successfully preventDefault
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

  // Dots navigation
  const goToSlide = (idx: number) => {
    setActiveSlide(idx);
    lockScroll();
  };

  return (
    <div className="cy-root">
      <style dangerouslySetInnerHTML={{ __html: CYBER_CSS }} />
      
      {/* Abstract Glowing Orbs Background */}
      <div className="cy-glow cy-glow-1" />
      <div className="cy-glow cy-glow-2" />

      {/* Slide Navigation Dots */}
      <div className="cy-dots">
        {slides.map((_, idx) => (
          <button 
            key={idx} 
            className={`cy-dot ${activeSlide === idx ? 'cy-dot-active' : ''}`} 
            onClick={() => goToSlide(idx)}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>

      {/* Scroll Hijacked Container */}
      <div 
        ref={containerRef} 
        className="cy-track" 
        style={{ transform: `translateY(-${activeSlide * 100}vh)` }}
      >
        {slides.map((slide, idx) => (
          <div key={idx} className={`cy-slide ${activeSlide === idx ? 'cy-slide-active' : ''}`}>
            <div className="cy-slide-inner">
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
   STYLES — Cyberpunk / Dark Neon Grid
   ===================================================================== */

const CYBER_CSS = `
:root {
  --cy-bg: #090314;
  --cy-grid: rgba(255, 255, 255, 0.04);
  --cy-pink: #ff4d94;
  --cy-pink-glow: rgba(255, 77, 148, 0.6);
  --cy-purple: #7a22ff;
  --cy-card-bg: rgba(20, 10, 40, 0.4);
  --cy-card-border: rgba(255, 255, 255, 0.15);
  --cy-text: #e2dcf2;
  --cy-text-muted: #a496c2;
  --cy-font-main: "Space Grotesk", system-ui, sans-serif;
  --cy-font-head: "Cinzel", "Playfair Display", serif;
}

body, html {
  margin: 0; padding: 0;
  height: 100%;
  overflow: hidden; /* Prevent native scroll */
  background-color: var(--cy-bg);
}

.cy-root {
  position: relative;
  width: 100vw;
  height: 100vh;
  background-color: var(--cy-bg);
  background-image: 
    linear-gradient(var(--cy-grid) 1px, transparent 1px),
    linear-gradient(90deg, var(--cy-grid) 1px, transparent 1px);
  background-size: 50px 50px;
  background-position: center center;
  color: var(--cy-text);
  font-family: var(--cy-font-main);
  overflow: hidden;
}

.cy-root * { box-sizing: border-box; }

/* Glowing Orbs */
.cy-glow {
  position: absolute;
  width: 60vw;
  height: 60vw;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.3;
  z-index: 0;
  pointer-events: none;
}
.cy-glow-1 { top: -20%; left: -10%; background: var(--cy-purple); }
.cy-glow-2 { bottom: -20%; right: -10%; background: var(--cy-pink); }

/* Track & Slides */
.cy-track {
  position: absolute;
  top: 0; left: 0; width: 100%;
  height: 100vh;
  transition: transform 0.8s cubic-bezier(0.645, 0.045, 0.355, 1);
  will-change: transform;
  z-index: 2;
}

.cy-slide {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  opacity: 0.3;
  transform: scale(0.95);
  transition: opacity 0.8s ease, transform 0.8s ease;
}

.cy-slide-active {
  opacity: 1;
  transform: scale(1);
}

.cy-slide-inner {
  width: 100%;
  max-width: 1000px;
  max-height: 85vh;
  position: relative;
}

/* Slide Specific Layouts */
.cy-hero-wrapper {
  display: flex; flex-direction: column; height: 100%; justify-content: center;
}
.cy-header-bar {
  display: flex; justify-content: space-between; align-items: flex-start;
  border-bottom: 1px dashed var(--cy-card-border);
  padding-bottom: 20px;
  margin-bottom: 40px;
  flex-wrap: wrap; gap: 20px;
}
.cy-main-title {
  font-family: var(--cy-font-head);
  font-size: clamp(2.5rem, 6vw, 4.5rem);
  margin: 0;
  color: #fff;
  text-transform: uppercase;
  text-shadow: 0 0 10px rgba(255,255,255,0.3);
}
.cy-contact-top {
  display: flex; flex-direction: column; gap: 8px;
  font-size: 0.9rem; color: var(--cy-text-muted);
  text-align: right;
}
.cy-hero-center { text-align: left; }
.cy-subtitle {
  font-size: clamp(1.2rem, 2vw, 1.5rem);
  font-weight: 300;
  letter-spacing: 2px;
  color: var(--cy-pink);
  margin-bottom: 30px;
}
.cy-scroll-hint {
  font-size: 0.85rem; letter-spacing: 3px; color: var(--cy-text-muted);
  animation: cy-bounce 2s infinite;
  display: inline-block;
}

@keyframes cy-bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-10px); }
  60% { transform: translateY(-5px); }
}

.cy-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  height: 100%;
}
.cy-col { display: flex; flex-direction: column; gap: 30px; }
.cy-col-center { justify-content: center; align-items: center; }
.cy-full-col { display: flex; flex-direction: column; width: 100%; height: 100%; }
.cy-centered { justify-content: center; align-items: center; }

/* Cards */
.cy-card {
  background: var(--cy-card-bg);
  border: 1px dashed var(--cy-card-border);
  border-radius: 16px;
  padding: 30px;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
}
.cy-full-height { height: 100%; display: flex; flex-direction: column; }

/* Scrollable Inner Cards */
.cy-scrollable {
  max-height: 70vh;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--cy-pink) transparent;
}
.cy-scrollable::-webkit-scrollbar { width: 6px; }
.cy-scrollable::-webkit-scrollbar-track { background: transparent; }
.cy-scrollable::-webkit-scrollbar-thumb { background-color: var(--cy-pink); border-radius: 10px; }

.cy-pill {
  display: inline-block;
  background: var(--cy-pink);
  color: #fff;
  padding: 6px 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  margin-bottom: 24px;
  box-shadow: 0 0 15px var(--cy-pink-glow);
  letter-spacing: 1px;
}

.cy-text { line-height: 1.7; font-size: 1.05rem; margin-bottom: 20px; }
.cy-sub-text { display: block; font-size: 0.85rem; color: var(--cy-text-muted); margin-top: 4px; }

.cy-btn {
  display: inline-block;
  background: transparent;
  color: var(--cy-pink);
  border: 1px solid var(--cy-pink);
  padding: 10px 20px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s;
}
.cy-btn:hover { background: var(--cy-pink); color: #fff; box-shadow: 0 0 15px var(--cy-pink-glow); }

/* Socials */
.cy-socials { display: flex; gap: 15px; flex-wrap: wrap; }
.cy-soc-link {
  width: 45px; height: 45px;
  display: flex; align-items: center; justify-content: center;
  border: 1px solid var(--cy-card-border);
  border-radius: 12px;
  color: var(--cy-text);
  font-size: 1.2rem;
  transition: all 0.3s;
  background: rgba(0,0,0,0.3);
}
.cy-soc-link:hover {
  border-color: #00d2ff;
  color: #00d2ff;
  box-shadow: 0 0 15px rgba(0, 210, 255, 0.4);
  transform: translateY(-3px);
}

/* Image Profile (Slide 1 right col) */
.cy-img-card {
  width: 100%; max-width: 380px; aspect-ratio: 4/5;
  background: var(--cy-pink);
  border-radius: 16px;
  padding: 4px;
  box-shadow: 0 0 30px var(--cy-pink-glow);
  overflow: hidden;
}
.cy-img-card img {
  width: 100%; height: 100%;
  object-fit: cover;
  border-radius: 12px;
  filter: contrast(1.1) saturate(1.2);
}

/* Lists */
.cy-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 20px; }
.cy-list li { display: flex; gap: 12px; align-items: flex-start; }
.cy-star { color: #fde047; font-size: 1.2rem; margin-top: 2px; text-shadow: 0 0 8px rgba(253,224,71,0.6); }
.cy-list strong { color: #fff; font-size: 1.1rem; display: block; }

/* Projects */
.cy-project-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 20px;
}
.cy-project-card {
  display: block; border: 1px solid var(--cy-card-border); border-radius: 12px; overflow: hidden; text-decoration: none;
  background: rgba(0,0,0,0.4); transition: transform 0.3s, border-color 0.3s;
}
.cy-project-card:hover { transform: translateY(-5px); border-color: var(--cy-purple); box-shadow: 0 0 20px rgba(122,34,255,0.4); }
.cy-project-img { height: 160px; background: #000; display: flex; align-items: center; justify-content: center; }
.cy-project-img img { width: 100%; height: 100%; object-fit: cover; opacity: 0.8; transition: opacity 0.3s; }
.cy-project-card:hover .cy-project-img img { opacity: 1; }
.cy-ph { font-family: var(--cy-font-head); font-size: 3rem; color: var(--cy-card-border); }
.cy-project-info { padding: 15px; }
.cy-project-info strong { display: block; color: #fff; margin-bottom: 5px; }
.cy-project-info span { font-size: 0.85rem; color: var(--cy-text-muted); }

/* Contact Form Overrides */
.cy-contact-card { width: 100%; max-width: 600px; }
.cy-contact-card :where(input, textarea) {
  width: 100%; background: rgba(0,0,0,0.5); border: 1px solid var(--cy-card-border);
  color: #fff; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-family: var(--cy-font-main);
}
.cy-contact-card :where(input, textarea):focus { outline: none; border-color: var(--cy-pink); box-shadow: 0 0 10px var(--cy-pink-glow); }
.cy-contact-card textarea { min-height: 120px; resize: vertical; }
.cy-contact-card button {
  width: 100%; background: var(--cy-pink); color: #fff; font-weight: bold; border: none; padding: 14px; border-radius: 8px; cursor: pointer; box-shadow: 0 0 15px var(--cy-pink-glow); transition: transform 0.2s;
}
.cy-contact-card button:hover { transform: scale(1.02); }
.cy-contact-card label { display: block; margin-bottom: 6px; font-size: 0.9rem; color: var(--cy-text-muted); }

/* Dots Navigation */
.cy-dots {
  position: fixed; right: 30px; top: 50%; transform: translateY(-50%);
  display: flex; flex-direction: column; gap: 12px; z-index: 10;
}
.cy-dot {
  width: 10px; height: 10px; border-radius: 50%; background: var(--cy-card-border); border: none; cursor: pointer; transition: all 0.3s;
}
.cy-dot:hover { background: #fff; transform: scale(1.2); }
.cy-dot-active { background: var(--cy-pink); box-shadow: 0 0 10px var(--cy-pink-glow); transform: scale(1.3); }

/* Mobile Adaptations */
@media (max-width: 800px) {
  .cy-grid-2 { grid-template-columns: 1fr; display: flex; flex-direction: column; }
  .cy-header-bar { flex-direction: column; gap: 10px; text-align: center; justify-content: center; align-items: center; }
  .cy-contact-top { text-align: center; }
  .cy-hero-center { text-align: center; }
  .cy-slide { padding: 20px; padding-right: 40px; /* leave room for dots */ }
  .cy-dots { right: 15px; }
  .cy-img-card { max-width: 250px; }
  .cy-scrollable { max-height: unset; flex: 1; }
  .cy-slide-inner { display: flex; flex-direction: column; gap: 20px; }
}
`;
