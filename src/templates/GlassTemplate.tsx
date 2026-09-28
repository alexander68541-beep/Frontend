"use client";

import type { PublicPortfolio } from "@/lib/publicTypes";
import { dateRange, videoEmbed, ext } from "@/lib/publicTypes";
import { fontStack } from "@/lib/fonts";
import { LinkChip } from "@/components/LinkChip";
import { ZoomImage } from "@/components/ZoomImage";
import { ContactForm } from "@/components/ContactForm";
import React from "react";

// --- Helper Components for 3D Tree Structure ---

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="relative flex items-center justify-start md:justify-center w-full py-16 z-20">
      {/* 3D Glass Pill Container matched with image_bbc664.png */}
      <div className="relative flex items-center w-[85%] md:w-auto md:min-w-[300px] md:justify-center px-4 md:px-10 py-3 md:rounded-full rounded-r-full border border-white/10 bg-gradient-to-b from-white/5 to-transparent backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.5)] group overflow-hidden">
        
        {/* Subtle inner highlight for 3D edge */}
        <div className="absolute inset-0 rounded-full border border-white/5 pointer-events-none" />

        {/* The Glowing Ring on the Trunk (Left on mobile, Center on desktop) */}
        <div className="absolute left-6 md:left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-7 h-7 md:w-10 md:h-10 rounded-full border-4 border-indigo-500 bg-[#050508]/50 shadow-[0_0_25px_10px_rgba(99,102,241,0.6)] group-hover:border-indigo-400 group-hover:shadow-[0_0_35px_15px_rgba(99,102,241,0.8)] transition-all duration-500 z-0" />
        
        {/* Title Text overlapping the ring */}
        <h2 className="relative z-10 text-2xl md:text-3xl font-extrabold tracking-widest text-white pl-12 md:pl-0 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
          {title}
        </h2>
      </div>
    </div>
  );
}

function BranchNode({ idx, children }: { idx: number; children: React.ReactNode }) {
  const isLeft = idx % 2 === 0;
  return (
    <div className="relative w-full mb-16 group z-10">
      {/* Connecting Dot */}
      <div className="absolute left-6 md:left-1/2 top-10 w-4 h-4 rounded-full border-2 border-indigo-500 bg-[#0a0a0f] transform -translate-x-1/2 group-hover:bg-indigo-400 group-hover:shadow-[0_0_20px_rgba(99,102,241,1)] transition-all duration-500 z-20" />
      
      {/* 3D Glowing Horizontal Branch (Desktop) */}
      <div className={`hidden md:block absolute top-[46px] h-[2px] bg-gradient-to-r group-hover:h-[3px] transition-all duration-500 z-10 ${isLeft ? 'right-[50%] w-16 from-transparent to-indigo-500/50 group-hover:to-indigo-400/80 mr-2' : 'left-[50%] w-16 from-indigo-500/50 to-transparent group-hover:from-indigo-400/80 ml-2'}`} />
      
      {/* Horizontal Branch (Mobile) */}
      <div className="md:hidden absolute top-[46px] left-8 w-8 h-[2px] bg-gradient-to-r from-indigo-500/50 to-transparent group-hover:from-indigo-400/80 transition-colors duration-500 z-10" />

      {/* Content Layout with 3D Card Effect */}
      <div className={`flex flex-col md:flex-row w-full perspective-1000 ${isLeft ? 'md:flex-row-reverse' : ''}`}>
        <div className="hidden md:block md:w-1/2" />
        
        <div className={`w-full pl-16 pr-4 md:w-1/2 ${isLeft ? 'md:pr-16 md:pl-4 md:text-right' : 'md:pl-16 md:pr-4 md:text-left'}`}>
          {/* 3D Glass Card wrapper */}
          <div className="relative p-[1px] rounded-3xl bg-gradient-to-br from-white/20 via-white/5 to-transparent transform transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.7)] group-hover:shadow-[0_30px_60px_-15px_rgba(99,102,241,0.3)] z-10">
            <div className="h-full w-full p-6 md:p-8 rounded-[23px] bg-[#0A0A0F]/90 backdrop-blur-xl relative overflow-hidden">
               {/* Shine effect on hover */}
               <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
               <div className="relative z-10">
                 {children}
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CenterNode({ children, iconColor = "purple" }: { children: React.ReactNode, iconColor?: string }) {
  const borderColor = iconColor === "purple" ? "border-purple-500" : "border-indigo-500";
  const shadowColor = iconColor === "purple" ? "shadow-[0_0_20px_rgba(168,85,247,0.7)] group-hover:shadow-[0_0_30px_rgba(168,85,247,1)]" : "shadow-[0_0_20px_rgba(99,102,241,0.7)] group-hover:shadow-[0_0_30px_rgba(99,102,241,1)]";

  return (
    <div className="relative w-full mb-20 z-10 flex flex-col items-center group">
       {/* Center Dot Node */}
       <div className={`absolute left-6 md:left-1/2 top-8 w-5 h-5 bg-[#0a0a0f] border-[3px] ${borderColor} rounded-full transform -translate-x-1/2 z-20 transition-all duration-500 ${shadowColor}`} />
       
       <div className="w-full pl-16 pr-4 md:pl-4 md:px-12 max-w-4xl">
          <div className="relative p-[1px] mt-2 md:mt-16 rounded-3xl bg-gradient-to-b from-white/20 via-white/5 to-transparent transform transition-all duration-500 hover:-translate-y-2 shadow-[0_20px_50px_rgba(0,0,0,0.8)] group-hover:shadow-[0_30px_60px_-15px_rgba(99,102,241,0.25)] z-10">
            <div className="p-8 md:p-12 rounded-[23px] bg-[#0A0A0F]/80 backdrop-blur-2xl relative overflow-hidden">
               {/* 3D Inner Glow & Vignette */}
               <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent pointer-events-none" />
               <div className="relative z-10">
                 {children}
               </div>
            </div>
          </div>
       </div>
    </div>
  )
}

// --- Main Template Component ---

export function GlassTemplate({ data }: { data: PublicPortfolio }) {
  const p = data.profile;
  const hidden = new Set(data.settings?.hidden ?? []);
  const sv = (k: string) => !hidden.has(k);
  const fontFam = fontStack(data.settings?.font);
  const name = p?.display_name || data.username || "Untitled";
  const accentColor = data.accent || "#7c6cff";

  return (
    <div
      className="relative min-h-screen bg-[#050508] text-gray-200 overflow-hidden selection:bg-indigo-500/30 font-sans pb-20 perspective-1000"
      style={{
        ["--tpl-accent" as string]: accentColor,
        ...(fontFam ? { fontFamily: fontFam } : {}),
      } as React.CSSProperties}
    >
      {/* 3D Hexagonal / Isometric Grid Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [transform:rotateX(60deg)_translateY(-100px)_scale(2.5)] origin-top opacity-30" />
        <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-indigo-600/10 blur-[150px] animate-[pulse_10s_ease-in-out_infinite]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-purple-600/10 blur-[150px] animate-[pulse_12s_ease-in-out_infinite_reverse]" />
      </div>

      {/* --- HERO ROOT --- */}
      <header className="relative z-20 max-w-4xl mx-auto px-6 pt-32 pb-20 flex flex-col items-center text-center animate-[fadeIn_1s_ease-out]">
        {p?.avatar_url && (
          <div className="relative z-20 p-2 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-[#0a0a0f] shadow-[0_20px_50px_rgba(99,102,241,0.5)] mb-8 transform hover:scale-105 hover:-translate-y-2 transition-all duration-500">
            <div className="p-1 bg-[#050508] rounded-full">
              <ZoomImage
                className="w-36 h-36 md:w-52 md:h-52 rounded-full object-cover"
                src={p.avatar_url}
                alt={name}
              />
            </div>
          </div>
        )}
        
        <div className="space-y-4 z-20 relative">
          <div className="absolute inset-0 bg-white/5 blur-3xl rounded-full -z-10" />
          {p?.title && (
            <p className="inline-block px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 font-bold tracking-widest uppercase text-xs backdrop-blur-md shadow-[0_0_15px_rgba(99,102,241,0.3)] mb-4">
              {p.title} {p?.pronouns ? ` \u00b7 ${p.pronouns}` : ""}
            </p>
          )}
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white via-gray-200 to-gray-600 drop-shadow-2xl">
            {name}
          </h1>
          {p?.tagline && <p className="text-xl md:text-2xl text-gray-400 font-medium max-w-2xl mx-auto mt-4">{p.tagline}</p>}
          
          {(p?.location || p?.bio) && (
            <div className="max-w-xl mx-auto space-y-4 pt-6">
              {p?.location && (
                <p className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300 shadow-inner">
                  <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  {p.location}
                </p>
              )}
              {p?.bio && <p className="text-gray-400 leading-relaxed text-sm md:text-base bg-[#0A0A0F]/60 p-4 rounded-2xl border border-white/5">{p.bio}</p>}
            </div>
          )}

          {data.links.length > 0 && (
            <div className="flex flex-wrap justify-center gap-4 pt-8">
              {data.links.map((l) => (
                <div key={l.id} className="relative group/chip transform hover:-translate-y-1 transition-transform">
                  <div className="absolute inset-0 bg-indigo-500/50 blur-md opacity-0 group-hover/chip:opacity-100 transition-opacity rounded-full" />
                  <LinkChip className="relative z-10 bg-white/5 border-white/20" platform={l.platform} url={l.url} label={l.label} />
                </div>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* --- 3D TREE STRUCTURE CONTAINER --- */}
      <div className="relative max-w-6xl mx-auto w-full z-10 mt-10">
        {/* The Central Glowing Trunk */}
        <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-indigo-500 via-purple-500 to-transparent transform -translate-x-1/2 z-0 shadow-[0_0_20px_rgba(99,102,241,0.8)]" />

        {/* About */}
        {sv("about") && p?.about && (
          <div className="mt-8">
            <SectionHeader title="About" />
            <CenterNode iconColor="indigo">
              <p className="text-lg md:text-xl text-gray-300 leading-relaxed whitespace-pre-wrap md:text-center text-left font-light">{p.about}</p>
            </CenterNode>
          </div>
        )}

        {/* Projects */}
        {sv("projects") && data.projects.length > 0 && (
          <div>
            <SectionHeader title="Selected Work" />
            {data.projects.map((pr, idx) => (
              <BranchNode key={pr.id} idx={idx}>
                <a
                  href={pr.url ? ext(pr.url) : undefined}
                  target={pr.url ? "_blank" : undefined}
                  rel="noreferrer"
                  className="block group/link"
                >
                  {pr.image_url && (
                    <div className="w-full h-64 rounded-xl overflow-hidden mb-6 border border-white/10 relative shadow-inner">
                      <div className="absolute inset-0 bg-indigo-500/20 mix-blend-overlay opacity-0 group-hover/link:opacity-100 transition-opacity z-10" />
                      <img src={pr.image_url} alt={pr.title} className="w-full h-full object-cover group-hover/link:scale-110 transition-transform duration-700 ease-out" />
                    </div>
                  )}
                  <h3 className="text-3xl font-extrabold mb-2 text-white group-hover/link:text-indigo-400 transition-colors drop-shadow-md">{pr.title}</h3>
                  {pr.role && <p className="text-sm font-bold tracking-wider uppercase text-purple-400 mb-4">{pr.role}</p>}
                  {pr.description && <p className="text-gray-400 mb-6 text-sm md:text-base leading-relaxed">{pr.description}</p>}
                  {pr.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {pr.tags.map((t) => (
                        <span key={t} className="inline-block text-xs font-semibold px-3 py-1.5 rounded-md bg-white/5 text-gray-300 border border-white/10 shadow-sm">{t}</span>
                      ))}
                    </div>
                  )}
                </a>
              </BranchNode>
            ))}
          </div>
        )}

        {/* Experience */}
        {sv("experience") && data.experience.length > 0 && (
          <div>
            <SectionHeader title="Experience" />
            {data.experience.map((x, idx) => (
              <BranchNode key={x.id} idx={idx}>
                <h3 className="text-2xl font-bold text-white drop-shadow-sm">{x.title || x.company}</h3>
                <p className="font-semibold tracking-wide text-indigo-300 my-2 uppercase text-sm">
                  {[x.company, x.location].filter(Boolean).join(" · ")}
                </p>
                <div className="mb-5">
                  <span className="inline-block bg-indigo-500/10 border border-indigo-500/30 px-4 py-1.5 rounded-full text-xs font-bold text-indigo-200 shadow-inner">
                    {dateRange(x.start_date, x.end_date, x.is_current)}
                  </span>
                </div>
                {x.description && <p className="text-gray-400 leading-relaxed text-sm">{x.description}</p>}
              </BranchNode>
            ))}
          </div>
        )}

        {/* Education */}
        {sv("education") && data.education.length > 0 && (
          <div>
            <SectionHeader title="Education" />
            {data.education.map((ed, idx) => (
              <BranchNode key={ed.id} idx={idx}>
                <h3 className="text-2xl font-bold text-white drop-shadow-sm">{ed.school}</h3>
                <p className="text-purple-400 font-semibold tracking-wide text-sm mt-2 mb-3">
                  {[ed.degree, ed.field].filter(Boolean).join(", ")}
                </p>
                <div className="mb-4">
                  <span className="inline-block bg-white/5 border border-white/10 px-3 py-1 rounded-md text-xs font-bold text-gray-400">
                    {dateRange(ed.start_date, ed.end_date)}
                  </span>
                </div>
                {ed.description && <p className="text-sm text-gray-400 leading-relaxed">{ed.description}</p>}
              </BranchNode>
            ))}
          </div>
        )}

        {/* Skills */}
        {sv("skills") && data.skills.length > 0 && (
          <div>
            <SectionHeader title="Expertise" />
            <CenterNode iconColor="indigo">
              <div className="flex flex-wrap justify-center gap-4">
                {data.skills.map((s) => (
                  <span key={s.id} className="relative group/skill px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-200 shadow-lg hover:scale-110 hover:-translate-y-1 transition-all cursor-default font-bold overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 opacity-0 group-hover/skill:opacity-100 transition-opacity" />
                    <span className="relative z-10 group-hover/skill:text-white group-hover/skill:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">{s.name}</span>
                  </span>
                ))}
              </div>
            </CenterNode>
          </div>
        )}

        {/* Services */}
        {sv("services") && data.services.length > 0 && (
          <div>
            <SectionHeader title="Services" />
            {data.services.map((s, idx) => (
              <BranchNode key={s.id} idx={idx}>
                <div className="flex flex-col gap-3">
                  <h3 className="text-2xl font-bold text-white drop-shadow-sm">{s.title}</h3>
                  {s.price && <span className="inline-block self-start text-indigo-200 text-xs font-black tracking-wider bg-indigo-600/30 border border-indigo-500/50 px-4 py-1.5 rounded-md shadow-inner">{s.price}</span>}
                </div>
                {s.description && <p className="text-sm md:text-base text-gray-400 mt-5 leading-relaxed">{s.description}</p>}
              </BranchNode>
            ))}
          </div>
        )}

        {/* Gallery */}
        {sv("gallery") && data.gallery.length > 0 && (
          <div>
            <SectionHeader title="Visuals" />
            <CenterNode iconColor="purple">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {data.gallery.map((g) => (
                  <figure key={g.id} className="relative group overflow-hidden rounded-2xl bg-[#0a0a0f] border border-white/10 shadow-[0_10px_20px_rgba(0,0,0,0.5)] transform transition-transform duration-500 hover:scale-[1.03] hover:-translate-y-1">
                    <ZoomImage src={g.image_url} alt={g.caption || ""} className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100" />
                    {g.caption && (
                      <figcaption className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black via-black/80 to-transparent text-sm font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center translate-y-4 group-hover:translate-y-0">
                        {g.caption}
                      </figcaption>
                    )}
                  </figure>
                ))}
              </div>
            </CenterNode>
          </div>
        )}

        {/* Testimonials matched exactly with image_bbc664.png styling */}
        {sv("testimonials") && data.testimonials.length > 0 && (
          <div>
            <SectionHeader title="Kind Words" />
            {data.testimonials.map((t, idx) => (
              <BranchNode key={t.id} idx={idx}>
                <div className="relative">
                  <svg className="absolute -top-6 -left-6 w-12 h-12 text-indigo-500/20 transform -rotate-12 drop-shadow-md" fill="currentColor" viewBox="0 0 32 32"><path d="M10 8c-3.3 0-6 2.7-6 6v10h10V14H8c0-2.2 1.8-4 4-4V8zm14 0c-3.3 0-6 2.7-6 6v10h10V14h-6c0-2.2 1.8-4 4-4V8z"/></svg>
                  <p className="text-gray-300 italic relative z-10 mb-8 text-lg leading-relaxed font-light">"{t.quote}"</p>
                  <div className={`flex items-center gap-5 ${idx % 2 === 0 ? 'md:flex-row-reverse md:text-left' : ''}`}>
                    {t.avatar_url && (
                       <div className="relative p-1 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg">
                         <img className="w-14 h-14 rounded-full object-cover border-2 border-[#0A0A0F]" src={t.avatar_url} alt={t.author} />
                       </div>
                    )}
                    <div>
                      <p className="font-extrabold text-white text-lg tracking-wide">{t.author}</p>
                      {t.role && <p className="text-xs text-indigo-400 font-bold uppercase tracking-widest mt-1">{t.role}</p>}
                    </div>
                  </div>
                </div>
              </BranchNode>
            ))}
          </div>
        )}

        {/* Contact Roots */}
        <div className="mt-24">
          <SectionHeader title="Connect" />
          <CenterNode iconColor="indigo">
            <div className="flex flex-col items-center text-center">
              {p?.availability && <p className="text-indigo-300 font-bold tracking-widest uppercase mb-10 bg-indigo-500/10 px-8 py-3 rounded-full shadow-[inset_0_0_20px_rgba(99,102,241,0.2)] border border-indigo-500/30 animate-pulse">{p.availability}</p>}
              
              <div className="flex flex-wrap justify-center gap-6 mb-16">
                {p?.email && (
                  <a href={`mailto:${p.email}`} className="group relative flex items-center gap-3 text-sm md:text-base text-white font-bold bg-white/5 px-8 py-4 rounded-2xl border border-white/10 hover:-translate-y-2 hover:shadow-[0_15px_30px_rgba(99,102,241,0.3)] transition-all overflow-hidden">
                    <div className="absolute inset-0 bg-indigo-500/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    <svg className="w-5 h-5 text-indigo-400 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    <span className="relative z-10">Email Me</span>
                  </a>
                )}
                {p?.website && (
                  <a href={ext(p.website)} target="_blank" rel="noreferrer" className="group relative flex items-center gap-3 text-sm md:text-base text-white font-bold bg-white/5 px-8 py-4 rounded-2xl border border-white/10 hover:-translate-y-2 hover:shadow-[0_15px_30px_rgba(168,85,247,0.3)] transition-all overflow-hidden">
                    <div className="absolute inset-0 bg-purple-500/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    <svg className="w-5 h-5 text-purple-400 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                    <span className="relative z-10">Visit Website</span>
                  </a>
                )}
                {p?.resume_url && (
                  <a href={ext(p.resume_url)} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm md:text-base text-black bg-gradient-to-r from-gray-100 to-white hover:from-white hover:to-white font-extrabold transition-all px-8 py-4 rounded-2xl shadow-[0_10px_30px_rgba(255,255,255,0.2)] hover:shadow-[0_15px_40px_rgba(255,255,255,0.4)] hover:-translate-y-2">
                    Download Résumé
                  </a>
                )}
              </div>

              {data.username && (
                <div className="w-full max-w-xl mx-auto text-left relative z-10 bg-[#0A0A0F]/50 p-8 rounded-3xl border border-white/5 shadow-2xl backdrop-blur-xl">
                  <h3 className="text-2xl font-extrabold mb-8 text-center text-white drop-shadow-md">Send a Message</h3>
                  <ContactForm username={data.username} />
                </div>
              )}
            </div>
          </CenterNode>
        </div>

      </div>

      {/* Footer */}
      {!data.hide_branding && (
        <footer className="relative z-20 text-center text-gray-500 font-medium text-sm pb-10 pt-16">
          Crafted with precision &middot; Folio
        </footer>
      )}
    </div>
  );
}
