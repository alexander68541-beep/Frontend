"use client";

import type { PublicPortfolio } from "@/lib/publicTypes";
import { dateRange, videoEmbed, ext } from "@/lib/publicTypes";
import { fontStack } from "@/lib/fonts";
import { LinkChip } from "@/components/LinkChip";
import { ZoomImage } from "@/components/ZoomImage";
import { ContactForm } from "@/components/ContactForm";
import React from "react";

// --- Helper Components for Tree Structure ---

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="relative flex items-center justify-start md:justify-center w-full py-12 my-4 z-20">
      {/* Glowing Node on the Trunk */}
      <div className="absolute left-6 md:left-1/2 w-6 h-6 rounded-full border-4 border-indigo-500 bg-[#0a0a0f] transform -translate-x-1/2 shadow-[0_0_20px_rgba(99,102,241,0.8)] z-20" />
      
      {/* Title with solid background to mask the trunk line on desktop */}
      <div className="pl-16 md:pl-0 z-20 relative flex justify-center">
        <h2 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-100 to-gray-400 md:bg-[#0a0a0f] md:px-8 py-2 rounded-full inline-block border-y border-transparent md:border-white/5 shadow-2xl md:shadow-none">
          {title}
        </h2>
      </div>
    </div>
  );
}

function BranchNode({ idx, children }: { idx: number; children: React.ReactNode }) {
  const isLeft = idx % 2 === 0;
  return (
    <div className="relative w-full mb-12 group z-10">
      {/* The Dot Node on Trunk */}
      <div className="absolute left-6 md:left-1/2 top-8 w-4 h-4 bg-[#0a0a0f] border-2 border-indigo-500 rounded-full transform -translate-x-1/2 group-hover:bg-indigo-400 group-hover:shadow-[0_0_15px_rgba(99,102,241,0.9)] transition-all duration-300 z-20" />
      
      {/* Horizontal Connecting Branch (Desktop) */}
      <div className={`hidden md:block absolute top-[38px] w-8 h-[2px] bg-indigo-500/30 group-hover:bg-indigo-400/80 transition-colors duration-300 z-10 ${isLeft ? 'right-[50%] mr-2' : 'left-[50%] ml-2'}`} />
      
      {/* Horizontal Connecting Branch (Mobile) */}
      <div className="md:hidden absolute top-[38px] left-8 w-6 h-[2px] bg-indigo-500/30 group-hover:bg-indigo-400/80 transition-colors duration-300 z-10" />

      {/* Content Layout */}
      <div className={`flex flex-col md:flex-row w-full ${isLeft ? 'md:flex-row-reverse' : ''}`}>
        <div className="hidden md:block md:w-1/2" />
        <div className={`w-full pl-16 pr-4 md:w-1/2 ${isLeft ? 'md:pr-12 md:pl-4 md:text-right' : 'md:pl-12 md:pr-4 md:text-left'}`}>
          <div className="p-6 md:p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md shadow-lg transition-all duration-300 group-hover:-translate-y-1 group-hover:bg-white/10 group-hover:shadow-[0_15px_30px_-10px_rgba(99,102,241,0.25)]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function CenterNode({ children, iconColor = "purple" }: { children: React.ReactNode, iconColor?: string }) {
  const borderColor = iconColor === "purple" ? "border-purple-500" : "border-indigo-500";
  const shadowColor = iconColor === "purple" ? "shadow-[0_0_15px_rgba(168,85,247,0.5)]" : "shadow-[0_0_15px_rgba(99,102,241,0.5)]";

  return (
    <div className="relative w-full mb-16 z-10 flex flex-col items-center">
       {/* Center Dot Node */}
       <div className={`absolute left-6 md:left-1/2 top-8 w-4 h-4 bg-[#0a0a0f] border-2 ${borderColor} rounded-full transform -translate-x-1/2 z-20 ${shadowColor}`} />
       
       <div className="w-full pl-16 pr-4 md:pl-4 md:px-12 max-w-4xl">
          <div className="p-8 md:p-10 mt-2 md:mt-12 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl relative overflow-hidden">
             {/* Subtle Inner Glow */}
             <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
             <div className="relative z-10">
               {children}
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
      className="relative min-h-screen bg-[#050508] text-gray-200 overflow-hidden selection:bg-indigo-500/30 font-sans pb-20"
      style={{
        ["--tpl-accent" as string]: accentColor,
        ...(fontFam ? { fontFamily: fontFam } : {}),
      } as React.CSSProperties}
    >
      {/* Animated Ambient Background for Wow Factor */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-600/10 blur-[120px] animate-[pulse_8s_ease-in-out_infinite]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-purple-600/10 blur-[120px] animate-[pulse_10s_ease-in-out_infinite_reverse]" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] mix-blend-overlay"></div>
      </div>

      {/* --- HERO ROOT --- */}
      <header className="relative z-20 max-w-4xl mx-auto px-6 pt-24 pb-12 flex flex-col items-center text-center animate-[fadeIn_1s_ease-out]">
        {p?.avatar_url && (
          <div className="relative z-20 p-2 rounded-full bg-[#0a0a0f] border-2 border-indigo-500/50 shadow-[0_0_40px_rgba(99,102,241,0.4)] mb-6 hover:scale-105 transition-transform duration-500">
            <ZoomImage
              className="w-32 h-32 md:w-48 md:h-48 rounded-full object-cover border-4 border-[#050508]"
              src={p.avatar_url}
              alt={name}
            />
          </div>
        )}
        
        <div className="space-y-4 z-20 bg-[#050508]/60 backdrop-blur-md p-6 rounded-3xl border border-white/5">
          {p?.title && (
            <p className="text-indigo-400 font-bold tracking-widest uppercase text-sm">
              {p.title} {p?.pronouns ? ` \u00b7 ${p.pronouns}` : ""}
            </p>
          )}
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white via-gray-200 to-gray-500">
            {name}
          </h1>
          {p?.tagline && <p className="text-xl md:text-2xl text-gray-400 font-light max-w-2xl mx-auto">{p.tagline}</p>}
          
          {(p?.location || p?.bio) && (
            <div className="max-w-xl mx-auto space-y-4 pt-4">
              {p?.location && (
                <p className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  {p.location}
                </p>
              )}
              {p?.bio && <p className="text-gray-400 leading-relaxed text-sm md:text-base">{p.bio}</p>}
            </div>
          )}

          {data.links.length > 0 && (
            <div className="flex flex-wrap justify-center gap-3 pt-6">
              {data.links.map((l) => (
                <LinkChip key={l.id} className="hover:scale-110 transition-transform duration-300 shadow-lg" platform={l.platform} url={l.url} label={l.label} />
              ))}
            </div>
          )}
        </div>
      </header>

      {/* --- TREE STRUCTURE CONTAINER --- */}
      <div className="relative max-w-6xl mx-auto w-full z-10">
        {/* The Central Glowing Trunk */}
        <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-indigo-500/80 via-purple-500/40 to-transparent transform -translate-x-1/2 z-0 shadow-[0_0_15px_rgba(99,102,241,0.6)]" />

        {/* About */}
        {sv("about") && p?.about && (
          <div className="mt-8">
            <SectionHeader title="About" />
            <CenterNode iconColor="indigo">
              <p className="text-lg text-gray-300 leading-relaxed whitespace-pre-wrap md:text-center text-left">{p.about}</p>
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
                    <div className="w-full h-56 rounded-xl overflow-hidden mb-5 border border-white/5">
                      <img src={pr.image_url} alt={pr.title} className="w-full h-full object-cover group-hover/link:scale-105 transition-transform duration-700 ease-in-out" />
                    </div>
                  )}
                  <h3 className="text-2xl font-bold mb-2 group-hover/link:text-indigo-400 transition-colors">{pr.title}</h3>
                  {pr.role && <p className="text-sm font-medium text-purple-400 mb-3">{pr.role}</p>}
                  {pr.description && <p className="text-gray-400 mb-5 text-sm leading-relaxed">{pr.description}</p>}
                  {pr.tags.length > 0 && (
                    <div className="mt-2">
                      {pr.tags.map((t) => (
                        <span key={t} className="inline-block mr-2 mb-2 text-xs px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-200 border border-indigo-500/20">{t}</span>
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
            <SectionHeader title="Experience Timeline" />
            {data.experience.map((x, idx) => (
              <BranchNode key={x.id} idx={idx}>
                <h3 className="text-xl font-bold text-gray-100">{x.title || x.company}</h3>
                <p className="font-medium text-indigo-300 my-2">
                  {[x.company, x.location].filter(Boolean).join(" · ")}
                </p>
                <div className="mb-4">
                  <span className="inline-block bg-white/10 px-3 py-1.5 rounded-full text-xs font-semibold text-gray-300 shadow-sm border border-white/5">
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
                <h3 className="text-xl font-bold text-gray-100">{ed.school}</h3>
                <p className="text-purple-400 font-medium text-sm mt-1 mb-2">
                  {[ed.degree, ed.field].filter(Boolean).join(", ")}
                </p>
                <p className="text-xs text-gray-500 mb-3">{dateRange(ed.start_date, ed.end_date)}</p>
                {ed.description && <p className="text-sm text-gray-400">{ed.description}</p>}
              </BranchNode>
            ))}
          </div>
        )}

        {/* Skills (Central Cluster) */}
        {sv("skills") && data.skills.length > 0 && (
          <div>
            <SectionHeader title="Tech Tree & Skills" />
            <CenterNode iconColor="indigo">
              <div className="flex flex-wrap justify-center gap-3 md:gap-4">
                {data.skills.map((s) => (
                  <span key={s.id} className="px-5 py-2.5 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-white/10 text-gray-200 shadow-sm hover:scale-110 hover:border-indigo-500/50 hover:text-white transition-all cursor-default font-medium">
                    {s.name}
                  </span>
                ))}
              </div>
            </CenterNode>
          </div>
        )}

        {/* Services */}
        {sv("services") && data.services.length > 0 && (
          <div>
            <SectionHeader title="Services Offered" />
            {data.services.map((s, idx) => (
              <BranchNode key={s.id} idx={idx}>
                <div className="flex flex-col gap-2">
                  <h3 className="text-xl font-bold">{s.title}</h3>
                  {s.price && <span className="inline-block self-start text-indigo-300 text-xs font-bold bg-indigo-500/20 px-3 py-1 rounded-full">{s.price}</span>}
                </div>
                {s.description && <p className="text-sm text-gray-400 mt-4 leading-relaxed">{s.description}</p>}
              </BranchNode>
            ))}
          </div>
        )}

        {/* Gallery (Central Grid) */}
        {sv("gallery") && data.gallery.length > 0 && (
          <div>
            <SectionHeader title="Visual Gallery" />
            <CenterNode iconColor="purple">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {data.gallery.map((g) => (
                  <figure key={g.id} className="relative group overflow-hidden rounded-2xl bg-[#0a0a0f] border border-white/5">
                    <ZoomImage src={g.image_url} alt={g.caption || ""} className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100" />
                    {g.caption && (
                      <figcaption className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/90 to-transparent text-xs font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center">
                        {g.caption}
                      </figcaption>
                    )}
                  </figure>
                ))}
              </div>
            </CenterNode>
          </div>
        )}

        {/* Testimonials */}
        {sv("testimonials") && data.testimonials.length > 0 && (
          <div>
            <SectionHeader title="Kind Words" />
            {data.testimonials.map((t, idx) => (
              <BranchNode key={t.id} idx={idx}>
                <div className="relative">
                  <svg className="absolute -top-4 -left-4 w-10 h-10 text-indigo-500/20" fill="currentColor" viewBox="0 0 32 32"><path d="M10 8c-3.3 0-6 2.7-6 6v10h10V14H8c0-2.2 1.8-4 4-4V8zm14 0c-3.3 0-6 2.7-6 6v10h10V14h-6c0-2.2 1.8-4 4-4V8z"/></svg>
                  <p className="text-gray-300 italic relative z-10 mb-6 text-sm md:text-base leading-relaxed">"{t.quote}"</p>
                  <div className={`flex items-center gap-4 ${idx % 2 === 0 ? 'md:flex-row-reverse md:text-left' : ''}`}>
                    {t.avatar_url && <img className="w-12 h-12 rounded-full object-cover border-2 border-indigo-500/50 shadow-lg" src={t.avatar_url} alt={t.author} />}
                    <div>
                      <p className="font-bold text-gray-100">{t.author}</p>
                      {t.role && <p className="text-xs text-indigo-400 font-medium">{t.role}</p>}
                    </div>
                  </div>
                </div>
              </BranchNode>
            ))}
          </div>
        )}

        {/* Contact Roots */}
        <div className="mt-16">
          <SectionHeader title="Get In Touch" />
          <CenterNode iconColor="indigo">
            <div className="flex flex-col items-center text-center">
              {p?.availability && <p className="text-indigo-400 font-semibold mb-8 bg-indigo-500/10 px-6 py-2 rounded-full shadow-inner border border-indigo-500/20">{p.availability}</p>}
              
              <div className="flex flex-wrap justify-center gap-6 mb-12">
                {p?.email && (
                  <a href={`mailto:${p.email}`} className="flex items-center gap-3 text-sm md:text-base text-gray-300 hover:text-white transition-colors bg-white/5 px-6 py-3 rounded-2xl hover:bg-indigo-500/20 border border-white/5">
                    <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    Email Me
                  </a>
                )}
                {p?.website && (
                  <a href={ext(p.website)} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm md:text-base text-gray-300 hover:text-white transition-colors bg-white/5 px-6 py-3 rounded-2xl hover:bg-purple-500/20 border border-white/5">
                    <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                    Visit Website
                  </a>
                )}
                {p?.resume_url && (
                  <a href={ext(p.resume_url)} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm md:text-base text-[#0a0a0f] bg-gray-100 hover:bg-white font-bold transition-colors px-6 py-3 rounded-2xl shadow-xl hover:shadow-indigo-500/20">
                    Download Résumé
                  </a>
                )}
              </div>

              {data.username && (
                <div className="w-full max-w-lg mx-auto text-left">
                  <h3 className="text-xl font-bold mb-6 text-center text-gray-200">Send a direct message</h3>
                  <ContactForm username={data.username} />
                </div>
              )}
            </div>
          </CenterNode>
        </div>

      </div>

      {/* Footer */}
      {!data.hide_branding && (
        <footer className="relative z-20 text-center text-gray-600 text-sm pb-10 pt-10">
          Crafted with precision &middot; Folio
        </footer>
      )}
    </div>
  );
}
