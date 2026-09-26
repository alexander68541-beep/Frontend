import React from "react";
import type { PublicPortfolio } from "@/lib/publicTypes";
import { dateRange, videoEmbed } from "@/lib/publicTypes";
import { LinkChip } from "@/components/LinkChip";
import { ZoomImage } from "@/components/ZoomImage";

export function AuroraTemplate({ data }: { data: PublicPortfolio }) {
  const p = data.profile;
  const name = p?.display_name || data.username || "Portfolio";
  const hasContact = p?.email || p?.phone || p?.website || p?.availability || p?.resume_url;

  // Custom accent color with amber fallback
  const accentColor = data.accent || "#ff6b35";

  return (
    <div
      className="relative min-h-screen bg-[#08080a] text-neutral-200 selection:bg-amber-500/30 selection:text-white font-sans antialiased overflow-x-hidden"
      style={{ ["--brand-accent" as string]: accentColor } as React.CSSProperties}
    >
      {/* Background Ambient Glows & Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute -top-[15%] left-1/2 -translate-x-1/2 w-[700px] h-[550px] rounded-full blur-[140px] opacity-25"
          style={{ background: `radial-gradient(circle, ${accentColor} 0%, rgba(255,107,53,0.15) 50%, transparent 80%)` }}
        />
        <div
          className="absolute top-[40%] -left-[200px] w-[500px] h-[500px] rounded-full blur-[150px] opacity-15"
          style={{ background: `radial-gradient(circle, ${accentColor} 0%, transparent 70%)` }}
        />
        <div
          className="absolute bottom-0 -right-[200px] w-[500px] h-[500px] rounded-full blur-[150px] opacity-15"
          style={{ background: `radial-gradient(circle, ${accentColor} 0%, transparent 70%)` }}
        />
        {/* Subtle dot grid pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 py-10 lg:py-16 space-y-28">

        {/* Top Navbar */}
        <header className="flex items-center justify-between py-4 px-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl sticky top-6 z-50 shadow-2xl shadow-black/60">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full animate-ping" style={{ backgroundColor: accentColor }} />
            <span className="font-semibold tracking-wide text-white text-sm sm:text-base">
              {name}
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-7 text-xs font-medium uppercase tracking-widest text-neutral-400">
            {p?.about && <a href="#about" className="hover:text-white transition-colors">About</a>}
            {data.projects.length > 0 && <a href="#work" className="hover:text-white transition-colors">Work</a>}
            {data.experience.length > 0 && <a href="#experience" className="hover:text-white transition-colors">Experience</a>}
            {data.services.length > 0 && <a href="#services" className="hover:text-white transition-colors">Services</a>}
            {hasContact && <a href="#contact" className="hover:text-white transition-colors">Contact</a>}
          </nav>

          {p?.email && (
            <a
              href={`mailto:${p.email}`}
              className="px-5 py-2 rounded-full text-xs font-semibold tracking-wide text-white transition-all transform hover:scale-105 active:scale-95 shadow-lg"
              style={{ backgroundColor: accentColor }}
            >
              Let's Talk
            </a>
          )}
        </header>

        {/* Hero Section */}
        <section className="pt-6 sm:pt-12 flex flex-col-reverse lg:flex-row items-center justify-between gap-12 lg:gap-16">
          <div className="flex-1 text-center lg:text-left space-y-6">
            {p?.availability && (
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full text-xs font-medium uppercase tracking-widest bg-white/[0.04] border border-white/[0.08] text-neutral-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {p.availability}
              </div>
            )}

            <div className="space-y-3">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1]">
                Hi, I'm <span style={{ color: accentColor }}>{name}.</span>
              </h1>
              {p?.title && (
                <p className="text-xs sm:text-sm font-semibold tracking-[0.25em] text-neutral-400 uppercase">
                  {p.title} {p?.pronouns && `· (${p.pronouns})`}
                </p>
              )}
            </div>

            {p?.tagline && (
              <p className="text-lg sm:text-xl text-neutral-300 max-w-xl font-light leading-relaxed">
                {p.tagline}
              </p>
            )}

            {p?.bio && (
              <p className="text-sm text-neutral-400 max-w-lg leading-relaxed">
                {p.bio}
              </p>
            )}

            {p?.location && (
              <p className="text-xs text-neutral-500 font-mono tracking-wider flex items-center justify-center lg:justify-start gap-1.5">
                <span>📍</span> {p.location}
              </p>
            )}

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4">
              {data.projects.length > 0 && (
                <a
                  href="#work"
                  className="px-6 py-3 rounded-xl font-medium text-sm text-white flex items-center gap-2 transition-all transform hover:scale-[1.03] active:scale-[0.98] shadow-xl shadow-black/40"
                  style={{ backgroundColor: accentColor }}
                >
                  View Portfolio <span>→</span>
                </a>
              )}
              {p?.email && (
                <a
                  href={`mailto:${p.email}`}
                  className="px-6 py-3 rounded-xl font-medium text-sm text-neutral-300 bg-white/[0.05] border border-white/[0.1] hover:bg-white/[0.1] hover:text-white transition-all backdrop-blur-md"
                >
                  Contact Me
                </a>
              )}
            </div>

            {/* Social Links */}
            {data.links.length > 0 && (
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-6">
                {data.links.map((l) => (
                  <LinkChip
                    key={l.id}
                    platform={l.platform}
                    url={l.url}
                    label={l.label}
                    className="!bg-white/[0.03] !border-white/[0.08] hover:!bg-white/[0.08] text-neutral-300 text-xs transition-colors"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Avatar / Feature Visual */}
          {p?.avatar_url && (
            <div className="relative group w-64 h-64 sm:w-80 sm:h-80 lg:w-[420px] lg:h-[420px] flex-shrink-0">
              <div
                className="absolute inset-0 rounded-3xl blur-2xl opacity-40 group-hover:opacity-70 transition duration-700"
                style={{ background: accentColor }}
              />
              <div className="relative w-full h-full rounded-3xl overflow-hidden border border-white/10 bg-neutral-900/60 shadow-2xl p-2">
                <ZoomImage
                  src={p.avatar_url}
                  alt={name}
                  className="w-full h-full object-cover rounded-2xl grayscale-[25%] contrast-105 group-hover:grayscale-0 transition-all duration-500"
                />
              </div>
            </div>
          )}
        </section>

        {/* About Section */}
        {p?.about && (
          <section id="about" className="space-y-6 pt-10">
            <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-400">About Me</h2>
            <div className="p-8 sm:p-12 rounded-3xl bg-white/[0.02] border border-white/[0.07] backdrop-blur-md">
              <p className="text-lg sm:text-2xl text-neutral-200 font-light leading-relaxed">
                {p.about}
              </p>
            </div>
          </section>
        )}

        {/* Projects / Work Section */}
        {data.projects.length > 0 && (
          <section id="work" className="space-y-10">
            <div className="flex items-end justify-between border-b border-white/[0.08] pb-5">
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-400">Featured Work</h2>
                <p className="text-2xl sm:text-3xl font-bold text-white mt-1">Recent Projects</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {data.projects.map((pr) => (
                <a
                  key={pr.id}
                  href={pr.url || undefined}
                  target={pr.url ? "_blank" : undefined}
                  rel="noreferrer"
                  className="group relative flex flex-col rounded-3xl bg-neutral-900/40 border border-white/[0.06] hover:border-white/20 transition-all duration-300 overflow-hidden hover:-translate-y-1 shadow-xl"
                >
                  {pr.image_url && (
                    <div className="w-full aspect-[16/10] overflow-hidden bg-black/40">
                      <ZoomImage
                        src={pr.image_url}
                        alt={pr.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="p-7 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      {pr.role && (
                        <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: accentColor }}>
                          {pr.role}
                        </p>
                      )}
                      <h3 className="text-xl font-bold text-white group-hover:text-white/90">
                        {pr.title}
                      </h3>
                      {pr.description && (
                        <p className="mt-2 text-sm text-neutral-400 font-light leading-relaxed line-clamp-3">
                          {pr.description}
                        </p>
                      )}
                    </div>

                    {pr.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {pr.tags.map((t) => (
                          <span
                            key={t}
                            className="px-2.5 py-1 text-[11px] font-medium tracking-wide rounded-md bg-white/[0.04] text-neutral-300 border border-white/[0.05]"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Experience & Education Section */}
        {(data.experience.length > 0 || data.education.length > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-6">
            {/* Experience */}
            {data.experience.length > 0 && (
              <section id="experience" className="space-y-6">
                <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-400">Career</h2>
                <h3 className="text-2xl font-bold text-white">Experience</h3>
                <div className="space-y-4">
                  {data.experience.map((x) => (
                    <div
                      key={x.id}
                      className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] transition duration-200"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <h4 className="text-base font-semibold text-white">{x.title || x.company}</h4>
                        <span className="text-xs font-mono text-neutral-400 whitespace-nowrap bg-white/[0.04] px-2.5 py-1 rounded">
                          {dateRange(x.start_date, x.end_date, x.is_current)}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400 mt-1 font-medium">
                        {[x.company, x.location].filter(Boolean).join(" · ")}
                      </p>
                      {x.description && (
                        <p className="text-sm text-neutral-300/80 mt-3 font-light leading-relaxed">
                          {x.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Education */}
            {data.education.length > 0 && (
              <section className="space-y-6">
                <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-400">Background</h2>
                <h3 className="text-2xl font-bold text-white">Education</h3>
                <div className="space-y-4">
                  {data.education.map((e) => (
                    <div
                      key={e.id}
                      className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] transition duration-200"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <h4 className="text-base font-semibold text-white">{e.school}</h4>
                        <span className="text-xs font-mono text-neutral-400 whitespace-nowrap bg-white/[0.04] px-2.5 py-1 rounded">
                          {dateRange(e.start_date, e.end_date)}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400 mt-1">
                        {[e.degree, e.field].filter(Boolean).join(" — ")}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* Services Section */}
        {data.services.length > 0 && (
          <section id="services" className="space-y-8">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-400">What I Offer</h2>
              <p className="text-2xl sm:text-3xl font-bold text-white mt-1">Services</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.services.map((s) => (
                <div
                  key={s.id}
                  className="p-8 rounded-3xl bg-neutral-900/30 border border-white/[0.07] hover:border-amber-500/30 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-white">{s.title}</h3>
                    {s.description && (
                      <p className="text-sm text-neutral-400 font-light leading-relaxed">{s.description}</p>
                    )}
                  </div>
                  {s.price && (
                    <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between">
                      <span className="text-xs text-neutral-500 uppercase tracking-wider">Pricing</span>
                      <span className="text-sm font-semibold text-white" style={{ color: accentColor }}>
                        {s.price}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills Section */}
        {data.skills.length > 0 && (
          <section className="space-y-6">
            <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-400">Capabilities</h2>
            <div className="flex flex-wrap gap-2.5">
              {data.skills.map((s) => (
                <span
                  key={s.id}
                  className="px-4 py-2 rounded-xl text-xs font-medium tracking-wide bg-white/[0.03] border border-white/[0.08] text-neutral-200 hover:border-white/20 transition-all"
                >
                  {s.name}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Testimonials */}
        {data.testimonials.length > 0 && (
          <section className="space-y-8">
            <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-400">Endorsements</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.testimonials.map((t) => (
                <div
                  key={t.id}
                  className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.06] flex flex-col justify-between space-y-6"
                >
                  <p className="text-neutral-300 font-light leading-relaxed text-base italic">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    {t.avatar_url && (
                      <ZoomImage src={t.avatar_url} alt={t.author} className="w-10 h-10 rounded-full object-cover" />
                    )}
                    <div>
                      <p className="text-sm font-semibold text-white">{t.author}</p>
                      {t.role && <p className="text-xs text-neutral-500">{t.role}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Certifications & Achievements & Publications */}
        {(data.certifications.length > 0 || data.achievements.length > 0 || data.publications.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
            {data.certifications.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-neutral-400">Certifications</h3>
                {data.certifications.map((c) => (
                  <div key={c.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                    <p className="text-sm font-medium text-white">
                      {c.url ? <a href={c.url} target="_blank" rel="noreferrer" className="hover:underline">{c.name}</a> : c.name}
                    </p>
                    <p className="text-xs text-neutral-400 mt-1">{c.issuer} {c.issue_date && `· ${c.issue_date}`}</p>
                  </div>
                ))}
              </div>
            )}
            {data.achievements.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-neutral-400">Achievements</h3>
                {data.achievements.map((a) => (
                  <div key={a.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                    <p className="text-sm font-medium text-white">{a.title}</p>
                    <p className="text-xs text-neutral-500 mt-1">{a.date}</p>
                    {a.description && <p className="text-xs text-neutral-400 mt-2">{a.description}</p>}
                  </div>
                ))}
              </div>
            )}
            {data.publications.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-neutral-400">Publications</h3>
                {data.publications.map((pub) => (
                  <div key={pub.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                    <p className="text-sm font-medium text-white">
                      {pub.url ? <a href={pub.url} target="_blank" rel="noreferrer" className="hover:underline">{pub.title}</a> : pub.title}
                    </p>
                    <p className="text-xs text-neutral-400 mt-1">{pub.publisher} {pub.date && `· ${pub.date}`}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Gallery */}
        {data.gallery.length > 0 && (
          <section className="space-y-6">
            <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-400">Visuals</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {data.gallery.map((g) => (
                <figure key={g.id} className="group relative rounded-2xl overflow-hidden bg-neutral-900 border border-white/[0.08]">
                  <ZoomImage src={g.image_url} alt={g.caption || ""} className="w-full h-48 object-cover group-hover:scale-105 transition duration-300" />
                  {g.caption && (
                    <figcaption className="p-2 text-center text-xs text-neutral-400 bg-neutral-950/80 backdrop-blur border-t border-white/[0.04]">
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
          <section className="space-y-6">
            <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-400">Media</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.videos.map((v) => {
                const embed = videoEmbed(v.url);
                return (
                  <div key={v.id} className="rounded-2xl overflow-hidden border border-white/[0.08] bg-black">
                    {embed ? (
                      <div className="aspect-video w-full">
                        <iframe src={embed} title={v.title || "Video"} allowFullScreen className="w-full h-full border-0" />
                      </div>
                    ) : (
                      <a href={v.url} target="_blank" rel="noreferrer" className="p-6 block hover:text-amber-400 transition">
                        {v.title || v.url} ↗
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Contact Footer Section */}
        {hasContact && (
          <section id="contact" className="pt-10 border-t border-white/[0.08] text-center space-y-6">
            <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-400">Get in Touch</h2>
            <h3 className="text-3xl sm:text-5xl font-bold text-white tracking-tight">Let's work together.</h3>
            {p?.email && (
              <p className="text-lg sm:text-xl font-mono text-neutral-300">
                <a href={`mailto:${p.email}`} className="hover:underline" style={{ color: accentColor }}>
                  {p.email}
                </a>
              </p>
            )}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              {p?.phone && <span className="text-sm font-mono text-neutral-400 px-4 py-2 rounded-lg bg-white/[0.03] border border-white/[0.08]">{p.phone}</span>}
              {p?.website && (
                <a href={p.website} target="_blank" rel="noreferrer" className="text-sm px-5 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-white transition">
                  Website ↗
                </a>
              )}
              {p?.resume_url && (
                <a href={p.resume_url} target="_blank" rel="noreferrer" className="text-sm px-5 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-white transition">
                  Résumé ↗
                </a>
              )}
            </div>
          </section>
        )}

        {/* Branding Footer */}
        {!data.hide_branding && (
          <footer className="text-center py-6 text-xs text-neutral-600 tracking-wider">
            Made with Folio
          </footer>
        )}

      </div>
    </div>
  );
}
