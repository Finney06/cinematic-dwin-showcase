import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import db from "../db.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

// ─── PUBLIC ──────────────────────────────────────────────────

// GET /api/projects
router.get("/", (req, res) => {
  const { category } = req.query;
  let projects;
  if (category) {
    projects = db
      .prepare("SELECT * FROM projects WHERE category = ? ORDER BY sort_order ASC, created_at DESC")
      .all(category);
  } else {
    projects = db
      .prepare("SELECT * FROM projects ORDER BY sort_order ASC, created_at DESC")
      .all();
  }
  res.json(projects);
});

// GET /api/projects/latest
router.get("/latest", (req, res) => {
  const count = parseInt(req.query.count) || 5;
  const projects = db
    .prepare("SELECT * FROM projects ORDER BY CAST(year AS INTEGER) DESC, created_at DESC LIMIT ?")
    .all(count);
  res.json(projects);
});

// GET /api/projects/:id
router.get("/:id", (req, res) => {
  const project = db.prepare("SELECT * FROM projects WHERE id = ?").get(req.params.id);
  if (!project) return res.status(404).json({ error: "Project not found" });
  res.json(project);
});

// ─── ADMIN ───────────────────────────────────────────────────

// POST /api/admin/projects
router.post("/", authMiddleware, (req, res) => {
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
  const last = db.prepare("SELECT MAX(sort_order) as max_order FROM projects WHERE category = ?").get(category);
  const sort_order = (last?.max_order || 0) + 1;

  db.prepare(`
    INSERT INTO projects (id, title, category, category_label, year, role, description, synopsis, thumbnail, youtube_id, director, producers, cast_info, status, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, title, category, category_label || category, year, role || "", description || "", synopsis || "", thumbnail || "", youtube_id || "", director || "", producers || "", cast_info || "", status || "", sort_order);

  const project = db.prepare("SELECT * FROM projects WHERE id = ?").get(id);
  res.status(201).json(project);
});

// PUT /api/admin/projects/:id
router.put("/:id", authMiddleware, (req, res) => {
  const existing = db.prepare("SELECT * FROM projects WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Project not found" });

  const {
    title, category, category_label, year, role, description, synopsis,
    thumbnail, youtube_id, director, producers, cast_info, status
  } = req.body;

  db.prepare(`
    UPDATE projects SET
      title = ?, category = ?, category_label = ?, year = ?, role = ?,
      description = ?, synopsis = ?, thumbnail = ?, youtube_id = ?,
      director = ?, producers = ?, cast_info = ?, status = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
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
  );

  const updated = db.prepare("SELECT * FROM projects WHERE id = ?").get(req.params.id);
  res.json(updated);
});

// DELETE /api/admin/projects/:id
router.delete("/:id", authMiddleware, (req, res) => {
  const existing = db.prepare("SELECT * FROM projects WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Project not found" });

  db.prepare("DELETE FROM projects WHERE id = ?").run(req.params.id);
  res.json({ message: "Project deleted" });
});

// PUT /api/admin/projects-reorder
router.put("/reorder", authMiddleware, (req, res) => {
  const { items } = req.body; // [{ id, sort_order }]
  if (!Array.isArray(items)) {
    return res.status(400).json({ error: "Items array required" });
  }

  const stmt = db.prepare("UPDATE projects SET sort_order = ? WHERE id = ?");
  const updateMany = db.transaction((items) => {
    for (const item of items) {
      stmt.run(item.sort_order, item.id);
    }
  });
  updateMany(items);
  res.json({ message: "Reordered successfully" });
});

export default router;
