"use client";
export default function SeoPage() {
  return (
    <div className="stack gap-6">
      <div className="row between wrap gap-3">
        <div>
          <h1 className="page-title">SEO / Sharing</h1>
          <p className="muted">Control how your portfolio appears in search and when shared.</p>
        </div>
        <span className="badge badge-draft"><span className="dot" />Coming soon</span>
      </div>
      <div className="card muted">
        Custom meta title, description and social share image are coming in a later phase.
        For now, your portfolio automatically uses your name and bio for its page title and
        description.
      </div>
    </div>
  );
}
