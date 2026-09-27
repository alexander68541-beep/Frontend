"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function HeroCta() {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setSignedIn(!!data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSignedIn(!!s?.user));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (signedIn) {
    return (
      <div className="cta-row rise d3">
        <Link href="/dashboard" className="btn btn-accent btn-lg">Go to your dashboard</Link>
        <Link href="/dashboard/profile" className="btn btn-lg">Edit your portfolio</Link>
      </div>
    );
  }
  return (
    <div className="cta-row rise d3">
      <Link href="/register" className="btn btn-accent btn-lg">Create your portfolio</Link>
      <Link href="/login" className="btn btn-lg">Log in</Link>
    </div>
  );
}
