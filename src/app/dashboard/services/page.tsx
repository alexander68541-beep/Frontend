"use client";
import { CrudSection } from "@/components/CrudSection";
export default function ServicesPage() {
  return (
    <CrudSection
      title="Services" subtitle="What you offer." endpoint="/portfolio/services" queryKey="services"
      primary="title" secondary="price" addLabel="Add service"
      emptyText="List the services you offer."
      fields={[
        { name: "title", label: "Service", required: true, placeholder: "Brand identity design" },
        { name: "price", label: "Price (optional)", half: true, placeholder: "From $500" },
        { name: "description", label: "Description", type: "textarea", placeholder: "What's included…" },
      ]}
    />
  );
}
