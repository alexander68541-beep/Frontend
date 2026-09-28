import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const RESERVED_SUB = new Set(["www", "app", "api", "admin", "dashboard", "mail", "cdn", "static"]);

function appRootHost(): string | null {
  if (process.env.NEXT_PUBLIC_ROOT_DOMAIN) return process.env.NEXT_PUBLIC_ROOT_DOMAIN.toLowerCase();
  const app = process.env.NEXT_PUBLIC_APP_URL;
  if (app) {
    try {
      return new URL(app).host.toLowerCase();
    } catch {
      /* ignore */
    }
  }
  return null;
}

function portfolioSubdomain(host: string): string | null {
  const root = appRootHost();
  if (!root) return null;
  const hostname = host.split(":")[0].toLowerCase();
  if (root.endsWith(".vercel.app") || root.startsWith("localhost")) return null;
  if (hostname === root || hostname === `www.${root}`) return null;
  if (!hostname.endsWith(`.${root}`)) return null;
  const sub = hostname.slice(0, -(root.length + 1));
  if (!sub || sub.includes(".") || RESERVED_SUB.has(sub)) return null;
  return sub;
}

function isCustomDomain(host: string): boolean {
  const hostname = host.split(":")[0].toLowerCase();
  if (hostname === "localhost" || hostname.startsWith("127.") || hostname.endsWith(".vercel.app")) return false;
  const root = appRootHost();
  if (root && (hostname === root || hostname === `www.${root}` || hostname.endsWith(`.${root}`))) return false;
  return hostname.includes(".");
}

async function resolveCustomDomain(host: string): Promise<string | null> {
  const api = process.env.NEXT_PUBLIC_API_URL;
  if (!api) return null;
  const hostname = host.split(":")[0].toLowerCase();
  try {
    const r = await fetch(`${api}/api/v1/public/resolve-domain?host=${encodeURIComponent(hostname)}`, { next: { revalidate: 300 } });
    if (!r.ok) return null;
    const d = (await r.json()) as { username?: string | null };
    return d?.username || null;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const sub = portfolioSubdomain(host);
  if (sub) {
    const url = request.nextUrl.clone();
    const path = request.nextUrl.pathname;
    url.pathname = `/p/${sub}${path === "/" ? "" : path}`;
    return NextResponse.rewrite(url);
  }
  if (isCustomDomain(host)) {
    const username = await resolveCustomDomain(host);
    if (username) {
      const url = request.nextUrl.clone();
      const path = request.nextUrl.pathname;
      url.pathname = `/p/${username}${path === "/" ? "" : path}`;
      return NextResponse.rewrite(url);
    }
  }
  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
