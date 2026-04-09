import { Router } from "express";
import pool from "../db.js";
import { authMiddleware } from "../middleware/auth.js";
import { logAudit } from "../utils/audit.js";

const router = Router();

// ─── PUBLIC ──────────────────────────────────────────────────

// GET /api/menu
router.get("/", async (req, res) => {
  try {
    const { all } = req.query;
    let items;
    if (all === "true") {
      // Admin view — return all items
      const { rows } = await pool.query("SELECT * FROM menu_items ORDER BY sort_order ASC");
      items = rows;
    } else {
      // Public view — only visible items
      const { rows } = await pool.query("SELECT * FROM menu_items WHERE visible = 1 ORDER BY sort_order ASC");
      items = rows;
    }
    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── ADMIN ───────────────────────────────────────────────────

// POST /api/admin/menu
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { label, path, page_type, visible } = req.body;
    if (!label || !path) {
      return res.status(400).json({ error: "Label and path are required" });
    }

    const { rows: lastRows } = await pool.query("SELECT MAX(sort_order) as max_order FROM menu_items");
    const last = lastRows[0];
    const sort_order = (last?.max_order || 0) + 1;

    const { rows: insertRows } = await pool.query(
      "INSERT INTO menu_items (label, path, page_type, sort_order, visible) VALUES ($1, $2, $3, $4, $5) RETURNING id",
      [label, path, page_type || "category", sort_order, visible !== undefined ? (visible ? 1 : 0) : 1]
    );

    const newItemId = insertRows[0].id;
    const { rows: itemRows } = await pool.query("SELECT * FROM menu_items WHERE id = $1", [newItemId]);
    const item = itemRows[0];

    await logAudit(req, "menu.create", "menu", String(item.id), {
      label: item.label,
      path: item.path,
    });
    res.status(201).json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/admin/menu-reorder
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
        await client.query("UPDATE menu_items SET sort_order = $1 WHERE id = $2", [item.sort_order, item.id]);
      }
      await client.query("COMMIT");
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }

    await logAudit(req, "menu.reorder", "menu", "bulk", { count: items.length });
    res.json({ message: "Reordered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/admin/menu/:id
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { rows: existingRows } = await pool.query("SELECT * FROM menu_items WHERE id = $1", [req.params.id]);
    const existing = existingRows[0];
    if (!existing) return res.status(404).json({ error: "Menu item not found" });

    const { label, path, page_type, visible } = req.body;
    await pool.query(`
      UPDATE menu_items SET label = $1, path = $2, page_type = $3, visible = $4 WHERE id = $5
    `, [
      label ?? existing.label,
      path ?? existing.path,
      page_type ?? existing.page_type,
      visible !== undefined ? (visible ? 1 : 0) : existing.visible,
      req.params.id
    ]);

    const { rows: updatedRows } = await pool.query("SELECT * FROM menu_items WHERE id = $1", [req.params.id]);
    const updated = updatedRows[0];
    
    await logAudit(req, "menu.update", "menu", req.params.id, {
      label: updated.label,
      path: updated.path,
      visible: updated.visible,
    });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/admin/menu/:id
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { rows: existingRows } = await pool.query("SELECT * FROM menu_items WHERE id = $1", [req.params.id]);
    const existing = existingRows[0];
    if (!existing) return res.status(404).json({ error: "Menu item not found" });

    await pool.query("DELETE FROM menu_items WHERE id = $1", [req.params.id]);
    
    await logAudit(req, "menu.delete", "menu", req.params.id, {
      label: existing.label,
      path: existing.path,
    });
    res.json({ message: "Menu item deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
