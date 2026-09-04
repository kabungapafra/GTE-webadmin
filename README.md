# Golden Tai — Operations

Internal admin dashboard for Golden Tai Expeditions: bookings pipeline, fleet management, payments, and (soon) permits, lodge bookings, traveller docs, journal and routes content.

This is a real Next.js app backed by Supabase — not the design mockup. The original design canvas export lives in `design-reference/` for visual reference.

## Setup

1. `npm install`
2. Copy `.env.local.example` to `.env.local` if it doesn't exist, and fill in the Supabase project URL + publishable key (get these from the Supabase dashboard for project `kloarnatcqlbajndcfyj`, or ask Claude).
3. `npm run dev`

## First login

There's no public sign-up UI beyond the built-in "Create an account" toggle on `/login` — anyone who knows the URL and creates an account gets full access, so **turn that off** once your team's accounts exist (Supabase dashboard → Authentication → Sign In / Providers → Email → disable "Allow new users to sign up").

New accounts require email confirmation before they can sign in (Supabase's default). Until email sending is configured for the project, confirm a new account manually:

```sql
update auth.users set email_confirmed_at = now() where email = '...';
```

A `staff` profile row is created automatically for every new auth user (see the `on_auth_user_created` trigger).

## What's built

- Auth (Supabase, email/password) with every route protected by `src/proxy.ts`
- **Pipeline** — full kanban board, live data, move bookings between stages
- **Fleet data** — vehicle list, editable specs, kit checklist, status, workshop records

## What's not built yet

Enquiries (quote builder), Payments & invoices, On the road, Fleet calendar, Permits, Lodge bookings, Traveller docs, Journal (CMS), Routes & pricing (CMS), Overview — these currently show a "not built yet" placeholder. The database schema for all of them already exists (see the Supabase project's migrations).

## Deploy

Not yet deployed. Plan: `admin.goldentai.com`, mirroring the main site's GitHub Actions → SSH → pm2 pipeline on the same VPS.
