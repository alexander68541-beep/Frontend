import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { PublicPortfolio } from "@/lib/publicTypes";
import { TemplateRenderer } from "@/templates";

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
  const title = data ? `${name} — Portfolio` : "Portfolio not found";
  return { title, description: data?.profile?.bio ?? undefined };
}

export default async function PublicPortfolioPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const data = await getData(username);
  if (!data) notFound();
  return <TemplateRenderer data={data} />;
}
