import type { PublicPortfolio } from "@/lib/publicTypes";
import { dateRange, videoEmbed } from "@/lib/publicTypes";
import { LinkChip } from "@/components/LinkChip";
import { ZoomImage } from "@/components/ZoomImage";
import React from "react";

export function AuroraTemplate({ data }: { data: PublicPortfolio }) {
  const p = data.profile;
  const name = p?.display_name || data.username || "Untitled";
  const defaultLime = "#b4f437";
  const accentColor = data.accent || defaultLime;

  return (
    <>
      <style>{`
        :root {
          --bg-main: #060907;
          --bg-card: rgba(18, 26, 17, 0.65);
          --card-border: rgba(180, 244, 55, 0.22);
          --card-border-hover: rgba(180, 244, 55, 0.7);
          --accent-lime: ${accentColor};
          --accent-glow: ${accentColor}33;
          --accent-glow-strong: ${accentColor}66;
          --text-main: #f4fbf0;
          --text-muted: #8b9986;
          --pill-bg: rgba(180, 244, 55, 0.12);
        }

        .tpl-bold {
          background-color: var(--bg-main);
          background-image: 
            radial-gradient(circle at 50% 0%, rgba(180, 244, 55, 0.15) 0%, transparent 60%),
            radial-gradient(circle at 10% 40%, rgba(30, 60, 20, 0.25) 0%, transparent 50%),
            linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
          background-size: 100% 100%, 100% 100%, 40px 40px, 40px 40px;
          color: var(--text-main);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          min-height: 100vh;
          position: relative;
          overflow: hidden;
          padding: 3.5rem 1.25rem;
          line-height: 1.6;
        }

        /* Ambient Cyber-Green Glow */
        .tb-aurora {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
        }
        .tb-aurora span:nth-child(1) {
          position: absolute;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, var(--accent-glow-strong) 0%, transparent 70%);
          top: -150px;
          left: 50%;
          transform: translateX(-50%);
          filter: blur(80px);
        }
        .tb-aurora span:nth-child(2) {
          position: absolute;
          width: 450px;
          height: 450px;
          background: radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%);
          bottom: 5%;
          right: -100px;
          filter: blur(90px);
        }

        .tb-wrap {
          position: relative;
          z-index: 1;
          max-width: 860px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 3.5rem;
        }

        /* Folder & Frosted Glass Card Architecture */
        .tb-sec, .tb-hero {
          background: var(--bg-card);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid var(--card-border);
          border-radius: 28px;
          padding: 2.5rem;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.1);
          transition: all 0.35s cubic-bezier(0.2, 0.8, 0.2, 1);
          position: relative;
        }

        .tb-sec:hover {
          border-color: var(--card-border-hover);
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.7), 0 0 25px var(--accent-glow);
        }

        /* Hero */
        .tb-hero {
          text-align: center;
          padding: 4.5rem 2rem 3rem;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .tb-avatar {
          width: 130px;
          height: 130px;
          border-radius: 36px;
          object-fit: cover;
          border: 2px solid var(--accent-lime);
          box-shadow: 0 0 35px var(--accent-glow-strong);
          margin-bottom: 1.75rem;
          background: #000;
        }
        .tb-eyebrow {
          display: inline-block;
          background: var(--pill-bg);
          color: var(--accent-lime);
          border: 1px solid rgba(180, 244, 55, 0.3);
          padding: 5px 16px;
          border-radius: 999px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
          font-size: 0.75rem;
          margin-bottom: 1.25rem;
          box-shadow: 0 0 15px var(--accent-glow);
        }
        .tb-name {
          font-size: clamp(2.5rem, 5vw, 4rem);
          font-weight: 900;
          letter-spacing: -1.5px;
          margin: 0 0 0.75rem 0;
          color: #ffffff;
          text-shadow: 0 2px 20px rgba(0, 0, 0, 0.8);
        }
        .tb-tagline {
          font-size: 1.25rem;
          color: var(--accent-lime);
          font-weight: 500;
          margin-bottom: 0.5rem;
        }
        .tb-loc {
          font-size: 0.95rem;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .tb-loc::before {
          content: "";
          display: inline-block;
          width: 8px;
          height: 8px;
          background-color: var(--accent-lime);
          border-radius: 50%;
          box-shadow: 0 0 8px var(--accent-lime);
        }
        .tb-bio {
          margin-top: 1.75rem;
          font-size: 1.05rem;
          max-width: 620px;
          color: #d1dcce;
        }

        /* Links / Floating Chips */
        .tb-links {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          justify-content: center;
          margin-top: 2rem;
        }
        .tb-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--card-border);
          color: var(--text-main);
          padding: 8px 18px;
          border-radius: 999px;
          text-decoration: none;
          font-size: 0.85rem;
          font-weight: 600;
          letter-spacing: 0.3px;
          transition: all 0.25s ease;
        }
        .tb-link:hover {
          background: var(--accent-lime);
          color: #060907;
          border-color: var(--accent-lime);
          transform: translateY(-2px);
          box-shadow: 0 5px 20px var(--accent-glow-strong);
        }

        /* Headings */
        .tb-h2 {
          font-size: 1.6rem;
          font-weight: 800;
          letter-spacing: -0.5px;
          margin: 0 0 2rem 0;
          color: #ffffff;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .tb-h2::before {
          content: "";
          display: inline-block;
          width: 14px;
          height: 14px;
          background: var(--accent-lime);
          border-radius: 4px;
          box-shadow: 0 0 10px var(--accent-lime);
        }
        .tb-about {
          font-size: 1.1rem;
          color: #d5e2d1;
          line-height: 1.8;
        }

        /* Work / Projects Cards */
        .tb-projects {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 1.75rem;
        }
        .tb-project {
          background: rgba(10, 15, 10, 0.6);
          border: 1px solid var(--card-border);
          border-radius: 20px;
          overflow: hidden;
          text-decoration: none;
          display: flex;
          flex-direction: column;
          transition: all 0.35s ease;
        }
        .tb-project:hover {
          border-color: var(--accent-lime);
          transform: translateY(-6px);
          box-shadow: 0 16px 35px rgba(0, 0, 0, 0.6), 0 0 20px var(--accent-glow);
        }
        .tb-proj-img {
          width: 100%;
          height: 220px;
          object-fit: cover;
          border-bottom: 1px solid var(--card-border);
        }
        .tb-proj-body {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }
        .tb-proj-body h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.3rem;
          font-weight: 700;
          color: #ffffff;
        }
        .tb-proj-role {
          color: var(--accent-lime);
          font-size: 0.85rem;
          font-weight: 700;
          text-transform: uppercase;
          margin-bottom: 0.5rem;
          letter-spacing: 0.5px;
        }
        .tb-proj-desc {
          color: var(--text-muted);
          font-size: 0.95rem;
          margin-bottom: 1.25rem;
        }
        .tb-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: auto;
        }
        .tb-tags span {
          background: var(--pill-bg);
          border: 1px solid rgba(180, 244, 55, 0.2);
          color: var(--accent-lime);
          font-size: 0.75rem;
          font-weight: 600;
          padding: 4px 12px;
          border-radius: 999px;
        }

        /* Timeline Rows (Experience, Edu, Certs, Pubs) */
        .tb-row {
          margin-bottom: 2rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }
        .tb-row:last-child {
          margin-bottom: 0;
          padding-bottom: 0;
          border-bottom: none;
        }
        .tb-row h3 {
          font-size: 1.25rem;
          margin: 0 0 0.4rem 0;
          color: #ffffff;
        }
        .tb-row h3 a {
          color: #ffffff;
          text-decoration: none;
          transition: color 0.2s;
        }
        .tb-row h3 a:hover {
          color: var(--accent-lime);
        }
        .tb-row-sub {
          color: var(--accent-lime);
          font-size: 0.95rem;
          font-weight: 600;
          margin: 0 0 0.85rem 0;
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          gap: 0.5rem;
        }
        .tb-when {
          color: var(--text-muted);
          font-size: 0.8rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 3px 12px;
          border-radius: 999px;
          font-weight: 500;
        }
        .tb-row-desc {
          color: var(--text-muted);
          margin: 0;
          font-size: 0.95rem;
        }

        /* Skills Pill Wall */
        .tb-skills {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
        }
        .tb-skill {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--card-border);
          color: var(--text-main);
          padding: 9px 18px;
          border-radius: 999px;
          font-size: 0.9rem;
          font-weight: 600;
          transition: all 0.25s ease;
        }
        .tb-skill:hover {
          background: var(--accent-lime);
          color: #060907;
          border-color: var(--accent-lime);
          transform: translateY(-3px);
          box-shadow: 0 8px 20px var(--accent-glow-strong);
        }

        /* Service & Testimonial Cards */
        .tb-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
        }
        .tb-card {
          background: rgba(10, 15, 10, 0.6);
          border: 1px solid var(--card-border);
          border-radius: 20px;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          transition: all 0.3s ease;
        }
        .tb-card:hover {
          border-color: var(--accent-lime);
          transform: translateY(-4px);
          box-shadow: 0 12px 30px var(--accent-glow);
        }
        .tb-card h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.25rem;
          color: #ffffff;
        }
        .tb-quote {
          font-size: 1.05rem;
          font-style: italic;
          color: #e2ede0;
          margin: 0 0 1.5rem 0;
          line-height: 1.7;
        }
        .tb-cite {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-top: auto;
        }
        .tb-cite-av {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid var(--accent-lime);
        }

        /* Media Layouts (Gallery & Videos) */
        .tb-gallery {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.25rem;
        }
        .tb-gal {
          margin: 0;
          border-radius: 18px;
          overflow: hidden;
          position: relative;
          border: 1px solid var(--card-border);
        }
        .tb-gal img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
          transition: transform 0.4s ease;
        }
        .tb-gal:hover img {
          transform: scale(1.06);
        }
        .tb-gal figcaption {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          background: linear-gradient(transparent, rgba(6, 9, 7, 0.95));
          padding: 1.5rem 1rem 0.75rem;
          font-size: 0.85rem;
          color: var(--accent-lime);
          font-weight: 500;
        }
        .tb-videos {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 1.5rem;
        }
        .tb-video {
          position: relative;
          padding-bottom: 56.25%;
          height: 0;
          border-radius: 18px;
          overflow: hidden;
          border: 1px solid var(--card-border);
        }
        .tb-video iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: none;
        }

        /* Footer */
        .tb-foot {
          text-align: center;
          color: var(--text-muted);
          font-size: 0.85rem;
          padding: 1rem 0 2rem;
          letter-spacing: 1px;
          text-transform: uppercase;
          opacity: 0.6;
        }
      `}</style>

      <div className="tpl-bold">
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
