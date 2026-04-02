import { Router } from "express";
import db from "../db.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

// ─── PUBLIC ──────────────────────────────────────────────────

// GET /api/content/about
router.get("/about", (req, res) => {
  const row = db.prepare("SELECT * FROM page_content WHERE page_slug = 'about'").get();
  if (!row) return res.json({ page_slug: "about", title: "", content: {} });
  res.json({ ...row, content: JSON.parse(row.content) });
});

// GET /api/content/hero
router.get("/hero", (req, res) => {
  const row = db.prepare("SELECT * FROM hero_content LIMIT 1").get();
  if (!row) {
    return res.json({
      brand_text: "DWINDIK",
      tagline: "Cre8te",
      video_url: "/dwindik/video1.mp4",
      hero_image: "/dwindik/5.jpeg",
      hero_link: "https://youtu.be/mPAZSvF5usk?si=IxaXZFE0nJZw0ypt",
    });
  }
  res.json(row);
});

// GET /api/content/settings
router.get("/settings", (req, res) => {
  const rows = db.prepare("SELECT key, value FROM site_settings").all();
  const settings = {};
  rows.forEach((row) => {
    settings[row.key] = row.value;
  });
  res.json(settings);
});

// GET /api/content/page/:slug
router.get("/page/:slug", (req, res) => {
  const row = db
    .prepare("SELECT * FROM page_content WHERE page_slug = ?")
    .get(req.params.slug);
  if (!row) {
    return res.json({ page_slug: req.params.slug, title: "", content: {} });
  }
  res.json({ ...row, content: JSON.parse(row.content) });
});

// ─── ADMIN ───────────────────────────────────────────────────

// PUT /api/admin/content/about
router.put("/about", authMiddleware, (req, res) => {
  const { content } = req.body;
  const contentStr = JSON.stringify(content);

  const existing = db.prepare("SELECT * FROM page_content WHERE page_slug = 'about'").get();
  if (existing) {
    db.prepare(
      "UPDATE page_content SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE page_slug = 'about'"
    ).run(contentStr);
  } else {
    db.prepare(
      "INSERT INTO page_content (page_slug, title, content) VALUES ('about', 'About', ?)"
    ).run(contentStr);
  }

  res.json({ message: "About page updated" });
});

// PUT /api/admin/content/hero
router.put("/hero", authMiddleware, (req, res) => {
  const { brand_text, tagline, video_url, hero_image, hero_link } = req.body;

  const existing = db.prepare("SELECT * FROM hero_content LIMIT 1").get();
  if (existing) {
    db.prepare(`
      UPDATE hero_content SET
        brand_text = ?, tagline = ?, video_url = ?, hero_image = ?, hero_link = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      brand_text ?? existing.brand_text,
      tagline ?? existing.tagline,
      video_url ?? existing.video_url,
      hero_image ?? existing.hero_image,
      hero_link ?? existing.hero_link,
      existing.id
    );
  } else {
    db.prepare(`
      INSERT INTO hero_content (brand_text, tagline, video_url, hero_image, hero_link)
      VALUES (?, ?, ?, ?, ?)
    `).run(brand_text || "DWINDIK", tagline || "Cre8te", video_url || "", hero_image || "", hero_link || "");
  }

  res.json({ message: "Hero content updated" });
});

// PUT /api/admin/content/settings
router.put("/settings", authMiddleware, (req, res) => {
  const settings = req.body; // { key: value, key: value, ... }

  const upsert = db.prepare(`
    INSERT INTO site_settings (key, value, updated_at)
    VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
  `);

  const updateMany = db.transaction((entries) => {
    for (const [key, value] of entries) {
      upsert.run(key, value);
    }
  });

  updateMany(Object.entries(settings));
  res.json({ message: "Settings updated" });
});

// PUT /api/admin/content/page/:slug
router.put("/page/:slug", authMiddleware, (req, res) => {
  const { title, content } = req.body;
  const contentStr = JSON.stringify(content || {});

  const existing = db
    .prepare("SELECT * FROM page_content WHERE page_slug = ?")
    .get(req.params.slug);

  if (existing) {
    db.prepare(
      "UPDATE page_content SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE page_slug = ?"
    ).run(title || existing.title, contentStr, req.params.slug);
  } else {
    db.prepare(
      "INSERT INTO page_content (page_slug, title, content) VALUES (?, ?, ?)"
    ).run(req.params.slug, title || req.params.slug, contentStr);
  }

  res.json({ message: "Page updated" });
});

export default router;
