import { Router } from "express";
import rateLimit from "express-rate-limit";
import pool from "../db.js";
import { authMiddleware } from "../middleware/auth.js";
import { logAudit } from "../utils/audit.js";

/**
 * Contact enquiries. Submissions are stored and read in Admin → Messages, so
 * the form keeps working without an email provider, an API key, or anything
 * else that can silently expire years from now.
 */
const router = Router();

const MAX_LENGTHS = { name: 120, email: 200, topic: 80, message: 4000 };
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Deliberately generous for a studio contact form, tight enough to stop a bot
// from filling the table. Keyed by IP.
const submitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many messages sent. Please try again shortly." },
});

// ─── PUBLIC ──────────────────────────────────────────────────
router.post("/", submitLimiter, async (req, res) => {
  try {
    // Honeypot: a hidden field no human ever fills in. Answer 200 so a bot
    // can't tell it was rejected.
    if (String(req.body.company || "").trim()) {
      return res.json({ message: "Message sent" });
    }

    const name = String(req.body.name || "").trim().slice(0, MAX_LENGTHS.name);
    const email = String(req.body.email || "").trim().slice(0, MAX_LENGTHS.email);
    const topic = String(req.body.topic || "General").trim().slice(0, MAX_LENGTHS.topic);
    const message = String(req.body.message || "").trim().slice(0, MAX_LENGTHS.message);

    if (!name) return res.status(400).json({ error: "Please add your name." });
    if (!EMAIL_PATTERN.test(email)) return res.status(400).json({ error: "Please add a valid email address." });
    if (message.length < 10) return res.status(400).json({ error: "Please write a little more detail." });

    await pool.query(
      "INSERT INTO contact_messages (name, email, topic, message, ip) VALUES ($1, $2, $3, $4, $5)",
      [name, email, topic, message, req.ip || ""]
    );

    res.status(201).json({ message: "Message sent" });
  } catch (error) {
    console.error("POST /contact failed:", error);
    res.status(500).json({ error: "Could not send your message. Please email us directly." });
  }
});

// ─── ADMIN ───────────────────────────────────────────────────
router.get("/", authMiddleware, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 100, 200);
    const { rows } = await pool.query(
      "SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT $1",
      [limit]
    );
    const { rows: unread } = await pool.query(
      "SELECT COUNT(*)::int AS count FROM contact_messages WHERE status = 'new'"
    );
    res.json({ messages: rows, unread: unread[0].count });
  } catch (error) {
    console.error("GET /contact failed:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const status = ["new", "read", "archived"].includes(req.body.status) ? req.body.status : "read";
    const { rows } = await pool.query(
      "UPDATE contact_messages SET status = $1 WHERE id = $2 RETURNING *",
      [status, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: "Message not found" });
    res.json(rows[0]);
  } catch (error) {
    console.error("PUT /contact/:id failed:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query("DELETE FROM contact_messages WHERE id = $1 RETURNING id", [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: "Message not found" });
    await logAudit(req, "message.delete", "message", req.params.id);
    res.json({ message: "Message deleted" });
  } catch (error) {
    console.error("DELETE /contact/:id failed:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
