import type { PublicPortfolio } from "@/lib/publicTypes";
import { dateRange } from "@/lib/publicTypes";

export function MinimalTemplate({ data }: { data: PublicPortfolio }) {
  const p = data.profile;
  const name = p?.display_name || data.username || "Untitled";
  return (
    <div className="tpl-min">
      <div className="tm-wrap">
        <header className="tm-head">
          {p?.avatar_url && <img className="tm-avatar" src={p.avatar_url} alt={name} />}
          <h1 className="tm-name">{name}</h1>
          {p?.title && <p className="tm-title">{p.title}</p>}
          {p?.location && <p className="tm-loc">{p.location}</p>}
          {p?.bio && <p className="tm-bio">{p.bio}</p>}
          {data.links.length > 0 && (
            <div className="tm-links">
              {data.links.map((l) => (
                <a key={l.id} href={l.url} target="_blank" rel="noreferrer">{l.label || l.platform}</a>
              ))}
            </div>
          )}
        </header>

        {data.projects.length > 0 && (
          <section className="tm-sec">
            <h2>Projects</h2>
            <div className="tm-projects">
              {data.projects.map((pr) => (
                <article key={pr.id} className="tm-project">
                  {pr.image_url && <img src={pr.image_url} alt={pr.title} className="tm-proj-img" />}
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

        <footer className="tm-foot">Made with Folio</footer>
      </div>
    </div>
  );
}
