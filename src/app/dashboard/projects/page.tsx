"use client";
import { CrudSection } from "@/components/CrudSection";

export default function ProjectsPage() {
  return (
    <CrudSection
      title="Projects"
      subtitle="Your showcase work. Featured items can lead your portfolio."
      endpoint="/portfolio/projects"
      queryKey="projects"
      primary="title"
      secondary="role"
      addLabel="Add project"
      emptyText="Add your first project to start building your portfolio."
      fields={[
        { name: "title", label: "Title", required: true, placeholder: "Project name" },
        { name: "role", label: "Your role", half: true, placeholder: "Lead Designer" },
        { name: "url", label: "Link", type: "url", half: true, placeholder: "https://…" },
        { name: "description", label: "Description", type: "textarea", placeholder: "What it is, what you did…" },
        { name: "image_url", label: "Image URL", type: "url", placeholder: "https://… (uploads arrive in Phase 5)" },
        { name: "tags", label: "Tags (comma separated)", type: "tags", placeholder: "React, UI, Branding" },
        { name: "start_date", label: "Start", half: true, placeholder: "2023" },
        { name: "end_date", label: "End", half: true, placeholder: "2024 or Present" },
        { name: "is_featured", label: "Feature this project", type: "checkbox" },
      ]}
    />
  );
}
