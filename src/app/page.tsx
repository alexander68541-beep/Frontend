import Link from "next/link";
import { Header } from "@/components/Header";

export default function Home() {
  return (
    <>
      <Header />
      <main className="container" style={{ padding: "96px 24px 80px" }}>
        <div style={{ maxWidth: 680 }}>
          <span className="badge">Portfolio SaaS · Phase 1</span>
          <h1 style={{ fontSize: "clamp(38px, 6vw, 62px)", lineHeight: 1.05, marginTop: 20 }}>
            A portfolio you own, from templates you don&apos;t have to build.
          </h1>
          <p className="muted" style={{ fontSize: 18, marginTop: 18, maxWidth: 560 }}>
            Enter your work once. Switch templates any time — your data never moves,
            never breaks, never gets locked to a design.
          </p>
          <div className="row wrap mt-8">
            <Link href="/register" className="btn btn-accent">
              Create your portfolio
            </Link>
            <Link href="/login" className="btn">
              Log in
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
