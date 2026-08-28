import { Router } from "express";
import pool from "../db.js";
import { authMiddleware } from "../middleware/auth.js";
import { logAudit } from "../utils/audit.js";
import { deleteUploadedUrl } from "../utils/storage.js";
import { slugify, safeParseJson } from "../utils/collection.js";

const router = Router();

/**
 * Pages the site renders with a purpose-built layout. They always exist as far
 * as the public site is concerned — a missing row just means "nothing edited
 * yet", not a 404 — and they can't be deleted from the admin, only unpublished.
 */
const SYSTEM_SLUGS = new Set(["home", "work", "about", "services", "journal", "contact"]);

const shapePage = (row) => ({
  page_slug: row.page_slug,
  title: row.title || "",
  content: safeParseJson(row.content, {}),
  published: row.published === null || row.published === undefined ? 1 : row.published,
  is_system: row.is_system ? 1 : 0,
  seo_title: row.seo_title || "",
  seo_description: row.seo_description || "",
  seo_image: row.seo_image || "",
  updated_at: row.updated_at,
});

/** What a page that has never been edited looks like. */
const emptyPage = (slug) => ({
  page_slug: slug,
  title: "",
  content: {},
  published: 1,
  is_system: SYSTEM_SLUGS.has(slug) ? 1 : 0,
  seo_title: "",
  seo_description: "",
  seo_image: "",
  updated_at: null,
});

// ─── PUBLIC ──────────────────────────────────────────────────

// GET /api/content/pages — every page the router may need to resolve.
router.get(
  "/pages",
  (req, res, next) => (req.query.all === "true" ? authMiddleware(req, res, next) : next()),
  async (req, res) => {
    try {
      const includeDrafts = req.query.all === "true";
      const { rows } = await pool.query(
        `SELECT * FROM page_content ${includeDrafts ? "" : "WHERE published = 1"}
         ORDER BY is_system DESC, page_slug ASC`
      );
      res.json(rows.map(shapePage));
    } catch (error) {
      console.error("GET /content/pages failed:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// GET /api/content/about — kept as its own endpoint for the About editor.
router.get("/about", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM page_content WHERE page_slug = 'about'");
    res.json(rows[0] ? shapePage(rows[0]) : emptyPage("about"));
  } catch (error) {
    console.error("GET /content/about failed:", error);
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
        hero_atmosphere: "auto",
        hero_atmosphere_intensity: "1",
      });
    }
    res.json(row);
  } catch (error) {
    console.error("GET /content/hero failed:", error);
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
    console.error("GET /content/settings failed:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/content/page/:slug
// `?draft=true` (admin only) returns unpublished pages so the editor can load
// a page it just took offline.
router.get(
  "/page/:slug",
  (req, res, next) => (req.query.draft === "true" ? authMiddleware(req, res, next) : next()),
  async (req, res) => {
    try {
      const { rows } = await pool.query("SELECT * FROM page_content WHERE page_slug = $1", [req.params.slug]);
      const row = rows[0];
      if (!row) return res.json(emptyPage(req.params.slug));

      const page = shapePage(row);
      if (!page.published && req.query.draft !== "true") {
        return res.status(404).json({ error: "Page not found" });
      }
      res.json(page);
    } catch (error) {
      console.error("GET /content/page/:slug failed:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// ─── ADMIN ───────────────────────────────────────────────────

// PUT /api/admin/content/about
router.put("/about", authMiddleware, async (req, res) => {
  try {
    const contentStr = JSON.stringify(req.body.content ?? {});
    await pool.query(
      `INSERT INTO page_content (page_slug, title, content, is_system, published)
       VALUES ('about', 'About', $1, 1, 1)
       ON CONFLICT (page_slug) DO UPDATE SET content = EXCLUDED.content, updated_at = CURRENT_TIMESTAMP`,
      [contentStr]
    );
    await logAudit(req, "content.about.update", "content", "about");
    res.json({ message: "About page updated" });
  } catch (error) {
    console.error("PUT /content/about failed:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/admin/content/hero
router.put("/hero", authMiddleware, async (req, res) => {
  try {
    const { brand_text, tagline, video_url, hero_image, hero_link, hero_atmosphere, hero_atmosphere_intensity } = req.body;

    const { rows } = await pool.query("SELECT * FROM hero_content LIMIT 1");
    const existing = rows[0];

    const previousVideoUrl = existing?.video_url || "";
    const nextVideoUrl = video_url ?? previousVideoUrl;

    if (existing) {
      await pool.query(
        `UPDATE hero_content SET
           brand_text = $1, tagline = $2, video_url = $3, hero_image = $4, hero_link = $5,
           hero_atmosphere = $6, hero_atmosphere_intensity = $7,
           updated_at = CURRENT_TIMESTAMP
         WHERE id = $8`,
        [
          brand_text ?? existing.brand_text,
          tagline ?? existing.tagline,
          nextVideoUrl,
          hero_image ?? existing.hero_image,
          hero_link ?? existing.hero_link,
          hero_atmosphere ?? existing.hero_atmosphere,
          hero_atmosphere_intensity ?? existing.hero_atmosphere_intensity,
          existing.id,
        ]
      );
    } else {
      await pool.query(
        `INSERT INTO hero_content (brand_text, tagline, video_url, hero_image, hero_link, hero_atmosphere, hero_atmosphere_intensity)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          brand_text || "CRA8",
          tagline || "Spiritual Drama",
          video_url || "",
          hero_image || "",
          hero_link || "",
          hero_atmosphere || "auto",
          hero_atmosphere_intensity || "1",
        ]
      );
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
    console.error("PUT /content/hero failed:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/admin/content/settings
router.put("/settings", authMiddleware, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (const [key, value] of Object.entries(req.body)) {
      await client.query(
        `INSERT INTO site_settings (key, value, updated_at)
         VALUES ($1, $2, CURRENT_TIMESTAMP)
         ON CONFLICT(key) DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP`,
        [key, value]
      );
    }
    await client.query("COMMIT");

    await logAudit(req, "content.settings.update", "content", "settings", { keys: Object.keys(req.body) });
    res.json({ message: "Settings updated" });
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("PUT /content/settings failed:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    client.release();
  }
});

// POST /api/admin/content/pages — create a brand-new page.
router.post("/pages", authMiddleware, async (req, res) => {
  try {
    const title = String(req.body.title || "").trim();
    const slug = slugify(req.body.slug || title);
    if (!title) return res.status(400).json({ error: "Title is required" });
    if (!slug) return res.status(400).json({ error: "Slug is required" });

    // A page can't shadow a category page or a route the app owns.
    const { rows: pageClash } = await pool.query("SELECT id FROM page_content WHERE page_slug = $1", [slug]);
    if (pageClash.length) return res.status(409).json({ error: "A page with that address already exists" });
    const { rows: categoryClash } = await pool.query("SELECT id FROM categories WHERE slug = $1", [slug]);
    if (categoryClash.length) return res.status(409).json({ error: "A category already uses that address" });
    if (["admin", "work", "journal", "api", "uploads"].includes(slug)) {
      return res.status(409).json({ error: `/${slug} is reserved by the site` });
    }

    const { rows } = await pool.query(
      `INSERT INTO page_content (page_slug, title, content, published, is_system, seo_title, seo_description)
       VALUES ($1, $2, $3, $4, 0, $5, $6) RETURNING *`,
      [
        slug,
        title,
        JSON.stringify(req.body.content || { blocks: [] }),
        req.body.published ? 1 : 0,
        req.body.seo_title || "",
        req.body.seo_description || "",
      ]
    );

    // Navigation is opt-in: a new page is reachable at its URL immediately,
    // and only joins the menu when the editor asks for it.
    if (req.body.addToMenu) {
      const { rows: maxRows } = await pool.query("SELECT MAX(sort_order) AS max_order FROM menu_items");
      await pool.query(
        "INSERT INTO menu_items (label, path, page_type, sort_order, visible) VALUES ($1, $2, 'page', $3, $4)",
        [title, `/${slug}`, (maxRows[0]?.max_order || 0) + 1, req.body.published ? 1 : 0]
      );
    }

    await logAudit(req, "page.create", "page", slug, { title });
    res.status(201).json(shapePage(rows[0]));
  } catch (error) {
    console.error("POST /content/pages failed:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/admin/content/page/:slug — upsert copy, blocks, SEO, published.
router.put("/page/:slug", authMiddleware, async (req, res) => {
  try {
    const slug = req.params.slug;
    const { rows } = await pool.query("SELECT * FROM page_content WHERE page_slug = $1", [slug]);
    const existing = rows[0];

    const next = {
      title: req.body.title ?? existing?.title ?? slug,
      content: JSON.stringify(req.body.content ?? safeParseJson(existing?.content, {})),
      published:
        req.body.published === undefined ? (existing ? existing.published : 1) : req.body.published ? 1 : 0,
      seo_title: req.body.seo_title ?? existing?.seo_title ?? "",
      seo_description: req.body.seo_description ?? existing?.seo_description ?? "",
      seo_image: req.body.seo_image ?? existing?.seo_image ?? "",
    };

    const { rows: saved } = await pool.query(
      `INSERT INTO page_content (page_slug, title, content, published, is_system, seo_title, seo_description, seo_image)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (page_slug) DO UPDATE SET
         title = EXCLUDED.title,
         content = EXCLUDED.content,
         published = EXCLUDED.published,
         seo_title = EXCLUDED.seo_title,
         seo_description = EXCLUDED.seo_description,
         seo_image = EXCLUDED.seo_image,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [
        slug,
        next.title,
        next.content,
        next.published,
        existing?.is_system ?? (SYSTEM_SLUGS.has(slug) ? 1 : 0),
        next.seo_title,
        next.seo_description,
        next.seo_image,
      ]
    );

    // An unpublished page shouldn't keep advertising itself in the menu.
    if (!next.published) {
      await pool.query("UPDATE menu_items SET visible = 0 WHERE path = $1", [`/${slug}`]);
    }

    await logAudit(req, "content.page.update", "page", slug, { title: next.title, published: next.published });
    res.json(shapePage(saved[0]));
  } catch (error) {
    console.error("PUT /content/page/:slug failed:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/admin/content/page/:slug
router.delete("/page/:slug", authMiddleware, async (req, res) => {
  try {
    const slug = req.params.slug;
    const { rows } = await pool.query("SELECT * FROM page_content WHERE page_slug = $1", [slug]);
    const existing = rows[0];
    if (!existing) return res.status(404).json({ error: "Page not found" });
    if (existing.is_system || SYSTEM_SLUGS.has(slug)) {
      return res.status(409).json({ error: "Built-in pages can't be deleted — unpublish them instead." });
    }

    await pool.query("DELETE FROM page_content WHERE page_slug = $1", [slug]);
    await pool.query("DELETE FROM menu_items WHERE path = $1", [`/${slug}`]);

    await logAudit(req, "page.delete", "page", slug, { title: existing.title });
    res.json({ message: "Page deleted" });
  } catch (error) {
    console.error("DELETE /content/page/:slug failed:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
