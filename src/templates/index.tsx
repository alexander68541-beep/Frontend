import type { PublicPortfolio } from "@/lib/publicTypes";
import { MinimalTemplate } from "./MinimalTemplate";
import { BoldTemplate } from "./BoldTemplate";
import { EditorialTemplate } from "./EditorialTemplate";

export interface TemplateMeta {
  id: string;
  name: string;
  desc: string;
  category: string;
  pro?: boolean;
}

export const TEMPLATES: TemplateMeta[] = [
  { id: "minimal", name: "Minimal", desc: "Clean, light, typography-first.", category: "Simple" },
  { id: "editorial", name: "Editorial", desc: "Two-column, magazine style.", category: "Structured" },
  { id: "bold", name: "Bold", desc: "Dark, dramatic, big statements.", category: "Statement" },
  { id: "studio", name: "Studio", desc: "Premium two-column dark.", category: "Premium", pro: true },
];

export const TEMPLATE_CATEGORIES = Array.from(new Set(TEMPLATES.map((t) => t.category)));

export function TemplateRenderer({ data }: { data: PublicPortfolio }) {
  switch (data.template) {
    case "bold":
      return <BoldTemplate data={data} />;
    case "editorial":
      return <EditorialTemplate data={data} variant="editorial" />;
    case "studio":
      return <EditorialTemplate data={data} variant="studio" />;
    case "minimal":
    default:
      return <MinimalTemplate data={data} />;
  }
}
