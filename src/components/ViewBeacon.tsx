"use client";

import { useEffect } from "react";

export function ViewBeacon({ username }: { username: string }) {
  useEffect(() => {
    if (!username) return;
    const key = `folio_viewed_${username}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      /* ignore */
    }
    const base = process.env.NEXT_PUBLIC_API_URL;
    if (!base) return;
    fetch(`${base}/api/v1/public/${encodeURIComponent(username)}/view`, { method: "POST", keepalive: true }).catch(() => {});
  }, [username]);
  return null;
}
