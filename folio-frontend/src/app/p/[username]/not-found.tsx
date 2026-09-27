import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "40px 24px" }}>
      <div className="center stack gap-4" style={{ maxWidth: 420 }}>
        <h1 style={{ fontSize: 30 }}>Portfolio not found</h1>
        <p className="muted">
          This portfolio doesn&apos;t exist yet, or it hasn&apos;t been published.
        </p>
        <div className="row" style={{ justifyContent: "center" }}>
          <Link href="/" className="btn btn-accent">Go to Folio</Link>
        </div>
      </div>
    </div>
  );
}
