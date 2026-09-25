import type { PublicPortfolio } from "@/lib/publicTypes";
import { MinimalTemplate } from "./MinimalTemplate";
import { BoldTemplate } from "./BoldTemplate";

export const TEMPLATES = [
  { id: "minimal", name: "Minimal", desc: "Clean, light, typography-first." },
  { id: "bold", name: "Bold", desc: "Dark, dramatic, big statements." },
];

export function TemplateRenderer({ data }: { data: PublicPortfolio }) {
  switch (data.template) {
    case "bold":
      return <BoldTemplate data={data} />;
    case "minimal":
    default:
      return <MinimalTemplate data={data} />;
  }
}
