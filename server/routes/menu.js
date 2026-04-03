import { Router } from "express";
import db from "../db.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

// ─── PUBLIC ──────────────────────────────────────────────────

// GET /api/menu
router.get("/", (req, res) => {
  const { all } = req.query;
  let items;
  if (all === "true") {
    // Admin view — return all items
    items = db.prepare("SELECT * FROM menu_items ORDER BY sort_order ASC").all();
  } else {
    // Public view — only visible items
    items = db
      .prepare("SELECT * FROM menu_items WHERE visible = 1 ORDER BY sort_order ASC")
      .all();
  }
  res.json(items);
});

// ─── ADMIN ───────────────────────────────────────────────────

// POST /api/admin/menu
router.post("/", authMiddleware, (req, res) => {
  const { label, path, page_type, visible } = req.body;
  if (!label || !path) {
    return res.status(400).json({ error: "Label and path are required" });
  }

  const last = db.prepare("SELECT MAX(sort_order) as max_order FROM menu_items").get();
  const sort_order = (last?.max_order || 0) + 1;

  const result = db
    .prepare(
      "INSERT INTO menu_items (label, path, page_type, sort_order, visible) VALUES (?, ?, ?, ?, ?)"
    )
    .run(label, path, page_type || "category", sort_order, visible !== undefined ? (visible ? 1 : 0) : 1);

  const item = db.prepare("SELECT * FROM menu_items WHERE id = ?").get(result.lastInsertRowid);
  res.status(201).json(item);
});

// PUT /api/admin/menu-reorder
router.put("/reorder", authMiddleware, (req, res) => {
  const { items } = req.body; // [{ id, sort_order }]
  if (!Array.isArray(items)) {
    return res.status(400).json({ error: "Items array required" });
  }

  const stmt = db.prepare("UPDATE menu_items SET sort_order = ? WHERE id = ?");
  const updateMany = db.transaction((items) => {
    for (const item of items) {
      stmt.run(item.sort_order, item.id);
    }
  });
  updateMany(items);
  res.json({ message: "Reordered successfully" });
});

// PUT /api/admin/menu/:id
router.put("/:id", authMiddleware, (req, res) => {
  const existing = db.prepare("SELECT * FROM menu_items WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Menu item not found" });

  const { label, path, page_type, visible } = req.body;
  db.prepare(`
    UPDATE menu_items SET label = ?, path = ?, page_type = ?, visible = ? WHERE id = ?
  `).run(
    label ?? existing.label,
    path ?? existing.path,
    page_type ?? existing.page_type,
    visible !== undefined ? (visible ? 1 : 0) : existing.visible,
    req.params.id
  );

  const updated = db.prepare("SELECT * FROM menu_items WHERE id = ?").get(req.params.id);
  res.json(updated);
});

// DELETE /api/admin/menu/:id
router.delete("/:id", authMiddleware, (req, res) => {
  const existing = db.prepare("SELECT * FROM menu_items WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Menu item not found" });

  db.prepare("DELETE FROM menu_items WHERE id = ?").run(req.params.id);
  res.json({ message: "Menu item deleted" });
});

export default router;
