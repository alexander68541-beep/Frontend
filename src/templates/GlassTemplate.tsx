import type { PublicPortfolio } from "@/lib/publicTypes";
import { dateRange, videoEmbed, ext } from "@/lib/publicTypes";
import { fontStack } from "@/lib/fonts";
import { LinkChip } from "@/components/LinkChip";
import { ZoomImage } from "@/components/ZoomImage";
import { ContactForm } from "@/components/ContactForm";
import React, { useState } from "react";

// --- Tree Node Component (The core of OSINT style) ---
function Node({
  title,
  subtitle,
  defaultOpen = false,
  content,
  children,
  isRoot = false,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  defaultOpen?: boolean;
  content?: React.ReactNode;
  children?: React.ReactNode;
  isRoot?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const hasChildren = Boolean(content || React.Children.count(children) > 0);

  return (
    <div className="flex flex-col relative w-full">
      <div
        className={`flex items-start gap-3 py-1.5 group transition-all duration-300 ${
          hasChildren ? "cursor-pointer" : "cursor-default"
        }`}
        onClick={() => hasChildren && setIsOpen(!isOpen)}
      >
        {/* Connection Line to Left (Only if not root) */}
        {!isRoot && (
          <div className="absolute left-[-16px] top-[14px] w-[14px] h-[1px] bg-white/20 group-hover:bg-[var(--tpl-accent)] transition-colors" />
        )}

        {/* Node Icon (+ / - / •) */}
        <div
          className={`relative z-10 flex-shrink-0 mt-[4px] flex items-center justify-center w-[18px] h-[18px] rounded-sm border ${
            isRoot
              ? "border-[var(--tpl-accent)] bg-[var(--tpl-accent)] text-black"
              : "border-white/30 bg-[#0a0a0f] text-gray-400 group-hover:border-[var(--tpl-accent)] group-hover:text-[var(--tpl-accent)] group-hover:shadow-[0_0_10px_var(--tpl-accent)]"
          } text-[10px] font-mono transition-all duration-300`}
        >
          {hasChildren ? (isOpen ? "−" : "+") : "•"}
        </div>

        {/* Title & Subtitle */}
        <div className="flex flex-col pt-[2px]">
          <span
            className={`font-mono text-sm md:text-base leading-tight font-semibold tracking-tight ${
              isRoot ? "text-[var(--tpl-accent)] text-lg md:text-xl" : "text-gray-200 group-hover:text-white"
            } transition-colors`}
          >
            {title}
          </span>
          {subtitle && <span className="text-xs text-gray-500 font-sans mt-1">{subtitle}</span>}
        </div>
      </div>

      {/* Children Container */}
      {isOpen && hasChildren && (
        <div className="flex w-full animate-[fadeInDown_0.3s_ease-out]">
          {/* Vertical indent line */}
          <div className="w-[1px] bg-white/10 ml-[8px] my-1 group-hover:bg-[var(--tpl-accent)]/30 transition-colors" />
          <div className="flex-1 pl-6 py-2 flex flex-col gap-1 w-full max-w-[100%] overflow-hidden">
            {content && <div className="mb-3">{content}</div>}
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

// --- Main Template ---
export function GlassTemplate({ data }: { data: PublicPortfolio }) {
  const p = data.profile;
  const hidden = new Set(data.settings?.hidden ?? []);
  const sv = (k: string) => !hidden.has(k);
  const fontFam = fontStack(data.settings?.font);
  const name = p?.display_name || data.username || "sys.admin";
  const accentColor = data.accent || "#00ffcc"; // Default to hacker cyan/green

  return (
    <div
      className="min-h-screen bg-[#050508] text-gray-300 overflow-x-hidden font-sans pb-20 selection:bg-[var(--tpl-accent)] selection:text-black"
      style={{
        ["--tpl-accent" as string]: accentColor,
        ...(fontFam ? { fontFamily: fontFam } : {}),
      } as React.CSSProperties}
    >
      {/* Grid Background overlay for cyber vibe */}
      <div className="fixed inset-0 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />

      {/* Main Tree Container */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-12 pt-16 overflow-x-auto">
        
        {/* Terminal Header */}
        <div className="mb-10 font-mono text-xs md:text-sm text-gray-500 border-b border-white/10 pb-4">
          <p>{`> Initializing portfolio tree for user: ${data.username}`}</p>
          <p>{`> Status: Online`}</p>
          <p className="text-[var(--tpl-accent)] animate-pulse">{`> Awaiting input...`}</p>
        </div>

        {/* ROOT NODE */}
        <Node title={`[ ${name} ]`} isRoot defaultOpen>
          
          {/* PROFILE BRANCH */}
          <Node title="Profile" defaultOpen>
            <div className="p-4 md:p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm max-w-3xl flex flex-col md:flex-row gap-6 items-start">
              {p?.avatar_url && (
                <div className="flex-shrink-0 relative">
                  <div className="absolute inset-0 bg-[var(--tpl-accent)] blur-md opacity-20" />
                  <ZoomImage
                    src={p.avatar_url}
                    alt={name}
                    className="w-24 h-24 rounded-lg object-cover border border-white/20 relative z-10"
                  />
                </div>
              )}
              <div className="flex flex-col gap-2">
                {p?.title && <p className="text-[var(--tpl-accent)] font-mono text-sm">{"< " + p.title + " >"}</p>}
                {p?.tagline && <p className="text-gray-200 text-lg">{p.tagline}</p>}
                {p?.location && <p className="text-xs text-gray-500 font-mono flex items-center gap-2">📍 {p.location}</p>}
                {p?.bio && <p className="text-sm text-gray-400 mt-2 leading-relaxed whitespace-pre-wrap">{p.bio}</p>}
                
                {data.links.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {data.links.map((l) => (
                      <LinkChip key={l.id} platform={l.platform} url={l.url} label={l.label} className="text-xs" />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Node>

          {/* ABOUT BRANCH */}
          {sv("about") && p?.about && (
            <Node title="About_Me.txt">
              <div className="p-4 rounded-lg bg-black/40 border border-white/5 font-mono text-sm text-gray-400 max-w-3xl leading-relaxed whitespace-pre-wrap">
                {p.about}
              </div>
            </Node>
          )}

          {/* PROJECTS BRANCH */}
          {sv("projects") && data.projects.length > 0 && (
            <Node title="Projects" defaultOpen>
              {data.projects.map((pr) => (
                <Node key={pr.id} title={pr.title} subtitle={pr.role}>
                  <div className="max-w-2xl bg-white/5 border border-white/10 rounded-xl p-4 my-2">
                    {pr.image_url && (
                      <a href={pr.url ? ext(pr.url) : undefined} target="_blank" rel="noreferrer">
                        <img src={pr.image_url} alt={pr.title} className="w-full h-48 object-cover rounded-md mb-4 hover:opacity-80 transition-opacity" />
                      </a>
                    )}
                    {pr.description && <p className="text-sm text-gray-300 mb-4">{pr.description}</p>}
                    <div className="flex flex-wrap gap-2">
                      {pr.tags.map(t => (
                        <span key={t} className="text-[10px] uppercase font-mono px-2 py-1 bg-[var(--tpl-accent)]/10 text-[var(--tpl-accent)] border border-[var(--tpl-accent)]/20 rounded-sm">
                          {t}
                        </span>
                      ))}
                      {pr.url && (
                         <a href={ext(pr.url)} target="_blank" rel="noreferrer" className="text-[10px] uppercase font-mono px-2 py-1 bg-white/10 hover:bg-white/20 rounded-sm transition-colors">
                           Visit Link ↗
                         </a>
                      )}
                    </div>
                  </div>
                </Node>
              ))}
            </Node>
          )}

          {/* EXPERIENCE BRANCH */}
          {sv("experience") && data.experience.length > 0 && (
            <Node title="Experience">
              {data.experience.map((x) => (
                <Node key={x.id} title={x.title || x.company} subtitle={dateRange(x.start_date, x.end_date, x.is_current)}>
                  <div className="max-w-2xl text-sm font-sans mb-4">
                    <p className="text-[var(--tpl-accent)] font-medium mb-2">{[x.company, x.location].filter(Boolean).join(" · ")}</p>
                    {x.description && <p className="text-gray-400 whitespace-pre-wrap leading-relaxed">{x.description}</p>}
                  </div>
                </Node>
              ))}
            </Node>
          )}

          {/* EDUCATION BRANCH */}
          {sv("education") && data.education.length > 0 && (
            <Node title="Education">
              {data.education.map((ed) => (
                <Node key={ed.id} title={ed.school} subtitle={dateRange(ed.start_date, ed.end_date)}>
                  <div className="max-w-2xl text-sm font-sans mb-4">
                    <p className="text-white font-medium mb-1">{[ed.degree, ed.field].filter(Boolean).join(", ")}</p>
                    {ed.description && <p className="text-gray-400">{ed.description}</p>}
                  </div>
                </Node>
              ))}
            </Node>
          )}

          {/* SKILLS BRANCH */}
          {sv("skills") && data.skills.length > 0 && (
            <Node title="Skills_&_Tech">
              <div className="flex flex-wrap gap-2 max-w-2xl py-2">
                {data.skills.map((s) => (
                  <span key={s.id} className="font-mono text-xs px-3 py-1.5 bg-[#0a0a0f] border border-white/20 text-gray-300 rounded-sm hover:border-[var(--tpl-accent)] hover:text-[var(--tpl-accent)] transition-colors cursor-default">
                    {s.name}
                  </span>
                ))}
              </div>
            </Node>
          )}

          {/* SERVICES BRANCH */}
          {sv("services") && data.services.length > 0 && (
            <Node title="Services">
              {data.services.map((s) => (
                <Node key={s.id} title={s.title} subtitle={s.price}>
                  {s.description && (
                    <div className="max-w-2xl text-sm text-gray-400 mb-4 whitespace-pre-wrap p-3 bg-white/5 border-l-2 border-[var(--tpl-accent)]">
                      {s.description}
                    </div>
                  )}
                </Node>
              ))}
            </Node>
          )}

          {/* GALLERY BRANCH */}
          {sv("gallery") && data.gallery.length > 0 && (
            <Node title="Media_Gallery">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl my-2">
                {data.gallery.map((g) => (
                  <figure key={g.id} className="relative group">
                    <div className="overflow-hidden rounded-md border border-white/10">
                      <ZoomImage src={g.image_url} alt={g.caption || ""} className="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-500 opacity-70 group-hover:opacity-100" />
                    </div>
                    {g.caption && <figcaption className="text-[10px] font-mono mt-1 text-gray-500 truncate">{g.caption}</figcaption>}
                  </figure>
                ))}
              </div>
            </Node>
          )}

          {/* VIDEOS BRANCH */}
          {sv("videos") && data.videos.length > 0 && (
            <Node title="Videos">
              <div className="flex flex-col gap-4 max-w-2xl my-2">
                {data.videos.map((v) => {
                  const embed = videoEmbed(v.url);
                  return (
                    <div key={v.id} className="rounded-lg overflow-hidden border border-white/10 bg-black">
                      {embed ? (
                        <div className="aspect-video"><iframe src={embed} title={v.title || "Video"} allowFullScreen className="w-full h-full" /></div>
                      ) : (
                        <div className="p-4"><a className="text-[var(--tpl-accent)] font-mono text-sm hover:underline" href={ext(v.url)} target="_blank" rel="noreferrer">► Play {v.title || v.url}</a></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Node>
          )}

          {/* TESTIMONIALS BRANCH */}
          {sv("testimonials") && data.testimonials.length > 0 && (
            <Node title="Testimonials">
              {data.testimonials.map((t) => (
                <Node key={t.id} title={t.author} subtitle={t.role}>
                  <div className="max-w-2xl p-4 bg-white/5 border border-white/10 rounded-r-xl rounded-bl-xl mb-4 relative">
                    <p className="text-sm text-gray-300 italic mb-3">"{t.quote}"</p>
                    {t.avatar_url && <img className="w-8 h-8 rounded-full border border-gray-600" src={t.avatar_url} alt={t.author} />}
                  </div>
                </Node>
              ))}
            </Node>
          )}

          {/* CONTACT & DIRECTORY BRANCH */}
          <Node title="Contact_Directory">
            <div className="flex flex-col gap-4 max-w-xl my-2">
              {p?.availability && <p className="text-[var(--tpl-accent)] font-mono text-xs border border-[var(--tpl-accent)]/30 bg-[var(--tpl-accent)]/10 px-3 py-1 inline-block w-fit mb-2">STATUS: {p.availability}</p>}
              
              <div className="space-y-3 font-mono text-sm">
                {p?.email && <p className="flex items-center gap-3 text-gray-400"><span>[MAIL]</span> <a href={`mailto:${p.email}`} className="text-gray-200 hover:text-[var(--tpl-accent)]">{p.email}</a></p>}
                {p?.phone && <p className="flex items-center gap-3 text-gray-400"><span>[TEL ]</span> <span className="text-gray-200">{p.phone}</span></p>}
                {p?.website && <p className="flex items-center gap-3 text-gray-400"><span>[WEB ]</span> <a href={ext(p.website)} target="_blank" rel="noreferrer" className="text-[var(--tpl-accent)] hover:underline">Link ↗</a></p>}
                {p?.resume_url && <p className="flex items-center gap-3 text-gray-400 pt-2"><span>[FILE]</span> <a href={ext(p.resume_url)} target="_blank" rel="noreferrer" className="bg-white/10 text-white px-3 py-1 rounded-sm hover:bg-[var(--tpl-accent)] hover:text-black transition-colors">Download_Resume.pdf</a></p>}
              </div>

              {data.username && (
                <div className="mt-8 p-6 bg-black/50 border border-white/10 rounded-xl">
                  <p className="font-mono text-xs text-gray-500 mb-4">{`// SEND DIRECT MESSAGE TO ${data.username}`}</p>
                  <ContactForm username={data.username} />
                </div>
              )}
            </div>
          </Node>
        </Node>

        {/* Footer */}
        {!data.hide_branding && (
          <footer className="mt-20 font-mono text-xs text-gray-600 pl-4 border-l-2 border-[var(--tpl-accent)]/50">
            System generated by Folio
          </footer>
        )}
      </div>
    </div>
  );
}
