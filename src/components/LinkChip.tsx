// Renders a clickable link with an auto-detected platform icon.
// Server-safe (no client hooks) so templates can use it directly.

type IconKey =
  | "github" | "linkedin" | "x" | "instagram" | "facebook" | "youtube"
  | "dribbble" | "behance" | "medium" | "gitlab" | "mail" | "phone" | "globe";

function detect(platform: string, url: string): IconKey {
  const p = (platform || "").toLowerCase();
  const u = (url || "").toLowerCase();
  const has = (k: string) => p.includes(k) || u.includes(k);
  if (u.startsWith("mailto:") || has("email") || has("gmail")) return "mail";
  if (u.startsWith("tel:") || has("phone")) return "phone";
  if (has("github")) return "github";
  if (has("linkedin")) return "linkedin";
  if (has("twitter") || p === "x" || u.includes("x.com")) return "x";
  if (has("instagram")) return "instagram";
  if (has("facebook") || has("fb.com")) return "facebook";
  if (has("youtube") || has("youtu.be")) return "youtube";
  if (has("dribbble")) return "dribbble";
  if (has("behance")) return "behance";
  if (has("medium")) return "medium";
  if (has("gitlab")) return "gitlab";
  return "globe";
}

function Icon({ k }: { k: IconKey }) {
  const c = { width: 16, height: 16, viewBox: "0 0 24 24", "aria-hidden": true } as const;
  switch (k) {
    case "github":
      return <svg {...c} fill="currentColor"><path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.99 1.03-2.69-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.03a9.5 9.5 0 0 1 5 0c1.91-1.3 2.75-1.03 2.75-1.03.55 1.38.2 2.4.1 2.65.64.7 1.03 1.6 1.03 2.69 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z"/></svg>;
    case "linkedin":
      return <svg {...c} fill="currentColor"><path d="M4.98 3.5A2.5 2.5 0 1 1 5 8.5a2.5 2.5 0 0 1 0-5ZM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05C20.3 8.65 21 10.6 21 13.5V21h-4v-6.7c0-1.6-.03-3.65-2.22-3.65-2.22 0-2.56 1.73-2.56 3.53V21H9z"/></svg>;
    case "x":
      return <svg {...c} fill="currentColor"><path d="M18.9 2H22l-7.5 8.6L23 22h-6.8l-5.3-6.9L4.8 22H1.7l8-9.2L1 2h6.9l4.8 6.3zm-2.4 18h1.9L7.6 3.9H5.6z"/></svg>;
    case "instagram":
      return <svg {...c} fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>;
    case "facebook":
      return <svg {...c} fill="currentColor"><path d="M22 12a10 10 0 1 0-11.5 9.9v-7H8v-2.9h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.300c-1.2 0-1.6.8-1.6 1.6v1.9H16l-.4 2.9h-2.1v7A10 10 0 0 0 22 12Z"/></svg>;
    case "youtube":
      return <svg {...c} fill="currentColor"><path d="M23 12s0-3.2-.4-4.7a2.5 2.5 0 0 0-1.8-1.8C19.3 5 12 5 12 5s-7.3 0-8.8.5A2.5 2.5 0 0 0 1.4 7.3C1 8.8 1 12 1 12s0 3.2.4 4.7a2.5 2.5 0 0 0 1.8 1.8C4.7 19 12 19 12 19s7.3 0 8.8-.5a2.5 2.5 0 0 0 1.8-1.8C23 15.2 23 12 23 12Zm-13 3V9l5 3z"/></svg>;
    case "dribbble":
      return <svg {...c} fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M5 8c4 1 9 2 13 6M9 3c3 4 5 9 5 17M20 10c-5-1-9 0-13 3"/></svg>;
    case "behance":
      return <svg {...c} fill="currentColor"><path d="M8 6H2v12h6.2c2.4 0 4.3-1.2 4.3-3.5 0-1.5-.8-2.5-2-2.9 1-.4 1.6-1.3 1.6-2.6C12.1 7 10.5 6 8 6Zm-.3 4.7H4.6V8.2h3c1 0 1.7.4 1.7 1.2 0 .9-.7 1.3-1.6 1.3Zm.2 5.1H4.6v-3h3.2c1.2 0 1.9.5 1.9 1.5 0 1-.7 1.5-1.6 1.5ZM22 12.7c0-2.6-1.6-4.6-4.3-4.6-2.6 0-4.4 2-4.4 4.6 0 2.7 1.8 4.5 4.5 4.5 2.1 0 3.6-1 4-2.8h-2c-.3.7-.9 1-1.9 1-1.2 0-2-.7-2.1-2H22zm-6.1-1.2c.2-1.1.9-1.7 1.9-1.7s1.7.6 1.8 1.7zM15 6.5h4.6V8H15z"/></svg>;
    case "medium":
      return <svg {...c} fill="currentColor"><path d="M4 7.4c0-.2 0-.4-.2-.6L2.3 5v-.3h4.3l3.3 7.3 2.9-7.3H17V5l-1.2 1.1c-.1.1-.2.2-.1.4v9c0 .2 0 .3.1.4l1.1 1.1v.3h-5.6v-.3l1.2-1.2c.1-.1.1-.1.1-.4V8.2l-3.3 8.3h-.4L5.2 8.2v5.6c0 .3 0 .5.2.7l1.5 1.9v.3H2.8v-.3l1.5-1.9c.2-.2.3-.4.2-.7z"/></svg>;
    case "gitlab":
      return <svg {...c} fill="currentColor"><path d="m12 21 3.3-10.2H8.7zM3 10.8 12 21 1.5 13.3zm9 10.2L21 10.8l1.5 2.5zM3 10.8 4.8 5l1.9 5.8zm18 0L19.2 5l-1.9 5.8z"/></svg>;
    case "mail":
      return <svg {...c} fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>;
    case "phone":
      return <svg {...c} fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 4h4l2 5-3 2a11 11 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z"/></svg>;
    default:
      return <svg {...c} fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/></svg>;
  }
}

export function LinkChip({
  platform,
  url,
  label,
  className = "link-chip",
}: {
  platform: string;
  url: string;
  label?: string | null;
  className?: string;
}) {
  return (
    <a className={className} href={url} target="_blank" rel="noreferrer">
      <span className="lc-ic"><Icon k={detect(platform, url)} /></span>
      <span>{label || platform}</span>
    </a>
  );
}
