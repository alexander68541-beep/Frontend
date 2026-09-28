"use client";

import type { PublicPortfolio } from "@/lib/publicTypes";
import { dateRange, videoEmbed, ext } from "@/lib/publicTypes";
import { fontStack } from "@/lib/fonts";
import { ZoomImage } from "@/components/ZoomImage";
import { ContactForm } from "@/components/ContactForm";
import React, { useState, useEffect } from "react";

// Helper components for the "Curtis" style
const Crosshair = ({ position }: { position: "tl" | "tr" | "bl" | "br" }) => {
  const posClasses = {
    tl: "-top-2 -left-2",
    tr: "-top-2 -right-2",
    bl: "-bottom-2 -left-2",
    br: "-bottom-2 -right-2",
  };
  return (
    <svg
      className={`absolute w-4 h-4 text-white/30 group-hover:text-[#b0ff4d] transition-colors duration-300 z-10 ${posClasses[position]}`}
      viewBox="0 0 8 8"
      fill="none"
      aria-hidden="true"
    >
      <path d="M4.5 3.5H7V4.5H4.5V7H3.5V4.5H1V3.5H3.5V1H4.5V3.5Z" fill="currentColor"></path>
    </svg>
  );
};

export function GlassTemplate({ data }: { data: PublicPortfolio }) {
  const p = data.profile;
  const hidden = new Set(data.settings?.hidden ?? []);
  const sv = (k: string) => !hidden.has(k);
  const fontFam = fontStack(data.settings?.font);
  const name = p?.display_name || data.username || "sys.admin";
  
  // Interactive state for "Worked At" section
  const [activeExp, setActiveExp] = useState(0);

  return (
    <div
      className="min-h-screen bg-[#0A0A0A] text-[#F5F0EB] selection:bg-[#b0ff4d] selection:text-black uppercase overflow-x-hidden font-sans"
      style={{
        ...(fontFam ? { fontFamily: fontFam } : {}),
      } as React.CSSProperties}
    >
      <style dangerouslySetInnerHTML={{__html: `
        .clip-notch {
          clip-path: polygon(0% 4px, 4px 0%, 100% 0%, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0% 100%);
        }
        .bg-grid {
          background-size: 100px 100px;
          background-image: 
            linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
        }
        .marquee-container {
          overflow: hidden;
          white-space: nowrap;
          width: 100vw;
        }
        .marquee-content {
          display: inline-block;
          animation: marquee 20s linear infinite;
        }
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        /* Custom Scrollbar for horizontal areas */
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />

      {/* Global Grid Overlay */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-grid opacity-50" />
      <div className="fixed left-4 md:left-12 lg:left-24 top-0 bottom-0 w-[1px] bg-white/10 z-0 pointer-events-none" />
      <div className="fixed right-4 md:right-12 lg:right-24 top-0 bottom-0 w-[1px] bg-white/10 z-0 pointer-events-none" />

      {/* Navigation (Sticky) */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-6 md:px-12 backdrop-blur-md border-b border-white/10 bg-[#0A0A0A]/80">
        <div className="flex items-center gap-4">
          <div className="w-16 h-3 bg-[#b0ff4d] clip-notch animate-pulse" />
          <span className="font-mono text-xs tracking-widest text-white/50 hidden md:block">SYS.ACTIVE</span>
        </div>
        <div className="hidden md:flex gap-12 font-mono text-xs tracking-widest text-white/50">
          <p>SOUND - <span className="text-white">ON</span></p>
          {p?.location && <p>{p.location}</p>}
        </div>
        <button className="relative px-6 py-2 bg-[#1a1a1a] border border-[#333] text-sm font-bold tracking-widest text-[#b0ff4d] hover:bg-[#b0ff4d] hover:text-black transition-colors clip-notch">
          MENU
        </button>
      </nav>

      {/* Page Content Container */}
      <main className="relative z-10 pt-40 md:pt-48 pb-20 px-4 md:px-12 lg:px-24">
        
        {/* HERO SECTION */}
        <section className="relative mb-40 border-l border-r border-white/10 px-4 md:px-8 py-10">
          <div className="flex flex-col lg:flex-row gap-12 items-start lg:items-end">
            
            <div className="flex-1">
              <p className="font-mono text-[#b0ff4d] text-sm md:text-base tracking-[0.2em] mb-6">
                FROM <span className="text-white">{p?.location || "UNKNOWN SECTOR"}</span>
              </p>
              
              <h1 className="text-6xl md:text-8xl lg:text-[10rem] font-bold leading-[0.85] tracking-tighter mix-blend-difference mb-8 text-white break-words">
                {name.split(' ').map((word, i) => (
                  <span key={i} className="block">{word}</span>
                ))}
              </h1>

              <div className="font-mono text-sm md:text-base lg:text-lg text-white/60 tracking-widest max-w-2xl leading-relaxed border-l-2 border-[#b0ff4d] pl-6 mt-10 normal-case">
                {p?.tagline && <span className="text-[#b0ff4d] font-bold block mb-4 uppercase">{p.tagline}</span>}
                {p?.bio && <span>{p.bio}</span>}
              </div>
            </div>

            {p?.avatar_url && (
              <div className="relative shrink-0 group">
                <div className="absolute inset-0 bg-[#b0ff4d] translate-x-3 translate-y-3 clip-notch opacity-50 transition-transform group-hover:translate-x-4 group-hover:translate-y-4" />
                <ZoomImage 
                  src={p.avatar_url} 
                  alt={name} 
                  className="w-48 h-64 md:w-64 md:h-80 object-cover grayscale group-hover:grayscale-0 transition-all duration-500 relative z-10 clip-notch border border-white/20"
                />
                <Crosshair position="tl" /><Crosshair position="tr" />
                <Crosshair position="bl" /><Crosshair position="br" />
              </div>
            )}
          </div>

          {/* Scroll Cue */}
          <div className="absolute -bottom-20 left-8 flex flex-col items-center gap-2 animate-bounce">
            <span className="font-mono text-xs tracking-widest text-white/40">SCROLL</span>
            <div className="w-[1px] h-12 bg-gradient-to-b from-[#b0ff4d] to-transparent" />
          </div>
        </section>

        {/* ABOUT SECTION */}
        {sv("about") && p?.about && (
          <section className="mb-40 border-t border-b border-white/10 py-20 relative">
            <h2 className="absolute top-0 -translate-y-1/2 left-8 bg-[#0A0A0A] px-4 font-mono text-xs tracking-[0.3em] text-[#b0ff4d]">/ ABOUT_ME.TXT</h2>
            <div className="text-xl md:text-3xl lg:text-4xl font-semibold leading-snug tracking-tight max-w-5xl normal-case">
              {p.about}
            </div>
          </section>
        )}

        {/* SELECTED WORK (Horizontal Scroll like Curtis) */}
        {sv("projects") && data.projects.length > 0 && (
          <section className="mb-40 relative">
             <div className="flex items-center gap-4 mb-12">
               <span className="px-3 py-1 bg-[#b0ff4d] text-black font-bold tracking-widest text-xs clip-notch">FEATURED</span>
               <h2 className="text-4xl md:text-6xl font-bold tracking-tighter">Selected Work</h2>
             </div>

             <div className="flex overflow-x-auto gap-8 pb-12 pt-4 hide-scrollbar snap-x snap-mandatory">
                {data.projects.map((pr, i) => (
                  <article key={pr.id} className="relative group shrink-0 w-[85vw] md:w-[600px] snap-center">
                    <Crosshair position="tl" /><Crosshair position="tr" />
                    <Crosshair position="bl" /><Crosshair position="br" />
                    
                    <a href={pr.url ? ext(pr.url) : undefined} target="_blank" rel="noreferrer" className="block relative border border-white/10 bg-[#111] p-4 transition-colors hover:border-[#b0ff4d]">
                       {pr.image_url && (
                         <div className="relative w-full aspect-[4/3] overflow-hidden mb-6 bg-black clip-notch">
                           <div className="absolute inset-0 bg-[#b0ff4d]/20 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none"/>
                           <img src={pr.image_url} alt={pr.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" />
                         </div>
                       )}
                       
                       <div className="flex justify-between items-end border-t border-white/10 pt-4">
                         <div>
                           <h3 className="text-2xl md:text-3xl font-bold mb-2">{pr.title}</h3>
                           {pr.role && <p className="font-mono text-[#b0ff4d] text-xs tracking-widest">{pr.role}</p>}
                           {pr.description && <p className="text-white/60 text-sm mt-3 normal-case line-clamp-2 max-w-[80%]">{pr.description}</p>}
                         </div>
                         <div className="shrink-0 w-12 h-12 bg-white/5 border border-white/10 group-hover:bg-[#b0ff4d] group-hover:border-[#b0ff4d] group-hover:text-black text-white flex items-center justify-center transition-colors clip-notch">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 17L17 7M17 7H7M17 7V17"/></svg>
                         </div>
                       </div>
                       
                       {pr.tags.length > 0 && (
                         <div className="flex flex-wrap gap-2 mt-4">
                           {pr.tags.map(t => <span key={t} className="text-[10px] font-mono border border-white/20 px-2 py-1 text-white/50">{t}</span>)}
                         </div>
                       )}
                    </a>
                  </article>
                ))}
             </div>
          </section>
        )}

        {/* WORKED AT (Interactive CRT List) */}
        {sv("experience") && data.experience.length > 0 && (
          <section className="mb-40 border-t border-b border-white/10 relative">
             <h2 className="absolute top-0 -translate-y-1/2 left-8 bg-[#0A0A0A] px-4 font-mono text-xs tracking-[0.3em] text-[#b0ff4d]">/ CAREER_TIMELINE</h2>
             
             <div className="flex flex-col lg:flex-row w-full divide-y lg:divide-y-0 lg:divide-x divide-white/10">
                {/* Left: List */}
                <div className="w-full lg:w-1/2 flex flex-col">
                  {data.experience.map((x, i) => (
                    <button 
                      key={x.id} 
                      onClick={() => setActiveExp(i)}
                      className={`group flex items-center justify-between p-6 md:p-8 text-left transition-colors border-b border-white/10 last:border-0 ${activeExp === i ? 'bg-white/5' : 'hover:bg-white/5'}`}
                    >
                      <div className="flex items-center gap-6">
                        <span className={`font-mono text-xs ${activeExp === i ? 'text-[#b0ff4d]' : 'text-white/30'}`}>
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <div>
                          <h3 className={`text-xl md:text-3xl font-bold mb-1 ${activeExp === i ? 'text-white' : 'text-white/60 group-hover:text-white'}`}>
                            {x.title || x.company}
                          </h3>
                          <span className="font-mono text-[#b0ff4d] tracking-widest text-xs">
                            {[x.company, x.location].filter(Boolean).join(" // ")}
                          </span>
                        </div>
                      </div>
                      <span className={`font-mono text-2xl ${activeExp === i ? 'text-[#b0ff4d]' : 'text-white/30'}`}>
                        {activeExp === i ? '−' : '+'}
                      </span>
                    </button>
                  ))}
                </div>
                
                {/* Right: Details Panel (CRT effect) */}
                <div className="w-full lg:w-1/2 p-8 md:p-16 flex flex-col justify-center relative bg-[#050505] overflow-hidden">
                  <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
                  <Crosshair position="tl" /><Crosshair position="tr" />
                  <Crosshair position="bl" /><Crosshair position="br" />
                  
                  {data.experience[activeExp] && (
                    <div className="relative z-10 animate-[fadeIn_0.3s_ease-out]">
                      <div className="inline-block px-3 py-1 border border-[#b0ff4d] text-[#b0ff4d] font-mono text-xs mb-6">
                        {dateRange(data.experience[activeExp].start_date, data.experience[activeExp].end_date, data.experience[activeExp].is_current)}
                      </div>
                      <p className="text-xl md:text-2xl leading-relaxed text-white/80 normal-case font-medium">
                        {data.experience[activeExp].description || "No description provided."}
                      </p>
                    </div>
                  )}
                </div>
             </div>
          </section>
        )}

        {/* SKILLS / TECH STACK (Brutalist badges) */}
        {sv("skills") && data.skills.length > 0 && (
          <section className="mb-40">
            <h2 className="text-sm font-mono tracking-[0.3em] text-[#b0ff4d] mb-8">/ TECH_STACK</h2>
            <div className="flex flex-wrap gap-4">
              {data.skills.map(s => (
                <span key={s.id} className="px-6 py-4 border border-white/20 text-white/80 text-lg md:text-2xl font-bold uppercase tracking-tight hover:border-[#b0ff4d] hover:text-[#b0ff4d] hover:-translate-y-1 transition-all bg-[#111]">
                  {s.name}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* EDUCATION & OTHERS (Grid System) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/10 mb-40 border border-white/10">
          
          {sv("education") && data.education.length > 0 && (
            <section className="bg-[#0A0A0A] p-8 md:p-12 relative group">
              <Crosshair position="tl" /><Crosshair position="tr" /><Crosshair position="bl" /><Crosshair position="br" />
              <h2 className="text-sm font-mono tracking-[0.3em] text-[#b0ff4d] mb-8">/ EDUCATION</h2>
              <div className="space-y-10">
                {data.education.map(ed => (
                  <div key={ed.id}>
                    <h3 className="text-2xl font-bold mb-2">{ed.school}</h3>
                    <p className="font-mono text-white/60 mb-2">{[ed.degree, ed.field].filter(Boolean).join(" // ")}</p>
                    <p className="text-xs text-[#b0ff4d] border border-[#b0ff4d]/30 inline-block px-2 py-1 mb-4">{dateRange(ed.start_date, ed.end_date)}</p>
                    {ed.description && <p className="text-white/50 text-sm normal-case">{ed.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {sv("services") && data.services.length > 0 && (
            <section className="bg-[#0A0A0A] p-8 md:p-12 relative group">
              <Crosshair position="tl" /><Crosshair position="tr" /><Crosshair position="bl" /><Crosshair position="br" />
              <h2 className="text-sm font-mono tracking-[0.3em] text-[#b0ff4d] mb-8">/ SERVICES</h2>
              <div className="space-y-8">
                {data.services.map((s, i) => (
                  <div key={s.id} className="border-b border-white/10 pb-6 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold flex gap-4">
                        <span className="text-white/30 font-mono text-sm mt-1">0{i+1}</span>
                        {s.title}
                      </h3>
                      {s.price && <span className="text-[#b0ff4d] font-mono text-sm">{s.price}</span>}
                    </div>
                    {s.description && <p className="text-white/50 text-sm normal-case ml-8">{s.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Certifications & Achievements mapping inside grid if needed */}
          {sv("certifications") && data.certifications.length > 0 && (
             <section className="bg-[#0A0A0A] p-8 md:p-12 relative group">
               <Crosshair position="tl" /><Crosshair position="tr" /><Crosshair position="bl" /><Crosshair position="br" />
               <h2 className="text-sm font-mono tracking-[0.3em] text-[#b0ff4d] mb-8">/ CERTS</h2>
               <ul className="space-y-6">
                 {data.certifications.map(c => (
                   <li key={c.id} className="flex justify-between border-b border-white/5 pb-4">
                     <div>
                       <h3 className="font-bold">{c.url ? <a href={ext(c.url)} target="_blank" rel="noreferrer" className="hover:text-[#b0ff4d]">{c.name} ↗</a> : c.name}</h3>
                       <p className="text-white/40 text-sm">{c.issuer}</p>
                     </div>
                     <span className="font-mono text-xs text-[#b0ff4d]">{c.issue_date}</span>
                   </li>
                 ))}
               </ul>
             </section>
          )}
        </div>

        {/* MEDIA GALLERY */}
        {sv("gallery") && data.gallery.length > 0 && (
          <section className="mb-40">
            <h2 className="text-sm font-mono tracking-[0.3em] text-[#b0ff4d] mb-8">/ MEDIA_ARCHIVE</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-1 bg-white/10 border border-white/10 p-1">
              {data.gallery.map(g => (
                <figure key={g.id} className="relative group bg-[#0A0A0A] overflow-hidden aspect-square">
                  <div className="absolute inset-0 bg-[#b0ff4d]/20 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none"/>
                  <ZoomImage src={g.image_url} alt={g.caption || ""} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105" />
                  {g.caption && <figcaption className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur text-xs font-mono p-2 border-l-2 border-[#b0ff4d] opacity-0 group-hover:opacity-100 transition-opacity">{g.caption}</figcaption>}
                </figure>
              ))}
            </div>
          </section>
        )}

      </main>

      {/* FOOTER */}
      <footer className="relative bg-[#b0ff4d] text-black overflow-hidden pt-24 pb-12 mt-40">
        <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none mix-blend-multiply" />
        
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
          
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-12 mb-24">
            <div>
              <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-8 max-w-2xl leading-none">
                Let's build<br/>something<br/>insane.
              </h2>
              <div className="flex flex-wrap gap-4">
                {p?.email && (
                  <a href={`mailto:${p.email}`} className="px-6 py-4 bg-black text-white font-bold uppercase tracking-widest text-sm hover:bg-white hover:text-black border-2 border-transparent hover:border-black transition-all clip-notch">
                    Shoot a message
                  </a>
                )}
                {p?.resume_url && (
                  <a href={ext(p.resume_url)} target="_blank" rel="noreferrer" className="px-6 py-4 bg-transparent border-2 border-black text-black font-bold uppercase tracking-widest text-sm hover:bg-black hover:text-[#b0ff4d] transition-all clip-notch">
                    Download CV
                  </a>
                )}
              </div>
            </div>

            {/* Social Links Matrix */}
            <div className="w-full lg:w-auto">
              <p className="font-mono text-xs font-bold tracking-widest mb-6 opacity-60">/ CONNECT_DIRECTORY</p>
              <div className="flex flex-col gap-2 w-full lg:min-w-[300px]">
                {data.links.map((l, i) => (
                  <a key={l.id} href={ext(l.url)} target="_blank" rel="noreferrer" className="group flex justify-between items-center py-4 border-b border-black/20 hover:border-black transition-colors">
                    <div className="flex items-center gap-6">
                      <span className="font-mono text-xs font-bold opacity-30 group-hover:opacity-100">0{i+1}</span>
                      <span className="font-bold uppercase tracking-widest text-lg group-hover:translate-x-2 transition-transform">{l.platform}</span>
                    </div>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all"><path d="M7 17L17 7M17 7H7M17 7V17"/></svg>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Form embedded in Footer if username exists */}
          {data.username && (
            <div className="w-full max-w-2xl bg-black p-8 text-[#F5F0EB] clip-notch mb-24 relative group">
              <Crosshair position="tl" /><Crosshair position="tr" /><Crosshair position="bl" /><Crosshair position="br" />
              <h3 className="font-bold text-2xl uppercase mb-6 tracking-tighter text-[#b0ff4d]">Direct Terminal</h3>
              <ContactForm username={data.username} />
            </div>
          )}

          {/* Giant Marquee Text */}
          <div className="marquee-container -ml-6 md:-ml-12 mb-12 mix-blend-multiply opacity-20 pointer-events-none">
            <div className="marquee-content text-[15vw] font-black uppercase tracking-tighter leading-none">
               PORTFOLIO/{name.replace(" ", "")} PORTFOLIO/{name.replace(" ", "")} PORTFOLIO/{name.replace(" ", "")} 
            </div>
          </div>

          {!data.hide_branding && (
            <div className="flex justify-between items-center font-mono text-xs font-bold tracking-widest pt-6 border-t border-black/20">
              <p>@2026 BY {name}</p>
              <p>SYSTEM GENERATED BY FOLIO</p>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}
