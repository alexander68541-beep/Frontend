import type { PublicPortfolio } from "@/lib/publicTypes";
import { MinimalTemplate } from "./MinimalTemplate";
import { BoldTemplate } from "./BoldTemplate";
import { EditorialTemplate } from "./EditorialTemplate";

// ============================================================================
// TEMPLATE REGISTRY
// This is the ONE place you register a coded template. Each entry maps a unique
// "key" to a React component that receives the portfolio data.
//
// To add your own Next.js/React template:
//   1. Create a component, e.g. src/templates/AuroraTemplate.tsx
//        export function AuroraTemplate({ data }: { data: PublicPortfolio }) { ... }
//      It receives `data` (name, projects, skills, links, gallery, accent, hide_branding …
//      see src/lib/publicTypes.ts). Render only sections that have data.
//   2. Import it here and add a line to TEMPLATE_COMPONENTS below with a unique key.
//   3. Deploy. Then in Dashboard → Admin → Templates, add a listing with that key,
//      give it a name/category/plan and toggle it active. Users can now use it.
// ============================================================================

export type TemplateComponent = (props: { data: PublicPortfolio }) => React.ReactNode;

export const TEMPLATE_COMPONENTS: Record<string, TemplateComponent> = {
  minimal: ({ data }) => <MinimalTemplate data={data} />,
  bold: ({ data }) => <BoldTemplate data={data} />,
  editorial: ({ data }) => <EditorialTemplate data={data} variant="editorial" />,
  studio: ({ data }) => <EditorialTemplate data={data} variant="studio" />,

  // 👉 Add your coded templates here:
  // aurora: ({ data }) => <AuroraTemplate data={data} />,
};

export const TEMPLATE_KEYS = Object.keys(TEMPLATE_COMPONENTS);

export function hasTemplate(key: string): boolean {
  return key in TEMPLATE_COMPONENTS;
}
