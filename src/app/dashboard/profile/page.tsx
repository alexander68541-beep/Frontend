"use client";
import { ProfileSection } from "@/components/ProfileSection";
export default function ProfilePage() {
  return (
    <ProfileSection
      title="Profile"
      subtitle="The core details every template shows."
      fields={[
        { name: "display_name", label: "Display name", half: true, placeholder: "Arya Sen" },
        { name: "title", label: "Title / headline", half: true, placeholder: "Product Designer" },
        { name: "tagline", label: "Tagline", placeholder: "Designing calm, useful products" },
        { name: "pronouns", label: "Pronouns", half: true, placeholder: "she/her" },
        { name: "location", label: "Location", half: true, placeholder: "Dhaka, Bangladesh" },
        { name: "bio", label: "Short bio", type: "textarea", placeholder: "A one or two line intro…" },
        { name: "avatar_url", label: "Avatar URL", type: "url", placeholder: "https://… (uploads in Phase 5)" },
      ]}
    />
  );
}
