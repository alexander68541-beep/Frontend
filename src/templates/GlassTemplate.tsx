"use client";

import { useEffect, useRef, useState } from "react";
import type { PublicPortfolio } from "@/lib/publicTypes";
import { dateRange, videoEmbed, ext } from "@/lib/publicTypes";
import { fontStack } from "@/lib/fonts";
import { LinkChip } from "@/components/LinkChip";
import { ZoomImage } from "@/components/ZoomImage";
import { ContactForm } from "@/components/ContactForm";

/** Animated count-up, triggers once the number scrolls into view. */
function CountUp({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const done = useRef(false);

  useEffect(() => {
    if (!ref.current || value <= 0) return;
    const el = ref.current;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || done.current) return;
        done.current = true;
        const start = performance.now();
        const dur = 900;
        const step = (t: number) => {
          const p = Math.min(1, (t - start) / dur);
          setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [value]);

  return (
    <span ref={ref} className="tb-stat-num">
      {n}
      {suffix}
    </span>
  );
}

/** Years between the earliest experience start_date and now (derived from real data, not invented). */
function yearsOfExperience(experience: PublicPortfolio["experience"]): number {
  if (!experience?.length) return 0;
  const starts = experience
    .map((x) => (x.start_date ? new Date(x.start_date).getTime() : null))
    .filter((t): t is number => !!t);
  if (!starts.length) return 0;
  const earliest = Math.min(...starts);
  const diff = Date.now() - earliest;
  return Math.max(1, Math.round(diff / (365.25 * 24 * 3600 * 1000)));
}

export function GlassTemplate({ data }: { data: PublicPortfolio }) {
  const p = data.profile;
  const hidden = new Set(data.settings?.hidden ?? []);
  const sv = (k: string) => !hidden.has(k);
  const fontFam = fontStack(data.settings?.font);
  const name = p?.display_name || data.username || "Untitled";

  const years = yearsOfExperience(data.experience);
  const projectCount = data.projects.length;
  const testimonialCount = data.testimonials.length;

  return (
    <div
      className="tpl-bold"
      style={
        {
          ["--tpl-accent" as string]: data.accent || "#7c6cff",
          ...(fontFam ? { fontFamily: fontFam } : {}),
        } as React.CSSProperties
      }
    >
      <div className="tb-aurora" aria-hidden>
        <span />
        <span />
      </div>
      <div className="tb-wrap">
        <header className="tb-hero">
          {p?.availability && <span className="tb-badge">{p.availability}</span>}
          {p?.avatar_url && <ZoomImage className="tb-avatar" src={p.avatar_url} alt={name} />}
          {p?.title && (
            <p className="tb-eyebrow">
              {p.title}
              {p?.pronouns ? ` \u00b7 ${p.pronouns}` : ""}
            </p>
          )}
          <h1 className="tb-name">{name}</h1>
          {p?.tagline && <p className="tb-tagline">{p.tagline}</p>}
          {p?.location && <p className="tb-loc">{p.location}</p>}
          {p?.bio && <p className="tb-bio">{p.bio}</p>}

          {data.links.length > 0 && (
            <div className="tb-links tb-links-cta">
              {data.links.map((l) => (
                <LinkChip key={l.id} className="tb-link" platform={l.platform} url={l.url} label={l.label} />
              ))}
            </div>
          )}

          {(years > 0 || projectCount > 0 || testimonialCount > 0) && (
            <div className="tb-stats">
              {years > 0 && (
                <div className="tb-stat">
                  <CountUp value={years} suffix="+" />
                  <p>Years of experience</p>
                </div>
              )}
              {projectCount > 0 && (
                <div className="tb-stat">
                  <CountUp value={projectCount} suffix="+" />
                  <p>Projects delivered</p>
                </div>
              )}
              {testimonialCount > 0 && (
                <div className="tb-stat">
                  <CountUp value={testimonialCount} suffix="" />
                  <p>Client testimonials</p>
                </div>
              )}
            </div>
          )}
        </header>

        {sv("about") && p?.about && (
          <section className="tb-sec" data-sec="about">
            <p className="tb-kicker">About</p>
            <h2 className="tb-h2">About</h2>
            <p className="tb-about">{p.about}</p>
          </section>
        )}

        {sv("projects") && data.projects.length > 0 && (
          <section className="tb-sec">
            <p className="tb-kicker">Work Highlights</p>
            <h2 className="tb-h2">Selected Work</h2>
            <div className="tb-projects">
              {data.projects.map((pr, i) => (
                <a
                  key={pr.id}
                  className="tb-project"
                  href={pr.url ? ext(pr.url) : undefined}
                  target={pr.url ? "_blank" : undefined}
                  rel="noreferrer"
                >
                  {pr.image_url && <img src={pr.image_url} alt={pr.title} className="tb-proj-img" />}
                  <div className="tb-proj-body">
                    <span className="tb-proj-index">
                      {String(i + 1).padStart(2, "0")} / {String(data.projects.length).padStart(2, "0")}
                    </span>
                    <h3>{pr.title}</h3>
                    {pr.role && <p className="tb-proj-role">{pr.role}</p>}
                    {pr.description && <p className="tb-proj-desc">{pr.description}</p>}
                    {pr.tags.length > 0 && (
                      <div className="tb-tags">
                        {pr.tags.map((t) => (
                          <span key={t}>{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {sv("experience") && data.experience.length > 0 && (
          <section className="tb-sec" data-sec="experience">
            <p className="tb-kicker">Education & Experience</p>
            <h2 className="tb-h2">Experience</h2>
            <div className="tb-timeline">
              {data.experience.map((x) => (
                <div key={x.id} className="tb-row tb-timeline-row">
                  <span className="tb-when tb-when-lead">{dateRange(x.start_date, x.end_date, x.is_current)}</span>
                  <div>
                    <h3>{x.title || x.company}</h3>
                    <p className="tb-row-sub">{[x.company, x.location].filter(Boolean).join(" · ")}</p>
                    {x.description && <p className="tb-row-desc">{x.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {sv("education") && data.education.length > 0 && (
          <section className="tb-sec" data-sec="education">
            <h2 className="tb-h2">Education</h2>
            <div className="tb-timeline">
              {data.education.map((ed) => (
                <div key={ed.id} className="tb-row tb-timeline-row">
                  <span className="tb-when tb-when-lead">{dateRange(ed.start_date, ed.end_date)}</span>
                  <div>
                    <h3>{ed.school}</h3>
                    <p className="tb-row-sub">{[ed.degree, ed.field].filter(Boolean).join(", ")}</p>
                    {ed.description && <p className="tb-row-desc">{ed.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {sv("skills") && data.skills.length > 0 && (
          <section className="tb-sec" data-sec="skills">
            <p className="tb-kicker">Tech Stack</p>
            <h2 className="tb-h2">Skills</h2>
            <div className="tb-skills">
              {data.skills.map((s) => (
                <span key={s.id} className="tb-skill">
                  {s.name}
                </span>
              ))}
            </div>
          </section>
        )}

        {sv("services") && data.services.length > 0 && (
          <section className="tb-sec" data-sec="services">
            <p className="tb-kicker">Services</p>
            <h2 className="tb-h2">Services</h2>
            <div className="tb-cards">
              {data.services.map((s) => (
                <div key={s.id} className="tb-card">
                  <h3>{s.title}</h3>
                  {s.price && <p className="tb-proj-role">{s.price}</p>}
                  {s.description && <p className="tb-proj-desc">{s.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {sv("certifications") && data.certifications.length > 0 && (
          <section className="tb-sec" data-sec="certifications">
            <h2 className="tb-h2">Certifications</h2>
            <div className="tb-timeline">
              {data.certifications.map((c) => (
                <div key={c.id} className="tb-row tb-timeline-row">
                  <span className="tb-when tb-when-lead">{c.issue_date}</span>
                  <div>
                    <h3>{c.url ? <a href={ext(c.url)} target="_blank" rel="noreferrer">{c.name}</a> : c.name}</h3>
                    <p className="tb-row-sub">{c.issuer}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {sv("achievements") && data.achievements.length > 0 && (
          <section className="tb-sec" data-sec="achievements">
            <h2 className="tb-h2">Achievements</h2>
            <div className="tb-timeline">
              {data.achievements.map((a) => (
                <div key={a.id} className="tb-row tb-timeline-row">
                  <span className="tb-when tb-when-lead">{a.date}</span>
                  <div>
                    <h3>{a.title}</h3>
                    {a.description && <p className="tb-row-desc">{a.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {sv("publications") && data.publications.length > 0 && (
          <section className="tb-sec" data-sec="publications">
            <h2 className="tb-h2">Publications</h2>
            <div className="tb-timeline">
              {data.publications.map((pub) => (
                <div key={pub.id} className="tb-row tb-timeline-row">
                  <span className="tb-when tb-when-lead">{pub.date}</span>
                  <div>
                    <h3>{pub.url ? <a href={ext(pub.url)} target="_blank" rel="noreferrer">{pub.title}</a> : pub.title}</h3>
                    <p className="tb-row-sub">{pub.publisher}</p>
                    {pub.description && <p className="tb-row-desc">{pub.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {sv("gallery") && data.gallery.length > 0 && (
          <section className="tb-sec" data-sec="gallery">
            <h2 className="tb-h2">Gallery</h2>
            <div className="tb-gallery">
              {data.gallery.map((g) => (
                <figure key={g.id} className="tb-gal">
                  <ZoomImage src={g.image_url} alt={g.caption || ""} />
                  {g.caption && <figcaption>{g.caption}</figcaption>}
                </figure>
              ))}
            </div>
          </section>
        )}

        {sv("videos") && data.videos.length > 0 && (
          <section className="tb-sec" data-sec="videos">
            <h2 className="tb-h2">Videos</h2>
            <div className="tb-videos">
              {data.videos.map((v) => {
                const embed = videoEmbed(v.url);
                return (
                  <div key={v.id}>
                    {embed ? (
                      <div className="tb-video">
                        <iframe src={embed} title={v.title || "Video"} allowFullScreen />
                      </div>
                    ) : (
                      <a className="tb-link" href={ext(v.url)} target="_blank" rel="noreferrer">
                        {v.title || v.url}
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {sv("testimonials") && data.testimonials.length > 0 && (
          <section className="tb-sec" data-sec="testimonials">
            <p className="tb-kicker">Testimonials</p>
            <h2 className="tb-h2">Here&apos;s what people are saying</h2>
            <div className="tb-cards">
              {data.testimonials.map((t) => (
                <div key={t.id} className="tb-card tb-testi-card">
                  <p className="tb-quote">&ldquo;{t.quote}&rdquo;</p>
                  <div className="tb-cite">
                    {t.avatar_url && <img className="tb-cite-av" src={t.avatar_url} alt={t.author} />}
                    <p className="tb-proj-role">
                      {t.author}
                      {t.role ? `, ${t.role}` : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {(p?.email || p?.phone || p?.website || p?.availability) && (
          <section className="tb-sec">
            <h2 className="tb-h2">Contact</h2>
            {p?.availability && <p className="tb-bio">{p.availability}</p>}
            <div className="tb-links">
              {p?.email && (
                <a className="tb-link" href={`mailto:${p.email}`}>
                  {p.email}
                </a>
              )}
              {p?.phone && <span className="tb-link">{p.phone}</span>}
              {p?.website && (
                <a className="tb-link" href={ext(p.website)} target="_blank" rel="noreferrer">
                  Website
                </a>
              )}
              {p?.resume_url && (
                <a className="tb-link" href={ext(p.resume_url)} target="_blank" rel="noreferrer">
                  Résumé ↗
                </a>
              )}
            </div>
          </section>
        )}

        {data.username && (
          <section className="tb-sec">
            <h2 className="tb-h2">Get in touch</h2>
            <ContactForm username={data.username} />
          </section>
        )}

        {!data.hide_branding && <footer className="tb-foot">Made with Folio</footer>}
      </div>

      <style jsx global>{`
        .tpl-bold {
          --tb-bg: #0a0a0d;
          --tb-surface: #131318;
          --tb-border: rgba(255, 255, 255, 0.08);
          --tb-text: #f3f3f6;
          --tb-muted: #9a9aa5;
          position: relative;
          background: var(--tb-bg);
          color: var(--tb-text);
          min-height: 100vh;
          overflow-x: hidden;
          line-height: 1.5;
        }

        .tb-aurora {
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          overflow: hidden;
        }
        .tb-aurora span {
          position: absolute;
          width: 46vw;
          height: 46vw;
          border-radius: 50%;
          filter: blur(120px);
          opacity: 0.35;
        }
        .tb-aurora span:first-child {
          top: -10%;
          left: -10%;
          background: var(--tpl-accent, #7c6cff);
        }
        .tb-aurora span:last-child {
          bottom: -15%;
          right: -10%;
          background: #ff6c9c;
          opacity: 0.22;
        }

        .tb-wrap {
          position: relative;
          z-index: 1;
          max-width: 960px;
          margin: 0 auto;
          padding: 96px 24px 64px;
        }

        .tb-hero {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
          padding-bottom: 56px;
          border-bottom: 1px solid var(--tb-border);
        }

        .tb-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 16px;
          border-radius: 999px;
          border: 1px solid var(--tb-border);
          background: var(--tb-surface);
          font-size: 13px;
          color: var(--tb-muted);
        }
        .tb-badge::before {
          content: "";
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #4ade80;
          box-shadow: 0 0 0 3px rgba(74, 222, 128, 0.25);
        }

        .tb-avatar {
          width: 84px;
          height: 84px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid var(--tb-border);
          margin-top: 8px;
        }

        .tb-eyebrow {
          text-transform: uppercase;
          letter-spacing: 0.14em;
          font-size: 12px;
          color: var(--tpl-accent, #7c6cff);
          font-weight: 600;
          margin: 0;
        }

        .tb-name {
          font-size: clamp(2.4rem, 6vw, 4.2rem);
          line-height: 1.05;
          font-weight: 700;
          letter-spacing: -0.02em;
          margin: 4px 0;
          background: linear-gradient(180deg, #fff 0%, #b9b9c6 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .tb-tagline {
          font-size: clamp(1.05rem, 2.2vw, 1.4rem);
          color: var(--tb-muted);
          max-width: 620px;
          margin: 0;
        }

        .tb-loc {
          font-size: 13px;
          color: var(--tb-muted);
          margin: 0;
        }

        .tb-bio {
          color: var(--tb-muted);
          max-width: 560px;
          margin: 8px 0 0;
        }

        .tb-links {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          justify-content: center;
        }

        .tb-links-cta {
          margin-top: 12px;
        }

        .tb-link {
          padding: 10px 20px;
          border-radius: 999px;
          border: 1px solid var(--tb-border);
          background: var(--tb-surface);
          color: var(--tb-text);
          font-size: 14px;
          font-weight: 500;
          text-decoration: none;
          transition: transform 0.2s ease, border-color 0.2s ease;
        }
        .tb-link:hover {
          transform: translateY(-2px);
          border-color: var(--tpl-accent, #7c6cff);
        }

        .tb-stats {
          display: flex;
          gap: 48px;
          margin-top: 32px;
          flex-wrap: wrap;
          justify-content: center;
        }
        .tb-stat {
          text-align: center;
        }
        .tb-stat-num {
          display: block;
          font-size: clamp(2rem, 4vw, 2.8rem);
          font-weight: 700;
          color: var(--tpl-accent, #7c6cff);
        }
        .tb-stat p {
          margin: 4px 0 0;
          font-size: 13px;
          color: var(--tb-muted);
        }

        .tb-sec {
          padding: 64px 0;
          border-bottom: 1px solid var(--tb-border);
        }
        .tb-sec:last-of-type {
          border-bottom: none;
        }

        .tb-kicker {
          text-transform: uppercase;
          letter-spacing: 0.14em;
          font-size: 12px;
          font-weight: 600;
          color: var(--tpl-accent, #7c6cff);
          margin: 0 0 8px;
        }

        .tb-h2 {
          font-size: clamp(1.6rem, 3vw, 2.2rem);
          font-weight: 700;
          letter-spacing: -0.01em;
          margin: 0 0 24px;
        }

        .tb-about {
          color: var(--tb-muted);
          font-size: 1.05rem;
          max-width: 640px;
        }

        .tb-projects {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .tb-project {
          display: grid;
          grid-template-columns: 220px 1fr;
          gap: 24px;
          padding: 20px;
          border-radius: 20px;
          border: 1px solid var(--tb-border);
          background: var(--tb-surface);
          text-decoration: none;
          color: var(--tb-text);
          transition: border-color 0.2s ease, transform 0.2s ease;
        }
        .tb-project:hover {
          border-color: var(--tpl-accent, #7c6cff);
          transform: translateY(-3px);
        }
        .tb-proj-img {
          width: 100%;
          height: 150px;
          object-fit: cover;
          border-radius: 12px;
        }
        .tb-proj-body {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .tb-proj-index {
          font-size: 12px;
          color: var(--tb-muted);
          letter-spacing: 0.05em;
        }
        .tb-proj-body h3 {
          margin: 0;
          font-size: 1.25rem;
        }
        .tb-proj-role {
          margin: 0;
          color: var(--tpl-accent, #7c6cff);
          font-size: 13px;
          font-weight: 600;
        }
        .tb-proj-desc {
          margin: 0;
          color: var(--tb-muted);
          font-size: 14px;
        }
        .tb-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 6px;
        }
        .tb-tags span {
          font-size: 12px;
          padding: 4px 10px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.06);
          color: var(--tb-muted);
        }

        @media (max-width: 640px) {
          .tb-project {
            grid-template-columns: 1fr;
          }
        }

        .tb-timeline {
          display: flex;
          flex-direction: column;
          gap: 28px;
        }
        .tb-timeline-row {
          display: grid;
          grid-template-columns: 140px 1fr;
          gap: 20px;
        }
        .tb-when-lead {
          color: var(--tb-muted);
          font-size: 13px;
          font-weight: 600;
        }
        .tb-row h3 {
          margin: 0 0 4px;
          font-size: 1.1rem;
        }
        .tb-row-sub {
          margin: 0;
          color: var(--tb-muted);
          font-size: 14px;
        }
        .tb-row-desc {
          margin: 8px 0 0;
          color: var(--tb-muted);
          font-size: 14px;
        }
        .tb-when {
          margin-left: 8px;
          color: var(--tb-muted);
        }

        @media (max-width: 560px) {
          .tb-timeline-row {
            grid-template-columns: 1fr;
            gap: 6px;
          }
        }

        .tb-skills {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        .tb-skill {
          padding: 10px 18px;
          border-radius: 999px;
          border: 1px solid var(--tb-border);
          background: var(--tb-surface);
          font-size: 14px;
          transition: border-color 0.2s ease, transform 0.2s ease;
        }
        .tb-skill:hover {
          border-color: var(--tpl-accent, #7c6cff);
          transform: translateY(-2px);
        }

        .tb-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 18px;
        }
        .tb-card {
          padding: 24px;
          border-radius: 20px;
          border: 1px solid var(--tb-border);
          background: var(--tb-surface);
          transition: border-color 0.2s ease, transform 0.2s ease;
        }
        .tb-card:hover {
          border-color: var(--tpl-accent, #7c6cff);
          transform: translateY(-3px);
        }
        .tb-card h3 {
          margin: 0 0 6px;
          font-size: 1.15rem;
        }

        .tb-testi-card {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .tb-quote {
          font-size: 15px;
          color: var(--tb-text);
          margin: 0 0 16px;
        }
        .tb-cite {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .tb-cite-av {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          object-fit: cover;
        }

        .tb-gallery {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 16px;
        }
        .tb-gal img {
          width: 100%;
          border-radius: 16px;
        }
        .tb-gal figcaption {
          margin-top: 6px;
          font-size: 13px;
          color: var(--tb-muted);
        }

        .tb-videos {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 16px;
        }
        .tb-video {
          position: relative;
          padding-top: 56.25%;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid var(--tb-border);
        }
        .tb-video iframe {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          border: 0;
        }

        .tb-foot {
          text-align: center;
          padding-top: 40px;
          font-size: 12px;
          color: var(--tb-muted);
        }
      `}</style>
    </div>
  );
}
