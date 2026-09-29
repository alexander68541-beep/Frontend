"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import type { PublicPortfolio } from "@/lib/publicTypes";
import { dateRange, videoEmbed, ext } from "@/lib/publicTypes";
import { ContactForm } from "@/components/ContactForm";

/* =====================================================================
   TerminalTemplate — "Devterm"
   A monospace, terminal / code-editor themed portfolio for Folio.
   PURE PRESENTATION — everything comes from `data`. No fetch/DB/auth.
   Client component only for UI behaviour (theme toggle, code tabs,
   lightbox, scroll reveal). Styles are self-contained + prefixed `.term-`
   and scoped under `.term-root`.
   ===================================================================== */

/* ------------------------------ pure helpers ------------------------------ */

const DEFAULT_ORDER = [
  "about",
  "services",
  "skills",
  "projects",
  "experience",
  "education",
  "certifications",
  "achievements",
  "publications",
  "gallery",
  "videos",
  "testimonials",
];

function resolveOrder(settings: PublicPortfolio["settings"]): string[] {
  const custom = settings?.section_order;
  const order = custom && custom.length ? [...custom] : [...DEFAULT_ORDER];
  for (const k of DEFAULT_ORDER) if (!order.includes(k)) order.push(k);
  return order;
}

function initials(name: string | null | undefined, fallback: string | null | undefined): string {
  const src = (name || fallback || "").trim();
  if (!src) return "◆";
  const parts = src.split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : src.slice(0, 2);
  return letters.toUpperCase();
}

function oneDate(s: string | null): string | null {
  if (!s) return null;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short" });
}

function levelPct(level: unknown): number | null {
  if (level === null || level === undefined || level === "") return null;
  const clamp = (n: number) => Math.max(0, Math.min(100, n));
  if (typeof level === "number") {
    if (Number.isNaN(level)) return null;
    return clamp(level <= 5 ? (level / 5) * 100 : level);
  }
  const s = String(level).trim().toLowerCase();
  const num = parseFloat(s);
  if (!Number.isNaN(num) && /^[\d.]+\s*%?$/.test(s)) {
    return clamp(s.includes("%") ? num : num <= 5 ? (num / 5) * 100 : num);
  }
  const map: Record<string, number> = {
    beginner: 35, basic: 35, novice: 30, elementary: 40, learning: 30,
    intermediate: 60, competent: 62, proficient: 75, skilled: 72,
    advanced: 85, expert: 95, master: 100, fluent: 95, native: 100,
  };
  for (const k in map) if (s.includes(k)) return map[k];
  return null;
}

/* ---- social brand icons (auto-detected from platform / url) ---- */
const SOCIAL_ICONS: Record<string, string> = {
  github:
    "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12",
  gitlab:
    "M23.955 13.587l-1.342-4.135-2.664-8.189c-.135-.423-.73-.423-.867 0L16.418 9.45H7.582L4.919 1.263C4.783.84 4.185.84 4.05 1.263L1.386 9.452.044 13.587c-.121.375.014.789.331 1.023L12 23.054l11.625-8.443c.318-.235.453-.647.33-1.024",
  linkedin:
    "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z",
  youtube:
    "M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
  instagram:
    "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.332.014 7.052.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z",
  facebook:
    "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
  dribbble:
    "M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zm9.885 11.441c-2.575-.422-4.943-.445-7.103-.073-.244-.563-.497-1.125-.767-1.68 2.31-1 4.165-2.358 5.548-4.082 1.35 1.594 2.197 3.619 2.322 5.835zm-3.842-7.282c-1.205 1.554-2.868 2.783-4.986 3.68-1.016-1.861-2.178-3.676-3.488-5.438.779-.197 1.591-.314 2.431-.314 2.275 0 4.368.809 6.043 2.072zM7.527 3.166c1.299 1.744 2.45 3.542 3.457 5.39-2.514.75-5.418.983-8.712.733.523-2.708 2.297-4.972 4.671-6.127.194.001.392.002.584.004zM2.096 12.42c3.639.284 6.847.021 9.616-.784.276.523.532 1.056.767 1.6-2.866.867-5.293 2.559-7.24 5.113C3.633 16.62 2.437 14.681 2.096 12.42zm4.674 6.89c1.774-2.33 3.964-3.832 6.564-4.566.828 2.145 1.451 4.421 1.865 6.827-2.86 1.219-6.058.73-8.429-2.261zm10.324.822c-.384-2.219-.959-4.339-1.72-6.352 1.842-.29 3.887-.211 6.135.234-.618 2.586-2.339 4.741-4.415 6.118z",
  behance:
    "M22 7h-7V5h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-1.729-5.564-5.675 0-3.91 2.325-5.92 5.466-5.92 3.082 0 4.964 1.782 5.375 4.426.078.506.109 1.188.095 2.14H15.97c.13 3.211 3.483 3.312 4.588 2.029h3.168zm-7.686-4h4.965c-.105-1.547-1.136-2.219-2.477-2.219-1.466 0-2.277.768-2.488 2.219zm-9.574 6.988H0V5.021h6.953c5.476.081 5.58 5.444 2.72 6.906 3.461 1.26 3.577 8.061-3.207 8.061zM3 11h3.584c2.508 0 2.906-3-.312-3H3v3zm3.391 3H3v3.016h3.341c3.055 0 2.868-3.016.05-3.016z",
  medium:
    "M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zm7.42 0c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z",
  twitch:
    "M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z",
  tiktok:
    "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z",
  discord:
    "M20.317 4.369a19.79 19.79 0 00-4.885-1.515.074.074 0 00-.079.037c-.211.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.369a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.893.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.331c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.955 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z",
  telegram:
    "M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z",
  whatsapp:
    "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347M12.05 21.785h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z",
  reddit:
    "M24 11.779c0-1.459-1.192-2.645-2.657-2.645-.715 0-1.363.286-1.84.746-1.81-1.191-4.259-1.949-6.971-2.046l1.483-4.669 4.016.941-.006.058c0 1.193.975 2.163 2.174 2.163 1.198 0 2.172-.97 2.172-2.163s-.975-2.164-2.172-2.164c-.92 0-1.704.574-2.021 1.379l-4.329-1.015a.379.379 0 00-.44.288l-1.783 5.618c-2.767.036-5.256.786-7.99 2.033-.469-.4-1.129-.628-1.784-.628C1.193 9.134 0 10.32 0 11.779c0 .996.564 1.905 1.475 2.373-.025.147-.037.297-.037.446 0 2.9 3.508 5.261 7.821 5.261 4.312 0 7.82-2.361 7.82-5.261 0-.149-.012-.298-.036-.445.91-.468 1.474-1.378 1.474-2.374zM6.11 13.42a1.49 1.49 0 011.49-1.489c.821 0 1.49.668 1.49 1.489 0 .82-.669 1.49-1.49 1.49-.821 0-1.49-.67-1.49-1.49zm8.978 3.788c-.673.673-2.147 1.02-3.5 1.02-1.353 0-2.827-.347-3.5-1.02a.375.375 0 010-.53c.146-.146.383-.146.53 0 .424.425 1.529.69 2.97.69 1.44 0 2.545-.265 2.97-.69.146-.146.384-.146.53 0 .146.147.146.384 0 .53zm-.376-2.298c-.821 0-1.49-.67-1.49-1.49 0-.821.669-1.489 1.49-1.489.821 0 1.49.668 1.49 1.489 0 .82-.669 1.49-1.49 1.49z",
  pinterest:
    "M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.749-7.252 7.926-7.252 4.163 0 7.398 2.967 7.398 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C24.007 5.367 18.635.001 12.017.001z",
  spotify:
    "M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z",
  twitter:
    "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  mail:
    "M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0l-8 5-8-5h16zm0 12H4V8l8 5 8-5v10z",
  globe:
    "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z",
};

function detectSocial(platform: string | null, url: string | null, label: string | null): string {
  let host = "";
  try {
    host = new URL(ext(url || "")).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    host = "";
  }
  const H = `${platform || ""} ${label || ""} ${url || ""} ${host}`.toLowerCase();
  if ((url || "").startsWith("mailto:") || /\bemail\b|\be-mail\b|\bmail\b|gmail|proton\.me|outlook\.com/.test(H)) return "mail";
  if (/github/.test(H)) return "github";
  if (/gitlab/.test(H)) return "gitlab";
  if (/linkedin|lnkd\.in/.test(H)) return "linkedin";
  if (/youtube|youtu\.be/.test(H)) return "youtube";
  if (/instagram|instagr\.am/.test(H)) return "instagram";
  if (/facebook|fb\.com|fb\.me/.test(H)) return "facebook";
  if (/dribbble/.test(H)) return "dribbble";
  if (/behance/.test(H)) return "behance";
  if (/medium\.com|\bmedium\b/.test(H)) return "medium";
  if (/twitch/.test(H)) return "twitch";
  if (/tiktok/.test(H)) return "tiktok";
  if (/discord/.test(H)) return "discord";
  if (/telegram|t\.me/.test(H)) return "telegram";
  if (/whatsapp|wa\.me/.test(H)) return "whatsapp";
  if (/reddit/.test(H)) return "reddit";
  if (/pinterest/.test(H)) return "pinterest";
  if (/spotify/.test(H)) return "spotify";
  if (/twitter|x\.com|\btweet\b|(^|\s)x(\s|$)/.test(H)) return "twitter";
  return "globe";
}

function SocialIcon({ name }: { name: string }) {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden focusable="false">
      <path d={SOCIAL_ICONS[name] || SOCIAL_ICONS.globe} />
    </svg>
  );
}

/* ---- code-panel token builder (syntax highlight from data, XSS-safe) ---- */
type Tok = { x: string; c?: string };
const _cm = (x: string): Tok => ({ x, c: "cm" });
const _kw = (x: string): Tok => ({ x, c: "kw" });
const _ky = (x: string): Tok => ({ x, c: "ky" });
const _st = (x: string): Tok => ({ x, c: "st" });
const _fn = (x: string): Tok => ({ x, c: "fn" });
const _vr = (x: string): Tok => ({ x, c: "vr" });
const _pn = (x: string): Tok => ({ x, c: "pn" });
const _sp = (x: string): Tok => ({ x });
const _q = (s: string): Tok =>
  _st('"' + String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\s+/g, " ").trim().slice(0, 54) + '"');

function varName(name: string): string {
  const v = (name || "dev").toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 16);
  return v || "dev";
}

function buildAboutCode(p: PublicPortfolio["profile"], name: string): Tok[][] {
  const v = varName(p?.display_name || name);
  const L: Tok[][] = [];
  L.push([_cm("// developer profile")]);
  L.push([_kw("const"), _sp(" "), _vr(v), _sp(" "), _pn("= {")]);
  const row = (key: string, val: Tok) => L.push([_sp("  "), _ky(key), _pn(": "), val, _pn(",")]);
  row("name", _q(p?.display_name || name));
  if (p?.title) row("role", _q(p.title));
  if (p?.location) row("location", _q(p.location));
  if (p?.tagline) row("focus", _q(p.tagline));
  if (p?.availability) row("status", _q(p.availability));
  if (p?.email) row("email", _q(p.email));
  L.push([_pn("};")]);
  L.push([]);
  L.push([_vr("console"), _pn("."), _fn("log"), _pn("("), _q(p?.tagline || "Let's build something great."), _pn(");")]);
  return L;
}

function buildSkillsCode(skills: PublicPortfolio["skills"]): Tok[][] {
  const L: Tok[][] = [];
  L.push([_cm("// tech stack")]);
  L.push([_kw("const"), _sp(" "), _vr("stack"), _sp(" "), _pn("= [")]);
  skills.slice(0, 16).forEach((s) => L.push([_sp("  "), _q(s.name), _pn(",")]));
  L.push([_pn("];")]);
  L.push([]);
  L.push([_vr("stack"), _pn("."), _fn("forEach"), _pn("("), _ky("skill"), _sp(" "), _pn("=> "), _fn("master"), _pn("("), _ky("skill"), _pn("));")]);
  return L;
}

function CodeLines({ lines }: { lines: Tok[][] }) {
  return (
    <div className="term-code-body">
      {lines.map((line, i) => (
        <div className="term-code-line" key={i}>
          <span className="term-ln" aria-hidden>{i + 1}</span>
          <code>
            {line.length === 0 ? "\u00a0" : line.map((tok, j) => <span key={j} className={tok.c ? `t-${tok.c}` : undefined}>{tok.x}</span>)}
          </code>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------ component ------------------------------ */

export function TerminalTemplate({ data }: { data: PublicPortfolio }) {
  const p = data.profile;
  const accent = data.accent || "#ff4d4d";

  const hidden = new Set(data.settings?.hidden ?? []);
  const sv = (k: string) => !hidden.has(k);
  const username = data.username;

  const name = p?.display_name || username || "Your Name";
  const mono = initials(p?.display_name, username);

  /* ---- UI state ---- */
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [codeTab, setCodeTab] = useState<"about" | "skills">("about");
  const [lb, setLb] = useState<{ src: string; alt: string; cap?: string } | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);

  const openLb = useCallback((src: string, alt: string, cap?: string) => setLb({ src, alt, cap }), []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    root.classList.add("term-anim-ready");
    const reduce = typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const targets = root.querySelectorAll("[data-reveal],[data-bar]");
    if (reduce || typeof IntersectionObserver === "undefined") {
      targets.forEach((el) => el.classList.add("term-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("term-in"); io.unobserve(e.target); }
      }),
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!lb) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setLb(null); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [lb]);

  /* ---- visibility ---- */
  const has = {
    about: sv("about") && !!(p?.about || p?.bio || p?.tagline || p?.title || p?.location),
    services: sv("services") && data.services.length > 0,
    skills: sv("skills") && data.skills.length > 0,
    projects: sv("projects") && data.projects.length > 0,
    experience: sv("experience") && data.experience.length > 0,
    testimonials: sv("testimonials") && data.testimonials.length > 0,
    contact: !!username,
  };

  const contactHref = username ? "#contact" : p?.email ? `mailto:${p.email}` : undefined;

  const navSpec: { href: string; label: string; on: boolean }[] = [
    { href: "#top", label: "Home", on: true },
    { href: "#about", label: "About", on: has.about },
    { href: "#skills", label: "Skills", on: has.skills },
    { href: "#work", label: "Projects", on: has.projects },
    { href: "#experience", label: "Experience", on: has.experience },
    { href: "#testimonials", label: "Testimonials", on: has.testimonials },
    { href: "#contact", label: "Contact", on: has.contact },
  ];
  const navItems = navSpec.filter((n) => n.on);

  /* ---- reusable ---- */
  const label = (t: string) => <span className="term-label">// {t}</span>;

  const themeBtn = (extra?: string) => (
    <button
      type="button"
      className={`term-icbtn ${extra || ""}`}
      onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      aria-pressed={theme === "light"}
      title="Toggle theme"
    >
      <span aria-hidden>{theme === "dark" ? "☀" : "☾"}</span>
    </button>
  );

  const ZImg = ({ src, alt, cap, className }: { src: string; alt: string; cap?: string; className?: string }) => (
    <button type="button" className={`term-zoom ${className || ""}`} onClick={() => openLb(src, alt, cap)} aria-label={alt ? `View image: ${alt}` : "View image"}>
      <img src={src} alt={alt} loading="lazy" />
      <span className="term-zoom-ic" aria-hidden>[ ⤢ ]</span>
    </button>
  );

  const socialRow = (extra?: string) =>
    data.links.length > 0 ? (
      <div className={`term-socials ${extra || ""}`}>
        {data.links.map((l) => (
          <a key={l.id} className="term-soc" href={ext(l.url)} target="_blank" rel="noopener noreferrer" aria-label={l.label || l.platform} title={l.label || l.platform}>
            <SocialIcon name={detectSocial(l.platform, l.url, l.label)} />
          </a>
        ))}
      </div>
    ) : null;

  /* ---- section renderers ---- */
  const sections: Record<string, () => ReactNode> = {
    about: () => {
      if (!has.about) return null;
      const aboutText = p?.about ?? p?.bio ?? null;
      const aboutCode = buildAboutCode(p, name);
      const skillsCode = has.skills ? buildSkillsCode(data.skills) : null;
      const tab = codeTab === "skills" && skillsCode ? "skills" : "about";
      return (
        <section id="about" data-sec="about" data-reveal className="term-section">
          {label("about me")}
          <h2 className="term-h2">{p?.tagline || "More than just code"}</h2>
          <div className="term-about">
            <div className="term-about-txt">
              {aboutText && aboutText.split(/\n{2,}/).map((para, i) => <p key={i}>{para}</p>)}
              <div className="term-btnrow">
                {p?.resume_url && (
                  <a className="term-btn" href={ext(p.resume_url)} target="_blank" rel="noopener noreferrer">
                    Download CV <span aria-hidden>↓</span>
                  </a>
                )}
                {has.projects && <a className="term-btn" href="#work">{"> "}My Work</a>}
              </div>
            </div>

            {/* signature code editor panel — generated from data */}
            <div className="term-code term-panel">
              <div className="term-code-bar">
                <span className="term-dots" aria-hidden><i /><i /><i /></span>
                <span className="term-tabs" role="tablist" aria-label="Code files">
                  <button type="button" role="tab" aria-selected={tab === "about"} className={`term-tab ${tab === "about" ? "is-on" : ""}`} onClick={() => setCodeTab("about")}>about.js</button>
                  {skillsCode && (
                    <button type="button" role="tab" aria-selected={tab === "skills"} className={`term-tab ${tab === "skills" ? "is-on" : ""}`} onClick={() => setCodeTab("skills")}>skills.js</button>
                  )}
                </span>
                <span className="term-code-lang" aria-hidden>JS</span>
              </div>
              <CodeLines lines={tab === "skills" && skillsCode ? skillsCode : aboutCode} />
            </div>
          </div>
        </section>
      );
    },

    services: () => {
      if (!has.services) return null;
      return (
        <section id="services" data-sec="services" data-reveal className="term-section">
          {label("what I do")}
          <h2 className="term-h2">Services I offer</h2>
          <div className="term-grid-4">
            {data.services.map((s, i) => (
              <article key={s.id} className="term-panel term-card">
                <span className="term-card-ic" aria-hidden>{"</>"}</span>
                <h3 className="term-card-title">{s.title}</h3>
                {s.description && <p className="term-muted term-clamp-3">{s.description}</p>}
                <div className="term-card-foot">
                  <span className="term-idx">// {String(i + 1).padStart(2, "0")}</span>
                  {s.price ? <span className="term-price">{s.price}</span> : <span className="term-arrow" aria-hidden>↗</span>}
                </div>
              </article>
            ))}
          </div>
        </section>
      );
    },

    skills: () => {
      if (!has.skills) return null;
      const sorted = [...data.skills].sort((a, b) => (a.category || "").localeCompare(b.category || ""));
      return (
        <section id="skills" data-sec="skills" data-reveal className="term-section">
          {label("skills")}
          <h2 className="term-h2">Technologies I use</h2>
          <div className="term-grid-skills">
            {sorted.map((s) => {
              const pct = levelPct(s.level);
              return (
                <div key={s.id} className="term-panel term-skill" data-bar style={{ ["--pct" as string]: `${pct ?? 0}%` } as CSSProperties}>
                  <span className="term-skill-ic" aria-hidden>{initials(s.name, "•")}</span>
                  <span className="term-skill-name">{s.name}</span>
                  {s.category && <span className="term-skill-cat">{s.category}</span>}
                  {pct != null && (
                    <div className="term-bar" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label={`${s.name} level`}>
                      <span className="term-bar-fill" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      );
    },

    projects: () => {
      if (!has.projects) return null;
      const ordered = [...data.projects].sort((a, b) => Number(!!b.is_featured) - Number(!!a.is_featured));
      return (
        <section id="work" data-sec="projects" data-reveal className="term-section">
          <div className="term-sechead">
            <div>
              {label("featured projects")}
              <h2 className="term-h2">Selected work</h2>
            </div>
            <span className="term-tagpill">{data.projects.length} repos</span>
          </div>
          <div className="term-grid-3">
            {ordered.map((pr) => {
              const category = pr.role || (pr.tags && pr.tags[0]) || null;
              return (
                <article key={pr.id} className="term-panel term-proj">
                  <div className="term-proj-media">
                    {pr.image_url ? (
                      <ZImg src={pr.image_url} alt={pr.title || "Project image"} cap={pr.title || undefined} />
                    ) : (
                      <div className="term-proj-ph" aria-hidden>{"{ }"}</div>
                    )}
                    {pr.is_featured && <span className="term-badge">★ featured</span>}
                  </div>
                  <div className="term-proj-body">
                    <h3 className="term-card-title">
                      {pr.url ? (
                        <a className="term-linktext" href={ext(pr.url)} target="_blank" rel="noopener noreferrer">{pr.title || "untitled"} <span aria-hidden>↗</span></a>
                      ) : (pr.title || "untitled")}
                    </h3>
                    {category && <p className="term-muted term-proj-cat">{category}</p>}
                    {pr.description && <p className="term-muted term-clamp-2">{pr.description}</p>}
                    {pr.tags && pr.tags.length > 0 && (
                      <div className="term-tags">
                        {pr.tags.slice(0, 4).map((t) => <span key={t} className="term-tag">{t}</span>)}
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      );
    },

    experience: () => {
      if (!has.experience) return null;
      return (
        <section id="experience" data-sec="experience" data-reveal className="term-section">
          {label("experience")}
          <h2 className="term-h2">My journey</h2>
          <div className="term-timeline">
            {data.experience.map((e) => (
              <article key={e.id} className="term-tl-item">
                <span className="term-tl-dot" aria-hidden />
                <span className="term-tl-date">{dateRange(e.start_date, e.end_date, e.is_current)}</span>
                <div className="term-panel term-tl-body">
                  <h3 className="term-tl-role">{e.title || e.company || "Role"}</h3>
                  <p className="term-muted term-tl-meta">{[e.company, e.location].filter(Boolean).join(" · ")}</p>
                  {e.description && <p className="term-muted">{e.description}</p>}
                </div>
              </article>
            ))}
          </div>
        </section>
      );
    },

    education: () => {
      if (!(sv("education") && data.education.length > 0)) return null;
      return (
        <section id="education" data-sec="education" data-reveal className="term-section">
          {label("education")}
          <h2 className="term-h2">Education</h2>
          <div className="term-grid-2">
            {data.education.map((ed) => (
              <article key={ed.id} className="term-panel term-card">
                <div className="term-card-foot term-card-foot-top">
                  <h3 className="term-card-title">{ed.school || "School"}</h3>
                  <span className="term-idx">{dateRange(ed.start_date, ed.end_date)}</span>
                </div>
                {(ed.degree || ed.field) && <p className="term-muted">{[ed.degree, ed.field].filter(Boolean).join(", ")}</p>}
                {ed.description && <p className="term-muted">{ed.description}</p>}
              </article>
            ))}
          </div>
        </section>
      );
    },

    certifications: () => {
      if (!(sv("certifications") && data.certifications.length > 0)) return null;
      return (
        <section id="certifications" data-sec="certifications" data-reveal className="term-section">
          {label("credentials")}
          <h2 className="term-h2">Certifications</h2>
          <div className="term-grid-3">
            {data.certifications.map((c) => {
              const body = (
                <>
                  <span className="term-card-ic" aria-hidden>✓</span>
                  <h3 className="term-card-title">{c.name}</h3>
                  {c.issuer && <p className="term-muted">{c.issuer}</p>}
                  <div className="term-card-foot">
                    {oneDate(c.issue_date) && <span className="term-idx">{oneDate(c.issue_date)}</span>}
                    {c.credential_id && <span className="term-muted term-small">#{c.credential_id}</span>}
                  </div>
                </>
              );
              return c.url ? (
                <a key={c.id} className="term-panel term-card term-card-link" href={ext(c.url)} target="_blank" rel="noopener noreferrer">{body}</a>
              ) : (
                <article key={c.id} className="term-panel term-card">{body}</article>
              );
            })}
          </div>
        </section>
      );
    },

    achievements: () => {
      if (!(sv("achievements") && data.achievements.length > 0)) return null;
      return (
        <section id="achievements" data-sec="achievements" data-reveal className="term-section">
          {label("highlights")}
          <h2 className="term-h2">Achievements</h2>
          <div className="term-grid-3">
            {data.achievements.map((a) => (
              <article key={a.id} className="term-panel term-card">
                <span className="term-card-ic" aria-hidden>★</span>
                <h3 className="term-card-title">{a.title}</h3>
                {oneDate(a.date) && <span className="term-idx">{oneDate(a.date)}</span>}
                {a.description && <p className="term-muted term-clamp-3">{a.description}</p>}
              </article>
            ))}
          </div>
        </section>
      );
    },

    publications: () => {
      if (!(sv("publications") && data.publications.length > 0)) return null;
      return (
        <section id="publications" data-sec="publications" data-reveal className="term-section">
          {label("writing")}
          <h2 className="term-h2">Publications</h2>
          <div className="term-list">
            {data.publications.map((pub) => {
              const meta = [pub.publisher, oneDate(pub.date)].filter(Boolean).join(" · ");
              const body = (
                <>
                  <div className="term-card-foot term-card-foot-top">
                    <h3 className="term-card-title">{pub.title}</h3>
                    {pub.url && <span className="term-arrow" aria-hidden>↗</span>}
                  </div>
                  {meta && <p className="term-muted term-small">{meta}</p>}
                  {pub.description && <p className="term-muted">{pub.description}</p>}
                </>
              );
              return pub.url ? (
                <a key={pub.id} className="term-panel term-listitem term-card-link" href={ext(pub.url)} target="_blank" rel="noopener noreferrer">{body}</a>
              ) : (
                <article key={pub.id} className="term-panel term-listitem">{body}</article>
              );
            })}
          </div>
        </section>
      );
    },

    gallery: () => {
      if (!(sv("gallery") && data.gallery.length > 0)) return null;
      return (
        <section id="gallery" data-sec="gallery" data-reveal className="term-section">
          {label("visuals")}
          <h2 className="term-h2">Gallery</h2>
          <div className="term-gallery">
            {data.gallery.map((g) =>
              g.image_url ? (
                <figure key={g.id} className="term-panel term-gitem">
                  <ZImg src={g.image_url} alt={g.caption || "Gallery image"} cap={g.caption || undefined} className="term-zoom-gallery" />
                  {g.caption && <figcaption className="term-muted term-small">{g.caption}</figcaption>}
                </figure>
              ) : null
            )}
          </div>
        </section>
      );
    },

    videos: () => {
      if (!(sv("videos") && data.videos.length > 0)) return null;
      return (
        <section id="videos" data-sec="videos" data-reveal className="term-section">
          {label("watch")}
          <h2 className="term-h2">Videos</h2>
          <div className="term-grid-2">
            {data.videos.map((v) => {
              const src = v.url ? videoEmbed(v.url) : null;
              if (!src) return null;
              return (
                <figure key={v.id} className="term-panel term-video">
                  <div className="term-video-frame">
                    <iframe src={src} title={v.title || "Video"} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                  </div>
                  {v.title && <figcaption className="term-muted term-small">{v.title}</figcaption>}
                </figure>
              );
            })}
          </div>
        </section>
      );
    },

    testimonials: () => {
      if (!has.testimonials) return null;
      return (
        <section id="testimonials" data-sec="testimonials" data-reveal className="term-section">
          {label("testimonials")}
          <h2 className="term-h2">What clients say</h2>
          <div className="term-tgrid">
            {data.testimonials.map((t) => (
              <figure key={t.id} className="term-panel term-quote">
                <span className="term-quote-mark" aria-hidden>{'"'}</span>
                {t.quote && <blockquote>{t.quote}</blockquote>}
                <figcaption className="term-quote-by">
                  <span className="term-avatar" aria-hidden>
                    {t.avatar_url ? <img src={t.avatar_url} alt="" loading="lazy" /> : initials(t.author, "•")}
                  </span>
                  <span>
                    {t.author && <b>{t.author}</b>}
                    {t.role && <em className="term-muted">{t.role}</em>}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      );
    },
  };

  const order = resolveOrder(data.settings);
  const buildList = has.services ? data.services.slice(0, 4) : [];
  const stat = [
    { n: data.projects.length, label: "Projects" },
    { n: data.skills.length, label: "Skills" },
    { n: data.experience.length, label: "Roles" },
  ].filter((s) => s.n > 0).slice(0, 2);
  const heroSkills = data.skills.slice(0, 8);
  const year = new Date().getFullYear();
  const prompt = `${(username || "guest").toLowerCase()}@folio:~$`;

  return (
    <div ref={rootRef} className="term-root" id="top" data-theme={theme} style={{ ["--tpl-accent" as string]: accent } as CSSProperties}>
      <style dangerouslySetInnerHTML={{ __html: TERM_CSS }} />
      <div className="term-grid-bg" aria-hidden />
      <div className="term-scan" aria-hidden />

      {/* ---------------- TOP BAR ---------------- */}
      <header className="term-topbar">
        <div className="term-shell term-topbar-in">
          <a className="term-brand" href="#top">
            <span className="term-brand-tag" aria-hidden>{"</>"}</span>
            <span className="term-brand-txt">
              <b>{name}</b>
              {p?.title && <em>{p.title}</em>}
            </span>
          </a>

          <div className="term-prompt" aria-hidden>
            <span className="term-prompt-dot" />
            <span className="term-prompt-txt">{prompt}</span>
            <span className="term-cursor">_</span>
            <span className="term-eq"><i /><i /><i /><i /></span>
          </div>

          <div className="term-topbar-right">
            {themeBtn()}
            {contactHref && <a className="term-btn term-btn-accent term-topcta" href={contactHref}>{"[ Let's Talk ]"}</a>}
            {navItems.length > 1 && (
              <details className="term-menu">
                <summary aria-label="Menu"><span /><span /><span /></summary>
                <ul>{navItems.map((it) => <li key={it.href}><a href={it.href}>{it.label}</a></li>)}</ul>
              </details>
            )}
          </div>
        </div>
      </header>

      <div className="term-shell term-body">
        {/* ---------------- SIDEBAR ---------------- */}
        <aside className="term-side" aria-label="Section navigation">
          <nav className="term-sidenav">
            {navItems.map((it, i) => (
              <a key={it.href} href={it.href}>
                <span className="term-side-n">{String(i + 1).padStart(2, "0")}</span>
                <span className="term-side-l">_ {it.label}</span>
              </a>
            ))}
          </nav>
          {(p?.location || p?.availability) && (
            <div className="term-side-meta">
              {p?.location && <span>◈ {p.location}</span>}
              {p?.availability && <span className="term-avail">● {p.availability}</span>}
            </div>
          )}
        </aside>

        {/* ---------------- MAIN ---------------- */}
        <main className="term-main">
          {/* HERO */}
          <header className="term-hero">
            <div className="term-hero-left">
              <span className="term-eyebrow">Hi, I&apos;m</span>
              <h1 className="term-hero-name">{name}<span className="term-cursor term-cursor-lg">|</span></h1>
              {p?.title && <p className="term-hero-title">{"<"}{p.title}{"/>"}</p>}
              {(p?.tagline || p?.bio) && <p className="term-hero-intro">{p?.tagline || p?.bio}</p>}

              <div className="term-btnrow">
                {has.projects && <a className="term-btn term-btn-accent" href="#work">{"> "}View My Work</a>}
                {p?.resume_url && <a className="term-btn" href={ext(p.resume_url)} target="_blank" rel="noopener noreferrer">Download CV <span aria-hidden>↓</span></a>}
                {!has.projects && !p?.resume_url && contactHref && <a className="term-btn term-btn-accent" href={contactHref}>{"> "}Get in touch</a>}
              </div>

              {heroSkills.length > 0 && (
                <div className="term-tech">
                  <span className="term-tech-label">// Tech I work with:</span>
                  <div className="term-tech-row">
                    {heroSkills.map((s) => (
                      <span key={s.id} className="term-tech-item">
                        <span className="term-tech-ic" aria-hidden>{initials(s.name, "•")}</span>
                        <span>{s.name}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {socialRow("term-hero-soc")}
            </div>

            <div className="term-hero-right">
              {(buildList.length > 0 || p?.tagline) && (
                <div className="term-panel term-build">
                  <p className="term-build-h">// {p?.tagline ? "focus" : "what I build"}</p>
                  {buildList.length > 0 ? (
                    <ul>{buildList.map((s) => <li key={s.id}>{"> "}{s.title}</li>)}</ul>
                  ) : (
                    <p className="term-muted">{p?.tagline}</p>
                  )}
                </div>
              )}

              <figure className="term-portrait term-panel">
                {p?.avatar_url ? (
                  <ZImg src={p.avatar_url} alt={name} className="term-zoom-fill" />
                ) : (
                  <div className="term-portrait-ph" aria-hidden>
                    <span className="term-portrait-mono">{mono}</span>
                    <span className="term-portrait-sub">{"</>"}</span>
                  </div>
                )}
                <span className="term-portrait-tick" aria-hidden />
              </figure>

              {stat.length > 0 && (
                <div className="term-statrow">
                  {stat.map((s) => (
                    <div key={s.label} className="term-panel term-stat">
                      <b>{s.n}+</b>
                      <span>{s.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </header>

          {/* DATA SECTIONS */}
          {order.map((k) => <Fragment key={k}>{sections[k] ? sections[k]() : null}</Fragment>)}

          {/* CONTACT */}
          {username && (
            <section id="contact" data-reveal className="term-section">
              {label("let's connect")}
              <h2 className="term-h2">Have a project in mind?</h2>
              <div className="term-contact">
                <div className="term-contact-left">
                  <p className="term-muted">Let&apos;s build something great together. Drop a message and I&apos;ll reply soon.</p>
                  <div className="term-contact-rows">
                    {p?.email && <a className="term-crow" href={`mailto:${p.email}`}><span aria-hidden>✉</span><span>{p.email}</span></a>}
                    {p?.phone && <a className="term-crow" href={`tel:${p.phone}`}><span aria-hidden>☎</span><span>{p.phone}</span></a>}
                    {p?.website && <a className="term-crow" href={ext(p.website)} target="_blank" rel="noopener noreferrer"><span aria-hidden>◈</span><span>{p.website.replace(/^https?:\/\//, "")}</span></a>}
                    {p?.location && <div className="term-crow"><span aria-hidden>⌖</span><span>{p.location}</span></div>}
                  </div>
                  {socialRow()}
                </div>
                <div className="term-panel term-formcard">
                  <div className="term-code-bar">
                    <span className="term-dots" aria-hidden><i /><i /><i /></span>
                    <span className="term-code-lang" aria-hidden>message.txt</span>
                  </div>
                  <div className="term-formwrap">
                    <ContactForm username={username} />
                  </div>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>

      {/* ---------------- FOOTER ---------------- */}
      <footer className="term-footer">
        <div className="term-shell term-footer-in">
          <a className="term-brand" href="#top">
            <span className="term-brand-tag" aria-hidden>{"</>"}</span>
            <span className="term-brand-txt"><b>{name}</b>{p?.title && <em>{p.title}</em>}</span>
          </a>
          {navItems.length > 1 && (
            <nav className="term-footer-nav" aria-label="Footer">
              {navItems.filter((n) => n.href !== "#top").map((it) => <a key={it.href} href={it.href}>{it.label}</a>)}
            </nav>
          )}
          <div className="term-footer-right">
            <span>© {year} {name}</span>
            {themeBtn("term-icbtn-sm")}
            {!data.hide_branding && <a className="term-madewith" href="https://folio.assetprim.com" target="_blank" rel="noopener noreferrer">{"// made with "}<b>Folio</b></a>}
          </div>
        </div>
      </footer>

      {/* ---------------- LIGHTBOX ---------------- */}
      {lb && (
        <div className="term-lb" role="dialog" aria-modal="true" aria-label="Image viewer" onClick={() => setLb(null)}>
          <button ref={closeRef} type="button" className="term-lb-close" onClick={() => setLb(null)} aria-label="Close image viewer">[ ✕ ]</button>
          <figure className="term-lb-fig" onClick={(e) => e.stopPropagation()}>
            <img src={lb.src} alt={lb.alt} />
            {lb.cap && <figcaption>{lb.cap}</figcaption>}
          </figure>
        </div>
      )}
    </div>
  );
}

export default TerminalTemplate;

/* =====================================================================
   STYLES — self-contained, prefixed `.term-`, scoped under `.term-root`.
   Dark is default; light overrides live under [data-theme="light"].
   ===================================================================== */

const TERM_CSS = `
.term-root{
  --bg:#0a0a0e; --bg2:#0e0e14; --panel:#0c0c11; --panel2:#101018;
  --ink:#e9e9f0; --ink2:#8b8c99; --line:rgba(255,255,255,.10); --line2:rgba(255,255,255,.18);
  --accent:var(--tpl-accent,#ff4d4d);
  --accent-soft: color-mix(in srgb, var(--accent) 16%, transparent);
  --ok:#3ddc84;
  /* syntax */
  --t-cm:#6a7078; --t-kw:#ff7b72; --t-str:#7ee787; --t-ky:#79c0ff; --t-fn:#d2a8ff; --t-vr:#ffa657; --t-pn:#c9d1d9;
  --mono: ui-monospace, "SF Mono", "JetBrains Mono", "Fira Code", "Roboto Mono", Menlo, Consolas, "Liberation Mono", monospace;
  --r:6px;
  position:relative; isolation:isolate; background:var(--bg); color:var(--ink);
  font-family:var(--mono); font-size:15px; line-height:1.6; -webkit-font-smoothing:antialiased;
  overflow-x:clip; min-height:100%; scroll-behavior:smooth;
  transition:background-color .35s ease, color .3s ease;
}
.term-root[data-theme="light"]{
  --bg:#f5f5f2; --bg2:#ecece9; --panel:#ffffff; --panel2:#f7f7f4;
  --ink:#16171c; --ink2:#5c606b; --line:rgba(0,0,0,.13); --line2:rgba(0,0,0,.22);
  --t-cm:#8a919e; --t-kw:#cf222e; --t-str:#0a7d33; --t-ky:#0550ae; --t-fn:#8250df; --t-vr:#953800; --t-pn:#24292f;
}
.term-root *{ box-sizing:border-box; }
.term-root img{ max-width:100%; display:block; }
.term-root a{ color:inherit; }
.term-root h1,.term-root h2,.term-root h3,.term-root p,.term-root blockquote{ overflow-wrap:anywhere; }

/* backgrounds */
.term-grid-bg{ position:absolute; inset:0; z-index:-2; pointer-events:none; opacity:.5;
  background-image:linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px);
  background-size:44px 44px; mask-image:radial-gradient(circle at 70% 0%, #000 0%, transparent 70%); }
.term-scan{ position:fixed; inset:0; z-index:1; pointer-events:none; opacity:.35; mix-blend-mode:overlay;
  background:repeating-linear-gradient(to bottom, transparent 0 2px, rgba(0,0,0,.15) 2px 3px); }
.term-root[data-theme="light"] .term-scan{ display:none; }

.term-shell{ width:100%; max-width:1240px; margin-inline:auto; padding-inline:clamp(14px,3vw,28px); }

/* type helpers */
.term-label{ display:inline-block; color:var(--accent); font-size:.72rem; letter-spacing:.14em; text-transform:uppercase; }
.term-h2{ font-size:clamp(1.5rem,3vw,2.1rem); font-weight:700; letter-spacing:-.01em; margin:6px 0 22px; }
.term-muted{ color:var(--ink2); margin:6px 0 0; }
.term-small{ font-size:.82rem; }
.term-clamp-2,.term-clamp-3{ display:-webkit-box; -webkit-box-orient:vertical; overflow:hidden; }
.term-clamp-2{ -webkit-line-clamp:2; } .term-clamp-3{ -webkit-line-clamp:3; }

/* panels */
.term-panel{ position:relative; background:var(--panel); border:1px solid var(--line); border-radius:var(--r);
  transition:border-color .25s ease, box-shadow .25s ease, background .35s ease, transform .2s ease; }
.term-panel::before, .term-panel::after{ content:"+"; position:absolute; color:var(--line2); font-size:.7rem; line-height:1; opacity:.8; }
.term-panel::before{ top:-4px; left:-4px; } .term-panel::after{ bottom:-5px; right:-3px; }

/* buttons */
.term-btn{ display:inline-flex; align-items:center; gap:8px; padding:10px 16px; border-radius:5px;
  border:1px solid var(--line2); background:transparent; color:var(--ink); font-family:var(--mono);
  font-weight:600; font-size:.9rem; text-decoration:none; cursor:pointer;
  transition:border-color .18s, color .18s, background .18s, transform .18s; }
.term-btn:hover{ transform:translateY(-2px); border-color:var(--accent); color:var(--accent); }
.term-btn:focus-visible{ outline:2px solid var(--accent); outline-offset:2px; }
.term-btn-accent{ border-color:var(--accent); color:var(--accent); }
.term-btn-accent:hover{ background:var(--accent-soft); }
.term-btnrow{ display:flex; flex-wrap:wrap; gap:12px; margin-top:20px; }

.term-icbtn, .term-icbtn-sm{ width:40px; height:40px; flex:0 0 auto; border-radius:5px; cursor:pointer;
  display:grid; place-items:center; background:transparent; border:1px solid var(--line2); color:var(--ink);
  transition:border-color .18s, color .18s, transform .18s; }
.term-icbtn:hover, .term-icbtn-sm:hover{ border-color:var(--accent); color:var(--accent); transform:translateY(-2px); }
.term-icbtn:focus-visible{ outline:2px solid var(--accent); outline-offset:2px; }
.term-icbtn-sm{ width:34px; height:34px; }

/* cursor / equalizer */
.term-cursor{ color:var(--accent); font-weight:700; animation:term-blink 1.1s steps(1) infinite; }
.term-cursor-lg{ margin-left:2px; }
@keyframes term-blink{ 0%,50%{opacity:1;} 51%,100%{opacity:0;} }
.term-eq{ display:inline-flex; align-items:flex-end; gap:2px; height:14px; margin-left:4px; }
.term-eq i{ width:2px; height:6px; background:var(--accent); opacity:.8; animation:term-eq 1s ease-in-out infinite; }
.term-eq i:nth-child(2){ animation-delay:.2s; } .term-eq i:nth-child(3){ animation-delay:.4s; } .term-eq i:nth-child(4){ animation-delay:.1s; }
@keyframes term-eq{ 0%,100%{ height:4px; } 50%{ height:13px; } }

/* reveal */
.term-root.term-anim-ready [data-reveal]{ opacity:0; transform:translateY(20px); transition:opacity .6s ease, transform .7s cubic-bezier(.2,.8,.2,1); }
.term-root.term-anim-ready [data-reveal].term-in{ opacity:1; transform:none; }

/* top bar */
.term-topbar{ position:sticky; top:0; z-index:40; border-bottom:1px solid var(--line);
  background:color-mix(in srgb, var(--bg) 82%, transparent); backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px); }
.term-topbar-in{ display:flex; align-items:center; gap:16px; height:60px; }
.term-brand{ display:flex; align-items:center; gap:10px; text-decoration:none; min-width:0; }
.term-brand-tag{ color:var(--accent); font-weight:700; letter-spacing:-1px; }
.term-brand-txt{ display:flex; flex-direction:column; line-height:1.1; min-width:0; }
.term-brand-txt b{ font-weight:700; font-size:.9rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:40vw; }
.term-brand-txt em{ font-style:normal; font-size:.7rem; color:var(--ink2); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:40vw; }
.term-prompt{ flex:1; display:flex; align-items:center; gap:8px; justify-content:center; max-width:520px; margin-inline:auto;
  padding:8px 14px; border:1px solid var(--line); border-radius:5px; background:var(--panel2); color:var(--ink2); font-size:.82rem; }
.term-prompt-dot{ width:8px; height:8px; border-radius:50%; background:var(--ok); box-shadow:0 0 8px var(--ok); flex:0 0 auto; }
.term-prompt-txt{ white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.term-topbar-right{ display:flex; align-items:center; gap:8px; }
.term-topcta{ padding:9px 14px; }

.term-menu{ display:none; position:relative; }
.term-menu summary{ list-style:none; width:40px; height:40px; border-radius:5px; cursor:pointer; display:grid; place-items:center; gap:4px; border:1px solid var(--line2); }
.term-menu summary::-webkit-details-marker{ display:none; }
.term-menu summary span{ display:block; width:18px; height:2px; background:var(--ink); }
.term-menu ul{ position:absolute; right:0; top:50px; min-width:190px; list-style:none; margin:0; padding:8px; z-index:50;
  border:1px solid var(--line); border-radius:6px; background:var(--panel); box-shadow:0 20px 50px -20px rgba(0,0,0,.7); }
.term-menu ul a{ display:block; padding:9px 12px; border-radius:4px; text-decoration:none; color:var(--ink); font-size:.9rem; }
.term-menu ul a:hover{ color:var(--accent); background:var(--accent-soft); }

/* body shell (sidebar + main) */
.term-body{ display:grid; grid-template-columns:190px 1fr; gap:clamp(18px,3vw,40px); align-items:start; padding-top:clamp(20px,4vw,40px); }
.term-side{ position:sticky; top:76px; align-self:start; }
.term-sidenav{ display:flex; flex-direction:column; gap:2px; }
.term-sidenav a{ display:flex; align-items:center; gap:10px; padding:9px 10px; border-left:2px solid transparent; text-decoration:none; color:var(--ink2); font-size:.85rem; transition:color .16s, border-color .16s, background .16s; }
.term-sidenav a:hover{ color:var(--ink); border-left-color:var(--accent); background:var(--accent-soft); }
.term-side-n{ color:var(--accent); font-size:.72rem; }
.term-side-meta{ margin-top:22px; padding-top:16px; border-top:1px solid var(--line); display:flex; flex-direction:column; gap:8px; font-size:.78rem; color:var(--ink2); }
.term-avail{ color:var(--ok); }

.term-main{ min-width:0; }

/* hero */
.term-hero{ display:grid; grid-template-columns:1.1fr .9fr; gap:clamp(24px,4vw,48px); align-items:start;
  padding-block:clamp(16px,3vw,40px) clamp(30px,5vw,60px); border-bottom:1px solid var(--line); }
.term-eyebrow{ color:var(--ink2); font-size:1rem; }
.term-hero-name{ font-size:clamp(2.6rem,7vw,4.4rem); font-weight:800; letter-spacing:-.03em; line-height:1.02; margin:4px 0 0; }
.term-hero-title{ font-size:clamp(1.2rem,3.4vw,1.9rem); color:var(--accent); font-weight:700; margin:8px 0 0; }
.term-hero-intro{ color:var(--ink2); margin:16px 0 0; max-width:46ch; }
.term-tech{ margin-top:26px; }
.term-tech-label{ color:var(--ink2); font-size:.78rem; }
.term-tech-row{ display:flex; flex-wrap:wrap; gap:8px; margin-top:10px; }
.term-tech-item{ display:inline-flex; align-items:center; gap:7px; padding:6px 10px 6px 6px; border:1px solid var(--line); border-radius:5px; font-size:.82rem; background:var(--panel); }
.term-tech-ic{ width:22px; height:22px; flex:0 0 auto; display:grid; place-items:center; font-size:.66rem; font-weight:700; color:var(--accent); border:1px solid var(--line2); border-radius:4px; }

.term-hero-right{ display:flex; flex-direction:column; gap:16px; }
.term-build{ padding:16px; }
.term-build-h{ color:var(--accent); font-size:.76rem; margin:0 0 10px; }
.term-build ul{ margin:0; padding:0; list-style:none; display:flex; flex-direction:column; gap:6px; font-size:.86rem; }
.term-build li{ color:var(--ink); }
.term-portrait{ position:relative; aspect-ratio:1/1; overflow:hidden; padding:0;
  background:radial-gradient(circle at 50% 30%, var(--panel2), var(--panel)); }
.term-portrait .term-zoom, .term-portrait .term-zoom img{ width:100%; height:100%; }
.term-portrait .term-zoom img{ object-fit:cover; filter:grayscale(1) contrast(1.15) brightness(.95); transition:filter .4s ease, transform .5s ease; }
.term-portrait .term-zoom::after{ content:""; position:absolute; inset:0; pointer-events:none;
  background:repeating-linear-gradient(to bottom, transparent 0 3px, color-mix(in srgb, var(--accent) 8%, transparent) 3px 4px); }
.term-portrait .term-zoom:hover img{ filter:none; transform:scale(1.03); }
.term-portrait-ph{ width:100%; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px;
  background-image:radial-gradient(var(--line2) 1px, transparent 1px); background-size:12px 12px; }
.term-portrait-mono{ font-size:3rem; font-weight:800; color:var(--accent); }
.term-portrait-sub{ color:var(--ink2); }
.term-statrow{ display:grid; grid-template-columns:1fr 1fr; gap:14px; }
.term-stat{ padding:14px 16px; display:flex; flex-direction:column; gap:2px; }
.term-stat b{ font-size:1.6rem; color:var(--accent); }
.term-stat span{ font-size:.78rem; color:var(--ink2); }

/* sections */
.term-section{ padding-block:clamp(34px,5vw,60px); border-bottom:1px solid var(--line); scroll-margin-top:76px; }
.term-section:last-of-type{ border-bottom:0; }
.term-sechead{ display:flex; align-items:flex-end; justify-content:space-between; gap:14px; flex-wrap:wrap; }
.term-sechead .term-h2{ margin-bottom:0; }
.term-tagpill{ padding:6px 12px; border:1px solid var(--line2); border-radius:999px; font-size:.78rem; color:var(--accent); }

/* about + code panel */
.term-about{ display:grid; grid-template-columns:1fr 1.05fr; gap:clamp(20px,3vw,40px); align-items:start; }
.term-about-txt p{ margin:0 0 14px; color:var(--ink2); }
.term-code{ overflow:hidden; }
.term-code-bar{ display:flex; align-items:center; gap:12px; padding:9px 12px; border-bottom:1px solid var(--line); background:var(--panel2); }
.term-dots{ display:inline-flex; gap:6px; }
.term-dots i{ width:10px; height:10px; border-radius:50%; background:var(--line2); }
.term-dots i:first-child{ background:var(--accent); }
.term-tabs{ display:flex; gap:4px; flex:1; }
.term-tab{ padding:4px 12px; border-radius:4px 4px 0 0; border:1px solid transparent; background:transparent; color:var(--ink2); font-family:var(--mono); font-size:.8rem; cursor:pointer; }
.term-tab.is-on{ color:var(--ink); background:var(--panel); border-color:var(--line); }
.term-tab:focus-visible{ outline:2px solid var(--accent); outline-offset:1px; }
.term-code-lang{ font-size:.72rem; color:var(--ink2); letter-spacing:.1em; }
.term-code-body{ padding:14px 8px; overflow-x:auto; font-size:.86rem; }
.term-code-line{ display:flex; gap:14px; white-space:pre; }
.term-ln{ color:var(--ink2); opacity:.55; text-align:right; width:22px; flex:0 0 auto; user-select:none; }
.term-code-line code{ font-family:var(--mono); }
.t-cm{ color:var(--t-cm); font-style:italic; } .t-kw{ color:var(--t-kw); } .t-str{ color:var(--t-str); }
.t-ky{ color:var(--t-ky); } .t-fn{ color:var(--t-fn); } .t-vr{ color:var(--t-vr); } .t-pn{ color:var(--t-pn); }

/* grids + cards */
.term-grid-4{ display:grid; grid-template-columns:repeat(4,1fr); gap:14px; }
.term-grid-3{ display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
.term-grid-2{ display:grid; grid-template-columns:repeat(2,1fr); gap:16px; }
.term-list{ display:flex; flex-direction:column; gap:12px; }

.term-card{ padding:20px; display:flex; flex-direction:column; gap:8px; text-decoration:none; color:inherit; }
.term-card:hover, .term-card-link:hover{ border-color:var(--accent); transform:translateY(-4px); box-shadow:0 14px 30px -20px color-mix(in srgb,var(--accent) 60%, transparent); }
.term-card-ic{ width:40px; height:40px; display:grid; place-items:center; border:1px solid var(--line2); border-radius:5px; color:var(--accent); font-weight:700; }
.term-card-title{ font-size:1.05rem; font-weight:700; margin:4px 0 0; }
.term-card-foot{ display:flex; align-items:center; justify-content:space-between; gap:10px; margin-top:auto; padding-top:8px; flex-wrap:wrap; }
.term-card-foot-top{ margin-top:0; padding-top:0; align-items:baseline; }
.term-idx{ color:var(--accent); font-size:.78rem; }
.term-price{ color:var(--accent); font-weight:700; }
.term-arrow{ color:var(--accent); font-weight:700; }
.term-listitem{ padding:18px 20px; text-decoration:none; color:inherit; }
.term-listitem:hover{ border-color:var(--accent); }

/* skills */
.term-grid-skills{ display:grid; grid-template-columns:repeat(auto-fill,minmax(150px,1fr)); gap:14px; }
.term-skill{ padding:16px; display:flex; flex-direction:column; align-items:center; text-align:center; gap:8px; }
.term-skill:hover{ border-color:var(--accent); transform:translateY(-3px); }
.term-skill-ic{ width:44px; height:44px; display:grid; place-items:center; border:1px solid var(--line2); border-radius:6px; color:var(--accent); font-weight:700; font-size:.9rem; }
.term-skill-name{ font-weight:600; font-size:.9rem; }
.term-skill-cat{ font-size:.68rem; color:var(--ink2); text-transform:uppercase; letter-spacing:.08em; }
.term-bar{ width:100%; height:8px; border:1px solid var(--line); border-radius:3px; overflow:hidden; background:var(--panel2); margin-top:4px; }
.term-bar-fill{ display:block; height:100%; width:var(--pct);
  background:repeating-linear-gradient(90deg, var(--accent) 0 6px, color-mix(in srgb, var(--accent) 55%, transparent) 6px 8px);
  transition:width 1.1s cubic-bezier(.2,.8,.2,1); }
.term-root.term-anim-ready .term-skill[data-bar] .term-bar-fill{ width:0; }
.term-root.term-anim-ready .term-skill[data-bar].term-in .term-bar-fill{ width:var(--pct); }

/* projects */
.term-proj{ padding:10px; display:flex; flex-direction:column; }
.term-proj:hover{ border-color:var(--accent); transform:translateY(-4px); }
.term-proj-media{ position:relative; border:1px solid var(--line); border-radius:4px; overflow:hidden; aspect-ratio:16/10; background:var(--panel2); }
.term-proj-media .term-zoom, .term-proj-media .term-zoom img{ width:100%; height:100%; }
.term-proj-media .term-zoom img{ object-fit:cover; }
.term-proj-ph{ width:100%; height:100%; display:grid; place-items:center; font-size:1.6rem; color:var(--accent); font-weight:700;
  background-image:radial-gradient(var(--line2) 1px, transparent 1px); background-size:12px 12px; }
.term-badge{ position:absolute; top:8px; left:8px; padding:4px 9px; border-radius:4px; font-size:.68rem; font-weight:700; color:#fff; background:color-mix(in srgb,var(--accent) 88%, #000 6%); z-index:2; }
.term-proj-body{ padding:12px 8px 6px; display:flex; flex-direction:column; gap:6px; }
.term-proj-cat{ color:var(--accent); font-size:.82rem; margin:0; }
.term-linktext{ text-decoration:none; }
.term-linktext:hover{ color:var(--accent); }
.term-tags{ display:flex; flex-wrap:wrap; gap:6px; margin-top:6px; }
.term-tag{ font-size:.72rem; padding:3px 8px; border:1px solid var(--line); border-radius:4px; color:var(--ink2); }
.term-tag::before{ content:"["; margin-right:2px; color:var(--accent); }
.term-tag::after{ content:"]"; margin-left:2px; color:var(--accent); }

/* timeline */
.term-timeline{ display:flex; flex-direction:column; gap:0; padding-left:8px; border-left:1px solid var(--line); }
.term-tl-item{ position:relative; display:grid; grid-template-columns:120px 1fr; gap:16px; padding:0 0 22px 18px; align-items:start; }
.term-tl-item:last-child{ padding-bottom:0; }
.term-tl-dot{ position:absolute; left:-13px; top:6px; width:9px; height:9px; border-radius:50%; background:var(--accent); box-shadow:0 0 0 4px var(--bg); }
.term-tl-date{ color:var(--accent); font-size:.82rem; padding-top:4px; }
.term-tl-body{ padding:14px 16px; }
.term-tl-role{ font-size:1.05rem; font-weight:700; margin:0; }
.term-tl-meta{ margin-top:4px; font-size:.86rem; }

/* gallery */
.term-gallery{ columns:3 240px; column-gap:14px; }
.term-gitem{ break-inside:avoid; margin:0 0 14px; padding:6px; }
.term-gitem .term-zoom{ width:100%; border-radius:3px; overflow:hidden; }
.term-gitem .term-zoom img{ width:100%; height:auto; }
.term-gitem figcaption{ padding:8px 4px 2px; }

/* zoom button */
.term-zoom{ position:relative; display:block; padding:0; border:0; background:none; cursor:zoom-in; color:inherit; }
.term-zoom:focus-visible{ outline:2px solid var(--accent); outline-offset:2px; }
.term-zoom-ic{ position:absolute; top:8px; right:8px; font-size:.72rem; color:var(--accent); background:color-mix(in srgb,var(--bg) 70%, transparent);
  padding:2px 6px; border:1px solid var(--line2); border-radius:4px; opacity:0; transition:opacity .2s ease; pointer-events:none; }
.term-zoom:hover .term-zoom-ic, .term-zoom:focus-visible .term-zoom-ic{ opacity:1; }

/* videos */
.term-video{ padding:6px; }
.term-video-frame{ position:relative; aspect-ratio:16/9; border-radius:3px; overflow:hidden; background:#000; }
.term-video-frame iframe{ position:absolute; inset:0; width:100%; height:100%; border:0; }
.term-video figcaption{ padding:8px 4px 2px; }

/* testimonials */
.term-tgrid{ display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
.term-quote{ padding:22px; display:flex; flex-direction:column; gap:12px; }
.term-quote-mark{ color:var(--accent); font-size:2.4rem; line-height:.5; height:18px; }
.term-quote blockquote{ margin:0; }
.term-quote-by{ display:flex; align-items:center; gap:12px; margin-top:auto; }
.term-quote-by span{ display:flex; flex-direction:column; line-height:1.2; }
.term-quote-by b{ font-weight:700; font-size:.9rem; }
.term-quote-by em{ font-style:normal; font-size:.8rem; }
.term-avatar{ width:42px; height:42px; flex:0 0 auto; border:1px solid var(--line2); border-radius:5px; overflow:hidden; display:grid; place-items:center; font-weight:700; font-size:.85rem; color:var(--accent); }
.term-avatar img{ width:100%; height:100%; object-fit:cover; }

/* socials */
.term-socials{ display:flex; flex-wrap:wrap; gap:10px; margin-top:18px; }
.term-soc{ width:38px; height:38px; display:grid; place-items:center; border:1px solid var(--line2); border-radius:5px; color:var(--ink); font-size:1rem; text-decoration:none; transition:color .16s, border-color .16s, transform .16s; }
.term-soc:hover{ color:var(--accent); border-color:var(--accent); transform:translateY(-2px); }
.term-soc svg{ width:16px; height:16px; }

/* contact */
.term-contact{ display:grid; grid-template-columns:.85fr 1.15fr; gap:clamp(20px,3vw,40px); align-items:start; }
.term-contact-rows{ display:flex; flex-direction:column; gap:10px; margin-top:20px; }
.term-crow{ display:flex; align-items:center; gap:12px; text-decoration:none; color:inherit; word-break:break-word; }
.term-crow span:first-child{ color:var(--accent); width:20px; text-align:center; flex:0 0 auto; }
.term-crow:hover{ color:var(--accent); }
.term-formcard{ overflow:hidden; }
.term-formwrap{ padding:clamp(16px,2.4vw,26px); }
.term-formwrap :where(input, textarea, select){ width:100%; font-family:var(--mono); font-size:.9rem; color:var(--ink);
  background:var(--panel2); border:1px solid var(--line); border-radius:5px; padding:11px 13px; margin-bottom:12px; transition:border-color .16s; }
.term-formwrap :where(input, textarea, select):focus{ outline:none; border-color:var(--accent); }
.term-formwrap :where(input, textarea, select)::placeholder{ color:var(--ink2); }
.term-formwrap textarea{ min-height:120px; resize:vertical; }
.term-formwrap :where(button, [type="submit"]){ width:100%; font-family:var(--mono); font-weight:700; cursor:pointer;
  color:var(--accent); background:transparent; border:1px solid var(--accent); border-radius:5px; padding:12px 16px; transition:background .18s, transform .18s; }
.term-formwrap :where(button, [type="submit"]):hover{ background:var(--accent-soft); transform:translateY(-2px); }
.term-formwrap label{ color:var(--ink2); font-size:.82rem; }

/* footer */
.term-footer{ border-top:1px solid var(--line); background:var(--bg2); }
.term-footer-in{ display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap; padding-block:22px; }
.term-footer-nav{ display:flex; flex-wrap:wrap; gap:8px 18px; }
.term-footer-nav a{ text-decoration:none; color:var(--ink2); font-size:.86rem; }
.term-footer-nav a:hover{ color:var(--accent); }
.term-footer-right{ display:flex; align-items:center; gap:14px; color:var(--ink2); font-size:.82rem; flex-wrap:wrap; }
.term-madewith b{ color:var(--accent); }
.term-madewith{ text-decoration:none; }

/* lightbox */
.term-lb{ position:fixed; inset:0; z-index:1000; display:grid; place-items:center; padding:clamp(16px,4vw,48px);
  background:rgba(5,5,8,.86); backdrop-filter:blur(6px); -webkit-backdrop-filter:blur(6px); animation:term-fade .2s ease both; }
.term-lb-fig{ margin:0; max-width:94vw; max-height:92vh; display:flex; flex-direction:column; gap:10px; align-items:center; animation:term-pop .3s cubic-bezier(.2,.8,.2,1) both; }
.term-lb-fig img{ max-width:92vw; max-height:84vh; width:auto; height:auto; object-fit:contain; border:1px solid var(--line2); border-radius:4px; }
.term-lb-fig figcaption{ color:#e9e9f0; font-size:.85rem; font-family:var(--mono); text-align:center; }
.term-lb-close{ position:fixed; top:18px; right:18px; z-index:1001; cursor:pointer; font-family:var(--mono); font-weight:700; font-size:.9rem;
  color:#fff; background:rgba(255,255,255,.1); border:1px solid rgba(255,255,255,.25); border-radius:5px; padding:8px 12px; transition:background .18s; }
.term-lb-close:hover{ background:var(--accent); border-color:var(--accent); }
.term-lb-close:focus-visible{ outline:2px solid #fff; outline-offset:2px; }
@keyframes term-fade{ from{opacity:0;} to{opacity:1;} }
@keyframes term-pop{ from{opacity:0; transform:scale(.94);} to{opacity:1; transform:none;} }

/* responsive */
@media (max-width:1080px){ .term-grid-4{ grid-template-columns:repeat(2,1fr); } }
@media (max-width:960px){
  .term-body{ grid-template-columns:1fr; }
  .term-side{ display:none; }
  .term-prompt{ display:none; }
  .term-menu{ display:block; }
  .term-hero{ grid-template-columns:1fr; }
  .term-hero-right{ order:-1; }
  .term-about{ grid-template-columns:1fr; }
  .term-contact{ grid-template-columns:1fr; }
  .term-grid-3{ grid-template-columns:repeat(2,1fr); }
  .term-tgrid{ display:flex; overflow-x:auto; gap:14px; scroll-snap-type:x mandatory; padding-bottom:8px;
    margin-inline:calc(-1 * clamp(14px,3vw,28px)); padding-inline:clamp(14px,3vw,28px); }
  .term-tgrid .term-quote{ flex:0 0 84%; scroll-snap-align:start; }
}
@media (max-width:680px){
  .term-grid-2{ grid-template-columns:1fr; }
  .term-gallery{ columns:2 150px; }
  .term-tl-item{ grid-template-columns:1fr; gap:6px; }
  .term-topcta{ display:none; }
}
@media (max-width:520px){
  .term-grid-3{ grid-template-columns:1fr; }
  .term-grid-4{ grid-template-columns:1fr; }
  .term-statrow{ grid-template-columns:1fr 1fr; }
  .term-brand-txt em{ display:none; }
}
@media (max-width:400px){ .term-gallery{ columns:1; } }

@media (prefers-reduced-motion: reduce){
  .term-root{ scroll-behavior:auto; }
  .term-root *{ animation:none !important; transition:none !important; }
}
`;
