"use client";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#0a0b12", color: "#e8e8f0", fontFamily: "system-ui, sans-serif" }}>
        <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
          <div style={{ textAlign: "center", maxWidth: 420 }}>
            <div style={{ fontSize: 44 }}>😵‍💫</div>
            <h1 style={{ fontSize: 24, margin: "12px 0" }}>Something went wrong</h1>
            <p style={{ color: "#9a9ab0", marginBottom: 20 }}>A critical error occurred. Please try again.</p>
            <button
              onClick={() => reset()}
              style={{ background: "#7c6cff", color: "#fff", border: "none", padding: "10px 22px", borderRadius: 10, cursor: "pointer", fontWeight: 600 }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
