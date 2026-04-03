import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const driver = (process.env.STORAGE_DRIVER || "local").toLowerCase();

const s3Client =
  driver === "s3"
    ? new S3Client({
        region: process.env.S3_REGION || "auto",
        endpoint: process.env.S3_ENDPOINT,
        forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
        credentials:
          process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY
            ? {
                accessKeyId: process.env.S3_ACCESS_KEY_ID,
                secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
              }
            : undefined,
      })
    : null;

export const isS3Enabled = () => driver === "s3";

const normalizePublicBase = (url) => (url ? url.replace(/\/$/, "") : "");

const buildPublicUrl = (key) => {
  const base = normalizePublicBase(process.env.S3_PUBLIC_BASE_URL);
  if (base) return `${base}/${key}`;

  if (process.env.S3_ENDPOINT && process.env.S3_BUCKET) {
    const endpoint = process.env.S3_ENDPOINT.replace(/\/$/, "");
    return `${endpoint}/${process.env.S3_BUCKET}/${key}`;
  }

  throw new Error("S3_PUBLIC_BASE_URL is required when using STORAGE_DRIVER=s3");
};

export const uploadBuffer = async ({ key, body, contentType }) => {
  if (!isS3Enabled()) {
    throw new Error("uploadBuffer called with non-s3 storage driver");
  }

  if (!s3Client) throw new Error("S3 client is not configured");
  if (!process.env.S3_BUCKET) throw new Error("S3_BUCKET is not configured");

  await s3Client.send(
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType || "application/octet-stream",
      CacheControl: "public, max-age=31536000",
    })
  );

  return buildPublicUrl(key);
};
