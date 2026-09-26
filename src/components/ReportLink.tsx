"use client";
import { useState } from "react";

export function ReportLink({ username }: { username: string }) {
  const [done, setDone] = useState(false);
  async function report() {
    const reason = window.prompt("Report this portfolio — reason (spam, abuse, impersonation, copyright):");
    if (!reason) return;
    const base = process.env.NEXT_PUBLIC_API_URL;
    try {
      await fetch(`${base}/api/v1/public/${encodeURIComponent(username)}/report`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reason }),
      });
      setDone(true);
    } catch { /* ignore */ }
  }
  return (
    <button onClick={report} className="report-link" disabled={done}>{done ? "Reported ✓" : "Report"}</button>
  );
}
