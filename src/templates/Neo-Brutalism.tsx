"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import type { PublicPortfolio } from "@/lib/publicTypes";
import { dateRange, videoEmbed, ext } from "@/lib/publicTypes";
import { ContactForm } from "@/components/ContactForm";

/* =====================================================================
   NeoBrutalTemplate — Bold, high-contrast Neo-Brutalism UI.
   Thick borders, hard shadows, uppercase headings, rigid grids,
   and vibrant solid colors. Prefixed `.neo-`.
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

// Neo-Brutalist Color Palette
const NEO_COLORS = ["#7c3aed", "#fde047", "#84cc16", "#f97316", "#0ea5e9", "#ec4899", "#14b8a6"];
const neoColor = (i: number) => NEO_COLORS[((i % NEO_COLORS.length) + NEO_COLORS.length) % NEO_COLORS.length];

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
  discord: "M20.317 4.369a19.79 19.79 0 00-4.885-1.515.074.074 0 00-.079.037c-.211.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.369a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.225-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.893.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.331c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.955 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z",
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
function ArrowUpRight() {
  return (<svg viewBox="0 0 24 24" width="1.2em" height="1.2em" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M7 7h10v10"/></svg>)
}

/* ------------------------------ component ------------------------------ */

export function Neo-Brutalism({ data }: { data: PublicPortfolio }) {
  const p = data.profile;
  const accent = data.accent || "#7c3aed"; // Default to vivid purple

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
    root.classList.add("neo-ready");
    const reduce = typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const targets = root.querySelectorAll("[data-reveal]");
    if (reduce || typeof IntersectionObserver === "undefined") { targets.forEach((el) => el.classList.add("neo-in")); return; }
    const io = new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("neo-in"); io.unobserve(e.target); } }), { threshold: 0, rootMargin: "0px 0px 15% 0px" });
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
    <button type="button" className={`neo-zoom ${className || ""}`} onClick={() => openLb(src, alt, cap)} aria-label={alt ? `View image: ${alt}` : "View image"}>
      <img className="neo-zoom-img" src={src} alt={alt} loading="lazy" />
    </button>
  ), [openLb]);

  const socialRow = (extra?: string) =>
    data.links.length > 0 ? (
      <div className={`neo-socials ${extra || ""}`}>
        {data.links.map((l, i) => (<a key={l.id} className="neo-soc" href={ext(l.url)} target="_blank" rel="noopener noreferrer" aria-label={l.label || l.platform} title={l.label || l.platform} style={{ ["--nc" as string]: neoColor(i) } as CSSProperties}><SocialIcon name={detectSocial(l.platform, l.url, l.label)} /></a>))}
      </div>
    ) : null;

  const LABEL: Record<string, string> = {
    about: "ABOUT", projects: "LATEST WORKS", skills: "SKILLS", services: "CAPABILITIES",
    experience: "EXPERIENCE", education: "EDUCATION", certifications: "CERTIFICATIONS", achievements: "ACHIEVEMENTS",
    publications: "PUBLICATIONS", gallery: "GALLERY", videos: "VIDEOS", testimonials: "WHAT PEOPLE SAY",
  };

  const SectionHeader = ({ title }: { title: string }) => (
    <div className="neo-section-head">
      <h2 className="neo-label">{title}</h2>
    </div>
  );

  const sections: Record<string, (n: number) => ReactNode> = {
    about: (n) => {
      const aboutText = p?.about ?? p?.bio ?? null;
      const photo = data.gallery.find((g) => g.image_url)?.image_url || null;
      return (
        <section className="neo-section neo-bg-white">
          <SectionHeader title={LABEL.about} />
          <div className="neo-about">
            {photo && <div className="neo-about-img" style={{ ["--nc" as string]: neoColor(n) } as CSSProperties}><ZImg src={photo} alt={name} /></div>}
            <div className="neo-about-txt">
              {aboutText && aboutText.split(/\n{2,}/).map((para, i) => <p key={i}>{para}</p>)}
              {p?.resume_url && <a className="neo-btn" href={ext(p.resume_url)} target="_blank" rel="noopener noreferrer" style={{ ["--nc" as string]: neoColor(n + 1) } as CSSProperties}>RESUME <ArrowUpRight /></a>}
            </div>
          </div>
        </section>
      );
    },
    projects: (n) => {
      const ordered = [...data.projects].sort((a, b) => Number(!!b.is_featured) - Number(!!a.is_featured));
      return (
        <section className="neo-section neo-bg-gray">
          <SectionHeader title={LABEL.projects} />
          <div className="neo-grid">
            {ordered.map((pr, i) => (
              <figure key={pr.id} className="neo-card" style={{ ["--nc" as string]: neoColor(i) } as CSSProperties}>
                <div className="neo-card-img">
                  {pr.image_url ? <ZImg src={pr.image_url} alt={pr.title || "Project"} cap={pr.title || undefined} /> : <div className="neo-ph" aria-hidden>{initials(pr.title, "P")}</div>}
                </div>
                <figcaption className="neo-card-content">
                  <div>
                    <h3>{pr.title || "Untitled"}</h3>
                    {(pr.role || (pr.tags && pr.tags[0])) && <span className="neo-tagline">{pr.role || pr.tags[0]}</span>}
                  </div>
                  {pr.url && <a href={ext(pr.url)} target="_blank" rel="noopener noreferrer" className="neo-icon-btn" aria-label="View Project"><ArrowUpRight /></a>}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      );
    },
    skills: (n) => {
      const sorted = [...data.skills].sort((a, b) => (a.category || "").localeCompare(b.category || ""));
      return (
        <section className="neo-section neo-bg-white">
          <SectionHeader title={LABEL.skills} />
          <div className="neo-tags">
            {sorted.map((s, i) => { const lvl = levelPct(s.level); return (<span key={s.id} className="neo-tag" style={{ ["--nc" as string]: neoColor(i) } as CSSProperties}>{s.name}{lvl != null && <b>{Math.round(lvl)}%</b>}</span>); })}
          </div>
        </section>
      );
    },
    services: (n) => (
      <section className="neo-section neo-bg-color" style={{ ["--nc" as string]: neoColor(n) } as CSSProperties}>
        <SectionHeader title={LABEL.services} />
        <div className="neo-grid">
          {data.services.map((s, i) => (
            <div key={s.id} className="neo-card neo-card-pad">
              <div className="neo-box-icon" style={{ ["--nc" as string]: neoColor(i+2) } as CSSProperties} aria-hidden><ArrowUpRight /></div>
              <h3>{s.title}</h3>
              {s.description && <p>{s.description}</p>}
              {s.price && <span className="neo-price">{s.price}</span>}
            </div>
          ))}
        </div>
      </section>
    ),
    experience: (n) => (
      <section className="neo-section neo-bg-white">
        <SectionHeader title={LABEL.experience} />
        <div className="neo-stack">
          {data.experience.map((e, i) => (
            <div key={e.id} className="neo-list-card">
              <div className="neo-list-date" style={{ ["--nc" as string]: neoColor(i) } as CSSProperties}>{dateRange(e.start_date, e.end_date, e.is_current)}</div>
              <div className="neo-list-content">
                <h3>{e.title || e.company || "Role"}</h3>
                <span className="neo-tagline">{[e.company, e.location].filter(Boolean).join(" · ")}</span>
                {e.description && <p>{e.description}</p>}
              </div>
            </div>
          ))}
        </div>
      </section>
    ),
    education: (n) => (
      <section className="neo-section neo-bg-gray">
        <SectionHeader title={LABEL.education} />
        <div className="neo-grid">
          {data.education.map((ed, i) => (
            <div key={ed.id} className="neo-card neo-card-pad" style={{ ["--nc" as string]: neoColor(i) } as CSSProperties}>
              <h3>{ed.school || "School"}</h3>
              <span className="neo-date-badge">{dateRange(ed.start_date, ed.end_date)}</span>
              {(ed.degree || ed.field) && <p className="neo-bold-p">{[ed.degree, ed.field].filter(Boolean).join(", ")}</p>}
              {ed.description && <p>{ed.description}</p>}
            </div>
          ))}
        </div>
      </section>
    ),
    certifications: (n) => (
      <section className="neo-section neo-bg-white">
        <SectionHeader title={LABEL.certifications} />
        <div className="neo-grid">
          {data.certifications.map((c, i) => { 
            const body = (
              <>
                <h3>{c.name}</h3>
                <div className="neo-flex-btw">
                  {c.issuer && <span className="neo-tagline">{c.issuer}</span>}
                  {oneDate(c.issue_date) && <span className="neo-date-badge">{oneDate(c.issue_date)}</span>}
                </div>
              </>
            ); 
            return c.url ? <a key={c.id} className="neo-card neo-card-pad neo-link-card" style={{ ["--nc" as string]: neoColor(i) } as CSSProperties} href={ext(c.url)} target="_blank" rel="noopener noreferrer">{body}</a> : <div key={c.id} className="neo-card neo-card-pad" style={{ ["--nc" as string]: neoColor(i) } as CSSProperties}>{body}</div>; 
          })}
        </div>
      </section>
    ),
    achievements: (n) => (
      <section className="neo-section neo-bg-gray">
        <SectionHeader title={LABEL.achievements} />
        <ul className="neo-stack">
          {data.achievements.map((a, i) => (
            <li key={a.id} className="neo-list-card">
               <div className="neo-list-date" style={{ ["--nc" as string]: neoColor(i) } as CSSProperties}>{oneDate(a.date) || "★"}</div>
               <div className="neo-list-content">
                  <h3>{a.title}</h3>
                  {a.description && <p>{a.description}</p>}
               </div>
            </li>
          ))}
        </ul>
      </section>
    ),
    publications: (n) => (
      <section className="neo-section neo-bg-white">
        <SectionHeader title={LABEL.publications} />
        <ul className="neo-stack">
          {data.publications.map((pub, i) => { 
            const meta = [pub.publisher, oneDate(pub.date)].filter(Boolean).join(" · "); 
            const inner = (
              <div className="neo-list-content">
                <h3 className="neo-flex-align">{pub.title}{pub.url && <ArrowUpRight />}</h3>
                {meta && <span className="neo-tagline">{meta}</span>}
                {pub.description && <p>{pub.description}</p>}
              </div>
            ); 
            return (<li key={pub.id} className="neo-list-card" style={{ ["--nc" as string]: neoColor(i) } as CSSProperties}>{pub.url ? <a className="neo-plainlink" href={ext(pub.url)} target="_blank" rel="noopener noreferrer">{inner}</a> : inner}</li>); 
          })}
        </ul>
      </section>
    ),
    gallery: (n) => (
      <section className="neo-section neo-bg-gray">
        <SectionHeader title={LABEL.gallery} />
        <div className="neo-masonry">
          {data.gallery.map((g, i) => g.image_url ? (
            <figure key={g.id} className="neo-card" style={{ ["--nc" as string]: neoColor(i) } as CSSProperties}>
              <ZImg src={g.image_url} alt={g.caption || "Photo"} cap={g.caption || undefined} />
              {g.caption && <figcaption className="neo-card-pad neo-border-top"><b>{g.caption}</b></figcaption>}
            </figure>
          ) : null)}
        </div>
      </section>
    ),
    videos: (n) => (
      <section className="neo-section neo-bg-white">
        <SectionHeader title={LABEL.videos} />
        <div className="neo-grid">
          {data.videos.map((v, i) => { 
            const src = v.url ? videoEmbed(v.url) : null; 
            if (!src) return null; 
            return (
              <figure key={v.id} className="neo-card" style={{ ["--nc" as string]: neoColor(i) } as CSSProperties}>
                <div className="neo-video-frame">
                  <iframe src={src} title={v.title || "Video"} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                </div>
                {v.title && <figcaption className="neo-card-pad neo-border-top"><b>{v.title}</b></figcaption>}
              </figure>
            ); 
          })}
        </div>
      </section>
    ),
    testimonials: (n) => (
      <section className="neo-section neo-bg-color" style={{ ["--nc" as string]: neoColor(n) } as CSSProperties}>
        <SectionHeader title={LABEL.testimonials} />
        <div className="neo-grid">
          {data.testimonials.map((t, i) => (
            <figure key={t.id} className="neo-card neo-card-pad neo-bg-white" style={{ ["--nc" as string]: neoColor(i+1) } as CSSProperties}>
              {t.quote && <blockquote className="neo-quote">“{t.quote}”</blockquote>}
              <figcaption className="neo-author">
                <span className="neo-av" aria-hidden>{t.avatar_url ? <img src={t.avatar_url} alt="" loading="lazy" /> : initials(t.author, "★")}</span>
                <div>
                  <b>{t.author}</b>
                  {t.role && <span className="neo-tagline">{t.role}</span>}
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    ),
  };

  let n = 0;
  const numbered = order.map((k) => { n += 1; return { k, n }; });

  return (
    <div ref={rootRef} className="neo-root" data-theme="neobrutal" style={{ ["--tpl-accent" as string]: accent } as CSSProperties}>
      <style dangerouslySetInnerHTML={{ __html: NEO_CSS }} />

      <main className="neo-layout">
        
        {/* HERO */}
        <header className="neo-hero" id="top">
          <div className="neo-hero-inner">
            <h1 className="neo-title" aria-label={name}>{name.toUpperCase()}</h1>
            {p?.title && <h2 className="neo-subtitle">{p.title}</h2>}
            {(p?.tagline || p?.bio) && <p className="neo-intro">{p?.tagline || p?.bio}</p>}
            
            <div className="neo-hero-actions">
              {socialRow()}
              {(p?.location || p?.availability) && <span className="neo-avail">{[p?.location, p?.availability].filter(Boolean).join(" · ")}</span>}
            </div>
          </div>
          
          {/* Abstract Hero Shapes */}
          <div className="neo-shape neo-shape-1" style={{ ["--nc" as string]: neoColor(0) } as CSSProperties} aria-hidden />
          <div className="neo-shape neo-shape-2" style={{ ["--nc" as string]: neoColor(1) } as CSSProperties} aria-hidden />
        </header>

        {/* SECTIONS */}
        {numbered.map(({ k, n }) => (
          <div key={k} id={k === "projects" ? "work" : k} data-reveal className="neo-reveal">{sections[k] ? sections[k](n) : null}</div>
        ))}

        {/* CONTACT */}
        {username && (
          <div id="contact" data-reveal className="neo-reveal">
            <section className="neo-section neo-bg-white">
              <SectionHeader title="STAY IN THE LOOP" />
              <div className="neo-contact">
                <div className="neo-contact-left">
                  <h3>LET'S CONNECT</h3>
                  <p>Reach out for collaborations, opportunities, or just to say hi.</p>
                  <div className="neo-contact-links">
                    {p?.email && <a className="neo-btn" href={`mailto:${p.email}`}>EMAIL <ArrowUpRight/></a>}
                    {p?.phone && <a className="neo-btn" href={`tel:${p.phone}`} style={{ ["--nc" as string]: neoColor(2) } as CSSProperties}>CALL <ArrowUpRight/></a>}
                    {p?.website && <a className="neo-btn" href={ext(p.website)} target="_blank" rel="noopener noreferrer" style={{ ["--nc" as string]: neoColor(3) } as CSSProperties}>WEBSITE <ArrowUpRight/></a>}
                  </div>
                </div>
                <div className="neo-card neo-formcard">
                  <ContactForm username={username} />
                </div>
              </div>
            </section>
          </div>
        )}

        {/* FOOTER */}
        <footer className="neo-footer">
          <div className="neo-footer-inner">
             <div className="neo-footer-brand">
               <b>{name.toUpperCase()}</b>
               <span>© {new Date().getFullYear()} All rights reserved.</span>
             </div>
             {!data.hide_branding && (
                <a className="neo-madewith" href="https://folio.assetprim.com" target="_blank" rel="noopener noreferrer">MADE WITH FOLIO <ArrowUpRight/></a>
             )}
          </div>
        </footer>
      </main>

      {/* LIGHTBOX */}
      {lb && (
        <div className="neo-lb" role="dialog" aria-modal="true" aria-label="Image viewer" onClick={() => setLb(null)}>
          <div className="neo-lb-card" onClick={(e) => e.stopPropagation()}>
            <button ref={closeRef} type="button" className="neo-lb-close" onClick={() => setLb(null)} aria-label="Close image viewer">✕</button>
            <figure className="neo-lb-fig"><img src={lb.src} alt={lb.alt} />{lb.cap && <figcaption>{lb.cap}</figcaption>}</figure>
          </div>
        </div>
      )}
    </div>
  );
}

export default Neo-Brutalism;

/* =====================================================================
   STYLES — Bold Neo-Brutalism. Prefixed `.neo-`.
   ===================================================================== */

const NEO_CSS = `
.neo-root{
  --acc: var(--tpl-accent, #7c3aed);
  --border-width: 3px;
  --border-color: #000;
  --shadow-color: #000;
  --shadow: 4px 4px 0px var(--shadow-color);
  --shadow-hover: 2px 2px 0px var(--shadow-color);
  --radius: 4px; /* Slight rounding for structural elements */
  
  --bg-main: #fdfdfd;
  --bg-gray: #f0f0f0;
  
  --display: "Space Grotesk", "Syne", "Archivo Black", system-ui, -apple-system, sans-serif;
  --body: "Space Grotesk", system-ui, -apple-system, sans-serif;
  
  position: relative; isolation: isolate; 
  color: var(--border-color); 
  font-family: var(--body); 
  font-size: 16px; 
  line-height: 1.5;
  -webkit-font-smoothing: antialiased; 
  overflow-x: clip; 
  min-height: 100%; 
  background: var(--bg-main);
}
.neo-root *{ box-sizing: border-box; }
.neo-root img{ max-width: 100%; display: block; }
.neo-root a{ color: inherit; text-decoration: none; }
.neo-root h1, .neo-root h2, .neo-root h3, .neo-root p, .neo-root blockquote{ overflow-wrap: anywhere; margin: 0; }

/* Layout Structure */
.neo-layout {
  max-width: 1400px;
  margin: 0 auto;
  border-left: var(--border-width) solid var(--border-color);
  border-right: var(--border-width) solid var(--border-color);
  background: var(--bg-main);
  min-height: 100vh;
}
@media (max-width: 1400px) {
  .neo-layout { border-left: none; border-right: none; }
}

/* Animations */
.neo-root.neo-ready [data-reveal]{ opacity:0; transform:translateY(30px); transition:opacity .4s ease-out, transform .4s ease-out; will-change:opacity, transform; }
.neo-root.neo-ready [data-reveal].neo-in{ opacity:1; transform:none; }

/* Global Utilities */
.neo-bg-white { background: #fff; }
.neo-bg-gray { background: var(--bg-gray); }
.neo-bg-color { background: var(--nc, var(--acc)); border-bottom: var(--border-width) solid var(--border-color); }
.neo-border-top { border-top: var(--border-width) solid var(--border-color); }

/* Typography */
h1, h2, h3 { font-family: var(--display); font-weight: 800; text-transform: uppercase; }
p { font-weight: 500; font-size: 1rem; }
.neo-bold-p { font-weight: 700; font-size: 1.05rem; }
.neo-tagline { display: block; font-size: 0.85rem; font-weight: 700; opacity: 0.8; text-transform: uppercase; margin-top: 4px; }

/* Hero Section */
.neo-hero {
  position: relative;
  padding: clamp(60px, 10vw, 120px) clamp(20px, 5vw, 60px);
  border-bottom: var(--border-width) solid var(--border-color);
  overflow: hidden;
  background: var(--bg-main);
  background-image: radial-gradient(#000 1px, transparent 1px);
  background-size: 24px 24px;
}
.neo-hero-inner {
  position: relative;
  z-index: 2;
  max-width: 800px;
}
.neo-title {
  font-size: clamp(3rem, 8vw, 6rem);
  line-height: 0.95;
  letter-spacing: -0.02em;
  margin-bottom: 20px;
  text-shadow: 4px 4px 0px var(--acc);
}
.neo-subtitle {
  font-size: clamp(1.2rem, 3vw, 2rem);
  background: var(--border-color);
  color: #fff;
  display: inline-block;
  padding: 6px 12px;
  margin-bottom: 24px;
}
.neo-intro {
  font-size: clamp(1.1rem, 2vw, 1.25rem);
  font-weight: 600;
  max-width: 600px;
  margin-bottom: 32px;
  background: #fff;
  padding: 8px;
  border: var(--border-width) solid var(--border-color);
  box-shadow: var(--shadow);
}
.neo-hero-actions { display: flex; align-items: center; gap: 20px; flex-wrap: wrap; }
.neo-avail { font-family: var(--display); font-weight: 700; background: var(--acc); padding: 8px 16px; border: var(--border-width) solid var(--border-color); text-transform: uppercase; }

/* Hero Abstract Shapes */
.neo-shape { position: absolute; z-index: 1; border: var(--border-width) solid var(--border-color); background: var(--nc, var(--acc)); }
.neo-shape-1 { width: 300px; height: 300px; border-radius: 50%; right: -50px; top: -50px; box-shadow: var(--shadow); }
.neo-shape-2 { width: 200px; height: 400px; border-radius: 100px 100px 0 0; right: 200px; bottom: -100px; }

/* Section Base */
.neo-section {
  padding: clamp(40px, 6vw, 80px) clamp(20px, 5vw, 60px);
  border-bottom: var(--border-width) solid var(--border-color);
}
.neo-section-head {
  margin-bottom: 40px;
}
.neo-label {
  display: inline-block;
  font-size: clamp(1.5rem, 3vw, 2.5rem);
  background: var(--border-color);
  color: #fff;
  padding: 8px 16px;
  box-shadow: 4px 4px 0px var(--acc);
}

/* Grids & Cards */
.neo-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 32px; }
.neo-masonry { columns: 3 320px; column-gap: 32px; }
.neo-masonry > * { break-inside: avoid; margin-bottom: 32px; }

.neo-card {
  background: #fff;
  border: var(--border-width) solid var(--border-color);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  transition: transform 0.2s, box-shadow 0.2s;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.neo-card:hover {
  transform: translate(2px, 2px);
  box-shadow: var(--shadow-hover);
}
.neo-card-pad { padding: 24px; }
.neo-link-card { display: block; cursor: pointer; background: var(--nc, #fff); }

/* Buttons & Interactive */
.neo-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  background: var(--nc, var(--acc));
  color: var(--border-color);
  font-family: var(--display);
  font-weight: 800;
  font-size: 1rem;
  padding: 12px 24px;
  border: var(--border-width) solid var(--border-color);
  box-shadow: var(--shadow);
  text-transform: uppercase;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
}
.neo-btn:hover { transform: translate(2px, 2px); box-shadow: var(--shadow-hover); }

.neo-icon-btn {
  display: flex; align-items: center; justify-content: center;
  width: 44px; height: 44px;
  background: var(--bg-main);
  border: var(--border-width) solid var(--border-color);
  box-shadow: 2px 2px 0px var(--border-color);
  transition: all 0.15s;
}
.neo-icon-btn:hover { background: var(--border-color); color: #fff; }

.neo-socials { display: flex; flex-wrap: wrap; gap: 12px; }
.neo-soc {
  display: grid; place-items: center;
  width: 48px; height: 48px;
  background: var(--nc, #fff);
  border: var(--border-width) solid var(--border-color);
  box-shadow: 3px 3px 0px var(--border-color);
  transition: transform 0.15s, box-shadow 0.15s;
}
.neo-soc:hover { transform: translate(2px, 2px); box-shadow: 1px 1px 0px var(--border-color); }
.neo-soc svg { width: 22px; height: 22px; }

/* Badges & Tags */
.neo-tags { display: flex; flex-wrap: wrap; gap: 16px; }
.neo-tag {
  font-family: var(--display);
  font-weight: 700;
  background: var(--nc, #fff);
  padding: 8px 16px;
  border: var(--border-width) solid var(--border-color);
  box-shadow: 3px 3px 0px var(--border-color);
  display: inline-flex; align-items: center; gap: 8px;
  text-transform: uppercase;
}
.neo-tag b { font-weight: 800; opacity: 0.8; }
.neo-date-badge {
  display: inline-block;
  background: var(--border-color);
  color: #fff;
  font-family: var(--display);
  font-size: 0.8rem;
  font-weight: 700;
  padding: 4px 8px;
  margin: 8px 0;
}
.neo-price {
  display: inline-block; margin-top: 16px;
  font-family: var(--display); font-size: 1.1rem; font-weight: 800;
  background: #fff; border: var(--border-width) dashed var(--border-color); padding: 4px 12px;
}

/* Flex Utilities */
.neo-flex-btw { display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 10px; }
.neo-flex-align { display: flex; align-items: center; gap: 8px; }

/* Sections Specific */
/* About */
.neo-about { display: flex; gap: 40px; align-items: stretch; flex-wrap: wrap; }
.neo-about-img {
  flex: 0 0 300px;
  background: var(--nc, var(--acc));
  border: var(--border-width) solid var(--border-color);
  box-shadow: var(--shadow);
  padding: 12px;
}
.neo-about-img .neo-zoom { aspect-ratio: 1; border: var(--border-width) solid var(--border-color); width: 100%; display: block; overflow: hidden; }
.neo-about-img img { width: 100%; height: 100%; object-fit: cover; }
.neo-about-txt { flex: 1; min-width: 300px; font-size: 1.1rem; }
.neo-about-txt p { margin-bottom: 20px; }

/* Projects */
.neo-card-img { border-bottom: var(--border-width) solid var(--border-color); background: var(--nc, #fff); }
.neo-card-img .neo-zoom { display: block; width: 100%; aspect-ratio: 16/10; overflow: hidden; border: none; padding: 0; background: transparent; cursor: zoom-in; }
.neo-card-img img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
.neo-card-img .neo-zoom:hover img { transform: scale(1.05); }
.neo-ph { width: 100%; aspect-ratio: 16/10; display: grid; place-items: center; font-family: var(--display); font-size: 3rem; font-weight: 800; color: #fff; }
.neo-card-content { padding: 20px; display: flex; justify-content: space-between; align-items: center; gap: 16px; background: #fff; flex: 1; }

/* Services */
.neo-box-icon { width: 56px; height: 56px; border: var(--border-width) solid var(--border-color); background: var(--nc, #fff); box-shadow: 4px 4px 0px var(--border-color); display: grid; place-items: center; margin-bottom: 20px; font-size: 1.5rem; }

/* Lists (Experience/Achievements/Pubs) */
.neo-stack { display: flex; flex-direction: column; gap: 24px; list-style: none; padding: 0; margin: 0; }
.neo-list-card {
  display: flex; gap: 24px; align-items: stretch;
  background: #fff;
  border: var(--border-width) solid var(--border-color);
  box-shadow: var(--shadow);
  transition: transform 0.2s;
}
.neo-list-card:hover { transform: translateX(4px); }
.neo-list-date {
  flex: 0 0 160px;
  background: var(--nc, var(--bg-gray));
  border-right: var(--border-width) solid var(--border-color);
  padding: 24px;
  font-family: var(--display); font-weight: 800; font-size: 1.1rem;
  display: flex; align-items: center; justify-content: center; text-align: center;
}
.neo-list-content { padding: 24px; flex: 1; }
.neo-list-content p { margin-top: 12px; }

/* Videos */
.neo-video-frame { position: relative; aspect-ratio: 16/9; background: #000; }
.neo-video-frame iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; }

/* Testimonials */
.neo-quote { font-size: 1.1rem; font-weight: 600; font-style: italic; margin-bottom: 24px; flex: 1; }
.neo-author { display: flex; align-items: center; gap: 16px; }
.neo-av { width: 56px; height: 56px; border: var(--border-width) solid var(--border-color); border-radius: 50%; overflow: hidden; display: grid; place-items: center; background: var(--border-color); color: #fff; font-family: var(--display); font-weight: 800; font-size: 1.2rem; }
.neo-av img { width: 100%; height: 100%; object-fit: cover; }

/* Contact Form Overrides */
.neo-contact { display: grid; grid-template-columns: 1fr 1.2fr; gap: 40px; }
.neo-contact-left { padding-right: 20px; }
.neo-contact-left h3 { font-size: 2.5rem; margin-bottom: 16px; }
.neo-contact-left p { margin-bottom: 32px; font-size: 1.1rem; }
.neo-contact-links { display: flex; flex-direction: column; gap: 16px; align-items: flex-start; }
.neo-formcard { padding: 32px; background: var(--bg-gray); }

/* Force NeoBrutal styling on internal form elements */
.neo-formcard :where(input, textarea, select) {
  width: 100%;
  font-family: var(--body); font-weight: 600; font-size: 1rem;
  background: #fff; color: var(--border-color);
  border: var(--border-width) solid var(--border-color);
  padding: 14px; margin-bottom: 20px;
  box-shadow: 3px 3px 0px var(--border-color);
  transition: box-shadow 0.2s, transform 0.2s;
  border-radius: 0;
}
.neo-formcard :where(input, textarea, select):focus { outline: none; box-shadow: 1px 1px 0px var(--border-color); transform: translate(2px, 2px); }
.neo-formcard textarea { min-height: 140px; resize: vertical; }
.neo-formcard label { font-family: var(--display); font-weight: 700; text-transform: uppercase; margin-bottom: 8px; display: block; }
.neo-formcard :where(button, [type="submit"]) {
  width: 100%;
  background: var(--acc); color: var(--border-color);
  font-family: var(--display); font-weight: 800; font-size: 1.1rem; text-transform: uppercase;
  padding: 16px;
  border: var(--border-width) solid var(--border-color);
  box-shadow: var(--shadow);
  cursor: pointer; transition: transform 0.15s, box-shadow 0.15s;
}
.neo-formcard :where(button, [type="submit"]):hover { transform: translate(2px, 2px); box-shadow: var(--shadow-hover); }

/* Footer */
.neo-footer { border-top: var(--border-width) solid var(--border-color); background: #fff; padding: 40px clamp(20px, 5vw, 60px); }
.neo-footer-inner { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 24px; }
.neo-footer-brand { display: flex; flex-direction: column; gap: 4px; }
.neo-footer-brand b { font-family: var(--display); font-size: 1.5rem; }
.neo-footer-brand span { font-weight: 600; }
.neo-madewith { display: inline-flex; align-items: center; gap: 6px; font-family: var(--display); font-weight: 800; padding: 8px 16px; border: var(--border-width) solid var(--border-color); background: var(--bg-gray); box-shadow: 3px 3px 0px var(--border-color); }
.neo-madewith:hover { background: var(--acc); }

/* Lightbox */
.neo-lb { position: fixed; inset: 0; z-index: 1000; display: grid; place-items: center; padding: 24px; background: rgba(0,0,0,0.8); animation: neo-fade 0.2s ease both; }
.neo-lb-card { position: relative; background: #fff; border: var(--border-width) solid var(--border-color); padding: 16px; max-width: 95vw; max-height: 95vh; box-shadow: 8px 8px 0px #000; animation: neo-pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) both; }
.neo-lb-fig { margin: 0; display: flex; flex-direction: column; gap: 12px; align-items: center; }
.neo-lb-fig img { max-width: 90vw; max-height: 80vh; width: auto; height: auto; object-fit: contain; border: var(--border-width) solid var(--border-color); }
.neo-lb-fig figcaption { font-family: var(--display); font-weight: 700; text-transform: uppercase; }
.neo-lb-close { position: absolute; top: -20px; right: -20px; width: 48px; height: 48px; border-radius: 50%; cursor: pointer; color: var(--border-color); background: var(--acc); border: var(--border-width) solid var(--border-color); font-size: 1.2rem; font-weight: 800; box-shadow: 4px 4px 0px #000; transition: transform 0.1s; }
.neo-lb-close:hover { transform: translate(2px, 2px); box-shadow: 2px 2px 0px #000; }

@keyframes neo-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes neo-pop { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: none; } }

/* Responsive adjustments */
@media (max-width: 900px) {
  .neo-masonry { columns: 2 280px; }
  .neo-contact { grid-template-columns: 1fr; }
  .neo-list-card { flex-direction: column; gap: 0; }
  .neo-list-date { flex: none; border-right: none; border-bottom: var(--border-width) solid var(--border-color); padding: 16px; justify-content: flex-start; }
}

@media (max-width: 600px) {
  .neo-grid { grid-template-columns: 1fr; }
  .neo-masonry { columns: 1 auto; }
  .neo-about { flex-direction: column; }
  .neo-about-img { flex: none; width: 100%; max-width: 400px; margin: 0 auto; }
  .neo-shape-1 { width: 150px; height: 150px; right: -20px; top: -20px; }
  .neo-shape-2 { display: none; }
  .neo-title { font-size: 3rem; }
  .neo-footer-inner { flex-direction: column; align-items: flex-start; }
}

@media (prefers-reduced-motion: reduce) {
  .neo-root { scroll-behavior: auto; }
  .neo-root * { animation: none !important; transition: none !important; }
  .neo-root.neo-ready [data-reveal] { opacity: 1 !important; transform: none !important; }
}
`;
