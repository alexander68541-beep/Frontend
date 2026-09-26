import type { MetadataRoute } from "next";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const api = process.env.NEXT_PUBLIC_API_URL;
  const app = process.env.NEXT_PUBLIC_APP_URL || "";
  const root = process.env.NEXT_PUBLIC_ROOT_DOMAIN || (app ? safeHost(app) : "");

  let usernames: string[] = [];
  if (api) {
    try {
      const r = await fetch(`${api}/api/v1/public/usernames`, { next: { revalidate: 3600 } });
      if (r.ok) usernames = (await r.json()) as string[];
    } catch {
      /* ignore */
    }
  }

  const entries: MetadataRoute.Sitemap = [];
  if (app) entries.push({ url: app, changeFrequency: "weekly", priority: 1 });
  for (const u of usernames) {
    const url = root ? `https://${u}.${root}` : app ? `${app}/p/${u}` : `/p/${u}`;
    entries.push({ url, changeFrequency: "weekly", priority: 0.8 });
  }
  return entries;
}

function safeHost(u: string): string {
  try {
    return new URL(u).host;
  } catch {
    return "";
  }
}
