import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Reserved subdomains that are NOT portfolios (the app itself, infra, etc.)
const RESERVED_SUB = new Set(["www", "app", "api", "admin", "dashboard", "mail", "cdn", "static"]);

function portfolioSubdomain(host: string): string | null {
  const root = process.env.NEXT_PUBLIC_ROOT_DOMAIN?.toLowerCase();
  if (!root) return null;
  const hostname = host.split(":")[0].toLowerCase();
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
    // A portfolio subdomain: serve the public page, no auth handling.
    const url = request.nextUrl.clone();
    const path = request.nextUrl.pathname;
    url.pathname = `/p/${sub}${path === "/" ? "" : path}`;
    return NextResponse.rewrite(url);
  }

  // Main app domain: normal session/auth handling.
  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
