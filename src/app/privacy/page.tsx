import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <main className="legal">
      <Link href="/" className="legal-back">← Home</Link>
      <h1>Privacy Policy</h1>
      <p className="muted">Last updated: {new Date().getFullYear()}</p>

      <h2>Overview</h2>
      <p>This Privacy Policy explains what information we collect, how we use it, and the choices you have. By using this service you agree to this policy.</p>

      <h2>Information we collect</h2>
      <ul>
        <li><strong>Account information</strong> — your email address and authentication details, handled securely by our authentication provider.</li>
        <li><strong>Portfolio content</strong> — the information you add to your portfolio (name, bio, projects, media, links, etc.).</li>
        <li><strong>Usage analytics</strong> — privacy-safe view counts for your public portfolio. We do not store raw IP addresses; visitor counts use a rotating, non-reversible hash.</li>
      </ul>

      <h2>How we use information</h2>
      <p>We use your information to provide the service: to render your public portfolio, authenticate you, process plan upgrades, and show you basic analytics. We do not sell your personal data.</p>

      <h2>Media &amp; storage</h2>
      <p>Uploaded media is stored with our media provider (Cloudinary). Your portfolio data is stored in a secured database. Access is protected by row-level security and server-side authorization.</p>

      <h2>Public content</h2>
      <p>Anything you publish on your public portfolio is visible to anyone with the link (unless you set it to unlisted or private). Please do not publish information you wish to keep private.</p>

      <h2>Your choices</h2>
      <ul>
        <li>You can edit or delete your content at any time.</li>
        <li>You can set your portfolio to public, unlisted, or private.</li>
        <li>You can export your data as JSON.</li>
        <li>You can delete your account, which removes your portfolio and associated data.</li>
      </ul>

      <h2>Contact</h2>
      <p>For privacy questions, contact the site administrator.</p>

      <p className="legal-links"><Link href="/terms">Terms of Service</Link> · <Link href="/faq">FAQ</Link></p>
    </main>
  );
}
