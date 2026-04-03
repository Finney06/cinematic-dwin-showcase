import { Router } from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";
import fs from "fs/promises";
import sharp from "sharp";
import { authMiddleware } from "../middleware/auth.js";
import { logAudit } from "../utils/audit.js";
import { getStorageDriver, uploadBuffer } from "../utils/storage.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const uploadsDir = path.join(__dirname, "..", "uploads");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 250 * 1024 * 1024 }, // 250MB
  fileFilter: (req, file, cb) => {
    const allowed = /\.(jpg|jpeg|png|gif|webp|svg|mp4|webm|mov)$/i;
    if (allowed.test(path.extname(file.originalname))) {
      cb(null, true);
    } else {
      cb(new Error("File type not allowed"));
    }
  },
});

const router = Router();

const isCompressibleImage = (ext) => /\.(jpg|jpeg|png|webp)$/i.test(ext);

const writeSingleUpload = async (file) => {
  const storageDriver = getStorageDriver();
  const ext = path.extname(file.originalname).toLowerCase();
  const shouldCompress = isCompressibleImage(ext);
  const filename = `${uuidv4()}${shouldCompress ? ".webp" : ext}`;
  const key = `uploads/${filename}`;

  let outputBuffer = file.buffer;
  let contentType = file.mimetype || "application/octet-stream";

  if (shouldCompress) {
    outputBuffer = await sharp(file.buffer)
      .rotate()
      .resize({ width: 2200, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
    contentType = "image/webp";
  }

  if (storageDriver !== "local") {
    const publicUrl = await uploadBuffer({
      key,
      body: outputBuffer,
      contentType,
    });

    return {
      url: publicUrl,
      filename,
      originalName: file.originalname,
      storage: storageDriver,
    };
  }

  const outputPath = path.join(uploadsDir, filename);
  await fs.writeFile(outputPath, outputBuffer);

  return {
    url: `/uploads/${filename}`,
    filename,
    originalName: file.originalname,
    storage: "local",
  };
};

// POST /api/admin/upload
router.post("/", authMiddleware, upload.single("file"), async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  try {
    const file = await writeSingleUpload(req.file);
    logAudit(req, "upload.single", "upload", file.filename, {
      originalName: file.originalName,
      url: file.url,
    });
    res.json(file);
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/upload/multiple
router.post("/multiple", authMiddleware, upload.array("files", 10), async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "No files uploaded" });
  }
  try {
    const files = await Promise.all(req.files.map((f) => writeSingleUpload(f)));
    logAudit(req, "upload.multiple", "upload", "batch", { count: files.length });
    res.json(files);
  } catch (error) {
    next(error);
  }
});

export default router;
