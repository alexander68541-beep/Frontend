"use client";

import { useEffect, useRef, useState } from "react";
import type { PublicPortfolio } from "@/lib/publicTypes";
import { dateRange, videoEmbed, ext } from "@/lib/publicTypes";
import { fontStack } from "@/lib/fonts";
import { LinkChip } from "@/components/LinkChip";
import { ZoomImage } from "@/components/ZoomImage";
import { ContactForm } from "@/components/ContactForm";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

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

function yearsOfExperience(experience: PublicPortfolio["experience"]): number {
  if (!experience?.length) return 0;
  const starts = experience
    .map((x) => (x.start_date ? new Date(x.start_date).getTime() : null))
    .filter((t): t is number => !!t);
  if (!starts.length) return 0;
  const earliest = Math.min(...starts);
  return Math.max(1, Math.round((Date.now() - earliest) / (365.25 * 24 * 3600 * 1000)));
}

/** Where the "Let's talk" buttons should point — real contact info first, then in-page contact section. */
function talkHref(p: PublicPortfolio["profile"]): string {
  if (p?.email) return `mailto:${p.email}`;
  return "#tb-contact";
}

type TimelineItem = {
  id: string;
  kind: "experience" | "education";
  when: string;
  title: string;
  sub: string;
  desc?: string | null;
  sortKey: number;
};

function buildTimeline(data: PublicPortfolio, showExp: boolean, showEdu: boolean): TimelineItem[] {
  const items: TimelineItem[] = [];
  if (showExp) {
    for (const x of data.experience) {
      items.push({
        id: `exp-${x.id}`,
        kind: "experience",
        when: dateRange(x.start_date, x.end_date, x.is_current),
        title: x.title || x.company || "",
        sub: [x.company, x.location].filter(Boolean).join(" · "),
        desc: x.description,
        sortKey: x.start_date ? new Date(x.start_date).getTime() : 0,
      });
    }
  }
  if (showEdu) {
    for (const ed of data.education) {
      items.push({
        id: `edu-${ed.id}`,
        kind: "education",
        when: dateRange(ed.start_date, ed.end_date),
        title: ed.school || "",
        sub: [ed.degree, ed.field].filter(Boolean).join(", "),
        desc: ed.description,
        sortKey: ed.start_date ? new Date(ed.start_date).getTime() : 0,
      });
    }
  }
  return items.sort((a, b) => b.sortKey - a.sortKey);
}

/* ------------------------------------------------------------------ */
/* Template                                                            */
/* ------------------------------------------------------------------ */

export function GlassTemplate({ data }: { data: PublicPortfolio }) {
  const p = data.profile;
  const hidden = new Set(data.settings?.hidden ?? []);
  const sv = (k: string) => !hidden.has(k);
  const fontFam = fontStack(data.settings?.font);
  const name = p?.display_name || data.username || "Untitled";

  const years = yearsOfExperience(data.experience);
  const awardsCount = data.certifications.length + data.achievements.length;
  const projectCount = data.projects.length;
  const testimonialCount = data.testimonials.length;
  const talk = talkHref(p);

  const timeline = buildTimeline(data, sv("experience"), sv("education"));
  const awardsList = [
    ...data.certifications.map((c) => ({ id: `cert-${c.id}`, title: c.name, org: c.issuer, when: c.issue_date })),
    ...data.achievements.map((a) => ({ id: `ach-${a.id}`, title: a.title, org: undefined, when: a.date })),
  ];

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
        {/* ---------- Intro card ---------- */}
        <header className="tb-intro">
          {p?.availability && <span className="tb-badge">{p.availability}</span>}
          <div className="tb-intro-row">
            {p?.avatar_url && <ZoomImage className="tb-avatar" src={p.avatar_url} alt={name} />}
            <div>
              <p className="tb-hey">
                Hey, I&apos;m {name}
                {p?.title ? ` ${p.title}` : ""}
              </p>
              {p?.tagline && <p className="tb-intro-sub">{p.tagline}</p>}
            </div>
          </div>
          <div className="tb-cta-row">
            <a className="tb-btn tb-btn-primary" href={talk}>
              Let&apos;s talk
            </a>
            {p?.resume_url && (
              <a className="tb-btn tb-btn-ghost" href={ext(p.resume_url)} target="_blank" rel="noreferrer">
                Download CV
              </a>
            )}
          </div>
        </header>

        {/* ---------- Big hero ---------- */}
        <section className="tb-hero-main">
          <p className="tb-hero-name">{name}</p>
          {p?.title && <p className="tb-hero-title">{p.title}</p>}
          {(p?.bio || p?.tagline) && <h1 className="tb-headline">{p?.bio || p?.tagline}</h1>}

          {data.links.length > 0 && (
            <div className="tb-links">
              {data.links.map((l) => (
                <LinkChip key={l.id} className="tb-link" platform={l.platform} url={l.url} label={l.label} />
              ))}
            </div>
          )}

          {(years > 0 || awardsCount > 0 || projectCount > 0) && (
            <div className="tb-stats">
              {years > 0 && (
                <div className="tb-stat">
                  <CountUp value={years} suffix="+" />
                  <p>Years of experience</p>
                </div>
              )}
              {awardsCount > 0 && (
                <div className="tb-stat">
                  <CountUp value={awardsCount} suffix="x" />
                  <p>Awards &amp; certifications</p>
                </div>
              )}
              {projectCount > 0 && (
                <div className="tb-stat">
                  <CountUp value={projectCount} suffix="+" />
                  <p>Projects delivered</p>
                </div>
              )}
            </div>
          )}
        </section>

        {/* ---------- About ---------- */}
        {sv("about") && (p?.about || awardsList.length > 0) && (
          <section className="tb-sec" data-sec="about">
            <p className="tb-kicker">About</p>
            {p?.about && <p className="tb-about">{p.about}</p>}
            {awardsList.length > 0 && (
              <ul className="tb-awards">
                {awardsList.map((a) => (
                  <li key={a.id}>
                    <span className="tb-award-title">{a.title}</span>
                    {a.org && <span className="tb-award-org">{a.org}</span>}
                    {a.when && <span className="tb-award-year">{a.when}</span>}
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {/* ---------- Education & Experience ---------- */}
        {timeline.length > 0 && (
          <section className="tb-sec" data-sec="experience">
            <p className="tb-kicker">Education &amp; Experience</p>
            <div className="tb-timeline">
              {timeline.map((t) => (
                <div key={t.id} className="tb-timeline-row">
                  <span className="tb-when-lead">{t.when}</span>
                  <div>
                    <h3>{t.title}</h3>
                    {t.sub && <p className="tb-row-sub">{t.sub}</p>}
                    {t.desc && <p className="tb-row-desc">{t.desc}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ---------- Work Highlights ---------- */}
        {sv("projects") && data.projects.length > 0 && (
          <section className="tb-sec">
            <p className="tb-kicker">Work Highlights</p>
            <div className="tb-projects">
              {data.projects.map((pr, i) => (
                <article key={pr.id} className="tb-project">
                  {pr.image_url && <img src={pr.image_url} alt={pr.title} className="tb-proj-img" />}
                  <div className="tb-proj-body">
                    <h3>{pr.title}</h3>
                    {pr.description && <p className="tb-proj-desc">{pr.description}</p>}
                    <div className="tb-proj-meta">
                      {pr.role && (
                        <div>
                          <span className="tb-meta-label">Role</span>
                          <span>{pr.role}</span>
                        </div>
                      )}
                      {pr.tags.length > 0 && (
                        <div>
                          <span className="tb-meta-label">Tags</span>
                          <span>{pr.tags.join(", ")}</span>
                        </div>
                      )}
                    </div>
                    <div className="tb-proj-foot">
                      {pr.url ? (
                        <a className="tb-btn tb-btn-primary tb-btn-sm" href={ext(pr.url)} target="_blank" rel="noreferrer">
                          Let&apos;s talk
                        </a>
                      ) : (
                        <a className="tb-btn tb-btn-primary tb-btn-sm" href={talk}>
                          Let&apos;s talk
                        </a>
                      )}
                      <span className="tb-proj-index">
                        {String(i + 1).padStart(2, "0")} / {String(data.projects.length).padStart(2, "0")}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* ---------- Services ---------- */}
        {sv("services") && data.services.length > 0 && (
          <section className="tb-sec" data-sec="services">
            <p className="tb-kicker">Services</p>
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

        {/* ---------- Tech Stack ---------- */}
        {sv("skills") && data.skills.length > 0 && (
          <section className="tb-sec" data-sec="skills">
            <p className="tb-kicker">Tech Stack</p>
            <h2 className="tb-h2">See how my expertise with these tools drives better results</h2>
            <div className="tb-skillbars">
              {data.skills.map((s) => {
                const level = (s as { level?: number }).level;
                return (
                  <div key={s.id} className="tb-skillbar">
                    <div className="tb-skillbar-top">
                      <span>{s.name}</span>
                      {typeof level === "number" && <span>{level}%</span>}
                    </div>
                    {typeof level === "number" && (
                      <div className="tb-skillbar-track">
                        <div className="tb-skillbar-fill" style={{ width: `${Math.min(100, Math.max(0, level))}%` }} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ---------- Certifications / Achievements / Publications (kept, shown outside About too if not already covered) ---------- */}
        {sv("publications") && data.publications.length > 0 && (
          <section className="tb-sec" data-sec="publications">
            <p className="tb-kicker">Publications</p>
            <div className="tb-timeline">
              {data.publications.map((pub) => (
                <div key={pub.id} className="tb-timeline-row">
                  <span className="tb-when-lead">{pub.date}</span>
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

        {/* ---------- Gallery ---------- */}
        {sv("gallery") && data.gallery.length > 0 && (
          <section className="tb-sec" data-sec="gallery">
            <p className="tb-kicker">Gallery</p>
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

        {/* ---------- Videos ---------- */}
        {sv("videos") && data.videos.length > 0 && (
          <section className="tb-sec" data-sec="videos">
            <p className="tb-kicker">Videos</p>
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

        {/* ---------- Testimonials ---------- */}
        {sv("testimonials") && data.testimonials.length > 0 && (
          <section className="tb-sec" data-sec="testimonials">
            <p className="tb-kicker">Testimonials</p>
            <h2 className="tb-h2">Here&apos;s what people are saying</h2>
            {(projectCount > 0 || testimonialCount > 0) && (
              <div className="tb-stats tb-stats-left">
                {projectCount > 0 && (
                  <div className="tb-stat">
                    <CountUp value={projectCount} suffix="+" />
                    <p>Finalized projects</p>
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

        {/* ---------- Contact ---------- */}
        <section className="tb-sec" id="tb-contact">
          <p className="tb-kicker">Contact</p>
          <h2 className="tb-h2">Let&apos;s build something together</h2>
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
          {data.username && (
            <div className="tb-contact-form">
              <ContactForm username={data.username} />
            </div>
          )}
        </section>

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
          max-width: 980px;
          margin: 0 auto;
          padding: 64px 24px 64px;
        }

        /* Intro card */
        .tb-intro {
          border: 1px solid var(--tb-border);
          background: var(--tb-surface);
          border-radius: 24px;
          padding: 28px;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }
        .tb-badge {
          align-self: flex-start;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 16px;
          border-radius: 999px;
          border: 1px solid var(--tb-border);
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
        .tb-intro-row {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }
        .tb-avatar {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid var(--tb-border);
          flex-shrink: 0;
        }
        .tb-hey {
          margin: 0;
          font-size: 1.2rem;
          font-weight: 600;
        }
        .tb-intro-sub {
          margin: 4px 0 0;
          color: var(--tb-muted);
          font-size: 14px;
        }
        .tb-cta-row {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        .tb-btn {
          padding: 10px 22px;
          border-radius: 999px;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          transition: transform 0.2s ease, opacity 0.2s ease;
        }
        .tb-btn:hover {
          transform: translateY(-2px);
        }
        .tb-btn-primary {
          background: var(--tpl-accent, #7c6cff);
          color: #0a0a0d;
        }
        .tb-btn-ghost {
          border: 1px solid var(--tb-border);
          color: var(--tb-text);
        }
        .tb-btn-sm {
          padding: 7px 16px;
          font-size: 13px;
        }

        /* Big hero */
        .tb-hero-main {
          text-align: center;
          padding: 72px 0 56px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }
        .tb-hero-name {
          text-transform: uppercase;
          letter-spacing: 0.14em;
          font-size: 13px;
          color: var(--tpl-accent, #7c6cff);
          font-weight: 700;
          margin: 0;
        }
        .tb-hero-title {
          margin: 0;
          color: var(--tb-muted);
          font-size: 14px;
        }
        .tb-headline {
          font-size: clamp(2.2rem, 6vw, 4rem);
          line-height: 1.08;
          font-weight: 700;
          letter-spacing: -0.02em;
          max-width: 760px;
          margin: 10px 0;
          background: linear-gradient(180deg, #fff 0%, #b9b9c6 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .tb-links {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          justify-content: center;
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
          margin-top: 24px;
          flex-wrap: wrap;
          justify-content: center;
        }
        .tb-stats-left {
          justify-content: flex-start;
          margin-bottom: 24px;
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

        /* Sections */
        .tb-sec {
          padding: 56px 0;
          border-top: 1px solid var(--tb-border);
        }
        .tb-kicker {
          text-transform: uppercase;
          letter-spacing: 0.14em;
          font-size: 12px;
          font-weight: 700;
          color: var(--tpl-accent, #7c6cff);
          margin: 0 0 16px;
        }
        .tb-h2 {
          font-size: clamp(1.5rem, 3vw, 2rem);
          font-weight: 700;
          letter-spacing: -0.01em;
          margin: 0 0 24px;
          max-width: 640px;
        }
        .tb-about {
          color: var(--tb-muted);
          font-size: 1.05rem;
          max-width: 640px;
          margin: 0 0 28px;
        }

        /* Awards list */
        .tb-awards {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
        }
        .tb-awards li {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          padding: 14px 0;
          border-top: 1px solid var(--tb-border);
          font-size: 14px;
          flex-wrap: wrap;
        }
        .tb-award-title {
          font-weight: 600;
        }
        .tb-award-org,
        .tb-award-year {
          color: var(--tb-muted);
        }

        /* Timeline */
        .tb-timeline {
          display: flex;
          flex-direction: column;
        }
        .tb-timeline-row {
          display: grid;
          grid-template-columns: 140px 1fr;
          gap: 20px;
          padding: 20px 0;
          border-top: 1px solid var(--tb-border);
        }
        .tb-timeline-row:first-child {
          border-top: none;
        }
        .tb-when-lead {
          color: var(--tb-muted);
          font-size: 13px;
          font-weight: 600;
        }
        .tb-timeline-row h3 {
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

        @media (max-width: 560px) {
          .tb-timeline-row {
            grid-template-columns: 1fr;
            gap: 6px;
          }
        }

        /* Projects */
        .tb-projects {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .tb-project {
          display: grid;
          grid-template-columns: 260px 1fr;
          gap: 24px;
          padding: 24px;
          border-radius: 20px;
          border: 1px solid var(--tb-border);
          background: var(--tb-surface);
          transition: border-color 0.2s ease, transform 0.2s ease;
        }
        .tb-project:hover {
          border-color: var(--tpl-accent, #7c6cff);
          transform: translateY(-3px);
        }
        .tb-proj-img {
          width: 100%;
          height: 170px;
          object-fit: cover;
          border-radius: 14px;
        }
        .tb-proj-body h3 {
          margin: 0 0 8px;
          font-size: 1.4rem;
        }
        .tb-proj-desc {
          margin: 0 0 16px;
          color: var(--tb-muted);
          font-size: 14px;
        }
        .tb-proj-role {
          margin: 0;
          color: var(--tpl-accent, #7c6cff);
          font-size: 13px;
          font-weight: 600;
        }
        .tb-proj-meta {
          display: flex;
          gap: 32px;
          flex-wrap: wrap;
          margin-bottom: 20px;
        }
        .tb-meta-label {
          display: block;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-size: 11px;
          color: var(--tb-muted);
          margin-bottom: 4px;
        }
        .tb-proj-foot {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .tb-proj-index {
          font-size: 12px;
          color: var(--tb-muted);
          letter-spacing: 0.05em;
        }

        @media (max-width: 640px) {
          .tb-project {
            grid-template-columns: 1fr;
          }
        }

        /* Cards */
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

        /* Skill bars */
        .tb-skillbars {
          display: flex;
          flex-direction: column;
          gap: 22px;
        }
        .tb-skillbar-top {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
          margin-bottom: 8px;
        }
        .tb-skillbar-track {
          height: 6px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.06);
          overflow: hidden;
        }
        .tb-skillbar-fill {
          height: 100%;
          border-radius: 999px;
          background: var(--tpl-accent, #7c6cff);
        }

        /* Gallery / Videos */
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

        .tb-bio {
          color: var(--tb-muted);
          font-size: 14px;
          margin: 0 0 16px;
        }
        .tb-contact-form {
          margin-top: 24px;
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
