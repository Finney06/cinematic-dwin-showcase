# CRA8 — Film Studio

The website for CRA8, a Nigerian film studio working in spiritual drama and thriller.
Cinematic motion, video-led hero, an admin-managed slate, and a minimalist dark aesthetic.

Art direction and the founding slate are documented in [docs/CRA8-Creative-Direction-Final.md](docs/CRA8-Creative-Direction-Final.md).

**Managing the site:** [docs/CRA8-CMS-Handbook.md](docs/CRA8-CMS-Handbook.md) — the
editor's guide to the admin portal.
**Maintaining the code:** [docs/CRA8-Architecture.md](docs/CRA8-Architecture.md) —
the content model, routing, and how to extend it.

Everything a visitor sees comes from the CMS. Projects, categories, images,
video, credits, services, journal entries, team members, page copy, navigation,
contact details and per-page SEO are all editable at `/admin`, and new pages can
be created there without a deploy.

## Tech Stack

- React + TypeScript
- Vite
- Tailwind CSS
- Framer Motion

## Backend CMS (Server)

The project includes an Express + Postgres CMS backend in [server](server).

### Run locally

Set `DATABASE_URL`, a random `JWT_SECRET`, `ADMIN_USERNAME` and `ADMIN_PASSWORD`
in `server/.env` before starting. The initial password must have at least 12
characters, including uppercase, lowercase, a number and a symbol, and fit in
72 UTF-8 bytes. Keep these secrets on the server; never use `VITE_` variables.
The server creates the admin account automatically on first startup if no admin
exists. Seeding content is optional. Existing accounts are always preserved,
even if the environment credentials change or the seed command is rerun.

To change the password, open **Admin → Settings → Change Password**, enter the
current password and confirm the new password. The database stores only a bcrypt
hash. A successful change invalidates every existing login token and requires
signing in again. The original environment password does not remain a fallback.
Keep PostgreSQL persistent so changes survive deployments. Deploy this update
with a backend restart; its schema migration runs automatically and existing
sessions must sign in again. Serve the production frontend and API over HTTPS.

Authentication regression tests: `npx vitest run --config server/vitest.config.js`
from the repository root (after installing frontend and server dependencies).

Forgotten passwords: the login page links to `/admin/forgot-password`. Configure
`ADMIN_RECOVERY_EMAIL` to an inbox you control, `ADMIN_USERNAME` to the existing
account's exact username, the SMTP variables, and `SITE_URL` to the frontend
origin (HTTPS in production; `http://127.0.0.1:8080` locally). No recovery email
is accepted from the requester. Links expire after 15 minutes, are single use,
and only their hashes are stored. Resetting revokes all sessions; changing a
password also cancels pending reset links. Restart the backend for migrations.
Email delivery requires working SMTP credentials; without configuration the
recovery form clearly reports that recovery is unavailable.

```bash
cd server
npm install
cp .env.example .env
npm run seed
npm run dev
```

### Rebranding an existing DWINDIK database

The public site reads its identity, menu and About copy from the database, so a
database seeded by the previous personal-portfolio site still holds DWINDIK-era
rows. The frontend ignores those values and falls back to the CRA8 defaults, but
the database should be migrated properly:

```bash
cd server
npm run rebrand                # dry run — prints every change, writes nothing
npm run rebrand -- --apply     # writes the changes
```

Add `--drop-legacy-projects` to also delete projects that are not on the CRA8
slate (off by default — it deletes rows).

Contact email and social links are intentionally left blank: set CRA8's own in
**Admin → Settings**. Until a contact email is set, the site hides its contact
links rather than showing a guessed address.

## Hosting backend + uploads

### 1) Deploy backend

Deploy [server](server) as a Node service (Render, Railway, Fly.io, etc.) and set:

- `PORT`
- `JWT_SECRET`
- `CORS_ORIGIN` (your frontend URL, comma-separated if multiple)
- `DATABASE_URL` (Postgres connection string)
- `SITE_URL` (public origin of the frontend — used to build `/sitemap.xml`)

### 2) Configure uploads storage

For production, use object storage (S3/R2/Spaces or Cloudinary) instead of local disk:

- `STORAGE_DRIVER=s3`
- `S3_ENDPOINT`
- `S3_BUCKET`
- `S3_ACCESS_KEY_ID`
- `S3_SECRET_ACCESS_KEY`
- `S3_REGION` (or `auto` for R2)
- `S3_PUBLIC_BASE_URL` (public URL base to serve assets)

Cloudinary option:

- `STORAGE_DRIVER=cloudinary`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `CLOUDINARY_FOLDER`

If `STORAGE_DRIVER=local`, files are stored in [server/uploads](server/uploads) and are not durable on most hosting platforms.

### 3) Frontend to backend

Set frontend API proxy/base to your backend URL in production (via Vite config or hosting rewrite rules).

Set frontend env:

- `VITE_API_BASE_URL=https://your-backend-domain.com/api`

The sitemap is generated by the backend from live content. Point the frontend
domain at it by adding a rewrite in `vercel.json`, above the catch-all:

```json
{ "source": "/sitemap.xml", "destination": "https://your-backend-domain.com/sitemap.xml" }
```

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```
