"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import type { PublicPortfolio } from "@/lib/publicTypes";
import { dateRange, videoEmbed, ext } from "@/lib/publicTypes";
import { ContactForm } from "@/components/ContactForm";

/* =====================================================================
   ArtisanTemplate — "Sketchbook" (editorial layout)
   An artsy paper / collage / hand-drawn portfolio for Folio.
   Distinct editorial structure: each section has a handwritten margin
   (big number + label) beside its content, alternating left/right.
   PURE PRESENTATION — everything from `data`. No fetch/DB/auth.
   Styles self-contained, prefixed `.art-`, scoped under `.art-root`.
   ===================================================================== */

/* ------------------------------ pure helpers ------------------------------ */

const DEFAULT_ORDER = [
  "about", "services", "skills", "projects", "experience",
  "education", "certifications", "achievements", "publications",
  "gallery", "videos", "testimonials",
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
  if (typeof level === "number") { if (Number.isNaN(level)) return null; return clamp(level <= 5 ? (level / 5) * 100 : level); }
  const s = String(level).trim().toLowerCase();
  const num = parseFloat(s);
  if (!Number.isNaN(num) && /^[\d.]+\s*%?$/.test(s)) return clamp(s.includes("%") ? num : num <= 5 ? (num / 5) * 100 : num);
  const map: Record<string, number> = { beginner: 35, basic: 35, novice: 30, elementary: 40, learning: 30, intermediate: 60, competent: 62, proficient: 75, skilled: 72, advanced: 85, expert: 95, master: 100, fluent: 95, native: 100 };
  for (const k in map) if (s.includes(k)) return map[k];
  return null;
}

/* ---- social brand icons (auto-detected from platform / url) ---- */
const SOCIAL_ICONS: Record<string, string> = {
  github: "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12",
  gitlab: "M23.955 13.587l-1.342-4.135-2.664-8.189c-.135-.423-.73-.423-.867 0L16.418 9.45H7.582L4.919 1.263C4.783.84 4.185.84 4.05 1.263L1.386 9.452.044 13.587c-.121.375.014.789.331 1.023L12 23.054l11.625-8.443c.318-.235.453-.647.33-1.024",
  linkedin: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z",
  youtube: "M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
  instagram: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.332.014 7.052.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z",
  facebook: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
  dribbble: "M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zm9.885 11.441c-2.575-.422-4.943-.445-7.103-.073-.244-.563-.497-1.125-.767-1.68 2.31-1 4.165-2.358 5.548-4.082 1.35 1.594 2.197 3.619 2.322 5.835zm-3.842-7.282c-1.205 1.554-2.868 2.783-4.986 3.68-1.016-1.861-2.178-3.676-3.488-5.438.779-.197 1.591-.314 2.431-.314 2.275 0 4.368.809 6.043 2.072zM7.527 3.166c1.299 1.744 2.45 3.542 3.457 5.39-2.514.75-5.418.983-8.712.733.523-2.708 2.297-4.972 4.671-6.127.194.001.392.002.584.004zM2.096 12.42c3.639.284 6.847.021 9.616-.784.276.523.532 1.056.767 1.6-2.866.867-5.293 2.559-7.24 5.113C3.633 16.62 2.437 14.681 2.096 12.42zm4.674 6.89c1.774-2.33 3.964-3.832 6.564-4.566.828 2.145 1.451 4.421 1.865 6.827-2.86 1.219-6.058.73-8.429-2.261zm10.324.822c-.384-2.219-.959-4.339-1.72-6.352 1.842-.29 3.887-.211 6.135.234-.618 2.586-2.339 4.741-4.415 6.118z",
  behance: "M22 7h-7V5h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-1.729-5.564-5.675 0-3.91 2.325-5.92 5.466-5.92 3.082 0 4.964 1.782 5.375 4.426.078.506.109 1.188.095 2.14H15.97c.13 3.211 3.483 3.312 4.588 2.029h3.168zm-7.686-4h4.965c-.105-1.547-1.136-2.219-2.477-2.219-1.466 0-2.277.768-2.488 2.219zm-9.574 6.988H0V5.021h6.953c5.476.081 5.58 5.444 2.72 6.906 3.461 1.26 3.577 8.061-3.207 8.061zM3 11h3.584c2.508 0 2.906-3-.312-3H3v3zm3.391 3H3v3.016h3.341c3.055 0 2.868-3.016.05-3.016z",
  medium: "M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zm7.42 0c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z",
  twitch: "M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z",
  tiktok: "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z",
  discord: "M20.317 4.369a19.79 19.79 0 00-4.885-1.515.074.074 0 00-.079.037c-.211.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.369a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.893.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.331c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.955 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z",
  telegram: "M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z",
  whatsapp: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347M12.05 21.785h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z",
  reddit: "M24 11.779c0-1.459-1.192-2.645-2.657-2.645-.715 0-1.363.286-1.84.746-1.81-1.191-4.259-1.949-6.971-2.046l1.483-4.669 4.016.941-.006.058c0 1.193.975 2.163 2.174 2.163 1.198 0 2.172-.97 2.172-2.163s-.975-2.164-2.172-2.164c-.92 0-1.704.574-2.021 1.379l-4.329-1.015a.379.379 0 00-.44.288l-1.783 5.618c-2.767.036-5.256.786-7.99 2.033-.469-.4-1.129-.628-1.784-.628C1.193 9.134 0 10.32 0 11.779c0 .996.564 1.905 1.475 2.373-.025.147-.037.297-.037.446 0 2.9 3.508 5.261 7.821 5.261 4.312 0 7.82-2.361 7.82-5.261 0-.149-.012-.298-.036-.445.91-.468 1.474-1.378 1.474-2.374zM6.11 13.42a1.49 1.49 0 011.49-1.489c.821 0 1.49.668 1.49 1.489 0 .82-.669 1.49-1.49 1.49-.821 0-1.49-.67-1.49-1.49zm8.978 3.788c-.673.673-2.147 1.02-3.5 1.02-1.353 0-2.827-.347-3.5-1.02a.375.375 0 010-.53c.146-.146.383-.146.53 0 .424.425 1.529.69 2.97.69 1.44 0 2.545-.265 2.97-.69.146-.146.384-.146.53 0 .146.147.146.384 0 .53zm-.376-2.298c-.821 0-1.49-.67-1.49-1.49 0-.821.669-1.489 1.49-1.489.821 0 1.49.668 1.49 1.489 0 .82-.669 1.49-1.49 1.49z",
  pinterest: "M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.749-7.252 7.926-7.252 4.163 0 7.398 2.967 7.398 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C24.007 5.367 18.635.001 12.017.001z",
  spotify: "M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z",
  twitter: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  mail: "M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0l-8 5-8-5h16zm0 12H4V8l8 5 8-5v10z",
  globe: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z",
};
function detectSocial(platform: string | null, url: string | null, label: string | null): string {
  let host = "";
  try { host = new URL(ext(url || "")).hostname.replace(/^www\./, "").toLowerCase(); } catch { host = ""; }
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
  return (<svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden focusable="false"><path d={SOCIAL_ICONS[name] || SOCIAL_ICONS.globe} /></svg>);
}

/* ---- hand-drawn doodles ---- */
function DoodleUnderline() {
  return (<svg className="art-underline" viewBox="0 0 300 24" preserveAspectRatio="none" aria-hidden focusable="false"><path d="M4 15 C 60 5, 120 22, 180 11 S 280 7, 296 17" fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" /></svg>);
}
function DoodleCrown() {
  return (<svg className="art-crown" viewBox="0 0 60 40" aria-hidden focusable="false"><path d="M6 34 L10 12 L22 26 L30 6 L38 26 L50 12 L54 34 Z" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round" /></svg>);
}
function DoodleStar({ className }: { className?: string }) {
  return (<svg className={`art-star ${className || ""}`} viewBox="0 0 40 40" aria-hidden focusable="false"><path d="M20 4 L23 16 L36 16 L26 24 L30 37 L20 29 L10 37 L14 24 L4 16 L17 16 Z" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" /></svg>);
}

/* ------------------------------ component ------------------------------ */

export function ArtisanTemplate({ data }: { data: PublicPortfolio }) {
  const p = data.profile;
  const accent = data.accent || "#7c6cff";

  const hidden = new Set(data.settings?.hidden ?? []);
  const sv = (k: string) => !hidden.has(k);
  const username = data.username;

  const name = p?.display_name || username || "Your Name";
  const mono = initials(p?.display_name, username);

  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [lb, setLb] = useState<{ src: string; alt: string; cap?: string } | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const openLb = useCallback((src: string, alt: string, cap?: string) => setLb({ src, alt, cap }), []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    root.classList.add("art-anim-ready");
    const reduce = typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const targets = root.querySelectorAll("[data-reveal],[data-bar]");
    if (reduce || typeof IntersectionObserver === "undefined") { targets.forEach((el) => el.classList.add("art-in")); return; }
    const io = new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("art-in"); io.unobserve(e.target); } }), { threshold: 0.1, rootMargin: "0px 0px -6% 0px" });
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

  const has = {
    about: sv("about") && !!(p?.about || p?.bio || p?.tagline),
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
    { href: "#work", label: "Work", on: has.projects },
    { href: "#skills", label: "Skills", on: has.skills },
    { href: "#experience", label: "Journey", on: has.experience },
    { href: "#testimonials", label: "Words", on: has.testimonials },
    { href: "#contact", label: "Hello", on: has.contact },
  ];
  const navItems = navSpec.filter((n) => n.on);

  const themeBtn = (extra?: string) => (
    <button type="button" className={`art-icbtn ${extra || ""}`} onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`} aria-pressed={theme === "dark"} title="Toggle theme">
      <span aria-hidden>{theme === "dark" ? "☀" : "☾"}</span>
    </button>
  );
  const ZImg = useCallback(({ src, alt, cap, className }: { src: string; alt: string; cap?: string; className?: string }) => (
    <button type="button" className={`art-zoom ${className || ""}`} onClick={() => openLb(src, alt, cap)} aria-label={alt ? `View image: ${alt}` : "View image"}>
      <img src={src} alt={alt} loading="lazy" />
    </button>
  ), [openLb]);
  const socialRow = (extra?: string) =>
    data.links.length > 0 ? (
      <div className={`art-socials ${extra || ""}`}>
        {data.links.map((l) => (
          <a key={l.id} className="art-soc" href={ext(l.url)} target="_blank" rel="noopener noreferrer" aria-label={l.label || l.platform} title={l.label || l.platform}><SocialIcon name={detectSocial(l.platform, l.url, l.label)} /></a>
        ))}
      </div>
    ) : null;

  // editorial section shell: handwritten margin (number + tag) + content
  // useCallback keeps the component identity stable so a theme toggle
  // re-render never remounts sections (which would drop the reveal class).
  const Sec = useCallback(({ id, sec, tag, heading, children }: { id: string; sec?: string; tag: string; heading?: ReactNode; children: ReactNode }) => (
    <section id={id} data-sec={sec} data-reveal className="art-section">
      <aside className="art-margin">
        <span className="art-num" aria-hidden />
        <span className="art-mtag art-script">{tag}</span>
        <span className="art-mline" aria-hidden />
      </aside>
      <div className="art-content">
        {heading && <h2 className="art-h2 art-script">{heading}</h2>}
        {children}
      </div>
    </section>
  ), []);

  const sections: Record<string, () => ReactNode> = {
    about: () => {
      if (!has.about) return null;
      const aboutText = p?.about ?? p?.bio ?? null;
      const stats = [
        { n: data.experience.length, label: "years & roles" },
        { n: data.projects.length, label: "projects done" },
        { n: data.testimonials.length, label: "happy clients" },
      ].filter((s) => s.n > 0).slice(0, 3);
      const photo = data.gallery.find((g) => g.image_url)?.image_url || null;
      return (
        <Sec id="about" sec="about" tag="about me" heading={<>More than just<br />a maker<span className="art-dot">.</span></>}>
          <div className="art-about">
            <div>
              {aboutText && aboutText.split(/\n{2,}/).map((para, i) => <p key={i} className="art-lead">{para}</p>)}
              {stats.length > 0 && (
                <div className="art-stats">
                  {stats.map((s) => (<div key={s.label} className="art-stat"><b>{s.n}+</b><span>{s.label}</span></div>))}
                </div>
              )}
              {p?.resume_url && <a className="art-btn art-btn-dark art-mt" href={ext(p.resume_url)} target="_blank" rel="noopener noreferrer">My story <span aria-hidden>→</span></a>}
            </div>
            {photo && (
              <div className="art-blob-frame art-tilt-r">
                <ZImg src={photo} alt={name} className="art-zoom-fill" />
              </div>
            )}
          </div>
        </Sec>
      );
    },

    services: () => {
      if (!has.services) return null;
      return (
        <Sec id="services" sec="services" tag="what I do" heading="Services I offer">
          <div className="art-grid-4">
            {data.services.map((s, i) => (
              <article key={s.id} className={`art-paper art-card ${i === 0 ? "art-card-hot" : ""}`}>
                <div className="art-card-top"><span className="art-card-ic" aria-hidden>✦</span><span className="art-card-num art-script">{String(i + 1).padStart(2, "0")}</span></div>
                <h3 className="art-card-title">{s.title}</h3>
                {s.description && <p className="art-muted art-clamp-3">{s.description}</p>}
                <div className="art-card-foot">{s.price && <span className="art-price">{s.price}</span>}<span className="art-arrow" aria-hidden>↗</span></div>
              </article>
            ))}
          </div>
        </Sec>
      );
    },

    skills: () => {
      if (!has.skills) return null;
      const sorted = [...data.skills].sort((a, b) => (a.category || "").localeCompare(b.category || ""));
      return (
        <Sec id="skills" sec="skills" tag="my toolkit" heading="Things I work with">
          <div className="art-skills">
            {sorted.map((s) => {
              const pct = levelPct(s.level);
              return (
                <div key={s.id} className="art-skill art-paper" data-bar style={{ ["--pct" as string]: `${pct ?? 0}%` } as CSSProperties}>
                  <span className="art-skill-ic" aria-hidden>{initials(s.name, "•")}</span>
                  <span className="art-skill-name">{s.name}</span>
                  {pct != null && (<span className="art-skill-bar" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label={`${s.name} level`}><span className="art-skill-fill" /></span>)}
                </div>
              );
            })}
          </div>
        </Sec>
      );
    },

    projects: () => {
      if (!has.projects) return null;
      const ordered = [...data.projects].sort((a, b) => Number(!!b.is_featured) - Number(!!a.is_featured));
      return (
        <Sec id="work" sec="projects" tag="selected work" heading="Things I've built">
          <div className="art-grid-3">
            {ordered.map((pr, i) => {
              const category = pr.role || (pr.tags && pr.tags[0]) || null;
              return (
                <article key={pr.id} className={`art-paper art-proj ${i % 2 ? "art-tilt-r" : "art-tilt-l"}`}>
                  <div className="art-proj-media">
                    {pr.image_url ? <ZImg src={pr.image_url} alt={pr.title || "Project image"} cap={pr.title || undefined} /> : <div className="art-proj-ph" aria-hidden>{initials(pr.title, "P")}</div>}
                    {pr.is_featured && <span className="art-badge">★ featured</span>}
                  </div>
                  <div className="art-proj-body">
                    <h3 className="art-card-title">{pr.url ? <a className="art-linktext" href={ext(pr.url)} target="_blank" rel="noopener noreferrer">{pr.title || "Untitled"} <span aria-hidden>↗</span></a> : (pr.title || "Untitled")}</h3>
                    {category && <p className="art-muted art-small">{category}</p>}
                    {pr.description && <p className="art-muted art-clamp-2">{pr.description}</p>}
                    {pr.tags && pr.tags.length > 0 && <div className="art-tags">{pr.tags.slice(0, 4).map((t) => <span key={t} className="art-tag">{t}</span>)}</div>}
                  </div>
                </article>
              );
            })}
          </div>
        </Sec>
      );
    },

    experience: () => {
      if (!has.experience) return null;
      return (
        <Sec id="experience" sec="experience" tag="the journey" heading="Where I've been">
          <div className="art-timeline">
            {data.experience.map((e) => (
              <article key={e.id} className="art-tl-item">
                <span className="art-tl-dot" aria-hidden />
                <span className="art-tl-date art-script">{dateRange(e.start_date, e.end_date, e.is_current)}</span>
                <div className="art-tl-body">
                  <h3 className="art-tl-role">{e.title || e.company || "Role"}</h3>
                  <p className="art-muted art-small">{[e.company, e.location].filter(Boolean).join(" · ")}</p>
                  {e.description && <p className="art-muted">{e.description}</p>}
                </div>
              </article>
            ))}
          </div>
        </Sec>
      );
    },

    education: () => {
      if (!(sv("education") && data.education.length > 0)) return null;
      return (
        <Sec id="education" sec="education" tag="the study" heading="Education">
          <div className="art-grid-2">
            {data.education.map((ed) => (
              <article key={ed.id} className="art-paper art-card">
                <div className="art-card-foot art-card-foot-top"><h3 className="art-card-title">{ed.school || "School"}</h3><span className="art-price">{dateRange(ed.start_date, ed.end_date)}</span></div>
                {(ed.degree || ed.field) && <p className="art-muted">{[ed.degree, ed.field].filter(Boolean).join(", ")}</p>}
                {ed.description && <p className="art-muted">{ed.description}</p>}
              </article>
            ))}
          </div>
        </Sec>
      );
    },

    certifications: () => {
      if (!(sv("certifications") && data.certifications.length > 0)) return null;
      return (
        <Sec id="certifications" sec="certifications" tag="credentials" heading="Certifications">
          <div className="art-grid-3">
            {data.certifications.map((c) => {
              const body = (<><span className="art-card-ic" aria-hidden>✓</span><h3 className="art-card-title">{c.name}</h3>{c.issuer && <p className="art-muted">{c.issuer}</p>}<div className="art-card-foot">{oneDate(c.issue_date) && <span className="art-price">{oneDate(c.issue_date)}</span>}{c.credential_id && <span className="art-muted art-small">#{c.credential_id}</span>}</div></>);
              return c.url ? <a key={c.id} className="art-paper art-card art-card-link" href={ext(c.url)} target="_blank" rel="noopener noreferrer">{body}</a> : <article key={c.id} className="art-paper art-card">{body}</article>;
            })}
          </div>
        </Sec>
      );
    },

    achievements: () => {
      if (!(sv("achievements") && data.achievements.length > 0)) return null;
      return (
        <Sec id="achievements" sec="achievements" tag="little wins" heading="Achievements">
          <div className="art-grid-3">
            {data.achievements.map((a) => (
              <article key={a.id} className="art-paper art-card"><span className="art-card-ic" aria-hidden>★</span><h3 className="art-card-title">{a.title}</h3>{oneDate(a.date) && <span className="art-price">{oneDate(a.date)}</span>}{a.description && <p className="art-muted art-clamp-3">{a.description}</p>}</article>
            ))}
          </div>
        </Sec>
      );
    },

    publications: () => {
      if (!(sv("publications") && data.publications.length > 0)) return null;
      return (
        <Sec id="publications" sec="publications" tag="some words" heading="Publications">
          <div className="art-list">
            {data.publications.map((pub) => {
              const meta = [pub.publisher, oneDate(pub.date)].filter(Boolean).join(" · ");
              const body = (<><div className="art-card-foot art-card-foot-top"><h3 className="art-card-title">{pub.title}</h3>{pub.url && <span className="art-arrow" aria-hidden>↗</span>}</div>{meta && <p className="art-muted art-small">{meta}</p>}{pub.description && <p className="art-muted">{pub.description}</p>}</>);
              return pub.url ? <a key={pub.id} className="art-paper art-listitem art-card-link" href={ext(pub.url)} target="_blank" rel="noopener noreferrer">{body}</a> : <article key={pub.id} className="art-paper art-listitem">{body}</article>;
            })}
          </div>
        </Sec>
      );
    },

    gallery: () => {
      if (!(sv("gallery") && data.gallery.length > 0)) return null;
      return (
        <Sec id="gallery" sec="gallery" tag="the wall" heading="Gallery">
          <div className="art-gallery">
            {data.gallery.map((g, i) => g.image_url ? (
              <figure key={g.id} className={`art-polaroid ${i % 2 ? "art-tilt-r" : "art-tilt-l"}`}>
                <ZImg src={g.image_url} alt={g.caption || "Gallery image"} cap={g.caption || undefined} className="art-zoom-gallery" />
                <figcaption>{g.caption || "\u00a0"}</figcaption>
              </figure>
            ) : null)}
          </div>
        </Sec>
      );
    },

    videos: () => {
      if (!(sv("videos") && data.videos.length > 0)) return null;
      return (
        <Sec id="videos" sec="videos" tag="the reel" heading="Videos">
          <div className="art-grid-2">
            {data.videos.map((v) => {
              const src = v.url ? videoEmbed(v.url) : null;
              if (!src) return null;
              return (<figure key={v.id} className="art-paper art-video"><div className="art-video-frame"><iframe src={src} title={v.title || "Video"} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div>{v.title && <figcaption className="art-muted art-small">{v.title}</figcaption>}</figure>);
            })}
          </div>
        </Sec>
      );
    },

    testimonials: () => {
      if (!has.testimonials) return null;
      return (
        <Sec id="testimonials" sec="testimonials" tag="kind words" heading="What clients say">
          <div className="art-tgrid">
            {data.testimonials.map((t, i) => (
              <figure key={t.id} className={`art-paper art-quote ${i % 2 ? "art-tilt-r" : "art-tilt-l"}`}>
                <span className="art-quote-mark art-script" aria-hidden>&ldquo;</span>
                {t.quote && <blockquote>{t.quote}</blockquote>}
                <figcaption className="art-quote-by"><span className="art-avatar" aria-hidden>{t.avatar_url ? <img src={t.avatar_url} alt="" loading="lazy" /> : initials(t.author, "•")}</span><span>{t.author && <b>{t.author}</b>}{t.role && <em className="art-muted">{t.role}</em>}</span></figcaption>
              </figure>
            ))}
          </div>
        </Sec>
      );
    },
  };

  const order = resolveOrder(data.settings);
  const heroStat = data.projects.length > 0 ? { n: data.projects.length, label: "projects" } : data.experience.length > 0 ? { n: data.experience.length, label: "roles" } : null;
  const year = new Date().getFullYear();

  return (
    <div ref={rootRef} className="art-root" id="top" data-theme={theme} style={{ ["--tpl-accent" as string]: accent } as CSSProperties}>
      <style dangerouslySetInnerHTML={{ __html: ART_CSS }} />
      <div className="art-grain" aria-hidden />

      {/* ---------------- NAVBAR ---------------- */}
      <header className="art-nav">
        <div className="art-shell art-nav-in">
          <a className="art-brand" href="#top">
            <span className="art-brand-name art-script">{name}</span>
            {p?.availability && <span className="art-online" aria-hidden title="available" />}
          </a>
          {navItems.length > 1 && (
            <nav className="art-navlinks" aria-label="Primary">{navItems.map((it) => <a key={it.href} href={it.href}>{it.label}</a>)}</nav>
          )}
          <div className="art-nav-right">
            {themeBtn()}
            {contactHref && <a className="art-btn art-btn-dark art-nav-cta" href={contactHref}>Let&apos;s talk <span aria-hidden>→</span></a>}
            {navItems.length > 1 && (<details className="art-menu"><summary aria-label="Menu"><span /><span /><span /></summary><ul>{navItems.map((it) => <li key={it.href}><a href={it.href}>{it.label}</a></li>)}</ul></details>)}
          </div>
        </div>
      </header>

      <div className="art-shell">
        {/* ---------------- HERO ---------------- */}
        <header className="art-hero">
          <div className="art-hero-left">
            <span className="art-eyebrow art-script">hello, I&apos;m</span>
            <h1 className="art-hero-name art-script">
              <span className="art-name-wrap"><DoodleCrown />{name}<DoodleUnderline /></span>
            </h1>
            {p?.title && <p className="art-hero-title">{p.title}</p>}
            {(p?.tagline || p?.bio) && <p className="art-hero-intro">{p?.tagline || p?.bio}</p>}
            <div className="art-btnrow">
              {has.projects && <a className="art-btn art-btn-dark" href="#work">View my work <span aria-hidden>→</span></a>}
              {p?.resume_url && <a className="art-btn art-btn-ghost" href={ext(p.resume_url)} target="_blank" rel="noopener noreferrer">Download CV <span aria-hidden>↓</span></a>}
              {!has.projects && !p?.resume_url && contactHref && <a className="art-btn art-btn-dark" href={contactHref}>Say hello <span aria-hidden>→</span></a>}
            </div>
            {socialRow("art-hero-soc")}
          </div>

          <div className="art-hero-right">
            <figure className="art-portrait art-tilt-r">
              {p?.avatar_url ? <ZImg src={p.avatar_url} alt={name} className="art-zoom-fill" /> : <div className="art-portrait-ph" aria-hidden>{mono}</div>}
              <figcaption className="art-script">{p?.title || "maker"}</figcaption>
              {heroStat && <span className="art-oval art-script" aria-hidden>{heroStat.n}+ {heroStat.label}</span>}
              <DoodleStar className="art-star-hero" />
            </figure>
            {(p?.location || p?.availability) && (
              <span className="art-tag-note art-script">
                {[p?.location, p?.availability].filter(Boolean).join(" · ")} ✦
              </span>
            )}
          </div>
        </header>

        {/* ---------------- SECTIONS ---------------- */}
        {order.map((k) => <Fragment key={k}>{sections[k] ? sections[k]() : null}</Fragment>)}

        {/* ---------------- CONTACT ---------------- */}
        {username && (
          <Sec id="contact" tag="say hello" heading={<>Let&apos;s build<br />something lovely.</>}>
            <div className="art-contact">
              <div className="art-contact-left">
                <div className="art-contact-rows">
                  {p?.email && <a className="art-crow" href={`mailto:${p.email}`}><span aria-hidden>✉</span><span>{p.email}</span></a>}
                  {p?.phone && <a className="art-crow" href={`tel:${p.phone}`}><span aria-hidden>☎</span><span>{p.phone}</span></a>}
                  {p?.website && <a className="art-crow" href={ext(p.website)} target="_blank" rel="noopener noreferrer"><span aria-hidden>◈</span><span>{p.website.replace(/^https?:\/\//, "")}</span></a>}
                  {p?.location && <div className="art-crow"><span aria-hidden>⌖</span><span>{p.location}</span></div>}
                </div>
                {socialRow()}
                {p?.availability && <span className="art-tag-note art-script art-note-inline">Open for {p.availability} ✦</span>}
              </div>
              <div className="art-paper art-formcard"><ContactForm username={username} /></div>
            </div>
          </Sec>
        )}
      </div>

      {/* ---------------- FOOTER ---------------- */}
      <footer className="art-footer">
        <div className="art-shell art-footer-in">
          <a className="art-brand art-brand-foot" href="#top"><span className="art-brand-name art-script">{name}</span>{p?.title && <span className="art-brand-sub">{p.title}</span>}</a>
          {navItems.length > 1 && <nav className="art-footer-nav" aria-label="Footer">{navItems.filter((n) => n.href !== "#top").map((it) => <a key={it.href} href={it.href}>{it.label}</a>)}</nav>}
          <div className="art-footer-right">
            {socialRow("art-footer-soc")}
            <div className="art-footer-meta">{themeBtn("art-icbtn-foot")}<span>© {year} {name}</span>{!data.hide_branding && <a className="art-madewith" href="https://folio.assetprim.com" target="_blank" rel="noopener noreferrer">Made with <b>Folio</b></a>}</div>
          </div>
        </div>
      </footer>

      {/* ---------------- LIGHTBOX ---------------- */}
      {lb && (
        <div className="art-lb" role="dialog" aria-modal="true" aria-label="Image viewer" onClick={() => setLb(null)}>
          <button ref={closeRef} type="button" className="art-lb-close" onClick={() => setLb(null)} aria-label="Close image viewer">✕</button>
          <figure className="art-lb-fig" onClick={(e) => e.stopPropagation()}><img src={lb.src} alt={lb.alt} />{lb.cap && <figcaption>{lb.cap}</figcaption>}</figure>
        </div>
      )}
    </div>
  );
}

export default ArtisanTemplate;

/* =====================================================================
   STYLES — self-contained, prefixed `.art-`, scoped under `.art-root`.
   Editorial margin/content sections that alternate sides.
   Light (paper) default; dark (craft board) under [data-theme="dark"].
   ===================================================================== */

const ART_CSS = `
.art-root{
  --bg:#f5f4ef; --bg2:#edece5; --panel:#ffffff; --panel2:#faf9f4;
  --ink:#1c1a16; --ink2:#6f6a60; --line:rgba(28,26,22,.12); --line2:rgba(28,26,22,.22);
  --accent:var(--tpl-accent,#7c6cff);
  --accent2: color-mix(in srgb, var(--accent) 60%, #4b3bd6);
  --accent-soft: color-mix(in srgb, var(--accent) 12%, transparent);
  --dark:#191722; --ok:#37c976;
  --script: "Segoe Script", "Bradley Hand", "Snell Roundhand", "Brush Script MT", "Comic Sans MS", cursive;
  --display: "Bricolage Grotesque", "Inter", ui-sans-serif, system-ui, sans-serif;
  --body: "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --r:16px;
  position:relative; isolation:isolate; background:var(--bg); color:var(--ink);
  font-family:var(--body); font-size:16px; line-height:1.62; -webkit-font-smoothing:antialiased;
  overflow-x:clip; min-height:100%; scroll-behavior:smooth;
  transition:background-color .4s ease, color .3s ease;
}
.art-root[data-theme="dark"]{
  --bg:#18171c; --bg2:#201e25; --panel:#242229; --panel2:#1d1b22;
  --ink:#f1efe9; --ink2:#a6a199; --line:rgba(255,255,255,.13); --line2:rgba(255,255,255,.22); --dark:#100f14;
}
.art-root *{ box-sizing:border-box; }
.art-root img{ max-width:100%; display:block; }
.art-root a{ color:inherit; }
.art-root h1,.art-root h2,.art-root h3,.art-root p,.art-root blockquote{ overflow-wrap:anywhere; }

/* paper grain */
.art-grain{ position:fixed; inset:0; z-index:0; pointer-events:none; opacity:.42; mix-blend-mode:multiply;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E"); }
.art-root[data-theme="dark"] .art-grain{ mix-blend-mode:overlay; opacity:.3; }
.art-root > *{ position:relative; z-index:1; }

.art-shell{ width:100%; max-width:1180px; margin-inline:auto; padding-inline:clamp(18px,4vw,40px); counter-reset:artsec; }

/* type */
.art-script{ font-family:var(--script); }
.art-h2{ font-family:var(--script); font-size:clamp(2rem,4.6vw,3.2rem); font-weight:400; line-height:1.02; margin:0 0 24px; }
.art-dot{ color:var(--accent); }
.art-lead{ color:var(--ink2); margin:0 0 14px; max-width:58ch; font-size:1.04rem; }
.art-muted{ color:var(--ink2); margin:6px 0 0; }
.art-small{ font-size:.85rem; }
.art-mt{ margin-top:20px; }
.art-clamp-2,.art-clamp-3{ display:-webkit-box; -webkit-box-orient:vertical; overflow:hidden; }
.art-clamp-2{ -webkit-line-clamp:2; } .art-clamp-3{ -webkit-line-clamp:3; }

/* paper cards (soft, aligned — no harsh colored offsets) */
.art-paper{ position:relative; background:var(--panel); border:1px solid var(--line); border-radius:var(--r);
  box-shadow:0 14px 30px -20px rgba(30,20,60,.35); transition:transform .25s cubic-bezier(.2,.8,.2,1), box-shadow .25s ease, border-color .25s ease, background .4s ease; }

/* buttons — clean, soft shadow (accent kept subtle) */
.art-btn{ display:inline-flex; align-items:center; gap:8px; padding:12px 22px; border-radius:999px;
  font-family:var(--body); font-weight:600; font-size:.94rem; text-decoration:none; cursor:pointer; border:1px solid transparent;
  transition:transform .18s ease, box-shadow .2s ease, background .2s, border-color .2s; }
.art-btn:focus-visible{ outline:2px solid var(--accent); outline-offset:3px; }
.art-btn-dark{ box-shadow:0 12px 24px -12px rgba(28,26,22,.55); }
.art-root[data-theme="light"] .art-btn-dark{ background:#18161c; color:#ffffff; }
.art-root[data-theme="dark"] .art-btn-dark{ background:#f2f0ea; color:#18161c; }
.art-btn-dark:hover{ transform:translateY(-2px); box-shadow:0 18px 32px -14px rgba(28,26,22,.6); }
.art-btn-ghost{ background:var(--panel); color:var(--ink); border-color:var(--line2); box-shadow:0 10px 22px -14px rgba(28,26,22,.4); }
.art-btn-ghost:hover{ transform:translateY(-2px); border-color:var(--accent); color:var(--accent); }
.art-btnrow{ display:flex; flex-wrap:wrap; gap:14px; margin-top:28px; }

.art-icbtn{ width:42px; height:42px; flex:0 0 auto; border-radius:50%; cursor:pointer; display:grid; place-items:center;
  background:var(--panel); border:1px solid var(--line2); color:var(--ink); box-shadow:0 6px 14px -8px rgba(28,26,22,.4);
  transition:transform .18s ease, box-shadow .18s ease, color .18s, border-color .18s; }
.art-icbtn:hover{ transform:translateY(-2px); color:var(--accent); border-color:var(--accent); }
.art-icbtn:focus-visible{ outline:2px solid var(--accent); outline-offset:2px; }
.art-icbtn-foot{ width:36px; height:36px; }

/* tilts */
.art-tilt-l{ transform:rotate(-1.4deg); } .art-tilt-r{ transform:rotate(1.4deg); }
.art-tilt-l:hover, .art-tilt-r:hover{ transform:rotate(0deg) translateY(-3px); }

/* reveal */
.art-root.art-anim-ready [data-reveal]{ opacity:0; transform:translateY(22px); transition:opacity .6s ease, transform .7s cubic-bezier(.2,.8,.2,1); }
.art-root.art-anim-ready [data-reveal].art-in{ opacity:1; transform:none; }

/* navbar */
.art-nav{ position:sticky; top:0; z-index:40; border-bottom:1px solid var(--line);
  background:color-mix(in srgb, var(--bg) 88%, transparent); backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px); }
.art-nav-in{ display:flex; align-items:center; gap:16px; min-height:66px; }
.art-brand{ display:flex; align-items:center; gap:8px; text-decoration:none; min-width:0; }
.art-brand-name{ font-size:1.7rem; line-height:1; }
.art-online{ width:9px; height:9px; border-radius:50%; background:var(--ok); box-shadow:0 0 8px color-mix(in srgb,var(--ok) 70%, transparent); flex:0 0 auto; }
.art-navlinks{ display:flex; gap:2px; margin-inline:auto; }
.art-navlinks a{ text-decoration:none; color:var(--ink2); font-size:.92rem; padding:8px 14px; border-radius:999px; transition:color .16s, background .16s; }
.art-navlinks a:hover{ color:var(--ink); background:var(--accent-soft); }
.art-nav-right{ display:flex; align-items:center; gap:8px; }
.art-nav-cta{ padding:9px 18px; }
.art-menu{ display:none; position:relative; }
.art-menu summary{ list-style:none; width:42px; height:42px; border-radius:50%; cursor:pointer; display:grid; place-items:center; gap:4px; border:1px solid var(--line2); }
.art-menu summary::-webkit-details-marker{ display:none; }
.art-menu summary span{ display:block; width:18px; height:2px; background:var(--ink); border-radius:2px; }
.art-menu ul{ position:absolute; right:0; top:52px; min-width:190px; list-style:none; margin:0; padding:8px; z-index:50; border:1px solid var(--line); border-radius:14px; background:var(--panel); box-shadow:0 18px 40px -18px rgba(28,26,22,.5); }
.art-menu ul a{ display:block; padding:9px 12px; border-radius:8px; text-decoration:none; color:var(--ink); font-size:.92rem; }
.art-menu ul a:hover{ background:var(--accent-soft); }

/* hero */
.art-hero{ display:grid; grid-template-columns:1.15fr .85fr; gap:clamp(24px,4vw,56px); align-items:center; padding-block:clamp(34px,6vw,72px); }
.art-eyebrow{ font-size:1.5rem; color:var(--ink2); display:inline-block; transform:rotate(-3deg); }
.art-hero-name{ font-size:clamp(3.6rem,10vw,6.4rem); font-weight:400; line-height:.92; margin:2px 0 0; }
.art-name-wrap{ position:relative; display:inline-block; padding:18px 8px 0; }
.art-crown{ position:absolute; top:-18px; right:8%; width:54px; height:36px; color:var(--accent); }
.art-underline{ position:absolute; left:-2%; bottom:-16px; width:104%; height:24px; color:var(--accent); opacity:.9; }
.art-hero-title{ font-family:var(--display); font-weight:700; font-size:clamp(1.3rem,3.4vw,1.9rem); margin:26px 0 0; }
.art-hero-intro{ color:var(--ink2); margin:16px 0 0; max-width:46ch; font-size:1.05rem; }
.art-hero-soc{ margin-top:24px; }

.art-hero-right{ display:flex; flex-direction:column; align-items:center; gap:16px; }
.art-portrait{ position:relative; width:min(340px,88%); background:var(--panel); padding:14px 14px 48px; border:1px solid var(--line);
  border-radius:6px; box-shadow:0 26px 50px -26px rgba(30,20,60,.5); }
.art-portrait .art-zoom, .art-portrait .art-zoom img{ width:100%; }
.art-portrait .art-zoom img{ aspect-ratio:4/5; object-fit:cover; filter:grayscale(.3) contrast(1.04); border-radius:3px; }
.art-portrait figcaption{ position:absolute; left:0; right:0; bottom:14px; text-align:center; font-size:1.2rem; color:var(--ink2); }
.art-portrait-ph{ width:100%; aspect-ratio:4/5; display:grid; place-items:center; font-family:var(--display); font-size:3.4rem; font-weight:700; color:#fff; border-radius:3px; background:linear-gradient(150deg,var(--accent),var(--accent2)); }
.art-oval{ position:absolute; top:-14px; right:-22px; padding:10px 18px; font-size:1.05rem; color:var(--ink); background:var(--panel); border:2.5px solid var(--accent); border-radius:50%/58%; transform:rotate(6deg); white-space:nowrap; box-shadow:0 8px 18px -12px rgba(30,20,60,.5); }
.art-star-hero{ position:absolute; bottom:-16px; left:-18px; width:40px; height:40px; color:var(--accent); }
.art-tag-note{ display:inline-block; font-size:1.15rem; color:var(--ink2); transform:rotate(-2deg); }
.art-star{ }

/* ---- EDITORIAL SECTION: margin + content, alternating sides ---- */
.art-section{ counter-increment:artsec; display:grid; grid-template-columns:186px 1fr; gap:clamp(20px,3vw,48px);
  padding-block:clamp(42px,6vw,78px); border-top:1px dashed var(--line); }
.art-section:nth-of-type(even){ grid-template-columns:1fr 186px; }
.art-section:nth-of-type(even) .art-margin{ order:2; text-align:right; align-items:flex-end; }
.art-margin{ display:flex; flex-direction:column; align-items:flex-start; gap:10px; position:sticky; top:92px; align-self:start; }
.art-num{ font-family:var(--script); font-size:3.4rem; line-height:.9; color:var(--accent); opacity:.9; }
.art-num::before{ content:counter(artsec, decimal-leading-zero); }
.art-mtag{ font-size:1.4rem; color:var(--ink); }
.art-mline{ width:46px; height:3px; border-radius:3px; background:var(--accent); opacity:.8; }
.art-section:nth-of-type(even) .art-mline{ align-self:flex-end; }
.art-content{ min-width:0; }

/* about */
.art-about{ display:grid; grid-template-columns:1.3fr .7fr; gap:clamp(20px,3vw,40px); align-items:center; }
.art-stats{ display:flex; flex-wrap:wrap; gap:28px; margin-top:24px; }
.art-stat{ display:flex; flex-direction:column; }
.art-stat b{ font-family:var(--display); font-size:2rem; color:var(--accent); line-height:1; }
.art-stat span{ font-family:var(--script); font-size:1.05rem; color:var(--ink2); margin-top:2px; }
.art-blob-frame{ width:100%; max-width:300px; justify-self:center; padding:12px; background:var(--panel); border:1px solid var(--line);
  border-radius:56% 44% 52% 48% / 48% 52% 46% 54%; overflow:hidden; box-shadow:0 20px 40px -22px rgba(30,20,60,.45); }
.art-blob-frame .art-zoom, .art-blob-frame .art-zoom img{ width:100%; }
.art-blob-frame .art-zoom img{ aspect-ratio:1/1; object-fit:cover; border-radius:52% 48% 48% 52% / 48% 52% 48% 52%; }

/* skills */
.art-skills{ display:grid; grid-template-columns:repeat(auto-fill,minmax(150px,1fr)); gap:16px; }
.art-skill{ padding:18px 14px; display:flex; flex-direction:column; align-items:center; text-align:center; gap:10px; }
.art-skill:hover{ transform:translateY(-4px); border-color:var(--accent); box-shadow:0 18px 34px -22px rgba(30,20,60,.5); }
.art-skill-ic{ width:52px; height:52px; border-radius:50%; display:grid; place-items:center; font-family:var(--display); font-weight:700; color:#fff; background:linear-gradient(150deg,var(--accent),var(--accent2)); }
.art-skill-name{ font-weight:600; font-size:.92rem; }
.art-skill-bar{ width:80%; height:6px; border-radius:99px; background:var(--line); overflow:hidden; }
.art-skill-fill{ display:block; height:100%; width:var(--pct); border-radius:99px; background:linear-gradient(90deg,var(--accent),var(--accent2)); transition:width 1.1s cubic-bezier(.2,.8,.2,1); }
.art-root.art-anim-ready .art-skill[data-bar] .art-skill-fill{ width:0; }
.art-root.art-anim-ready .art-skill[data-bar].art-in .art-skill-fill{ width:var(--pct); }

/* grids / cards */
.art-grid-4{ display:grid; grid-template-columns:repeat(2,1fr); gap:16px; }
.art-grid-3{ display:grid; grid-template-columns:repeat(2,1fr); gap:18px; }
.art-grid-2{ display:grid; grid-template-columns:repeat(2,1fr); gap:18px; }
.art-list{ display:flex; flex-direction:column; gap:14px; }
.art-card{ padding:22px; display:flex; flex-direction:column; gap:8px; text-decoration:none; color:inherit; }
.art-card:hover, .art-card-link:hover{ transform:translateY(-4px); border-color:var(--accent); box-shadow:0 20px 36px -22px rgba(30,20,60,.5); }
.art-card-hot{ background:color-mix(in srgb, var(--accent) 10%, var(--panel)); border-color:var(--accent); }
.art-card-top{ display:flex; align-items:center; justify-content:space-between; }
.art-card-ic{ width:44px; height:44px; display:grid; place-items:center; border-radius:12px; color:var(--accent); font-size:1.1rem; background:var(--accent-soft); }
.art-card-num{ color:var(--ink2); font-size:1.4rem; }
.art-card-title{ font-family:var(--display); font-size:1.12rem; font-weight:700; margin:6px 0 0; }
.art-card-foot{ display:flex; align-items:center; justify-content:space-between; gap:10px; margin-top:auto; padding-top:8px; flex-wrap:wrap; }
.art-card-foot-top{ margin-top:0; padding-top:0; align-items:baseline; }
.art-price{ color:var(--accent); font-size:.9rem; font-weight:600; }
.art-arrow{ color:var(--accent); font-weight:700; }
.art-listitem{ padding:18px 22px; text-decoration:none; color:inherit; }
.art-listitem:hover{ border-color:var(--accent); }

/* projects */
.art-proj{ padding:12px; display:flex; flex-direction:column; }
.art-proj-media{ position:relative; border-radius:8px; overflow:hidden; aspect-ratio:16/10; background:var(--panel2); border:1px solid var(--line); }
.art-proj-media .art-zoom, .art-proj-media .art-zoom img{ width:100%; height:100%; }
.art-proj-media .art-zoom img{ object-fit:cover; }
.art-proj-ph{ width:100%; height:100%; display:grid; place-items:center; font-family:var(--display); font-size:2rem; font-weight:700; color:#fff; background:linear-gradient(150deg,var(--accent),var(--accent2)); }
.art-badge{ position:absolute; top:8px; left:8px; padding:4px 10px; border-radius:999px; font-size:.68rem; font-weight:700; color:#fff; background:var(--accent); z-index:2; }
.art-proj-body{ padding:14px 8px 6px; display:flex; flex-direction:column; gap:6px; }
.art-linktext{ text-decoration:none; } .art-linktext:hover{ color:var(--accent); }
.art-tags{ display:flex; flex-wrap:wrap; gap:6px; margin-top:6px; }
.art-tag{ font-size:.74rem; padding:4px 12px; border:1px solid var(--line); border-radius:999px; color:var(--ink2); }

/* timeline */
.art-timeline{ display:flex; flex-direction:column; padding-left:6px; border-left:2px solid var(--line); }
.art-tl-item{ position:relative; display:grid; grid-template-columns:130px 1fr; gap:18px; padding:0 0 26px 20px; align-items:start; }
.art-tl-item:last-child{ padding-bottom:0; }
.art-tl-dot{ position:absolute; left:-11px; top:5px; width:14px; height:14px; border-radius:50%; background:var(--accent); border:3px solid var(--bg); box-shadow:0 0 0 2px var(--accent); }
.art-tl-date{ color:var(--accent); font-size:1.15rem; padding-top:2px; }
.art-tl-role{ font-family:var(--display); font-size:1.1rem; font-weight:700; margin:0; }

/* gallery / polaroid */
.art-gallery{ display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:24px; }
.art-polaroid{ background:var(--panel); padding:12px 12px 40px; border:1px solid var(--line); border-radius:4px; box-shadow:0 16px 32px -20px rgba(30,20,60,.45); position:relative; transition:transform .3s ease; }
.art-polaroid::before{ content:""; position:absolute; top:-10px; left:50%; transform:translateX(-50%) rotate(-4deg); width:60px; height:18px; background:rgba(240,224,140,.42); }
.art-root[data-theme="dark"] .art-polaroid::before{ background:rgba(240,224,140,.18); }
.art-polaroid .art-zoom, .art-polaroid .art-zoom img{ width:100%; }
.art-polaroid .art-zoom img{ aspect-ratio:1/1; object-fit:cover; border-radius:2px; }
.art-polaroid figcaption{ position:absolute; left:0; right:0; bottom:12px; text-align:center; font-family:var(--script); font-size:1.05rem; color:var(--ink2); }

/* videos */
.art-video{ padding:8px; }
.art-video-frame{ position:relative; aspect-ratio:16/9; border-radius:8px; overflow:hidden; background:#000; }
.art-video-frame iframe{ position:absolute; inset:0; width:100%; height:100%; border:0; }
.art-video figcaption{ padding:8px 4px 2px; }

/* zoom */
.art-zoom{ position:relative; display:block; padding:0; border:0; background:none; cursor:zoom-in; color:inherit; }
.art-zoom img{ transition:filter .3s ease, transform .4s ease; }
.art-zoom:hover img{ filter:none; }
.art-zoom:focus-visible{ outline:2px solid var(--accent); outline-offset:2px; }

/* testimonials */
.art-tgrid{ display:grid; grid-template-columns:repeat(2,1fr); gap:20px; }
.art-quote{ padding:24px; display:flex; flex-direction:column; gap:12px; }
.art-quote-mark{ color:var(--accent); font-size:3.2rem; line-height:.4; height:24px; }
.art-quote blockquote{ margin:0; font-size:1.02rem; }
.art-quote-by{ display:flex; align-items:center; gap:12px; margin-top:auto; }
.art-quote-by span{ display:flex; flex-direction:column; line-height:1.2; }
.art-quote-by b{ font-weight:700; font-size:.9rem; }
.art-quote-by em{ font-style:normal; font-size:.8rem; }
.art-avatar{ width:46px; height:46px; flex:0 0 auto; border-radius:50%; overflow:hidden; display:grid; place-items:center; font-weight:700; color:#fff; background:linear-gradient(150deg,var(--accent),var(--accent2)); }
.art-avatar img{ width:100%; height:100%; object-fit:cover; }

/* socials */
.art-socials{ display:flex; flex-wrap:wrap; gap:10px; }
.art-soc{ width:42px; height:42px; display:grid; place-items:center; border-radius:50%; border:1px solid var(--line2); color:var(--ink); text-decoration:none; box-shadow:0 6px 14px -10px rgba(28,26,22,.4); transition:transform .16s, color .16s, border-color .16s; }
.art-soc:hover{ color:var(--accent); border-color:var(--accent); transform:translateY(-2px); }
.art-soc svg{ width:17px; height:17px; }

/* contact */
.art-contact{ display:grid; grid-template-columns:.85fr 1.15fr; gap:clamp(24px,4vw,48px); align-items:start; }
.art-contact-rows{ display:flex; flex-direction:column; gap:12px; margin-bottom:20px; }
.art-crow{ display:flex; align-items:center; gap:12px; text-decoration:none; color:inherit; word-break:break-word; }
.art-crow span:first-child{ color:var(--accent); width:22px; text-align:center; flex:0 0 auto; font-size:1.1rem; }
.art-crow:hover{ color:var(--accent); }
.art-note-inline{ display:inline-block; margin-top:20px; }
.art-formcard{ padding:clamp(18px,2.6vw,30px); }
.art-formcard :where(input, textarea, select){ width:100%; font-family:var(--body); font-size:.95rem; color:var(--ink); background:var(--panel2); border:1px solid var(--line); border-radius:12px; padding:12px 14px; margin-bottom:12px; transition:border-color .16s; }
.art-formcard :where(input, textarea, select):focus{ outline:none; border-color:var(--accent); }
.art-formcard :where(input, textarea, select)::placeholder{ color:var(--ink2); }
.art-formcard textarea{ min-height:120px; resize:vertical; }
.art-formcard :where(button, [type="submit"]){ width:100%; font-family:var(--body); font-weight:700; cursor:pointer; border-radius:999px; padding:13px 18px; box-shadow:0 12px 24px -12px rgba(28,26,22,.5); transition:transform .18s, box-shadow .18s; }
.art-root[data-theme="light"] .art-formcard :where(button, [type="submit"]){ color:#ffffff; background:#18161c; border:1px solid #18161c; }
.art-root[data-theme="dark"] .art-formcard :where(button, [type="submit"]){ color:#18161c; background:#f2f0ea; border:1px solid #f2f0ea; }
.art-formcard :where(button, [type="submit"]):hover{ transform:translateY(-2px); box-shadow:0 18px 30px -14px rgba(28,26,22,.55); }
.art-formcard label{ color:var(--ink2); font-size:.84rem; }

/* footer */
.art-footer{ position:relative; margin-top:clamp(40px,6vw,72px); background:var(--dark); color:#f1efe9; }
.art-footer::before{ content:""; position:absolute; top:-13px; left:0; right:0; height:15px; background:var(--bg);
  clip-path:polygon(0 0,4% 70%,9% 22%,15% 78%,21% 32%,27% 74%,34% 26%,40% 82%,47% 36%,54% 76%,61% 24%,68% 80%,75% 34%,82% 74%,89% 26%,95% 78%,100% 32%,100% 0); }
.art-footer-in{ display:flex; align-items:center; justify-content:space-between; gap:20px; flex-wrap:wrap; padding-block:32px 26px; }
.art-brand-foot{ flex-direction:column; align-items:flex-start; gap:2px; }
.art-brand-foot .art-brand-name{ color:#fff; } .art-brand-sub{ font-size:.8rem; color:rgba(255,255,255,.55); }
.art-footer-nav{ display:flex; flex-wrap:wrap; gap:8px 18px; }
.art-footer-nav a{ text-decoration:none; color:rgba(255,255,255,.7); font-size:.9rem; }
.art-footer-nav a:hover{ color:var(--accent); }
.art-footer-right{ display:flex; flex-direction:column; align-items:flex-end; gap:12px; }
.art-footer-soc .art-soc{ border-color:rgba(255,255,255,.35); color:#fff; box-shadow:none; }
.art-footer-soc .art-soc:hover{ color:var(--accent); border-color:var(--accent); }
.art-footer-meta{ display:flex; align-items:center; gap:14px; color:rgba(255,255,255,.6); font-size:.84rem; flex-wrap:wrap; justify-content:flex-end; }
.art-footer-meta .art-icbtn{ background:transparent; border-color:rgba(255,255,255,.35); color:#fff; box-shadow:none; }
.art-madewith{ text-decoration:none; color:rgba(255,255,255,.6); } .art-madewith b{ color:var(--accent); }

/* lightbox */
.art-lb{ position:fixed; inset:0; z-index:1000; display:grid; place-items:center; padding:clamp(16px,4vw,48px); background:rgba(20,18,24,.82); backdrop-filter:blur(6px); -webkit-backdrop-filter:blur(6px); animation:art-fade .2s ease both; }
.art-lb-fig{ margin:0; max-width:94vw; max-height:92vh; display:flex; flex-direction:column; gap:10px; align-items:center; animation:art-pop .3s cubic-bezier(.2,.8,.2,1) both; }
.art-lb-fig img{ max-width:92vw; max-height:84vh; width:auto; height:auto; object-fit:contain; background:#fff; padding:10px; border-radius:4px; box-shadow:0 30px 70px -20px rgba(0,0,0,.7); }
.art-lb-fig figcaption{ color:#f1efe9; font-family:var(--script); font-size:1.1rem; text-align:center; }
.art-lb-close{ position:fixed; top:18px; right:18px; z-index:1001; width:46px; height:46px; border-radius:50%; cursor:pointer; color:#fff; background:rgba(255,255,255,.12); border:1px solid rgba(255,255,255,.3); font-size:1.1rem; transition:background .18s, transform .18s; }
.art-lb-close:hover{ background:var(--accent); border-color:var(--accent); transform:rotate(90deg); }
.art-lb-close:focus-visible{ outline:2px solid #fff; outline-offset:2px; }
@keyframes art-fade{ from{opacity:0;} to{opacity:1;} }
@keyframes art-pop{ from{opacity:0; transform:scale(.94);} to{opacity:1; transform:none;} }

/* responsive */
@media (min-width:1000px){ .art-grid-4{ grid-template-columns:repeat(4,1fr); } .art-grid-3{ grid-template-columns:repeat(3,1fr); } }
@media (max-width:940px){
  .art-hero{ grid-template-columns:1fr; }
  .art-hero-right{ order:-1; }
  .art-navlinks{ display:none; } .art-menu{ display:block; }
  .art-section, .art-section:nth-of-type(even){ grid-template-columns:1fr; gap:16px; }
  .art-section:nth-of-type(even) .art-margin{ order:0; text-align:left; align-items:flex-start; }
  .art-section:nth-of-type(even) .art-mline{ align-self:flex-start; }
  .art-margin{ position:static; flex-direction:row; align-items:baseline; gap:14px; }
  .art-num{ font-size:2.4rem; }
  .art-mline{ display:none; }
  .art-about{ grid-template-columns:1fr; }
  .art-contact{ grid-template-columns:1fr; }
  .art-tgrid{ display:flex; overflow-x:auto; gap:16px; scroll-snap-type:x mandatory; padding-bottom:8px; margin-inline:calc(-1 * clamp(18px,4vw,40px)); padding-inline:clamp(18px,4vw,40px); }
  .art-tgrid .art-quote{ flex:0 0 84%; scroll-snap-align:start; }
}
@media (max-width:680px){
  .art-grid-2{ grid-template-columns:1fr; }
  .art-tl-item{ grid-template-columns:1fr; gap:6px; }
  .art-footer-right{ align-items:flex-start; }
  .art-nav-cta{ display:none; }
}
@media (max-width:520px){ .art-grid-4, .art-grid-3{ grid-template-columns:1fr; } }

@media (prefers-reduced-motion: reduce){
  .art-root{ scroll-behavior:auto; }
  .art-root *{ animation:none !important; transition:none !important; }
  .art-tilt-l, .art-tilt-r{ transform:none; }
}
`;
