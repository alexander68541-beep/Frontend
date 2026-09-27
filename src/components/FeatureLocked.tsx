"use client";

import Link from "next/link";

export function FeatureLocked({ title, desc }: { title: string; desc?: string }) {
  return (
    <div className="card center feature-locked">
      <div className="feature-locked-ic">🔒</div>
      <h2 className="card-title">{title} is a premium feature</h2>
      <p className="muted">{desc ?? "Upgrade to a plan that includes this feature to unlock it."}</p>
      <div className="mt-4"><Link href="/dashboard/billing" className="btn btn-accent">See plans &amp; upgrade</Link></div>
    </div>
  );
}
