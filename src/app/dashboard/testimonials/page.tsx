"use client";
import { CrudSection } from "@/components/CrudSection";
export default function TestimonialsPage() {
  return (
    <CrudSection
      title="Testimonials" subtitle="What people say about your work." endpoint="/portfolio/testimonials" queryKey="testimonials"
      primary="author" secondary="role" addLabel="Add testimonial"
      emptyText="Add quotes from clients or colleagues."
      fields={[
        { name: "author", label: "Author", required: true, half: true, placeholder: "Jane Doe" },
        { name: "role", label: "Role / Company", half: true, placeholder: "CEO, Acme" },
        { name: "quote", label: "Quote", type: "textarea", required: true, placeholder: "They were amazing to work with…" },
        { name: "avatar_url", label: "Avatar URL", type: "url", placeholder: "https://…" },
      ]}
    />
  );
}
