"use client";
import { CrudSection } from "@/components/CrudSection";
export default function PublicationsPage() {
  return (
    <CrudSection
      title="Publications" subtitle="Articles, papers and writing." endpoint="/portfolio/publications" queryKey="publications"
      primary="title" secondary="publisher" addLabel="Add publication"
      emptyText="Add articles, papers or talks you've published."
      fields={[
        { name: "title", label: "Title", required: true, placeholder: "Designing for trust" },
        { name: "publisher", label: "Publisher", half: true, placeholder: "Smashing Magazine" },
        { name: "date", label: "Date", half: true, placeholder: "2024" },
        { name: "url", label: "Link", type: "url", placeholder: "https://…" },
        { name: "description", label: "Description", type: "textarea", placeholder: "Short summary…" },
      ]}
    />
  );
}
