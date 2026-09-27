"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch, ApiError } from "@/lib/api";
import { useFeatures } from "@/lib/hooks";
import { FeatureLocked } from "@/components/FeatureLocked";

interface Point { day: string; count: number; }
interface Item { name: string; count: number; }
interface Analytics {
  series: Point[]; total: number; today: number; last7: number;
  unique?: number; referrers?: Item[]; devices?: Item[]; countries?: Item[];
}

function Bars({ items, empty }: { items: Item[]; empty: string }) {
  if (!items.length) return <p className="muted small mt-4">{empty}</p>;
  const max = Math.max(1, ...items.map((i) => i.count));
  return (
    <div className="stack gap-2 mt-4">
      {items.map((it) => (
        <div key={it.name} className="hbar-row">
          <span className="hbar-label">{it.name}</span>
          <span className="hbar-track"><span className="hbar-fill" style={{ width: `${(it.count / max) * 100}%` }} /></span>
          <span className="hbar-count">{it.count}</span>
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const feat = useFeatures();
  const q = useQuery({ queryKey: ["analytics"], queryFn: () => apiFetch<Analytics>("/portfolio/analytics"), refetchInterval: 30000, refetchOnWindowFocus: true });

  if (feat.isLoading) return <p className="muted">Loading…</p>;
  if (!feat.has("analytics")) return (
    <div className="stack gap-6">
      <div><h1 className="page-title">Analytics</h1></div>
      <FeatureLocked title="Analytics" desc="Upgrade to a plan that includes Analytics to see your visitor and view stats." />
    </div>
  );
  if (q.isLoading) return <p className="muted">Loading…</p>;
  if (q.isError || !q.data) return <div className="alert alert-error">{q.error instanceof ApiError ? q.error.message : "Couldn't load analytics."}</div>;

  const { series, total, today, last7, unique = 0, referrers = [], devices = [], countries = [] } = q.data;
  const max = Math.max(1, ...series.map((s) => s.count));

  return (
    <div className="stack gap-6">
      <div><h1 className="page-title">Analytics</h1><p className="muted">Views of your public portfolio (last 30 days). Privacy-safe — no personal data stored.</p></div>

      <div className="stat-row">
        <div className="stat-card"><span className="stat-label">Total views</span><span className="stat-value">{total}</span></div>
        <div className="stat-card"><span className="stat-label">Unique visitors</span><span className="stat-value">{unique}</span></div>
        <div className="stat-card"><span className="stat-label">Last 7 days</span><span className="stat-value">{last7}</span></div>
        <div className="stat-card"><span className="stat-label">Today</span><span className="stat-value">{today}</span></div>
      </div>

      <div className="card">
        <h2 className="card-title">Daily views</h2>
        {total === 0 ? (
          <p className="muted mt-4">No views yet. Publish and share your portfolio to start tracking.</p>
        ) : (
          <>
            <div className="chart mt-6">
              {series.map((s) => (
                <div key={s.day} className="chart-col" title={`${s.day}: ${s.count}`}>
                  <div className="chart-bar" style={{ height: `${(s.count / max) * 100}%` }} />
                </div>
              ))}
            </div>
            <div className="row between muted small mt-2"><span>{series[0]?.day.slice(5)}</span><span>{series[series.length - 1]?.day.slice(5)}</span></div>
          </>
        )}
      </div>

      <div className="two-col">
        <div className="card"><h2 className="card-title">Top referrers</h2><Bars items={referrers} empty="No referrers yet (direct visits)." /></div>
        <div className="card"><h2 className="card-title">Devices</h2><Bars items={devices} empty="No device data yet." /></div>
      </div>

      <div className="card"><h2 className="card-title">Top countries</h2><Bars items={countries} empty="No country data yet." /></div>
    </div>
  );
}
