"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAccount, usePortfolio } from "@/lib/hooks";
import { portfolioLabel } from "@/lib/urls";
import { Button } from "@/components/ui/Button";

export default function SettingsPage() {
  const router = useRouter();
  const account = useAccount();
  const portfolio = usePortfolio();

  async function signOut() {
    await createClient().auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="stack gap-6">
      <div>
        <h1 className="page-title">Settings</h1>
        <p className="muted">Your account and portfolio settings.</p>
      </div>

      <div className="card">
        <h2 className="card-title">Account</h2>
        <div className="kv mt-4">
          <div className="row between"><span className="muted">Email</span><span>{account.data?.email ?? "…"}</span></div>
          <div className="row between"><span className="muted">Plan</span><span>Free</span></div>
          <div className="row between"><span className="muted">Public address</span>
            <span>{portfolio.data?.username ? portfolioLabel(portfolio.data.username) : "Not set"}</span>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">Session</h2>
        <p className="muted small">Sign out of your account on this device.</p>
        <div className="mt-4"><Button onClick={signOut}>Sign out</Button></div>
      </div>

      <div className="card danger-zone">
        <h2 className="card-title">Danger zone</h2>
        <p className="muted small">Deleting your portfolio is permanent. This arrives with account management in a later phase.</p>
        <div className="mt-4"><Button disabled>Delete portfolio</Button></div>
      </div>
    </div>
  );
}
