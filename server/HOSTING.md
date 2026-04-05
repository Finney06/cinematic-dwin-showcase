# Backend Hosting Guide (Render + S3/R2 or Cloudinary uploads)

## 1) Deploy API service

1. Create a new **Web Service** on Render.
2. Connect repository and select branch `main`.
3. Set:
   - Root directory: `server`
   - Build command: `npm install`
   - Start command: `npm start`

## 2) Set environment variables

Required:

- `PORT=5000`
- `JWT_SECRET=<strong-secret>`
- `CORS_ORIGIN=https://your-frontend-domain.com`
- `STORAGE_DRIVER=cloudinary` (recommended for this codebase) or `s3`
- `CMS_DB_PATH=<path-on-persistent-volume>/cms.db`

S3 / R2 (alternative):

- `S3_ENDPOINT=<provider endpoint>`
- `S3_BUCKET=<bucket name>`
- `S3_REGION=auto` (R2) or your provider region
- `S3_ACCESS_KEY_ID=<key>`
- `S3_SECRET_ACCESS_KEY=<secret>`
- `S3_PUBLIC_BASE_URL=<public base URL for files>`
- `S3_FORCE_PATH_STYLE=false` (true for some S3-compatible providers)

Cloudinary (recommended):

- `CLOUDINARY_CLOUD_NAME=<cloud name>`
- `CLOUDINARY_API_KEY=<api key>`
- `CLOUDINARY_API_SECRET=<api secret>`
- `CLOUDINARY_FOLDER=dwindik`

Optional seed defaults:

- `ADMIN_USERNAME=dwindik`
- `ADMIN_PASSWORD=admin123`

## 3) Database note (SQLite)

SQLite works for initial deployment, but persistent volume is required to keep data.
If your platform does not provide durable disk, migrate to managed Postgres next.

For Render-style deployments, mount a disk and point `CMS_DB_PATH` to that mount path.

## 4) Smoke test

- `GET /api/health`
- Login via `/api/auth/login`
- Upload image/video from admin and confirm returned URL is from your object storage domain.

## 5) Frontend connection

Point frontend API proxy/base URL to your deployed backend domain.
Update `CORS_ORIGIN` to include your frontend domain(s).

Set frontend env variable:

- `VITE_API_BASE_URL=https://your-backend-domain.com/api`
