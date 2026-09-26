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
