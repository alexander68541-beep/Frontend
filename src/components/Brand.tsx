"use client";

import { useEffect, useState } from "react";

export function Brand({ className }: { className?: string }) {
  const [name, setName] = useState("Folio");
  const [logo, setLogo] = useState<string | null>(null);

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_URL;
    if (!base) return;
    fetch(`${base}/api/v1/public/branding`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.site_name) { setName(d.site_name); try { document.title = document.title.replace(/Folio/g, d.site_name); } catch {} }
        if (d?.logo_url) setLogo(d.logo_url);
      })
      .catch(() => {});
  }, []);

  return (
    <span className={className ?? "brand"}>
      {logo ? <img src={logo} alt={name} className="brand-logo" /> : <span className="mark" aria-hidden />}
      {name}
    </span>
  );
}
