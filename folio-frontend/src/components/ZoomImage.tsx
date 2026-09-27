"use client";

import { useEffect, useState } from "react";

export function ZoomImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt || ""}
        className={className}
        style={{ cursor: "zoom-in" }}
        onClick={() => setOpen(true)}
        loading="lazy"
      />
      {open && (
        <div className="zoom-overlay" onClick={() => setOpen(false)} role="dialog" aria-modal="true">
          <button className="zoom-close" aria-label="Close" onClick={() => setOpen(false)}>×</button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={alt || ""} className="zoom-full" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </>
  );
}
