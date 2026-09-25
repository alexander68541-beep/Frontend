"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch, ApiError } from "@/lib/api";
import type { Portfolio } from "@/lib/types";
import { usePortfolio } from "@/lib/hooks";
import { TEMPLATES } from "@/templates";
import { Button } from "@/components/ui/Button";
import { portfolioUrl, portfolioLabel } from "@/lib/urls";

export default function TemplatesPage() {
  const qc = useQueryClient();
  const portfolio = usePortfolio();
  const current = portfolio.data?.template ?? "minimal";
  const published = portfolio.data?.status === "published";
  const username = portfolio.data?.username;

  const setTemplate = useMutation({
    mutationFn: (template: string) =>
      apiFetch<Portfolio>("/portfolio/template", {
        method: "PATCH",
        body: JSON.stringify({ template }),
      }),
    onSuccess: (data) => qc.setQueryData(["portfolio"], data),
  });

  const err = setTemplate.error instanceof ApiError ? setTemplate.error.message : null;
  const publicUrl = username ? portfolioUrl(username) : null;

  return (
    <div className="stack gap-6">
      <div className="row between wrap gap-3">
        <div>
          <h1 className="page-title">Templates</h1>
          <p className="muted">Pick how your portfolio looks. Your data never changes.</p>
        </div>
        {username && (
          <a
            className="btn btn-sm"
            href={portfolioUrl(username)}
            target="_blank"
            rel="noreferrer"
          >
            {published ? "View live page ↗" : "Preview page ↗"}
          </a>
        )}
      </div>

      {err && <div className="alert alert-error">{err}</div>}
      {!username && (
        <div className="alert">Claim a username first (Overview) to preview your page.</div>
      )}

      <div className="tpl-grid">
        {TEMPLATES.map((t) => {
          const active = current === t.id;
          return (
            <div key={t.id} className={`tpl-card ${active ? "is-active" : ""}`}>
              <div className={`tpl-thumb ${t.id === "bold" ? "thumb-1" : "thumb-0"}`} aria-hidden>
                <span className="tt-avatar" />
                <span className="tt-line w60" />
                <span className="tt-line w40" />
                <span className="tt-row"><span /><span /></span>
              </div>
              <div className="row between">
                <div>
                  <h3 className="tpl-name">{t.name}</h3>
                  <p className="muted small">{t.desc}</p>
                </div>
                {active ? (
                  <span className="badge badge-published"><span className="dot" />Active</span>
                ) : (
                  <Button
                    variant="accent"
                    className="btn-sm"
                    loading={setTemplate.isPending}
                    onClick={() => setTemplate.mutate(t.id)}
                  >
                    Use
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {publicUrl && (
        <div className="card">
          <h2 className="card-title">Your public link</h2>
          <p className="muted small">
            {published
              ? "Live now — share this link."
              : "Publish from Overview to make this link public."}
          </p>
          <p className="mt-2" style={{ wordBreak: "break-all" }}>{username ? portfolioLabel(username) : publicUrl}</p>
        </div>
      )}
    </div>
  );
}
