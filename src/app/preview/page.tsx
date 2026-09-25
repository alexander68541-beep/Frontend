"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiFetch, ApiError } from "@/lib/api";
import type { PublicPortfolio } from "@/lib/publicTypes";
import { TemplateRenderer } from "@/templates";

export default function PreviewPage() {
  const q = useQuery({
    queryKey: ["preview"],
    queryFn: () => apiFetch<PublicPortfolio>("/public/preview"),
  });

  if (q.isLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }} className="muted">
        Loading preview…
      </div>
    );
  }
  if (q.isError || !q.data) {
    const msg = q.error instanceof ApiError ? q.error.message : "Couldn't load preview.";
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
        <div className="alert alert-error">{msg}</div>
      </div>
    );
  }

  return (
    <>
      <div className="preview-bar">
        <span className="preview-tag">Preview — only you can see this{q.data.username ? "" : " (claim a username to publish)"}</span>
        <Link href="/dashboard" className="btn btn-sm">Back to dashboard</Link>
      </div>
      <div className="preview-body">
        <TemplateRenderer data={q.data} />
      </div>
    </>
  );
}
