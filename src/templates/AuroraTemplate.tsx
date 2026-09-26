import type { PublicPortfolio } from "@/lib/publicTypes";
import { dateRange, videoEmbed } from "@/lib/publicTypes";
import { LinkChip } from "@/components/LinkChip";
import { ZoomImage } from "@/components/ZoomImage";

export function AuroraTemplate({ data }: { data: PublicPortfolio }) {
  const p = data.profile;
  const name = p?.display_name || data.username || "Untitled";
  const hasContact = p?.email || p?.phone || p?.website || p?.availability;

  return (
    <div className="min-h-screen bg-[#080808] text-gray-300 font-sans selection:bg-[#E55B13] selection:text-white pb-20">
      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-8">
        
        {/* Navbar */}
        <nav className="flex justify-between items-center mb-16 pb-6 border-b border-white/5">
          <div className="text-2xl font-bold flex items-center gap-2 text-white">
            <span className="w-2 h-7 bg-[#E55B13] inline-block rounded-sm"></span>
            {name}
          </div>
          
          <ul className="hidden md:flex gap-8 text-sm font-medium text-gray-400">
            {p?.about && <li><a href="#about" className="hover:text-white transition-colors">About</a></li>}
            {data.projects.length > 0 && <li><a href="#portfolio" className="hover:text-white transition-colors">Portfolio</a></li>}
            {data.testimonials.length > 0 && <li><a href="#testimonials" className="hover:text-white transition-colors">Testimonials</a></li>}
            {hasContact && <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>}
          </ul>

          {hasContact && (
            <a 
              href={p?.email ? `mailto:${p.email}` : "#contact"} 
              className="bg-[#E55B13] hover:bg-[#c94b0d] text-white px-6 py-2.5 rounded-full text-sm font-semibold transition-all shadow-lg shadow-[#E55B13]/20"
            >
              Let's Talk
            </a>
          )}
        </nav>

        {/* Hero Section */}
        <header className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-32 pt-4">
          
          {/* Left: Avatar/Image */}
          {p?.avatar_url && (
            <div className="relative order-2 lg:order-1 flex justify-center">
              <div className="absolute inset-0 bg-[#E55B13] blur-[120px] opacity-20 rounded-full"></div>
              <ZoomImage 
                className="relative z-10 w-full max-w-md rounded-2xl object-cover shadow-2xl border border-white/10 aspect-[4/5]" 
                src={p.avatar_url} 
                alt={name} 
              />
            </div>
          )}

          {/* Right: Content */}
          <div className="order-1 lg:order-2 flex flex-col items-start relative z-20">
            {p?.availability && (
              <div className="flex items-center gap-2 border border-white/10 bg-[#121212] rounded-full px-4 py-1.5 text-[10px] font-bold text-gray-300 tracking-[0.2em] uppercase mb-8 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#E55B13] animate-pulse"></span>
                {p.availability}
              </div>
            )}
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 tracking-tight leading-tight">
              Hi, I'm <span className="font-serif italic text-[#E55B13]">{name}</span>.
            </h1>
            
            {p?.title && (
              <h2 className="text-xs md:text-sm tracking-[0.3em] text-gray-400 uppercase mb-6 font-semibold">
                {p.title} {p?.pronouns ? ` · ${p.pronouns}` : ""}
              </h2>
            )}
            
            {(p?.bio || p?.tagline) && (
              <p className="text-gray-400 text-base md:text-lg leading-relaxed max-w-lg mb-10">
                {p.bio || p.tagline}
              </p>
            )}
            
            <div className="flex flex-wrap items-center gap-4 w-full">
              {data.projects.length > 0 && (
                <a 
                  href="#portfolio" 
                  className="bg-[#E55B13] hover:bg-[#c94b0d] text-white px-8 py-3.5 rounded-full text-sm font-semibold transition-all flex items-center gap-2 hover:scale-105 shadow-lg shadow-[#E55B13]/25"
                >
                  View Portfolio <span className="text-lg leading-none">→</span>
                </a>
              )}
              {hasContact && (
                <a 
                  href="#contact" 
                  className="border border-white/10 hover:border-white/40 text-white px-8 py-3.5 rounded-full text-sm font-semibold transition-all flex items-center gap-2 bg-[#151515] hover:bg-[#202020]"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                  Contact Me
                </a>
              )}
            </div>

            {data.links.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-10">
                {data.links.map((l) => (
                  <LinkChip key={l.id} className="bg-[#121212] border border-white/10 hover:border-white/30 text-white" platform={l.platform} url={l.url} label={l.label} />
                ))}
              </div>
            )}
          </div>
        </header>

        {/* About Section */}
        {p?.about && (
          <section id="about" className="mb-24">
            <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
              <span className="w-8 h-1 rounded-full bg-[#E55B13]"></span> About
            </h2>
            <div className="bg-[#111111] border border-white/5 rounded-3xl p-8 md:p-10 shadow-lg text-gray-300 leading-relaxed text-lg">
              {p.about}
            </div>
          </section>
        )}

        {/* Work / Portfolio Section */}
        {data.projects.length > 0 && (
          <section id="portfolio" className="mb-24">
            <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
              <span className="w-8 h-1 rounded-full bg-[#E55B13]"></span> Selected Work
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {data.projects.map((pr) => (
                <a key={pr.id} href={pr.url || undefined} target={pr.url ? "_blank" : undefined} rel="noreferrer" 
                   className="group block bg-[#111111] border border-white/5 rounded-3xl overflow-hidden hover:border-[#E55B13]/40 transition-all shadow-lg hover:shadow-2xl hover:-translate-y-1">
                  {pr.image_url && (
                    <div className="overflow-hidden aspect-video relative bg-[#0a0a0a]">
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-transparent transition-colors z-10 duration-500"></div>
                      <ZoomImage className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" src={pr.image_url} alt={pr.title} />
                    </div>
                  )}
                  <div className="p-8">
                    <h3 className="text-2xl font-bold text-white group-hover:text-[#E55B13] transition-colors mb-2">{pr.title}</h3>
                    {pr.role && <p className="text-sm font-semibold text-[#E55B13] mb-4">{pr.role}</p>}
                    {pr.description && <p className="text-gray-400 mb-6 line-clamp-3">{pr.description}</p>}
                    {pr.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {pr.tags.map((t) => <span key={t} className="bg-white/5 border border-white/5 text-xs px-3 py-1 rounded-full text-gray-300">{t}</span>)}
                      </div>
                    )}
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Experience & Education */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-24">
          {data.experience.length > 0 && (
            <section>
              <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                <span className="w-8 h-1 rounded-full bg-[#E55B13]"></span> Experience
              </h2>
              <div className="space-y-8 border-l-2 border-white/10 pl-6 ml-3">
                {data.experience.map((x) => (
                  <div key={x.id} className="relative">
                    <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-4 border-[#080808] bg-[#E55B13]"></div>
                    <h3 className="text-xl font-bold text-white">{x.title || x.company}</h3>
                    <p className="text-sm text-gray-400 mt-1 mb-3 flex flex-wrap gap-2 items-center">
                      <span className="font-semibold text-gray-300">{[x.company, x.location].filter(Boolean).join(" · ")}</span>
                      <span className="bg-white/10 px-2 py-0.5 rounded text-xs">{dateRange(x.start_date, x.end_date, x.is_current)}</span>
                    </p>
                    {x.description && <p className="text-gray-400 text-sm leading-relaxed">{x.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {data.education.length > 0 && (
            <section>
              <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                <span className="w-8 h-1 rounded-full bg-[#E55B13]"></span> Education
              </h2>
              <div className="space-y-8 border-l-2 border-white/10 pl-6 ml-3">
                {data.education.map((e) => (
                  <div key={e.id} className="relative">
                    <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-4 border-[#080808] bg-[#E55B13]"></div>
                    <h3 className="text-xl font-bold text-white">{e.school}</h3>
                    <p className="text-sm text-gray-400 mt-1 mb-2 flex flex-wrap gap-2 items-center">
                      <span className="font-semibold text-gray-300">{[e.degree, e.field].filter(Boolean).join(", ")}</span>
                      <span className="bg-white/10 px-2 py-0.5 rounded text-xs">{dateRange(e.start_date, e.end_date)}</span>
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Services */}
        {data.services.length > 0 && (
          <section className="mb-24">
            <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
              <span className="w-8 h-1 rounded-full bg-[#E55B13]"></span> Services
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {data.services.map((s) => (
                <div key={s.id} className="bg-[#111111] border border-white/5 p-8 rounded-3xl hover:border-[#E55B13]/30 transition-colors">
                  <h3 className="text-xl font-bold text-white mb-3 flex justify-between items-start">
                    {s.title}
                    {s.price && <span className="text-sm font-semibold bg-[#E55B13]/10 text-[#E55B13] px-3 py-1 rounded-full">{s.price}</span>}
                  </h3>
                  {s.description && <p className="text-gray-400 text-sm leading-relaxed">{s.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Testimonials */}
        {data.testimonials.length > 0 && (
          <section id="testimonials" className="mb-24">
            <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
              <span className="w-8 h-1 rounded-full bg-[#E55B13]"></span> Testimonials
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.testimonials.map((t) => (
                <div key={t.id} className="bg-[#111111] border border-white/5 p-8 rounded-3xl relative">
                  <svg className="absolute top-6 right-6 w-10 h-10 text-white/5" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" /></svg>
                  <p className="text-gray-300 italic mb-6 relative z-10">&ldquo;{t.quote}&rdquo;</p>
                  <div className="flex items-center gap-4">
                    {t.avatar_url && <ZoomImage className="w-12 h-12 rounded-full object-cover border border-white/10" src={t.avatar_url} alt={t.author} />}
                    <div>
                      <span className="block font-bold text-white">{t.author}</span>
                      {t.role && <span className="block text-xs text-[#E55B13] uppercase tracking-wider mt-0.5">{t.role}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Certifications & Achievements */}
        {(data.certifications.length > 0 || data.achievements.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-24">
            {data.certifications.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                  <span className="w-6 h-1 rounded-full bg-[#E55B13]"></span> Certifications
                </h2>
                <div className="space-y-6 border-l-2 border-white/10 pl-6 ml-3">
                  {data.certifications.map((c) => (
                    <div key={c.id} className="relative">
                      <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-4 border-[#080808] bg-[#E55B13]"></div>
                      <h3 className="text-lg font-bold text-white">
                        {c.url ? <a href={c.url} target="_blank" rel="noreferrer" className="hover:text-[#E55B13] transition-colors">{c.name}</a> : c.name}
                      </h3>
                      <p className="text-sm text-gray-400 mt-1">{c.issuer} <span className="ml-2 bg-white/10 px-2 py-0.5 rounded text-xs">{c.issue_date}</span></p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {data.achievements.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                  <span className="w-6 h-1 rounded-full bg-[#E55B13]"></span> Achievements
                </h2>
                <div className="space-y-6 border-l-2 border-white/10 pl-6 ml-3">
                  {data.achievements.map((a) => (
                    <div key={a.id} className="relative">
                      <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-4 border-[#080808] bg-[#E55B13]"></div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-3">
                        {a.title} <span className="bg-white/10 px-2 py-0.5 rounded text-xs font-normal text-gray-300">{a.date}</span>
                      </h3>
                      {a.description && <p className="text-sm text-gray-400 mt-2">{a.description}</p>}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* Publications */}
        {data.publications.length > 0 && (
          <section className="mb-24">
            <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
              <span className="w-6 h-1 rounded-full bg-[#E55B13]"></span> Publications
            </h2>
            <div className="space-y-6">
              {data.publications.map((pub) => (
                <div key={pub.id} className="bg-[#111111] border border-white/5 p-6 rounded-2xl">
                  <h3 className="text-lg font-bold text-white">
                    {pub.url ? <a href={pub.url} target="_blank" rel="noreferrer" className="hover:text-[#E55B13] transition-colors">{pub.title}</a> : pub.title}
                  </h3>
                  <p className="text-sm text-[#E55B13] mt-1 mb-2 font-semibold">{pub.publisher} <span className="text-gray-500 font-normal ml-2">{pub.date}</span></p>
                  {pub.description && <p className="text-gray-400 text-sm">{pub.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {data.skills.length > 0 && (
          <section className="mb-24">
            <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
              <span className="w-8 h-1 rounded-full bg-[#E55B13]"></span> Skills
            </h2>
            <div className="flex flex-wrap gap-3">
              {data.skills.map((s) => (
                <span key={s.id} className="bg-[#151515] border border-white/10 hover:border-[#E55B13]/50 text-gray-300 px-5 py-2.5 rounded-full text-sm font-medium transition-colors cursor-default">
                  {s.name}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Gallery */}
        {data.gallery.length > 0 && (
          <section className="mb-24">
            <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
              <span className="w-8 h-1 rounded-full bg-[#E55B13]"></span> Gallery
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {data.gallery.map((g) => (
                <figure key={g.id} className="relative group rounded-xl overflow-hidden bg-[#111]">
                  <ZoomImage src={g.image_url} alt={g.caption || ""} className="w-full aspect-square object-cover group-hover:scale-110 transition-transform duration-500" />
                  {g.caption && (
                    <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-4 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      {g.caption}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          </section>
        )}

        {/* Videos */}
        {data.videos.length > 0 && (
          <section className="mb-24">
            <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
              <span className="w-8 h-1 rounded-full bg-[#E55B13]"></span> Videos
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {data.videos.map((v) => { 
                const embed = videoEmbed(v.url); 
                return (
                  <div key={v.id} className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden p-2">
                    {embed ? (
                      <div className="aspect-video w-full rounded-xl overflow-hidden">
                        <iframe src={embed} title={v.title || "Video"} className="w-full h-full" allowFullScreen />
                      </div>
                    ) : (
                      <div className="p-6 text-center">
                        <a className="text-[#E55B13] hover:underline font-semibold" href={v.url} target="_blank" rel="noreferrer">{v.title || v.url}</a>
                      </div>
                    )}
                  </div>
                ); 
              })}
            </div>
          </section>
        )}

        {/* Contact Footer Area */}
        {hasContact && (
          <section id="contact" className="mb-24 border-t border-white/10 pt-20 mt-16 text-center bg-gradient-to-b from-transparent to-[#E55B13]/5 rounded-b-3xl">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to collaborate?</h2>
            {p?.availability && <p className="text-lg mb-10 text-[#E55B13]">{p.availability}</p>}
            
            <div className="flex flex-col items-center gap-4">
              {p?.email && (
                <a href={`mailto:${p.email}`} className="text-2xl md:text-3xl font-bold text-white hover:text-[#E55B13] underline underline-offset-8 decoration-white/20 hover:decoration-[#E55B13] transition-all">
                  {p.email}
                </a>
              )}
              {p?.phone && <span className="text-xl font-medium text-gray-400 mt-4">{p.phone}</span>}
            </div>

            <div className="flex flex-wrap justify-center gap-4 mt-12 pb-10">
              {p?.website && <a href={p.website} target="_blank" rel="noreferrer" className="bg-[#151515] hover:bg-[#222] border border-white/10 px-6 py-2.5 rounded-full text-white text-sm font-medium transition-colors shadow-lg">Website ↗</a>}
              {p?.resume_url && <a href={p.resume_url} target="_blank" rel="noreferrer" className="bg-[#151515] hover:bg-[#222] border border-white/10 px-6 py-2.5 rounded-full text-white text-sm font-medium transition-colors shadow-lg">Résumé ↗</a>}
            </div>
          </section>
        )}

        {/* Branding Footer */}
        {!data.hide_branding && (
          <footer className="text-center text-gray-600 text-sm pb-10">
            Made with Folio
          </footer>
        )}

      </div>
    </div>
  );
}
