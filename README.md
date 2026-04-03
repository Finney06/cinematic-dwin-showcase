# DWINDIK — Filmmaker & Creative Director

A cinematic portfolio website for Dwindik, featuring immersive animations, video playback, and a minimalist dark aesthetic.

## Tech Stack

- React + TypeScript
- Vite
- Tailwind CSS
- Framer Motion

## Backend CMS (Server)

The project includes an Express + SQLite CMS backend in [server](server).

### Run locally

```bash
cd server
npm install
cp .env.example .env
npm run seed
npm run dev
```

## Hosting backend + uploads

### 1) Deploy backend

Deploy [server](server) as a Node service (Render, Railway, Fly.io, etc.) and set:

- `PORT`
- `JWT_SECRET`
- `CORS_ORIGIN` (your frontend URL, comma-separated if multiple)

### 2) Configure uploads storage

For production, use object storage (S3/R2/Spaces) instead of local disk:

- `STORAGE_DRIVER=s3`
- `S3_ENDPOINT`
- `S3_BUCKET`
- `S3_ACCESS_KEY_ID`
- `S3_SECRET_ACCESS_KEY`
- `S3_REGION` (or `auto` for R2)
- `S3_PUBLIC_BASE_URL` (public URL base to serve assets)

If `STORAGE_DRIVER=local`, files are stored in [server/uploads](server/uploads) and are not durable on most hosting platforms.

### 3) Frontend to backend

Set frontend API proxy/base to your backend URL in production (via Vite config or hosting rewrite rules).

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```
