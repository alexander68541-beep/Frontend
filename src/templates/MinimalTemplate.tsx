import type { PublicPortfolio } from "@/lib/publicTypes";
import { dateRange, videoEmbed } from "@/lib/publicTypes";
import { LinkChip } from "@/components/LinkChip";
import { ZoomImage } from "@/components/ZoomImage";

export function MinimalTemplate({ data }: { data: PublicPortfolio }) {
  const p = data.profile;
  const name = p?.display_name || data.username || "Untitled";
  return (
    <div className="tpl-min" style={{ ["--tpl-accent" as string]: data.accent || "#7c6cff" } as React.CSSProperties}>
      <div className="tm-wrap">
        <header className="tm-head">
          {p?.avatar_url && <ZoomImage className="tm-avatar" src={p.avatar_url} alt={name} />}
          <h1 className="tm-name">
            {name}
            {p?.pronouns && <span className="tm-pronouns">({p.pronouns})</span>}
          </h1>
          {p?.title && <p className="tm-title">{p.title}</p>}
          {p?.tagline && <p className="tm-tagline">{p.tagline}</p>}
          {p?.location && <p className="tm-loc">{p.location}</p>}
          {p?.bio && <p className="tm-bio">{p.bio}</p>}
          {data.links.length > 0 && (
            <div className="tm-links">
              {data.links.map((l) => (
                <LinkChip key={l.id} className="tm-link" platform={l.platform} url={l.url} label={l.label} />
              ))}
            </div>
          )}
        </header>

        {p?.about && (
          <section className="tm-sec">
            <h2>About</h2>
            <p className="tm-about">{p.about}</p>
          </section>
        )}

        {data.projects.length > 0 && (
          <section className="tm-sec">
            <h2>Projects</h2>
            <div className="tm-projects">
              {data.projects.map((pr) => (
                <article key={pr.id} className="tm-project">
                  {pr.image_url && <ZoomImage src={pr.image_url} alt={pr.title} className="tm-proj-img" />}
                  <div className="tm-proj-body">
                    <div className="tm-proj-top">
                      <h3>{pr.title}</h3>
                      {pr.url && <a href={pr.url} target="_blank" rel="noreferrer" className="tm-visit">Visit ↗</a>}
                    </div>
                    {pr.role && <p className="tm-proj-role">{pr.role}</p>}
                    {pr.description && <p className="tm-proj-desc">{pr.description}</p>}
                    {pr.tags.length > 0 && (
                      <div className="tm-tags">{pr.tags.map((t) => <span key={t}>{t}</span>)}</div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {data.experience.length > 0 && (
          <section className="tm-sec">
            <h2>Experience</h2>
            {data.experience.map((x) => (
              <div key={x.id} className="tm-row">
                <div className="tm-row-when">{dateRange(x.start_date, x.end_date, x.is_current)}</div>
                <div className="tm-row-main">
                  <h3>{x.title || x.company}</h3>
                  <p className="tm-row-sub">{[x.company, x.location].filter(Boolean).join(" · ")}</p>
                  {x.description && <p className="tm-row-desc">{x.description}</p>}
                </div>
              </div>
            ))}
          </section>
        )}

        {data.education.length > 0 && (
          <section className="tm-sec">
            <h2>Education</h2>
            {data.education.map((ed) => (
              <div key={ed.id} className="tm-row">
                <div className="tm-row-when">{dateRange(ed.start_date, ed.end_date)}</div>
                <div className="tm-row-main">
                  <h3>{ed.school}</h3>
                  <p className="tm-row-sub">{[ed.degree, ed.field].filter(Boolean).join(", ")}</p>
                  {ed.description && <p className="tm-row-desc">{ed.description}</p>}
                </div>
              </div>
            ))}
          </section>
        )}

        {data.skills.length > 0 && (
          <section className="tm-sec">
            <h2>Skills</h2>
            <div className="tm-skills">
              {data.skills.map((s) => <span key={s.id} className="tm-skill">{s.name}</span>)}
            </div>
          </section>
        )}

        {data.services.length > 0 && (
          <section className="tm-sec">
            <h2>Services</h2>
            {data.services.map((s) => (
              <div key={s.id} className="tm-row">
                <div className="tm-row-when">{s.price || ""}</div>
                <div className="tm-row-main">
                  <h3>{s.title}</h3>
                  {s.description && <p className="tm-row-desc">{s.description}</p>}
                </div>
              </div>
            ))}
          </section>
        )}

        {data.certifications.length > 0 && (
          <section className="tm-sec">
            <h2>Certifications</h2>
            {data.certifications.map((c) => (
              <div key={c.id} className="tm-row">
                <div className="tm-row-when">{c.issue_date || ""}</div>
                <div className="tm-row-main">
                  <h3>{c.url ? <a href={c.url} target="_blank" rel="noreferrer">{c.name}</a> : c.name}</h3>
                  {c.issuer && <p className="tm-row-sub">{c.issuer}</p>}
                </div>
              </div>
            ))}
          </section>
        )}

        {data.achievements.length > 0 && (
          <section className="tm-sec">
            <h2>Achievements</h2>
            {data.achievements.map((a) => (
              <div key={a.id} className="tm-row">
                <div className="tm-row-when">{a.date || ""}</div>
                <div className="tm-row-main">
                  <h3>{a.title}</h3>
                  {a.description && <p className="tm-row-desc">{a.description}</p>}
                </div>
              </div>
            ))}
          </section>
        )}

        {data.publications.length > 0 && (
          <section className="tm-sec">
            <h2>Publications</h2>
            {data.publications.map((pub) => (
              <div key={pub.id} className="tm-row">
                <div className="tm-row-when">{pub.date || ""}</div>
                <div className="tm-row-main">
                  <h3>{pub.url ? <a href={pub.url} target="_blank" rel="noreferrer">{pub.title}</a> : pub.title}</h3>
                  {pub.publisher && <p className="tm-row-sub">{pub.publisher}</p>}
                  {pub.description && <p className="tm-row-desc">{pub.description}</p>}
                </div>
              </div>
            ))}
          </section>
        )}

        {data.gallery.length > 0 && (
          <section className="tm-sec">
            <h2>Gallery</h2>
            <div className="tm-gallery">
              {data.gallery.map((g) => (
                <figure key={g.id} className="tm-gal">
                  <ZoomImage src={g.image_url} alt={g.caption || ""} />
                  {g.caption && <figcaption>{g.caption}</figcaption>}
                </figure>
              ))}
            </div>
          </section>
        )}

        {data.videos.length > 0 && (
          <section className="tm-sec">
            <h2>Videos</h2>
            <div className="tm-videos">
              {data.videos.map((v) => {
                const embed = videoEmbed(v.url);
                return (
                  <div key={v.id}>
                    {embed ? (
                      <div className="tm-video"><iframe src={embed} title={v.title || "Video"} allowFullScreen /></div>
                    ) : (
                      <a href={v.url} target="_blank" rel="noreferrer">{v.title || v.url}</a>
                    )}
                    {v.title && <p className="tm-row-sub">{v.title}</p>}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {data.testimonials.length > 0 && (
          <section className="tm-sec">
            <h2>Testimonials</h2>
            {data.testimonials.map((t) => (
              <blockquote key={t.id} className="tm-quote">
                <p>&ldquo;{t.quote}&rdquo;</p>
                <cite className="tm-cite">
                  {t.avatar_url && <ZoomImage className="tm-cite-av" src={t.avatar_url} alt={t.author} />}
                  <span>— {t.author}{t.role ? `, ${t.role}` : ""}</span>
                </cite>
              </blockquote>
            ))}
          </section>
        )}

        {(p?.email || p?.phone || p?.website || p?.availability) && (
          <section className="tm-sec">
            <h2>Contact</h2>
            <div className="tm-contact">
              {p?.availability && <p className="tm-avail">{p.availability}</p>}
              {p?.email && <a href={`mailto:${p.email}`}>{p.email}</a>}
              {p?.phone && <span>{p.phone}</span>}
              {p?.website && <a href={p.website} target="_blank" rel="noreferrer">{p.website}</a>}
            </div>
          </section>
        )}

        {p?.resume_url && (
          <section className="tm-sec">
            <a className="tm-resume" href={p.resume_url} target="_blank" rel="noreferrer">Download résumé ↗</a>
          </section>
        )}

        {!data.hide_branding && (<footer className="tm-foot">Made with Folio</footer>)}
      </div>
    </div>
  );
}
