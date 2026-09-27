"use client";

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Surfaced in the browser console (and any configured client error tracker).
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="error-page">
      <div className="card center error-card">
        <div className="error-emoji">😵‍💫</div>
        <h1 className="page-title">Something went wrong</h1>
        <p className="muted">An unexpected error occurred. You can try again — if it keeps happening, refresh the page.</p>
        {error?.digest && <p className="muted small">Ref: {error.digest}</p>}
        <div className="row gap-3 mt-4" style={{ justifyContent: "center" }}>
          <button className="btn btn-accent" onClick={() => reset()}>Try again</button>
          <a className="btn" href="/dashboard">Go to dashboard</a>
        </div>
      </div>
    </div>
  );
}
