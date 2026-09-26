import type { PublicPortfolio } from "@/lib/publicTypes";
import { dateRange, videoEmbed } from "@/lib/publicTypes";
import { LinkChip } from "@/components/LinkChip";
import { ZoomImage } from "@/components/ZoomImage";

// Example coded template. Copy this file to make your own, then register it in registry.tsx.
export function AuroraTemplate({ data }: { data: PublicPortfolio }) {
  const p = data.profile;
  const name = p?.display_name || data.username || "Untitled";
  const hasContact = p?.email || p?.phone || p?.website || p?.availability;

  return (
    <div className="tpl-aurora" style={{ ["--tpl-accent" as string]: data.accent || "#7c6cff" } as React.CSSProperties}>
      <div className="au-bg" aria-hidden><span /><span /><span /></div>
      <div className="au-wrap">
        <header className="au-hero">
          {p?.avatar_url && <ZoomImage className="au-avatar" src={p.avatar_url} alt={name} />}
          {p?.title && <p className="au-eyebrow">{p.title}{p?.pronouns ? ` · ${p.pronouns}` : ""}</p>}
          <h1 className="au-name">{name}</h1>
          {p?.tagline && <p className="au-tagline">{p.tagline}</p>}
          {p?.location && <p className="au-loc">{p.location}</p>}
          {p?.bio && <p className="au-bio">{p.bio}</p>}
          {data.links.length > 0 && (
            <div className="au-links">{data.links.map((l) => <LinkChip key={l.id} className="au-link" platform={l.platform} url={l.url} label={l.label} />)}</div>
          )}
        </header>

        {p?.about && <section className="au-sec"><h2 className="au-h2">About</h2><p className="au-about">{p.about}</p></section>}

        {data.projects.length > 0 && (
          <section className="au-sec">
            <h2 className="au-h2">Work</h2>
            <div className="au-projects">
              {data.projects.map((pr) => (
                <a key={pr.id} className="au-card" href={pr.url || undefined} target={pr.url ? "_blank" : undefined} rel="noreferrer">
                  {pr.image_url && <ZoomImage className="au-card-img" src={pr.image_url} alt={pr.title} />}
                  <div className="au-card-body">
                    <h3>{pr.title}</h3>
                    {pr.role && <p className="au-accent-text">{pr.role}</p>}
                    {pr.description && <p className="au-muted">{pr.description}</p>}
                    {pr.tags.length > 0 && <div className="au-tags">{pr.tags.map((t) => <span key={t}>{t}</span>)}</div>}
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {data.experience.length > 0 && (
          <section className="au-sec"><h2 className="au-h2">Experience</h2>
            {data.experience.map((x) => (
              <div key={x.id} className="au-row"><h3>{x.title || x.company}</h3>
                <p className="au-rowsub">{[x.company, x.location].filter(Boolean).join(" · ")}<span className="au-when">{dateRange(x.start_date, x.end_date, x.is_current)}</span></p>
                {x.description && <p className="au-muted">{x.description}</p>}</div>
            ))}
          </section>
        )}

        {data.education.length > 0 && (
          <section className="au-sec"><h2 className="au-h2">Education</h2>
            {data.education.map((e) => (
              <div key={e.id} className="au-row"><h3>{e.school}</h3>
                <p className="au-rowsub">{[e.degree, e.field].filter(Boolean).join(", ")}<span className="au-when">{dateRange(e.start_date, e.end_date)}</span></p></div>
            ))}
          </section>
        )}

        {data.services.length > 0 && (
          <section className="au-sec"><h2 className="au-h2">Services</h2>
            <div className="au-projects">{data.services.map((s) => (
              <div key={s.id} className="au-card"><div className="au-card-body"><h3>{s.title}{s.price ? <span className="au-when">{s.price}</span> : null}</h3>{s.description && <p className="au-muted">{s.description}</p>}</div></div>
            ))}</div>
          </section>
        )}

        {data.certifications.length > 0 && (
          <section className="au-sec"><h2 className="au-h2">Certifications</h2>
            {data.certifications.map((c) => (
              <div key={c.id} className="au-row"><h3>{c.url ? <a href={c.url} target="_blank" rel="noreferrer">{c.name}</a> : c.name}</h3>
                <p className="au-rowsub">{c.issuer}<span className="au-when">{c.issue_date}</span></p></div>
            ))}
          </section>
        )}

        {data.achievements.length > 0 && (
          <section className="au-sec"><h2 className="au-h2">Achievements</h2>
            {data.achievements.map((a) => (
              <div key={a.id} className="au-row"><h3>{a.title}<span className="au-when">{a.date}</span></h3>{a.description && <p className="au-muted">{a.description}</p>}</div>
            ))}
          </section>
        )}

        {data.publications.length > 0 && (
          <section className="au-sec"><h2 className="au-h2">Publications</h2>
            {data.publications.map((pub) => (
              <div key={pub.id} className="au-row"><h3>{pub.url ? <a href={pub.url} target="_blank" rel="noreferrer">{pub.title}</a> : pub.title}</h3>
                <p className="au-rowsub">{pub.publisher}<span className="au-when">{pub.date}</span></p>{pub.description && <p className="au-muted">{pub.description}</p>}</div>
            ))}
          </section>
        )}

        {data.testimonials.length > 0 && (
          <section className="au-sec"><h2 className="au-h2">Testimonials</h2>
            <div className="au-projects">{data.testimonials.map((t) => (
              <div key={t.id} className="au-card"><div className="au-card-body">
                <p className="au-quote">&ldquo;{t.quote}&rdquo;</p>
                <div className="au-cite">{t.avatar_url && <ZoomImage className="au-cite-av" src={t.avatar_url} alt={t.author} />}<span className="au-accent-text">{t.author}{t.role ? `, ${t.role}` : ""}</span></div>
              </div></div>
            ))}</div>
          </section>
        )}

        {data.skills.length > 0 && (
          <section className="au-sec"><h2 className="au-h2">Skills</h2>
            <div className="au-skills">{data.skills.map((s) => <span key={s.id} className="au-skill">{s.name}</span>)}</div>
          </section>
        )}

        {data.gallery.length > 0 && (
          <section className="au-sec"><h2 className="au-h2">Gallery</h2>
            <div className="au-gallery">{data.gallery.map((g) => (
              <figure key={g.id} className="au-gal"><ZoomImage src={g.image_url} alt={g.caption || ""} />{g.caption && <figcaption>{g.caption}</figcaption>}</figure>
            ))}</div>
          </section>
        )}

        {data.videos.length > 0 && (
          <section className="au-sec"><h2 className="au-h2">Videos</h2>
            <div className="au-videos">{data.videos.map((v) => { const embed = videoEmbed(v.url); return (
              <div key={v.id}>{embed ? <div className="au-video"><iframe src={embed} title={v.title || "Video"} allowFullScreen /></div> : <a className="au-link" href={v.url} target="_blank" rel="noreferrer">{v.title || v.url}</a>}</div>
            ); })}</div>
          </section>
        )}

        {hasContact && (
          <section className="au-sec"><h2 className="au-h2">Contact</h2>
            {p?.availability && <p className="au-accent-text">{p.availability}</p>}
            <div className="au-links">
              {p?.email && <a className="au-link" href={`mailto:${p.email}`}>{p.email}</a>}
              {p?.phone && <span className="au-link">{p.phone}</span>}
              {p?.website && <a className="au-link" href={p.website} target="_blank" rel="noreferrer">Website</a>}
              {p?.resume_url && <a className="au-link" href={p.resume_url} target="_blank" rel="noreferrer">Résumé ↗</a>}
            </div>
          </section>
        )}

        {!data.hide_branding && <footer className="au-foot">Made with Folio</footer>}
      </div>
    </div>
  );
}
