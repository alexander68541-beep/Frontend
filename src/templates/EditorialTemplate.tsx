import type { PublicPortfolio } from "@/lib/publicTypes";
import { dateRange, videoEmbed, ext } from "@/lib/publicTypes";
import { LinkChip } from "@/components/LinkChip";
import { ZoomImage } from "@/components/ZoomImage";
import { ContactForm } from "@/components/ContactForm";

export function EditorialTemplate({
  data,
  variant = "editorial",
}: {
  data: PublicPortfolio;
  variant?: "editorial" | "studio";
}) {
  const p = data.profile;
  const name = p?.display_name || data.username || "Untitled";
  const hasContact = p?.email || p?.phone || p?.website || p?.availability;

  return (
    <div
      className={`tpl-ed ${variant === "studio" ? "tpl-ed--studio" : ""}`}
      style={{ ["--tpl-accent" as string]: data.accent || "#7c6cff" } as React.CSSProperties}
    >
      <div className="ed-grid">
        <aside className="ed-rail">
          {p?.avatar_url && <ZoomImage className="ed-avatar" src={p.avatar_url} alt={name} />}
          <h1 className="ed-name">{name}</h1>
          {p?.pronouns && <span className="ed-pron">{p.pronouns}</span>}
          {p?.title && <p className="ed-title">{p.title}</p>}
          {p?.tagline && <p className="ed-tagline">{p.tagline}</p>}
          {p?.location && <p className="ed-loc">{p.location}</p>}

          {hasContact && (
            <div className="ed-block">
              <h3 className="ed-h">Contact</h3>
              {p?.availability && <p className="ed-avail">{p.availability}</p>}
              {p?.email && <a className="ed-c" href={`mailto:${p.email}`}>{p.email}</a>}
              {p?.phone && <span className="ed-c">{p.phone}</span>}
              {p?.website && <a className="ed-c" href={ext(p.website)} target="_blank" rel="noreferrer">{p.website}</a>}
            </div>
          )}

          {data.links.length > 0 && (
            <div className="ed-block">
              <h3 className="ed-h">Links</h3>
              <div className="ed-links">
                {data.links.map((l) => (
                  <LinkChip key={l.id} className="ed-link" platform={l.platform} url={l.url} label={l.label} />
                ))}
              </div>
            </div>
          )}

          {data.skills.length > 0 && (
            <div className="ed-block">
              <h3 className="ed-h">Skills</h3>
              <div className="ed-skills">
                {data.skills.map((s) => <span key={s.id} className="ed-skill">{s.name}</span>)}
              </div>
            </div>
          )}

          {p?.resume_url && (
            <a className="ed-resume" href={ext(p.resume_url)} target="_blank" rel="noreferrer">Download résumé ↗</a>
          )}
        </aside>

        <main className="ed-main">
          {p?.about && (
            <section className="ed-sec"><h2 className="ed-h2">About</h2><p className="ed-about">{p.about}</p></section>
          )}

          {data.projects.length > 0 && (
            <section className="ed-sec">
              <h2 className="ed-h2">Projects</h2>
              <div className="ed-projects">
                {data.projects.map((pr) => (
                  <article key={pr.id} className="ed-project">
                    {pr.image_url && <ZoomImage className="ed-proj-img" src={pr.image_url} alt={pr.title} />}
                    <div className="ed-proj-body">
                      <div className="ed-proj-top">
                        <h3>{pr.title}</h3>
                        {pr.url && <a className="ed-visit" href={ext(pr.url)} target="_blank" rel="noreferrer">Visit ↗</a>}
                      </div>
                      {pr.role && <p className="ed-muted">{pr.role}</p>}
                      {pr.description && <p className="ed-desc">{pr.description}</p>}
                      {pr.tags.length > 0 && <div className="ed-tags">{pr.tags.map((t) => <span key={t}>{t}</span>)}</div>}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {data.experience.length > 0 && (
            <section className="ed-sec">
              <h2 className="ed-h2">Experience</h2>
              {data.experience.map((x) => (
                <div key={x.id} className="ed-row">
                  <h3>{x.title || x.company}</h3>
                  <p className="ed-rowsub">{[x.company, x.location].filter(Boolean).join(" · ")}<span className="ed-when">{dateRange(x.start_date, x.end_date, x.is_current)}</span></p>
                  {x.description && <p className="ed-desc">{x.description}</p>}
                </div>
              ))}
            </section>
          )}

          {data.education.length > 0 && (
            <section className="ed-sec">
              <h2 className="ed-h2">Education</h2>
              {data.education.map((e) => (
                <div key={e.id} className="ed-row">
                  <h3>{e.school}</h3>
                  <p className="ed-rowsub">{[e.degree, e.field].filter(Boolean).join(", ")}<span className="ed-when">{dateRange(e.start_date, e.end_date)}</span></p>
                  {e.description && <p className="ed-desc">{e.description}</p>}
                </div>
              ))}
            </section>
          )}

          {data.services.length > 0 && (
            <section className="ed-sec">
              <h2 className="ed-h2">Services</h2>
              {data.services.map((s) => (
                <div key={s.id} className="ed-row">
                  <h3>{s.title}{s.price ? <span className="ed-when">{s.price}</span> : null}</h3>
                  {s.description && <p className="ed-desc">{s.description}</p>}
                </div>
              ))}
            </section>
          )}

          {data.certifications.length > 0 && (
            <section className="ed-sec">
              <h2 className="ed-h2">Certifications</h2>
              {data.certifications.map((c) => (
                <div key={c.id} className="ed-row">
                  <h3>{c.url ? <a href={ext(c.url)} target="_blank" rel="noreferrer">{c.name}</a> : c.name}</h3>
                  <p className="ed-rowsub">{c.issuer}<span className="ed-when">{c.issue_date}</span></p>
                </div>
              ))}
            </section>
          )}

          {data.achievements.length > 0 && (
            <section className="ed-sec">
              <h2 className="ed-h2">Achievements</h2>
              {data.achievements.map((a) => (
                <div key={a.id} className="ed-row">
                  <h3>{a.title}<span className="ed-when">{a.date}</span></h3>
                  {a.description && <p className="ed-desc">{a.description}</p>}
                </div>
              ))}
            </section>
          )}

          {data.publications.length > 0 && (
            <section className="ed-sec">
              <h2 className="ed-h2">Publications</h2>
              {data.publications.map((pub) => (
                <div key={pub.id} className="ed-row">
                  <h3>{pub.url ? <a href={ext(pub.url)} target="_blank" rel="noreferrer">{pub.title}</a> : pub.title}</h3>
                  <p className="ed-rowsub">{pub.publisher}<span className="ed-when">{pub.date}</span></p>
                  {pub.description && <p className="ed-desc">{pub.description}</p>}
                </div>
              ))}
            </section>
          )}

          {data.testimonials.length > 0 && (
            <section className="ed-sec">
              <h2 className="ed-h2">Testimonials</h2>
              {data.testimonials.map((t) => (
                <blockquote key={t.id} className="ed-quote">
                  <p>&ldquo;{t.quote}&rdquo;</p>
                  <cite className="ed-cite">
                    {t.avatar_url && <ZoomImage className="ed-cite-av" src={t.avatar_url} alt={t.author} />}
                    <span>— {t.author}{t.role ? `, ${t.role}` : ""}</span>
                  </cite>
                </blockquote>
              ))}
            </section>
          )}

          {data.gallery.length > 0 && (
            <section className="ed-sec">
              <h2 className="ed-h2">Gallery</h2>
              <div className="ed-gallery">
                {data.gallery.map((g) => (
                  <figure key={g.id} className="ed-gal">
                    <ZoomImage src={g.image_url} alt={g.caption || ""} />
                    {g.caption && <figcaption>{g.caption}</figcaption>}
                  </figure>
                ))}
              </div>
            </section>
          )}

          {data.videos.length > 0 && (
            <section className="ed-sec">
              <h2 className="ed-h2">Videos</h2>
              <div className="ed-videos">
                {data.videos.map((v) => {
                  const embed = videoEmbed(v.url);
                  return (
                    <div key={v.id}>
                      {embed ? (
                        <div className="ed-video"><iframe src={embed} title={v.title || "Video"} allowFullScreen /></div>
                      ) : (
                        <a href={ext(v.url)} target="_blank" rel="noreferrer">{v.title || v.url}</a>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {data.username && (
            <section className="ed-sec">
              <h2 className="ed-h2">Get in touch</h2>
              <ContactForm username={data.username} />
            </section>
          )}

          {!data.hide_branding && (<footer className="ed-foot">Made with Folio</footer>)}
        </main>
      </div>
    </div>
  );
}
