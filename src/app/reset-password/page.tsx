"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Arriving from the email link, /auth/callback has already set a session.
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => setReady(!!data.session));
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setDone(true);
    setTimeout(() => router.push("/dashboard"), 1200);
  }

  return (
    <>
      <Header />
      <div className="auth-wrap">
        <div className="card auth-card">
          <h1>Set a new password</h1>
          {!ready ? (
            <p className="muted mt-2">
              This page opens from the reset link in your email. If you got here another
              way, request a new link from the login page.
            </p>
          ) : done ? (
            <div className="alert alert-ok mt-4">Password updated. Redirecting…</div>
          ) : (
            <form onSubmit={onSubmit} className="stack gap-4 mt-6">
              {error && <div className="alert alert-error">{error}</div>}
              <Field
                id="password"
                label="New password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Field
                id="confirm"
                label="Confirm password"
                type="password"
                autoComplete="new-password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
              <Button variant="accent" block type="submit" loading={loading}>
                Update password
              </Button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
