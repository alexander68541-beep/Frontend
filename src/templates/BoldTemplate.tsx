import type { PublicPortfolio } from "@/lib/publicTypes";
import { dateRange, videoEmbed } from "@/lib/publicTypes";
import { LinkChip } from "@/components/LinkChip";
import { ZoomImage } from "@/components/ZoomImage";
import React from "react";

export function BoldTemplate({ data }: { data: PublicPortfolio }) {
  const p = data.profile;
  const name = p?.display_name || data.username || "Untitled";
  const accentColor = data.accent || "#7c6cff";

  return (
    <>
      <style>{`
        :root {
          --bg-color: #0f1115;
          --glass-bg: rgba(255, 255, 255, 0.03);
          --glass-border: rgba(255, 255, 255, 0.08);
          --text-primary: #f3f4f6;
          --text-secondary: #9ca3af;
          --accent: ${accentColor};
          --accent-glow: ${accentColor}40;
        }

        .tpl-bold {
          background-color: var(--bg-color);
          color: var(--text-primary);
          font-family: 'Inter', system-ui, sans-serif;
          min-height: 100vh;
          position: relative;
          overflow: hidden;
          padding: 3rem 1.5rem;
          line-height: 1.6;
        }

        /* Aurora Background Effect */
        .tb-aurora {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          z-index: 0;
          overflow: hidden;
          pointer-events: none;
        }
        .tb-aurora span {
          position: absolute;
          filter: blur(120px);
          opacity: 0.5;
          animation: float 10s infinite alternate ease-in-out;
        }
        .tb-aurora span:nth-child(1) {
          background: var(--accent);
          width: 40vw;
          height: 40vw;
          top: -10%;
          left: -10%;
          border-radius: 50%;
        }
        .tb-aurora span:nth-child(2) {
          background: #4f46e5;
          width: 30vw;
          height: 30vw;
          bottom: 10%;
          right: -5%;
          border-radius: 50%;
          animation-delay: -5s;
        }

        @keyframes float {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(20px, 40px) scale(1.1); }
        }

        .tb-wrap {
          position: relative;
          z-index: 1;
          max-width: 800px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 4rem;
        }

        /* Glassmorphism Sections */
        .tb-sec, .tb-hero {
          background: var(--glass-bg);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid var(--glass-border);
          border-radius: 24px;
          padding: 2.5rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .tb-sec:hover {
          box-shadow: 0 12px 48px var(--accent-glow);
        }

        /* Hero Section */
        .tb-hero {
          text-align: center;
          padding: 4rem 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .tb-avatar {
          width: 140px;
          height: 140px;
          border-radius: 50%;
          object-fit: cover;
          border: 4px solid var(--glass-border);
          box-shadow: 0 0 30px var(--accent-glow);
          margin-bottom: 1.5rem;
        }
        .tb-eyebrow {
          color: var(--accent);
          font-weight: 600;
          letter-spacing: 2px;
          text-transform: uppercase;
          font-size: 0.85rem;
          margin-bottom: 0.5rem;
        }
        .tb-name {
          font-size: 3rem;
          font-weight: 800;
          letter-spacing: -1px;
          margin: 0 0 1rem 0;
          background: linear-gradient(to right, #fff, var(--text-secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .tb-tagline {
          font-size: 1.25rem;
          color: var(--text-secondary);
          margin-bottom: 0.5rem;
        }
        .tb-loc {
          font-size: 0.95rem;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .tb-loc::before {
          content: "📍";
        }
        .tb-bio {
          margin-top: 1.5rem;
          font-size: 1.05rem;
          max-width: 600px;
          color: var(--text-primary);
        }
        .tb-links {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          justify-content: center;
          margin-top: 2rem;
        }

        /* Section Typography */
        .tb-h2 {
          font-size: 1.75rem;
          font-weight: 700;
          margin: 0 0 2rem 0;
          position: relative;
          display: inline-block;
        }
        .tb-h2::after {
          content: '';
          position: absolute;
          bottom: -8px;
          left: 0;
          width: 40px;
          height: 3px;
          background: var(--accent);
          border-radius: 2px;
        }

        /* Lists & Rows */
        .tb-row {
          margin-bottom: 2rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid var(--glass-border);
        }
        .tb-row:last-child {
          margin-bottom: 0;
          padding-bottom: 0;
          border-bottom: none;
        }
        .tb-row h3 {
          font-size: 1.25rem;
          margin: 0 0 0.25rem 0;
        }
        .tb-row h3 a {
          color: var(--text-primary);
          text-decoration: none;
          transition: color 0.2s;
        }
        .tb-row h3 a:hover {
          color: var(--accent);
        }
        .tb-row-sub {
          color: var(--accent);
          font-size: 0.95rem;
          font-weight: 500;
          margin: 0 0 1rem 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .tb-when {
          color: var(--text-secondary);
          font-weight: 400;
          font-size: 0.85rem;
          background: rgba(255,255,255,0.05);
          padding: 4px 10px;
          border-radius: 12px;
        }
        .tb-row-desc {
          color: var(--text-secondary);
        }

        /* Grid Layouts (Projects, Services, Gallery) */
        .tb-projects, .tb-cards, .tb-gallery {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }
        .tb-project, .tb-card {
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid var(--glass-border);
          border-radius: 16px;
          overflow: hidden;
          text-decoration: none;
          color: var(--text-primary);
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
        }
        .tb-project:hover, .tb-card:hover {
          transform: translateY(-5px);
          border-color: var(--accent);
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }
        .tb-proj-img {
          width: 100%;
          height: 200px;
          object-fit: cover;
          border-bottom: 1px solid var(--glass-border);
        }
        .tb-proj-body, .tb-card {
          padding: 1.5rem;
        }
        .tb-proj-body h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.25rem;
        }
        .tb-proj-role {
          color: var(--accent);
          font-size: 0.9rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }
        .tb-proj-desc {
          color: var(--text-secondary);
          font-size: 0.95rem;
          margin-bottom: 1rem;
        }
        .tb-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: auto;
        }
        .tb-tags span {
          background: var(--glass-border);
          color: var(--text-secondary);
          font-size: 0.75rem;
          padding: 4px 10px;
          border-radius: 20px;
        }

        /* Skills */
        .tb-skills {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
        }
        .tb-skill {
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--glass-border);
          padding: 8px 16px;
          border-radius: 12px;
          font-size: 0.95rem;
          transition: all 0.3s;
        }
        .tb-skill:hover {
          background: var(--accent);
          border-color: var(--accent);
          color: #fff;
          transform: translateY(-2px);
        }

        /* Videos & Gallery */
        .tb-video {
          position: relative;
          padding-bottom: 56.25%; /* 16:9 */
          height: 0;
          border-radius: 16px;
          overflow: hidden;
          margin-bottom: 1.5rem;
        }
        .tb-video iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: 0;
        }
        .tb-gal {
          margin: 0;
          border-radius: 16px;
          overflow: hidden;
          position: relative;
        }
        .tb-gal img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }
        .tb-gal:hover img {
          transform: scale(1.05);
        }
        .tb-gal figcaption {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          background: linear-gradient(transparent, rgba(0,0,0,0.8));
          padding: 1.5rem 1rem 1rem;
          font-size: 0.9rem;
          color: #fff;
        }

        /* Testimonials */
        .tb-quote {
          font-size: 1.1rem;
          font-style: italic;
          color: var(--text-primary);
          margin-bottom: 1.5rem;
          line-height: 1.8;
        }
        .tb-cite {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-top: auto;
        }
        .tb-cite-av {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          object-fit: cover;
        }

        /* Contact Links */
        .tb-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 10px 24px;
          background: var(--glass-border);
          color: var(--text-primary);
          text-decoration: none;
          border-radius: 30px;
          font-weight: 500;
          transition: all 0.3s;
          border: 1px solid transparent;
        }
        .tb-link:hover {
          background: var(--accent-glow);
          border-color: var(--accent);
          color: #fff;
        }

        /* Footer */
        .tb-foot {
          text-align: center;
          color: var(--text-secondary);
          font-size: 0.9rem;
          padding: 2rem 0;
          opacity: 0.6;
        }
      `}</style>

      <div className="tpl-bold">
        {/* Animated Background */}
        <div className="tb-aurora" aria-hidden>
          <span />
          <span />
        </div>

        <div className="tb-wrap">
          <header className="tb-hero">
            {p?.avatar_url && (
              <ZoomImage className="tb-avatar" src={p.avatar_url} alt={name} />
            )}
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
              <div className="tb-links">
                {data.links.map((l) => (
                  <LinkChip
                    key={l.id}
                    className="tb-link"
                    platform={l.platform}
                    url={l.url}
                    label={l.label}
                  />
                ))}
              </div>
            )}
          </header>

          {p?.about && (
            <section className="tb-sec">
              <h2 className="tb-h2">About</h2>
              <p className="tb-about">{p.about}</p>
            </section>
          )}

          {data.projects.length > 0 && (
            <section className="tb-sec">
              <h2 className="tb-h2">Selected Work</h2>
              <div className="tb-projects">
                {data.projects.map((pr) => (
                  <a
                    key={pr.id}
                    className="tb-project"
                    href={pr.url || undefined}
                    target={pr.url ? "_blank" : undefined}
                    rel="noreferrer"
                  >
                    {pr.image_url && (
                      <img
                        src={pr.image_url}
                        alt={pr.title}
                        className="tb-proj-img"
                      />
                    )}
                    <div className="tb-proj-body">
                      <h3>{pr.title}</h3>
                      {pr.role && <p className="tb-proj-role">{pr.role}</p>}
                      {pr.description && (
                        <p className="tb-proj-desc">{pr.description}</p>
                      )}
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

          {data.experience.length > 0 && (
            <section className="tb-sec">
              <h2 className="tb-h2">Experience</h2>
              {data.experience.map((x) => (
                <div key={x.id} className="tb-row">
                  <h3>{x.title || x.company}</h3>
                  <p className="tb-row-sub">
                    {[x.company, x.location].filter(Boolean).join(" · ")}
                    <span className="tb-when">
                      {dateRange(x.start_date, x.end_date, x.is_current)}
                    </span>
                  </p>
                  {x.description && (
                    <p className="tb-row-desc">{x.description}</p>
                  )}
                </div>
              ))}
            </section>
          )}

          {data.education.length > 0 && (
            <section className="tb-sec">
              <h2 className="tb-h2">Education</h2>
              {data.education.map((ed) => (
                <div key={ed.id} className="tb-row">
                  <h3>{ed.school}</h3>
                  <p className="tb-row-sub">
                    {[ed.degree, ed.field].filter(Boolean).join(", ")}
                    <span className="tb-when">
                      {dateRange(ed.start_date, ed.end_date)}
                    </span>
                  </p>
                  {ed.description && (
                    <p className="tb-row-desc">{ed.description}</p>
                  )}
                </div>
              ))}
            </section>
          )}

          {data.skills.length > 0 && (
            <section className="tb-sec">
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

          {data.services.length > 0 && (
            <section className="tb-sec">
              <h2 className="tb-h2">Services</h2>
              <div className="tb-cards">
                {data.services.map((s) => (
                  <div key={s.id} className="tb-card">
                    <h3>{s.title}</h3>
                    {s.price && <p className="tb-proj-role">{s.price}</p>}
                    {s.description && (
                      <p className="tb-proj-desc">{s.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {data.certifications.length > 0 && (
            <section className="tb-sec">
              <h2 className="tb-h2">Certifications</h2>
              {data.certifications.map((c) => (
                <div key={c.id} className="tb-row">
                  <h3>
                    {c.url ? (
                      <a href={c.url} target="_blank" rel="noreferrer">
                        {c.name}
                      </a>
                    ) : (
                      c.name
                    )}
                  </h3>
                  <p className="tb-row-sub">
                    {c.issuer}
                    <span className="tb-when">{c.issue_date}</span>
                  </p>
                </div>
              ))}
            </section>
          )}

          {data.achievements.length > 0 && (
            <section className="tb-sec">
              <h2 className="tb-h2">Achievements</h2>
              {data.achievements.map((a) => (
                <div key={a.id} className="tb-row">
                  <h3>{a.title}</h3>
                  <p className="tb-row-sub">
                    <span className="tb-when">{a.date}</span>
                  </p>
                  {a.description && (
                    <p className="tb-row-desc">{a.description}</p>
                  )}
                </div>
              ))}
            </section>
          )}

          {data.publications.length > 0 && (
            <section className="tb-sec">
              <h2 className="tb-h2">Publications</h2>
              {data.publications.map((pub) => (
                <div key={pub.id} className="tb-row">
                  <h3>
                    {pub.url ? (
                      <a href={pub.url} target="_blank" rel="noreferrer">
                        {pub.title}
                      </a>
                    ) : (
                      pub.title
                    )}
                  </h3>
                  <p className="tb-row-sub">
                    {pub.publisher}
                    <span className="tb-when">{pub.date}</span>
                  </p>
                  {pub.description && (
                    <p className="tb-row-desc">{pub.description}</p>
                  )}
                </div>
              ))}
            </section>
          )}

          {data.gallery.length > 0 && (
            <section className="tb-sec">
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

          {data.videos.length > 0 && (
            <section className="tb-sec">
              <h2 className="tb-h2">Videos</h2>
              <div className="tb-videos">
                {data.videos.map((v) => {
                  const embed = videoEmbed(v.url);
                  return (
                    <div key={v.id}>
                      {embed ? (
                        <div className="tb-video">
                          <iframe
                            src={embed}
                            title={v.title || "Video"}
                            allowFullScreen
                          />
                        </div>
                      ) : (
                        <a
                          className="tb-link"
                          href={v.url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {v.title || v.url}
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {data.testimonials.length > 0 && (
            <section className="tb-sec">
              <h2 className="tb-h2">Testimonials</h2>
              <div className="tb-cards">
                {data.testimonials.map((t) => (
                  <div key={t.id} className="tb-card">
                    <p className="tb-quote">&ldquo;{t.quote}&rdquo;</p>
                    <div className="tb-cite">
                      {t.avatar_url && (
                        <img
                          className="tb-cite-av"
                          src={t.avatar_url}
                          alt={t.author}
                        />
                      )}
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
                  <a
                    className="tb-link"
                    href={p.website}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Website ↗
                  </a>
                )}
                {p?.resume_url && (
                  <a
                    className="tb-link"
                    href={p.resume_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Résumé ↗
                  </a>
                )}
              </div>
            </section>
          )}

          {!data.hide_branding && (
            <footer className="tb-foot">Made with Folio</footer>
          )}
        </div>
      </div>
    </>
  );
}
