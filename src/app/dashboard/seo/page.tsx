"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch, ApiError } from "@/lib/api";
import type { Portfolio } from "@/lib/types";
import { usePortfolio } from "@/lib/hooks";
import { Button } from "@/components/ui/Button";
import { Field, TextAreaField } from "@/components/ui/Field";
import { ImageUpload } from "@/components/ImageUpload";

export default function SeoPage() {
  const qc = useQueryClient();
  const portfolio = usePortfolio();
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [image, setImage] = useState("");

  useEffect(() => {
    const p = portfolio.data;
    if (p) { setTitle(p.seo_title ?? ""); setDesc(p.seo_description ?? ""); setImage(p.seo_image ?? ""); }
  }, [portfolio.data]);

  const save = useMutation({
    mutationFn: () => apiFetch<Portfolio>("/portfolio/seo", { method: "PATCH", body: JSON.stringify({ seo_title: title, seo_description: desc, seo_image: image }) }),
    onSuccess: (d) => qc.setQueryData(["portfolio"], d),
  });
  const err = save.error instanceof ApiError ? save.error.message : null;

  if (portfolio.isLoading) return <p className="muted">Loading…</p>;

  return (
    <div className="stack gap-6">
      <div><h1 className="page-title">SEO / Sharing</h1><p className="muted">Control how your portfolio appears in Google and when shared. Leave blank to auto-use your name, bio and avatar.</p></div>
      <div className="card">
        <div className="stack gap-4">
          {err && <div className="alert alert-error">{err}</div>}
          {save.isSuccess && <div className="alert alert-ok">Saved.</div>}
          <Field id="seo_title" label="Meta title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Arya Sen — Product Designer" hint="Shown as the browser tab & Google title." />
          <TextAreaField id="seo_desc" label="Meta description" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Short summary shown in search results and link previews." rows={3} />
          <ImageUpload label="Social share image (og:image)" value={image} onChange={setImage} hint="Recommended 1200×630. Falls back to your avatar." />
          <div><Button variant="accent" loading={save.isPending} onClick={() => save.mutate()}>Save SEO</Button></div>
        </div>
      </div>
      <div className="card muted small">
        Tip: your public pages are server-rendered with proper title, description, Open Graph & Twitter
        tags, plus a sitemap.xml and robots.txt — so they can rank on Google and preview nicely when shared.
      </div>
    </div>
  );
}
