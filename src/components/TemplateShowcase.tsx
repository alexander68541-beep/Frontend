"use client";

import { TemplateThumb } from "@/components/TemplateThumb";

const TEMPLATES = [
  { key: "aurora", name: "Aurora", tag: "Creative" },
  { key: "bold", name: "Bold", tag: "Dramatic" },
  { key: "editorial", name: "Editorial", tag: "Editorial" },
  { key: "minimal", name: "Minimal", tag: "Clean" },
];

export function TemplateShowcase() {
  return (
    <div className="showcase-grid">
      {TEMPLATES.map((t) => (
        <a key={t.key} href={`/t/${t.key}`} target="_blank" rel="noreferrer" className="showcase-card">
          <div className="showcase-preview"><TemplateThumb src={`/t/${t.key}`} /></div>
          <div className="showcase-meta">
            <div><strong>{t.name}</strong> <span className="showcase-tag">{t.tag}</span></div>
            <span className="muted small">Live preview ↗</span>
          </div>
        </a>
      ))}
    </div>
  );
}
