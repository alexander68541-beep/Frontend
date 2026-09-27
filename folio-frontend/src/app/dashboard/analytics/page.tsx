"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch, ApiError } from "@/lib/api";

interface Point { day: string; count: number; }
interface Analytics { series: Point[]; total: number; today: number; last7: number; }

export default function AnalyticsPage() {
  const q = useQuery({ queryKey: ["analytics"], queryFn: () => apiFetch<Analytics>("/portfolio/analytics"), refetchInterval: 30000, refetchOnWindowFocus: true });

  if (q.isLoading) return <p className="muted">Loading…</p>;
  if (q.isError || !q.data) return <div className="alert alert-error">{q.error instanceof ApiError ? q.error.message : "Couldn't load analytics."}</div>;

  const { series, total, today, last7 } = q.data;
  const max = Math.max(1, ...series.map((s) => s.count));

  return (
    <div className="stack gap-6">
      <div><h1 className="page-title">Analytics</h1><p className="muted">Views of your public portfolio (last 30 days).</p></div>

      <div className="stat-row">
        <div className="stat-card"><span className="stat-label">Total views</span><span className="stat-value">{total}</span></div>
        <div className="stat-card"><span className="stat-label">Last 7 days</span><span className="stat-value">{last7}</span></div>
        <div className="stat-card"><span className="stat-label">Today</span><span className="stat-value">{today}</span></div>
      </div>

      <div className="card">
        <h2 className="card-title">Daily views</h2>
        {total === 0 ? (
          <p className="muted mt-4">No views yet. Publish and share your portfolio to start tracking.</p>
        ) : (
          <div className="chart mt-6">
            {series.map((s) => (
              <div key={s.day} className="chart-col" title={`${s.day}: ${s.count}`}>
                <div className="chart-bar" style={{ height: `${(s.count / max) * 100}%` }} />
              </div>
            ))}
          </div>
        )}
        <div className="row between muted small mt-2">
          <span>{series[0]?.day.slice(5)}</span>
          <span>{series[series.length - 1]?.day.slice(5)}</span>
        </div>
      </div>
    </div>
  );
}
