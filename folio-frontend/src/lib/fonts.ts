export interface FontOption { key: string; label: string; stack: string; }

export const FONT_OPTIONS: FontOption[] = [
  { key: "", label: "Template default", stack: "" },
  { key: "inter", label: "Inter — clean sans", stack: "'Inter', system-ui, sans-serif" },
  { key: "bricolage", label: "Bricolage — display", stack: "'Bricolage Grotesque', system-ui, sans-serif" },
  { key: "serif", label: "Georgia — serif", stack: "Georgia, 'Times New Roman', serif" },
  { key: "system", label: "System UI", stack: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif" },
  { key: "mono", label: "Monospace", stack: "'JetBrains Mono', ui-monospace, SFMono-Regular, monospace" },
];

export function fontStack(key?: string | null): string {
  return FONT_OPTIONS.find((o) => o.key === (key ?? ""))?.stack ?? "";
}

// Section keys that can be toggled/reordered on the public portfolio.
export const SECTION_KEYS: { key: string; label: string }[] = [
  { key: "about", label: "About" },
  { key: "projects", label: "Projects" },
  { key: "experience", label: "Experience" },
  { key: "education", label: "Education" },
  { key: "skills", label: "Skills" },
  { key: "services", label: "Services" },
  { key: "certifications", label: "Certifications" },
  { key: "achievements", label: "Achievements" },
  { key: "publications", label: "Publications" },
  { key: "gallery", label: "Gallery" },
  { key: "videos", label: "Videos" },
  { key: "testimonials", label: "Testimonials" },
];
