// Public portfolio URLs — fully dynamic, no hardcoded domain.
// Portfolios live at {username}.{currentHost}. On the browser we read the live host,
// so whatever domain the app is served from is used automatically. On vercel.app /
// localhost (where wildcard subdomains don't exist) we fall back to path-based /p/{username}.

function isPathMode(host: string): boolean {
  return (
    host.endsWith(".vercel.app") ||
    host.startsWith("localhost") ||
    host.startsWith("127.0.0.1") ||
    host.startsWith("0.0.0.0")
  );
}

/** The root domain to hang portfolio subdomains off, or null for path-mode. */
export function currentRoot(): string | null {
  if (typeof window !== "undefined") {
    const host = window.location.host;
    return isPathMode(host) ? null : host;
  }
  // server fallback: derive from configured app URL (no code hardcode)
  const app = process.env.NEXT_PUBLIC_APP_URL;
  if (app) {
    try {
      const h = new URL(app).host;
      return isPathMode(h) ? null : h;
    } catch {
      /* ignore */
    }
  }
  return process.env.NEXT_PUBLIC_ROOT_DOMAIN || null;
}

export function rootSuffix(): string | null {
  const root = currentRoot();
  return root ? `.${root}` : null;
}

export function portfolioUrl(username: string): string {
  const root = currentRoot();
  if (root) return `https://${username}.${root}`;
  if (typeof window !== "undefined") return `${window.location.origin}/p/${username}`;
  return `/p/${username}`;
}

export function portfolioLabel(username: string): string {
  const root = currentRoot();
  if (root) return `${username}.${root}`;
  if (typeof window !== "undefined") return `${window.location.host}/p/${username}`;
  return `/p/${username}`;
}


export function pathPrefix(): string {
  if (typeof window !== "undefined") return `${window.location.host}/p/`;
  return "/p/";
}
