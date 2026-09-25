"use client";
import { CrudSection } from "@/components/CrudSection";

export default function ExperiencePage() {
  return (
    <CrudSection
      title="Experience"
      subtitle="Your work history."
      endpoint="/portfolio/experience"
      queryKey="experience"
      primary="company"
      secondary="title"
      addLabel="Add experience"
      emptyText="Add your roles and work history."
      fields={[
        { name: "company", label: "Company", required: true, half: true, placeholder: "Acme Inc." },
        { name: "title", label: "Title", half: true, placeholder: "Product Designer" },
        { name: "location", label: "Location", half: true, placeholder: "Dhaka, Bangladesh" },
        { name: "start_date", label: "Start", half: true, placeholder: "Jan 2022" },
        { name: "end_date", label: "End", half: true, placeholder: "Present" },
        { name: "description", label: "Description", type: "textarea", placeholder: "What you did there…" },
        { name: "is_current", label: "I currently work here", type: "checkbox" },
      ]}
    />
  );
}
