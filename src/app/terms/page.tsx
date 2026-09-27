import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <main className="legal">
      <Link href="/" className="legal-back">← Home</Link>
      <h1>Terms of Service</h1>
      <p className="muted">Last updated: {new Date().getFullYear()}</p>

      <h2>Acceptance</h2>
      <p>By creating an account or using this service, you agree to these Terms. If you do not agree, please do not use the service.</p>

      <h2>Your account</h2>
      <p>You are responsible for the activity on your account and for keeping your credentials secure. You must provide accurate information and be old enough to form a binding contract in your jurisdiction.</p>

      <h2>Your content</h2>
      <p>You retain ownership of the content you add. You grant us the limited right to store, process, and display it for the purpose of operating the service (for example, rendering your public portfolio). You are responsible for ensuring you have the rights to any content you upload.</p>

      <h2>Acceptable use</h2>
      <ul>
        <li>Do not publish unlawful, hateful, deceptive, or infringing content.</li>
        <li>Do not impersonate others or misuse reserved usernames.</li>
        <li>Do not attempt to disrupt, abuse, or gain unauthorized access to the service.</li>
      </ul>
      <p>We may suspend or remove portfolios that violate these terms.</p>

      <h2>Plans &amp; payments</h2>
      <p>Paid plans unlock additional features. Payments are reviewed and applied manually by the administrator. Prices and features may change; we will reflect current pricing in the app.</p>

      <h2>Availability &amp; disclaimer</h2>
      <p>The service is provided “as is,” without warranties of any kind. We do our best to keep it running and your data safe, but we are not liable for indirect or incidental damages to the extent permitted by law.</p>

      <h2>Termination</h2>
      <p>You may delete your account at any time. We may suspend accounts that violate these terms.</p>

      <p className="legal-links"><Link href="/privacy">Privacy Policy</Link> · <Link href="/faq">FAQ</Link></p>
    </main>
  );
}
