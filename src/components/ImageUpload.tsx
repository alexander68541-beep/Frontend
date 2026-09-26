"use client";

import { useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/api";

interface SignResp {
  cloud_name: string;
  api_key: string;
  timestamp: number;
  signature: string;
  folder: string;
  account: string;
  index: number;
  has_more: boolean;
}

export function ImageUpload({
  value,
  onChange,
  label,
  hint,
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  hint?: string;
}) {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    apiFetch<{ enabled: boolean }>("/media/config")
      .then((c) => setEnabled(c.enabled))
      .catch(() => setEnabled(false));
  }, []);

  async function onFile(file: File) {
    setError(null);
    setBusy(true);
    let index = 0;
    try {
      // Try each configured Cloudinary account in order (fallback A -> B -> C).
      for (;;) {
        const sign = await apiFetch<SignResp>(`/media/sign?index=${index}`, { method: "POST" });
        const form = new FormData();
        form.append("file", file);
        form.append("api_key", sign.api_key);
        form.append("timestamp", String(sign.timestamp));
        form.append("signature", sign.signature);
        form.append("folder", sign.folder);
        const res = await fetch(`https://api.cloudinary.com/v1_1/${sign.cloud_name}/image/upload`, { method: "POST", body: form });
        if (res.ok) {
          const data = await res.json();
          onChange(data.secure_url as string);
          apiFetch("/media/record", { method: "POST", body: JSON.stringify({
            account: sign.account, public_id: data.public_id, url: data.secure_url,
            format: data.format, width: data.width, height: data.height, bytes: data.bytes,
          }) }).catch(() => {});
          return;
        }
        if (!sign.has_more) throw new Error("upload failed");
        index += 1; // next account
      }
    } catch {
      setError("Upload failed. Check your connection or paste an image URL instead.");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="field full">
      {label && <label className="label">{label}</label>}
      <div className="img-upload">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="img-preview" />
        ) : (
          <div className="img-placeholder" aria-hidden>No image</div>
        )}
        <div className="img-actions">
          {enabled && (
            <>
              <button
                type="button"
                className="btn btn-sm"
                disabled={busy}
                onClick={() => fileRef.current?.click()}
              >
                {busy ? "Uploading…" : value ? "Replace" : "Upload image"}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onFile(f);
                }}
              />
            </>
          )}
          {value && (
            <button type="button" className="btn btn-sm btn-danger" onClick={() => onChange("")}>
              Remove
            </button>
          )}
        </div>
      </div>
      <input
        className="input mt-2"
        placeholder="…or paste an image URL"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {enabled === false && (
        <span className="field-hint">Tip: set Cloudinary keys on the backend to enable direct uploads.</span>
      )}
      {hint && !error && <span className="field-hint">{hint}</span>}
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}
