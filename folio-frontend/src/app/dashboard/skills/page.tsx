"use client";
import { CrudSection } from "@/components/CrudSection";

export default function SkillsPage() {
  return (
    <CrudSection
      title="Skills"
      subtitle="The tools and abilities you want to highlight."
      endpoint="/portfolio/skills"
      queryKey="skills"
      primary="name"
      secondary="category"
      addLabel="Add skill"
      emptyText="Add the skills you want your portfolio to highlight."
      fields={[
        { name: "name", label: "Skill", required: true, half: true, placeholder: "Figma" },
        { name: "category", label: "Category", half: true, placeholder: "Design" },
        { name: "level", label: "Level (1–5, optional)", type: "number", half: true, placeholder: "4" },
      ]}
    />
  );
}
