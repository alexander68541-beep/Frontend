import type { PublicPortfolio } from "@/lib/publicTypes";
import { TEMPLATE_COMPONENTS, TEMPLATE_KEYS, hasTemplate } from "./registry";

export { TEMPLATE_KEYS, hasTemplate };

export function TemplateRenderer({ data }: { data: PublicPortfolio }) {
  const Comp = TEMPLATE_COMPONENTS[data.template] ?? TEMPLATE_COMPONENTS.minimal;
  return <Comp data={data} />;
}
