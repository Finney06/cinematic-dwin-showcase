import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import pool from "../db.js";
import { authMiddleware } from "../middleware/auth.js";
import { logAudit } from "../utils/audit.js";
import { slugify, safeParseJson } from "../utils/collection.js";

const router = Router();

/** Columns the editor owns. Everything else (id, timestamps) is the server's. */
const TEXT_FIELDS = [
  "title",
  "category",
  "category_label",
  "year",
  "role",
  "description",
  "synopsis",
  "logline",
  "thumbnail",
  "youtube_id",
  "trailer_youtube_id",
  "director",
  "producers",
  "cast_info",
  "status",
  "seo_description",
];
const JSON_FIELDS = ["credits", "gallery", "blocks"];
/** Stored as 0/1, always sent as booleans from the editor. */
const FLAG_FIELDS = ["published", "featured"];

const shapeProject = (row) => ({
  ...row,
  published: row.published === null || row.published === undefined ? 1 : row.published,
  featured: row.featured ? 1 : 0,
  credits: safeParseJson(row.credits, []),
  gallery: safeParseJson(row.gallery, []),
  blocks: safeParseJson(row.blocks, []),
});

const requireAuthWhen = (predicate) => (req, res, next) =>
  predicate(req) ? authMiddleware(req, res, next) : next();

// ─── PUBLIC ──────────────────────────────────────────────────

// GET /api/projects?category=film — published slate, in the editor's order.
router.get("/", requireAuthWhen((req) => req.query.all === "true"), async (req, res) => {
  try {
    const includeDrafts = req.query.all === "true";
    const conditions = [];
    const values = [];
    if (!includeDrafts) conditions.push("published = 1");
    if (req.query.category) {
      values.push(req.query.category);
      conditions.push(`category = $${values.length}`);
    }
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const { rows } = await pool.query(
      `SELECT * FROM projects ${where} ORDER BY sort_order ASC, created_at DESC`,
      values
    );
    res.json(rows.map(shapeProject));
  } catch (error) {
    console.error("GET /projects failed:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/projects/latest?count=5
router.get("/latest", async (req, res) => {
  try {
    const count = Math.min(Math.max(parseInt(req.query.count, 10) || 5, 1), 50);
    const { rows } = await pool.query(
      `SELECT * FROM projects WHERE published = 1
       ORDER BY NULLIF(regexp_replace(year, '\\D', '', 'g'), '')::int DESC NULLS LAST, created_at DESC
       LIMIT $1`,
      [count]
    );
    res.json(rows.map(shapeProject));
  } catch (error) {
    console.error("GET /projects/latest failed:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/projects/:id — `?draft=true` (admin) also returns unpublished work.
router.get("/:id", requireAuthWhen((req) => req.query.draft === "true"), async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM projects WHERE id = $1", [req.params.id]);
    const project = rows[0];
    if (!project) return res.status(404).json({ error: "Project not found" });
    if (!project.published && req.query.draft !== "true") {
      return res.status(404).json({ error: "Project not found" });
    }
    res.json(shapeProject(project));
  } catch (error) {
    console.error("GET /projects/:id failed:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── ADMIN ───────────────────────────────────────────────────

// POST /api/admin/projects
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, category, year } = req.body;
    if (!title || !category || !year) {
      return res.status(400).json({ error: "Title, category, and year are required" });
    }

    const id = `${slugify(title) || "project"}-${uuidv4().slice(0, 6)}`;
    const { rows: lastRows } = await pool.query(
      "SELECT MAX(sort_order) AS max_order FROM projects WHERE category = $1",
      [category]
    );
    const sortOrder = (lastRows[0]?.max_order || 0) + 1;

    const columns = ["id", ...TEXT_FIELDS, ...JSON_FIELDS, ...FLAG_FIELDS, "sort_order"];
    const values = [
      id,
      ...TEXT_FIELDS.map((field) =>
        field === "category_label" ? req.body.category_label || req.body.category : req.body[field] || ""
      ),
      ...JSON_FIELDS.map((field) => JSON.stringify(req.body[field] ?? [])),
      ...FLAG_FIELDS.map((field) =>
        req.body[field] === undefined ? (field === "published" ? 1 : 0) : req.body[field] ? 1 : 0
      ),
      sortOrder,
    ];

    const { rows } = await pool.query(
      `INSERT INTO projects (${columns.join(", ")})
       VALUES (${columns.map((_, i) => `$${i + 1}`).join(", ")}) RETURNING *`,
      values
    );

    await logAudit(req, "project.create", "project", id, { title, category });
    res.status(201).json(shapeProject(rows[0]));
  } catch (error) {
    console.error("POST /projects failed:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/admin/projects/reorder — declared before /:id.
router.put("/reorder", authMiddleware, async (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items)) return res.status(400).json({ error: "Items array required" });

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (const item of items) {
      await client.query("UPDATE projects SET sort_order = $1 WHERE id = $2", [
        Number(item.sort_order) || 0,
        item.id,
      ]);
    }
    await client.query("COMMIT");
    await logAudit(req, "project.reorder", "project", "bulk", { count: items.length });
    res.json({ message: "Reordered successfully" });
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("PUT /projects/reorder failed:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    client.release();
  }
});

// PUT /api/admin/projects/:id — partial: only what was sent is written.
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { rows: existingRows } = await pool.query("SELECT * FROM projects WHERE id = $1", [req.params.id]);
    const existing = existingRows[0];
    if (!existing) return res.status(404).json({ error: "Project not found" });

    const patch = {};
    for (const field of TEXT_FIELDS) {
      if (req.body[field] !== undefined) patch[field] = req.body[field] ?? "";
    }
    for (const field of JSON_FIELDS) {
      if (req.body[field] !== undefined) patch[field] = JSON.stringify(req.body[field] ?? []);
    }
    for (const field of FLAG_FIELDS) {
      if (req.body[field] !== undefined) patch[field] = req.body[field] ? 1 : 0;
    }

    const names = Object.keys(patch);
    if (!names.length) return res.json(shapeProject(existing));

    const assignments = names.map((name, i) => `${name} = $${i + 1}`).join(", ");
    const { rows } = await pool.query(
      `UPDATE projects SET ${assignments}, updated_at = CURRENT_TIMESTAMP WHERE id = $${names.length + 1} RETURNING *`,
      [...names.map((name) => patch[name]), req.params.id]
    );

    // Featuring is a single slot: promoting one project retires the last.
    if (patch.featured === 1) {
      await pool.query("UPDATE projects SET featured = 0 WHERE id <> $1", [req.params.id]);
    }

    await logAudit(req, "project.update", "project", req.params.id, {
      title: rows[0].title,
      category: rows[0].category,
    });
    res.json(shapeProject(rows[0]));
  } catch (error) {
    console.error("PUT /projects/:id failed:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/admin/projects/:id
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM projects WHERE id = $1", [req.params.id]);
    const existing = rows[0];
    if (!existing) return res.status(404).json({ error: "Project not found" });

    await pool.query("DELETE FROM projects WHERE id = $1", [req.params.id]);
    await logAudit(req, "project.delete", "project", req.params.id, { title: existing.title });
    res.json({ message: "Project deleted" });
  } catch (error) {
    console.error("DELETE /projects/:id failed:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
