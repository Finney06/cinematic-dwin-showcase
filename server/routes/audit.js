import { Router } from "express";
import db from "../db.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

// GET /api/admin/audit
router.get("/", authMiddleware, (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 30, 100);
  const rows = db
    .prepare(
      "SELECT id, username, action, entity_type, entity_id, details, ip, created_at FROM audit_logs ORDER BY created_at DESC LIMIT ?"
    )
    .all(limit)
    .map((row) => ({
      ...row,
      details: JSON.parse(row.details || "{}"),
    }));

  res.json(rows);
});

export default router;
