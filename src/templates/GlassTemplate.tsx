"use client";

import type { PublicPortfolio } from "@/lib/publicTypes";
import { dateRange, videoEmbed, ext } from "@/lib/publicTypes";
import { fontStack } from "@/lib/fonts";
import { ZoomImage } from "@/components/ZoomImage";
import { ContactForm } from "@/components/ContactForm";
import React, { useMemo, useState, useEffect } from "react";

// Current Time Component for Top Right
function TimeDisplay() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }));
    };
    update();
    const int = setInterval(update, 1000);
    return () => clearInterval(int);
  }, []);
  return <>{time}</>;
}

export function GlassTemplate({ data }: { data: PublicPortfolio }) {
  const p = data.profile;
  const hidden = new Set(data.settings?.hidden ?? []);
  const sv = (k: string) => !hidden.has(k);
  const fontFam = fontStack(data.settings?.font);
  const name = p?.display_name || data.username || "Untitled";
  const firstName = name.split(" ")[0];
  const accentColor = data.accent || "#00D05E"; // Isak Default Neon Green

  // Lightbox State for Gallery & Videos
  const [lightboxImage, setLightboxImage] = useState<{ src: string; caption?: string } | null>(null);

  // Dynamic Experience Calculation
  const expYears = useMemo(() => {
    if (!data.experience || data.experience.length === 0) return "5+";
    const startYears = data.experience.map((x) => {
      const match = x.start_date?.match(/\d{4}/);
      return match ? parseInt(match[0]) : new Date().getFullYear();
    });
    const minYear = Math.min(...startYears);
    const years = new Date().getFullYear() - minYear;
    return years > 0 ? `${years}+` : "1+";
  }, [data.experience]);

  // Isak V3 Hero Text Style (Pill highlights)
  const renderHeroText = () => {
    const text = p?.about || p?.tagline || "I'm building websites & brands that people remember";
    const words = text.split(" ");
    if (words.length < 3) return <span className="text-white">{text}</span>;
    
    const midStart = 2;
    const midEnd = Math.min(4, words.length - 1);

    return (
      <>
        <span className="text-white">{words.slice(0, midStart).join(" ")} </span>
        <span 
          className="inline-block px-4 py-1 mx-1 text-[#0E0E0E] rounded-full font-bold shadow-lg -rotate-2"
          style={{ backgroundColor: accentColor }}
        >
          {words.slice(midStart, midEnd).join(" ")}
        </span>
        <span className="text-white leading-tight"> {words.slice(midEnd).join(" ")}</span>
      </>
    );
  };

  return (
    <div
      className="min-h-screen bg-[#0E0E0E] text-[#E0E0E0] font-sans flex flex-col lg:flex-row p-4 gap-4 selection:text-black selection:bg-[var(--tpl-accent)]"
      style={{
        ["--tpl-accent" as string]: accentColor,
        ...(fontFam ? { fontFamily: fontFam } : {}),
      } as React.CSSProperties}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scroll::-webkit-scrollbar { width: 0px; display: none; }
        .custom-scroll { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes zoomIn {
          0% { transform: scale(0.9) translateY(20px); opacity: 0; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        .animate-zoom-in {
          animation: zoomIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />

      {/* ================= LEFT STICKY SIDEBAR ================= */}
      <aside className="relative w-full lg:w-[380px] xl:w-[420px] h-[80vh] lg:h-[calc(100vh-32px)] lg:sticky top-4 rounded-[32px] overflow-hidden bg-[#161616] shrink-0 border border-white/5">
        
        {/* Background Portrait */}
        {p?.avatar_url && (
          <div className="absolute inset-0 z-0">
            <img src={p.avatar_url} alt={name} className="w-full h-full object-cover opacity-60 mix-blend-luminosity grayscale hover:grayscale-0 transition-all duration-700" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#161616]/10 via-[#161616]/40 to-[#161616] pointer-events-none" />
          </div>
        )}

        {/* Top Right Social Icons */}
        {data.links.length > 0 && (
          <div className="absolute top-6 right-6 z-10 flex flex-col gap-3">
            {data.links.slice(0, 4).map((l) => (
              <a 
                key={l.id} href={ext(l.url)} target="_blank" rel="noreferrer"
                className="w-10 h-10 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-[var(--tpl-accent)] hover:text-black hover:border-transparent transition-all"
                title={l.label || l.platform}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider">{l.platform.substring(0, 2)}</span>
              </a>
            ))}
          </div>
        )}

        {/* Left Rotated Badge */}
        {p?.availability && (
          <div className="absolute top-1/2 -left-12 -translate-y-1/2 -rotate-90 origin-center z-10 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--tpl-accent)] animate-pulse" />
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/80">{p.availability}</span>
          </div>
        )}

        {/* Bottom Info & Buttons */}
        <div className="absolute bottom-0 left-0 right-0 p-8 z-10 bg-gradient-to-t from-[#161616] to-transparent">
          <h2 className="text-3xl font-medium text-white mb-2">Hey, I'm {firstName}</h2>
          <p className="text-sm text-gray-400 mb-8 leading-relaxed max-w-[90%]">
            {p?.tagline || `I help startups grow with smart design and development based in ${p?.location || 'the digital world'}.`}
          </p>
          <div className="flex flex-wrap gap-4 items-center">
            <a 
              href="#contact" 
              className="flex items-center gap-2 px-6 py-3 rounded-full text-black font-semibold text-sm transition-transform hover:scale-105"
              style={{ backgroundColor: accentColor }}
            >
              <span className="w-6 h-6 rounded-full bg-black/20 flex items-center justify-center">↗</span>
              Let's talk
            </a>
            {p?.resume_url && (
              <a 
                href={ext(p.resume_url)} target="_blank" rel="noreferrer"
                className="flex items-center gap-2 px-6 py-3 rounded-full border border-white/20 text-white font-semibold text-sm hover:bg-white hover:text-black transition-colors"
              >
                Download CV
              </a>
            )}
          </div>
        </div>
      </aside>

      {/* ================= RIGHT MAIN CONTENT ================= */}
      <main className="flex-1 relative bg-[#161616] rounded-[32px] border border-white/5 p-6 md:p-12 lg:p-16 lg:h-[calc(100vh-32px)] overflow-y-auto custom-scroll">
        
        {/* Background Ambient Glow */}
        <div className="absolute top-20 right-10 w-96 h-96 bg-[var(--tpl-accent)] opacity-[0.07] blur-[100px] pointer-events-none rounded-full" />

        {/* Top Header */}
        <header className="flex justify-between items-center mb-24 relative z-10">
          <div className="flex items-center gap-4 bg-white/5 pr-6 rounded-full border border-white/5 p-1">
            {p?.avatar_url ? (
              <img src={p.avatar_url} alt={name} className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[var(--tpl-accent)]" />
            )}
            <div>
              <h1 className="text-white text-sm font-medium">{name}</h1>
              {p?.title && <p className="text-gray-500 text-xs">{p.title}</p>}
            </div>
          </div>
          <div className="text-right hidden sm:block text-gray-500 text-xs font-mono">
            <TimeDisplay />
          </div>
        </header>

        {/* Hero Section with Spinning Badge */}
        <section className="mb-24 relative z-10 max-w-4xl">
          <h2 className="text-[2.75rem] md:text-6xl lg:text-[4.5rem] font-medium tracking-tight mb-16">
            {renderHeroText()}
          </h2>

          <div className="absolute right-0 bottom-0 md:-right-10 md:-bottom-10 w-32 h-32 hidden sm:flex items-center justify-center pointer-events-none">
            <svg viewBox="0 0 100 100" className="w-full h-full animate-[spin_10s_linear_infinite]">
              <path id="circlePath" d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0" fill="transparent" />
              <text className="text-[10px] font-bold uppercase tracking-[0.2em]" fill="var(--tpl-accent)">
                <textPath href="#circlePath">Award Winning Agency • Since 2022 • </textPath>
              </text>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
               <div className="w-10 h-10 rounded-full bg-[var(--tpl-accent)] text-black flex items-center justify-center">
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 17L17 7M17 7H7M17 7V17"/></svg>
               </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="flex flex-wrap gap-12 md:gap-20 mb-32 relative z-10 border-t border-b border-white/5 py-10">
          <div>
            <h3 className="text-4xl md:text-5xl font-medium text-white mb-2">{expYears}</h3>
            <p className="text-gray-500 text-xs uppercase tracking-[0.1em]">Year of experience</p>
          </div>
          {data.projects.length > 0 && (
            <div>
              <h3 className="text-4xl md:text-5xl font-medium text-white mb-2">{data.projects.length}x</h3>
              <p className="text-gray-500 text-xs uppercase tracking-[0.1em]">Industry Awards</p>
            </div>
          )}
          {p?.location && (
            <div className="ml-auto flex flex-col justify-center">
               <p className="text-white text-sm">Our clients (2015-26©)</p>
               <p className="text-gray-500 text-xs mt-1">{p.location}</p>
            </div>
          )}
        </section>

        {/* Detailed About */}
        {sv("about") && p?.about && (
          <section className="mb-32 max-w-3xl">
            <h3 className="text-xl text-white font-medium mb-6">About</h3>
            <p className="text-gray-400 text-lg md:text-xl leading-relaxed font-light">{p.about}</p>
          </section>
        )}

        {/* Selected Work (Projects) */}
        {sv("projects") && data.projects.length > 0 && (
          <section className="mb-32 relative z-10">
            <h3 className="text-2xl text-white font-medium mb-10">Selected Work</h3>
            <div className="space-y-12">
              {data.projects.map((pr, i) => (
                <a 
                  key={pr.id} href={pr.url ? ext(pr.url) : undefined} target={pr.url ? "_blank" : undefined} rel="noreferrer"
                  className="group block"
                >
                  <div className="w-full aspect-[16/9] md:aspect-[21/9] rounded-[24px] overflow-hidden bg-[#1A1A1A] mb-6 relative">
                    {pr.image_url ? (
                      <img src={pr.image_url} alt={pr.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-700">Project Image</div>
                    )}
                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                       <span className="bg-[var(--tpl-accent)] text-black px-6 py-3 rounded-full font-semibold text-sm transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">View Project</span>
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div>
                      <h4 className="text-2xl text-white font-medium mb-1">{pr.title}</h4>
                      {pr.description && <p className="text-gray-500 text-sm max-w-xl">{pr.description}</p>}
                    </div>
                    <div className="flex flex-col md:items-end text-sm">
                      {pr.role && <p className="text-[var(--tpl-accent)] font-medium">Role: {pr.role}</p>}
                      <p className="text-gray-500 font-mono mt-1">0{i+1} / 0{data.projects.length}</p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Education & Experience Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-32 relative z-10">
          {sv("experience") && data.experience.length > 0 && (
            <section>
              <h3 className="text-xl text-white font-medium mb-8">Experience</h3>
              <div className="space-y-12">
                {data.experience.map((x) => (
                  <div key={x.id} className="relative group">
                    <span className="text-xs font-mono text-[var(--tpl-accent)] mb-2 block">{dateRange(x.start_date, x.end_date, x.is_current)}</span>
                    <h4 className="text-lg text-white font-medium mb-1">{x.title || x.company}</h4>
                    <p className="text-gray-400 text-sm mb-3 font-medium">{[x.company, x.location].filter(Boolean).join(" • ")}</p>
                    {x.description && <p className="text-sm text-gray-500 leading-relaxed">{x.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {sv("education") && data.education.length > 0 && (
            <section>
              <h3 className="text-xl text-white font-medium mb-8">Education</h3>
              <div className="space-y-12">
                {data.education.map((ed) => (
                  <div key={ed.id} className="relative group">
                    <span className="text-xs font-mono text-gray-500 mb-2 block">{dateRange(ed.start_date, ed.end_date)}</span>
                    <h4 className="text-lg text-white font-medium mb-1">{ed.school}</h4>
                    <p className="text-gray-400 text-sm mb-3 font-medium">{[ed.degree, ed.field].filter(Boolean).join(", ")}</p>
                    {ed.description && <p className="text-sm text-gray-500 leading-relaxed">{ed.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* ADDED: Achievements & Publications (Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-32 relative z-10">
          {sv("achievements") && data.achievements.length > 0 && (
            <section>
              <h3 className="text-xl text-white font-medium mb-8">Achievements</h3>
              <div className="space-y-8">
                {data.achievements.map((a) => (
                  <div key={a.id} className="border-l-2 border-[var(--tpl-accent)] pl-4">
                    <h4 className="text-lg text-white font-medium">{a.title}</h4>
                    <span className="text-xs font-mono text-gray-500 block mb-2">{a.date}</span>
                    {a.description && <p className="text-sm text-gray-400 leading-relaxed">{a.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {sv("publications") && data.publications.length > 0 && (
            <section>
              <h3 className="text-xl text-white font-medium mb-8">Publications</h3>
              <div className="space-y-8">
                {data.publications.map((pub) => (
                  <div key={pub.id} className="border-l-2 border-white/20 pl-4">
                    <h4 className="text-lg text-white font-medium">
                      {pub.url ? <a href={ext(pub.url)} target="_blank" rel="noreferrer" className="hover:text-[var(--tpl-accent)] transition-colors">{pub.title} ↗</a> : pub.title}
                    </h4>
                    <span className="text-xs font-mono text-gray-500 block mb-2">{pub.publisher} • {pub.date}</span>
                    {pub.description && <p className="text-sm text-gray-400 leading-relaxed">{pub.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* ADDED: Certifications */}
        {sv("certifications") && data.certifications.length > 0 && (
          <section className="mb-32 relative z-10">
            <h3 className="text-xl text-white font-medium mb-8">Certifications</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.certifications.map((c) => (
                <div key={c.id} className="p-6 rounded-2xl bg-white/5 border border-white/5 flex flex-col justify-between hover:border-white/20 transition-colors">
                  <div>
                    <h4 className="text-white font-medium mb-1">
                      {c.url ? <a href={ext(c.url)} target="_blank" rel="noreferrer" className="hover:text-[var(--tpl-accent)] transition-colors">{c.name} ↗</a> : c.name}
                    </h4>
                    <p className="text-sm text-gray-500 mb-4">{c.issuer}</p>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--tpl-accent)]">{c.issue_date}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Services & Skills Container */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-32 relative z-10">
          {/* Services */}
          {sv("services") && data.services.length > 0 && (
            <section>
              <h3 className="text-xl text-white font-medium mb-8">What I Do</h3>
              <div className="space-y-6">
                {data.services.map((s) => (
                  <div key={s.id} className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-[var(--tpl-accent)] transition-colors">
                    <h4 className="text-lg text-white font-medium mb-2">{s.title}</h4>
                    {s.description && <p className="text-gray-500 text-sm leading-relaxed mb-3">{s.description}</p>}
                    {s.price && <span className="text-[var(--tpl-accent)] text-xs font-mono">{s.price}</span>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* V3 Progress Bar Skills */}
          {sv("skills") && data.skills.length > 0 && (
            <section>
              <h3 className="text-xl text-white font-medium mb-8">Tech Stack</h3>
              <p className="text-gray-400 text-sm mb-8">See how my expertise with these tools drives better results.</p>
              <div className="space-y-6">
                {data.skills.map((s, i) => {
                  const percentage = 95 - (i % 4) * 5; // Fake dynamic percentage for visual look
                  return (
                    <div key={s.id} className="group">
                      <div className="flex justify-between text-sm mb-2 text-white/90 font-medium">
                        <span>{s.name}</span>
                        <span className="text-gray-500">{percentage}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[var(--tpl-accent)] opacity-80 group-hover:opacity-100 transition-opacity" 
                          style={{ width: `${percentage}%` }} 
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        {/* Gallery with Fullscreen Lightbox */}
        {sv("gallery") && data.gallery.length > 0 && (
          <section className="mb-32 relative z-10">
             <h3 className="text-xl text-white font-medium mb-8">Gallery</h3>
             <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
               {data.gallery.map(g => (
                 <figure 
                    key={g.id} 
                    onClick={() => setLightboxImage({ src: g.image_url, caption: g.caption || undefined })}
                    className="break-inside-avoid rounded-2xl overflow-hidden relative group cursor-pointer border border-white/5 hover:border-white/20 transition-all"
                  >
                   <img src={g.image_url} alt={g.caption || ""} className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                   
                   {/* Hover Overlay */}
                   <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white transform translate-y-4 group-hover:translate-y-0 transition-transform">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path></svg>
                      </div>
                   </div>

                   {g.caption && (
                     <figcaption className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-[#0E0E0E] to-transparent text-sm text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                       {g.caption}
                     </figcaption>
                   )}
                 </figure>
               ))}
             </div>
          </section>
        )}

        {/* ADDED: Videos Section */}
        {sv("videos") && data.videos.length > 0 && (
          <section className="mb-32 relative z-10">
            <h3 className="text-xl text-white font-medium mb-8">Videos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {data.videos.map((v) => {
                const embed = videoEmbed(v.url);
                return (
                  <div key={v.id} className="rounded-2xl overflow-hidden bg-[#1A1A1A] border border-white/5">
                    {embed ? (
                      <div className="aspect-video w-full relative">
                        <iframe src={embed} title={v.title || "Video"} allowFullScreen className="absolute top-0 left-0 w-full h-full" />
                      </div>
                    ) : (
                      <div className="p-6">
                        <a href={ext(v.url)} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-white hover:text-[var(--tpl-accent)] transition-colors">
                          <svg className="w-8 h-8 opacity-50" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                          <span className="font-medium">{v.title || v.url}</span>
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Testimonials */}
        {sv("testimonials") && data.testimonials.length > 0 && (
          <section className="mb-32 relative z-10">
             <h3 className="text-xl text-white font-medium mb-8">Client Testimonials</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {data.testimonials.map(t => (
                 <div key={t.id} className="p-8 rounded-[24px] bg-white/5 border border-white/5">
                   <svg className="w-8 h-8 text-[var(--tpl-accent)] opacity-50 mb-6" fill="currentColor" viewBox="0 0 32 32"><path d="M10 8c-3.3 0-6 2.7-6 6v10h10V14H8c0-2.2 1.8-4 4-4V8zm14 0c-3.3 0-6 2.7-6 6v10h10V14h-6c0-2.2 1.8-4 4-4V8z"/></svg>
                   <p className="text-gray-300 italic mb-8">"{t.quote}"</p>
                   <div className="flex items-center gap-4">
                     {t.avatar_url ? (
                       <img src={t.avatar_url} alt={t.author} className="w-12 h-12 rounded-full object-cover grayscale" />
                     ) : (
                       <div className="w-12 h-12 rounded-full bg-white/10" />
                     )}
                     <div>
                       <h4 className="text-white font-medium">{t.author}</h4>
                       <p className="text-gray-500 text-xs">{t.role}</p>
                     </div>
                   </div>
                 </div>
               ))}
             </div>
          </section>
        )}

        {/* Contact Section */}
        <section id="contact" className="relative z-10 bg-white/5 border border-white/5 p-8 md:p-12 rounded-[32px] mt-20">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div>
                <h3 className="text-3xl text-white font-medium mb-4">Let's work together</h3>
                <p className="text-gray-500 mb-8">If you have a general or project enquiry, please drop me an email or fill the form - available now.</p>
                {p?.email && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-600 uppercase tracking-widest mb-1">Email</p>
                    <a href={`mailto:${p.email}`} className="text-lg text-[var(--tpl-accent)] hover:underline">{p.email}</a>
                  </div>
                )}
                {p?.phone && (
                  <div>
                    <p className="text-xs text-gray-600 uppercase tracking-widest mb-1">Phone</p>
                    <p className="text-lg text-white">{p.phone}</p>
                  </div>
                )}
              </div>

              {/* Form Component */}
              {data.username && (
                <div>
                  <ContactForm username={data.username} />
                </div>
              )}
           </div>
        </section>

        {!data.hide_branding && (
          <footer className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-600 font-mono">
            <p>© {new Date().getFullYear()} {firstName} Portfolio.</p>
            <p>System Generated by Folio.</p>
          </footer>
        )}

      </main>

      {/* ================= LIGHTBOX OVERLAY (For Gallery) ================= */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0E0E0E]/95 backdrop-blur-xl animate-[fadeIn_0.3s_ease-out] p-4 md:p-10"
          onClick={() => setLightboxImage(null)}
        >
          <button 
            className="absolute top-6 right-6 md:top-10 md:right-10 w-12 h-12 flex items-center justify-center text-white bg-white/10 hover:bg-[var(--tpl-accent)] hover:text-black border border-white/20 hover:border-transparent rounded-full transition-all hover:scale-110 active:scale-95 z-50 backdrop-blur-md"
            onClick={(e) => { e.stopPropagation(); setLightboxImage(null); }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="relative max-w-[95vw] max-h-[90vh] animate-zoom-in flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <img 
              src={lightboxImage.src} 
              alt={lightboxImage.caption || "Fullscreen image"} 
              className="max-w-full max-h-[80vh] md:max-h-[85vh] object-contain rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10" 
            />
            {lightboxImage.caption && (
              <p className="text-white bg-white/10 mt-6 px-6 py-2 rounded-full backdrop-blur-md text-sm md:text-base font-medium border border-white/5 shadow-lg text-center max-w-[90vw]">
                {lightboxImage.caption}
              </p>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
