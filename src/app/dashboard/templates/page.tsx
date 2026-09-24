"use client";

export default function TemplatesPage() {
  const templates = [
    { name: "Minimal", desc: "Clean, quiet, typography-first." },
    { name: "Bold", desc: "Big type, high contrast, a statement." },
    { name: "Editorial", desc: "Magazine-style, structured columns." },
  ];
  return (
    <div className="stack gap-6">
      <div className="row between wrap gap-3">
        <div>
          <h1 className="page-title">Templates</h1>
          <p className="muted">Switch how your portfolio looks — your data never changes.</p>
        </div>
        <span className="badge badge-draft"><span className="dot" />Arriving in Phase 3</span>
      </div>

      <div className="tpl-grid">
        {templates.map((t, i) => (
          <div key={t.name} className="tpl-card">
            <div className={`tpl-thumb thumb-${i}`} aria-hidden>
              <span className="tt-avatar" />
              <span className="tt-line w60" />
              <span className="tt-line w40" />
              <span className="tt-row"><span /><span /></span>
            </div>
            <div className="row between">
              <div>
                <h3 className="tpl-name">{t.name}</h3>
                <p className="muted small">{t.desc}</p>
              </div>
              <button className="btn btn-sm" disabled>Preview</button>
            </div>
          </div>
        ))}
      </div>

      <div className="card center muted">
        The template engine renders your saved data through any of these skins. Selecting and
        switching templates goes live in Phase 3 — nothing you enter now will be lost.
      </div>
    </div>
  );
}
