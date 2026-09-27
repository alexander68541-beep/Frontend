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

export async function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const sub = portfolioSubdomain(host);
  if (sub) {
    const url = request.nextUrl.clone();
    const path = request.nextUrl.pathname;
    url.pathname = `/p/${sub}${path === "/" ? "" : path}`;
    return NextResponse.rewrite(url);
  }
  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
