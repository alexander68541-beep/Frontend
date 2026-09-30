"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import type { PublicPortfolio } from "@/lib/publicTypes";
import { dateRange, ext } from "@/lib/publicTypes";

/* =====================================================================
   CyberDashboardTemplate — Exact match of the dark grid/neon poster style.
   ===================================================================== */

function oneDate(s: string | null): string | null {
  if (!s) return null;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short" });
}

const SOCIAL_ICONS: Record<string, string> = {
  github: "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12",
  linkedin: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z",
  twitter: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  instagram: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.332.014 7.052.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z",
  behance: "M22 7h-7V5h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-1.729-5.564-5.675 0-3.91 2.325-5.92 5.466-5.92 3.082 0 4.964 1.782 5.375 4.426.078.506.109 1.188.095 2.14H15.97c.13 3.211 3.483 3.312 4.588 2.029h3.168zm-7.686-4h4.965c-.105-1.547-1.136-2.219-2.477-2.219-1.466 0-2.277.768-2.488 2.219zm-9.574 6.988H0V5.021h6.953c5.476.081 5.58 5.444 2.72 6.906 3.461 1.26 3.577 8.061-3.207 8.061zM3 11h3.584c2.508 0 2.906-3-.312-3H3v3zm3.391 3H3v3.016h3.341c3.055 0 2.868-3.016.05-3.016z",
  pinterest: "M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.749-7.252 7.926-7.252 4.163 0 7.398 2.967 7.398 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C24.007 5.367 18.635.001 12.017.001z",
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
  if (/behance/.test(H)) return "behance";
  if (/pinterest/.test(H)) return "pinterest";
  return "globe";
}

function SocialIcon({ name }: { name: string }) {
  return (<svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor"><path d={SOCIAL_ICONS[name] || SOCIAL_ICONS.globe} /></svg>);
}

export function Cyberpunk({ data }: { data: PublicPortfolio }) {
  const p = data.profile;
  const username = data.username;
  const name = p?.display_name || username || "URVASHI";
  
  const photo = p?.avatar_url || data.gallery.find((g) => g.image_url)?.image_url || null;
  const aboutText = p?.about ?? p?.bio ?? "Hi! I am a professional pursuing design as my passion with creative and unique visuals & ideas.";

  return (
    <div className="cyb-root">
      <style dangerouslySetInnerHTML={{ __html: CYB_CSS }} />
      
      {/* Background Orbs */}
      <div className="cyb-glow cyb-glow-purple" />
      <div className="cyb-glow cyb-glow-pink" />

      <main className="cyb-container">
        
        {/* HEADER SECTION */}
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

        {/* TOP ROW: About & Social | Profile Image */}
        <div className="cyb-grid-top">
          <div className="cyb-box-dashed cyb-flex-col">
            
            {/* About Inner Box */}
            <div className="cyb-box-solid cyb-mb">
              <span className="cyb-pill cyb-pill-pink">About Me</span>
              <p className="cyb-text">{aboutText}</p>
            </div>

            {/* Social Inner Box */}
            {data.links.length > 0 && (
              <div className="cyb-box-solid cyb-social-box">
                <span className="cyb-pill cyb-pill-pink">Social Media</span>
                <div className="cyb-social-icons">
                  {data.links.map((l) => (
                    <a key={l.id} href={ext(l.url)} target="_blank" rel="noopener noreferrer" className="cyb-soc-link" title={l.label || l.platform}>
                      <SocialIcon name={detectSocial(l.platform, l.url, l.label)} />
                    </a>
                  ))}
                  {/* Fake Arrow & QR for aesthetics as per image */}
                  <span className="cyb-arrow">➡</span>
                  <div className="cyb-qr-code">
                    <div className="cyb-qr-inner">✽</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Image Box */}
          <div className="cyb-image-wrapper">
             {photo ? (
               <img src={photo} alt={name} className="cyb-profile-img" />
             ) : (
               <div className="cyb-image-placeholder">PHOTO</div>
             )}
          </div>
        </div>

        {/* MIDDLE ROW: Education & Skills */}
        <div className="cyb-box-dashed cyb-grid-mid">
           {/* Education */}
           <div className="cyb-section">
              <span className="cyb-pill cyb-pill-purple">Education</span>
              <ul className="cyb-list">
                {data.education.length > 0 ? data.education.map((ed) => (
                  <li key={ed.id}>
                    <span className="cyb-star">✦</span>
                    <span className="cyb-list-text">{[ed.degree, ed.school].filter(Boolean).join(" at ")}</span>
                  </li>
                )) : (
                   <li><span className="cyb-star">✦</span><span className="cyb-list-text">No education data added yet.</span></li>
                )}
              </ul>
           </div>

           {/* Skills */}
           <div className="cyb-section">
              <span className="cyb-pill cyb-pill-purple">Skills</span>
              <ul className="cyb-list">
                {data.skills.length > 0 ? data.skills.map((s) => (
                  <li key={s.id}>
                    <span className="cyb-star">✦</span>
                    <span className="cyb-list-text">{s.name}</span>
                  </li>
                )) : (
                   <li><span className="cyb-star">✦</span><span className="cyb-list-text">No skills data added yet.</span></li>
                )}
              </ul>
           </div>
        </div>

        {/* BOTTOM ROW: Services (Hobbies) & Projects (Tools) */}
        <div className="cyb-grid-bottom">
           {/* Left Bottom Box (Services mapped to Hobbies style) */}
           <div className="cyb-box-dashed">
              <span className="cyb-pill cyb-pill-pink">Services</span>
              <div className="cyb-hobbies-container">
                 {data.services.length > 0 ? data.services.map((sv) => (
                   <div key={sv.id} className="cyb-hobby-item">
                     {sv.title}
                   </div>
                 )) : (
                   <div className="cyb-hobby-item">UI/UX Design</div>
                 )}
              </div>
           </div>

           {/* Right Bottom Box (Projects mapped to Tools style) */}
           <div className="cyb-box-dashed">
              <span className="cyb-pill cyb-pill-pink">Projects</span>
              <div className="cyb-tools-container">
                 {data.projects.length > 0 ? data.projects.slice(0, 4).map((pr, i) => (
                   <a key={pr.id} href={pr.url ? ext(pr.url) : "#"} target="_blank" rel="noopener noreferrer" className={`cyb-tool-box cyb-c${i % 4}`}>
                     {pr.title ? pr.title.substring(0, 2).toUpperCase() : "PR"}
                   </a>
                 )) : (
                   <>
                     <div className="cyb-tool-box cyb-c0">Ps</div>
                     <div className="cyb-tool-box cyb-c1">Ai</div>
                     <div className="cyb-tool-box cyb-c2">Xd</div>
                     <div className="cyb-tool-box cyb-c3">Fm</div>
                   </>
                 )}
              </div>
           </div>
        </div>

      </main>
    </div>
  );
}

export default Cyberpunk;

/* =====================================================================
   STYLES — Exact Cyber Dashboard Style
   ===================================================================== */

const CYB_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Inter:wght@400;500;600&display=swap');

.cyb-root {
  --bg-color: #0b0510;
  --grid-line: rgba(255, 255, 255, 0.07);
  --dashed-border: rgba(255, 255, 255, 0.4);
  --text-main: #ffffff;
  --text-muted: #e2e8f0;
  --pink: #ff66b2;
  --purple: #8a2be2;
  --dark-box: #1a0b2e; /* slightly lighter than bg for contrast */
  
  background-color: var(--bg-color);
  background-image: 
    linear-gradient(var(--grid-line) 1px, transparent 1px),
    linear-gradient(90deg, var(--grid-line) 1px, transparent 1px);
  background-size: 40px 40px;
  background-position: center top;
  
  min-height: 100vh;
  color: var(--text-main);
  font-family: 'Inter', sans-serif;
  position: relative;
  overflow-x: hidden;
  padding: 40px 20px;
  display: flex;
  justify-content: center;
}

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
.cyb-glow-purple {
  top: 10%; left: -10%;
  background: var(--purple);
}
.cyb-glow-pink {
  bottom: 0%; right: -10%;
  background: var(--pink);
}

/* Main Container */
.cyb-container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 900px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Common Boxes */
.cyb-box-dashed {
  border: 1px dashed var(--dashed-border);
  border-radius: 12px;
  padding: 24px;
  background: rgba(11, 5, 16, 0.6);
  backdrop-filter: blur(5px);
}
.cyb-box-solid {
  background: var(--dark-box);
  border-radius: 12px;
  padding: 20px;
}
.cyb-mb { margin-bottom: 20px; }
.cyb-flex-col { display: flex; flex-direction: column; }

/* Pills */
.cyb-pill {
  display: inline-block;
  padding: 4px 14px;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.95rem;
  margin-bottom: 16px;
  color: #fff;
}
.cyb-pill-pink {
  background-color: var(--pink);
  border: 1px solid #ff99cc;
}
.cyb-pill-purple {
  background-color: #5c4d99;
  border: 1px solid #8c7dd9;
}

/* Header */
.cyb-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  border: 1px dashed var(--dashed-border);
  border-radius: 12px;
  padding: 20px 24px;
  background: rgba(11, 5, 16, 0.6);
  flex-wrap: wrap;
  gap: 20px;
}
.cyb-title {
  font-family: 'Cinzel', serif;
  font-size: 2.8rem;
  margin: 0 0 5px 0;
  letter-spacing: 2px;
  text-shadow: 0 0 10px rgba(255,255,255,0.4);
}
.cyb-subtitle {
  margin: 0;
  font-size: 0.95rem;
  letter-spacing: 1px;
  color: var(--text-muted);
}
.cyb-header-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  font-size: 0.85rem;
  gap: 5px;
  color: var(--text-muted);
}

/* Top Row */
.cyb-grid-top {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 24px;
}
.cyb-text {
  font-size: 0.95rem;
  line-height: 1.6;
  margin: 0;
}

/* Social Box */
.cyb-social-box {
  display: flex;
  flex-direction: column;
}
.cyb-social-icons {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.cyb-soc-link {
  width: 40px; height: 40px;
  border: 2px solid #3b82f6;
  border-radius: 8px;
  display: flex; justify-content: center; align-items: center;
  color: #3b82f6;
  font-size: 1.2rem;
  text-decoration: none;
  transition: all 0.2s;
}
.cyb-soc-link:nth-child(2) { border-color: #ef4444; color: #ef4444; }
.cyb-soc-link:nth-child(3) { border-color: #06b6d4; color: #06b6d4; }
.cyb-soc-link:hover { transform: translateY(-2px); filter: brightness(1.2); }

.cyb-arrow {
  color: #3b82f6;
  font-size: 1.5rem;
  margin: 0 10px;
}
.cyb-qr-code {
  width: 60px; height: 60px;
  background: #fff;
  padding: 4px;
  display: flex; justify-content: center; align-items: center;
}
.cyb-qr-inner {
  width: 100%; height: 100%;
  border: 2px dashed #000;
  display: flex; justify-content: center; align-items: center;
  color: #000; font-size: 1.5rem;
}

/* Image Box */
.cyb-image-wrapper {
  background-color: var(--pink);
  border-radius: 12px;
  padding: 8px;
  display: flex;
  height: 100%;
  min-height: 250px;
}
.cyb-profile-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
  background: var(--dark-box);
}
.cyb-image-placeholder {
  width: 100%; height: 100%;
  border-radius: 8px;
  background: var(--dark-box);
  display: flex; justify-content: center; align-items: center;
  font-weight: bold; letter-spacing: 2px;
}

/* Middle Row (Education & Skills) */
.cyb-grid-mid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
}
.cyb-list {
  list-style: none;
  padding: 0; margin: 0;
  display: flex; flex-direction: column; gap: 12px;
}
.cyb-list li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}
.cyb-star {
  color: #fde047; /* Yellow star */
  font-size: 1.1rem;
  line-height: 1.2;
}
.cyb-list-text {
  font-size: 0.95rem;
  line-height: 1.4;
}

/* Bottom Row (Hobbies & Tools) */
.cyb-grid-bottom {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}
.cyb-hobbies-container {
  background: var(--pink);
  border-radius: 8px;
  padding: 15px;
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  align-items: center;
  min-height: 70px;
}
.cyb-hobby-item {
  border: 1px solid rgba(0,0,0,0.3);
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #000;
}

.cyb-tools-container {
  background: #11052C;
  border-radius: 8px;
  padding: 15px;
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  min-height: 70px;
}
.cyb-tool-box {
  width: 45px; height: 45px;
  display: flex; justify-content: center; align-items: center;
  border-radius: 6px;
  font-weight: bold;
  font-size: 0.9rem;
  text-decoration: none;
  border: 1px solid;
}
.cyb-c0 { border-color: #06b6d4; color: #06b6d4; }
.cyb-c1 { border-color: #f59e0b; color: #f59e0b; }
.cyb-c2 { border-color: #ec4899; color: #ec4899; }
.cyb-c3 { border-color: #84cc16; color: #84cc16; background: rgba(132, 204, 22, 0.2); }

/* Responsive Media Queries */
@media (max-width: 768px) {
  .cyb-header { flex-direction: column; align-items: center; text-align: center; }
  .cyb-header-right { align-items: center; margin-top: 10px; }
  .cyb-grid-top { grid-template-columns: 1fr; }
  .cyb-grid-mid { grid-template-columns: 1fr; gap: 30px; }
  .cyb-grid-bottom { grid-template-columns: 1fr; }
  .cyb-image-wrapper { aspect-ratio: 1; max-width: 400px; margin: 0 auto; }
}
`;
