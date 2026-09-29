# Templates — how to add your own (coded in Next.js)

Templates are real React components in this folder. You code the design; the admin
panel controls listing (name, category, free/pro, active) — no runtime code eval.

## Add a template in 3 steps
1. **Create the component** — copy an existing one (e.g. `MinimalTemplate.tsx`) to
   `AuroraTemplate.tsx` and design it however you like. It receives:
   ```tsx
   export function AuroraTemplate({ data }: { data: PublicPortfolio }) { ... }
   ```
   `data` (see `src/lib/publicTypes.ts`) has: profile (display_name, title, tagline,
   pronouns, bio, about, avatar_url, location, contact…), projects, skills, experience,
   education, services, certifications, achievements, testimonials, publications, links,
   gallery, videos, plus `accent` and `hide_branding`. **Render only sections that have
   data** (guard with `.length > 0` / truthy checks). Use `ZoomImage` for images and
   `LinkChip` for links if you want the built-in behaviours.

2. **Register it** — in `src/templates/registry.tsx` add one line:
   ```tsx
   import { AuroraTemplate } from "./AuroraTemplate";
   // inside TEMPLATE_COMPONENTS:
   aurora: ({ data }) => <AuroraTemplate data={data} />,
   ```
   The map key (`aurora`) is the template's unique key.

3. **Deploy, then list it** — in Dashboard → Templates (as admin) → *Template listings*,
   add a listing: pick the coded key `aurora`, set a display name, category and plan
   (free/pro), and toggle **Active**. It now appears for users in that category.

## Notes
- Turn a template off any time with the **Active** toggle (users can't select inactive ones;
  anyone already on it falls back to Minimal).
- Set a listing to **Pro** to gate it to Pro users (enforced on the backend).
- A listing whose key has no component shows a "no code" flag in admin and is ignored.

## Styling: Tailwind CSS is available
This project has Tailwind set up (`tailwind.config.ts`, `postcss.config.mjs`, and the
`@tailwind` directives in `src/app/globals.css`). So advanced templates that use Tailwind
utility classes (`flex`, `grid`, `text-4xl`, `bg-zinc-900`, …) work out of the box — just
drop the component in `src/templates/` and register it. You can also use plain CSS or CSS
modules. After adding new deps run `npm install` once; Tailwind scans `src/**` automatically.







## Template Creation Promot:

You are building a NEW portfolio TEMPLATE component for "Folio", a multi-tenant 
portfolio SaaS (Next.js 15 App Router + TypeScript + plain CSS). 

CRITICAL RULE: The template is ONLY presentation. ALL data comes from a single 
`data` prop (from the database). You must NOT hardcode any content, NOT fetch 
anything, NOT use any database/API/auth. Just render whatever is in `data`.

## The contract (do not change these types)
The component receives exactly ONE prop: `{ data }: { data: PublicPortfolio }`.

interface PublicPortfolio {
  username: string | null;
  template: string;
  accent: string | null;            // hex color, e.g. "#7c6cff"
  hide_branding: boolean;
  settings?: { font?: string; hidden?: string[]; section_order?: string[] };
  profile: {
    display_name: string | null; title: string | null; tagline: string | null;
    pronouns: string | null; bio: string | null; about: string | null;
    location: string | null; avatar_url: string | null; email: string | null;
    phone: string | null; website: string | null; availability: string | null;
    resume_url: string | null;
  } | null;
  links: { id: string; platform: string; url: string; label: string }[];
  projects: { id; title; role; description; url; image_url; tags: string[]; start_date; end_date; is_featured }[];
  skills: { id; name; category; level }[];
  experience: { id; company; title; location; description; start_date; end_date; is_current }[];
  education: { id; school; degree; field; start_date; end_date; description }[];
  services: { id; title; description; price }[];
  certifications: { id; name; issuer; issue_date; credential_id; url }[];
  achievements: { id; title; description; date }[];
  testimonials: { id; author; role; quote; avatar_url }[];
  publications: { id; title; publisher; date; url; description }[];
  gallery: { id; image_url; caption }[];
  videos: { id; title; url }[];
}
(All string fields can be null. All arrays can be empty.)

## Hard requirements
1. File: a single React function component, default export, named e.g. `AuroraProTemplate`.
   Signature: `export function AuroraProTemplate({ data }: { data: PublicPortfolio })`
2. Import types + helpers from the app:
   import type { PublicPortfolio } from "@/lib/publicTypes";
   import { dateRange, videoEmbed, ext } from "@/lib/publicTypes";  // ext() normalizes urls, dateRange(start,end,isCurrent), videoEmbed(url)
   import { ZoomImage } from "@/components/ZoomImage";              // lightbox image
   import { ContactForm } from "@/components/ContactForm";          // <ContactForm username={data.username} />
3. Use the accent color as a CSS variable on the root:
   style={{ ["--tpl-accent" as string]: data.accent || "#7c6cff" } as React.CSSProperties}
4. EVERY section must be conditionally rendered ONLY if it has data:
   - profile fields: `{p?.about && (...)}`
   - arrays: `{data.projects.length > 0 && (...)}`
   Empty/missing data must NEVER show an empty heading or break the layout.
5. Support section hide + reorder: 
   - Add `const hidden = new Set(data.settings?.hidden ?? []); const sv = (k:string) => !hidden.has(k);`
   - Guard each content section: `{sv("projects") && data.projects.length > 0 && (...)}`
   - Add `data-sec="projects"` (etc.) to each <section> so the app can reorder them.
   - Section keys: about, projects, experience, education, skills, services, certifications, achievements, publications, gallery, videos, testimonials.
6. Contact: near the end render `{data.username && (<section data-sec is not needed here><ContactForm username={data.username} /></section>)}`.
7. Footer: `{!data.hide_branding && (<footer>Made with Folio</footer>)}`.
8. Long text must wrap and never break the layout. Long titles, many items, missing 
   images — all must look fine. Fully responsive: perfect at 360px, tablet, desktop.
9. Images: use <ZoomImage src=... alt=... /> for gallery/project images (or <img> with 
   max-width:100%). Never assume an image exists — guard with the url.
10. Accessibility: semantic headings, alt text, good contrast, visible focus.
11. Styling: write self-contained CSS (inline <style> in the component OR class names I 
    will add to globals.css — tell me which classes you use). Prefix all classes uniquely 
    (e.g. `.aup-hero`, `.aup-card`) so they never clash with other templates.
12. Do NOT use next/image, localStorage, external fonts that need <link> (use system/Google 
    fonts already loaded: Inter + Bricolage Grotesque, or CSS font stacks). No external network calls.

## The design I want  (👉 EDIT THIS PART)
Describe your dream layout here, e.g.:
"A bold split-screen: fixed left sidebar with avatar, name, title, social links; 
right side scrolls through sections. Dark theme with neon accent, big typography, 
card-based projects with hover lift, timeline for experience, masonry gallery. 
Magazine/editorial vibe."

## Output
Give me the complete .tsx file, plus the CSS (clearly separated), and a one-line note 
on how it handles empty data. Make it genuinely beautiful and distinct from a generic template.
