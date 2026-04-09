import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import pool from "../db.js";
import { authMiddleware } from "../middleware/auth.js";
import { logAudit } from "../utils/audit.js";

const router = Router();
const jwtExpiresIn = process.env.JWT_EXPIRES_IN || "12h";
const jwtIssuer = process.env.JWT_ISSUER || "dwindik-cms";
const jwtAudience = process.env.JWT_AUDIENCE || "dwindik-admin";

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts. Try again in 15 minutes." },
});

const isStrongPassword = (password) => {
  return (
    typeof password === "string" &&
    password.length >= 12 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /\d/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
};

// POST /api/auth/login
router.post("/login", loginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }

    const { rows } = await pool.query("SELECT * FROM admin_users WHERE username = $1", [username]);
    const user = rows[0];
    
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
      {
        expiresIn: jwtExpiresIn,
        issuer: jwtIssuer,
        audience: jwtAudience,
      }
    );

    res.json({ token, user: { id: user.id, username: user.username } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/auth/me
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT id, username, created_at FROM admin_users WHERE id = $1", [req.user.id]);
    const user = rows[0];
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/auth/change-password
router.put("/change-password", authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Both passwords required" });
    }

    if (!isStrongPassword(newPassword)) {
      return res.status(400).json({
        error:
          "New password must be at least 12 characters and include uppercase, lowercase, number, and symbol",
      });
    }

    const { rows } = await pool.query("SELECT * FROM admin_users WHERE id = $1", [req.user.id]);
    const user = rows[0];
    const valid = bcrypt.compareSync(currentPassword, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    const hash = bcrypt.hashSync(newPassword, 10);
    await pool.query("UPDATE admin_users SET password_hash = $1 WHERE id = $2", [hash, req.user.id]);
    await logAudit(req, "auth.password.change", "user", String(req.user.id));
    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
