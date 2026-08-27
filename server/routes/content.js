import { Router } from "express";
import pool from "../db.js";
import { authMiddleware } from "../middleware/auth.js";
import { logAudit } from "../utils/audit.js";
import { deleteUploadedUrl } from "../utils/storage.js";

const router = Router();

// ─── PUBLIC ──────────────────────────────────────────────────

// GET /api/content/about
router.get("/about", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM page_content WHERE page_slug = 'about'");
    const row = rows[0];
    if (!row) return res.json({ page_slug: "about", title: "", content: {} });
    res.json({ ...row, content: JSON.parse(row.content) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/content/hero
router.get("/hero", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM hero_content LIMIT 1");
    const row = rows[0];
    if (!row) {
      return res.json({
        brand_text: "CRA8",
        tagline: "Spiritual Drama",
        video_url: "/trillar-video.mp4",
        hero_image: "",
        hero_link: "",
      });
    }
    res.json(row);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/content/settings
router.get("/settings", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT key, value FROM site_settings");
    const settings = {};
    rows.forEach((row) => {
      settings[row.key] = row.value;
    });
    res.json(settings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/content/page/:slug
router.get("/page/:slug", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM page_content WHERE page_slug = $1", [req.params.slug]);
    const row = rows[0];
    if (!row) {
      return res.json({ page_slug: req.params.slug, title: "", content: {} });
    }
    res.json({ ...row, content: JSON.parse(row.content) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── ADMIN ───────────────────────────────────────────────────

// PUT /api/admin/content/about
router.put("/about", authMiddleware, async (req, res) => {
  try {
    const { content } = req.body;
    const contentStr = JSON.stringify(content);

    const { rows } = await pool.query("SELECT * FROM page_content WHERE page_slug = 'about'");
    const existing = rows[0];

    if (existing) {
      await pool.query(
        "UPDATE page_content SET content = $1, updated_at = CURRENT_TIMESTAMP WHERE page_slug = 'about'",
        [contentStr]
      );
    } else {
      await pool.query(
        "INSERT INTO page_content (page_slug, title, content) VALUES ('about', 'About', $1)",
        [contentStr]
      );
    }

    await logAudit(req, "content.about.update", "content", "about");

    res.json({ message: "About page updated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/admin/content/hero
router.put("/hero", authMiddleware, async (req, res) => {
  try {
    const { brand_text, tagline, video_url, hero_image, hero_link } = req.body;

    const { rows } = await pool.query("SELECT * FROM hero_content LIMIT 1");
    const existing = rows[0];
    
    const previousVideoUrl = existing?.video_url || "";
    const nextVideoUrl = video_url ?? previousVideoUrl;

    if (existing) {
      await pool.query(`
        UPDATE hero_content SET
          brand_text = $1, tagline = $2, video_url = $3, hero_image = $4, hero_link = $5,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $6
      `, [
        brand_text ?? existing.brand_text,
        tagline ?? existing.tagline,
        nextVideoUrl,
        hero_image ?? existing.hero_image,
        hero_link ?? existing.hero_link,
        existing.id
      ]);
    } else {
      await pool.query(`
        INSERT INTO hero_content (brand_text, tagline, video_url, hero_image, hero_link)
        VALUES ($1, $2, $3, $4, $5)
      `, [brand_text || "CRA8", tagline || "Spiritual Drama", video_url || "", hero_image || "", hero_link || ""]);
    }

    if (existing && previousVideoUrl && nextVideoUrl !== previousVideoUrl) {
      try {
        await deleteUploadedUrl(previousVideoUrl);
      } catch (err) {
        console.warn("Failed to delete previous hero video:", err?.message || err);
      }
    }

    await logAudit(req, "content.hero.update", "content", "hero");

    res.json({ message: "Hero content updated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/admin/content/settings
router.put("/settings", authMiddleware, async (req, res) => {
  try {
    const settings = req.body; // { key: value, key: value, ... }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      for (const [key, value] of Object.entries(settings)) {
        await client.query(`
          INSERT INTO site_settings (key, value, updated_at)
          VALUES ($1, $2, CURRENT_TIMESTAMP)
          ON CONFLICT(key) DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP
        `, [key, value]);
      }
      await client.query("COMMIT");
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }

    await logAudit(req, "content.settings.update", "content", "settings", {
      keys: Object.keys(settings),
    });
    res.json({ message: "Settings updated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/admin/content/page/:slug
router.put("/page/:slug", authMiddleware, async (req, res) => {
  try {
    const { title, content } = req.body;
    const contentStr = JSON.stringify(content || {});

    const { rows } = await pool.query("SELECT * FROM page_content WHERE page_slug = $1", [req.params.slug]);
    const existing = rows[0];

    if (existing) {
      await pool.query(
        "UPDATE page_content SET title = $1, content = $2, updated_at = CURRENT_TIMESTAMP WHERE page_slug = $3",
        [title || existing.title, contentStr, req.params.slug]
      );
    } else {
      await pool.query(
        "INSERT INTO page_content (page_slug, title, content) VALUES ($1, $2, $3)",
        [req.params.slug, title || req.params.slug, contentStr]
      );
    }

    await logAudit(req, "content.page.update", "page", req.params.slug);

    res.json({ message: "Page updated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
