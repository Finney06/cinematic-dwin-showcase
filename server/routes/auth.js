import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../db.js";
import { authMiddleware } from "../middleware/auth.js";
import { logAudit } from "../utils/audit.js";

const router = Router();

// POST /api/auth/login
router.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }

  const user = db.prepare("SELECT * FROM admin_users WHERE username = ?").get(username);
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const valid = bcrypt.compareSync(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({ token, user: { id: user.id, username: user.username } });
});

// GET /api/auth/me
router.get("/me", authMiddleware, (req, res) => {
  const user = db
    .prepare("SELECT id, username, created_at FROM admin_users WHERE id = ?")
    .get(req.user.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});

// PUT /api/auth/change-password
router.put("/change-password", authMiddleware, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "Both passwords required" });
  }

  const user = db.prepare("SELECT * FROM admin_users WHERE id = ?").get(req.user.id);
  const valid = bcrypt.compareSync(currentPassword, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: "Current password is incorrect" });
  }

  const hash = bcrypt.hashSync(newPassword, 10);
  db.prepare("UPDATE admin_users SET password_hash = ? WHERE id = ?").run(hash, req.user.id);
  logAudit(req, "auth.password.change", "user", String(req.user.id));
  res.json({ message: "Password changed successfully" });
});

export default router;
