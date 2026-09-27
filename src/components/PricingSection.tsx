"use client";

import { useEffect, useState } from "react";
import { FEATURE_CATALOG } from "@/lib/features";

interface Plan { key: string; name: string; features?: string[]; periods?: Record<string, string>; highlight?: boolean; }

export function PricingSection() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currency, setCurrency] = useState("");

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_URL;
    if (!base) return;
    fetch(`${base}/api/v1/public/branding`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d) { setPlans(Array.isArray(d.plans) ? d.plans : []); setCurrency(d.currency || ""); } })
      .catch(() => {});
  }, []);

  const label = (k: string) => FEATURE_CATALOG.find((f) => f.key === k)?.label ?? k;
  const allKeys = FEATURE_CATALOG.map((f) => f.key);

  return (
    <div className="pricing-grid">
      <div className="pricing-card">
        <h3>Free</h3>
        <div className="pricing-price">{currency || "$"}0</div>
        <p className="muted small">Everything to build &amp; publish.</p>
        <ul className="pricing-list">
          <li>✓ Build &amp; publish your portfolio</li>
          <li>✓ Core templates</li>
          <li>✓ Your own address</li>
          {allKeys.map((k) => <li key={k} className="off">✕ {label(k)}</li>)}
        </ul>
        <a href="/register" className="btn">Get started free</a>
      </div>

      {plans.map((pl) => {
        const price = pl.periods?.lifetime || pl.periods?.yearly || pl.periods?.monthly;
        const feats = pl.features || [];
        return (
          <div key={pl.key} className={`pricing-card ${pl.highlight ? "featured" : ""}`}>
            {pl.highlight && <span className="pricing-badge">Best value</span>}
            <h3>{pl.name}</h3>
            <div className="pricing-price">{price ? `${currency || "$"}${price}` : "—"}</div>
            <p className="muted small">All Free features, plus:</p>
            <ul className="pricing-list">
              {allKeys.map((k) => (
                <li key={k} className={feats.includes(k) ? "" : "off"}>{feats.includes(k) ? "✓" : "✕"} {label(k)}</li>
              ))}
            </ul>
            <a href="/dashboard/billing" className="btn btn-accent">Choose {pl.name}</a>
          </div>
        );
      })}
    </div>
  );
}
