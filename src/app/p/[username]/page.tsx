import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { PublicPortfolio } from "@/lib/publicTypes";
import { TemplateRenderer } from "@/templates";
import { ViewBeacon } from "@/components/ViewBeacon";
import { ReportLink } from "@/components/ReportLink";

async function getData(username: string): Promise<PublicPortfolio | null> {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) return null;
  try {
    const res = await fetch(`${base}/api/v1/public/${encodeURIComponent(username)}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as PublicPortfolio;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const data = await getData(username);
  const name = data?.profile?.display_name || username;
  const title = data ? (data.seo_title || `${name} — Portfolio`) : "Portfolio not found";
  const description = data?.seo_description || data?.profile?.bio || data?.profile?.tagline || `${name}'s portfolio`;
  const root = process.env.NEXT_PUBLIC_ROOT_DOMAIN;
  const url = root ? `https://${username}.${root}` : undefined;
  const image = data?.seo_image || data?.profile?.avatar_url || undefined;
  return {
    title,
    description,
    alternates: url ? { canonical: url } : undefined,
    openGraph: {
      title, description, url, type: "profile",
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: "summary", title, description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function PublicPortfolioPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const data = await getData(username);
  if (!data) notFound();
  return (
    <>
      <ViewBeacon username={data.username ?? ""} />
      <TemplateRenderer data={data} />
      <div className="report-wrap"><ReportLink username={data.username ?? ""} /></div>
    </>
  );
}
