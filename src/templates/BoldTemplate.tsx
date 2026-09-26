import type { PublicPortfolio } from "@/lib/publicTypes";
import { dateRange, videoEmbed, ext } from "@/lib/publicTypes";
import { LinkChip } from "@/components/LinkChip";
import { ZoomImage } from "@/components/ZoomImage";

export function BoldTemplate({ data }: { data: PublicPortfolio }) {
  const p = data.profile;
  const name = p?.display_name || data.username || "Untitled";
  return (
    <div className="tpl-bold" style={{ ["--tpl-accent" as string]: data.accent || "#7c6cff" } as React.CSSProperties}>
      <div className="tb-aurora" aria-hidden><span /><span /></div>
      <div className="tb-wrap">
        <header className="tb-hero">
          {p?.avatar_url && <ZoomImage className="tb-avatar" src={p.avatar_url} alt={name} />}
          {p?.title && <p className="tb-eyebrow">{p.title}{p?.pronouns ? ` \u00b7 ${p.pronouns}` : ""}</p>}
          <h1 className="tb-name">{name}</h1>
          {p?.tagline && <p className="tb-tagline">{p.tagline}</p>}
          {p?.location && <p className="tb-loc">{p.location}</p>}
          {p?.bio && <p className="tb-bio">{p.bio}</p>}
          {data.links.length > 0 && (
            <div className="tb-links">
              {data.links.map((l) => (
                <LinkChip key={l.id} className="tb-link" platform={l.platform} url={l.url} label={l.label} />
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
                  href={pr.url ? ext(pr.url) : undefined}
                  target={pr.url ? "_blank" : undefined}
                  rel="noreferrer"
                >
                  {pr.image_url && <img src={pr.image_url} alt={pr.title} className="tb-proj-img" />}
                  <div className="tb-proj-body">
                    <h3>{pr.title}</h3>
                    {pr.role && <p className="tb-proj-role">{pr.role}</p>}
                    {pr.description && <p className="tb-proj-desc">{pr.description}</p>}
                    {pr.tags.length > 0 && (
                      <div className="tb-tags">{pr.tags.map((t) => <span key={t}>{t}</span>)}</div>
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
                  <span className="tb-when">{dateRange(x.start_date, x.end_date, x.is_current)}</span>
                </p>
                {x.description && <p className="tb-row-desc">{x.description}</p>}
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
                  <span className="tb-when">{dateRange(ed.start_date, ed.end_date)}</span>
                </p>
                {ed.description && <p className="tb-row-desc">{ed.description}</p>}
              </div>
            ))}
          </section>
        )}

        {data.skills.length > 0 && (
          <section className="tb-sec">
            <h2 className="tb-h2">Skills</h2>
            <div className="tb-skills">
              {data.skills.map((s) => <span key={s.id} className="tb-skill">{s.name}</span>)}
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
                  {s.description && <p className="tb-proj-desc">{s.description}</p>}
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
                <h3>{c.url ? <a href={ext(c.url)} target="_blank" rel="noreferrer">{c.name}</a> : c.name}</h3>
                <p className="tb-row-sub">{c.issuer}<span className="tb-when">{c.issue_date}</span></p>
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
                <p className="tb-row-sub"><span className="tb-when">{a.date}</span></p>
                {a.description && <p className="tb-row-desc">{a.description}</p>}
              </div>
            ))}
          </section>
        )}

        {data.publications.length > 0 && (
          <section className="tb-sec">
            <h2 className="tb-h2">Publications</h2>
            {data.publications.map((pub) => (
              <div key={pub.id} className="tb-row">
                <h3>{pub.url ? <a href={ext(pub.url)} target="_blank" rel="noreferrer">{pub.title}</a> : pub.title}</h3>
                <p className="tb-row-sub">{pub.publisher}<span className="tb-when">{pub.date}</span></p>
                {pub.description && <p className="tb-row-desc">{pub.description}</p>}
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
                      <div className="tb-video"><iframe src={embed} title={v.title || "Video"} allowFullScreen /></div>
                    ) : (
                      <a className="tb-link" href={ext(v.url)} target="_blank" rel="noreferrer">{v.title || v.url}</a>
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
                    {t.avatar_url && <img className="tb-cite-av" src={t.avatar_url} alt={t.author} />}
                    <p className="tb-proj-role">{t.author}{t.role ? `, ${t.role}` : ""}</p>
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
              {p?.email && <a className="tb-link" href={`mailto:${p.email}`}>{p.email}</a>}
              {p?.phone && <span className="tb-link">{p.phone}</span>}
              {p?.website && <a className="tb-link" href={ext(p.website)} target="_blank" rel="noreferrer">Website</a>}
              {p?.resume_url && <a className="tb-link" href={ext(p.resume_url)} target="_blank" rel="noreferrer">Résumé ↗</a>}
            </div>
          </section>
        )}

        {!data.hide_branding && (<footer className="tb-foot">Made with Folio</footer>)}
      </div>
    </div>
  );
}
