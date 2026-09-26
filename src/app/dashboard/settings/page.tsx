"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { apiFetch, ApiError } from "@/lib/api";
import type { Account } from "@/lib/types";
import { useAccount, usePortfolio } from "@/lib/hooks";
import { portfolioLabel } from "@/lib/urls";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";

export default function SettingsPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const account = useAccount();
  const portfolio = usePortfolio();

  const [name, setName] = useState("");
  useEffect(() => { setName(account.data?.full_name ?? ""); }, [account.data?.full_name]);

  const [pw, setPw] = useState(""); const [pw2, setPw2] = useState("");
  const [pwMsg, setPwMsg] = useState<string | null>(null); const [pwErr, setPwErr] = useState<string | null>(null); const [pwBusy, setPwBusy] = useState(false);
  const [delText, setDelText] = useState("");

  const saveName = useMutation({
    mutationFn: () => apiFetch<Account>("/me", { method: "PATCH", body: JSON.stringify({ full_name: name }) }),
    onSuccess: (d) => qc.setQueryData(["account"], d),
  });

  async function changePassword() {
    setPwErr(null); setPwMsg(null);
    if (pw.length < 8) { setPwErr("Password must be at least 8 characters."); return; }
    if (pw !== pw2) { setPwErr("Passwords don't match."); return; }
    setPwBusy(true);
    const { error } = await createClient().auth.updateUser({ password: pw });
    setPwBusy(false);
    if (error) { setPwErr(error.message); return; }
    setPw(""); setPw2(""); setPwMsg("Password updated.");
  }

  const del = useMutation({
    mutationFn: () => apiFetch("/me", { method: "DELETE" }),
    onSuccess: async () => { await createClient().auth.signOut(); router.push("/"); router.refresh(); },
  });
  const delErr = del.error instanceof ApiError ? del.error.message : null;

  async function signOut() { await createClient().auth.signOut(); router.push("/login"); router.refresh(); }

  return (
    <div className="stack gap-6">
      <div><h1 className="page-title">Settings</h1><p className="muted">Your account and portfolio settings.</p></div>

      <div className="card">
        <h2 className="card-title">Account</h2>
        <div className="kv mt-4">
          <div className="row between"><span className="muted">Email</span><span>{account.data?.email ?? "…"}</span></div>
          <div className="row between"><span className="muted">Plan</span><span className={`badge ${account.data?.plan === "pro" ? "badge-published" : ""}`}>{account.data?.plan ?? "free"}</span></div>
          <div className="row between"><span className="muted">Public address</span><span>{portfolio.data?.username ? portfolioLabel(portfolio.data.username) : "Not set"}</span></div>
        </div>
        <div className="stack gap-3 mt-6">
          <Field id="name" label="Display name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          <div><Button variant="accent" loading={saveName.isPending} onClick={() => saveName.mutate()}>{saveName.isSuccess ? "Saved ✓" : "Save"}</Button></div>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">Change password</h2>
        <div className="stack gap-3 mt-4">
          {pwErr && <div className="alert alert-error">{pwErr}</div>}
          {pwMsg && <div className="alert alert-ok">{pwMsg}</div>}
          <div className="form-grid">
            <Field id="pw" label="New password" type="password" value={pw} onChange={(e) => setPw(e.target.value)} />
            <Field id="pw2" label="Confirm" type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} />
          </div>
          <div><Button variant="accent" loading={pwBusy} onClick={changePassword}>Update password</Button></div>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">Session</h2>
        <p className="muted small">Sign out on this device.</p>
        <div className="mt-4"><Button onClick={signOut}>Sign out</Button></div>
      </div>

      <div className="card danger-zone">
        <h2 className="card-title">Danger zone</h2>
        <p className="muted small">Deleting your account is permanent — your portfolio and all data are removed. Type <strong>DELETE</strong> to confirm.</p>
        {delErr && <div className="alert alert-error mt-2">{delErr}</div>}
        <div className="row gap-3 mt-4 wrap">
          <input className="input" style={{ maxWidth: 200 }} value={delText} onChange={(e) => setDelText(e.target.value)} placeholder="DELETE" />
          <Button className="btn-danger" disabled={delText !== "DELETE" || del.isPending} loading={del.isPending} onClick={() => del.mutate()}>Delete my account</Button>
        </div>
      </div>
    </div>
  );
}
