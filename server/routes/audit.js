import { Router } from "express";
import pool from "../db.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

// GET /api/admin/audit
router.get("/", authMiddleware, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 30, 100);
    const { rows } = await pool.query(
      "SELECT id, username, action, entity_type, entity_id, details, ip, created_at FROM audit_logs ORDER BY created_at DESC LIMIT $1",
      [limit]
    );

    const mappedRows = rows.map((row) => ({
      ...row,
      details: JSON.parse(row.details || "{}"),
    }));

    res.json(mappedRows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
