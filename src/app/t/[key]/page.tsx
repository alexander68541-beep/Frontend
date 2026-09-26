"use client";

import { useParams } from "next/navigation";
import { TEMPLATE_COMPONENTS } from "@/templates/registry";
import { DEMO_PORTFOLIO } from "@/lib/demoPortfolio";

export default function TemplateDemoPage() {
  const params = useParams();
  const key = String(params.key || "minimal");
  const Comp = TEMPLATE_COMPONENTS[key] ?? TEMPLATE_COMPONENTS.minimal;
  const data = { ...DEMO_PORTFOLIO, template: key };
  return <Comp data={data} />;
}
