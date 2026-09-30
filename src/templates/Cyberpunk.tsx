"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import type { PublicPortfolio } from "@/lib/publicTypes";
import { dateRange, videoEmbed, ext } from "@/lib/publicTypes";
import { ContactForm } from "@/components/ContactForm";

/* =====================================================================
   NotebookTheme — Playful Sketchbook/Tech mixed media with Typing Effect
   and Full-Page Scroll Hijacking. Prefixed `.nt-`.
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

const NT_COLORS = ["#fef08a", "#86efac", "#f9a8d4", "#93c5fd", "#c4b5fd", "#fca5a5"];
const ntColor = (i: number) => NT_COLORS[((i % NT_COLORS.length) + NT_COLORS.length) % NT_COLORS.length];

const SOCIAL_ICONS: Record<string, string> = {
  github: "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12",
  linkedin: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z",
  twitter: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  instagram: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.332.014 7.052.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z",
  facebook: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
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
  if (/facebook/.test(H)) return "facebook";
  return "globe";
}

function SocialIcon({ name }: { name: string }) {
  return (<svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor"><path d={SOCIAL_ICONS[name] || SOCIAL_ICONS.globe} /></svg>);
}

/* ------------------------------ component ------------------------------ */

export function JournalTemplate({ data }: { data: PublicPortfolio }) {
  const p = data.profile;
  const username = data.username;
  const name = p?.display_name || username || "ROBIN";
  
  const [activeSlide, setActiveSlide] = useState(0);
  const isScrolling = useRef(false);
  const touchStartY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const [typedText, setTypedText] = useState("");
  const headline = p?.tagline || p?.bio || "I design software that gets out of your way.";

  // Wow vibe typing effect on mount
  useEffect(() => {
    let i = 0;
    setTypedText("");
    const typing = setInterval(() => {
      setTypedText(headline.substring(0, i + 1));
      i++;
      if (i >= headline.length) clearInterval(typing);
    }, 40);
    return () => clearInterval(typing);
  }, [headline]);

  const hidden = new Set(data.settings?.hidden ?? []);
  const sv = (k: string) => !hidden.has(k);

  const photo = p?.avatar_url || data.gallery.find((g) => g.image_url)?.image_url || null;

  // Compile slides
  const slides: ReactNode[] = [];

  // SLIDE 0: Hero (Notebook + Pixel Font + Typing)
  slides.push(
    <div key="hero" className="nt-slide-inner nt-hero-slide">
       <div className="nt-top-bar">
          <div className="nt-nav">
             <span className="nt-circle nt-red"></span>
             <span className="nt-circle nt-yellow"></span>
             <span className="nt-circle nt-green"></span>
          </div>
          {p?.email && <a href={`mailto:${p.email}`} className="nt-contact-btn">CONTACT ♥</a>}
       </div>

       <div className="nt-hero-center">
          <p className="nt-handwritten nt-fade-in">my name is</p>
          <div className="nt-name-box">
             <h1 className="nt-pixel-title">{name}</h1>
             {/* Floating elements mimicking the image */}
             <span className="nt-float nt-f1" style={{background: ntColor(0)}}>MADE THINGS</span>
             <span className="nt-float nt-f2" style={{background: ntColor(1)}}>SWEAT THE DETAILS</span>
             {p?.title && <span className="nt-float nt-f3" style={{background: ntColor(2)}}>{p.title}</span>}
             <span className="nt-float nt-f4" style={{background: ntColor(3)}}>OPEN TO WORK</span>
          </div>

          <h2 className="nt-typing-text">
             {typedText}<span className="nt-cursor">|</span> ❋
          </h2>
          
          <div className="nt-hero-socials">
             {data.links.map((l, i) => (
                <a key={l.id} href={ext(l.url)} target="_blank" rel="noopener noreferrer" className="nt-soc-icon" style={{background: ntColor(i)}}>
                   <SocialIcon name={detectSocial(l.platform, l.url, l.label)} />
                </a>
             ))}
          </div>
          
          <div className="nt-scroll-down">scroll down ↓</div>
       </div>
    </div>
  );

  // SLIDE 1: About & Skills
  if ((sv("about") && (p?.about || p?.bio)) || (sv("skills") && data.skills.length > 0)) {
    slides.push(
      <div key="about-skills" className="nt-slide-inner">
         <p className="nt-handwritten nt-margin-top">about me!</p>
         <div className="nt-grid-2">
            <div className="nt-col">
               <div className="nt-box-label">what's up</div>
               <p className="nt-handwritten-bio">{p?.about || "I'm a designer who gets a little too excited about making complicated things feel simple. I care about the small details and shipping work that genuinely makes someone's day easier. 🎨"}</p>
               
               {sv("skills") && data.skills.length > 0 && (
                 <div className="nt-skills-wrapper">
                    {data.skills.map((s, i) => (
                      <span key={s.id} className="nt-skill-pill" style={{background: ntColor(i)}}>
                        {s.name}
                      </span>
                    ))}
                 </div>
               )}
            </div>

            <div className="nt-col nt-center">
               {photo && (
                 <div className="nt-polaroid">
                    <div className="nt-tape"></div>
                    <img src={photo} alt={name} />
                    <div className="nt-polaroid-cap">hi there!</div>
                 </div>
               )}
            </div>
         </div>
      </div>
    );
  }

  // SLIDE 2: Projects (Dark Tech Folders)
  if (sv("projects") && data.projects.length > 0) {
    slides.push(
      <div key="projects" className="nt-slide-inner">
         <p className="nt-handwritten nt-margin-top">my works</p>
         <div className="nt-scrollable nt-full-height">
            <div className="nt-projects-grid">
               {data.projects.map((pr, i) => (
                 <div key={pr.id} className="nt-project-folder">
                    <div className="nt-folder-tabs">
                       <div className="nt-tab nt-tab-active">• PROJECT 0{i+1}</div>
                       <div className="nt-tab-bg"></div>
                    </div>
                    <div className="nt-folder-body">
                       <div className="nt-folder-content">
                          <span className="nt-date-mono">● {(pr.tags && pr.tags[0]) ? pr.tags[0].toUpperCase() : "RECENT"}</span>
                          <h3>{pr.title || "Untitled"}</h3>
                          <p>{pr.role || pr.description || "View details to see more about this project and the challenges solved."}</p>
                          {pr.url && <a href={ext(pr.url)} target="_blank" rel="noopener noreferrer" className="nt-view-btn">VIEW PROJECT ↗</a>}
                       </div>
                       <div className="nt-folder-img">
                          <div className="nt-tape"></div>
                          {pr.image_url ? <img src={pr.image_url} alt={pr.title}/> : <div className="nt-ph">P</div>}
                       </div>
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </div>
    );
  }

  // SLIDE 3: Experience & Education
  if ((sv("experience") && data.experience.length > 0) || (sv("education") && data.education.length > 0)) {
    slides.push(
      <div key="exp-edu" className="nt-slide-inner">
         <p className="nt-handwritten nt-margin-top">my journey</p>
         <div className="nt-grid-2 nt-full-height nt-scrollable">
            {sv("experience") && data.experience.length > 0 && (
              <div className="nt-col">
                 <div className="nt-box-label">Experience</div>
                 <div className="nt-timeline">
                    {data.experience.map(ex => (
                      <div key={ex.id} className="nt-tl-item">
                         <div className="nt-tl-dot"></div>
                         <strong>{ex.title}</strong>
                         <span className="nt-tl-sub">{ex.company} • {dateRange(ex.start_date, ex.end_date, ex.is_current)}</span>
                         {ex.description && <p>{ex.description}</p>}
                      </div>
                    ))}
                 </div>
              </div>
            )}
            {sv("education") && data.education.length > 0 && (
              <div className="nt-col">
                 <div className="nt-box-label">Education</div>
                 <div className="nt-timeline">
                    {data.education.map(ed => (
                      <div key={ed.id} className="nt-tl-item">
                         <div className="nt-tl-dot" style={{borderColor: '#f472b6'}}></div>
                         <strong>{ed.school}</strong>
                         <span className="nt-tl-sub">{[ed.degree, ed.field].filter(Boolean).join(", ")} • {dateRange(ed.start_date, ed.end_date)}</span>
                         {ed.description && <p>{ed.description}</p>}
                      </div>
                    ))}
                 </div>
              </div>
            )}
         </div>
      </div>
    );
  }

  // SLIDE 4: Other Media & Contact
  const hasMedia = (sv("gallery") && data.gallery.length > 0) || (sv("certifications") && data.certifications.length > 0);
  if (hasMedia || username) {
    slides.push(
      <div key="contact-media" className="nt-slide-inner">
         <p className="nt-handwritten nt-margin-top">let's talk</p>
         <div className="nt-grid-2 nt-full-height nt-scrollable">
            {username && (
              <div className="nt-col">
                 <div className="nt-box-label">Contact</div>
                 <div className="nt-contact-box">
                    <ContactForm username={username} />
                 </div>
              </div>
            )}
            
            <div className="nt-col">
              {sv("certifications") && data.certifications.length > 0 && (
                 <>
                   <div className="nt-box-label">Certs</div>
                   <ul className="nt-simple-list">
                     {data.certifications.map(c => (
                       <li key={c.id}><strong>{c.name}</strong> - {c.issuer}</li>
                     ))}
                   </ul>
                 </>
              )}
              {sv("gallery") && data.gallery.length > 0 && (
                 <>
                   <div className="nt-box-label" style={{marginTop: '20px'}}>Gallery</div>
                   <div className="nt-mini-gallery">
                      {data.gallery.slice(0,4).map(g => g.image_url && <img key={g.id} src={g.image_url} alt="Gallery" />)}
                   </div>
                 </>
              )}
            </div>
         </div>
      </div>
    );
  }

  const numSlides = slides.length;

  // Scroll Hijacking Handlers
  const handleWheel = useCallback((e: WheelEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('.nt-scrollable')) {
      const scrollable = target.closest('.nt-scrollable') as HTMLElement;
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
    if (target.closest('.nt-scrollable')) return;
    e.preventDefault(); 
  }, []);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    const touchEndY = e.changedTouches[0].clientY;
    const deltaY = touchStartY.current - touchEndY;
    
    const target = e.target as HTMLElement;
    if (target.closest('.nt-scrollable')) {
      const scrollable = target.closest('.nt-scrollable') as HTMLElement;
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
    <div className="nt-root">
      <style dangerouslySetInnerHTML={{ __html: NT_CSS }} />

      <div className="nt-dots">
        {slides.map((_, idx) => (
          <button 
            key={idx} 
            className={`nt-dot ${activeSlide === idx ? 'nt-dot-active' : ''}`} 
            onClick={() => { setActiveSlide(idx); lockScroll(); }}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>

      <div 
        ref={containerRef} 
        className="nt-track" 
        style={{ transform: `translateY(-${activeSlide * 100}vh)` }}
      >
        {slides.map((slide, idx) => (
          <div key={idx} className={`nt-slide ${activeSlide === idx ? 'nt-slide-active' : ''}`}>
             <div className="nt-container">
               {slide}
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default JournalTemplate;

/* =====================================================================
   STYLES — Notebook / Pixel / Mixed Media + Scroll Hijacking
   ===================================================================== */

const NT_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&family=Silkscreen&family=Inter:wght@400;600;800&display=swap');

body, html {
  margin: 0; padding: 0;
  height: 100%;
  overflow: hidden;
  background-color: #fdfdfd;
}

.nt-root {
  width: 100vw;
  height: 100vh;
  background-color: #fdfdfd;
  background-image: repeating-linear-gradient(transparent, transparent 31px, #e2e8f0 31px, #e2e8f0 32px);
  color: #111;
  font-family: 'Inter', sans-serif;
  position: relative;
  overflow: hidden;
}
.nt-root * { box-sizing: border-box; }

/* Margin Line */
.nt-root::before {
  content: ""; position: fixed; top: 0; bottom: 0; left: clamp(40px, 8vw, 80px);
  width: 2px; background-color: #fca5a5; z-index: 0; pointer-events: none; opacity: 0.6;
}

/* Track & Slides */
.nt-track {
  position: absolute; top: 0; left: 0; width: 100%; height: 100vh;
  transition: transform 0.8s cubic-bezier(0.645, 0.045, 0.355, 1);
  will-change: transform; z-index: 2;
}
.nt-slide {
  width: 100vw; height: 100vh;
  display: flex; align-items: center; justify-content: center;
  padding: 40px clamp(20px, 5vw, 60px);
  opacity: 0.2; transform: scale(0.98);
  transition: opacity 0.8s ease, transform 0.8s ease;
}
.nt-slide-active { opacity: 1; transform: scale(1); }

.nt-container {
  width: 100%; max-width: 1000px; height: 100%; max-height: 85vh;
  position: relative; padding-left: clamp(20px, 5vw, 60px); /* Clear the margin line */
}
.nt-slide-inner { display: flex; flex-direction: column; height: 100%; position: relative; }
.nt-full-height { flex: 1; min-height: 0; }
.nt-scrollable {
  overflow-y: auto; scrollbar-width: none; padding-right: 10px;
}
.nt-scrollable::-webkit-scrollbar { display: none; }

/* Typography */
.nt-handwritten { font-family: 'Caveat', cursive; font-size: 1.8rem; color: #555; transform: rotate(-2deg); margin: 0; }
.nt-pixel-title { font-family: 'Silkscreen', cursive; font-size: clamp(3rem, 8vw, 6rem); margin: 0; line-height: 1; text-align: center; }

/* Hero Slide */
.nt-hero-slide { justify-content: space-between; }
.nt-top-bar { display: flex; justify-content: space-between; align-items: center; background: #fff; border: 2px solid #111; padding: 10px 20px; border-radius: 8px; box-shadow: 4px 4px 0px rgba(0,0,0,0.1); margin-bottom: 20px; }
.nt-nav { display: flex; gap: 8px; }
.nt-circle { width: 12px; height: 12px; border-radius: 50%; border: 2px solid #111; }
.nt-red { background: #ef4444; } .nt-yellow { background: #eab308; } .nt-green { background: #22c55e; }
.nt-contact-btn { font-size: 0.85rem; font-weight: bold; border: 2px solid #111; padding: 4px 12px; border-radius: 20px; text-decoration: none; color: #111; }
.nt-contact-btn:hover { background: #111; color: #fff; }

.nt-hero-center { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; }
.nt-name-box { border: 4px solid #111; padding: 10px 40px; position: relative; background: #fff; display: inline-block; margin-top: 10px; box-shadow: 6px 6px 0px rgba(0,0,0,0.1); }
.nt-float { position: absolute; font-size: 0.7rem; font-weight: bold; border: 2px solid #111; padding: 4px 10px; border-radius: 20px; box-shadow: 2px 2px 0px rgba(0,0,0,0.1); text-transform: uppercase; white-space: nowrap; }
.nt-f1 { top: -20px; left: -30px; transform: rotate(-5deg); }
.nt-f2 { top: -25px; right: -40px; transform: rotate(3deg); }
.nt-f3 { bottom: -20px; left: -20px; transform: rotate(2deg); }
.nt-f4 { bottom: -15px; right: -30px; transform: rotate(-4deg); }

.nt-typing-text { font-size: clamp(1.8rem, 4vw, 3rem); font-weight: 800; text-align: center; margin-top: 60px; max-width: 800px; line-height: 1.2; }
.nt-cursor { font-weight: 400; animation: blink 1s step-end infinite; }
@keyframes blink { 50% { opacity: 0; } }

.nt-hero-socials { display: flex; gap: 15px; margin-top: 40px; }
.nt-soc-icon { width: 45px; height: 45px; border: 2px solid #111; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #111; font-size: 1.2rem; box-shadow: 2px 2px 0px rgba(0,0,0,0.1); transition: transform 0.2s; }
.nt-soc-icon:hover { transform: translateY(-3px); }
.nt-scroll-down { margin-top: auto; font-family: 'Caveat', cursive; font-size: 1.2rem; color: #888; animation: bounce 2s infinite; }
@keyframes bounce { 0%,20%,50%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-10px)} 60%{transform:translateY(-5px)} }

/* Grids */
.nt-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 20px; }
.nt-col { display: flex; flex-direction: column; gap: 20px; }
.nt-center { align-items: center; justify-content: center; }

/* Box Label */
.nt-box-label { font-family: 'Inter', sans-serif; font-weight: 800; text-transform: uppercase; border: 2px solid #111; display: inline-block; padding: 6px 16px; background: #fff; box-shadow: 3px 3px 0px rgba(0,0,0,0.1); align-self: flex-start; }
.nt-margin-top { margin-top: -20px; margin-bottom: 20px; }

/* About */
.nt-handwritten-bio { font-family: 'Caveat', cursive; font-size: 1.8rem; line-height: 1.4; color: #333; margin: 0; }
.nt-skills-wrapper { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 20px; }
.nt-skill-pill { border: 2px solid #111; padding: 6px 14px; border-radius: 8px; font-weight: 700; font-size: 0.9rem; box-shadow: 2px 2px 0px rgba(0,0,0,0.1); }

/* Polaroid */
.nt-polaroid { background: #fff; padding: 10px 10px 30px 10px; border: 1px solid #ddd; box-shadow: 5px 5px 15px rgba(0,0,0,0.1); transform: rotate(3deg); position: relative; max-width: 250px; }
.nt-polaroid img { width: 100%; height: auto; border: 1px solid #eee; }
.nt-tape { position: absolute; width: 80px; height: 25px; background: rgba(255,255,255,0.6); border: 1px solid #eee; top: -10px; left: 50%; transform: translateX(-50%) rotate(-2deg); box-shadow: 1px 1px 3px rgba(0,0,0,0.1); z-index: 2; backdrop-filter: blur(2px); }
.nt-polaroid-cap { font-family: 'Caveat', cursive; text-align: center; margin-top: 10px; font-size: 1.2rem; color: #555; }

/* Projects Folders */
.nt-projects-grid { display: flex; flex-direction: column; gap: 40px; margin-top: 20px; padding-bottom: 40px;}
.nt-project-folder { display: flex; flex-direction: column; width: 100%; }
.nt-folder-tabs { display: flex; align-items: flex-end; }
.nt-tab { background: #18181b; color: #fff; padding: 10px 20px; font-weight: bold; font-size: 0.8rem; border-radius: 12px 12px 0 0; }
.nt-tab-bg { flex: 1; height: 10px; border-bottom: 2px solid #18181b; }
.nt-folder-body { background: #18181b; color: #fff; padding: 30px; border-radius: 0 12px 12px 12px; display: grid; grid-template-columns: 1fr 1fr; gap: 30px; box-shadow: 6px 6px 0px #fde047; }
.nt-folder-content { display: flex; flex-direction: column; justify-content: center; }
.nt-date-mono { font-family: monospace; color: #a1a1aa; font-size: 0.85rem; margin-bottom: 10px; }
.nt-folder-content h3 { font-size: 2rem; margin: 0 0 10px 0; }
.nt-folder-content p { color: #d4d4d8; font-size: 0.95rem; line-height: 1.5; margin-bottom: 20px; }
.nt-view-btn { align-self: flex-start; background: transparent; color: #fff; border: 1px solid #fff; padding: 8px 16px; font-size: 0.8rem; font-weight: bold; text-decoration: none; transition: 0.2s; }
.nt-view-btn:hover { background: #fde047; color: #111; border-color: #fde047; }
.nt-folder-img { position: relative; background: #27272a; border-radius: 8px; padding: 10px; display: flex; align-items: center; justify-content: center; min-height: 200px; }
.nt-folder-img img { width: 100%; height: auto; border-radius: 4px; }
.nt-ph { font-family: 'Silkscreen'; font-size: 3rem; color: #555; }

/* Timeline */
.nt-timeline { display: flex; flex-direction: column; gap: 20px; border-left: 2px dashed #cbd5e1; padding-left: 20px; margin-left: 10px; margin-top: 20px; }
.nt-tl-item { position: relative; }
.nt-tl-dot { position: absolute; left: -27px; top: 4px; width: 12px; height: 12px; background: #fff; border: 3px solid #60a5fa; border-radius: 50%; }
.nt-tl-item strong { display: block; font-size: 1.1rem; color: #111; }
.nt-tl-sub { display: block; font-size: 0.85rem; color: #64748b; margin-top: 2px; font-weight: 600; }
.nt-tl-item p { font-size: 0.9rem; color: #475569; margin: 5px 0 0 0; }

/* Misc */
.nt-simple-list { list-style: circle; padding-left: 20px; margin-top: 15px; }
.nt-simple-list li { margin-bottom: 8px; font-size: 0.95rem; }
.nt-mini-gallery { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 15px; }
.nt-mini-gallery img { width: 100%; aspect-ratio: 1; object-fit: cover; border: 2px solid #111; border-radius: 8px; }
.nt-contact-box { background: #fff; border: 2px solid #111; padding: 20px; border-radius: 12px; box-shadow: 4px 4px 0px rgba(0,0,0,0.1); margin-top: 15px; }
.nt-contact-box :where(input, textarea) { width: 100%; border: 2px solid #e2e8f0; padding: 10px; border-radius: 6px; margin-bottom: 12px; font-family: 'Inter', sans-serif; }
.nt-contact-box :where(input, textarea):focus { outline: none; border-color: #111; }
.nt-contact-box button { width: 100%; background: #111; color: #fff; border: none; padding: 12px; font-weight: bold; border-radius: 6px; cursor: pointer; }

/* Dots */
.nt-dots { position: fixed; right: 20px; top: 50%; transform: translateY(-50%); display: flex; flex-direction: column; gap: 12px; z-index: 10; }
.nt-dot { width: 12px; height: 12px; border-radius: 50%; background: transparent; border: 2px solid #94a3b8; cursor: pointer; transition: 0.3s; }
.nt-dot:hover { border-color: #111; }
.nt-dot-active { background: #111; border-color: #111; transform: scale(1.2); }

@media (max-width: 800px) {
  .nt-grid-2 { grid-template-columns: 1fr; }
  .nt-name-box { padding: 10px 20px; }
  .nt-float { position: static; display: inline-block; margin: 5px; transform: none !important; }
  .nt-folder-body { grid-template-columns: 1fr; }
  .nt-slide { padding-right: 40px; padding-left: 20px; }
  .nt-root::before { left: 15px; }
  .nt-container { padding-left: 15px; }
}
`;
