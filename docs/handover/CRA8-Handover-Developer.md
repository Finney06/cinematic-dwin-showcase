---
title: "CRA8 Website — Developer Handover"
subtitle: "Architecture, environments, deployment, and open items"
date: "August 2026"
---

# CRA8 Website — Developer Handover

For the engineer who maintains this after handover. Pair this with:

- `docs/CRA8-Architecture.md` — the content model, routing, publishing rules,
  the slate grid, undo/redo, how to add a block type or a collection. **Read it.**
- `docs/CRA8-CMS-Handbook.md` — the editor-facing guide (what the client does).
- `docs/CRA8-Creative-Direction-Final.md` — art direction and the founding slate.
- `README.md` and `server/HOSTING.md` — setup notes (see *Known drift* below
  before trusting every line).

---

## 1. Stack

**Frontend** — React 18 + TypeScript, Vite 5, Tailwind + shadcn/ui (Radix),
Framer Motion, React Router 6, TanStack Query 5, react-hook-form + zod.
Built to `dist/`. Two HTML entry points: `index.html` (public site) and
`admin.html` (admin SPA), split in `vite.config.ts`.

**Backend** — `server/`: Express 4 (ESM), `pg` (Postgres), `jsonwebtoken` auth
(bcryptjs hashes), `multer` uploads, `sharp` image processing, `helmet`,
`express-rate-limit`, CORS. Storage driver is pluggable: `local | s3 | cloudinary`
(`server/utils/`).

**Database** — Postgres. `server/db.js` owns the schema: `CREATE TABLE IF NOT
EXISTS` + an append-only `ADD COLUMN IF NOT EXISTS` list that runs on every boot,
plus an idempotent `backfill()`. Deploying and restarting *is* the migration.
Never edit a line above the bottom of `ADD_COLUMNS`.

---

## 2. Repository layout

```
src/                    Frontend
  pages/                Public pages (Index, Work, ProjectDetail, Journal, …)
  pages/admin/          Admin screens (AdminProjects, AdminPages, AdminSettings, …)
  components/site/      Shared render layer — PageShell, Masthead, MediaFrame,
                        SmartImage, Slate, Reveal, Seo, states
  components/admin/     FormFields, BlockListEditor, CollectionAdmin, UndoRedo
  hooks/                useCmsPage, useContent, useEditHistory, adminQueries
  lib/                  api.ts, pageBlocks.ts, slate.ts, brand.ts
  App.tsx               Routing — explicit routes, then /:slug → SlugPage
server/
  index.js              App wiring; every collection mounted at /api/x and /api/admin/x
  db.js                 Schema + migrations + backfill
  routes/               auth, projects, categories, content, journal, services,
                        team, menu, contact, upload, audit, sitemap
  utils/collection.js   Shared implementation for journal/services/team
  seed.js               Idempotent-ish seed (guarded in prod)
  rebrand-cra8.js       DWINDIK → CRA8 data migration (dry-run by default)
docs/                   Architecture, CMS handbook, creative direction, this file
```

Tests: `src/test/cra8-smoke.test.tsx`, `src/test/example.test.ts` (Vitest +
Testing Library, jsdom). `npm test`. Coverage is light — a smoke test of the
home screen and basics.

---

## 3. Local development

**Frontend**

```bash
npm install
npm run dev            # Vite on http://localhost:8080, proxies /api → backend
```

**Backend**

```bash
cd server
npm install
cp .env.example .env   # then edit — see the env table below
npm run seed           # local admin user + starter content
npm run dev            # nodemon, http://localhost:5001
```

The local `DATABASE_URL` should point at a **local** Postgres
(`postgresql://<user>@localhost:5432/dwindik_cms` on the current dev machine —
Homebrew Postgres 16). **Never point localhost at the production database.**

> The Supabase URL that may still appear in a local `server/.env`
> (`db.azaanjaxedjakxlltvxs.supabase.co`) is a **dead, deleted project** and has
> nothing to do with production. Ignore it / replace it.

---

## 4. Environments & deployment

| | Frontend | Backend | Database |
|---|---|---|---|
| Host | Vercel | Render web service | Managed Postgres |
| Name | project `dwindik` / repo `cinematic-dwin-showcase` (`finney06s-projects`) | `dwindik-website` (`srv-d77kqgc50q8c73csol5g`) | via Render `DATABASE_URL` |
| URL | the public domain | `https://dwindik-website.onrender.com` | — |
| Deploy | auto on push to `main` | auto on push to `main`, root dir `server/`, build `npm install`, start `npm start` | schema self-applies on boot |
| Plan | Hobby (free) | **Free instance** — sleeps after ~15 min idle, ~50s cold start | free tier = **deleted after 90 days** |

**Vercel routing** (`vercel.json`): `/admin` and `/admin/*` → `admin.html`;
everything else → `index.html`. To serve the backend sitemap from the frontend
domain, add **above** the catch-all:

```json
{ "source": "/sitemap.xml", "destination": "https://dwindik-website.onrender.com/sitemap.xml" }
```

**Frontend env** (Vercel): `VITE_API_BASE_URL=https://dwindik-website.onrender.com/api`.

**Render free hours are pooled across the workspace** (750 instance-hours/month,
shared with `st-agnes-api`). A 24/7 keep-alive pinger alone is ~744 h and will
suspend *both* services. The keep-alive is an external **cron-job.org** monitor,
scoped to a daytime window (~08:00–16:50 UTC), interval < 15 min. Do **not**
re-add the deleted `.github/workflows/keepalive.yml` — two pingers burn hours
twice as fast. The real fix for 24/7 uptime is Render **Starter ($7/mo)**;
paid instances don't draw from the free pool.

---

## 5. Environment variables (backend)

| Var | Purpose | Notes |
|---|---|---|
| `DATABASE_URL` | Postgres connection string | Set in Render dashboard, **not** in the repo. Managed PG may need `?sslmode=require`; `server/db.js` Pool currently sets no `ssl` option. |
| `PORT` | Listen port | `5000` on Render, `5001` local |
| `JWT_SECRET` | Token signing | Strong random string in prod |
| `JWT_EXPIRES_IN` / `JWT_ISSUER` / `JWT_AUDIENCE` | Token config | `12h` / `cra8-cms` / `cra8-admin` |
| `CORS_ORIGIN` | Allowed frontend origins | Comma-separated; must include the real frontend domain |
| `SITE_URL` | Public origin of the frontend | Used to build `/sitemap.xml` |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | Seed admin defaults | Only used by `seed.js`; set a strong password before any prod seed |
| `ALLOW_PROD_SEED` | Seed guard | Keep `false`. Set `true` only for a deliberate one-off seed, then unset. |
| `MAX_UPLOAD_MB` | Upload cap | Default 25 |
| `STORAGE_DRIVER` | `local` \| `s3` \| `cloudinary` | `local` is **not durable** on Render — use `cloudinary` or `s3` in prod |
| `S3_*` | `S3_ENDPOINT`, `S3_BUCKET`, `S3_REGION` (`auto` for R2), `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_PUBLIC_BASE_URL`, `S3_FORCE_PATH_STYLE` | if `STORAGE_DRIVER=s3` |
| `CLOUDINARY_*` | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `CLOUDINARY_FOLDER` | if `STORAGE_DRIVER=cloudinary` |

`CMS_DB_PATH` appears in `.env.example` and `server/HOSTING.md` — it is a
**leftover from the old SQLite build and is unused**. The backend is Postgres-only.

---

## 6. Auth & API shape

- Single admin user model (`admin_users`). Login: `POST /api/auth/login` → JWT.
  Admin requests send `Authorization: Bearer <token>`.
- Every collection router is mounted at both `/api/x` (public, published only)
  and `/api/admin/x` (token required). `?all=true` / `?draft=true` return
  unpublished content with a token.
- `lib/api.ts` throws `ApiError` with `status` — pages distinguish 404 (render
  the 404 page) from backend-down (render a retry). Don't collapse the two.
- `/api/health` has no DB dependency — use it to tell "service down" from
  "database down".
- `audit_logs` is written on every mutation, readable at `/api/admin/audit`,
  and has no UI by design. Keep the writes.

---

## 7. Known drift & gotchas

1. **README / HOSTING.md mention SQLite** (`CMS_DB_PATH`, "migrate to Postgres
   next"). Stale. The app has been Postgres-only since the
   `chore/postgres-persistence` merge. Worth a docs cleanup pass.
2. **README says the backend is "Express + Postgres"** in one place and implies
   `npm run seed`/Postgres setup — accurate — but the *frontend* README's
   Postgres/S3 sections predate current reality in wording. Verify against
   `server/HOSTING.md` and this doc.
3. **`server/db.js` Pool sets no `ssl`.** Some managed Postgres providers reject
   non-SSL connections or need `?sslmode=require` in the URL. If a fresh DB
   throws on connect, this is the first thing to check.
4. **Production DB has gone down once** (Aug 2026) — the free Postgres hit its
   90-day deletion. Symptom: `/api/health` 200s, every DB endpoint 500s with
   `{"error":"Internal server error"}` (each route catch swallows the real
   error — check Render logs). It has since been restored and is live, but the
   90-day clock is the recurring risk. **Fix it permanently:** paid DB plan or
   scheduled backups.
5. **Two Render services share one free hour pool.** See §4.
6. **`rebrand-cra8.js`** exists for DWINDIK→CRA8 data. Dry-run by default;
   `--apply` to write, `--drop-legacy-projects` also deletes non-slate projects.
   The frontend already falls back to CRA8 defaults, so this is data hygiene,
   not a blocker.
7. **`src/lib/brand.ts`** is the one place identity (name, logo, default menu)
   is in code, not CMS. Intentional.
8. **Home (`src/pages/Index.tsx`) is deliberately a single non-scrolling hero**
   with its own tests — don't "fix" it into a normal page.

---

## 8. Recovery runbook — production DB down

1. Confirm: `/api/health` → 200, `/api/projects` → 500. It's the DB, not the app.
2. Check Render logs for the driver error (ENOTFOUND / auth / SSL).
3. Provision a new Postgres; set `DATABASE_URL` in Render (add `?sslmode=require`
   if needed).
4. Redeploy the backend — `db.js` recreates tables and runs `backfill()` on boot.
5. Re-seed once: set `ALLOW_PROD_SEED=true` and a strong `ADMIN_PASSWORD`
   temporarily, run `npm run seed`, then unset `ALLOW_PROD_SEED`.
6. Re-enter CRA8 content, or restore from a backup if one exists.
7. Smoke test: `/api/health`, login, `/api/projects`, `/api/menu`, upload a
   test image and confirm the returned URL is on the storage domain.

---

## 9. Open items / backlog

- [ ] **Make the database durable** — paid plan or automated backups. Highest priority.
- [ ] Decide on Render Starter ($7/mo) to kill cold starts and pooled-hour risk.
- [ ] Add `ssl` handling to the `pg` Pool config so provider swaps are painless.
- [ ] Clean up `README.md` / `server/HOSTING.md` SQLite references; drop `CMS_DB_PATH`.
- [ ] Log the real error in route catch blocks (or add error middleware detail)
      so "DB down" is visible without shell access.
- [ ] Confirm `STORAGE_DRIVER` in production is `cloudinary` or `s3`, not `local`.
- [ ] Expand test coverage beyond the smoke test.
- [ ] Run `rebrand-cra8.js --apply` against production if legacy DWINDIK rows remain.
- [ ] Wire `/sitemap.xml` rewrite in `vercel.json` and set `SITE_URL` on Render.

---

## 10. Credentials to transfer

Hand over, to accounts in the client's name where possible:

- [ ] GitHub repo access (`Finney06/cinematic-dwin-showcase`)
- [ ] Vercel project (owner/member)
- [ ] Render service `dwindik-website` + workspace note about the shared hour pool
- [ ] `DATABASE_URL` and a fresh database backup
- [ ] Cloudinary / S3 credentials
- [ ] Domain registrar
- [ ] cron-job.org monitor
- [ ] Admin portal username; client sets a new password on first login
- [ ] `JWT_SECRET` (or rotate it and confirm the site still works)
