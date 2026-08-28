import { Router } from "express";
import pool from "../db.js";
import { authMiddleware } from "../middleware/auth.js";
import { logAudit } from "../utils/audit.js";
import { slugify } from "../utils/collection.js";

/**
 * Categories are the slate's sections — Film, Television, Music and anything
 * CRA8 adds later. Each row is simultaneously:
 *
 *   • the value stored on `projects.category`
 *   • a live page at /<slug> (rendered by the site's dynamic category route)
 *   • an option in the project editor's Category dropdown
 *
 * so adding "Documentary" here is all it takes to get a working section.
 * Renaming a slug cascades to every project that used it, and a category that
 * still has projects can't be deleted out from under them.
 */
const router = Router();

const withCounts = `
  SELECT c.*, COALESCE(p.count, 0)::int AS project_count
  FROM categories c
  LEFT JOIN (SELECT category, COUNT(*) AS count FROM projects WHERE published = 1 GROUP BY category) p
    ON p.category = c.slug
`;

// ─── PUBLIC ──────────────────────────────────────────────────
// Categories have no draft state: one exists or it doesn't. Every category is
// returned so its page resolves; the site links to a category only once
// `project_count` says there is something to see, which keeps empty sections
// out of the navigation without anyone having to remember a toggle.
router.get("/", async (req, res) => {
  try {
    const { rows } = await pool.query(`${withCounts} ORDER BY c.sort_order ASC, c.id ASC`);
    res.json(rows);
  } catch (error) {
    console.error("GET /categories failed:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:slug", async (req, res) => {
  try {
    const { rows } = await pool.query(`${withCounts} WHERE c.slug = $1`, [req.params.slug]);
    const row = rows[0];
    if (!row) return res.status(404).json({ error: "Category not found" });
    res.json(row);
  } catch (error) {
    console.error("GET /categories/:slug failed:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── ADMIN ───────────────────────────────────────────────────
router.post("/", authMiddleware, async (req, res) => {
  try {
    const label = String(req.body.label || "").trim();
    if (!label) return res.status(400).json({ error: "Label is required" });

    const slug = slugify(req.body.slug || label);
    if (!slug) return res.status(400).json({ error: "Slug is required" });

    const { rows: clash } = await pool.query("SELECT id FROM categories WHERE slug = $1", [slug]);
    if (clash.length) return res.status(409).json({ error: "That category slug already exists" });

    const { rows: maxRows } = await pool.query("SELECT MAX(sort_order) AS max_order FROM categories");
    const sortOrder = (maxRows[0]?.max_order || 0) + 1;

    const { rows } = await pool.query(
      `INSERT INTO categories (slug, label, description, hero_image, sort_order, published)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        slug,
        label,
        req.body.description || "",
        req.body.hero_image || "",
        sortOrder,
        req.body.published === undefined ? 1 : req.body.published ? 1 : 0,
      ]
    );

    await logAudit(req, "category.create", "category", slug, { label });
    res.status(201).json({ ...rows[0], project_count: 0 });
  } catch (error) {
    console.error("POST /categories failed:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/reorder", authMiddleware, async (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items)) return res.status(400).json({ error: "Items array required" });

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (const item of items) {
      await client.query("UPDATE categories SET sort_order = $1 WHERE id = $2", [
        Number(item.sort_order) || 0,
        item.id,
      ]);
    }
    await client.query("COMMIT");
    await logAudit(req, "category.reorder", "category", "bulk", { count: items.length });
    res.json({ message: "Reordered successfully" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("PUT /categories/reorder failed:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    client.release();
  }
});

router.put("/:id", authMiddleware, async (req, res) => {
  const client = await pool.connect();
  try {
    const { rows: existingRows } = await client.query("SELECT * FROM categories WHERE id = $1", [req.params.id]);
    const existing = existingRows[0];
    if (!existing) return res.status(404).json({ error: "Category not found" });

    const label = req.body.label !== undefined ? String(req.body.label).trim() || existing.label : existing.label;
    let slug = existing.slug;
    if (req.body.slug !== undefined) {
      const next = slugify(req.body.slug);
      if (next && next !== existing.slug) {
        const { rows: clash } = await client.query("SELECT id FROM categories WHERE slug = $1", [next]);
        if (clash.length) return res.status(409).json({ error: "That category slug already exists" });
        slug = next;
      }
    }

    await client.query("BEGIN");
    const { rows } = await client.query(
      `UPDATE categories SET slug = $1, label = $2, description = $3, hero_image = $4,
         published = $5, updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 RETURNING *`,
      [
        slug,
        label,
        req.body.description ?? existing.description,
        req.body.hero_image ?? existing.hero_image,
        req.body.published === undefined ? existing.published : req.body.published ? 1 : 0,
        req.params.id,
      ]
    );

    // Keep the slate pointing at this category through a rename.
    if (slug !== existing.slug) {
      await client.query("UPDATE projects SET category = $1 WHERE category = $2", [slug, existing.slug]);
      await client.query("UPDATE menu_items SET path = $1 WHERE path = $2", [`/${slug}`, `/${existing.slug}`]);
      // Only carry the page copy across if nothing already owns the new slug;
      // page_slug is unique, and a collision would fail the whole rename.
      const { rows: pageClash } = await client.query(
        "SELECT id FROM page_content WHERE page_slug = $1",
        [slug]
      );
      if (!pageClash.length) {
        await client.query("UPDATE page_content SET page_slug = $1 WHERE page_slug = $2", [
          slug,
          existing.slug,
        ]);
      }
    }
    if (label !== existing.label) {
      await client.query("UPDATE projects SET category_label = $1 WHERE category = $2", [label, slug]);
    }
    await client.query("COMMIT");

    await logAudit(req, "category.update", "category", slug, { label, renamedFrom: existing.slug });
    res.json(rows[0]);
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("PUT /categories/:id failed:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    client.release();
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM categories WHERE id = $1", [req.params.id]);
    const existing = rows[0];
    if (!existing) return res.status(404).json({ error: "Category not found" });

    // Deleting a category that still holds work would orphan those projects —
    // they'd vanish from the site with no obvious way back. Hide it instead.
    const { rows: used } = await pool.query("SELECT COUNT(*)::int AS count FROM projects WHERE category = $1", [
      existing.slug,
    ]);
    if (used[0].count > 0) {
      return res.status(409).json({
        error: `${existing.label} still has ${used[0].count} project${
          used[0].count === 1 ? "" : "s"
        }. Move or delete them first, or hide the category instead.`,
      });
    }

    await pool.query("DELETE FROM categories WHERE id = $1", [req.params.id]);
    await pool.query("DELETE FROM menu_items WHERE path = $1", [`/${existing.slug}`]);
    await logAudit(req, "category.delete", "category", existing.slug, { label: existing.label });
    res.json({ message: "Category deleted" });
  } catch (error) {
    console.error("DELETE /categories/:id failed:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
