import type { PublicPortfolio } from "@/lib/publicTypes";
import { dateRange, videoEmbed, ext } from "@/lib/publicTypes";
import { fontStack } from "@/lib/fonts";
import { LinkChip } from "@/components/LinkChip";
import { ZoomImage } from "@/components/ZoomImage";
import { ContactForm } from "@/components/ContactForm";

export function GlassTemplate({ data }: { data: PublicPortfolio }) {
  const p = data.profile;
  const hidden = new Set(data.settings?.hidden ?? []);
  const sv = (k: string) => !hidden.has(k);
  const fontFam = fontStack(data.settings?.font);
  const name = p?.display_name || data.username || "Untitled";
  const accentColor = data.accent || "#7c6cff";

  return (
    <div
      className="relative min-h-screen bg-[#0a0a0f] text-gray-200 overflow-hidden selection:bg-indigo-500/30 font-sans"
      style={{
        ["--tpl-accent" as string]: accentColor,
        ...(fontFam ? { fontFamily: fontFam } : {}),
      } as React.CSSProperties}
    >
      {/* Animated Ambient Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-600/10 blur-[120px] animate-[pulse_8s_ease-in-out_infinite]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-purple-600/10 blur-[120px] animate-[pulse_10s_ease-in-out_infinite_reverse]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 flex flex-col gap-32">
        {/* Hero Section */}
        <header className="flex flex-col items-center text-center space-y-6 animate-[fadeIn_1s_ease-out]">
          {p?.avatar_url && (
            <div className="relative p-1 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-2xl shadow-purple-500/20 hover:scale-105 transition-transform duration-500">
              <ZoomImage
                className="w-40 h-40 rounded-full object-cover border-4 border-[#0a0a0f]"
                src={p.avatar_url}
                alt={name}
              />
            </div>
          )}
          
          <div className="space-y-2">
            {p?.title && (
              <p className="text-indigo-400 font-medium tracking-widest uppercase text-sm mb-2">
                {p.title} {p?.pronouns ? ` \u00b7 ${p.pronouns}` : ""}
              </p>
            )}
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-100 via-white to-gray-400">
              {name}
            </h1>
            {p?.tagline && <p className="text-xl md:text-2xl text-gray-400 font-light mt-4">{p.tagline}</p>}
          </div>

          {(p?.location || p?.bio) && (
            <div className="max-w-2xl mx-auto space-y-4">
              {p?.location && (
                <p className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  {p.location}
                </p>
              )}
              {p?.bio && <p className="text-gray-400 leading-relaxed">{p.bio}</p>}
            </div>
          )}

          {data.links.length > 0 && (
            <div className="flex flex-wrap justify-center gap-3 pt-6">
              {data.links.map((l) => (
                <LinkChip key={l.id} className="hover:scale-110 transition-transform duration-300" platform={l.platform} url={l.url} label={l.label} />
              ))}
            </div>
          )}
        </header>

        {/* About Section */}
        {sv("about") && p?.about && (
          <section className="scroll-mt-20">
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-4">
              <span className="w-8 h-[2px] bg-indigo-500"></span> About Me
            </h2>
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md shadow-xl hover:bg-white/[0.07] transition-colors duration-500">
              <p className="text-lg text-gray-300 leading-relaxed whitespace-pre-wrap">{p.about}</p>
            </div>
          </section>
        )}

        {/* Selected Work (Projects) */}
        {sv("projects") && data.projects.length > 0 && (
          <section>
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-4">
              <span className="w-8 h-[2px] bg-indigo-500"></span> Selected Work
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {data.projects.map((pr) => (
                <a
                  key={pr.id}
                  href={pr.url ? ext(pr.url) : undefined}
                  target={pr.url ? "_blank" : undefined}
                  rel="noreferrer"
                  className="group flex flex-col bg-white/5 border border-white/10 rounded-3xl overflow-hidden hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(99,102,241,0.2)] transition-all duration-500"
                >
                  {pr.image_url && (
                    <div className="w-full h-64 overflow-hidden">
                      <img src={pr.image_url} alt={pr.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out" />
                    </div>
                  )}
                  <div className="p-8 flex flex-col flex-grow">
                    <h3 className="text-2xl font-semibold mb-2 group-hover:text-indigo-400 transition-colors">{pr.title}</h3>
                    {pr.role && <p className="text-sm font-medium text-indigo-400 mb-4">{pr.role}</p>}
                    {pr.description && <p className="text-gray-400 mb-6 flex-grow">{pr.description}</p>}
                    {pr.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-auto">
                        {pr.tags.map((t) => (
                          <span key={t} className="text-xs px-3 py-1 rounded-full bg-white/10 text-gray-300">{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Experience Timeline */}
        {sv("experience") && data.experience.length > 0 && (
          <section>
            <h2 className="text-3xl font-bold mb-10 flex items-center gap-4">
              <span className="w-8 h-[2px] bg-indigo-500"></span> Experience
            </h2>
            <div className="space-y-8 border-l-2 border-white/10 ml-4 pl-8 relative">
              {data.experience.map((x) => (
                <div key={x.id} className="relative group">
                  <div className="absolute -left-[41px] top-1.5 w-5 h-5 rounded-full bg-[#0a0a0f] border-2 border-indigo-500 group-hover:bg-indigo-500 transition-colors duration-300" />
                  <h3 className="text-xl font-bold text-gray-100">{x.title || x.company}</h3>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm mt-2 mb-4 text-gray-400">
                    <span className="font-medium text-indigo-300">
                      {[x.company, x.location].filter(Boolean).join(" · ")}
                    </span>
                    <span className="hidden sm:block text-gray-600">•</span>
                    <span className="bg-white/5 px-3 py-1 rounded-full">{dateRange(x.start_date, x.end_date, x.is_current)}</span>
                  </div>
                  {x.description && <p className="text-gray-400 leading-relaxed">{x.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills Section (Bento style) */}
        {sv("skills") && data.skills.length > 0 && (
          <section>
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-4">
              <span className="w-8 h-[2px] bg-indigo-500"></span> Expertise
            </h2>
            <div className="flex flex-wrap gap-3">
              {data.skills.map((s) => (
                <span key={s.id} className="px-5 py-2.5 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 text-gray-200 shadow-sm hover:scale-105 hover:border-indigo-500/50 hover:text-indigo-300 transition-all cursor-default">
                  {s.name}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {sv("education") && data.education.length > 0 && (
          <section>
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-4">
              <span className="w-8 h-[2px] bg-indigo-500"></span> Education
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.education.map((ed) => (
                <div key={ed.id} className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                  <h3 className="text-xl font-bold mb-2">{ed.school}</h3>
                  <p className="text-indigo-400 text-sm mb-3">
                    {[ed.degree, ed.field].filter(Boolean).join(", ")}
                  </p>
                  <p className="text-xs text-gray-500 mb-3">{dateRange(ed.start_date, ed.end_date)}</p>
                  {ed.description && <p className="text-sm text-gray-400">{ed.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Dynamic Multi-column Sections (Services, Certifications, Achievements, Pubs) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {sv("services") && data.services.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-6">Services</h2>
              <div className="space-y-4">
                {data.services.map((s) => (
                  <div key={s.id} className="p-6 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold">{s.title}</h3>
                      {s.price && <span className="text-indigo-400 text-sm font-medium bg-indigo-500/10 px-3 py-1 rounded-full">{s.price}</span>}
                    </div>
                    {s.description && <p className="text-sm text-gray-400">{s.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {sv("certifications") && data.certifications.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-6">Certifications</h2>
              <div className="space-y-4">
                {data.certifications.map((c) => (
                  <div key={c.id} className="flex flex-col p-5 rounded-2xl bg-white/5 border border-white/10">
                    <h3 className="font-semibold text-gray-200">
                      {c.url ? <a href={ext(c.url)} className="hover:text-indigo-400 transition-colors" target="_blank" rel="noreferrer">{c.name} ↗</a> : c.name}
                    </h3>
                    <div className="flex justify-between items-center mt-2 text-sm text-gray-400">
                      <span>{c.issuer}</span>
                      <span className="text-xs px-2 py-1 bg-white/5 rounded-md">{c.issue_date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {sv("achievements") && data.achievements.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-6">Achievements</h2>
              <div className="space-y-4">
                {data.achievements.map((a) => (
                  <div key={a.id} className="p-5 rounded-2xl bg-white/5 border border-white/10 border-l-4 border-l-purple-500">
                    <h3 className="font-semibold">{a.title}</h3>
                    <p className="text-xs text-indigo-400 my-2">{a.date}</p>
                    {a.description && <p className="text-sm text-gray-400">{a.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {sv("publications") && data.publications.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-6">Publications</h2>
              <div className="space-y-4">
                {data.publications.map((pub) => (
                  <div key={pub.id} className="p-5 rounded-2xl bg-white/5 border border-white/10">
                    <h3 className="font-semibold">
                      {pub.url ? <a href={ext(pub.url)} className="hover:text-indigo-400 transition-colors" target="_blank" rel="noreferrer">{pub.title} ↗</a> : pub.title}
                    </h3>
                    <p className="text-sm text-gray-400 mt-2">{pub.publisher} • <span className="text-indigo-400">{pub.date}</span></p>
                    {pub.description && <p className="text-sm text-gray-500 mt-2">{pub.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Gallery */}
        {sv("gallery") && data.gallery.length > 0 && (
          <section>
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-4">
              <span className="w-8 h-[2px] bg-indigo-500"></span> Gallery
            </h2>
            <div className="columns-1 sm:columns-2 md:columns-3 gap-6 space-y-6">
              {data.gallery.map((g) => (
                <figure key={g.id} className="relative group break-inside-avoid overflow-hidden rounded-2xl bg-white/5 border border-white/10">
                  <ZoomImage src={g.image_url} alt={g.caption || ""} className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500" />
                  {g.caption && (
                    <figcaption className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-sm text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {g.caption}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          </section>
        )}

        {/* Videos */}
        {sv("videos") && data.videos.length > 0 && (
          <section>
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-4">
              <span className="w-8 h-[2px] bg-indigo-500"></span> Videos
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {data.videos.map((v) => {
                const embed = videoEmbed(v.url);
                return (
                  <div key={v.id} className="rounded-2xl overflow-hidden bg-white/5 border border-white/10">
                    {embed ? (
                      <div className="aspect-video">
                        <iframe src={embed} title={v.title || "Video"} allowFullScreen className="w-full h-full" />
                      </div>
                    ) : (
                      <div className="p-6">
                        <a className="text-indigo-400 hover:underline flex items-center gap-2" href={ext(v.url)} target="_blank" rel="noreferrer">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M10 15l5-3-5-3v6zm2-13C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>
                          {v.title || v.url}
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
          <section>
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-4">
              <span className="w-8 h-[2px] bg-indigo-500"></span> Kind Words
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.testimonials.map((t) => (
                <div key={t.id} className="p-8 rounded-3xl bg-white/5 border border-white/10 relative">
                  <div className="absolute top-6 right-6 text-indigo-500/20">
                    <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 32 32"><path d="M10 8c-3.3 0-6 2.7-6 6v10h10V14H8c0-2.2 1.8-4 4-4V8zm14 0c-3.3 0-6 2.7-6 6v10h10V14h-6c0-2.2 1.8-4 4-4V8z"/></svg>
                  </div>
                  <p className="text-gray-300 italic relative z-10 mb-6">"{t.quote}"</p>
                  <div className="flex items-center gap-4 mt-auto">
                    {t.avatar_url && <img className="w-12 h-12 rounded-full object-cover border-2 border-indigo-500/50" src={t.avatar_url} alt={t.author} />}
                    <div>
                      <p className="font-semibold text-gray-100">{t.author}</p>
                      {t.role && <p className="text-xs text-indigo-400">{t.role}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Contact & Form Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 border-t border-white/10 pt-20">
          {(p?.email || p?.phone || p?.website || p?.availability) && (
            <section>
              <h2 className="text-4xl font-extrabold mb-6">Let's Connect</h2>
              {p?.availability && <p className="text-indigo-400 font-medium mb-8 bg-indigo-500/10 inline-block px-4 py-2 rounded-lg">{p.availability}</p>}
              <div className="flex flex-col gap-6">
                {p?.email && (
                  <a href={`mailto:${p.email}`} className="flex items-center gap-4 text-xl text-gray-300 hover:text-white transition-colors group">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-indigo-500 transition-colors"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg></div>
                    {p.email}
                  </a>
                )}
                {p?.phone && (
                  <div className="flex items-center gap-4 text-xl text-gray-300">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg></div>
                    {p.phone}
                  </div>
                )}
                {p?.website && (
                  <a href={ext(p.website)} target="_blank" rel="noreferrer" className="flex items-center gap-4 text-xl text-gray-300 hover:text-white transition-colors group">
                     <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-indigo-500 transition-colors"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg></div>
                    Visit Website ↗
                  </a>
                )}
                {p?.resume_url && (
                  <a href={ext(p.resume_url)} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-colors w-fit">
                    Download Résumé
                  </a>
                )}
              </div>
            </section>
          )}

          {data.username && (
            <section className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl">
              <h3 className="text-2xl font-bold mb-6">Send a Message</h3>
              <ContactForm username={data.username} />
            </section>
          )}
        </div>

        {/* Footer */}
        {!data.hide_branding && (
          <footer className="text-center text-gray-500 text-sm pb-10 border-t border-white/10 pt-10 mt-10">
            Crafted with precision &middot; Folio
          </footer>
        )}
      </div>
    </div>
  );
}
