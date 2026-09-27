"use client";
import { ProfileSection } from "@/components/ProfileSection";
export default function ContactPage() {
  return (
    <ProfileSection
      title="Contact"
      subtitle="How people can reach you."
      fields={[
        { name: "email", label: "Public email", type: "email", half: true, placeholder: "you@example.com" },
        { name: "phone", label: "Phone", half: true, placeholder: "+880…" },
        { name: "website", label: "Website", type: "url", half: true, placeholder: "https://…" },
        { name: "availability", label: "Availability", half: true, placeholder: "Open to freelance" },
      ]}
    />
  );
}
