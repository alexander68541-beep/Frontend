import type { PublicPortfolio } from "@/lib/publicTypes";
import { dateRange } from "@/lib/publicTypes";

export function BoldTemplate({ data }: { data: PublicPortfolio }) {
  const p = data.profile;
  const name = p?.display_name || data.username || "Untitled";
  return (
    <div className="tpl-bold">
      <div className="tb-aurora" aria-hidden><span /><span /></div>
      <div className="tb-wrap">
        <header className="tb-hero">
          {p?.avatar_url && <img className="tb-avatar" src={p.avatar_url} alt={name} />}
          {p?.title && <p className="tb-eyebrow">{p.title}</p>}
          <h1 className="tb-name">{name}</h1>
          {p?.location && <p className="tb-loc">{p.location}</p>}
          {p?.bio && <p className="tb-bio">{p.bio}</p>}
          {data.links.length > 0 && (
            <div className="tb-links">
              {data.links.map((l) => (
                <a key={l.id} href={l.url} target="_blank" rel="noreferrer" className="tb-link">
                  {l.label || l.platform}
                </a>
              ))}
            </div>
          )}
        </header>

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

        <footer className="tb-foot">Made with Folio</footer>
      </div>
    </div>
  );
}
