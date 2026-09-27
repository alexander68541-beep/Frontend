"use client";

import { useEffect, useState } from "react";
import { FEATURE_CATALOG } from "@/lib/features";

interface Plan { key: string; name: string; features?: string[]; periods?: Record<string, string>; highlight?: boolean; }
type Limits = Record<string, Record<string, number>>;

const LIMIT_LABELS: { key: string; label: string }[] = [
  { key: "projects", label: "Projects" }, { key: "skills", label: "Skills" },
  { key: "experience", label: "Experience" }, { key: "gallery", label: "Gallery" },
  { key: "services", label: "Services" }, { key: "videos", label: "Videos" },
];
const PERIODS: { key: string; label: string }[] = [
  { key: "monthly", label: "/mo" }, { key: "yearly", label: "/yr" }, { key: "lifetime", label: "lifetime" },
];

export function PricingSection() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currency, setCurrency] = useState("");
  const [limits, setLimits] = useState<Limits>({});

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_URL;
    if (!base) return;
    fetch(`${base}/api/v1/public/branding`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d) { setPlans(Array.isArray(d.plans) ? d.plans : []); setCurrency(d.currency || ""); setLimits(d.limits || {}); } })
      .catch(() => {});
  }, []);

  const label = (k: string) => FEATURE_CATALOG.find((f) => f.key === k)?.label ?? k;
  const allKeys = FEATURE_CATALOG.map((f) => f.key);
  const cur = currency || "$";

  function limitLine(planKey: string) {
    const lim = limits[planKey] || {};
    return LIMIT_LABELS.map((l) => {
      const v = lim[l.key];
      return { label: l.label, val: v === undefined ? "Unlimited" : v === 0 ? "—" : String(v) };
    });
  }

  function prices(pl: Plan) {
    return PERIODS.map((p) => ({ label: p.label, val: pl.periods?.[p.key] })).filter((p) => p.val);
  }

  return (
    <div className="pricing-grid">
      {/* FREE */}
      <div className="pricing-card">
        <h3>Free</h3>
        <div className="pricing-price">{cur}0</div>
        <p className="muted small">Everything to build &amp; publish.</p>
        <div className="pricing-limits">
          {limitLine("free").map((l) => <div key={l.label}><span>{l.label}</span><strong>{l.val}</strong></div>)}
        </div>
        <ul className="pricing-list">
          {allKeys.map((k) => <li key={k} className="off">✕ {label(k)}</li>)}
        </ul>
        <a href="/register" className="btn">Get started free</a>
      </div>

      {plans.map((pl) => {
        const feats = pl.features || [];
        return (
          <div key={pl.key} className={`pricing-card ${pl.highlight ? "featured" : ""}`}>
            {pl.highlight && <span className="pricing-badge">Best value</span>}
            <h3>{pl.name}</h3>
            <div className="pricing-prices">
              {prices(pl).length ? prices(pl).map((p) => (
                <div key={p.label} className="pricing-price-row"><strong>{cur}{p.val}</strong><span className="muted small">{p.label}</span></div>
              )) : <div className="pricing-price">—</div>}
            </div>
            <div className="pricing-limits">
              {limitLine(pl.key).map((l) => <div key={l.label}><span>{l.label}</span><strong>{l.val}</strong></div>)}
            </div>
            <ul className="pricing-list">
              {allKeys.map((k) => <li key={k} className={feats.includes(k) ? "" : "off"}>{feats.includes(k) ? "✓" : "✕"} {label(k)}</li>)}
            </ul>
            <a href="/dashboard/billing" className="btn btn-accent">Choose {pl.name}</a>
          </div>
        );
      })}
    </div>
  );
}
