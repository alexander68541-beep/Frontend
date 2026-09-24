"use client";
import { CrudSection } from "@/components/CrudSection";

export default function LinksPage() {
  return (
    <CrudSection
      title="Social links"
      subtitle="Where people can find you."
      endpoint="/portfolio/links"
      queryKey="links"
      primary="platform"
      secondary="url"
      addLabel="Add link"
      emptyText="Add links to your other profiles and sites."
      fields={[
        { name: "platform", label: "Platform", required: true, half: true, placeholder: "GitHub" },
        { name: "label", label: "Label (optional)", half: true, placeholder: "My code" },
        { name: "url", label: "URL", type: "url", required: true, placeholder: "https://github.com/you" },
      ]}
    />
  );
}
