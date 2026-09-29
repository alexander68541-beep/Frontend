"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import type { PublicPortfolio } from "@/lib/publicTypes";
import { dateRange, videoEmbed, ext } from "@/lib/publicTypes";
import { ContactForm } from "@/components/ContactForm";

/* =====================================================================
   JournalTemplate — "Journal" — a cute pastel notebook / bullet-journal
   portfolio: spiral-bound lined paper, sticker cards, kawaii doodles,
   bubbly hand-lettered headings, gentle bouncy pop-in on scroll.
   PURE PRESENTATION from `data`. Prefixed `.nb-`.
   ===================================================================== */

const DEFAULT_ORDER = [
  "about", "projects", "skills", "services", "experience",
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
  return (parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : src.slice(0, 2)).toUpperCase();
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

const PASTEL = ["#c9b8f2", "#f7b8d2", "#ffd28a", "#a7e0c0", "#a8d4f5", "#f6b9a0", "#d9c2f0"];
const pastel = (i: number) => PASTEL[((i % PASTEL.length) + PASTEL.length) % PASTEL.length];

/* ---- social brand icons (auto-detected) ---- */
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

/* ---- kawaii doodles ---- */
function DCloud({ c }: { c?: string }) { return (<svg className="nb-doodle" viewBox="0 0 64 40" aria-hidden><path d="M18 34c-8 0-13-6-13-12S11 12 17 12c1-6 7-9 12-7 3-3 9-2 11 2 7-1 12 4 12 10 5 0 8 4 8 8 0 5-4 9-9 9H18z" fill={c || "#cfe2fb"} stroke="#7c8db0" strokeWidth="2" strokeLinejoin="round" /></svg>); }
function DStar({ c }: { c?: string }) { return (<svg className="nb-doodle" viewBox="0 0 40 40" aria-hidden><path d="M20 3l4.5 10.5L36 15l-8.5 7.5L30 34l-10-6-10 6 2.5-11.5L4 15l11.5-1.5z" fill={c || "#ffe08a"} stroke="#d9a94b" strokeWidth="2" strokeLinejoin="round" /></svg>); }
function DSpark({ c }: { c?: string }) { return (<svg className="nb-doodle" viewBox="0 0 30 30" aria-hidden><path d="M15 2c1 6 6 11 12 13-6 2-11 7-12 13-1-6-6-11-12-13 6-2 11-7 12-13z" fill={c || "#f7b8d2"} /></svg>); }
function DPencil() { return (<svg className="nb-doodle" viewBox="0 0 44 44" aria-hidden><g transform="rotate(35 22 22)"><rect x="18" y="4" width="8" height="28" rx="2" fill="#c9b8f2" stroke="#7c6cae" strokeWidth="2" /><path d="M18 32l4 8 4-8z" fill="#f6d7a0" stroke="#7c6cae" strokeWidth="2" strokeLinejoin="round" /><path d="M21 37l2 4 1-4z" fill="#3a3a3a" /><rect x="18" y="4" width="8" height="5" rx="2" fill="#f7b8d2" stroke="#7c6cae" strokeWidth="2" /></g></svg>); }
function DPlant() { return (<svg className="nb-doodle" viewBox="0 0 44 48" aria-hidden><path d="M22 26c-6-2-10-8-9-16 6 1 10 6 9 16z" fill="#a7e0c0" stroke="#5aa17e" strokeWidth="2" /><path d="M22 26c6-2 9-6 8-13-5 1-9 5-8 13z" fill="#8fd4b0" stroke="#5aa17e" strokeWidth="2" /><path d="M14 28h16l-2 16H16z" fill="#f6c9a0" stroke="#c78b57" strokeWidth="2" strokeLinejoin="round" /><path d="M13 28h18v4H13z" fill="#f6b9a0" stroke="#c78b57" strokeWidth="2" /></svg>); }
function DLaptop() { return (<svg className="nb-laptop" viewBox="0 0 90 66" aria-hidden><rect x="14" y="8" width="62" height="42" rx="6" fill="#dfe6f2" stroke="#6b7690" strokeWidth="2.5" /><rect x="20" y="14" width="50" height="30" rx="3" fill="#eef3fb" /><circle cx="38" cy="27" r="2.2" fill="#6b7690" /><circle cx="52" cy="27" r="2.2" fill="#6b7690" /><path d="M40 33q5 4 10 0" fill="none" stroke="#f39ab0" strokeWidth="2.2" strokeLinecap="round" /><circle cx="33" cy="31" r="2.4" fill="#f7b8d2" opacity=".7" /><circle cx="57" cy="31" r="2.4" fill="#f7b8d2" opacity=".7" /><path d="M8 50h74l-6 10H14z" fill="#c9d3e6" stroke="#6b7690" strokeWidth="2.5" strokeLinejoin="round" /></svg>); }

/* ------------------------------ component ------------------------------ */

export function JournalTemplate({ data }: { data: PublicPortfolio }) {
  const p = data.profile;
  const accent = data.accent || "#c9b8f2";

  const hidden = new Set(data.settings?.hidden ?? []);
  const sv = (k: string) => !hidden.has(k);
  const username = data.username;
  const name = p?.display_name || username || "Your Name";
  const handle = username ? `@${username}` : `@${(name.split(/\s+/)[0] || "me").toLowerCase()}`;

  const [lb, setLb] = useState<{ src: string; alt: string; cap?: string } | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const openLb = useCallback((src: string, alt: string, cap?: string) => setLb({ src, alt, cap }), []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    root.classList.add("nb-ready");
    const reduce = typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const targets = root.querySelectorAll("[data-reveal]");
    if (reduce || typeof IntersectionObserver === "undefined") { targets.forEach((el) => el.classList.add("nb-in")); return; }
    const io = new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("nb-in"); io.unobserve(e.target); } }), { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
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
    projects: sv("projects") && data.projects.length > 0,
    skills: sv("skills") && data.skills.length > 0,
    services: sv("services") && data.services.length > 0,
    contact: !!username,
  };
  const LEN: Record<string, number> = {
    projects: data.projects.length, skills: data.skills.length, services: data.services.length,
    experience: data.experience.length, education: data.education.length, certifications: data.certifications.length,
    achievements: data.achievements.length, publications: data.publications.length, gallery: data.gallery.length,
    videos: data.videos.length, testimonials: data.testimonials.length,
  };
  const panelHas = (k: string) => (k === "about" ? has.about : sv(k) && (LEN[k] ?? 0) > 0);
  const order = resolveOrder(data.settings).filter(panelHas);

  const ZImg = useCallback(({ src, alt, cap, className }: { src: string; alt: string; cap?: string; className?: string }) => (
    <button type="button" className={`nb-zoom ${className || ""}`} onClick={() => openLb(src, alt, cap)} aria-label={alt ? `View image: ${alt}` : "View image"}>
      <img className="nb-zoom-bg" src={src} alt="" aria-hidden loading="lazy" />
      <img className="nb-zoom-img" src={src} alt={alt} loading="lazy" />
    </button>
  ), [openLb]);

  const socialRow = (extra?: string) =>
    data.links.length > 0 ? (
      <div className={`nb-socials ${extra || ""}`}>
        {data.links.map((l, i) => (<a key={l.id} className="nb-soc" href={ext(l.url)} target="_blank" rel="noopener noreferrer" aria-label={l.label || l.platform} title={l.label || l.platform} style={{ ["--pc" as string]: pastel(i) } as CSSProperties}><SocialIcon name={detectSocial(l.platform, l.url, l.label)} /></a>))}
      </div>
    ) : null;

  const LABEL: Record<string, string> = {
    about: "about me ♡", projects: "my projects", skills: "my toolkit", services: "what i do",
    experience: "my journey", education: "my studies", certifications: "certificates", achievements: "little wins",
    publications: "my writing", gallery: "photo wall", videos: "watch me", testimonials: "kind words",
  };

  const sections: Record<string, (n: number) => ReactNode> = {
    about: (n) => {
      const aboutText = p?.about ?? p?.bio ?? null;
      const photo = data.gallery.find((g) => g.image_url)?.image_url || p?.avatar_url || null;
      return (
        <article className="nb-sticker nb-tilt-a">
          <span className="nb-num" style={{ ["--pc" as string]: pastel(n) } as CSSProperties}>{n}</span>
          <span className="nb-label">{LABEL.about}</span>
          <div className="nb-about">
            {photo && <div className="nb-polaroid nb-tilt-b"><ZImg src={photo} alt={name} /><span className="nb-tape" aria-hidden /></div>}
            <div className="nb-about-txt">{aboutText && aboutText.split(/\n{2,}/).slice(0, 2).map((para, i) => <p key={i}>{para}</p>)}{p?.resume_url && <a className="nb-btn" href={ext(p.resume_url)} target="_blank" rel="noopener noreferrer" style={{ ["--pc" as string]: pastel(n + 1) } as CSSProperties}>my résumé ↗</a>}</div>
          </div>
        </article>
      );
    },
    projects: (n) => {
      const ordered = [...data.projects].sort((a, b) => Number(!!b.is_featured) - Number(!!a.is_featured));
      return (
        <article className="nb-sticker nb-tilt-b">
          <span className="nb-num" style={{ ["--pc" as string]: pastel(n) } as CSSProperties}>{n}</span>
          <span className="nb-label">{LABEL.projects}</span>
          <div className="nb-masonry">
            {ordered.map((pr, i) => (
              <figure key={pr.id} className={`nb-polaroid ${i % 2 ? "nb-tilt-a" : "nb-tilt-b"}`} style={{ ["--pc" as string]: pastel(i) } as CSSProperties}>
                {pr.image_url ? <ZImg src={pr.image_url} alt={pr.title || "Project"} cap={pr.title || undefined} /> : <div className="nb-ph" aria-hidden>{initials(pr.title, "P")}</div>}
                <figcaption>{pr.url ? <a href={ext(pr.url)} target="_blank" rel="noopener noreferrer">{pr.title || "untitled"} ↗</a> : (pr.title || "untitled")}{(pr.role || (pr.tags && pr.tags[0])) && <em>{pr.role || pr.tags[0]}</em>}</figcaption>
              </figure>
            ))}
          </div>
        </article>
      );
    },
    skills: (n) => {
      const sorted = [...data.skills].sort((a, b) => (a.category || "").localeCompare(b.category || ""));
      return (
        <article className="nb-sticker nb-tilt-a">
          <span className="nb-num" style={{ ["--pc" as string]: pastel(n) } as CSSProperties}>{n}</span>
          <span className="nb-label">{LABEL.skills}</span>
          <div className="nb-pills">
            {sorted.map((s, i) => { const lvl = levelPct(s.level); return (<span key={s.id} className="nb-pill" style={{ ["--pc" as string]: pastel(i) } as CSSProperties}>{s.name}{lvl != null && <b>{Math.round(lvl)}%</b>}</span>); })}
          </div>
        </article>
      );
    },
    services: (n) => (
      <article className="nb-sticker nb-tilt-b nb-feat-card">
        <span className="nb-num" style={{ ["--pc" as string]: pastel(n) } as CSSProperties}>{n}</span>
        <span className="nb-label">{LABEL.services}</span>
        <div className="nb-feat-wrap">
          <ul className="nb-feats">
            {data.services.map((s, i) => (<li key={s.id}><span className="nb-bullet" style={{ background: pastel(i) }} aria-hidden /><div><b>{s.title}</b>{s.description && <span className="nb-feat-desc">{s.description}</span>}{s.price && <span className="nb-price">{s.price}</span>}</div></li>))}
          </ul>
          <div className="nb-feat-doodle" aria-hidden>
            <DLaptop />
            <span className="nb-bubble">{p?.tagline ? p.tagline.slice(0, 40) : "Keep coding, keep growing!"}</span>
          </div>
        </div>
      </article>
    ),
    experience: (n) => (
      <article className="nb-sticker nb-tilt-a">
        <span className="nb-num" style={{ ["--pc" as string]: pastel(n) } as CSSProperties}>{n}</span>
        <span className="nb-label">{LABEL.experience}</span>
        <div className="nb-time">
          {data.experience.map((e, i) => (<div key={e.id} className="nb-time-row"><span className="nb-dot2" style={{ background: pastel(i) }} aria-hidden /><span className="nb-time-date">{dateRange(e.start_date, e.end_date, e.is_current)}</span><div><b>{e.title || e.company || "Role"}</b><span className="nb-feat-desc">{[e.company, e.location].filter(Boolean).join(" · ")}</span>{e.description && <p>{e.description}</p>}</div></div>))}
        </div>
      </article>
    ),
    education: (n) => (
      <article className="nb-sticker nb-tilt-b">
        <span className="nb-num" style={{ ["--pc" as string]: pastel(n) } as CSSProperties}>{n}</span>
        <span className="nb-label">{LABEL.education}</span>
        <div className="nb-grid2">
          {data.education.map((ed, i) => (<div key={ed.id} className="nb-mini" style={{ ["--pc" as string]: pastel(i) } as CSSProperties}><div className="nb-mini-top"><b>{ed.school || "School"}</b><span className="nb-chip">{dateRange(ed.start_date, ed.end_date)}</span></div>{(ed.degree || ed.field) && <p>{[ed.degree, ed.field].filter(Boolean).join(", ")}</p>}{ed.description && <p className="nb-feat-desc">{ed.description}</p>}</div>))}
        </div>
      </article>
    ),
    certifications: (n) => (
      <article className="nb-sticker nb-tilt-a">
        <span className="nb-num" style={{ ["--pc" as string]: pastel(n) } as CSSProperties}>{n}</span>
        <span className="nb-label">{LABEL.certifications}</span>
        <div className="nb-grid2">
          {data.certifications.map((c, i) => { const body = (<><div className="nb-mini-top"><b>{c.name}</b>{oneDate(c.issue_date) && <span className="nb-chip">{oneDate(c.issue_date)}</span>}</div>{c.issuer && <p className="nb-feat-desc">{c.issuer}</p>}</>); return c.url ? <a key={c.id} className="nb-mini nb-mini-link" style={{ ["--pc" as string]: pastel(i) } as CSSProperties} href={ext(c.url)} target="_blank" rel="noopener noreferrer">{body}</a> : <div key={c.id} className="nb-mini" style={{ ["--pc" as string]: pastel(i) } as CSSProperties}>{body}</div>; })}
        </div>
      </article>
    ),
    achievements: (n) => (
      <article className="nb-sticker nb-tilt-b">
        <span className="nb-num" style={{ ["--pc" as string]: pastel(n) } as CSSProperties}>{n}</span>
        <span className="nb-label">{LABEL.achievements}</span>
        <ul className="nb-feats">
          {data.achievements.map((a, i) => (<li key={a.id}><span className="nb-bullet" style={{ background: pastel(i) }} aria-hidden /><div><b>{a.title}</b>{oneDate(a.date) && <span className="nb-chip">{oneDate(a.date)}</span>}{a.description && <span className="nb-feat-desc">{a.description}</span>}</div></li>))}
        </ul>
      </article>
    ),
    publications: (n) => (
      <article className="nb-sticker nb-tilt-a">
        <span className="nb-num" style={{ ["--pc" as string]: pastel(n) } as CSSProperties}>{n}</span>
        <span className="nb-label">{LABEL.publications}</span>
        <ul className="nb-feats">
          {data.publications.map((pub, i) => { const meta = [pub.publisher, oneDate(pub.date)].filter(Boolean).join(" · "); const inner = (<div><b>{pub.title}{pub.url && " ↗"}</b>{meta && <span className="nb-feat-desc">{meta}</span>}{pub.description && <span className="nb-feat-desc">{pub.description}</span>}</div>); return (<li key={pub.id}><span className="nb-bullet" style={{ background: pastel(i) }} aria-hidden />{pub.url ? <a className="nb-plainlink" href={ext(pub.url)} target="_blank" rel="noopener noreferrer">{inner}</a> : inner}</li>); })}
        </ul>
      </article>
    ),
    gallery: (n) => (
      <article className="nb-sticker nb-tilt-b">
        <span className="nb-num" style={{ ["--pc" as string]: pastel(n) } as CSSProperties}>{n}</span>
        <span className="nb-label">{LABEL.gallery}</span>
        <div className="nb-masonry">
          {data.gallery.map((g, i) => g.image_url ? (<figure key={g.id} className={`nb-polaroid ${i % 2 ? "nb-tilt-a" : "nb-tilt-b"}`}><ZImg src={g.image_url} alt={g.caption || "Photo"} cap={g.caption || undefined} />{g.caption && <figcaption>{g.caption}</figcaption>}</figure>) : null)}
        </div>
      </article>
    ),
    videos: (n) => (
      <article className="nb-sticker nb-tilt-a">
        <span className="nb-num" style={{ ["--pc" as string]: pastel(n) } as CSSProperties}>{n}</span>
        <span className="nb-label">{LABEL.videos}</span>
        <div className="nb-grid2">
          {data.videos.map((v) => { const src = v.url ? videoEmbed(v.url) : null; if (!src) return null; return (<figure key={v.id} className="nb-video"><div className="nb-video-frame"><iframe src={src} title={v.title || "Video"} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div>{v.title && <figcaption>{v.title}</figcaption>}</figure>); })}
        </div>
      </article>
    ),
    testimonials: (n) => (
      <article className="nb-sticker nb-tilt-b">
        <span className="nb-num" style={{ ["--pc" as string]: pastel(n) } as CSSProperties}>{n}</span>
        <span className="nb-label">{LABEL.testimonials}</span>
        <div className="nb-grid2">
          {data.testimonials.map((t, i) => (<figure key={t.id} className="nb-quote" style={{ ["--pc" as string]: pastel(i) } as CSSProperties}>{t.quote && <blockquote>“{t.quote}”</blockquote>}<figcaption><span className="nb-av" aria-hidden>{t.avatar_url ? <img src={t.avatar_url} alt="" loading="lazy" /> : initials(t.author, "♡")}</span><span>{t.author && <b>{t.author}</b>}{t.role && <em>{t.role}</em>}</span></figcaption></figure>))}
        </div>
      </article>
    ),
  };

  let n = 0;
  const numbered = order.map((k) => { n += 1; return { k, n }; });
  const contactNum = n + 1;

  return (
    <div ref={rootRef} className="nb-root" data-theme="journal" style={{ ["--tpl-accent" as string]: accent } as CSSProperties}>
      <style dangerouslySetInnerHTML={{ __html: NB_CSS }} />

      <div className="nb-page">
        <div className="nb-spiral" aria-hidden />
        <div className="nb-page-in">

          {/* HEADER */}
          <header className="nb-head" id="top">
            <span className="nb-handle">{handle}</span>
            <div className="nb-doodles-top" aria-hidden><DCloud /><DStar c="#ffe08a" /><DSpark c="#a8d4f5" /></div>
            <h1 className="nb-title" aria-label={name}>
              {name.split("").map((ch, i) => ch === " " ? <span key={i} className="nb-space">&nbsp;</span> : <span key={i} className="nb-letter" style={{ color: pastel(i) }}>{ch}</span>)}
            </h1>
            {p?.title && <p className="nb-subtitle">{p.title}</p>}
            {(p?.tagline || p?.bio) && <p className="nb-intro">{p?.tagline || p?.bio}</p>}
            <div className="nb-head-row">
              {socialRow("nb-head-soc")}
              {(p?.location || p?.availability) && <span className="nb-avail">{[p?.location, p?.availability].filter(Boolean).join(" · ")} ✿</span>}
            </div>
          </header>

          {/* NUMBERED STICKER SECTIONS */}
          {numbered.map(({ k, n }) => (
            <div key={k} id={k === "projects" ? "work" : k} data-reveal className="nb-reveal">{sections[k] ? sections[k](n) : null}</div>
          ))}

          {/* CONTACT */}
          {username && (
            <div id="contact" data-reveal className="nb-reveal">
              <article className="nb-sticker nb-tilt-a">
                <span className="nb-num" style={{ ["--pc" as string]: pastel(contactNum) } as CSSProperties}>{contactNum}</span>
                <span className="nb-label">say hi ✉</span>
                <div className="nb-contact">
                  <div className="nb-contact-left">
                    {p?.email && <a className="nb-crow" href={`mailto:${p.email}`}><span aria-hidden>✿</span>{p.email}</a>}
                    {p?.phone && <a className="nb-crow" href={`tel:${p.phone}`}><span aria-hidden>✿</span>{p.phone}</a>}
                    {p?.website && <a className="nb-crow" href={ext(p.website)} target="_blank" rel="noopener noreferrer"><span aria-hidden>✿</span>{p.website.replace(/^https?:\/\//, "")}</a>}
                    {p?.location && <span className="nb-crow"><span aria-hidden>✿</span>{p.location}</span>}
                    {socialRow()}
                  </div>
                  <div className="nb-formcard"><ContactForm username={username} /></div>
                </div>
              </article>
            </div>
          )}

          {/* FOOTER */}
          <footer className="nb-foot">
            <div className="nb-foot-doodles" aria-hidden><DPencil /><DPlant /><DStar c="#f7b8d2" /></div>
            <span className="nb-foot-name">{handle}</span>
            <span className="nb-foot-copy">© {new Date().getFullYear()} {name}{!data.hide_branding && <> · <a className="nb-madewith" href="https://folio.assetprim.com" target="_blank" rel="noopener noreferrer">made with Folio ♡</a></>}</span>
          </footer>
        </div>
      </div>

      {/* LIGHTBOX */}
      {lb && (
        <div className="nb-lb" role="dialog" aria-modal="true" aria-label="Image viewer" onClick={() => setLb(null)}>
          <div className="nb-lb-card" onClick={(e) => e.stopPropagation()}>
            <button ref={closeRef} type="button" className="nb-lb-close" onClick={() => setLb(null)} aria-label="Close image viewer">✕</button>
            <figure className="nb-lb-fig"><img src={lb.src} alt={lb.alt} />{lb.cap && <figcaption>{lb.cap}</figcaption>}</figure>
          </div>
        </div>
      )}
    </div>
  );
}

export default JournalTemplate;

/* =====================================================================
   STYLES — cute pastel notebook. Prefixed `.nb-`, scoped under `.nb-root`.
   ===================================================================== */

const NB_CSS = `
.nb-root{
  --acc:var(--tpl-accent,#c9b8f2);
  --ink:#544b6e; --ink2:#8a83a3; --paper:#fffdf8;
  --line:#cfe0ef; --pink:#f4b8c8;
  --display:"Comic Sans MS","Chalkboard SE","Comic Neue",ui-rounded,"Segoe UI",system-ui,sans-serif;
  --body:ui-rounded,"Nunito","Quicksand","Segoe UI",system-ui,-apple-system,sans-serif;
  position:relative; isolation:isolate; color:var(--ink); font-family:var(--body); font-size:16px; line-height:1.6;
  -webkit-font-smoothing:antialiased; overflow-x:clip; min-height:100%; scroll-behavior:smooth; font-weight:600;
  background:
    radial-gradient(70% 50% at 20% 0%, #ffe7f0, transparent 60%),
    radial-gradient(70% 50% at 90% 20%, #e5e0ff, transparent 60%),
    linear-gradient(160deg, #fbe6ef, #e8e2fb 45%, #e0f0f6);
}
.nb-root *{ box-sizing:border-box; }
.nb-root img{ max-width:100%; display:block; }
.nb-root a{ color:inherit; }
.nb-root h1,.nb-root h2,.nb-root h3,.nb-root p,.nb-root blockquote{ overflow-wrap:anywhere; }

/* notebook page */
.nb-page{ position:relative; width:100%; max-width:840px; margin:clamp(18px,4vw,54px) auto; z-index:1;
  background:var(--paper); border:2px solid #efe4d6; border-radius:20px;
  box-shadow:0 40px 80px -30px rgba(120,100,170,.5);
  background-image:repeating-linear-gradient(var(--paper) 0 31px, var(--line) 31px 32px);
  background-position:0 84px; }
.nb-spiral{ position:absolute; left:-13px; top:34px; bottom:34px; width:28px; z-index:3; pointer-events:none;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='30'%3E%3Cellipse cx='14' cy='15' rx='12' ry='6.5' fill='none' stroke='%233a3a42' stroke-width='3'/%3E%3C/svg%3E");
  background-size:28px 30px; background-repeat:repeat-y; filter:drop-shadow(1px 1px 0 rgba(0,0,0,.15)); }
.nb-page-in{ position:relative; padding:clamp(22px,5vw,50px) clamp(18px,5vw,50px) clamp(24px,5vw,48px) clamp(52px,8vw,84px); }
.nb-page-in::before{ content:""; position:absolute; left:clamp(40px,6.5vw,68px); top:0; bottom:0; width:2px; background:var(--pink); opacity:.7; }

/* pop-in reveal (cute bounce) */
.nb-root.nb-ready [data-reveal]{ opacity:0; transform:translateY(34px) scale(.96); transition:opacity .5s ease, transform .6s cubic-bezier(.34,1.4,.5,1); will-change:opacity, transform; }
.nb-root.nb-ready [data-reveal].nb-in{ opacity:1; transform:none; }

/* doodles */
.nb-doodle{ display:inline-block; }
.nb-doodles-top{ position:absolute; right:8px; top:0; display:flex; gap:8px; align-items:center; }
.nb-doodles-top .nb-doodle{ width:34px; height:auto; }
.nb-doodles-top .nb-doodle:first-child{ width:52px; }

/* header */
.nb-head{ position:relative; text-align:center; padding-bottom:14px; margin-bottom:20px; }
.nb-handle{ display:inline-block; font-family:var(--display); font-size:1rem; color:var(--ink2); border-bottom:2px solid var(--acc); padding-bottom:2px; }
.nb-title{ font-family:var(--display); font-weight:800; font-size:clamp(2.2rem,7vw,3.6rem); line-height:1.05; letter-spacing:.01em; margin:14px 0 0; }
.nb-letter{ display:inline-block; text-shadow:1px 1px 0 #fff, -1px 1px 0 #fff, 1px -1px 0 #fff, -1px -1px 0 #fff, 2px 3px 0 rgba(120,100,170,.22); }
.nb-space{ display:inline-block; width:.35em; }
.nb-subtitle{ font-family:var(--display); font-size:clamp(1.1rem,3vw,1.5rem); color:var(--acc); margin:8px 0 0; }
.nb-intro{ color:var(--ink2); margin:12px auto 0; max-width:52ch; }
.nb-head-row{ display:flex; align-items:center; justify-content:center; gap:14px; flex-wrap:wrap; margin-top:18px; }
.nb-avail{ font-family:var(--display); font-size:.9rem; color:var(--ink2); }

/* sticker cards */
.nb-sticker{ position:relative; background:#fff; border:2px solid #efe6dd; border-radius:20px; padding:clamp(20px,3vw,30px) clamp(18px,3vw,26px);
  box-shadow:3px 5px 0 rgba(120,100,170,.12), 0 16px 30px -18px rgba(120,100,170,.4); margin:34px 0; transition:transform .2s ease, box-shadow .2s ease; }
.nb-tilt-a{ transform:rotate(-1deg); } .nb-tilt-b{ transform:rotate(1deg); }
.nb-sticker:hover{ transform:rotate(0deg) translateY(-3px); box-shadow:4px 7px 0 rgba(120,100,170,.14), 0 22px 40px -20px rgba(120,100,170,.5); }
.nb-num{ position:absolute; top:-16px; left:-10px; width:38px; height:38px; display:grid; place-items:center; border-radius:50%;
  font-family:var(--display); font-weight:800; font-size:1.1rem; color:#fff; background:var(--pc,#c9b8f2); border:3px solid #fff;
  box-shadow:0 6px 14px -6px rgba(120,100,170,.6); }
.nb-label{ display:inline-block; font-family:var(--display); font-size:1.35rem; color:var(--ink); margin-bottom:16px; }
.nb-label::after{ content:""; display:block; height:6px; margin-top:2px; border-radius:6px; background:color-mix(in srgb, var(--acc) 60%, #fff); width:70%; }

/* buttons / pills / chips */
.nb-btn{ display:inline-flex; align-items:center; gap:6px; margin-top:14px; padding:9px 18px; border-radius:999px; text-decoration:none;
  font-family:var(--display); font-size:.92rem; color:var(--ink); background:var(--pc,#c9b8f2); border:2px solid #fff; box-shadow:2px 3px 0 rgba(120,100,170,.3); transition:transform .14s; }
.nb-btn:hover{ transform:translateY(-2px); }
.nb-pills{ display:flex; flex-wrap:wrap; gap:10px; }
.nb-pill{ display:inline-flex; align-items:center; gap:8px; padding:9px 16px; border-radius:999px; font-family:var(--display); font-size:.92rem; color:#5a5175;
  background:var(--pc,#c9b8f2); border:2px solid rgba(255,255,255,.85); box-shadow:2px 3px 0 rgba(120,100,170,.22); transition:transform .14s; }
.nb-pill:hover{ transform:translateY(-2px) rotate(-1deg); }
.nb-pill b{ font-weight:700; font-size:.74rem; opacity:.7; }
.nb-chip{ font-family:var(--display); font-size:.78rem; color:var(--ink2); background:#f3eefb; border-radius:999px; padding:2px 10px; }

/* about */
.nb-about{ display:flex; gap:20px; align-items:flex-start; flex-wrap:wrap; }
.nb-about-txt{ flex:1; min-width:200px; }
.nb-about-txt p{ margin:0 0 10px; color:var(--ink2); }

/* polaroid / masonry */
.nb-polaroid{ position:relative; background:#fff; padding:8px 8px 30px; border-radius:8px; box-shadow:2px 4px 10px -3px rgba(120,100,170,.4); }
.nb-polaroid .nb-zoom{ width:100%; border-radius:4px; overflow:hidden; }
.nb-about .nb-polaroid{ width:180px; flex:0 0 auto; }
.nb-about .nb-polaroid .nb-zoom{ aspect-ratio:4/5; }
.nb-polaroid figcaption{ position:absolute; left:0; right:0; bottom:7px; text-align:center; font-family:var(--display); font-size:.82rem; color:var(--ink2); padding:0 6px; }
.nb-polaroid figcaption a{ text-decoration:none; } .nb-polaroid figcaption a:hover{ color:var(--acc); }
.nb-polaroid figcaption em{ display:block; font-style:normal; font-size:.72rem; color:var(--ink2); opacity:.75; }
.nb-tape{ position:absolute; top:-8px; left:50%; transform:translateX(-50%) rotate(-4deg); width:52px; height:16px; background:rgba(255,224,140,.55); border-radius:2px; }
.nb-ph{ width:100%; aspect-ratio:1/1; display:grid; place-items:center; border-radius:4px; font-family:var(--display); font-size:1.6rem; color:#fff; background:var(--pc,#c9b8f2); }
.nb-masonry{ columns:3 150px; column-gap:16px; }
.nb-masonry .nb-polaroid{ break-inside:avoid; margin:0 0 18px; }
.nb-masonry .nb-polaroid .nb-zoom img.nb-zoom-img{ object-fit:cover; }
.nb-masonry .nb-polaroid .nb-zoom{ aspect-ratio:auto; }

/* features + doodle */
.nb-feat-wrap{ display:grid; grid-template-columns:1.4fr .9fr; gap:18px; align-items:center; }
.nb-feats{ list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:12px; }
.nb-feats li{ display:flex; gap:12px; align-items:flex-start; }
.nb-bullet{ width:14px; height:14px; flex:0 0 auto; border-radius:50%; margin-top:5px; box-shadow:0 2px 5px -2px rgba(120,100,170,.6); }
.nb-feats b{ font-family:var(--display); font-size:1.02rem; color:var(--ink); }
.nb-feat-desc{ display:block; color:var(--ink2); font-size:.9rem; margin-top:2px; }
.nb-price{ display:inline-block; margin-top:4px; font-family:var(--display); font-size:.8rem; color:var(--ink); background:#f3eefb; border-radius:999px; padding:2px 10px; }
.nb-feat-doodle{ position:relative; display:flex; flex-direction:column; align-items:center; gap:10px; }
.nb-laptop{ width:120px; height:auto; }
.nb-bubble{ font-family:var(--display); font-size:.86rem; color:#7a5a6a; text-align:center; background:#ffe0ea; border:2px solid #f4b8c8; border-radius:16px 16px 16px 4px; padding:8px 14px; max-width:180px; box-shadow:2px 3px 0 rgba(240,150,180,.3); }

/* timeline */
.nb-time{ display:flex; flex-direction:column; gap:14px; }
.nb-time-row{ display:grid; grid-template-columns:16px 120px 1fr; gap:12px; align-items:start; }
.nb-dot2{ width:14px; height:14px; border-radius:50%; margin-top:4px; box-shadow:0 2px 5px -2px rgba(120,100,170,.6); }
.nb-time-date{ font-family:var(--display); font-size:.86rem; color:var(--acc); padding-top:2px; }
.nb-time b, .nb-mini b, .nb-quote b{ font-family:var(--display); }
.nb-time p{ margin:4px 0 0; color:var(--ink2); }

/* mini grid */
.nb-grid2{ display:grid; grid-template-columns:1fr 1fr; gap:16px; }
.nb-mini{ background:#fbf8ff; border:2px solid #efe9fb; border-left:6px solid var(--pc,#c9b8f2); border-radius:12px; padding:16px; text-decoration:none; color:inherit; }
.nb-mini-link:hover{ box-shadow:2px 4px 0 rgba(120,100,170,.16); }
.nb-mini-top{ display:flex; align-items:baseline; justify-content:space-between; gap:10px; flex-wrap:wrap; }
.nb-mini b{ font-size:1.02rem; color:var(--ink); }
.nb-mini p{ margin:6px 0 0; color:var(--ink2); }
.nb-plainlink{ text-decoration:none; } .nb-plainlink:hover b{ color:var(--acc); }

/* video */
.nb-video{ background:#fff; padding:8px; border-radius:12px; box-shadow:2px 4px 10px -4px rgba(120,100,170,.4); }
.nb-video-frame{ position:relative; aspect-ratio:16/9; border-radius:8px; overflow:hidden; background:#000; }
.nb-video-frame iframe{ position:absolute; inset:0; width:100%; height:100%; border:0; }
.nb-video figcaption{ font-family:var(--display); font-size:.85rem; color:var(--ink2); padding:8px 4px 2px; }

/* quote */
.nb-quote{ background:color-mix(in srgb, var(--pc,#c9b8f2) 24%, #fff); border:2px solid rgba(255,255,255,.8); border-radius:16px 16px 16px 4px; padding:18px; box-shadow:2px 4px 0 rgba(120,100,170,.16); }
.nb-quote blockquote{ margin:0; color:var(--ink); }
.nb-quote figcaption{ display:flex; align-items:center; gap:10px; margin-top:12px; }
.nb-quote figcaption span{ display:flex; flex-direction:column; line-height:1.2; }
.nb-quote figcaption b{ font-size:.9rem; } .nb-quote figcaption em{ font-style:normal; font-size:.78rem; color:var(--ink2); }
.nb-av{ width:40px; height:40px; flex:0 0 auto; border-radius:50%; overflow:hidden; display:grid; place-items:center; font-family:var(--display); color:#fff; background:var(--pc,#c9b8f2); border:2px solid #fff; }
.nb-av img{ width:100%; height:100%; object-fit:cover; }

/* zoom blur-fill */
.nb-zoom{ position:relative; display:block; padding:0; border:0; cursor:zoom-in; color:inherit; overflow:hidden; background:#eee6f5; }
.nb-zoom-bg{ position:absolute; inset:0; width:100%; height:100%; object-fit:cover; filter:blur(18px) saturate(1.2); transform:scale(1.2); opacity:.5; }
.nb-zoom-img{ position:relative; z-index:1; width:100%; height:100%; object-fit:contain; transition:transform .35s ease; }
.nb-zoom:hover .nb-zoom-img{ transform:scale(1.06); }
.nb-zoom:focus-visible{ outline:3px solid var(--acc); outline-offset:2px; }

/* socials */
.nb-socials{ display:flex; flex-wrap:wrap; gap:10px; }
.nb-soc{ width:42px; height:42px; display:grid; place-items:center; border-radius:50%; color:#6a5d80; text-decoration:none;
  background:var(--pc,#c9b8f2); border:2px solid #fff; box-shadow:2px 3px 0 rgba(120,100,170,.28); transition:transform .14s; }
.nb-soc:hover{ transform:translateY(-3px) rotate(-6deg); }
.nb-soc svg{ width:17px; height:17px; }

/* contact */
.nb-contact{ display:grid; grid-template-columns:.85fr 1.15fr; gap:20px; align-items:start; }
.nb-contact-left{ display:flex; flex-direction:column; gap:10px; }
.nb-crow{ display:flex; align-items:center; gap:8px; text-decoration:none; color:var(--ink); word-break:break-word; }
.nb-crow span:first-child{ color:var(--acc); }
.nb-crow:hover{ color:var(--acc); }
.nb-formcard{ background:#fbf8ff; border:2px dashed #d8cff0; border-radius:16px; padding:clamp(14px,2.4vw,22px); }
.nb-formcard :where(input, textarea, select){ width:100%; font-family:var(--body); font-weight:600; font-size:.95rem; color:var(--ink); background:#fff; border:2px solid #e6def5; border-radius:12px; padding:11px 14px; margin-bottom:12px; }
.nb-formcard :where(input, textarea, select):focus{ outline:none; border-color:var(--acc); }
.nb-formcard :where(input, textarea, select)::placeholder{ color:var(--ink2); }
.nb-formcard textarea{ min-height:100px; resize:vertical; }
.nb-formcard :where(button, [type="submit"]){ width:100%; font-family:var(--display); font-weight:700; cursor:pointer; color:#5a5175; background:var(--acc); border:2px solid #fff; border-radius:999px; padding:12px 18px; box-shadow:2px 3px 0 rgba(120,100,170,.3); transition:transform .14s; }
.nb-formcard :where(button, [type="submit"]):hover{ transform:translateY(-2px); }
.nb-formcard label{ color:var(--ink2); font-size:.84rem; font-family:var(--display); }

/* footer */
.nb-foot{ position:relative; text-align:center; margin-top:40px; padding-top:24px; border-top:2px dashed #e2d8f0; }
.nb-foot-doodles{ display:flex; justify-content:center; gap:14px; margin-bottom:14px; }
.nb-foot-doodles .nb-doodle{ width:40px; height:auto; }
.nb-foot-name{ display:block; font-family:var(--display); font-size:1.2rem; color:var(--acc); }
.nb-foot-copy{ display:block; margin-top:6px; color:var(--ink2); font-size:.86rem; }
.nb-madewith{ color:var(--acc); text-decoration:none; }

/* lightbox */
.nb-lb{ position:fixed; inset:0; z-index:1000; display:grid; place-items:center; padding:clamp(16px,4vw,48px); background:rgba(90,75,120,.55); backdrop-filter:blur(4px); -webkit-backdrop-filter:blur(4px); animation:nb-fade .2s ease both; }
.nb-lb-card{ position:relative; background:#fff; border:3px solid #efe4d6; border-radius:18px; padding:14px; max-width:94vw; max-height:92vh; box-shadow:0 40px 80px -30px rgba(60,40,90,.7); animation:nb-pop .3s cubic-bezier(.34,1.4,.5,1) both; }
.nb-lb-fig{ margin:0; display:flex; flex-direction:column; gap:8px; align-items:center; }
.nb-lb-fig img{ max-width:88vw; max-height:78vh; width:auto; height:auto; object-fit:contain; border-radius:8px; }
.nb-lb-fig figcaption{ font-family:var(--display); color:var(--ink2); font-size:.9rem; text-align:center; }
.nb-lb-close{ position:absolute; top:-14px; right:-14px; width:38px; height:38px; border-radius:50%; cursor:pointer; color:#fff; background:var(--pink); border:3px solid #fff; font-size:1rem; font-weight:700; box-shadow:0 6px 14px -6px rgba(0,0,0,.4); transition:transform .16s; }
.nb-lb-close:hover{ transform:rotate(90deg) scale(1.08); }
.nb-lb-close:focus-visible{ outline:3px solid var(--acc); outline-offset:2px; }
@keyframes nb-fade{ from{opacity:0;} to{opacity:1;} }
@keyframes nb-pop{ from{opacity:0; transform:scale(.9);} to{opacity:1; transform:none;} }

/* responsive */
@media (max-width:720px){
  .nb-feat-wrap{ grid-template-columns:1fr; }
  .nb-grid2{ grid-template-columns:1fr; }
  .nb-contact{ grid-template-columns:1fr; }
  .nb-masonry{ columns:2 120px; }
  .nb-time-row{ grid-template-columns:16px 1fr; }
  .nb-time-date{ grid-column:2; }
}
@media (max-width:440px){
  .nb-masonry{ columns:2 100px; column-gap:12px; }
  .nb-about .nb-polaroid{ width:140px; }
  .nb-doodles-top{ display:none; }
}

@media (prefers-reduced-motion: reduce){
  .nb-root{ scroll-behavior:auto; }
  .nb-root *{ animation:none !important; transition:none !important; }
  .nb-root.nb-ready [data-reveal]{ opacity:1 !important; transform:none !important; }
  .nb-tilt-a, .nb-tilt-b{ transform:none; }
}
`;
