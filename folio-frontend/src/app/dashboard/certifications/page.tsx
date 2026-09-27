"use client";
import { CrudSection } from "@/components/CrudSection";
export default function CertificationsPage() {
  return (
    <CrudSection
      title="Certifications" subtitle="Credentials and licenses." endpoint="/portfolio/certifications" queryKey="certifications"
      primary="name" secondary="issuer" addLabel="Add certification"
      emptyText="Add your certifications and credentials."
      fields={[
        { name: "name", label: "Name", required: true, placeholder: "AWS Solutions Architect" },
        { name: "issuer", label: "Issuer", half: true, placeholder: "Amazon" },
        { name: "issue_date", label: "Date", half: true, placeholder: "2024" },
        { name: "credential_id", label: "Credential ID", half: true, placeholder: "ABC-123" },
        { name: "url", label: "Credential URL", type: "url", half: true, placeholder: "https://…" },
      ]}
    />
  );
}
