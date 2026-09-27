"use client";
import { CrudSection } from "@/components/CrudSection";

export default function EducationPage() {
  return (
    <CrudSection
      title="Education"
      subtitle="Schools, degrees and courses."
      endpoint="/portfolio/education"
      queryKey="education"
      primary="school"
      secondary="degree"
      addLabel="Add education"
      emptyText="Add your education background."
      fields={[
        { name: "school", label: "School", required: true, half: true, placeholder: "University of Dhaka" },
        { name: "degree", label: "Degree", half: true, placeholder: "BSc" },
        { name: "field", label: "Field of study", half: true, placeholder: "Computer Science" },
        { name: "start_date", label: "Start", half: true, placeholder: "2019" },
        { name: "end_date", label: "End", half: true, placeholder: "2023" },
        { name: "description", label: "Description", type: "textarea", placeholder: "Honors, activities…" },
      ]}
    />
  );
}
