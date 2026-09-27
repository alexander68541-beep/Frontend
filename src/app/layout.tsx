import type { Metadata, Viewport } from "next";
import { Inter, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/QueryProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || undefined;

interface Branding {
  site_name?: string | null; favicon_url?: string | null; seo_keywords?: string | null;
  seo_description?: string | null; google_site_verification?: string | null;
}

async function getBranding(): Promise<Branding> {
  const api = process.env.NEXT_PUBLIC_API_URL;
  if (!api) return {};
  try {
    const r = await fetch(`${api}/api/v1/public/branding`, { next: { revalidate: 300 } });
    if (r.ok) return (await r.json()) as Branding;
  } catch { /* ignore */ }
  return {};
}

export async function generateMetadata(): Promise<Metadata> {
  const b = await getBranding();
  const siteName = b.site_name || "Folio";
  const description = b.seo_description ||
    "Enter your work once, then dress it in any template. Your data never moves, never breaks, never gets locked to a design.";
  const title = `${siteName} — a portfolio you own`;
  return {
    metadataBase: APP_URL ? new URL(APP_URL) : undefined,
    title: { default: title, template: `%s · ${siteName}` },
    description,
    keywords: b.seo_keywords || undefined,
    icons: b.favicon_url ? { icon: b.favicon_url } : undefined,
    verification: b.google_site_verification ? { google: b.google_site_verification } : undefined,
    alternates: APP_URL ? { canonical: APP_URL } : undefined,
    openGraph: { title, description, type: "website", url: APP_URL, siteName },
    twitter: { card: "summary_large_image", title, description },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  themeColor: "#0a0b12",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${bricolage.variable}`}>
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
