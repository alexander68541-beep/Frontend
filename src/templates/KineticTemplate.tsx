"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import type { PublicPortfolio } from "@/lib/publicTypes";
import { dateRange, videoEmbed, ext } from "@/lib/publicTypes";
import { ContactForm } from "@/components/ContactForm";

/* =====================================================================
   KineticTemplate — "Kinetic" — a bold editorial motion-designer
   portfolio: light-gray canvas, red/black palette, glitchy overlapping
   display type, a fanned card deck of work, technical HUD accents, and
   a rotating badge. PURE PRESENTATION from `data`. Prefixed `.k-`.
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

const SEC_ID: Record<string, string> = {
  about: "about", projects: "work", skills: "skills", services: "services", experience: "experience",
  education: "education", certifications: "certifications", achievements: "achievements",
  publications: "publications", gallery: "gallery", videos: "videos", testimonials: "testimonials",
};
const SEC_TITLE: Record<string, string> = {
  about: "ABOUT ME", projects: "SELECTED WORK", skills: "SKILLS", services: "SERVICES", experience: "EXPERIENCE",
  education: "EDUCATION", certifications: "CERTIFICATIONS", achievements: "ACHIEVEMENTS", publications: "PUBLICATIONS",
  gallery: "GALLERY", videos: "REEL", testimonials: "TESTIMONIALS",
};

/* ------------------------------ component ------------------------------ */

export function KineticTemplate({ data }: { data: PublicPortfolio }) {
  const p = data.profile;
  const accent = data.accent || "#e63329";

  const hidden = new Set(data.settings?.hidden ?? []);
  const sv = (k: string) => !hidden.has(k);
  const username = data.username;
  const name = p?.display_name || username || "Your Name";

  const [lb, setLb] = useState<{ src: string; alt: string; cap?: string } | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const openLb = useCallback((src: string, alt: string, cap?: string) => setLb({ src, alt, cap }), []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    root.classList.add("k-ready");
    const reduce = typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const targets = root.querySelectorAll("[data-reveal]");
    if (reduce || typeof IntersectionObserver === "undefined") { targets.forEach((el) => el.classList.add("k-in")); return; }
    const io = new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("k-in"); io.unobserve(e.target); } }), { threshold: 0, rootMargin: "0px 0px 22% 0px" });
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
    contact: !!username,
  };
  const contactHref = username ? "#contact" : p?.email ? `mailto:${p.email}` : undefined;
  const LEN: Record<string, number> = {
    projects: data.projects.length, skills: data.skills.length, services: data.services.length,
    experience: data.experience.length, education: data.education.length, certifications: data.certifications.length,
    achievements: data.achievements.length, publications: data.publications.length, gallery: data.gallery.length,
    videos: data.videos.length, testimonials: data.testimonials.length,
  };
  const panelHas = (k: string) => (k === "about" ? has.about : sv(k) && (LEN[k] ?? 0) > 0);
  const order = resolveOrder(data.settings).filter(panelHas);

  const ZImg = useCallback(({ src, alt, cap, className }: { src: string; alt: string; cap?: string; className?: string }) => (
    <button type="button" className={`k-zoom ${className || ""}`} onClick={() => openLb(src, alt, cap)} aria-label={alt ? `View image: ${alt}` : "View image"}>
      <img className="k-zoom-bg" src={src} alt="" aria-hidden loading="lazy" />
      <img className="k-zoom-img" src={src} alt={alt} loading="lazy" />
    </button>
  ), [openLb]);

  const socialRow = (extra?: string) =>
    data.links.length > 0 ? (
      <div className={`k-socials ${extra || ""}`}>
        {data.links.map((l) => (<a key={l.id} className="k-soc" href={ext(l.url)} target="_blank" rel="noopener noreferrer" aria-label={l.label || l.platform} title={l.label || l.platform}><SocialIcon name={detectSocial(l.platform, l.url, l.label)} /></a>))}
      </div>
    ) : null;

  const secHead = (i: number, k: string) => (
    <div className="k-sechead"><span className="k-idx">{String(i).padStart(2, "0")} //</span><h2 className="k-h2">{SEC_TITLE[k] || k}</h2><span className="k-hr" aria-hidden /></div>
  );

  const sections: Record<string, (i: number) => ReactNode> = {
    about: (i) => {
      const aboutText = p?.about ?? p?.bio ?? null;
      return (<section id="about" data-reveal className="k-section">{secHead(i, "about")}<div className="k-about">{aboutText && <div className="k-about-txt">{aboutText.split(/\n{2,}/).map((para, j) => <p key={j}>{para}</p>)}{p?.resume_url && <a className="k-btn" href={ext(p.resume_url)} target="_blank" rel="noopener noreferrer">DOWNLOAD CV <span aria-hidden>↓</span></a>}</div>}{(p?.tagline || p?.location) && <aside className="k-about-side">{p?.tagline && <p className="k-tagline">{p.tagline}</p>}{p?.location && <span className="k-meta">◎ {p.location}</span>}{p?.availability && <span className="k-meta k-live">● {p.availability}</span>}</aside>}</div></section>);
    },
    projects: (i) => {
      const ordered = [...data.projects].sort((a, b) => Number(!!b.is_featured) - Number(!!a.is_featured));
      return (<section id="work" data-reveal className="k-section">{secHead(i, "projects")}<div className="k-grid">{ordered.map((pr) => { const cat = pr.role || (pr.tags && pr.tags[0]) || null; return (<article key={pr.id} className="k-proj">{pr.image_url ? <ZImg src={pr.image_url} alt={pr.title || "Project"} cap={pr.title || undefined} /> : <div className="k-ph" aria-hidden>{initials(pr.title, "P")}</div>}{pr.is_featured && <span className="k-badge">★ FEATURED</span>}<div className="k-proj-body"><h3 className="k-proj-title">{pr.url ? <a href={ext(pr.url)} target="_blank" rel="noopener noreferrer">{pr.title || "Untitled"} ↗</a> : (pr.title || "Untitled")}</h3>{cat && <span className="k-proj-cat">{cat}</span>}{pr.tags && pr.tags.length > 0 && <div className="k-tags">{pr.tags.slice(0, 4).map((t) => <span key={t} className="k-tag">{t}</span>)}</div>}</div></article>); })}</div></section>);
    },
    skills: (i) => {
      const sorted = [...data.skills].map((s) => ({ s, lvl: levelPct(s.level) })).sort((a, b) => (b.lvl ?? 0) - (a.lvl ?? 0));
      return (<section id="skills" data-reveal className="k-section">{secHead(i, "skills")}<div className="k-skills">{sorted.map(({ s, lvl }) => (<div key={s.id} className="k-skill" style={{ ["--pct" as string]: `${lvl ?? 0}%` } as CSSProperties}><div className="k-skill-top"><span className="k-skill-name">{s.name}</span>{lvl != null ? <span className="k-skill-val">{Math.round(lvl)}%</span> : (typeof s.level === "string" && <span className="k-skill-val">{s.level}</span>)}</div>{lvl != null && <div className="k-skill-bar" role="progressbar" aria-valuenow={Math.round(lvl)} aria-valuemin={0} aria-valuemax={100} aria-label={`${s.name} level`}><span className="k-skill-fill" /></div>}</div>))}</div></section>);
    },
    services: (i) => (<section id="services" data-reveal className="k-section">{secHead(i, "services")}<div className="k-serv">{data.services.map((s, j) => (<div key={s.id} className="k-serv-row"><span className="k-serv-n">{String(j + 1).padStart(2, "0")}</span><div><h3 className="k-serv-h">{s.title}</h3>{s.description && <p>{s.description}</p>}</div>{s.price && <span className="k-serv-price">{s.price}</span>}</div>))}</div></section>),
    experience: (i) => (<section id="experience" data-reveal className="k-section">{secHead(i, "experience")}<div className="k-exp">{data.experience.map((e) => (<div key={e.id} className="k-exp-row"><span className="k-exp-date">{dateRange(e.start_date, e.end_date, e.is_current)}</span><div><h3 className="k-serv-h">{e.title || e.company || "Role"}</h3><span className="k-meta">{[e.company, e.location].filter(Boolean).join(" · ")}</span>{e.description && <p>{e.description}</p>}</div></div>))}</div></section>),
    education: (i) => (<section id="education" data-reveal className="k-section">{secHead(i, "education")}<div className="k-grid2">{data.education.map((ed) => (<div key={ed.id} className="k-mini"><div className="k-mini-top"><h3 className="k-serv-h">{ed.school || "School"}</h3><span className="k-exp-date">{dateRange(ed.start_date, ed.end_date)}</span></div>{(ed.degree || ed.field) && <p>{[ed.degree, ed.field].filter(Boolean).join(", ")}</p>}{ed.description && <p className="k-meta">{ed.description}</p>}</div>))}</div></section>),
    certifications: (i) => (<section id="certifications" data-reveal className="k-section">{secHead(i, "certifications")}<div className="k-grid2">{data.certifications.map((c) => { const body = (<><div className="k-mini-top"><h3 className="k-serv-h">{c.name}</h3>{oneDate(c.issue_date) && <span className="k-exp-date">{oneDate(c.issue_date)}</span>}</div>{c.issuer && <p className="k-meta">{c.issuer}</p>}</>); return c.url ? <a key={c.id} className="k-mini k-mini-link" href={ext(c.url)} target="_blank" rel="noopener noreferrer">{body}</a> : <div key={c.id} className="k-mini">{body}</div>; })}</div></section>),
    achievements: (i) => (<section id="achievements" data-reveal className="k-section">{secHead(i, "achievements")}<div className="k-serv">{data.achievements.map((a, j) => (<div key={a.id} className="k-serv-row"><span className="k-serv-n">{String(j + 1).padStart(2, "0")}</span><div><h3 className="k-serv-h">{a.title}</h3>{a.description && <p>{a.description}</p>}</div>{oneDate(a.date) && <span className="k-serv-price">{oneDate(a.date)}</span>}</div>))}</div></section>),
    publications: (i) => (<section id="publications" data-reveal className="k-section">{secHead(i, "publications")}<div className="k-exp">{data.publications.map((pub) => { const meta = [pub.publisher, oneDate(pub.date)].filter(Boolean).join(" · "); const inner = (<div><h3 className="k-serv-h">{pub.title}{pub.url && " ↗"}</h3>{meta && <span className="k-meta">{meta}</span>}{pub.description && <p>{pub.description}</p>}</div>); return (<div key={pub.id} className="k-exp-row"><span className="k-exp-date">{oneDate(pub.date) || "—"}</span>{pub.url ? <a className="k-plain" href={ext(pub.url)} target="_blank" rel="noopener noreferrer">{inner}</a> : inner}</div>); })}</div></section>),
    gallery: (i) => (<section id="gallery" data-reveal className="k-section">{secHead(i, "gallery")}<div className="k-grid">{data.gallery.map((g) => g.image_url ? (<figure key={g.id} className="k-proj k-gitem"><ZImg src={g.image_url} alt={g.caption || "Photo"} cap={g.caption || undefined} />{g.caption && <figcaption className="k-proj-cat">{g.caption}</figcaption>}</figure>) : null)}</div></section>),
    videos: (i) => (<section id="videos" data-reveal className="k-section">{secHead(i, "videos")}<div className="k-grid2">{data.videos.map((v) => { const src = v.url ? videoEmbed(v.url) : null; if (!src) return null; return (<figure key={v.id} className="k-video"><div className="k-video-frame"><iframe src={src} title={v.title || "Video"} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div>{v.title && <figcaption className="k-proj-cat">{v.title}</figcaption>}</figure>); })}</div></section>),
    testimonials: (i) => (<section id="testimonials" data-reveal className="k-section">{secHead(i, "testimonials")}<div className="k-grid2">{data.testimonials.map((t) => (<figure key={t.id} className="k-quote"><span className="k-quote-mark" aria-hidden>“</span>{t.quote && <blockquote>{t.quote}</blockquote>}<figcaption><span className="k-av" aria-hidden>{t.avatar_url ? <img src={t.avatar_url} alt="" loading="lazy" /> : initials(t.author, "•")}</span><span>{t.author && <b>{t.author}</b>}{t.role && <em>{t.role}</em>}</span></figcaption></figure>))}</div></section>),
  };

  let idx = 0;
  const numbered = order.map((k) => { idx += 1; return { k, i: idx }; });

  // fan deck = featured projects (with images) then any gallery, up to 6
  const fanImgs: { src: string; title?: string }[] = [];
  for (const pr of [...data.projects].sort((a, b) => Number(!!b.is_featured) - Number(!!a.is_featured))) {
    if (pr.image_url) fanImgs.push({ src: pr.image_url, title: pr.title || undefined });
    if (fanImgs.length >= 6) break;
  }
  if (fanImgs.length < 4) for (const g of data.gallery) { if (g.image_url) fanImgs.push({ src: g.image_url, title: g.caption || undefined }); if (fanImgs.length >= 6) break; }
  const N = fanImgs.length;
  const badgeText = `${(p?.title || "PORTFOLIO").toUpperCase()} • `.repeat(3);

  return (
    <div ref={rootRef} className="k-root" id="top" data-theme="kinetic" style={{ ["--tpl-accent" as string]: accent } as CSSProperties}>
      <style dangerouslySetInnerHTML={{ __html: K_CSS }} />

      {/* HERO */}
      <header className="k-hero">
        <span className="k-hud k-hud-plus k-p1" aria-hidden>+</span>
        <span className="k-hud k-hud-plus k-p2" aria-hidden>+</span>
        <span className="k-hud k-hud-plus k-p3" aria-hidden>+</span>
        <span className="k-hud k-hud-plus k-p4" aria-hidden>+</span>
        <span className="k-hud k-arrow k-arrow-l" aria-hidden>◄</span>
        <span className="k-hud k-arrow k-arrow-r" aria-hidden>►</span>
        <span className="k-cross" aria-hidden><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.4" /><path d="M12 2v6M12 16v6M2 12h6M16 12h6" stroke="currentColor" strokeWidth="1.4" /></svg></span>

        <div className="k-shell k-hero-in">
          <span className="k-eyebrow">WELCOME TO MY</span>
          <div className="k-title-wrap">
            <span className="k-redbar" aria-hidden />
            <h1 className="k-title" aria-label={`${name} — Portfolio`}>
              <span className="k-t-ghost" aria-hidden>PORTFOLIO</span>
              <span className="k-t-main">PORTFOLIO</span>
            </h1>
          </div>
          <div className="k-namerow">
            <span className="k-name">{name}</span>
            <span className="k-role">{p?.title || "Creative"}</span>
          </div>

          {N > 0 && (
            <div className="k-fan" role="list" aria-label="Selected work">
              {fanImgs.map((it, i) => {
                const mid = (N - 1) / 2;
                const rot = ((i - mid) * (N > 1 ? Math.min(11, 46 / N) : 0)).toFixed(2);
                const ty = (Math.abs(i - mid) ** 1.15 * 16).toFixed(1);
                return (
                  <button key={i} type="button" className="k-card" role="listitem" onClick={() => openLb(it.src, it.title || "Work", it.title)}
                    style={{ ["--rot" as string]: `${rot}deg`, ["--ty" as string]: `${ty}px`, zIndex: 20 - Math.round(Math.abs(i - mid)) } as CSSProperties} aria-label={it.title || "View work"}>
                    <img className="k-card-bg" src={it.src} alt="" aria-hidden loading="lazy" />
                    <img className="k-card-img" src={it.src} alt={it.title || "Work"} loading="lazy" />
                  </button>
                );
              })}
            </div>
          )}

          <a className="k-cue" href={numbered[0] ? `#${SEC_ID[numbered[0].k] || numbered[0].k}` : "#contact"} aria-label="Scroll down">
            <span className="k-badge-spin" aria-hidden><svg viewBox="0 0 120 120"><defs><path id="kcirc" d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0" /></defs><text><textPath href="#kcirc">{badgeText}</textPath></text></svg></span>
            <span className="k-cue-c">▲<br />ME</span>
          </a>
          {socialRow("k-hero-soc")}
        </div>
      </header>

      {/* SECTIONS */}
      <main className="k-shell">
        {numbered.map(({ k, i }) => <Fragment key={k}>{sections[k] ? sections[k](i) : null}</Fragment>)}

        {username && (
          <section id="contact" data-reveal className="k-section">
            {secHead(numbered.length + 1, "contact" as string)}
            <div className="k-contact">
              <div className="k-contact-left">
                <h2 className="k-cta-big">LET&apos;S<br />WORK<span style={{ color: "var(--accent)" }}>.</span></h2>
                <div className="k-contact-rows">
                  {p?.email && <a className="k-crow" href={`mailto:${p.email}`}>{p.email}</a>}
                  {p?.phone && <a className="k-crow" href={`tel:${p.phone}`}>{p.phone}</a>}
                  {p?.website && <a className="k-crow" href={ext(p.website)} target="_blank" rel="noopener noreferrer">{p.website.replace(/^https?:\/\//, "")}</a>}
                  {p?.location && <span className="k-crow">{p.location}</span>}
                </div>
                {socialRow()}
              </div>
              <div className="k-formcard"><ContactForm username={username} /></div>
            </div>
          </section>
        )}
      </main>

      <footer className="k-footer">
        <div className="k-shell k-footer-in">
          <span className="k-foot-name">{name}</span>
          <span className="k-foot-copy">© {new Date().getFullYear()}{!data.hide_branding && <> — <a className="k-madewith" href="https://folio.assetprim.com" target="_blank" rel="noopener noreferrer">MADE WITH FOLIO</a></>}</span>
        </div>
      </footer>

      {/* LIGHTBOX */}
      {lb && (
        <div className="k-lb" role="dialog" aria-modal="true" aria-label="Image viewer" onClick={() => setLb(null)}>
          <button ref={closeRef} type="button" className="k-lb-close" onClick={() => setLb(null)} aria-label="Close image viewer">✕</button>
          <figure className="k-lb-fig" onClick={(e) => e.stopPropagation()}><img src={lb.src} alt={lb.alt} />{lb.cap && <figcaption>{lb.cap}</figcaption>}</figure>
        </div>
      )}
    </div>
  );
}

export default KineticTemplate;

/* =====================================================================
   STYLES — editorial red/black/gray. Prefixed `.k-`, scoped `.k-root`.
   ===================================================================== */

const K_CSS = `
.k-root{
  --bg:#e7e7e4; --ink:#141414; --ink2:#6a6a6a; --card:#fff; --line:rgba(20,20,20,.16);
  --accent:var(--tpl-accent,#e63329); --on-accent:#fff;
  --display:"Archivo Black","Bricolage Grotesque","Inter",ui-sans-serif,system-ui,sans-serif;
  --mono:ui-monospace,"JetBrains Mono",Menlo,Consolas,monospace;
  --body:"Inter",ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  position:relative; isolation:isolate; background:var(--bg); color:var(--ink);
  font-family:var(--body); font-size:16px; line-height:1.55; -webkit-font-smoothing:antialiased;
  overflow-x:clip; min-height:100%; scroll-behavior:smooth;
  background-image:radial-gradient(rgba(20,20,20,.05) 1px, transparent 1px); background-size:22px 22px;
}
.k-root *{ box-sizing:border-box; }
.k-root img{ max-width:100%; display:block; }
.k-root a{ color:inherit; }
.k-root h1,.k-root h2,.k-root h3,.k-root p,.k-root blockquote{ overflow-wrap:anywhere; }
.k-shell{ width:100%; max-width:1180px; margin-inline:auto; padding-inline:clamp(16px,4vw,44px); }
.k-meta{ font-family:var(--mono); font-size:.82rem; color:var(--ink2); display:inline-block; }
.k-live{ color:color-mix(in srgb, #1a9e57 80%, var(--ink)); }

/* reveal */
.k-root.k-ready [data-reveal]{ opacity:0; transform:translateY(40px); transition:opacity .55s ease, transform .8s cubic-bezier(.2,.85,.25,1); }
.k-root.k-ready [data-reveal].k-in{ opacity:1; transform:none; }

/* buttons */
.k-btn{ display:inline-flex; align-items:center; gap:10px; margin-top:20px; padding:13px 22px; border-radius:2px;
  font-family:var(--mono); text-transform:uppercase; letter-spacing:.08em; font-size:.8rem; font-weight:700; text-decoration:none;
  color:var(--on-accent); background:var(--ink); border:2px solid var(--ink); transition:background .16s, color .16s, transform .16s; }
.k-btn:hover{ background:var(--accent); border-color:var(--accent); transform:translateY(-2px); }
.k-btn:focus-visible{ outline:2px solid var(--accent); outline-offset:3px; }

/* ---- HERO ---- */
.k-hero{ position:relative; overflow:hidden; padding-top:clamp(30px,6vw,64px); padding-bottom:clamp(20px,4vw,48px); }
.k-hero-in{ position:relative; text-align:center; }
.k-hud{ position:absolute; z-index:1; color:var(--ink2); font-family:var(--mono); pointer-events:none; opacity:.7; }
.k-hud-plus{ font-size:1.1rem; }
.k-p1{ top:18%; left:6%; } .k-p2{ top:64%; left:12%; } .k-p3{ top:30%; right:8%; } .k-p4{ bottom:16%; right:16%; }
.k-arrow{ top:34%; font-size:1.4rem; } .k-arrow-l{ left:2.5%; } .k-arrow-r{ right:2.5%; }
.k-cross{ position:absolute; top:5%; right:5%; width:34px; height:34px; color:var(--ink); opacity:.85; z-index:1; }
.k-cross svg{ width:100%; height:100%; }
.k-eyebrow{ display:inline-block; font-family:var(--mono); font-weight:700; letter-spacing:.28em; font-size:.8rem; }
.k-title-wrap{ position:relative; display:inline-block; margin:10px auto 0; padding:10px clamp(20px,5vw,60px); }
.k-redbar{ position:absolute; z-index:0; top:-6%; bottom:-6%; left:50%; transform:translateX(-50%); width:clamp(60px,9vw,110px); background:var(--accent); }
.k-title{ position:relative; margin:0; font-family:var(--display); font-weight:800; text-transform:uppercase;
  font-size:clamp(3.4rem,13vw,9rem); line-height:.9; letter-spacing:-.02em; }
.k-t-main{ position:relative; z-index:2; color:var(--ink); }
.k-t-ghost{ position:absolute; inset:0; z-index:1; color:transparent; -webkit-text-stroke:2px var(--ink); text-stroke:2px var(--ink);
  transform:translate(-3%,7%); opacity:.85; animation:k-glitch 5.5s steps(1) infinite; }
@keyframes k-glitch{ 0%,88%{ transform:translate(-3%,7%); } 89%{ transform:translate(2%,4%); } 91%{ transform:translate(-5%,8%); } 93%{ transform:translate(3%,6%); } 95%{ transform:translate(-3%,7%); } 100%{ transform:translate(-3%,7%); } }
.k-namerow{ display:flex; align-items:center; justify-content:space-between; gap:14px; max-width:640px; margin:14px auto 0; padding-top:12px; border-top:2px solid var(--ink); font-family:var(--mono); text-transform:uppercase; letter-spacing:.14em; font-size:.8rem; font-weight:700; }
.k-role{ color:var(--accent); }

/* fan deck */
.k-fan{ position:relative; height:clamp(220px,32vw,320px); margin-top:clamp(20px,4vw,40px); }
.k-card{ position:absolute; left:50%; bottom:0; width:clamp(120px,15vw,186px); aspect-ratio:3/4; margin-left:calc(clamp(120px,15vw,186px) / -2);
  padding:0; border:0; cursor:pointer; overflow:hidden; border-radius:12px; background:#111; transform-origin:bottom center;
  transform:rotate(var(--rot,0deg)) translateY(var(--ty,0px));
  border:3px solid #fff; box-shadow:0 18px 30px -14px rgba(0,0,0,.55); transition:transform .3s cubic-bezier(.2,.85,.25,1), box-shadow .3s; }
.k-card:hover, .k-card:focus-visible{ transform:rotate(0deg) translateY(-26px) scale(1.06); z-index:60 !important; box-shadow:0 28px 46px -16px rgba(0,0,0,.6); outline:none; }
.k-card-bg{ position:absolute; inset:0; width:100%; height:100%; object-fit:cover; filter:blur(16px) saturate(1.2); transform:scale(1.2); opacity:.55; }
.k-card-img{ position:relative; z-index:1; width:100%; height:100%; object-fit:contain; }

/* scroll cue */
.k-cue{ position:relative; display:inline-grid; place-items:center; width:118px; height:118px; margin:clamp(18px,3vw,30px) auto 0; text-decoration:none; }
.k-badge-spin{ position:absolute; inset:0; animation:k-spin 14s linear infinite; }
.k-badge-spin svg{ width:100%; height:100%; }
.k-badge-spin text{ font-family:var(--mono); font-size:8px; letter-spacing:2px; fill:var(--ink); text-transform:uppercase; }
@keyframes k-spin{ to{ transform:rotate(360deg); } }
.k-cue-c{ font-family:var(--mono); font-weight:700; font-size:.68rem; text-align:center; line-height:1.4; color:var(--ink); }
.k-hero-soc{ justify-content:center; margin-top:20px; }

/* ---- SECTIONS ---- */
.k-section{ padding-block:clamp(40px,6vw,76px); border-top:2px solid var(--ink); }
.k-sechead{ display:flex; align-items:center; gap:16px; margin-bottom:clamp(22px,3vw,38px); }
.k-idx{ font-family:var(--mono); font-weight:700; color:var(--accent); font-size:.9rem; }
.k-h2{ font-family:var(--display); font-weight:800; text-transform:uppercase; font-size:clamp(1.5rem,3.6vw,2.6rem); letter-spacing:-.01em; margin:0; }
.k-hr{ flex:1; height:2px; background:var(--ink); opacity:.25; }

/* about */
.k-about{ display:grid; grid-template-columns:1.5fr .9fr; gap:clamp(20px,4vw,50px); align-items:start; }
.k-about-txt p{ margin:0 0 14px; color:#2a2a2a; font-size:1.06rem; }
.k-about-side{ display:flex; flex-direction:column; gap:10px; padding-left:20px; border-left:3px solid var(--accent); }
.k-tagline{ font-family:var(--display); text-transform:uppercase; font-size:1.1rem; margin:0; }

/* projects / gallery grid */
.k-grid{ display:grid; grid-template-columns:repeat(3,1fr); gap:clamp(14px,2vw,22px); }
.k-proj{ position:relative; background:var(--card); border:2px solid var(--ink); border-radius:4px; overflow:hidden; display:flex; flex-direction:column; transition:transform .18s ease, box-shadow .18s ease; }
.k-proj:hover{ transform:translateY(-4px); box-shadow:6px 6px 0 var(--accent); }
.k-proj .k-zoom{ width:100%; aspect-ratio:4/3; border-bottom:2px solid var(--ink); }
.k-ph{ width:100%; aspect-ratio:4/3; display:grid; place-items:center; font-family:var(--display); font-size:2rem; color:#fff; background:var(--ink); border-bottom:2px solid var(--ink); }
.k-badge{ position:absolute; top:8px; left:8px; font-family:var(--mono); font-size:.62rem; font-weight:700; letter-spacing:.1em; color:#fff; background:var(--accent); padding:4px 8px; z-index:2; }
.k-proj-body{ padding:14px 16px; }
.k-proj-title{ font-family:var(--display); text-transform:uppercase; font-size:1rem; margin:0; }
.k-proj-title a{ text-decoration:none; } .k-proj-title a:hover{ color:var(--accent); }
.k-proj-cat{ display:block; font-family:var(--mono); font-size:.76rem; color:var(--ink2); margin-top:4px; text-transform:uppercase; letter-spacing:.06em; }
.k-tags{ display:flex; flex-wrap:wrap; gap:6px; margin-top:10px; }
.k-tag{ font-family:var(--mono); font-size:.66rem; text-transform:uppercase; padding:3px 8px; border:1px solid var(--line); }

/* skills */
.k-skills{ display:grid; grid-template-columns:1fr 1fr; gap:14px 32px; }
.k-skill-top{ display:flex; justify-content:space-between; align-items:baseline; gap:10px; }
.k-skill-name{ font-family:var(--display); text-transform:uppercase; font-size:.95rem; }
.k-skill-val{ font-family:var(--mono); font-size:.8rem; color:var(--accent); }
.k-skill-bar{ height:8px; background:rgba(20,20,20,.1); margin-top:8px; overflow:hidden; }
.k-skill-fill{ display:block; height:100%; width:var(--pct); background:var(--accent); }
.k-root.k-ready [data-reveal] .k-skill-fill{ width:0; }
.k-root.k-ready [data-reveal].k-in .k-skill-fill{ width:var(--pct); transition:width 1s cubic-bezier(.2,.85,.25,1); }

/* services / achievements list */
.k-serv{ display:flex; flex-direction:column; }
.k-serv-row{ display:grid; grid-template-columns:auto 1fr auto; gap:16px; align-items:baseline; padding:18px 0; border-top:1px solid var(--line); }
.k-serv-row:first-child{ border-top:0; }
.k-serv-n{ font-family:var(--display); color:var(--accent); font-size:1.1rem; }
.k-serv-h{ font-family:var(--display); text-transform:uppercase; font-size:1.15rem; margin:0; }
.k-serv-row p{ margin:6px 0 0; color:var(--ink2); }
.k-serv-price{ font-family:var(--mono); font-size:.85rem; color:var(--accent); }

/* experience / publications */
.k-exp{ display:flex; flex-direction:column; }
.k-exp-row{ display:grid; grid-template-columns:150px 1fr; gap:20px; padding:18px 0; border-top:1px solid var(--line); }
.k-exp-row:first-child{ border-top:0; }
.k-exp-date{ font-family:var(--mono); color:var(--accent); font-size:.82rem; }
.k-exp-row p{ margin:6px 0 0; color:var(--ink2); }
.k-plain{ text-decoration:none; } .k-plain:hover .k-serv-h{ color:var(--accent); }

/* mini grid */
.k-grid2{ display:grid; grid-template-columns:1fr 1fr; gap:16px; }
.k-mini{ background:var(--card); border:2px solid var(--ink); border-radius:4px; padding:18px; text-decoration:none; color:inherit; }
.k-mini-link:hover{ box-shadow:5px 5px 0 var(--accent); }
.k-mini-top{ display:flex; align-items:baseline; justify-content:space-between; gap:10px; flex-wrap:wrap; }
.k-mini p{ margin:6px 0 0; color:var(--ink2); }

/* video */
.k-video{ background:var(--card); border:2px solid var(--ink); border-radius:4px; overflow:hidden; }
.k-video-frame{ position:relative; aspect-ratio:16/9; background:#000; border-bottom:2px solid var(--ink); }
.k-video-frame iframe{ position:absolute; inset:0; width:100%; height:100%; border:0; }
.k-video figcaption{ padding:10px 14px; }

/* zoom blur-fill */
.k-zoom{ position:relative; display:block; padding:0; border:0; cursor:zoom-in; color:inherit; overflow:hidden; background:#111; }
.k-zoom-bg{ position:absolute; inset:0; width:100%; height:100%; object-fit:cover; filter:blur(24px) saturate(1.2); transform:scale(1.2); opacity:.5; }
.k-zoom-img{ position:relative; z-index:1; width:100%; height:100%; object-fit:contain; transition:transform .35s ease; }
.k-zoom:hover .k-zoom-img{ transform:scale(1.05); }
.k-zoom:focus-visible{ outline:2px solid var(--accent); outline-offset:-2px; }

/* quote */
.k-quote{ background:var(--card); border:2px solid var(--ink); border-radius:4px; padding:22px; display:flex; flex-direction:column; gap:12px; }
.k-quote-mark{ font-family:var(--display); color:var(--accent); font-size:3rem; line-height:.4; height:22px; }
.k-quote blockquote{ margin:0; }
.k-quote figcaption{ display:flex; align-items:center; gap:12px; margin-top:auto; }
.k-quote figcaption span{ display:flex; flex-direction:column; line-height:1.2; }
.k-quote figcaption b{ font-family:var(--display); text-transform:uppercase; font-size:.85rem; }
.k-quote figcaption em{ font-style:normal; font-family:var(--mono); font-size:.74rem; color:var(--ink2); }
.k-av{ width:44px; height:44px; flex:0 0 auto; border-radius:2px; overflow:hidden; display:grid; place-items:center; font-family:var(--display); color:#fff; background:var(--ink); }
.k-av img{ width:100%; height:100%; object-fit:cover; }

/* socials */
.k-socials{ display:flex; flex-wrap:wrap; gap:10px; }
.k-soc{ width:42px; height:42px; display:grid; place-items:center; border:2px solid var(--ink); color:var(--ink); text-decoration:none; background:var(--card); transition:background .16s, color .16s, transform .16s; }
.k-soc:hover{ background:var(--ink); color:#fff; transform:translateY(-2px); }
.k-soc svg{ width:17px; height:17px; }

/* contact */
.k-contact{ display:grid; grid-template-columns:1fr 1fr; gap:clamp(20px,4vw,48px); align-items:start; }
.k-cta-big{ font-family:var(--display); text-transform:uppercase; font-size:clamp(2.4rem,7vw,4.4rem); line-height:.92; margin:0 0 24px; letter-spacing:-.02em; }
.k-contact-rows{ display:flex; flex-direction:column; gap:8px; margin-bottom:18px; font-family:var(--mono); }
.k-crow{ text-decoration:none; color:var(--ink); word-break:break-word; }
.k-crow:hover{ color:var(--accent); }
.k-formcard{ background:var(--card); border:2px solid var(--ink); border-radius:4px; padding:clamp(16px,2.6vw,26px); }
.k-formcard :where(input, textarea, select){ width:100%; font-family:var(--body); font-size:.95rem; color:var(--ink); background:var(--bg); border:2px solid var(--ink); border-radius:2px; padding:12px 14px; margin-bottom:12px; }
.k-formcard :where(input, textarea, select):focus{ outline:none; border-color:var(--accent); }
.k-formcard :where(input, textarea, select)::placeholder{ color:var(--ink2); }
.k-formcard textarea{ min-height:110px; resize:vertical; }
.k-formcard :where(button, [type="submit"]){ width:100%; font-family:var(--mono); text-transform:uppercase; letter-spacing:.08em; font-weight:700; cursor:pointer; color:#fff; background:var(--ink); border:2px solid var(--ink); border-radius:2px; padding:13px 18px; transition:background .16s, transform .16s; }
.k-formcard :where(button, [type="submit"]):hover{ background:var(--accent); border-color:var(--accent); transform:translateY(-2px); }
.k-formcard label{ color:var(--ink2); font-size:.84rem; }

/* footer */
.k-footer{ border-top:2px solid var(--ink); }
.k-footer-in{ display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap; padding-block:24px; font-family:var(--mono); text-transform:uppercase; letter-spacing:.08em; font-size:.78rem; }
.k-foot-name{ font-family:var(--display); font-size:1.1rem; }
.k-madewith{ color:var(--accent); text-decoration:none; }

/* lightbox */
.k-lb{ position:fixed; inset:0; z-index:1000; display:grid; place-items:center; padding:clamp(16px,4vw,48px); background:rgba(20,20,20,.9); animation:k-fade .2s ease both; }
.k-lb-fig{ margin:0; max-width:94vw; max-height:92vh; display:flex; flex-direction:column; gap:10px; align-items:center; animation:k-pop .3s cubic-bezier(.2,.85,.25,1) both; }
.k-lb-fig img{ max-width:92vw; max-height:84vh; width:auto; height:auto; object-fit:contain; border:4px solid #fff; }
.k-lb-fig figcaption{ color:#fff; font-family:var(--mono); font-size:.86rem; text-align:center; }
.k-lb-close{ position:fixed; top:18px; right:18px; z-index:1001; width:46px; height:46px; cursor:pointer; color:#fff; background:var(--accent); border:2px solid #fff; font-size:1.05rem; font-weight:700; transition:transform .16s; }
.k-lb-close:hover{ transform:rotate(90deg) scale(1.06); }
.k-lb-close:focus-visible{ outline:2px solid #fff; outline-offset:2px; }
@keyframes k-fade{ from{opacity:0;} to{opacity:1;} }
@keyframes k-pop{ from{opacity:0; transform:scale(.94);} to{opacity:1; transform:none;} }

/* responsive */
@media (max-width:960px){ .k-grid{ grid-template-columns:repeat(2,1fr); } .k-about{ grid-template-columns:1fr; } .k-about-side{ border-left:0; border-top:3px solid var(--accent); padding-left:0; padding-top:16px; } }
@media (max-width:720px){
  .k-skills{ grid-template-columns:1fr; }
  .k-grid2{ grid-template-columns:1fr; }
  .k-contact{ grid-template-columns:1fr; }
  .k-exp-row{ grid-template-columns:1fr; gap:6px; }
  .k-serv-row{ grid-template-columns:auto 1fr; }
  .k-serv-price{ grid-column:2; }
  .k-namerow{ font-size:.68rem; }
  .k-hud-plus, .k-arrow{ display:none; }
  .k-fan{ height:clamp(200px,52vw,260px); }
}
@media (max-width:480px){ .k-grid{ grid-template-columns:1fr; } .k-card{ width:120px; margin-left:-60px; } }

@media (prefers-reduced-motion: reduce){
  .k-root{ scroll-behavior:auto; }
  .k-root *{ animation:none !important; transition:none !important; }
  .k-root.k-ready [data-reveal]{ opacity:1 !important; transform:none !important; }
  .k-root.k-ready [data-reveal] .k-skill-fill{ width:var(--pct); }
}
`;
