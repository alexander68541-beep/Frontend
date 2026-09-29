"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import type { PublicPortfolio } from "@/lib/publicTypes";
import { dateRange, videoEmbed, ext } from "@/lib/publicTypes";
import { ContactForm } from "@/components/ContactForm";

/* =====================================================================
   NovaTemplate — "Nova OS" — futuristic dark glassmorphism widget UI.
   Inspired by an iOS control-center / phone home-screen collage.
   DARK ONLY (no light theme). PURE PRESENTATION from `data`.
   Styles self-contained, prefixed `.nova-`, scoped under `.nova-root`.
   Lessons baked in: only useCallback in-render components, blur-fill
   images that fit any size, stable reveal.
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

/* ---- little system-UI glyphs (decorative) ---- */
function GSignal() { return (<svg viewBox="0 0 24 16" width="20" height="14" aria-hidden fill="currentColor"><rect x="0" y="10" width="3.4" height="6" rx="1" /><rect x="6" y="7" width="3.4" height="9" rx="1" /><rect x="12" y="4" width="3.4" height="12" rx="1" /><rect x="18" y="1" width="3.4" height="15" rx="1" opacity=".5" /></svg>); }
function GWifi() { return (<svg viewBox="0 0 24 18" width="20" height="15" aria-hidden fill="currentColor"><path d="M12 3C7.5 3 3.7 4.7 1 7.4l2 2C5.3 7.1 8.5 5.8 12 5.8s6.7 1.3 9 3.6l2-2C20.3 4.7 16.5 3 12 3zm0 5.6c-2.6 0-5 1-6.7 2.7l2 2A6.6 6.6 0 0112 11.3c1.8 0 3.5.7 4.7 2l2-2A9.4 9.4 0 0012 8.6zm0 5.4a3 3 0 100 6 3 3 0 000-6z" /></svg>); }
function GBattery() { return (<svg viewBox="0 0 30 16" width="26" height="14" aria-hidden><rect x="1" y="2" width="24" height="12" rx="3" fill="none" stroke="currentColor" strokeWidth="1.5" opacity=".6" /><rect x="3" y="4" width="18" height="8" rx="1.5" fill="currentColor" /><rect x="26.5" y="5.5" width="2.5" height="5" rx="1" fill="currentColor" opacity=".6" /></svg>); }
function GMoon() { return (<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden fill="currentColor"><path d="M12.3 2a10 10 0 109.4 13.3A8 8 0 0112.3 2z" /></svg>); }

/* ------------------------------ component ------------------------------ */

export function NovaTemplate({ data }: { data: PublicPortfolio }) {
  const p = data.profile;
  const accent = data.accent || "#4d9fff";

  const hidden = new Set(data.settings?.hidden ?? []);
  const sv = (k: string) => !hidden.has(k);
  const username = data.username;
  const name = p?.display_name || username || "Your Name";
  const mono = initials(p?.display_name, username);

  const [lb, setLb] = useState<{ src: string; alt: string; cap?: string } | null>(null);
  const [clock, setClock] = useState("");
  const rootRef = useRef<HTMLDivElement | null>(null);
  const tiltRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const openLb = useCallback((src: string, alt: string, cap?: string) => setLb({ src, alt, cap }), []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    root.classList.add("nova-anim-ready");
    const reduce = typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const targets = root.querySelectorAll("[data-reveal],[data-bar]");
    if (reduce || typeof IntersectionObserver === "undefined") { targets.forEach((el) => el.classList.add("nova-in")); return; }
    const io = new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("nova-in"); io.unobserve(e.target); } }), { threshold: 0.1, rootMargin: "0px 0px -6% 0px" });
    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // live clock (client only → no hydration mismatch)
  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    tick();
    const id = window.setInterval(tick, 30000);
    return () => window.clearInterval(id);
  }, []);

  // 3D parallax tilt on the hero cluster (desktop pointer only)
  useEffect(() => {
    const el = tiltRef.current;
    if (!el) return;
    const mm = (q: string) => (typeof window.matchMedia === "function" ? window.matchMedia(q) : null);
    if (mm("(prefers-reduced-motion: reduce)")?.matches) return;
    if (mm("(pointer: fine)") && !mm("(pointer: fine)")!.matches) return;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty("--rx", `${(-y * 5).toFixed(2)}deg`);
      el.style.setProperty("--ry", `${(x * 6).toFixed(2)}deg`);
    };
    const reset = () => { el.style.setProperty("--rx", "0deg"); el.style.setProperty("--ry", "0deg"); };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", reset);
    return () => { el.removeEventListener("pointermove", onMove); el.removeEventListener("pointerleave", reset); };
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
    { href: "#contact", label: "Contact", on: has.contact },
  ];
  const navItems = navSpec.filter((n) => n.on);

  const ZImg = useCallback(({ src, alt, cap, className }: { src: string; alt: string; cap?: string; className?: string }) => (
    <button type="button" className={`nova-zoom ${className || ""}`} onClick={() => openLb(src, alt, cap)} aria-label={alt ? `View image: ${alt}` : "View image"}>
      <img className="nova-zoom-bg" src={src} alt="" aria-hidden loading="lazy" />
      <img className="nova-zoom-img" src={src} alt={alt} loading="lazy" />
    </button>
  ), [openLb]);

  const socialRow = (extra?: string) =>
    data.links.length > 0 ? (
      <div className={`nova-socials ${extra || ""}`}>
        {data.links.map((l) => (
          <a key={l.id} className="nova-soc" href={ext(l.url)} target="_blank" rel="noopener noreferrer" aria-label={l.label || l.platform} title={l.label || l.platform}><SocialIcon name={detectSocial(l.platform, l.url, l.label)} /></a>
        ))}
      </div>
    ) : null;

  const head = (label: string, heading: string) => (
    <div className="nova-sec-head">
      <span className="nova-pill">{label}</span>
      <h2 className="nova-h2">{heading}</h2>
    </div>
  );

  const sections: Record<string, () => ReactNode> = {
    about: () => {
      if (!has.about) return null;
      const aboutText = p?.about ?? p?.bio ?? null;
      const photo = data.gallery.find((g) => g.image_url)?.image_url || p?.avatar_url || null;
      return (
        <section id="about" data-sec="about" data-reveal className="nova-section">
          {head("PENULIS", "Introduce My Self")}
          <div className="nova-glass nova-about">
            {photo && <div className="nova-about-photo"><ZImg src={photo} alt={name} className="nova-zoom-fill" /></div>}
            <div className="nova-about-txt">
              {aboutText && aboutText.split(/\n{2,}/).map((para, i) => <p key={i}>{para}</p>)}
              {p?.resume_url && <a className="nova-btn nova-btn-accent nova-mt" href={ext(p.resume_url)} target="_blank" rel="noopener noreferrer">Download CV <span aria-hidden>↓</span></a>}
            </div>
          </div>
        </section>
      );
    },

    projects: () => {
      if (!has.projects) return null;
      const ordered = [...data.projects].sort((a, b) => Number(!!b.is_featured) - Number(!!a.is_featured));
      return (
        <section id="work" data-sec="projects" data-reveal className="nova-section">
          {head("DESIGN", "Selected Work")}
          <div className="nova-grid-3">
            {ordered.map((pr) => {
              const category = pr.role || (pr.tags && pr.tags[0]) || null;
              return (
                <article key={pr.id} className="nova-glass nova-proj">
                  <div className="nova-proj-media">
                    {pr.image_url ? <ZImg src={pr.image_url} alt={pr.title || "Project image"} cap={pr.title || undefined} /> : <div className="nova-ph" aria-hidden>{initials(pr.title, "P")}</div>}
                    {pr.is_featured && <span className="nova-badge">★</span>}
                  </div>
                  <div className="nova-proj-body">
                    <div className="nova-proj-titlerow">
                      <h3 className="nova-card-title">{pr.title || "Untitled"}</h3>
                      {pr.url && <a className="nova-go" href={ext(pr.url)} target="_blank" rel="noopener noreferrer" aria-label={`Open ${pr.title || "project"}`}>↗</a>}
                    </div>
                    {category && <p className="nova-muted nova-small">{category}</p>}
                    {pr.tags && pr.tags.length > 0 && <div className="nova-tags">{pr.tags.slice(0, 3).map((t) => <span key={t} className="nova-tag">{t}</span>)}</div>}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      );
    },

    skills: () => {
      if (!has.skills) return null;
      const sorted = [...data.skills].sort((a, b) => (a.category || "").localeCompare(b.category || ""));
      return (
        <section id="skills" data-sec="skills" data-reveal className="nova-section">
          {head("GRAFIS", "Skills")}
          <div className="nova-skills">
            {sorted.map((s) => {
              const lvl = levelPct(s.level);
              return (
                <div key={s.id} className="nova-glass nova-skill" data-bar style={{ ["--pct" as string]: `${lvl ?? 0}%` } as CSSProperties}>
                  <span className="nova-skill-ic" aria-hidden>{initials(s.name, "•")}</span>
                  <span className="nova-skill-name">{s.name}</span>
                  {lvl != null && <span className="nova-skill-bar" role="progressbar" aria-valuenow={Math.round(lvl)} aria-valuemin={0} aria-valuemax={100} aria-label={`${s.name} level`}><span className="nova-skill-fill" /></span>}
                </div>
              );
            })}
          </div>
        </section>
      );
    },

    services: () => {
      if (!has.services) return null;
      return (
        <section id="services" data-sec="services" data-reveal className="nova-section">
          {head("WRITER", "What I Do")}
          <div className="nova-grid-3">
            {data.services.map((s) => (
              <article key={s.id} className="nova-glass nova-card">
                <span className="nova-card-ic" aria-hidden>{initials(s.title, "S")}</span>
                <h3 className="nova-card-title">{s.title}</h3>
                {s.description && <p className="nova-muted nova-clamp-3">{s.description}</p>}
                <div className="nova-card-foot">{s.price && <span className="nova-price">{s.price}</span>}<span className="nova-arrow" aria-hidden>↗</span></div>
              </article>
            ))}
          </div>
        </section>
      );
    },

    experience: () => {
      if (!has.experience) return null;
      return (
        <section id="experience" data-sec="experience" data-reveal className="nova-section">
          {head("TIMELINE", "Experience")}
          <div className="nova-timeline">
            {data.experience.map((e) => (
              <article key={e.id} className="nova-glass nova-tl-item">
                <span className="nova-tl-dot" aria-hidden />
                <span className="nova-tl-date">{dateRange(e.start_date, e.end_date, e.is_current)}</span>
                <div>
                  <h3 className="nova-card-title">{e.title || e.company || "Role"}</h3>
                  <p className="nova-muted nova-small">{[e.company, e.location].filter(Boolean).join(" · ")}</p>
                  {e.description && <p className="nova-muted">{e.description}</p>}
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
        <section id="education" data-sec="education" data-reveal className="nova-section">
          {head("STUDY", "Education")}
          <div className="nova-grid-2">
            {data.education.map((ed) => (
              <article key={ed.id} className="nova-glass nova-card">
                <div className="nova-card-foot nova-card-foot-top"><h3 className="nova-card-title">{ed.school || "School"}</h3><span className="nova-price">{dateRange(ed.start_date, ed.end_date)}</span></div>
                {(ed.degree || ed.field) && <p className="nova-muted">{[ed.degree, ed.field].filter(Boolean).join(", ")}</p>}
                {ed.description && <p className="nova-muted">{ed.description}</p>}
              </article>
            ))}
          </div>
        </section>
      );
    },

    certifications: () => {
      if (!(sv("certifications") && data.certifications.length > 0)) return null;
      return (
        <section id="certifications" data-sec="certifications" data-reveal className="nova-section">
          {head("CREDENTIALS", "Certifications")}
          <div className="nova-grid-3">
            {data.certifications.map((c) => {
              const body = (<><span className="nova-card-ic" aria-hidden>✓</span><h3 className="nova-card-title">{c.name}</h3>{c.issuer && <p className="nova-muted">{c.issuer}</p>}<div className="nova-card-foot">{oneDate(c.issue_date) && <span className="nova-price">{oneDate(c.issue_date)}</span>}{c.credential_id && <span className="nova-muted nova-small">#{c.credential_id}</span>}</div></>);
              return c.url ? <a key={c.id} className="nova-glass nova-card nova-card-link" href={ext(c.url)} target="_blank" rel="noopener noreferrer">{body}</a> : <article key={c.id} className="nova-glass nova-card">{body}</article>;
            })}
          </div>
        </section>
      );
    },

    achievements: () => {
      if (!(sv("achievements") && data.achievements.length > 0)) return null;
      return (
        <section id="achievements" data-sec="achievements" data-reveal className="nova-section">
          {head("WINS", "Achievements")}
          <div className="nova-grid-3">
            {data.achievements.map((a) => (
              <article key={a.id} className="nova-glass nova-card"><span className="nova-card-ic" aria-hidden>★</span><h3 className="nova-card-title">{a.title}</h3>{oneDate(a.date) && <span className="nova-price">{oneDate(a.date)}</span>}{a.description && <p className="nova-muted nova-clamp-3">{a.description}</p>}</article>
            ))}
          </div>
        </section>
      );
    },

    publications: () => {
      if (!(sv("publications") && data.publications.length > 0)) return null;
      return (
        <section id="publications" data-sec="publications" data-reveal className="nova-section">
          {head("WORDS", "Publications")}
          <div className="nova-list">
            {data.publications.map((pub) => {
              const meta = [pub.publisher, oneDate(pub.date)].filter(Boolean).join(" · ");
              const body = (<><div className="nova-card-foot nova-card-foot-top"><h3 className="nova-card-title">{pub.title}</h3>{pub.url && <span className="nova-arrow" aria-hidden>↗</span>}</div>{meta && <p className="nova-muted nova-small">{meta}</p>}{pub.description && <p className="nova-muted">{pub.description}</p>}</>);
              return pub.url ? <a key={pub.id} className="nova-glass nova-listitem nova-card-link" href={ext(pub.url)} target="_blank" rel="noopener noreferrer">{body}</a> : <article key={pub.id} className="nova-glass nova-listitem">{body}</article>;
            })}
          </div>
        </section>
      );
    },

    gallery: () => {
      if (!(sv("gallery") && data.gallery.length > 0)) return null;
      return (
        <section id="gallery" data-sec="gallery" data-reveal className="nova-section">
          {head("PHOTO", "Gallery")}
          <div className="nova-gallery">
            {data.gallery.map((g) => g.image_url ? (
              <figure key={g.id} className="nova-glass nova-gitem">
                <ZImg src={g.image_url} alt={g.caption || "Gallery image"} cap={g.caption || undefined} className="nova-zoom-gallery" />
                {g.caption && <figcaption className="nova-muted nova-small">{g.caption}</figcaption>}
              </figure>
            ) : null)}
          </div>
        </section>
      );
    },

    videos: () => {
      if (!(sv("videos") && data.videos.length > 0)) return null;
      return (
        <section id="videos" data-sec="videos" data-reveal className="nova-section">
          {head("REEL", "Videos")}
          <div className="nova-grid-2">
            {data.videos.map((v) => {
              const src = v.url ? videoEmbed(v.url) : null;
              if (!src) return null;
              return (<figure key={v.id} className="nova-glass nova-video"><div className="nova-video-frame"><iframe src={src} title={v.title || "Video"} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div>{v.title && <figcaption className="nova-muted nova-small">{v.title}</figcaption>}</figure>);
            })}
          </div>
        </section>
      );
    },

    testimonials: () => {
      if (!has.testimonials) return null;
      return (
        <section id="testimonials" data-sec="testimonials" data-reveal className="nova-section">
          {head("REVIEWS", "What Clients Say")}
          <div className="nova-grid-3">
            {data.testimonials.map((t) => (
              <figure key={t.id} className="nova-glass nova-quote">
                <span className="nova-quote-mark" aria-hidden>&ldquo;</span>
                {t.quote && <blockquote>{t.quote}</blockquote>}
                <figcaption className="nova-quote-by"><span className="nova-avatar" aria-hidden>{t.avatar_url ? <img src={t.avatar_url} alt="" loading="lazy" /> : initials(t.author, "•")}</span><span>{t.author && <b>{t.author}</b>}{t.role && <em className="nova-muted">{t.role}</em>}</span></figcaption>
              </figure>
            ))}
          </div>
        </section>
      );
    },
  };

  const order = resolveOrder(data.settings);
  const marqueeText = p?.tagline || p?.availability || `${name} · Portfolio`;
  const year = new Date().getFullYear();
  const bgWord = (name || "PORTFOLIO").toUpperCase();

  return (
    <div ref={rootRef} className="nova-root" id="top" data-theme="dark" style={{ ["--tpl-accent" as string]: accent } as CSSProperties}>
      <style dangerouslySetInnerHTML={{ __html: NOVA_CSS }} />
      <div className="nova-bg" aria-hidden><span className="nova-glow nova-glow-1" /><span className="nova-glow nova-glow-2" /></div>

      {/* scrolling background text */}
      <div className="nova-bgtext" aria-hidden>
        <div className="nova-bgtext-row nova-bgtext-a"><span>{`${bgWord} · `.repeat(12)}</span><span>{`${bgWord} · `.repeat(12)}</span></div>
        <div className="nova-bgtext-row nova-bgtext-b"><span>{`${bgWord} · `.repeat(12)}</span><span>{`${bgWord} · `.repeat(12)}</span></div>
      </div>

      {/* NAV */}
      <header className="nova-nav">
        <div className="nova-shell nova-nav-in">
          <div className="nova-glass nova-navbar">
            <details className="nova-menu">
              <summary aria-label="Menu"><span /><span /><span /></summary>
              <ul>{navItems.map((it) => <li key={it.href}><a href={it.href}>{it.label}</a></li>)}</ul>
            </details>
            {navItems.length > 1 && <nav className="nova-navlinks" aria-label="Primary">{navItems.map((it, i) => <a key={it.href} href={it.href} className={i === 0 ? "is-active" : ""}>{it.label}</a>)}</nav>}
            {contactHref && <a className="nova-btn nova-btn-accent nova-nav-cta" href={contactHref}>Contact</a>}
          </div>
        </div>
      </header>

      <div className="nova-shell">
        {/* HERO — bento widget cluster */}
        <header className="nova-hero">
          <span className="nova-glass nova-porto">P O R T O F O L I O</span>
          <div className="nova-bento" ref={tiltRef}>
            {/* profile */}
            <div className="nova-glass nova-w nova-profile">
              <span className="nova-avatar-ring">{p?.avatar_url ? <img src={p.avatar_url} alt={name} loading="eager" /> : <span className="nova-avatar-mono" aria-hidden>{mono}</span>}</span>
              <b className="nova-profile-name">{name}</b>
              {socialRow("nova-profile-soc")}
              <span className="nova-bell">{p?.availability ? p.availability : "New Post"}</span>
            </div>

            {/* big portrait + name */}
            <div className="nova-glass nova-w nova-portrait">
              {p?.avatar_url ? <ZImg src={p.avatar_url} alt={name} className="nova-zoom-fill" /> : <div className="nova-ph nova-portrait-ph" aria-hidden>{mono}</div>}
              <div className="nova-portrait-info">
                <h1 className="nova-name">{name}</h1>
                {p?.title && <p className="nova-role">{p.title}</p>}
                {(p?.tagline || p?.bio) && <p className="nova-intro">{p?.tagline || p?.bio}</p>}
                <div className="nova-hero-cta">
                  {has.projects && <a className="nova-btn nova-btn-accent" href="#work">View Work <span aria-hidden>→</span></a>}
                  {p?.resume_url && <a className="nova-btn nova-btn-ghost" href={ext(p.resume_url)} target="_blank" rel="noopener noreferrer">CV <span aria-hidden>↓</span></a>}
                </div>
              </div>
            </div>

            {/* status chip */}
            <div className="nova-glass nova-w nova-status">
              <span className="nova-clock">{clock || "—"}</span>
              <span className="nova-sys"><GSignal /><GWifi /><GBattery /></span>
            </div>

            {/* weather chip */}
            <div className="nova-glass nova-w nova-weather">
              <GMoon />
              <span>{p?.location || "Online"}</span>
            </div>

            {/* quick toggles */}
            <div className="nova-glass nova-w nova-toggles">
              {p?.email && <a className="nova-toggle" href={`mailto:${p.email}`} aria-label="Email" title="Email">✉</a>}
              {p?.resume_url && <a className="nova-toggle" href={ext(p.resume_url)} target="_blank" rel="noopener noreferrer" aria-label="Resume" title="Resume">↓</a>}
              {has.projects && <a className="nova-toggle nova-toggle-on" href="#work" aria-label="Work" title="Work">▤</a>}
              {contactHref && <a className="nova-toggle nova-toggle-on2" href={contactHref} aria-label="Contact" title="Contact">➤</a>}
            </div>
          </div>
        </header>

        {/* SECTIONS */}
        {order.map((k) => <Fragment key={k}>{sections[k] ? sections[k]() : null}</Fragment>)}

        {/* CONTACT */}
        {username && (
          <section id="contact" data-reveal className="nova-section">
            {head("ACCOUNT", "Let's Connect")}
            <div className="nova-contact">
              <div className="nova-glass nova-contact-left">
                <div className="nova-contact-rows">
                  {p?.email && <a className="nova-crow" href={`mailto:${p.email}`}><span aria-hidden>✉</span><span>{p.email}</span></a>}
                  {p?.phone && <a className="nova-crow" href={`tel:${p.phone}`}><span aria-hidden>☎</span><span>{p.phone}</span></a>}
                  {p?.website && <a className="nova-crow" href={ext(p.website)} target="_blank" rel="noopener noreferrer"><span aria-hidden>◈</span><span>{p.website.replace(/^https?:\/\//, "")}</span></a>}
                  {p?.location && <div className="nova-crow"><span aria-hidden>⌖</span><span>{p.location}</span></div>}
                </div>
                {socialRow()}
              </div>
              <div className="nova-glass nova-formcard"><ContactForm username={username} /></div>
            </div>
          </section>
        )}
      </div>

      {/* MARQUEE */}
      <div className="nova-glass nova-marquee" aria-hidden>
        <div className="nova-marquee-track"><span>{`${marqueeText}  ✦  `.repeat(6)}</span><span>{`${marqueeText}  ✦  `.repeat(6)}</span></div>
      </div>

      {/* FOOTER */}
      <footer className="nova-footer">
        <div className="nova-shell nova-footer-in">
          <b className="nova-foot-name">{name}</b>
          {navItems.length > 1 && <nav className="nova-footer-nav" aria-label="Footer">{navItems.filter((n) => n.href !== "#top").map((it) => <a key={it.href} href={it.href}>{it.label}</a>)}</nav>}
          <div className="nova-footer-right">{socialRow("nova-footer-soc")}<span>© {year} {name}{!data.hide_branding && <> · <a className="nova-madewith" href="https://folio.assetprim.com" target="_blank" rel="noopener noreferrer">Folio</a></>}</span></div>
        </div>
      </footer>

      {/* LIGHTBOX */}
      {lb && (
        <div className="nova-lb" role="dialog" aria-modal="true" aria-label="Image viewer" onClick={() => setLb(null)}>
          <button ref={closeRef} type="button" className="nova-lb-close" onClick={() => setLb(null)} aria-label="Close image viewer">✕</button>
          <figure className="nova-lb-fig" onClick={(e) => e.stopPropagation()}><img src={lb.src} alt={lb.alt} />{lb.cap && <figcaption>{lb.cap}</figcaption>}</figure>
        </div>
      )}
    </div>
  );
}

export default NovaTemplate;

/* =====================================================================
   STYLES — self-contained, prefixed `.nova-`, scoped under `.nova-root`.
   Dark-only futuristic glassmorphism.
   ===================================================================== */

const NOVA_CSS = `
.nova-root{
  --bg:#06080f; --ink:#eef2fb; --ink2:#96a0b8;
  --glass: linear-gradient(160deg, rgba(255,255,255,.08), rgba(255,255,255,.015));
  --glass-2: rgba(255,255,255,.05);
  --line: rgba(255,255,255,.13); --line2: rgba(255,255,255,.22);
  --accent:var(--tpl-accent,#4d9fff); --on-accent:#04101f;
  --display: "Bricolage Grotesque", "Inter", ui-sans-serif, system-ui, sans-serif;
  --body: "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --r:26px;
  position:relative; isolation:isolate; color:var(--ink); font-family:var(--body); font-size:16px; line-height:1.6;
  -webkit-font-smoothing:antialiased; overflow-x:clip; min-height:100%; scroll-behavior:smooth;
  background:
    radial-gradient(900px 600px at 20% -5%, #17213f, transparent 55%),
    radial-gradient(800px 600px at 100% 20%, #1a2033, transparent 55%),
    #06080f;
}
.nova-root *{ box-sizing:border-box; }
.nova-root img{ max-width:100%; display:block; }
.nova-root a{ color:inherit; }
.nova-root h1,.nova-root h2,.nova-root h3,.nova-root p,.nova-root blockquote{ overflow-wrap:anywhere; }

/* glow blobs */
.nova-bg{ position:fixed; inset:0; z-index:0; pointer-events:none; overflow:hidden; }
.nova-glow{ position:absolute; border-radius:50%; filter:blur(120px); opacity:.4; }
.nova-glow-1{ width:520px; height:520px; top:-140px; left:-120px; background:radial-gradient(circle, color-mix(in srgb,var(--accent) 70%, #6a5cff), transparent 70%); }
.nova-glow-2{ width:440px; height:440px; bottom:0; right:-120px; background:radial-gradient(circle,#1f6feb,transparent 70%); opacity:.3; }
.nova-root > *{ position:relative; z-index:1; }

/* scrolling background text */
.nova-bgtext{ position:absolute; inset:0; top:60px; z-index:0; pointer-events:none; overflow:hidden; opacity:.04; }
.nova-bgtext-row{ display:flex; white-space:nowrap; font-family:var(--display); font-weight:800; font-size:clamp(4rem,14vw,11rem); line-height:1.1; }
.nova-bgtext-row span{ padding-right:.4em; }
.nova-bgtext-a{ animation:nova-scroll-l 40s linear infinite; }
.nova-bgtext-b{ animation:nova-scroll-r 55s linear infinite; }
@keyframes nova-scroll-l{ from{ transform:translateX(0); } to{ transform:translateX(-50%); } }
@keyframes nova-scroll-r{ from{ transform:translateX(-50%); } to{ transform:translateX(0); } }

.nova-shell{ width:100%; max-width:1180px; margin-inline:auto; padding-inline:clamp(14px,3.5vw,32px); }

/* glass base */
.nova-glass{ background:var(--glass); border:1px solid var(--line); border-radius:var(--r);
  backdrop-filter:blur(26px) saturate(1.4); -webkit-backdrop-filter:blur(26px) saturate(1.4);
  box-shadow:0 24px 60px -30px rgba(0,0,0,.85), inset 0 1px 0 rgba(255,255,255,.14), inset 0 0 0 1px rgba(255,255,255,.02); }

/* type */
.nova-h2{ font-family:var(--display); font-weight:800; font-size:clamp(1.6rem,3.6vw,2.4rem); letter-spacing:-.01em; margin:0; }
.nova-pill{ display:inline-block; padding:6px 16px; border-radius:999px; background:var(--glass-2); border:1px solid var(--line); font-size:.72rem; font-weight:700; letter-spacing:.26em; color:var(--ink2); }
.nova-sec-head{ display:flex; align-items:center; gap:14px; flex-wrap:wrap; margin-bottom:26px; }
.nova-muted{ color:var(--ink2); margin:6px 0 0; }
.nova-small{ font-size:.84rem; }
.nova-mt{ margin-top:18px; }
.nova-clamp-3{ display:-webkit-box; -webkit-box-orient:vertical; -webkit-line-clamp:3; overflow:hidden; }

/* buttons */
.nova-btn{ display:inline-flex; align-items:center; gap:8px; padding:11px 20px; border-radius:999px; font-weight:700; font-size:.92rem; text-decoration:none; cursor:pointer; border:1px solid var(--line2); transition:transform .16s ease, box-shadow .18s ease, background .18s; }
.nova-btn:focus-visible{ outline:2px solid var(--accent); outline-offset:3px; }
.nova-btn-accent{ background:var(--accent); border-color:var(--accent); color:var(--on-accent); box-shadow:0 12px 26px -12px var(--accent); }
.nova-btn-accent:hover{ transform:translateY(-2px); }
.nova-btn-ghost{ background:var(--glass-2); color:var(--ink); }
.nova-btn-ghost:hover{ transform:translateY(-2px); border-color:var(--accent); }
.nova-hero-cta{ display:flex; flex-wrap:wrap; gap:10px; margin-top:16px; }

/* reveal */
.nova-root.nova-anim-ready [data-reveal]{ opacity:0; transform:translateY(22px); transition:opacity .6s ease, transform .7s cubic-bezier(.2,.8,.2,1); }
.nova-root.nova-anim-ready [data-reveal].nova-in{ opacity:1; transform:none; }

/* nav */
.nova-nav{ position:sticky; top:12px; z-index:40; padding-top:12px; }
.nova-navbar{ display:flex; align-items:center; gap:14px; padding:8px 8px 8px 18px; border-radius:999px; }
.nova-menu{ position:relative; }
.nova-menu summary{ list-style:none; width:40px; height:40px; border-radius:50%; cursor:pointer; display:grid; place-items:center; gap:4px; background:var(--glass-2); border:1px solid var(--line); }
.nova-menu summary::-webkit-details-marker{ display:none; }
.nova-menu summary span{ display:block; width:16px; height:2px; background:var(--ink); border-radius:2px; }
.nova-menu ul{ position:absolute; left:0; top:50px; min-width:180px; list-style:none; margin:0; padding:8px; z-index:50; border:1px solid var(--line); border-radius:18px; background:#0d1120; box-shadow:0 24px 50px -20px rgba(0,0,0,.8); }
.nova-menu ul a{ display:block; padding:9px 12px; border-radius:10px; text-decoration:none; color:var(--ink); font-weight:600; }
.nova-menu ul a:hover{ background:var(--glass-2); color:var(--accent); }
.nova-navlinks{ display:flex; gap:2px; margin-inline:auto; flex-wrap:wrap; }
.nova-navlinks a{ text-decoration:none; color:var(--ink2); font-weight:600; font-size:.86rem; letter-spacing:.04em; padding:8px 14px; border-radius:999px; transition:color .16s, background .16s; }
.nova-navlinks a:hover{ color:var(--ink); background:var(--glass-2); }
.nova-navlinks a.is-active{ color:var(--accent); }
.nova-nav-cta{ padding:9px 18px; }

/* hero bento */
.nova-hero{ padding-block:clamp(20px,3vw,40px) clamp(30px,5vw,56px); }
.nova-porto{ display:block; width:max-content; margin:0 auto 20px; padding:8px 26px; border-radius:999px; font-family:var(--display); font-weight:700; letter-spacing:.44em; font-size:.82rem; color:var(--ink2); }
.nova-bento{ display:grid; grid-template-columns:0.92fr 1.5fr 0.92fr; grid-template-areas:"profile portrait status" "toggles portrait weather"; gap:16px; align-items:stretch; perspective:1400px; }
.nova-w{ transform-style:preserve-3d; transform:perspective(1400px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg)); transition:transform .25s ease; }
.nova-profile{ grid-area:profile; display:flex; flex-direction:column; align-items:center; text-align:center; gap:12px; padding:22px 18px; }
.nova-avatar-ring{ width:92px; height:92px; border-radius:50%; overflow:hidden; border:2px solid var(--line2); display:grid; place-items:center; background:var(--glass-2); box-shadow:0 0 0 6px rgba(255,255,255,.03); }
.nova-avatar-ring img{ width:100%; height:100%; object-fit:cover; }
.nova-avatar-mono{ font-family:var(--display); font-weight:800; font-size:1.6rem; }
.nova-profile-name{ font-weight:700; font-size:1rem; }
.nova-profile-soc{ justify-content:center; }
.nova-bell{ font-size:.78rem; color:var(--ink2); padding:6px 14px; border-radius:999px; background:var(--glass-2); border:1px solid var(--line); }

.nova-portrait{ grid-area:portrait; position:relative; overflow:hidden; min-height:420px; padding:0; }
.nova-portrait .nova-zoom{ position:absolute; inset:0; width:100%; height:100%; border-radius:var(--r); }
.nova-portrait-ph{ width:100%; height:100%; border-radius:var(--r); }
.nova-portrait-info{ position:absolute; left:0; right:0; bottom:0; z-index:2; padding:26px; pointer-events:none;
  background:linear-gradient(to top, rgba(4,6,14,.92) 8%, rgba(4,6,14,.55) 50%, transparent); }
.nova-portrait-info > *{ pointer-events:auto; }
.nova-name{ font-family:var(--display); font-weight:800; font-size:clamp(2.2rem,6vw,4rem); line-height:.95; letter-spacing:-.02em; text-transform:uppercase; margin:0;
  background:linear-gradient(180deg,#ffffff,#aeb7cc 55%,#5b6683); -webkit-background-clip:text; background-clip:text; color:transparent; filter:drop-shadow(0 4px 14px rgba(0,0,0,.5)); }
.nova-role{ margin:8px 0 0; font-weight:600; color:var(--accent); }
.nova-intro{ margin:10px 0 0; color:#cfd6e6; max-width:46ch; font-size:.98rem; }

.nova-status{ grid-area:status; display:flex; flex-direction:column; justify-content:center; gap:10px; padding:18px 20px; }
.nova-clock{ font-family:var(--display); font-weight:800; font-size:1.8rem; }
.nova-sys{ display:flex; align-items:center; gap:8px; color:var(--ink); }
.nova-weather{ grid-area:weather; display:flex; align-items:center; gap:12px; padding:18px 20px; color:var(--ink); }
.nova-weather span{ font-weight:600; }
.nova-toggles{ grid-area:toggles; display:grid; grid-template-columns:1fr 1fr; gap:12px; padding:18px; }
.nova-toggle{ display:grid; place-items:center; aspect-ratio:1/1; border-radius:18px; background:var(--glass-2); border:1px solid var(--line); text-decoration:none; color:var(--ink); font-size:1.2rem; transition:transform .16s, background .16s; }
.nova-toggle:hover{ transform:translateY(-2px); }
.nova-toggle-on{ background:color-mix(in srgb,var(--accent) 30%, transparent); border-color:var(--accent); color:var(--ink); }
.nova-toggle-on2{ background:#1f9d55; border-color:#28c06a; color:#fff; }

/* sections */
.nova-section{ padding-block:clamp(32px,5vw,58px); }

/* about */
.nova-about{ display:grid; grid-template-columns:.8fr 1.2fr; gap:clamp(18px,3vw,36px); align-items:center; padding:clamp(18px,2.6vw,30px); }
.nova-about-photo{ border-radius:20px; overflow:hidden; aspect-ratio:4/3; }
.nova-about-photo .nova-zoom{ width:100%; height:100%; }
.nova-about-txt p{ margin:0 0 12px; color:#cfd6e6; }

/* grids / cards */
.nova-grid-3{ display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
.nova-grid-2{ display:grid; grid-template-columns:repeat(2,1fr); gap:16px; }
.nova-list{ display:flex; flex-direction:column; gap:14px; }
.nova-card{ padding:22px; display:flex; flex-direction:column; gap:8px; text-decoration:none; color:inherit; transition:transform .2s ease, border-color .2s ease, box-shadow .2s ease; }
.nova-card:hover, .nova-card-link:hover{ transform:translateY(-4px); border-color:var(--line2); box-shadow:0 30px 50px -30px rgba(0,0,0,.9), inset 0 1px 0 rgba(255,255,255,.16); }
.nova-card-ic{ width:46px; height:46px; display:grid; place-items:center; border-radius:14px; font-family:var(--display); font-weight:800; color:var(--on-accent); background:linear-gradient(150deg,var(--accent),#7a6cff); }
.nova-card-title{ font-family:var(--display); font-weight:700; font-size:1.08rem; margin:6px 0 0; }
.nova-card-foot{ display:flex; align-items:center; justify-content:space-between; gap:10px; margin-top:auto; padding-top:8px; flex-wrap:wrap; }
.nova-card-foot-top{ margin-top:0; padding-top:0; align-items:baseline; }
.nova-price{ color:var(--accent); font-weight:700; font-size:.88rem; }
.nova-arrow{ color:var(--accent); font-weight:700; }
.nova-listitem{ padding:18px 22px; text-decoration:none; color:inherit; }
.nova-listitem:hover{ border-color:var(--line2); }

/* projects */
.nova-proj{ padding:10px; display:flex; flex-direction:column; transition:transform .2s ease, box-shadow .2s ease; }
.nova-proj:hover{ transform:translateY(-5px); box-shadow:0 34px 56px -32px rgba(0,0,0,.9); }
.nova-proj-media{ position:relative; border-radius:18px; overflow:hidden; aspect-ratio:4/3; }
.nova-proj-media .nova-zoom{ width:100%; height:100%; }
.nova-ph{ width:100%; height:100%; display:grid; place-items:center; font-family:var(--display); font-size:2rem; font-weight:800; color:var(--on-accent); background:linear-gradient(150deg,var(--accent),#7a6cff); border-radius:18px; }
.nova-badge{ position:absolute; top:8px; left:8px; width:26px; height:26px; display:grid; place-items:center; border-radius:50%; font-size:.8rem; color:var(--on-accent); background:var(--accent); z-index:2; }
.nova-proj-body{ padding:12px 8px 8px; }
.nova-proj-titlerow{ display:flex; align-items:center; justify-content:space-between; gap:10px; }
.nova-proj-title{ font-family:var(--display); font-weight:700; font-size:1.02rem; margin:0; }
.nova-go{ width:30px; height:30px; flex:0 0 auto; display:grid; place-items:center; border-radius:50%; background:var(--glass-2); border:1px solid var(--line); color:var(--ink); text-decoration:none; }
.nova-tags{ display:flex; flex-wrap:wrap; gap:6px; margin-top:10px; }
.nova-tag{ font-size:.7rem; padding:3px 10px; border-radius:999px; border:1px solid var(--line); color:var(--ink2); }

/* skills */
.nova-skills{ display:grid; grid-template-columns:repeat(auto-fill,minmax(150px,1fr)); gap:14px; }
.nova-skill{ padding:16px 14px; display:flex; flex-direction:column; align-items:center; text-align:center; gap:10px; transition:transform .2s ease; }
.nova-skill:hover{ transform:translateY(-4px); }
.nova-skill-ic{ width:50px; height:50px; border-radius:15px; display:grid; place-items:center; font-family:var(--display); font-weight:800; color:var(--on-accent); background:linear-gradient(150deg,var(--accent),#7a6cff); }
.nova-skill-name{ font-weight:600; font-size:.9rem; }
.nova-skill-bar{ width:82%; height:6px; border-radius:99px; background:var(--glass-2); overflow:hidden; }
.nova-skill-fill{ display:block; height:100%; width:var(--pct); border-radius:99px; background:linear-gradient(90deg,var(--accent),#7a6cff); transition:width 1.1s cubic-bezier(.2,.8,.2,1); }
.nova-root.nova-anim-ready .nova-skill[data-bar] .nova-skill-fill{ width:0; }
.nova-root.nova-anim-ready .nova-skill[data-bar].nova-in .nova-skill-fill{ width:var(--pct); }

/* timeline */
.nova-timeline{ display:flex; flex-direction:column; gap:12px; }
.nova-tl-item{ display:grid; grid-template-columns:120px 1fr; gap:16px; padding:18px 20px; position:relative; }
.nova-tl-dot{ display:none; }
.nova-tl-date{ color:var(--accent); font-weight:700; font-size:.85rem; }

/* gallery */
.nova-gallery{ display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:16px; }
.nova-gitem{ padding:8px; }
.nova-gitem .nova-zoom{ width:100%; aspect-ratio:1/1; border-radius:18px; }
.nova-gitem figcaption{ padding:8px 8px 2px; }

/* videos */
.nova-video{ padding:8px; }
.nova-video-frame{ position:relative; aspect-ratio:16/9; border-radius:18px; overflow:hidden; background:#000; }
.nova-video-frame iframe{ position:absolute; inset:0; width:100%; height:100%; border:0; }
.nova-video figcaption{ padding:10px 8px 2px; }

/* zoom (blur-fill, fits any photo) */
.nova-zoom{ position:relative; display:block; padding:0; border:0; cursor:zoom-in; color:inherit; overflow:hidden; background:#0a0e18; }
.nova-zoom-bg{ position:absolute; inset:0; width:100%; height:100%; object-fit:cover; filter:blur(28px) saturate(1.3); transform:scale(1.25); opacity:.55; }
.nova-zoom-img{ position:relative; z-index:1; width:100%; height:100%; object-fit:contain; transition:transform .4s ease; }
.nova-zoom:hover .nova-zoom-img{ transform:scale(1.03); }
.nova-zoom:focus-visible{ outline:2px solid var(--accent); outline-offset:2px; }

/* testimonials */
.nova-quote{ padding:22px; display:flex; flex-direction:column; gap:12px; }
.nova-quote-mark{ font-family:var(--display); color:var(--accent); font-size:3rem; line-height:.4; height:22px; }
.nova-quote blockquote{ margin:0; }
.nova-quote-by{ display:flex; align-items:center; gap:12px; margin-top:auto; }
.nova-quote-by span{ display:flex; flex-direction:column; line-height:1.2; }
.nova-quote-by b{ font-weight:700; font-size:.9rem; }
.nova-quote-by em{ font-style:normal; font-size:.8rem; }
.nova-avatar{ width:46px; height:46px; flex:0 0 auto; border-radius:50%; overflow:hidden; display:grid; place-items:center; font-weight:800; color:var(--on-accent); background:linear-gradient(150deg,var(--accent),#7a6cff); }
.nova-avatar img{ width:100%; height:100%; object-fit:cover; }

/* socials */
.nova-socials{ display:flex; flex-wrap:wrap; gap:10px; }
.nova-soc{ width:42px; height:42px; display:grid; place-items:center; border-radius:50%; border:1px solid var(--line); background:var(--glass-2); color:var(--ink); text-decoration:none; transition:transform .16s, color .16s, border-color .16s; }
.nova-soc:hover{ transform:translateY(-2px); color:var(--accent); border-color:var(--accent); }
.nova-soc svg{ width:17px; height:17px; }

/* contact */
.nova-contact{ display:grid; grid-template-columns:.85fr 1.15fr; gap:clamp(18px,3vw,36px); align-items:start; }
.nova-contact-left{ padding:clamp(18px,2.6vw,28px); }
.nova-contact-rows{ display:flex; flex-direction:column; gap:12px; margin-bottom:20px; }
.nova-crow{ display:flex; align-items:center; gap:12px; text-decoration:none; color:inherit; word-break:break-word; }
.nova-crow span:first-child{ color:var(--accent); width:22px; text-align:center; flex:0 0 auto; font-size:1.1rem; }
.nova-crow:hover{ color:var(--accent); }
.nova-formcard{ padding:clamp(18px,2.6vw,30px); }
.nova-formcard :where(input, textarea, select){ width:100%; font-family:var(--body); font-size:.95rem; color:var(--ink); background:var(--glass-2); border:1px solid var(--line); border-radius:14px; padding:12px 14px; margin-bottom:12px; }
.nova-formcard :where(input, textarea, select):focus{ outline:none; border-color:var(--accent); }
.nova-formcard :where(input, textarea, select)::placeholder{ color:var(--ink2); }
.nova-formcard textarea{ min-height:120px; resize:vertical; }
.nova-formcard :where(button, [type="submit"]){ width:100%; font-family:var(--body); font-weight:700; cursor:pointer; color:var(--on-accent); background:var(--accent); border:0; border-radius:999px; padding:14px 18px; transition:transform .18s; }
.nova-formcard :where(button, [type="submit"]):hover{ transform:translateY(-2px); }
.nova-formcard label{ color:var(--ink2); font-size:.84rem; }

/* marquee */
.nova-marquee{ margin:clamp(24px,4vw,44px) auto 0; max-width:1180px; width:calc(100% - 2*clamp(14px,3.5vw,32px)); border-radius:999px; overflow:hidden; padding:14px 0; }
.nova-marquee-track{ display:flex; white-space:nowrap; font-family:var(--display); font-weight:700; letter-spacing:.28em; font-size:.9rem; color:var(--ink2); animation:nova-scroll-l 22s linear infinite; }
.nova-marquee-track span{ padding-right:1em; text-transform:uppercase; }

/* footer */
.nova-footer{ margin-top:clamp(20px,3vw,36px); border-top:1px solid var(--line); }
.nova-footer-in{ display:flex; align-items:center; justify-content:space-between; gap:18px; flex-wrap:wrap; padding-block:26px; }
.nova-foot-name{ font-family:var(--display); font-weight:800; font-size:1.2rem; }
.nova-footer-nav{ display:flex; flex-wrap:wrap; gap:8px 18px; }
.nova-footer-nav a{ text-decoration:none; color:var(--ink2); font-size:.9rem; font-weight:600; }
.nova-footer-nav a:hover{ color:var(--accent); }
.nova-footer-right{ display:flex; align-items:center; gap:16px; color:var(--ink2); font-size:.84rem; flex-wrap:wrap; }
.nova-madewith{ color:var(--accent); text-decoration:none; }

/* lightbox */
.nova-lb{ position:fixed; inset:0; z-index:1000; display:grid; place-items:center; padding:clamp(16px,4vw,48px); background:rgba(3,5,10,.9); backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px); animation:nova-fade .2s ease both; }
.nova-lb-fig{ margin:0; max-width:94vw; max-height:92vh; display:flex; flex-direction:column; gap:10px; align-items:center; animation:nova-pop .3s cubic-bezier(.2,.8,.2,1) both; }
.nova-lb-fig img{ max-width:92vw; max-height:84vh; width:auto; height:auto; object-fit:contain; border-radius:16px; border:1px solid var(--line2); }
.nova-lb-fig figcaption{ color:#eef2fb; font-size:.9rem; text-align:center; }
.nova-lb-close{ position:fixed; top:18px; right:18px; z-index:1001; width:46px; height:46px; border-radius:50%; cursor:pointer; color:var(--on-accent); background:var(--accent); border:0; font-size:1.05rem; font-weight:700; transition:transform .18s; }
.nova-lb-close:hover{ transform:rotate(90deg) scale(1.05); }
.nova-lb-close:focus-visible{ outline:2px solid #fff; outline-offset:2px; }
@keyframes nova-fade{ from{opacity:0;} to{opacity:1;} }
@keyframes nova-pop{ from{opacity:0; transform:scale(.94);} to{opacity:1; transform:none;} }

/* responsive */
@media (max-width:1040px){ .nova-grid-3{ grid-template-columns:repeat(2,1fr); } }
@media (max-width:900px){
  .nova-bento{ grid-template-columns:1fr 1fr; grid-template-areas:"portrait portrait" "profile status" "toggles weather"; }
  .nova-portrait{ min-height:340px; }
  .nova-w{ transform:none !important; }
  .nova-about{ grid-template-columns:1fr; }
  .nova-contact{ grid-template-columns:1fr; }
  .nova-navlinks{ display:none; }
}
@media (max-width:600px){
  .nova-bento{ grid-template-columns:1fr; grid-template-areas:"portrait" "profile" "status" "weather" "toggles"; }
  .nova-grid-2, .nova-grid-3{ grid-template-columns:1fr; }
  .nova-tl-item{ grid-template-columns:1fr; gap:6px; }
  .nova-nav-cta{ display:none; }
}

@media (prefers-reduced-motion: reduce){
  .nova-root{ scroll-behavior:auto; }
  .nova-root *{ animation:none !important; transition:none !important; }
  .nova-w{ transform:none !important; }
}
`;
