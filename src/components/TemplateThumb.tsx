"use client";

import { useEffect, useRef, useState } from "react";

// Renders a desktop-width (1280px) live preview of a template, scaled to fit the
// card width — so the thumbnail looks like the site does on a PC.
const BASE_W = 1280;
const BASE_H = 940;

export function TemplateThumb({ src }: { src: string }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.3);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const update = () => setScale(el.clientWidth / BASE_W);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="tpl-thumb-box" ref={boxRef}>
      <iframe
        src={src}
        title="Template preview"
        loading="lazy"
        scrolling="no"
        tabIndex={-1}
        className="tpl-thumb-iframe"
        style={{ width: BASE_W, height: BASE_H, transform: `scale(${scale})` }}
      />
    </div>
  );
}
