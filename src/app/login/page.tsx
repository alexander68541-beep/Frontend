"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      // Generic message — do not reveal whether the email exists.
      setError("Invalid email or password.");
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <div className="card auth-card">
      <h1>Welcome back</h1>
      <p className="muted small">Log in to your Folio dashboard.</p>
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
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="row between">
          <span />
          <Link href="/forgot-password" className="small muted">
            Forgot password?
          </Link>
        </div>
        <Button variant="accent" block type="submit" loading={loading}>
          Log in
        </Button>
      </form>
      <p className="small muted mt-6 center">
        New here? <Link href="/register">Create an account</Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <>
      <Header />
      <div className="auth-wrap">
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </>
  );
}
