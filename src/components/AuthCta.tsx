"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function AuthCta({ kind }: { kind: "band" | "footer" }) {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setSignedIn(!!data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSignedIn(!!s?.user));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (kind === "band") {
    return (
      <div className="cta-row" style={{ justifyContent: "center" }}>
        {signedIn ? (
          <Link href="/dashboard" className="btn btn-accent btn-lg">Go to your dashboard</Link>
        ) : (
          <Link href="/register" className="btn btn-accent btn-lg">Create your portfolio</Link>
        )}
      </div>
    );
  }

  // footer
  return (
    <div className="foot-links">
      {signedIn ? (
        <Link href="/dashboard">Dashboard</Link>
      ) : (
        <>
          <Link href="/register">Get started</Link>
          <Link href="/login">Log in</Link>
        </>
      )}
    </div>
  );
}
