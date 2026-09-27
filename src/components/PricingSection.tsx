"use client";

import { useEffect, useMemo, useState } from "react";
import { FEATURE_CATALOG } from "@/lib/features";

interface Plan { key: string; name: string; features?: string[]; periods?: Record<string, string>; highlight?: boolean; }
type Limits = Record<string, Record<string, number>>;

const LIMIT_LABELS: { key: string; label: string }[] = [
  { key: "projects", label: "Projects" }, { key: "skills", label: "Skills" },
  { key: "experience", label: "Experience" }, { key: "education", label: "Education" },
  { key: "gallery", label: "Gallery" }, { key: "services", label: "Services" },
  { key: "certifications", label: "Certifications" }, { key: "achievements", label: "Achievements" },
  { key: "testimonials", label: "Testimonials" }, { key: "publications", label: "Publications" },
  { key: "videos", label: "Videos" }, { key: "links", label: "Links" },
];
const PERIODS = ["monthly", "yearly", "lifetime"] as const;
const SUFFIX: Record<string, string> = { monthly: "/mo", yearly: "/yr", lifetime: " lifetime" };

export function PricingSection() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currency, setCurrency] = useState("");
  const [limits, setLimits] = useState<Limits>({});
  const [period, setPeriod] = useState<string>("monthly");

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_URL;
    if (!base) return;
    fetch(`${base}/api/v1/public/branding`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d) { setPlans(Array.isArray(d.plans) ? d.plans : []); setCurrency(d.currency || ""); setLimits(d.limits || {}); } })
      .catch(() => {});
  }, []);

  const availablePeriods = useMemo(
    () => PERIODS.filter((p) => plans.some((pl) => pl.periods?.[p])),
    [plans],
  );
  useEffect(() => {
    if (availablePeriods.length && !availablePeriods.includes(period as typeof PERIODS[number])) setPeriod(availablePeriods[0]);
  }, [availablePeriods, period]);

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

  return (
    <div className="pricing-wrap">
      {availablePeriods.length > 1 && (
        <div className="period-toggle">
          {availablePeriods.map((p) => (
            <button key={p} className={`period-btn ${period === p ? "on" : ""}`} onClick={() => setPeriod(p)}>
              {p === "monthly" ? "Monthly" : p === "yearly" ? "Yearly" : "Lifetime"}
            </button>
          ))}
        </div>
      )}

      <div className="pricing-grid">
        {/* FREE */}
        <div className="pricing-card">
          <h3>Free</h3>
          <div className="pricing-price">{cur}0<span className="muted small"> forever</span></div>
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
          const price = pl.periods?.[period];
          return (
            <div key={pl.key} className={`pricing-card ${pl.highlight ? "featured" : ""}`}>
              {pl.highlight && <span className="pricing-badge">Popular</span>}
              <h3>{pl.name}</h3>
              <div className="pricing-price">
                {price ? <>{cur}{price}<span className="muted small">{SUFFIX[period] || ""}</span></> : <span className="muted">Not on {period}</span>}
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
    </div>
  );
}
