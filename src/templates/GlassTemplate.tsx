"use client";

import type { PublicPortfolio } from "@/lib/publicTypes";
import { dateRange, videoEmbed, ext } from "@/lib/publicTypes";
import { fontStack } from "@/lib/fonts";
import { ZoomImage } from "@/components/ZoomImage";
import { ContactForm } from "@/components/ContactForm";
import React, { useMemo } from "react";

export function GlassTemplate({ data }: { data: PublicPortfolio }) {
  const p = data.profile;
  const hidden = new Set(data.settings?.hidden ?? []);
  const sv = (k: string) => !hidden.has(k);
  const fontFam = fontStack(data.settings?.font);
  const name = p?.display_name || data.username || "Untitled";
  const firstName = name.split(" ")[0];
  const accentColor = data.accent || "#00D05E"; // Default neon green from image

  // Calculate Years of Experience dynamically
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

  // Make the hero text stand out by wrapping middle words in pills
  const renderHeroText = () => {
    const text = p?.tagline || p?.about || "Crafting digital experiences and brands that people remember";
    const words = text.split(" ");
    if (words.length < 4) return <span className="text-white">{text}</span>;
    
    const midStart = Math.floor(words.length / 3);
    const midEnd = Math.floor((words.length / 3) * 2);

    return (
      <>
        <span className="text-white">{words.slice(0, midStart).join(" ")} </span>
        <span 
          className="inline-block px-4 py-1 mx-1 text-black rounded-full font-bold transform -rotate-1 shadow-lg"
          style={{ backgroundColor: accentColor }}
        >
          {words.slice(midStart, midEnd).join(" ")}
        </span>
        <span className="text-white"> {words.slice(midEnd).join(" ")}</span>
      </>
    );
  };

  return (
    <div
      className="min-h-screen bg-[#0A0A0A] text-gray-300 selection:text-black font-sans flex flex-col lg:flex-row p-4 md:p-6 gap-6"
      style={{
        ["--tpl-accent" as string]: accentColor,
        ...(fontFam ? { fontFamily: fontFam } : {}),
      } as React.CSSProperties}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        ::selection { background: var(--tpl-accent); }
        .spin-slow { animation: spin 12s linear infinite; }
        .hide-scroll::-webkit-scrollbar { display: none; }
        .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      {/* LEFT PANEL - STICKY SIDEBAR */}
      <aside className="w-full lg:w-[420px] xl:w-[460px] h-[85vh] lg:h-[calc(100vh-48px)] lg:sticky top-6 rounded-[32px] bg-[#141414] overflow-hidden flex flex-col relative shrink-0 shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-white/5">
        
        {/* Avatar Background */}
        {p?.avatar_url && (
          <div className="absolute inset-0 z-0">
            <img 
              src={p.avatar_url} 
              alt={name} 
              className="w-full h-full object-cover opacity-50 grayscale mix-blend-luminosity hover:grayscale-0 hover:opacity-80 transition-all duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#141414]/10 via-[#141414]/40 to-[#141414] pointer-events-none" />
          </div>
        )}

        {/* Top Left Logo / Icon */}
        <div className="absolute top-8 left-8 z-10 w-8 h-8 rounded-full bg-white flex items-center justify-center text-black font-bold text-lg">
          {firstName.charAt(0)}
        </div>

        {/* Social Links (Right Edge) */}
        {data.links.length > 0 && (
          <div className="absolute top-8 right-6 z-10 flex flex-col gap-3">
            {data.links.slice(0, 4).map((l) => (
              <a 
                key={l.id} 
                href={ext(l.url)} 
                target="_blank" 
                rel="noreferrer"
                className="w-10 h-10 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-[var(--tpl-accent)] hover:text-black hover:border-transparent transition-all shadow-lg font-medium text-xs uppercase"
                title={l.label || l.platform}
              >
                {l.platform.substring(0, 2)}
              </a>
            ))}
          </div>
        )}

        {/* Available for Work Badge (Left Edge) */}
        {p?.availability && (
          <div className="absolute top-1/2 -left-[4.5rem] -translate-y-1/2 -rotate-90 origin-center z-10 flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-full shadow-lg">
            <span className="w-2 h-2 rounded-full bg-[var(--tpl-accent)] animate-pulse" />
            <span className="text-xs tracking-widest uppercase font-medium text-white/90">{p.availability}</span>
          </div>
        )}

        {/* Bottom Content Area */}
        <div className="relative z-10 mt-auto p-8 pt-32 bg-gradient-to-t from-[#0A0A0A] to-transparent">
          <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">Hey, I'm {firstName}</h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-8 max-w-[90%]">
            {p?.bio || `I help brands grow with smart design and development based in ${p?.location || 'the digital world'}.`}
          </p>
          
          <div className="flex flex-wrap gap-4 items-center">
            <a 
              href="#contact" 
              className="flex items-center gap-2 px-6 py-3 rounded-full text-black font-semibold text-sm transition-transform hover:scale-105"
              style={{ backgroundColor: accentColor }}
            >
              <span className="w-5 h-5 rounded-full bg-black/20 flex items-center justify-center">↗</span>
              Let's talk
            </a>
            {p?.resume_url && (
              <a 
                href={ext(p.resume_url)} 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-2 px-6 py-3 rounded-full border border-white/20 text-white font-semibold text-sm hover:bg-white hover:text-black transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                Download CV
              </a>
            )}
          </div>
        </div>
      </aside>

      {/* RIGHT PANEL - MAIN CONTENT */}
      <main className="flex-1 relative lg:pl-10 lg:pr-8 xl:pr-16 py-8 h-auto lg:h-[calc(100vh-48px)] lg:overflow-y-auto hide-scroll rounded-[32px]">
        
        {/* Background Ambient Glow */}
        <div 
          className="absolute top-40 right-20 w-[400px] h-[400px] rounded-full blur-[150px] opacity-20 pointer-events-none"
          style={{ backgroundColor: accentColor }}
        />

        {/* Top Header */}
        <header className="flex justify-between items-center mb-20 relative z-10">
          <div className="flex items-center gap-4">
            {p?.avatar_url && <img src={p.avatar_url} alt={name} className="w-12 h-12 rounded-full object-cover border border-white/10" />}
            <div>
              <h1 className="text-white font-semibold text-lg leading-tight">{name}</h1>
              {p?.title && <p className="text-gray-500 text-xs">{p.title}</p>}
            </div>
          </div>
          <div className="text-right hidden md:block text-gray-500 text-xs font-mono">
            <p>Based in</p>
            <p className="text-gray-300">{p?.location || 'Worldwide'}</p>
          </div>
        </header>

        {/* Hero Section */}
        <section className="mb-24 relative z-10">
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-semibold tracking-tighter leading-[1.1] max-w-4xl">
            {renderHeroText()}
          </h2>

          {/* Spinning Badge Graphic (Simulation) */}
          <div className="absolute right-0 md:right-12 top-full -translate-y-1/2 w-32 h-32 md:w-40 md:h-40 pointer-events-none hidden sm:flex items-center justify-center">
            <div className="absolute inset-0 border border-white/10 rounded-full spin-slow border-dashed" />
            <div 
              className="w-24 h-24 rounded-full flex items-center justify-center text-center text-[10px] font-bold tracking-widest uppercase text-black"
              style={{ backgroundColor: accentColor }}
            >
              Excellence<br/>Since<br/>2024
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="flex flex-wrap gap-12 md:gap-24 mb-32 relative z-10">
          <div>
            <h3 className="text-5xl md:text-7xl font-medium text-white mb-2">{expYears}</h3>
            <p className="text-gray-500 text-sm uppercase tracking-wider">Years of experience</p>
          </div>
          {data.projects.length > 0 && (
            <div>
              <h3 className="text-5xl md:text-7xl font-medium text-white mb-2">{data.projects.length}x</h3>
              <p className="text-gray-500 text-sm uppercase tracking-wider">Completed Projects</p>
            </div>
          )}
          {data.certifications.length > 0 && (
            <div>
              <h3 className="text-5xl md:text-7xl font-medium text-white mb-2">{data.certifications.length}</h3>
              <p className="text-gray-500 text-sm uppercase tracking-wider">Certifications</p>
            </div>
          )}
        </section>

        <div className="w-full h-px bg-gradient-to-r from-white/10 to-transparent mb-20" />

        {/* Selected Work */}
        {sv("projects") && data.projects.length > 0 && (
          <section className="mb-32 relative z-10">
            <div className="flex items-center gap-3 mb-10">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: accentColor }} />
              <h3 className="text-2xl text-white font-medium">Selected Works</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {data.projects.map((pr) => (
                <a 
                  key={pr.id} 
                  href={pr.url ? ext(pr.url) : undefined} 
                  target={pr.url ? "_blank" : undefined} 
                  rel="noreferrer"
                  className="group block"
                >
                  <div className="w-full aspect-[4/3] rounded-3xl overflow-hidden bg-[#1A1A1A] border border-white/5 mb-6 relative">
                    {pr.image_url ? (
                      <img src={pr.image_url} alt={pr.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-700">No Image</div>
                    )}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <span className="bg-white text-black px-6 py-3 rounded-full font-semibold text-sm transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">View Project</span>
                    </div>
                  </div>
                  <h4 className="text-xl text-white font-medium mb-2">{pr.title}</h4>
                  <p className="text-gray-500 text-sm mb-4">{pr.role || pr.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {pr.tags.map(t => (
                      <span key={t} className="text-xs px-3 py-1 rounded-full bg-white/5 text-gray-400 border border-white/5">{t}</span>
                    ))}
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Experience & Education */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-32 relative z-10">
          {sv("experience") && data.experience.length > 0 && (
            <section>
              <h3 className="text-2xl text-white font-medium mb-10 flex items-center gap-3">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: accentColor }} />
                Experience
              </h3>
              <div className="space-y-8">
                {data.experience.map((x) => (
                  <div key={x.id} className="relative pl-6 border-l border-white/10 group hover:border-[var(--tpl-accent)] transition-colors">
                    <span className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-[#1A1A1A] border border-white/30 group-hover:border-[var(--tpl-accent)] group-hover:bg-[var(--tpl-accent)] transition-all" />
                    <span className="text-xs font-mono text-[var(--tpl-accent)] mb-2 block">{dateRange(x.start_date, x.end_date, x.is_current)}</span>
                    <h4 className="text-lg text-white font-medium mb-1">{x.title || x.company}</h4>
                    <p className="text-gray-400 text-sm mb-3">{[x.company, x.location].filter(Boolean).join(" · ")}</p>
                    {x.description && <p className="text-sm text-gray-500 leading-relaxed">{x.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {sv("education") && data.education.length > 0 && (
            <section>
              <h3 className="text-2xl text-white font-medium mb-10 flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-white" />
                Education
              </h3>
              <div className="space-y-8">
                {data.education.map((ed) => (
                  <div key={ed.id} className="relative pl-6 border-l border-white/10 group hover:border-white transition-colors">
                    <span className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-[#1A1A1A] border border-white/30 group-hover:bg-white transition-all" />
                    <span className="text-xs font-mono text-gray-500 mb-2 block">{dateRange(ed.start_date, ed.end_date)}</span>
                    <h4 className="text-lg text-white font-medium mb-1">{ed.school}</h4>
                    <p className="text-gray-400 text-sm mb-3">{[ed.degree, ed.field].filter(Boolean).join(", ")}</p>
                    {ed.description && <p className="text-sm text-gray-500 leading-relaxed">{ed.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Skills */}
        {sv("skills") && data.skills.length > 0 && (
          <section className="mb-32 relative z-10">
            <h3 className="text-2xl text-white font-medium mb-10 flex items-center gap-3">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: accentColor }} />
              Skills & Expertise
            </h3>
            <div className="flex flex-wrap gap-3">
              {data.skills.map((s) => (
                <span key={s.id} className="px-5 py-3 rounded-2xl bg-[#1A1A1A] border border-white/5 text-gray-300 font-medium hover:text-white hover:border-white/20 transition-colors">
                  {s.name}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Services */}
        {sv("services") && data.services.length > 0 && (
          <section className="mb-32 relative z-10">
            <h3 className="text-2xl text-white font-medium mb-10">Services</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {data.services.map((s) => (
                <div key={s.id} className="p-8 rounded-3xl bg-[#1A1A1A] border border-white/5 hover:border-[var(--tpl-accent)] transition-colors group">
                  <h4 className="text-xl text-white font-medium mb-3 group-hover:text-[var(--tpl-accent)] transition-colors">{s.title}</h4>
                  {s.price && <span className="inline-block px-3 py-1 bg-white/5 text-gray-300 text-xs rounded-full mb-4">{s.price}</span>}
                  {s.description && <p className="text-gray-500 text-sm leading-relaxed">{s.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Gallery */}
        {sv("gallery") && data.gallery.length > 0 && (
          <section className="mb-32 relative z-10">
             <h3 className="text-2xl text-white font-medium mb-10">Gallery</h3>
             <div className="columns-1 sm:columns-2 gap-6 space-y-6">
               {data.gallery.map(g => (
                 <figure key={g.id} className="break-inside-avoid rounded-3xl overflow-hidden relative group">
                   <ZoomImage src={g.image_url} alt={g.caption || ""} className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500" />
                   {g.caption && <figcaption className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black to-transparent text-sm text-white opacity-0 group-hover:opacity-100 transition-opacity">{g.caption}</figcaption>}
                 </figure>
               ))}
             </div>
          </section>
        )}

        {/* Contact Form */}
        <section id="contact" className="relative z-10 bg-[#141414] p-8 md:p-12 rounded-[32px] border border-white/5">
           <div className="max-w-2xl mx-auto">
             <h3 className="text-3xl text-white font-medium mb-4 text-center">Let's work together</h3>
             <p className="text-gray-500 text-center mb-10">Have a project in mind? Drop a message and I'll get back to you shortly.</p>
             {data.username && <ContactForm username={data.username} />}
           </div>
        </section>

        {/* Minimal Footer inside Main */}
        {!data.hide_branding && (
          <footer className="mt-20 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-600 relative z-10">
            <p>&copy; {new Date().getFullYear()} {name}. All rights reserved.</p>
            <p>Made with Folio</p>
          </footer>
        )}

      </main>
    </div>
  );
}
