"use client";

import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch, ApiError } from "@/lib/api";
import type { Portfolio } from "@/lib/types";
import { useAccount, usePortfolio } from "@/lib/hooks";
import { UsernamePicker } from "@/components/UsernamePicker";
import { Button } from "@/components/ui/Button";

export default function OverviewPage() {
  const qc = useQueryClient();
  const account = useAccount();
  const portfolio = usePortfolio();

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
  if (portfolio.isError || !portfolio.data) {
    const e = portfolio.error;
    const msg =
      e instanceof ApiError
        ? e.message
        : "Couldn't reach the API. Is the backend running and NEXT_PUBLIC_API_URL set?";
    return <div className="alert alert-error">{msg}</div>;
  }

  const pf = portfolio.data;
  const published = pf.status === "published";
  const statusErr = setStatus.error instanceof ApiError ? setStatus.error.message : null;
  const p = pf.profile;

  const steps = [
    { done: !!pf.username, label: "Claim your username" },
    { done: !!(p?.display_name && p?.title), label: "Add your name and title" },
    { done: !!p?.bio, label: "Write a short bio" },
    { done: published, label: "Publish your portfolio" },
  ];
  const doneCount = steps.filter((s) => s.done).length;

  return (
    <div className="stack gap-6">
      <div>
        <h1 className="page-title">Welcome back</h1>
        <p className="muted">{account.data?.email}</p>
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
              <Button loading={setStatus.isPending} onClick={() => setStatus.mutate("unpublished")}>
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

      {/* Setup checklist */}
      <div className="card">
        <div className="row between">
          <h2 className="card-title">Get set up</h2>
          <span className="muted small">{doneCount}/{steps.length} done</span>
        </div>
        <div className="progress mt-4"><span style={{ width: `${(doneCount / steps.length) * 100}%` }} /></div>
        <ul className="checklist mt-4">
          {steps.map((s) => (
            <li key={s.label} className={s.done ? "done" : ""}>
              <span className="tick" aria-hidden>{s.done ? "✓" : ""}</span>
              {s.label}
            </li>
          ))}
        </ul>
        <div className="mt-4">
          <Link href="/dashboard/profile" className="btn btn-sm">Edit profile</Link>
        </div>
      </div>

      <UsernamePicker portfolio={pf} />
    </div>
  );
}
