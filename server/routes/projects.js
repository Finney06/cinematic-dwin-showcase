import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import pool from "../db.js";
import { authMiddleware } from "../middleware/auth.js";
import { logAudit } from "../utils/audit.js";

const router = Router();

// ─── PUBLIC ──────────────────────────────────────────────────

// GET /api/projects
router.get("/", async (req, res) => {
  try {
    const { category } = req.query;
    let projects;
    if (category) {
      const result = await pool.query(
        "SELECT * FROM projects WHERE category = $1 ORDER BY sort_order ASC, created_at DESC",
        [category]
      );
      projects = result.rows;
    } else {
      const result = await pool.query(
        "SELECT * FROM projects ORDER BY sort_order ASC, created_at DESC"
      );
      projects = result.rows;
    }
    res.json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/projects/latest
router.get("/latest", async (req, res) => {
  try {
    const count = parseInt(req.query.count) || 5;
    const result = await pool.query(
      "SELECT * FROM projects ORDER BY CAST(year AS INTEGER) DESC, created_at DESC LIMIT $1",
      [count]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/projects/:id
router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM projects WHERE id = $1", [req.params.id]);
    const project = result.rows[0];
    if (!project) return res.status(404).json({ error: "Project not found" });
    res.json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── ADMIN ───────────────────────────────────────────────────

// POST /api/admin/projects
router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      title, category, category_label, year, role, description,
      synopsis, thumbnail, youtube_id, director, producers,
      cast_info, status
    } = req.body;

    if (!title || !category || !year) {
      return res.status(400).json({ error: "Title, category, and year are required" });
    }

    const id = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + uuidv4().slice(0, 6);

    // Get next sort order
    const lastResult = await pool.query("SELECT MAX(sort_order) as max_order FROM projects WHERE category = $1", [category]);
    const last = lastResult.rows[0];
    const sort_order = (last?.max_order || 0) + 1;

    await pool.query(`
      INSERT INTO projects (id, title, category, category_label, year, role, description, synopsis, thumbnail, youtube_id, director, producers, cast_info, status, sort_order)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
    `, [
      id, title, category, category_label || category, year, role || "", description || "", synopsis || "", thumbnail || "", youtube_id || "", director || "", producers || "", cast_info || "", status || "", sort_order
    ]);

    const projectResult = await pool.query("SELECT * FROM projects WHERE id = $1", [id]);
    const project = projectResult.rows[0];
    
    await logAudit(req, "project.create", "project", id, {
      title: project.title,
      category: project.category,
    });
    
    res.status(201).json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/admin/projects/:id
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const existingResult = await pool.query("SELECT * FROM projects WHERE id = $1", [req.params.id]);
    const existing = existingResult.rows[0];
    if (!existing) return res.status(404).json({ error: "Project not found" });

    const {
      title, category, category_label, year, role, description, synopsis,
      thumbnail, youtube_id, director, producers, cast_info, status
    } = req.body;

    await pool.query(`
      UPDATE projects SET
        title = $1, category = $2, category_label = $3, year = $4, role = $5,
        description = $6, synopsis = $7, thumbnail = $8, youtube_id = $9,
        director = $10, producers = $11, cast_info = $12, status = $13,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $14
    `, [
      title ?? existing.title,
      category ?? existing.category,
      category_label ?? existing.category_label,
      year ?? existing.year,
      role ?? existing.role,
      description ?? existing.description,
      synopsis ?? existing.synopsis,
      thumbnail ?? existing.thumbnail,
      youtube_id ?? existing.youtube_id,
      director ?? existing.director,
      producers ?? existing.producers,
      cast_info ?? existing.cast_info,
      status ?? existing.status,
      req.params.id
    ]);

    const updatedResult = await pool.query("SELECT * FROM projects WHERE id = $1", [req.params.id]);
    const updated = updatedResult.rows[0];
    
    await logAudit(req, "project.update", "project", req.params.id, {
      title: updated.title,
      category: updated.category,
    });
    
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/admin/projects/:id
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const existingResult = await pool.query("SELECT * FROM projects WHERE id = $1", [req.params.id]);
    const existing = existingResult.rows[0];
    if (!existing) return res.status(404).json({ error: "Project not found" });

    await pool.query("DELETE FROM projects WHERE id = $1", [req.params.id]);
    await logAudit(req, "project.delete", "project", req.params.id, {
      title: existing.title,
    });
    res.json({ message: "Project deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/admin/projects-reorder
router.put("/reorder", authMiddleware, async (req, res) => {
  try {
    const { items } = req.body; // [{ id, sort_order }]
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: "Items array required" });
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      for (const item of items) {
        await client.query("UPDATE projects SET sort_order = $1 WHERE id = $2", [item.sort_order, item.id]);
      }
      await client.query("COMMIT");
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }

    await logAudit(req, "project.reorder", "project", "bulk", { count: items.length });
    res.json({ message: "Reordered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
