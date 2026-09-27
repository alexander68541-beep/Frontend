"use client";
import { ProfileSection } from "@/components/ProfileSection";
export default function AboutPage() {
  return (
    <ProfileSection
      title="About"
      subtitle="A longer story about you — shown in the About section."
      fields={[
        { name: "about", label: "About you", type: "textarea", placeholder: "Tell your story — background, what you do, what you care about…" },
      ]}
    />
  );
}
