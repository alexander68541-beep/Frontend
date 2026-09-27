import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { PricingSection } from "@/components/PricingSection";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Simple, transparent pricing. Start free — upgrade for premium templates and features.",
};

export default function PricingPage() {
  return (
    <>
      <Header />
      <main className="pricing-page">
        <div className="container">
          <div className="pricing-hero">
            <h1 className="display">Simple pricing. Start free.</h1>
            <p className="lede">See exactly what each plan includes. Upgrade any time — your data always stays yours.</p>
          </div>
          <PricingSection />
          <p className="muted small center" style={{ marginTop: 40 }}>
            Need something custom? <a href="/contact-us">Contact us</a> for a bespoke portfolio.
          </p>
        </div>
      </main>
    </>
  );
}
