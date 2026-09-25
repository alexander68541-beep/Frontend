"use client";
import { ProfileSection } from "@/components/ProfileSection";
export default function ResumePage() {
  return (
    <ProfileSection
      title="Resume / CV"
      subtitle="Link to your downloadable resume."
      fields={[
        { name: "resume_url", label: "Resume URL", type: "url", placeholder: "https://…/cv.pdf (uploads in Phase 5)" },
      ]}
    />
  );
}
