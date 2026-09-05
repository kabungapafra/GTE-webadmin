# Golden Tai — Operations

Internal admin dashboard for Golden Tai Expeditions: bookings pipeline, fleet management, payments, and (soon) permits, lodge bookings, traveller docs, journal and routes content.

This is a real Next.js app backed by a local SQLite database (via Drizzle ORM) — not the design mockup. The original design canvas export lives in `design-reference/` for visual reference.

## Setup

1. `npm install`
2. Copy `.env.local.example` to `.env.local` if it doesn't exist. `DATABASE_PATH` points at the SQLite file (defaults to `./data/app.db`); `SESSION_SECRET` signs login session cookies — generate a real random value for production (`openssl rand -base64 32`), any string is fine for local dev.
3. `npx drizzle-kit migrate` to create/update the database schema.
4. `npm run dev`

## First login

There's no sign-up page — accounts are created directly in the database. To add a team member:

```ts
// one-off script, or adapt src/db/seed.ts
import bcrypt from "bcryptjs";
import { db } from "./src/db";
import { users, staff } from "./src/db/schema";

const passwordHash = await bcrypt.hash("their-password", 10);
db.insert(users).values({ email: "name@goldentai.com", passwordHash }).run();
// then insert a matching `staff` row with the same id, approved: true
```

A `staff` row's `approved` column gates dashboard access — set it `false` and the account can authenticate but gets redirected straight back to `/login` with an explanatory message. There's no signup path today, so this only matters if you ever add one.

## What's built

- Auth (bcrypt + signed session cookie via `jose`) with every route protected by `src/proxy.ts`
- **Pipeline** — full kanban board, live data, move bookings between stages
- **Fleet data** — vehicle list, editable specs, kit checklist, status, workshop records
- **Enquiries** — quote builder, line items, activity log
- **Payments & invoices** — record payments, send reminders
- **On the road** — live driving parties, support log, upcoming handovers, crew list

## What's not built yet

Fleet calendar, Permits, Lodge bookings, Traveller docs, Journal (CMS), Routes & pricing (CMS), Overview — these currently show a "not built yet" placeholder. The database schema for all of them already exists in `src/db/schema.ts`.

## Deploy

Live at `admin.goldentai.com`, deployed via GitHub Actions → SSH → pm2 on the VPS (`.github/workflows/deploy.yml`). The SQLite file lives at `/var/www/golden-tai-admin/data/app.db` on the server, outside the deploy's rsync (same treatment as `.env.local`) so deploys never touch real data — `npx drizzle-kit migrate` runs as part of each deploy to apply any new schema changes.
