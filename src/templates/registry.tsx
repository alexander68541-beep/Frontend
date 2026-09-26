import type { PublicPortfolio } from "@/lib/publicTypes";
import { MinimalTemplate } from "./MinimalTemplate";
import { BoldTemplate } from "./BoldTemplate";
import { EditorialTemplate } from "./EditorialTemplate";
import { AuroraTemplate } from "./AuroraTemplate";
import { WowTemplate } from "./WowTemplate";

// ============================================================================
// TEMPLATE REGISTRY — the ONE place to register a coded template.
// Each entry maps a unique "key" to a React component that receives portfolio data.
// See ./README.md for the full how-to.
//
// To add your own:
//   1. Create src/templates/MyTemplate.tsx (copy AuroraTemplate.tsx as a starter).
//   2. import { MyTemplate } from "./MyTemplate";
//   3. Add a line below:  mykey: ({ data }) => <MyTemplate data={data} />,
//   4. Deploy, then list it in Dashboard → Templates (admin) with key "mykey".
// ============================================================================

export type TemplateComponent = (props: { data: PublicPortfolio }) => React.ReactNode;

export const TEMPLATE_COMPONENTS: Record<string, TemplateComponent> = {
  minimal: ({ data }) => <MinimalTemplate data={data} />,
  bold: ({ data }) => <BoldTemplate data={data} />,
  editorial: ({ data }) => <EditorialTemplate data={data} variant="editorial" />,
  studio: ({ data }) => <EditorialTemplate data={data} variant="studio" />,
  aurora: ({ data }) => <AuroraTemplate data={data} />,
  wow: ({ data }) => <WowTemplate data={data} />,
};

export const TEMPLATE_KEYS = Object.keys(TEMPLATE_COMPONENTS);

export function hasTemplate(key: string): boolean {
  return key in TEMPLATE_COMPONENTS;
}
