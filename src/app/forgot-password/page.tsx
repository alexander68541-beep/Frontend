"use client";

import Link from "next/link";
import { useState } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });
    setLoading(false);
    // Always show success — never reveal whether the email is registered.
    setDone(true);
  }

  return (
    <>
      <Header />
      <div className="auth-wrap">
        <div className="card auth-card">
          {done ? (
            <>
              <h1>Check your email</h1>
              <p className="muted mt-2">
                If an account exists for <strong>{email}</strong>, a password reset link
                is on its way.
              </p>
              <Link href="/login" className="btn btn-block mt-6">
                Back to login
              </Link>
            </>
          ) : (
            <>
              <h1>Reset your password</h1>
              <p className="muted small">We&apos;ll email you a reset link.</p>
              <form onSubmit={onSubmit} className="stack gap-4 mt-6">
                <Field
                  id="email"
                  label="Email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Button variant="accent" block type="submit" loading={loading}>
                  Send reset link
                </Button>
              </form>
              <p className="small muted mt-6 center">
                <Link href="/login">Back to login</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </>
  );
}
