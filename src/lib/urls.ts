// Public portfolio URL helpers.
// If NEXT_PUBLIC_ROOT_DOMAIN is set (e.g. "me.assetprim.com"), portfolios live at
// {username}.{root}. Otherwise we fall back to path-based /p/{username} (works on
// the vercel.app domain and localhost, where wildcard subdomains aren't available).
export const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || null;

export function portfolioUrl(username: string): string {
  if (ROOT_DOMAIN) return `https://${username}.${ROOT_DOMAIN}`;
  if (typeof window !== "undefined") return `${window.location.origin}/p/${username}`;
  return `/p/${username}`;
}

export function portfolioLabel(username: string): string {
  if (ROOT_DOMAIN) return `${username}.${ROOT_DOMAIN}`;
  return `folio.assetprim.com/p/${username}`;
}
