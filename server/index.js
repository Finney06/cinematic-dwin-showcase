import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

import authRoutes from "./routes/auth.js";
import projectRoutes from "./routes/projects.js";
import contentRoutes from "./routes/content.js";
import menuRoutes from "./routes/menu.js";
import uploadRoutes from "./routes/upload.js";
import auditRoutes from "./routes/audit.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === "production";
const storageDriver = (process.env.STORAGE_DRIVER || "local").toLowerCase();

const allowedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const jwtSecret = process.env.JWT_SECRET || "";
if (!jwtSecret || jwtSecret === "change-this-in-production") {
  const message = "JWT_SECRET is missing or insecure. Set a strong JWT_SECRET before running in production.";
  if (isProduction) {
    throw new Error(message);
  }
  console.warn(`⚠️  ${message}`);
}

if (isProduction) {
  if (storageDriver === "local") {
    throw new Error(
      "STORAGE_DRIVER=local is not recommended in production. Use STORAGE_DRIVER=cloudinary or STORAGE_DRIVER=s3."
    );
  }

  if (storageDriver === "cloudinary") {
    const requiredCloudinary = [
      "CLOUDINARY_CLOUD_NAME",
      "CLOUDINARY_API_KEY",
      "CLOUDINARY_API_SECRET",
    ];
    const missing = requiredCloudinary.filter((key) => !process.env[key]);
    if (missing.length > 0) {
      throw new Error(`Missing Cloudinary env vars: ${missing.join(", ")}`);
    }
  }

  if (storageDriver === "s3") {
    const requiredS3 = ["S3_BUCKET", "S3_ACCESS_KEY_ID", "S3_SECRET_ACCESS_KEY", "S3_PUBLIC_BASE_URL"];
    const missing = requiredS3.filter((key) => !process.env[key]);
    if (missing.length > 0) {
      throw new Error(`Missing S3 env vars: ${missing.join(", ")}`);
    }
  }
}

// ─── Ensure uploads directory exists ─────────────────────────
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ─── Middleware ───────────────────────────────────────────────
app.set("trust proxy", 1);
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.length === 0) {
        if (!isProduction) {
          return callback(null, true);
        }
        return callback(new Error("CORS_ORIGIN must be configured in production"));
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve uploaded files
app.use("/uploads", express.static(uploadsDir));

// ─── Routes ──────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/admin/projects", projectRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/admin/content", contentRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/admin/menu", menuRoutes);
app.use("/api/admin/upload", uploadRoutes);
app.use("/api/admin/audit", auditRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── Error handling ──────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  if (err.name === "MulterError") {
    return res.status(400).json({ error: err.message });
  }
  res.status(500).json({ error: "Internal server error" });
});

// ─── Start ───────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n  🎬 Dwindik CMS Server running on http://localhost:${PORT}\n`);
});
