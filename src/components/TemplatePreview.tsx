"use client";

import { useEffect, useState } from "react";

const TEMPLATES = ["Minimal", "Bold", "Editorial"];

/**
 * The hero's centerpiece: one identical profile ("Arya Sen · Product Designer")
 * rendered through three template skins that auto-cycle. It demonstrates Folio's
 * core promise — the data stays put, only the presentation changes.
 */
export function TemplatePreview() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const t = setInterval(() => setActive((i) => (i + 1) % TEMPLATES.length), 3000);
    return () => clearInterval(t);
  }, [paused]);

  return (
    <div className="hero-visual rise d4">
      <div
        className="device"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="device-bar">
          <i /> <i /> <i />
          <span className="url">arya.assetprim.com</span>
        </div>
        <div className="device-screen">
          {/* Minimal */}
          <div className={`skin ${active === 0 ? "is-active" : ""}`}>
            <div className="skA">
              <div className="av" />
              <div>
                <h4>Arya Sen</h4>
                <div className="role">Product Designer</div>
              </div>
              <div className="bars">
                <span /> <span /> <span /> <span />
              </div>
            </div>
          </div>

          {/* Bold */}
          <div className={`skin ${active === 1 ? "is-active" : ""}`}>
            <div className="skB">
              <div className="role">Product Designer</div>
              <h4>Arya Sen</h4>
              <div className="dots">
                <i /> <i /> <i />
              </div>
            </div>
          </div>

          {/* Editorial */}
          <div className={`skin ${active === 2 ? "is-active" : ""}`}>
            <div className="skC">
              <div className="left">
                <h4>Arya Sen</h4>
                <div className="role">Product Designer</div>
              </div>
              <div className="lines">
                <span /> <span /> <span /> <span /> <span />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="tpl-tabs">
        {TEMPLATES.map((t, i) => (
          <button
            key={t}
            type="button"
            className={`tpl-tab ${active === i ? "is-active" : ""}`}
            onClick={() => setActive(i)}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}
