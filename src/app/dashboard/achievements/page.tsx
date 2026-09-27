"use client";
import { CrudSection } from "@/components/CrudSection";
export default function AchievementsPage() {
  return (
    <CrudSection
      title="Achievements" subtitle="Awards and highlights." endpoint="/portfolio/achievements" queryKey="achievements"
      primary="title" secondary="date" addLabel="Add achievement"
      emptyText="Add awards, honors and highlights."
      fields={[
        { name: "title", label: "Title", required: true, placeholder: "Awwwards SOTD" },
        { name: "date", label: "Date", half: true, placeholder: "2024" },
        { name: "description", label: "Description", type: "textarea", placeholder: "Details…" },
      ]}
    />
  );
}
