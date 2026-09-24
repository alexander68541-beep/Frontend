"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch, ApiError } from "@/lib/api";
import type { Portfolio, PortfolioProfile } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Field, TextAreaField } from "@/components/ui/Field";

type Draft = PortfolioProfile;

export function ProfileEditor({ portfolio }: { portfolio: Portfolio }) {
  const qc = useQueryClient();
  const p = portfolio.profile;
  const [draft, setDraft] = useState<Draft>({
    display_name: p?.display_name ?? "",
    title: p?.title ?? "",
    bio: p?.bio ?? "",
    location: p?.location ?? "",
    avatar_url: p?.avatar_url ?? "",
  });
  const [saved, setSaved] = useState(false);

  function set<K extends keyof Draft>(key: K, val: string) {
    setSaved(false);
    setDraft((d) => ({ ...d, [key]: val }));
  }

  const mutation = useMutation({
    mutationFn: () =>
      apiFetch<Portfolio>("/portfolio/profile", {
        method: "PATCH",
        body: JSON.stringify(draft),
      }),
    onSuccess: (data) => {
      qc.setQueryData(["portfolio"], data);
      setSaved(true);
    },
  });

  const err = mutation.error instanceof ApiError ? mutation.error.message : null;

  return (
    <div className="card">
      <h2 className="card-title">Profile</h2>
      <p className="muted small">
        The universal details every template can show. This data is yours — switching
        templates never changes it.
      </p>

      <div className="stack gap-4 mt-6">
        {err && <div className="alert alert-error">{err}</div>}
        {saved && <div className="alert alert-ok">Saved.</div>}

        <div className="grid-2">
          <Field
            id="display_name"
            label="Display name"
            value={draft.display_name ?? ""}
            onChange={(e) => set("display_name", e.target.value)}
            placeholder="Arick Rahman"
          />
          <Field
            id="title"
            label="Title / headline"
            value={draft.title ?? ""}
            onChange={(e) => set("title", e.target.value)}
            placeholder="Product Designer"
          />
        </div>

        <Field
          id="location"
          label="Location"
          value={draft.location ?? ""}
          onChange={(e) => set("location", e.target.value)}
          placeholder="Dhaka, Bangladesh"
        />

        <TextAreaField
          id="bio"
          label="Bio"
          value={draft.bio ?? ""}
          onChange={(e) => set("bio", e.target.value)}
          placeholder="A short introduction…"
          rows={4}
        />

        <Field
          id="avatar_url"
          label="Avatar URL"
          hint="Paste an image URL for now — uploads arrive in Phase 5."
          value={draft.avatar_url ?? ""}
          onChange={(e) => set("avatar_url", e.target.value)}
          placeholder="https://…"
        />

        <div>
          <Button variant="accent" loading={mutation.isPending} onClick={() => mutation.mutate()}>
            Save profile
          </Button>
        </div>
      </div>
    </div>
  );
}
