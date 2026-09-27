export interface FeatureDef { key: string; label: string; desc: string; }

export const FEATURE_CATALOG: FeatureDef[] = [
  { key: "premium_templates", label: "Premium templates", desc: "Studio and other premium designs" },
  { key: "custom_accent", label: "Custom accent colour", desc: "Any colour, not just the presets" },
  { key: "remove_branding", label: "Remove Folio branding", desc: "Hide the ‘Made with Folio’ footer" },
  { key: "custom_domain", label: "Custom domain", desc: "Connect your own domain (coming soon)" },
  { key: "analytics", label: "Analytics", desc: "Visitor and view stats (coming soon)" },
];
