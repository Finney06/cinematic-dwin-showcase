# CRA8 — Film Studio

The website for CRA8, a Nigerian film studio working in spiritual drama and thriller.
Cinematic motion, video-led hero, an admin-managed slate, and a minimalist dark aesthetic.

Art direction and the founding slate are documented in [docs/CRA8-Creative-Direction-Final.md](docs/CRA8-Creative-Direction-Final.md).

## Tech Stack

- React + TypeScript
- Vite
- Tailwind CSS
- Framer Motion

## Backend CMS (Server)

The project includes an Express + Postgres CMS backend in [server](server).

### Run locally

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
- `CMS_DB_PATH` (path to `cms.db` on a persistent disk/volume)

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

If SQLite is used, make sure `CMS_DB_PATH` points to durable storage. Otherwise content can reset on redeploy/restart.

### 3) Frontend to backend

Set frontend API proxy/base to your backend URL in production (via Vite config or hosting rewrite rules).

Set frontend env:

- `VITE_API_BASE_URL=https://your-backend-domain.com/api`

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```
