import type { PublicPortfolio } from "@/lib/publicTypes";
import { dateRange, videoEmbed } from "@/lib/publicTypes";
import { LinkChip } from "@/components/LinkChip";
import { ZoomImage } from "@/components/ZoomImage";

// The redesigned Dark & Orange Template inspired by the design mockup
export function AuroraTemplate({ data }: { data: PublicPortfolio }) {
  const p = data.profile;
  const name = p?.display_name || data.username || "Untitled";
  const hasContact = p?.email || p?.phone || p?.website || p?.availability;
  
  // Using the vibrant orange from the reference image, or fallback to user's accent
  const accentColor = data.accent || "#e55b13"; 

  return (
    <div 
      className="min-h-screen bg-[#0a0a0a] text-gray-300 font-sans selection:bg-[#e55b13] selection:text-white pb-20"
      style={{ "--accent": accentColor } as React.CSSProperties}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-8">
        
        {/* Navbar */}
        <nav className="flex justify-between items-center mb-16 pb-6 border-b border-white/5">
          <div className="text-2xl font-bold flex items-center gap-2 text-white">
            <span className="w-2 h-7 bg-[#e55b13] inline-block rounded-sm" style={{ backgroundColor: accentColor }}></span>
            {name}
          </div>
          
          <ul className="hidden md:flex gap-8 text-sm font-medium text-gray-400">
            <li><a href="#about" className="hover:text-white transition-colors">About</a></li>
            {data.projects.length > 0 && <li><a href="#portfolio" className="hover:text-white transition-colors">Portfolio</a></li>}
            {data.testimonials.length > 0 && <li><a href="#testimonials" className="hover:text-white transition-colors">Testimonials</a></li>}
            {hasContact && <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>}
          </ul>

          {hasContact && (
            <a 
              href={p?.email ? `mailto:${p.email}` : "#contact"} 
              className="bg-[#e55b13] hover:bg-[#c94b0d] text-white px-6 py-2.5 rounded-full text-sm font-semibold transition-all shadow-lg"
              style={{ backgroundColor: accentColor }}
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
              {/* Glow effect behind image */}
              <div 
                className="absolute inset-0 blur-[100px] opacity-20 rounded-full" 
                style={{ backgroundColor: accentColor }}
              ></div>
              <ZoomImage 
                className="relative z-10 w-full max-w-md rounded-2xl object-cover shadow-2xl border border-white/10 aspect-[4/5]" 
                src={p.avatar_url} 
                alt={name} 
              />
            </div>
          )}

          {/* Right: Content */}
          <div className="order-1 lg:order-2 flex flex-col items-start">
            {p?.availability && (
              <div className="flex items-center gap-2 border border-white/20 bg-white/5 rounded-full px-4 py-1.5 text-[10px] font-bold text-gray-300 tracking-[0.2em] uppercase mb-8">
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: accentColor }}></span>
                {p.availability}
              </div>
            )}
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 tracking-tight leading-tight">
              Hi, I'm <span className="font-serif italic" style={{ color: accentColor }}>{name}</span>.
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
                  className="text-white px-8 py-3.5 rounded-full text-sm font-semibold transition-all flex items-center gap-2 hover:scale-105"
                  style={{ backgroundColor: accentColor }}
                >
                  View Portfolio <span className="text-lg leading-none">→</span>
                </a>
              )}
              {hasContact && (
                <a 
                  href="#contact" 
                  className="border border-white/20 hover:border-white/60 text-white px-8 py-3.5 rounded-full text-sm font-semibold transition-all flex items-center gap-2 bg-white/5 hover:bg-white/10"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                  Contact Me
                </a>
              )}
            </div>

            {data.links.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-10">
                {data.links.map((l) => (
                  <LinkChip key={l.id} className="bg-white/5 border border-white/10 hover:border-white/30 text-white" platform={l.platform} url={l.url} label={l.label} />
                ))}
              </div>
            )}
          </div>
        </header>

        {/* About Section */}
        {p?.about && (
          <section id="about" className="mb-24">
            <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
              <span className="w-8 h-1 rounded-full" style={{ backgroundColor: accentColor }}></span> About
            </h2>
            <div className="bg-[#111111] border border-white/5 rounded-2xl p-8 md:p-10 shadow-lg text-gray-300 leading-relaxed text-lg">
              {p.about}
            </div>
          </section>
        )}

        {/* Work / Portfolio Section */}
        {data.projects.length > 0 && (
          <section id="portfolio" className="mb-24">
            <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
              <span className="w-8 h-1 rounded-full" style={{ backgroundColor: accentColor }}></span> Selected Work
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {data.projects.map((pr) => (
                <a key={pr.id} href={pr.url || undefined} target={pr.url ? "_blank" : undefined} rel="noreferrer" 
                   className="group block bg-[#111111] border border-white/5 rounded-2xl overflow-hidden hover:border-[#e55b13]/50 transition-all shadow-lg hover:shadow-2xl hover:-translate-y-1">
                  {pr.image_url && (
                    <div className="overflow-hidden aspect-video relative">
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10"></div>
                      <ZoomImage className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={pr.image_url} alt={pr.title} />
                    </div>
                  )}
                  <div className="p-8">
                    <h3 className="text-2xl font-bold text-white group-hover:text-[#e55b13] transition-colors mb-2" style={{ "--tw-text-opacity": 1, color: "var(--hover-color, white)" }}>{pr.title}</h3>
                    {pr.role && <p className="text-sm font-semibold mb-4" style={{ color: accentColor }}>{pr.role}</p>}
                    {pr.description && <p className="text-gray-400 mb-6 line-clamp-3">{pr.description}</p>}
                    {pr.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {pr.tags.map((t) => <span key={t} className="bg-white/5 border border-white/10 text-xs px-3 py-1 rounded-full text-gray-300">{t}</span>)}
                      </div>
                    )}
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Experience & Education - Two Column Layout on Desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-24">
          {data.experience.length > 0 && (
            <section>
              <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                <span className="w-8 h-1 rounded-full" style={{ backgroundColor: accentColor }}></span> Experience
              </h2>
              <div className="space-y-8 border-l-2 border-white/10 pl-6 ml-3">
                {data.experience.map((x) => (
                  <div key={x.id} className="relative">
                    <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-4 border-[#0a0a0a]" style={{ backgroundColor: accentColor }}></div>
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
                <span className="w-8 h-1 rounded-full" style={{ backgroundColor: accentColor }}></span> Education
              </h2>
              <div className="space-y-8 border-l-2 border-white/10 pl-6 ml-3">
                {data.education.map((e) => (
                  <div key={e.id} className="relative">
                    <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-4 border-[#0a0a0a]" style={{ backgroundColor: accentColor }}></div>
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
              <span className="w-8 h-1 rounded-full" style={{ backgroundColor: accentColor }}></span> Services
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {data.services.map((s) => (
                <div key={s.id} className="bg-[#111111] border border-white/5 p-8 rounded-2xl hover:border-white/20 transition-colors">
                  <h3 className="text-xl font-bold text-white mb-3 flex justify-between items-start">
                    {s.title}
                    {s.price && <span className="text-sm font-semibold bg-white/10 px-3 py-1 rounded-full" style={{ color: accentColor }}>{s.price}</span>}
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
              <span className="w-8 h-1 rounded-full" style={{ backgroundColor: accentColor }}></span> Testimonials
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.testimonials.map((t) => (
                <div key={t.id} className="bg-[#111111] border border-white/5 p-8 rounded-2xl relative">
                  <svg className="absolute top-6 right-6 w-10 h-10 text-white/5" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" /></svg>
                  <p className="text-gray-300 italic mb-6 relative z-10">&ldquo;{t.quote}&rdquo;</p>
                  <div className="flex items-center gap-4">
                    {t.avatar_url && <ZoomImage className="w-12 h-12 rounded-full object-cover border border-white/10" src={t.avatar_url} alt={t.author} />}
                    <div>
                      <span className="block font-bold text-white">{t.author}</span>
                      {t.role && <span className="block text-xs text-gray-500 uppercase tracking-wider mt-0.5">{t.role}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {data.skills.length > 0 && (
          <section className="mb-24">
            <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
              <span className="w-8 h-1 rounded-full" style={{ backgroundColor: accentColor }}></span> Skills
            </h2>
            <div className="flex flex-wrap gap-3">
              {data.skills.map((s) => (
                <span key={s.id} className="bg-white/5 border border-white/10 hover:border-white/30 text-gray-300 px-5 py-2 rounded-full text-sm font-medium transition-colors cursor-default">
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
              <span className="w-8 h-1 rounded-full" style={{ backgroundColor: accentColor }}></span> Gallery
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

        {/* Contact Footer Area */}
        {hasContact && (
          <section id="contact" className="mb-24 border-t border-white/10 pt-16 mt-16 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Let's work together.</h2>
            {p?.availability && <p className="text-lg mb-10" style={{ color: accentColor }}>{p.availability}</p>}
            
            <div className="flex flex-wrap justify-center items-center gap-6">
              {p?.email && (
                <a href={`mailto:${p.email}`} className="text-xl font-medium text-white hover:text-gray-300 underline underline-offset-8 decoration-white/20 transition-colors">
                  {p.email}
                </a>
              )}
              {p?.phone && <span className="text-xl font-medium text-gray-400">{p.phone}</span>}
            </div>

            <div className="flex flex-wrap justify-center gap-4 mt-12">
              {p?.website && <a href={p.website} target="_blank" rel="noreferrer" className="bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-2 rounded-full text-white text-sm transition-colors">Website ↗</a>}
              {p?.resume_url && <a href={p.resume_url} target="_blank" rel="noreferrer" className="bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-2 rounded-full text-white text-sm transition-colors">Résumé ↗</a>}
            </div>
          </section>
        )}

        {/* Branding Footer */}
        {!data.hide_branding && (
          <footer className="text-center text-gray-600 text-sm py-8 border-t border-white/5">
            Made with Folio
          </footer>
        )}

      </div>
    </div>
  );
}
