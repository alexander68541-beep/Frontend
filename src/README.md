# Folio (frontend)

Next.js 15 (App Router) + TypeScript + @supabase/ssr + React Query — Phase 1.

## Run locally
```bash
cd folio-frontend
npm install
cp .env.example .env.local     # fill in values (see ../folio-backend/SETUP.md)
npm run dev
```
Open http://localhost:3000 (backend must be running on port 8000).

## What Phase 1 ships
- Supabase email auth: register + email confirmation, login, forgot / reset password
- Session handling via middleware (`/dashboard` is protected)
- Dashboard: claim/change username (live availability + suggestions), edit the universal
  profile section, publish / unpublish
- Base design system (`src/app/globals.css`)

## Structure
```
src/
  app/
    page.tsx                landing
    login / register / forgot-password / reset-password
    auth/callback/route.ts  exchanges the email code for a session
    dashboard/              protected shell + page
  components/               Header, UsernamePicker, ProfileEditor, ui/
  lib/
    supabase/               browser + server clients, middleware session refresh
    api.ts                  fetch wrapper (attaches Supabase bearer token)
    types.ts, username.ts
  middleware.ts
```

Only the **anon** Supabase key belongs here. Secrets live in the backend.
Full setup + deploy steps: **../folio-backend/SETUP.md**.
