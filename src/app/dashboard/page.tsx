"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, ApiError } from "@/lib/api";
import type { Account, Portfolio } from "@/lib/types";
import { UsernamePicker } from "@/components/UsernamePicker";
import { ProfileEditor } from "@/components/ProfileEditor";
import { Button } from "@/components/ui/Button";

export default function DashboardPage() {
  const qc = useQueryClient();

  const account = useQuery({
    queryKey: ["account"],
    queryFn: () => apiFetch<Account>("/me"),
  });
  const portfolio = useQuery({
    queryKey: ["portfolio"],
    queryFn: () => apiFetch<Portfolio>("/portfolio"),
  });

  const setStatus = useMutation({
    mutationFn: (status: "published" | "unpublished") =>
      apiFetch<Portfolio>("/portfolio/status", {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    onSuccess: (data) => qc.setQueryData(["portfolio"], data),
  });

  if (account.isLoading || portfolio.isLoading) {
    return <p className="muted">Loading your workspace…</p>;
  }

  if (account.isError || portfolio.isError || !portfolio.data) {
    const e = (portfolio.error ?? account.error);
    const msg =
      e instanceof ApiError
        ? e.message
        : "Couldn't reach the API. Is the backend running and NEXT_PUBLIC_API_URL set?";
    return <div className="alert alert-error">{msg}</div>;
  }

  const pf = portfolio.data;
  const published = pf.status === "published";
  const statusErr = setStatus.error instanceof ApiError ? setStatus.error.message : null;

  return (
    <div className="stack gap-6">
      <div className="row between wrap gap-4">
        <div>
          <h1 style={{ fontSize: 30 }}>Dashboard</h1>
          <p className="muted small">{account.data?.email}</p>
        </div>
        <span className={`badge ${published ? "badge-published" : "badge-draft"}`}>
          <span className="dot" />
          {published ? "Published" : pf.status[0].toUpperCase() + pf.status.slice(1)}
        </span>
      </div>

      {/* Publish bar */}
      <div className="card">
        <div className="row between wrap gap-4">
          <div>
            <h2 className="card-title">
              {published ? "Your portfolio is live" : "Not published yet"}
            </h2>
            <p className="muted small">
              {pf.username
                ? `folio.assetprim.com/p/${pf.username}`
                : "Claim a username below to be able to publish."}
            </p>
            {statusErr && <div className="alert alert-error mt-2">{statusErr}</div>}
          </div>
          <div className="row gap-3">
            {published ? (
              <Button
                loading={setStatus.isPending}
                onClick={() => setStatus.mutate("unpublished")}
              >
                Unpublish
              </Button>
            ) : (
              <Button
                variant="accent"
                loading={setStatus.isPending}
                disabled={!pf.username}
                onClick={() => setStatus.mutate("published")}
              >
                Publish
              </Button>
            )}
          </div>
        </div>
      </div>

      <UsernamePicker portfolio={pf} />
      <ProfileEditor portfolio={pf} />
    </div>
  );
}
