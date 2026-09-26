import React from 'react';
import type { PublicPortfolio } from "@/lib/publicTypes";
import { dateRange, videoEmbed } from "@/lib/publicTypes";
import { LinkChip } from "@/components/LinkChip";
import { ZoomImage } from "@/components/ZoomImage";

// FolderTemplate redesign based on the provided image style
export function FolderTemplate({ data }: { data: PublicPortfolio }) {
  const p = data.profile;
  const name = p?.display_name || data.username || "Untitled";
  const hasContact = p?.email || p?.phone || p?.website || p?.availability;

  return (
    <div className="tpl-folder custom-cursor" style={{ ["--tpl-accent" as string]: data.accent || "#88be32" } as React.CSSProperties}>
      
      {/* Inline styles for Folder Design, Glassmorphism & Custom Cursor */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-cursor {
          /* Custom Green Cursor matching the theme */
          cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="%2388be32" opacity="0.8" stroke="white" stroke-width="2"/></svg>') 12 12, auto;
        }
        .tpl-folder {
          background: radial-gradient(circle at top, #152210 0%, #050505 100%);
          color: #f0f0f0;
          font-family: sans-serif;
          min-height: 100vh;
          padding: 3rem 1rem;
          display: flex;
          justify-content: center;
          align-items: flex-start;
        }
        .folder-container {
          max-width: 900px;
          width: 100%;
          background: rgba(136, 190, 50, 0.05);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 0 24px 24px 24px;
          border: 1px solid rgba(136, 190, 50, 0.3);
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(136, 190, 50, 0.2);
          position: relative;
          margin-top: 40px;
        }
        .folder-tab {
          position: absolute;
          top: -40px;
          left: -1px;
          background: rgba(136, 190, 50, 0.1);
          backdrop-filter: blur(20px);
          border-radius: 16px 16px 0 0;
          border: 1px solid rgba(136, 190, 50, 0.3);
          border-bottom: none;
          padding: 10px 40px;
          font-size: 0.9rem;
          font-weight: bold;
          color: var(--tpl-accent);
          text-transform: uppercase;
          letter-spacing: 2px;
        }
        .folder-content {
          padding: 2.5rem;
        }
        .f-hero {
          text-align: center;
          margin-bottom: 3rem;
        }
        .f-name {
          font-size: 4rem;
          font-weight: 800;
          color: #fff;
          margin: 10px 0 0 0;
          line-height: 1.1;
          letter-spacing: -2px;
        }
        .f-name span { color: var(--tpl-accent); }
        .file-accordion {
          background: rgba(0,0,0,0.4);
          border: 1px solid rgba(136, 190, 50, 0.15);
          border-radius: 12px;
          margin-bottom: 1.2rem;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        .file-accordion:hover { border-color: rgba(136, 190, 50, 0.5); box-shadow: 0 0 15px rgba(136,190,50,0.1); }
        .file-accordion summary {
          padding: 1.2rem 1.5rem;
          font-size: 1.2rem;
          font-weight: 600;
          cursor: inherit;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: linear-gradient(90deg, rgba(136,190,50,0.15) 0%, transparent 100%);
          outline: none;
          list-style: none;
        }
        .file-accordion summary::-webkit-details-marker { display: none; }
        .file-accordion summary:after {
          content: '+';
          color: var(--tpl-accent);
          font-size: 1.5rem;
          transition: transform 0.3s ease;
        }
        .file-accordion[open] summary:after { transform: rotate(45deg); }
        .file-body {
          padding: 1.5rem;
          border-top: 1px solid rgba(136, 190, 50, 0.15);
          background: rgba(0,0,0,0.2);
        }
        .f-card {
          background: rgba(255,255,255,0.02);
          border-radius: 8px;
          padding: 1.2rem;
          margin-bottom: 1rem;
          border: 1px solid transparent;
          transition: border 0.3s;
        }
        .f-card:hover { border-color: rgba(136, 190, 50, 0.3); }
        .f-card h3 { margin: 0 0 5px 0; color: #fff; font-size: 1.3rem; }
        .f-tags { margin-top: 10px; display: flex; flex-wrap: wrap; gap: 8px; }
        .f-tags span {
          background: rgba(136, 190, 50, 0.2);
          color: var(--tpl-accent);
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 0.85rem;
        }
        .f-links { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; margin-top: 1.5rem; }
        .f-link { background: rgba(136, 190, 50, 0.2); padding: 8px 20px; border-radius: 30px; color: #fff; text-decoration: none; font-weight: bold; transition: all 0.2s;}
        .f-link:hover { background: var(--tpl-accent); color: #000; }
        .row-sub { color: var(--tpl-accent); font-size: 0.9rem; margin-bottom: 10px; display: block; }
        .when { float: right; opacity: 0.7; color: #fff; font-weight: normal; font-size: 0.9rem; }
      `}} />

      <div className="folder-container">
        <div className="folder-tab">Portfolio.exe</div>
        
        <div className="folder-content">
          
          {/* Hero Section */}
          <header className="f-hero">
            {p?.avatar_url && <ZoomImage className="au-avatar" src={p.avatar_url} alt={name} style={{ width: '120px', height: '120px', borderRadius: '24px', border: '2px solid var(--tpl-accent)', objectFit: 'cover' }} />}
            <p style={{ color: 'var(--tpl-accent)', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '0.9rem', marginTop: '1rem' }}>
              {p?.title} {p?.pronouns ? `· ${p.pronouns}` : ""}
            </p>
            <h1 className="f-name">
              {name.split(' ')[0]} <span>{name.split(' ').slice(1).join(' ')}</span>
            </h1>
            {p?.tagline && <p style={{ color: '#ccc', fontSize: '1.1rem', marginTop: '10px' }}>{p.tagline}</p>}
            {p?.location && <p style={{ color: '#777', fontSize: '0.9rem' }}>📍 {p.location}</p>}
            
            {data.links.length > 0 && (
              <div className="f-links">
                {data.links.map((l) => <LinkChip key={l.id} className="f-link" platform={l.platform} url={l.url} label={l.label} />)}
              </div>
            )}
          </header>

          {/* Interactive Folders (File Click Details) */}
          {p?.about && (
            <details className="file-accordion">
              <summary>📁 About Me</summary>
              <div className="file-body">
                <p style={{ lineHeight: '1.6', color: '#ddd' }}>{p.about}</p>
                {p?.bio && <p style={{ marginTop: '10px', color: '#999', fontSize: '0.95rem' }}>{p.bio}</p>}
              </div>
            </details>
          )}

          {data.projects.length > 0 && (
            <details className="file-accordion">
              <summary>📁 Work & Projects</summary>
              <div className="file-body">
                {data.projects.map((pr) => (
                  <a key={pr.id} className="f-card" href={pr.url || undefined} target={pr.url ? "_blank" : undefined} rel="noreferrer" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
                    {pr.image_url && <ZoomImage src={pr.image_url} alt={pr.title} style={{ width: '100%', borderRadius: '8px', marginBottom: '15px' }} />}
                    <h3>{pr.title}</h3>
                    {pr.role && <span className="row-sub">{pr.role}</span>}
                    {pr.description && <p style={{ color: '#bbb' }}>{pr.description}</p>}
                    {pr.tags.length > 0 && <div className="f-tags">{pr.tags.map((t) => <span key={t}>{t}</span>)}</div>}
                  </a>
                ))}
              </div>
            </details>
          )}

          {data.experience.length > 0 && (
            <details className="file-accordion">
              <summary>📁 Experience</summary>
              <div className="file-body">
                {data.experience.map((x) => (
                  <div key={x.id} className="f-card">
                    <h3>{x.title || x.company}</h3>
                    <span className="row-sub">
                      {[x.company, x.location].filter(Boolean).join(" · ")} 
                      <span className="when">{dateRange(x.start_date, x.end_date, x.is_current)}</span>
                    </span>
                    {x.description && <p style={{ color: '#bbb' }}>{x.description}</p>}
                  </div>
                ))}
              </div>
            </details>
          )}

          {data.education.length > 0 && (
            <details className="file-accordion">
              <summary>📁 Education</summary>
              <div className="file-body">
                {data.education.map((e) => (
                  <div key={e.id} className="f-card">
                    <h3>{e.school}</h3>
                    <span className="row-sub">
                      {[e.degree, e.field].filter(Boolean).join(", ")}
                      <span className="when">{dateRange(e.start_date, e.end_date)}</span>
                    </span>
                  </div>
                ))}
              </div>
            </details>
          )}

          {data.services.length > 0 && (
            <details className="file-accordion">
              <summary>📁 Services</summary>
              <div className="file-body">
                {data.services.map((s) => (
                  <div key={s.id} className="f-card">
                    <h3>{s.title} {s.price && <span className="when">{s.price}</span>}</h3>
                    {s.description && <p style={{ color: '#bbb' }}>{s.description}</p>}
                  </div>
                ))}
              </div>
            </details>
          )}

          {data.skills.length > 0 && (
            <details className="file-accordion">
              <summary>📁 Skills</summary>
              <div className="file-body">
                <div className="f-tags">
                  {data.skills.map((s) => <span key={s.id} style={{ fontSize: '1rem', padding: '6px 12px' }}>{s.name}</span>)}
                </div>
              </div>
            </details>
          )}

          {data.gallery.length > 0 && (
            <details className="file-accordion">
              <summary>📁 Gallery</summary>
              <div className="file-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                {data.gallery.map((g) => (
                  <figure key={g.id} style={{ margin: 0 }}>
                    <ZoomImage src={g.image_url} alt={g.caption || ""} style={{ width: '100%', borderRadius: '8px' }} />
                    {g.caption && <figcaption style={{ textAlign: 'center', marginTop: '8px', color: '#aaa', fontSize: '0.85rem' }}>{g.caption}</figcaption>}
                  </figure>
                ))}
              </div>
            </details>
          )}

          {data.videos.length > 0 && (
            <details className="file-accordion">
              <summary>📁 Videos</summary>
              <div className="file-body">
                {data.videos.map((v) => { 
                  const embed = videoEmbed(v.url); 
                  return (
                    <div key={v.id} className="f-card">
                      {embed ? (
                        <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '8px' }}>
                          <iframe src={embed} title={v.title || "Video"} allowFullScreen style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }} />
                        </div>
                      ) : (
                        <a className="f-link" href={v.url} target="_blank" rel="noreferrer">{v.title || v.url}</a>
                      )}
                    </div>
                  ); 
                })}
              </div>
            </details>
          )}

          {hasContact && (
            <details className="file-accordion" open>
              <summary>📁 Contact & Connect</summary>
              <div className="file-body">
                {p?.availability && <p style={{ color: 'var(--tpl-accent)', marginBottom: '15px', fontWeight: 'bold' }}>{p.availability}</p>}
                <div className="f-links" style={{ justifyContent: 'flex-start' }}>
                  {p?.email && <a className="f-link" href={`mailto:${p.email}`}>{p.email}</a>}
                  {p?.phone && <span className="f-link">{p.phone}</span>}
                  {p?.website && <a className="f-link" href={p.website} target="_blank" rel="noreferrer">Website</a>}
                  {p?.resume_url && <a className="f-link" href={p.resume_url} target="_blank" rel="noreferrer">Résumé ↗</a>}
                </div>
              </div>
            </details>
          )}

          {!data.hide_branding && <footer style={{ textAlign: 'center', marginTop: '3rem', color: '#555', fontSize: '0.9rem', letterSpacing: '1px' }}>MADE WITH FOLIO</footer>}
        </div>
      </div>
    </div>
  );
}
