"use client";

import { ApiError } from "@/lib/api";
import { usePortfolio } from "@/lib/hooks";
import { ProfileEditor } from "@/components/ProfileEditor";

export default function ProfilePage() {
  const portfolio = usePortfolio();

  if (portfolio.isLoading) return <p className="muted">Loading…</p>;
  if (portfolio.isError || !portfolio.data) {
    const e = portfolio.error;
    return <div className="alert alert-error">{e instanceof ApiError ? e.message : "Couldn't load your profile."}</div>;
  }

  return (
    <div className="stack gap-6">
      <div>
        <h1 className="page-title">Profile</h1>
        <p className="muted">The universal details every template can show.</p>
      </div>
      <ProfileEditor portfolio={portfolio.data} />
    </div>
  );
}
