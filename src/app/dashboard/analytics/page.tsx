"use client";

export default function AnalyticsPage() {
  return (
    <div className="stack gap-6">
      <div className="row between wrap gap-3">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="muted">Views, visitors and referrers for your public portfolio.</p>
        </div>
        <span className="badge badge-draft"><span className="dot" />Coming soon</span>
      </div>

      <div className="stat-row">
        {["Views", "Unique visitors", "Avg. time", "Top referrer"].map((s) => (
          <div key={s} className="stat-card">
            <span className="stat-label">{s}</span>
            <span className="stat-value">—</span>
          </div>
        ))}
      </div>

      <div className="card center muted empty-lg">
        <div className="empty-illo" aria-hidden>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></svg>
        </div>
        Once your portfolio is published and getting traffic, your stats will appear here.
      </div>
    </div>
  );
}
