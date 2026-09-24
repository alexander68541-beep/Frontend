"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    // If email confirmation is OFF, Supabase returns a session and the user is
    // already signed in — go straight to the dashboard. Otherwise, ask them to
    // confirm via email.
    if (data.session) {
      router.push("/dashboard");
      router.refresh();
      return;
    }
    setSent(true);
  }

  return (
    <>
      <Header />
      <div className="auth-wrap">
        <div className="card auth-card">
          {sent ? (
            <>
              <h1>Check your email</h1>
              <p className="muted mt-2">
                We sent a confirmation link to <strong>{email}</strong>. Click it to
                activate your account, then log in.
              </p>
              <Link href="/login" className="btn btn-accent btn-block mt-6">
                Go to login
              </Link>
            </>
          ) : (
            <>
              <h1>Create your account</h1>
              <p className="muted small">Start building your portfolio.</p>
              <form onSubmit={onSubmit} className="stack gap-4 mt-6">
                {error && <div className="alert alert-error">{error}</div>}
                <Field
                  id="email"
                  label="Email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Field
                  id="password"
                  label="Password"
                  type="password"
                  autoComplete="new-password"
                  required
                  hint="At least 8 characters."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button variant="accent" block type="submit" loading={loading}>
                  Create account
                </Button>
              </form>
              <p className="small muted mt-6 center">
                Already have an account? <Link href="/login">Log in</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </>
  );
}
