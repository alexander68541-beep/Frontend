"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch, ApiError } from "@/lib/api";
import type { Availability, Portfolio } from "@/lib/types";
import { normalizeUsername, validateUsername } from "@/lib/username";
import { Button } from "@/components/ui/Button";

export function UsernamePicker({ portfolio }: { portfolio: Portfolio }) {
  const qc = useQueryClient();
  const [value, setValue] = useState(portfolio.username ?? "");
  const [check, setCheck] = useState<Availability | null>(null);
  const [checking, setChecking] = useState(false);
  const localError = useMemo(() => (value ? validateUsername(value) : null), [value]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const current = portfolio.username ?? "";
  const normalized = normalizeUsername(value);
  const unchanged = normalized === current;

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    setCheck(null);
    if (!normalized || unchanged || localError) return;
    setChecking(true);
    timer.current = setTimeout(async () => {
      try {
        const res = await apiFetch<Availability>(
          `/username/check?username=${encodeURIComponent(normalized)}`,
        );
        setCheck(res);
      } catch {
        // Live check is only a hint — if it fails, the claim itself still validates
        // on the server. Don't block the user.
        setCheck(null);
      } finally {
        setChecking(false);
      }
    }, 450);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [normalized, unchanged, localError]);

  const save = useMutation({
    mutationFn: (username: string) =>
      apiFetch<Portfolio>("/portfolio/username", {
        method: "PUT",
        body: JSON.stringify({ username }),
      }),
    onSuccess: (data) => {
      qc.setQueryData(["portfolio"], data);
      setCheck(null);
    },
  });

  // Enable as soon as the format is valid and the name changed. The server does the
  // authoritative reserved/taken/format check on claim and returns a clear error.
  // Only block when the live check EXPLICITLY says it's unavailable.
  const explicitlyUnavailable = check !== null && check.available === false;
  const canSave = !!normalized && !unchanged && !localError && !explicitlyUnavailable;
  const saveErr = save.error instanceof ApiError ? save.error.message : null;

  return (
    <div className="card">
      <h2 className="card-title">Your public address</h2>
      <p className="muted small">
        This is where your portfolio lives. You can change it later
        {portfolio.username_change_count > 0 ? " (subject to a cooldown)" : ""}.
      </p>

      <div className="stack gap-2 mt-6">
        <label className="label" htmlFor="username">
          Username
        </label>
        <div className="input-affix">
          <span className="prefix">folio.assetprim.com/p/</span>
          <input
            id="username"
            className="input"
            placeholder="your-name"
            value={value}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            onChange={(e) => setValue(e.target.value)}
          />
        </div>

        {localError && <span className="field-error">{localError}</span>}
        {!localError && checking && <span className="field-hint">Checking availability…</span>}
        {!localError && !checking && check && !unchanged && (
          <span
            className={check.available ? "field-hint" : "field-error"}
            style={check.available ? { color: "var(--ok)" } : undefined}
          >
            {check.available ? "✓ Available" : check.message}
          </span>
        )}
        {unchanged && current && (
          <span className="field-hint">This is your current username.</span>
        )}

        {check && !check.available && check.suggestions.length > 0 && (
          <div className="chips mt-2">
            {check.suggestions.map((s) => (
              <button key={s} type="button" className="chip" onClick={() => setValue(s)}>
                {s}
              </button>
            ))}
          </div>
        )}

        {saveErr && <div className="alert alert-error mt-2">{saveErr}</div>}

        <div className="mt-4">
          <Button
            variant="accent"
            disabled={!canSave}
            loading={save.isPending}
            onClick={() => save.mutate(normalized)}
          >
            {current ? "Update username" : "Claim username"}
          </Button>
        </div>
      </div>
    </div>
  );
}
