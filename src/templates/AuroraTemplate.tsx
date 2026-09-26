import React, { useState } from "react";
import type { PublicPortfolio } from "@/lib/publicTypes";
import { dateRange, videoEmbed } from "@/lib/publicTypes";
import { LinkChip } from "@/components/LinkChip";
import { ZoomImage } from "@/components/ZoomImage";

export function AuroraTemplate({ data }: { data: PublicPortfolio }) {
  const p = data.profile;
  const name = p?.display_name || data.username || "Untitled";
  const hasContact = p?.email || p?.phone || p?.website || p?.availability;

  // ফোল্ডাৰৰ দৰে ক্লিক কৰি তথ্য চোৱাৰ বাবে ষ্টেট
  const [openSection, setOpenSection] = useState<string | null>("work");

  const toggleSection = (id: string) => {
    setOpenSection((prev) => (prev === id ? null : id));
  };

  return (
    <>
      <style>{`
        :root {
          --bg-dark: #070c06;
          --lime-accent: #b4f437;
          --lime-glow: rgba(180, 244, 55, 0.35);
          --folder-tab: rgba(180, 244, 55, 0.15);
          --folder-bg: rgba(18, 28, 17, 0.7);
          --folder-border: rgba(180, 244, 55, 0.28);
          --text-light: #f3fbf0;
          --text-muted: #8b9986;
        }

        /* কাষ্টম চাইবাৰ মাউছ কাৰ্ছাৰ */
        .tpl-aurora {
          cursor: crosshair;
          background-color: var(--bg-dark);
          color: var(--text-light);
          min-height: 100vh;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          position: relative;
          padding: 3rem 1.5rem;
          background-image: 
            radial-gradient(circle at 50% 10%, rgba(180, 244, 55, 0.12) 0%, transparent 60%),
            radial-gradient(circle at 10% 90%, rgba(30, 60, 20, 0.2) 0%, transparent 40%);
        }

        .tpl-aurora a, 
        .tpl-aurora button,
        .tpl-aurora .au-card,
        .tpl-aurora .au-folder-header {
          cursor: pointer;
        }

        .au-wrap {
          max-width: 860px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 2rem;
          position: relative;
          z-index: 1;
        }

        /* হিৰো ছেকশ্বন */
        .au-hero {
          background: var(--folder-bg);
          border: 1px solid var(--folder-border);
          border-radius: 28px;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          padding: 3.5rem 2rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
        }

        .au-avatar {
          width: 120px;
          height: 120px;
          border-radius: 32px;
          border: 2px solid var(--lime-accent);
          box-shadow: 0 0 25px var(--lime-glow);
          margin-bottom: 1.5rem;
          object-fit: cover;
        }

        .au-eyebrow {
          background: var(--folder-tab);
          color: var(--lime-accent);
          border: 1px solid rgba(180, 244, 55, 0.4);
          padding: 4px 16px;
          border-radius: 999px;
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          margin-bottom: 1rem;
        }

        .au-name {
          font-size: 3rem;
          font-weight: 900;
          margin: 0 0 0.5rem 0;
          color: #ffffff;
          letter-spacing: -1px;
        }

        .au-tagline {
          font-size: 1.2rem;
          color: var(--lime-accent);
          margin-bottom: 0.5rem;
        }

        .au-loc {
          font-size: 0.95rem;
          color: var(--text-muted);
        }

        .au-bio {
          font-size: 1.05rem;
          max-width: 600px;
          margin-top: 1.2rem;
        }

        .au-links {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          justify-content: center;
          margin-top: 1.75rem;
        }

        .au-link {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--folder-border);
          color: var(--text-light);
          padding: 8px 20px;
          border-radius: 999px;
          text-decoration: none;
          font-size: 0.85rem;
          font-weight: 600;
          transition: all 0.25s ease;
        }

        .au-link:hover {
          background: var(--lime-accent);
          color: #070c06;
          border-color: var(--lime-accent);
          box-shadow: 0 0 20px var(--lime-glow);
          transform: translateY(-2px);
        }

        /* ফটোৰ দৰে কাষ্টম ফোল্ডাৰ ছেকশ্বন ডিজাইন */
        .au-folder-sec {
          background: var(--folder-bg);
          border: 1px solid var(--folder-border);
          border-radius: 24px;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          overflow: hidden;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }

        .au-folder-sec:hover {
          border-color: var(--lime-accent);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4), 0 0 15px var(--lime-glow);
        }

        .au-folder-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem 2rem;
          user-select: none;
          background: linear-gradient(90deg, rgba(180, 244, 55, 0.08) 0%, transparent 100%);
        }

        .au-h2 {
          font-size: 1.4rem;
          font-weight: 800;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 12px;
          color: #ffffff;
        }

        .au-folder-icon {
          width: 14px;
          height: 14px;
          background: var(--lime-accent);
          border-radius: 3px;
          box-shadow: 0 0 10px var(--lime-accent);
        }

        .au-arrow {
          font-size: 1rem;
          color: var(--lime-accent);
          transition: transform 0.3s ease;
        }

        .au-arrow.open {
          transform: rotate(90deg);
        }

        .au-folder-content {
          padding: 1rem 2rem 2.5rem;
          border-top: 1px solid rgba(180, 244, 55, 0.1);
        }

        /* ফোল্ডাৰৰ ভিতৰৰ কাৰ্ড আৰু অন্যান্য ডিজাইন */
        .au-projects, .au-gallery, .au-videos {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
        }

        .au-card {
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid var(--folder-border);
          border-radius: 18px;
          overflow: hidden;
          text-decoration: none;
          color: inherit;
          display: flex;
          flex-direction: column;
          transition: all 0.3s ease;
        }

        .au-card:hover {
          transform: translateY(-4px);
          border-color: var(--lime-accent);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5), 0 0 15px var(--lime-glow);
        }

        .au-card-img {
          width: 100%;
          height: 180px;
          object-fit: cover;
          border-bottom: 1px solid var(--folder-border);
        }

        .au-card-body {
          padding: 1.25rem;
          flex-grow: 1;
        }

        .au-card-body h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.2rem;
          color: #ffffff;
        }

        .au-accent-text {
          color: var(--lime-accent);
          font-size: 0.85rem;
          font-weight: 700;
          text-transform: uppercase;
        }

        .au-muted {
          color: var(--text-muted);
          font-size: 0.95rem;
          margin-top: 0.5rem;
        }

        .au-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 1rem;
        }

        .au-tags span, .au-when {
          background: var(--folder-tab);
          border: 1px solid rgba(180, 244, 55, 0.2);
          color: var(--lime-accent);
          font-size: 0.75rem;
          padding: 4px 10px;
          border-radius: 999px;
        }

        .au-row {
          margin-bottom: 1.75rem;
          padding-bottom: 1.75rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .au-row:last-child {
          margin-bottom: 0;
          padding-bottom: 0;
          border-bottom: none;
        }

        .au-row h3 {
          font-size: 1.2rem;
          margin: 0 0 0.25rem 0;
        }

        .au-row h3 a {
          color: #ffffff;
          text-decoration: none;
        }

        .au-rowsub {
          color: var(--lime-accent);
          font-size: 0.9rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 0.25rem;
        }

        .au-skills {
          display: flex;
          flex-wrap: wrap;
          gap: 0.65rem;
        }

        .au-skill {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--folder-border);
          padding: 8px 16px;
          border-radius: 999px;
          font-size: 0.9rem;
          font-weight: 600;
          transition: all 0.25s;
        }

        .au-skill:hover {
          background: var(--lime-accent);
          color: #070c06;
          border-color: var(--lime-accent);
          transform: translateY(-2px);
        }

        .au-video {
          position: relative;
          padding-bottom: 56.25%;
          height: 0;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid var(--folder-border);
        }

        .au-video iframe {
          position: absolute;
          width: 100%;
          height: 100%;
          border: none;
        }

        .au-gal {
          margin: 0;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid var(--folder-border);
        }

        .au-gal figcaption {
          padding: 0.5rem;
          font-size: 0.85rem;
          color: var(--lime-accent);
        }

        .au-foot {
          text-align: center;
          color: var(--text-muted);
          font-size: 0.85rem;
          padding: 2rem 0;
          text-transform: uppercase;
        }
      `}</style>

      <div
        className="tpl-aurora"
        style={
          {
            ["--tpl-accent" as string]: data.accent || "#b4f437",
          } as React.CSSProperties
        }
      >
        <div className="au-bg" aria-hidden>
          <span />
          <span />
          <span />
        </div>

        <div className="au-wrap">
          {/* Hero Profile */}
          <header className="au-hero">
            {p?.avatar_url && (
              <ZoomImage className="au-avatar" src={p.avatar_url} alt={name} />
            )}
            {p?.title && (
              <p className="au-eyebrow">
                {p.title}
                {p?.pronouns ? ` · ${p.pronouns}` : ""}
              </p>
            )}
            <h1 className="au-name">{name}</h1>
            {p?.tagline && <p className="au-tagline">{p.tagline}</p>}
            {p?.location && <p className="au-loc">{p.location}</p>}
            {p?.bio && <p className="au-bio">{p.bio}</p>}
            {data.links.length > 0 && (
              <div className="au-links">
                {data.links.map((l) => (
                  <LinkChip
                    key={l.id}
                    className="au-link"
                    platform={l.platform}
                    url={l.url}
                    label={l.label}
                  />
                ))}
              </div>
            )}
          </header>

          {/* About Folder */}
          {p?.about && (
            <section className="au-folder-sec">
              <div
                className="au-folder-header"
                onClick={() => toggleSection("about")}
              >
                <h2 className="au-h2">
                  <span className="au-folder-icon" /> About
                </h2>
                <span
                  className={`au-arrow ${openSection === "about" ? "open" : ""}`}
                >
                  ▶
                </span>
              </div>
              {openSection === "about" && (
                <div className="au-folder-content">
                  <p className="au-about">{p.about}</p>
                </div>
              )}
            </section>
          )}

          {/* Work Folder */}
          {data.projects.length > 0 && (
            <section className="au-folder-sec">
              <div
                className="au-folder-header"
                onClick={() => toggleSection("work")}
              >
                <h2 className="au-h2">
                  <span className="au-folder-icon" /> Work
                </h2>
                <span
                  className={`au-arrow ${openSection === "work" ? "open" : ""}`}
                >
                  ▶
                </span>
              </div>
              {openSection === "work" && (
                <div className="au-folder-content">
                  <div className="au-projects">
                    {data.projects.map((pr) => (
                      <a
                        key={pr.id}
                        className="au-card"
                        href={pr.url || undefined}
                        target={pr.url ? "_blank" : undefined}
                        rel="noreferrer"
                      >
                        {pr.image_url && (
                          <ZoomImage
                            className="au-card-img"
                            src={pr.image_url}
                            alt={pr.title}
                          />
                        )}
                        <div className="au-card-body">
                          <h3>{pr.title}</h3>
                          {pr.role && (
                            <p className="au-accent-text">{pr.role}</p>
                          )}
                          {pr.description && (
                            <p className="au-muted">{pr.description}</p>
                          )}
                          {pr.tags.length > 0 && (
                            <div className="au-tags">
                              {pr.tags.map((t) => (
                                <span key={t}>{t}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Experience Folder */}
          {data.experience.length > 0 && (
            <section className="au-folder-sec">
              <div
                className="au-folder-header"
                onClick={() => toggleSection("experience")}
              >
                <h2 className="au-h2">
                  <span className="au-folder-icon" /> Experience
                </h2>
                <span
                  className={`au-arrow ${openSection === "experience" ? "open" : ""}`}
                >
                  ▶
                </span>
              </div>
              {openSection === "experience" && (
                <div className="au-folder-content">
                  {data.experience.map((x) => (
                    <div key={x.id} className="au-row">
                      <h3>{x.title || x.company}</h3>
                      <p className="au-rowsub">
                        {[x.company, x.location].filter(Boolean).join(" · ")}
                        <span className="au-when">
                          {dateRange(x.start_date, x.end_date, x.is_current)}
                        </span>
                      </p>
                      {x.description && (
                        <p className="au-muted">{x.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Education Folder */}
          {data.education.length > 0 && (
            <section className="au-folder-sec">
              <div
                className="au-folder-header"
                onClick={() => toggleSection("education")}
              >
                <h2 className="au-h2">
                  <span className="au-folder-icon" /> Education
                </h2>
                <span
                  className={`au-arrow ${openSection === "education" ? "open" : ""}`}
                >
                  ▶
                </span>
              </div>
              {openSection === "education" && (
                <div className="au-folder-content">
                  {data.education.map((e) => (
                    <div key={e.id} className="au-row">
                      <h3>{e.school}</h3>
                      <p className="au-rowsub">
                        {[e.degree, e.field].filter(Boolean).join(", ")}
                        <span className="au-when">
                          {dateRange(e.start_date, e.end_date)}
                        </span>
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Services Folder */}
          {data.services.length > 0 && (
            <section className="au-folder-sec">
              <div
                className="au-folder-header"
                onClick={() => toggleSection("services")}
              >
                <h2 className="au-h2">
                  <span className="au-folder-icon" /> Services
                </h2>
                <span
                  className={`au-arrow ${openSection === "services" ? "open" : ""}`}
                >
                  ▶
                </span>
              </div>
              {openSection === "services" && (
                <div className="au-folder-content">
                  <div className="au-projects">
                    {data.services.map((s) => (
                      <div key={s.id} className="au-card">
                        <div className="au-card-body">
                          <h3>
                            {s.title}
                            {s.price ? (
                              <span className="au-when">{s.price}</span>
                            ) : null}
                          </h3>
                          {s.description && (
                            <p className="au-muted">{s.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Certifications Folder */}
          {data.certifications.length > 0 && (
            <section className="au-folder-sec">
              <div
                className="au-folder-header"
                onClick={() => toggleSection("certifications")}
              >
                <h2 className="au-h2">
                  <span className="au-folder-icon" /> Certifications
                </h2>
                <span
                  className={`au-arrow ${openSection === "certifications" ? "open" : ""}`}
                >
                  ▶
                </span>
              </div>
              {openSection === "certifications" && (
                <div className="au-folder-content">
                  {data.certifications.map((c) => (
                    <div key={c.id} className="au-row">
                      <h3>
                        {c.url ? (
                          <a href={c.url} target="_blank" rel="noreferrer">
                            {c.name}
                          </a>
                        ) : (
                          c.name
                        )}
                      </h3>
                      <p className="au-rowsub">
                        {c.issuer}
                        <span className="au-when">{c.issue_date}</span>
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Achievements Folder */}
          {data.achievements.length > 0 && (
            <section className="au-folder-sec">
              <div
                className="au-folder-header"
                onClick={() => toggleSection("achievements")}
              >
                <h2 className="au-h2">
                  <span className="au-folder-icon" /> Achievements
                </h2>
                <span
                  className={`au-arrow ${openSection === "achievements" ? "open" : ""}`}
                >
                  ▶
                </span>
              </div>
              {openSection === "achievements" && (
                <div className="au-folder-content">
                  {data.achievements.map((a) => (
                    <div key={a.id} className="au-row">
                      <h3>
                        {a.title}
                        <span className="au-when">{a.date}</span>
                      </h3>
                      {a.description && (
                        <p className="au-muted">{a.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Publications Folder */}
          {data.publications.length > 0 && (
            <section className="au-folder-sec">
              <div
                className="au-folder-header"
                onClick={() => toggleSection("publications")}
              >
                <h2 className="au-h2">
                  <span className="au-folder-icon" /> Publications
                </h2>
                <span
                  className={`au-arrow ${openSection === "publications" ? "open" : ""}`}
                >
                  ▶
                </span>
              </div>
              {openSection === "publications" && (
                <div className="au-folder-content">
                  {data.publications.map((pub) => (
                    <div key={pub.id} className="au-row">
                      <h3>
                        {pub.url ? (
                          <a href={pub.url} target="_blank" rel="noreferrer">
                            {pub.title}
                          </a>
                        ) : (
                          pub.title
                        )}
                      </h3>
                      <p className="au-rowsub">
                        {pub.publisher}
                        <span className="au-when">{pub.date}</span>
                      </p>
                      {pub.description && (
                        <p className="au-muted">{pub.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Testimonials Folder */}
          {data.testimonials.length > 0 && (
            <section className="au-folder-sec">
              <div
                className="au-folder-header"
                onClick={() => toggleSection("testimonials")}
              >
                <h2 className="au-h2">
                  <span className="au-folder-icon" /> Testimonials
                </h2>
                <span
                  className={`au-arrow ${openSection === "testimonials" ? "open" : ""}`}
                >
                  ▶
                </span>
              </div>
              {openSection === "testimonials" && (
                <div className="au-folder-content">
                  <div className="au-projects">
                    {data.testimonials.map((t) => (
                      <div key={t.id} className="au-card">
                        <div className="au-card-body">
                          <p className="au-quote">&ldquo;{t.quote}&rdquo;</p>
                          <div className="au-cite">
                            {t.avatar_url && (
                              <ZoomImage
                                className="au-cite-av"
                                src={t.avatar_url}
                                alt={t.author}
                              />
                            )}
                            <span className="au-accent-text">
                              {t.author}
                              {t.role ? `, ${t.role}` : ""}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Skills Folder */}
          {data.skills.length > 0 && (
            <section className="au-folder-sec">
              <div
                className="au-folder-header"
                onClick={() => toggleSection("skills")}
              >
                <h2 className="au-h2">
                  <span className="au-folder-icon" /> Skills
                </h2>
                <span
                  className={`au-arrow ${openSection === "skills" ? "open" : ""}`}
                >
                  ▶
                </span>
              </div>
              {openSection === "skills" && (
                <div className="au-folder-content">
                  <div className="au-skills">
                    {data.skills.map((s) => (
                      <span key={s.id} className="au-skill">
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Gallery Folder */}
          {data.gallery.length > 0 && (
            <section className="au-folder-sec">
              <div
                className="au-folder-header"
                onClick={() => toggleSection("gallery")}
              >
                <h2 className="au-h2">
                  <span className="au-folder-icon" /> Gallery
                </h2>
                <span
                  className={`au-arrow ${openSection === "gallery" ? "open" : ""}`}
                >
                  ▶
                </span>
              </div>
              {openSection === "gallery" && (
                <div className="au-folder-content">
                  <div className="au-gallery">
                    {data.gallery.map((g) => (
                      <figure key={g.id} className="au-gal">
                        <ZoomImage src={g.image_url} alt={g.caption || ""} />
                        {g.caption && <figcaption>{g.caption}</figcaption>}
                      </figure>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Videos Folder */}
          {data.videos.length > 0 && (
            <section className="au-folder-sec">
              <div
                className="au-folder-header"
                onClick={() => toggleSection("videos")}
              >
                <h2 className="au-h2">
                  <span className="au-folder-icon" /> Videos
                </h2>
                <span
                  className={`au-arrow ${openSection === "videos" ? "open" : ""}`}
                >
                  ▶
                </span>
              </div>
              {openSection === "videos" && (
                <div className="au-folder-content">
                  <div className="au-videos">
                    {data.videos.map((v) => {
                      const embed = videoEmbed(v.url);
                      return (
                        <div key={v.id}>
                          {embed ? (
                            <div className="au-video">
                              <iframe
                                src={embed}
                                title={v.title || "Video"}
                                allowFullScreen
                              />
                            </div>
                          ) : (
                            <a
                              className="au-link"
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
                </div>
              )}
            </section>
          )}

          {/* Contact Folder */}
          {hasContact && (
            <section className="au-folder-sec">
              <div
                className="au-folder-header"
                onClick={() => toggleSection("contact")}
              >
                <h2 className="au-h2">
                  <span className="au-folder-icon" /> Contact
                </h2>
                <span
                  className={`au-arrow ${openSection === "contact" ? "open" : ""}`}
                >
                  ▶
                </span>
              </div>
              {openSection === "contact" && (
                <div className="au-folder-content">
                  {p?.availability && (
                    <p className="au-accent-text">{p.availability}</p>
                  )}
                  <div className="au-links">
                    {p?.email && (
                      <a className="au-link" href={`mailto:${p.email}`}>
                        {p.email}
                      </a>
                    )}
                    {p?.phone && <span className="au-link">{p.phone}</span>}
                    {p?.website && (
                      <a
                        className="au-link"
                        href={p.website}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Website
                      </a>
                    )}
                    {p?.resume_url && (
                      <a
                        className="au-link"
                        href={p.resume_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Résumé ↗
                      </a>
                    )}
                  </div>
                </div>
              )}
            </section>
          )}

          {!data.hide_branding && (
            <footer className="au-foot">Made with Folio</footer>
          )}
        </div>
      </div>
    </>
  );
}
