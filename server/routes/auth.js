import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import { randomBytes, createHash } from "node:crypto";
import { recoveryConfigured, sendRecoveryEmail } from "../utils/mailer.js";
import { passwordResetDoneEmail, passwordResetRequestEmail } from "../utils/emailTemplates.js";
import pool from "../db.js";
import { authMiddleware } from "../middleware/auth.js";
import { logAudit } from "../utils/audit.js";
import { isStrongPassword, passwordRequirements } from "../utils/password.js";

const router = Router();
router.use((req, res, next) => { res.set("Cache-Control", "no-store"); next(); });
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

const passwordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 10,
  standardHeaders: true, legacyHeaders: false,
  message: { error: "Too many password-change attempts. Try again in 15 minutes." },
});

// POST /api/auth/login
router.post("/login", loginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;
    if (typeof username !== "string" || !username.trim() || username.length > 255 || typeof password !== "string" || !password || Buffer.byteLength(password, "utf8") > 72) {
      return res.status(400).json({ error: "Username and password required" });
    }

    const { rows } = await pool.query("SELECT * FROM admin_users WHERE username = $1", [username]);
    const user = rows[0];
    
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, sessionVersion: user.session_version },
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
router.put("/change-password", authMiddleware, passwordLimiter, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (typeof currentPassword !== "string" || !currentPassword || Buffer.byteLength(currentPassword, "utf8") > 72 || typeof newPassword !== "string" || !newPassword) {
      return res.status(400).json({ error: "Both passwords required" });
    }

    if (!isStrongPassword(newPassword)) {
      return res.status(400).json({
        error:
          passwordRequirements,
      });
    }

    const { rows } = await pool.query("SELECT * FROM admin_users WHERE id = $1", [req.user.id]);
    const user = rows[0];
    if (!user) return res.status(401).json({ error: "Session expired" });
    const valid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!valid) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    if (await bcrypt.compare(newPassword, user.password_hash)) {
      return res.status(400).json({ error: "Choose a different password from your current password" });
    }
    const hash = await bcrypt.hash(newPassword, 12);
    const result = await pool.query(
      "UPDATE admin_users SET password_hash = $1, session_version = session_version + 1, reset_token_hash = NULL, reset_token_expires_at = NULL WHERE id = $2 AND password_hash = $3 AND session_version = $4 RETURNING id",
      [hash, req.user.id, user.password_hash, req.user.sessionVersion]
    );
    if (!result.rows.length) return res.status(401).json({ error: "Session expired. Please sign in again." });
    await logAudit(req, "auth.password.change", "user", String(req.user.id));
    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const recoveryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false,
  message: { error: "Too many recovery attempts. Try again in 15 minutes." },
});
const tokenHash = token => createHash("sha256").update(token).digest("hex");

router.post("/forgot-password", recoveryLimiter, async (req, res) => {
  if (!recoveryConfigured()) return res.status(503).json({ error: "Password recovery is not configured. Contact the site administrator." });
  const message = "If the account exists, a reset link will be sent to its recovery email. Check your inbox and spam folder.";
  try {
    const { username } = req.body;
    if (typeof username !== "string" || !username.trim() || username.length > 255) {
      return res.status(400).json({ error: "Enter your username" });
    }
    // The server-configured mailbox belongs only to this account, never to
    // arbitrary usernames or an email address supplied in the request.
    if (username.trim() === process.env.ADMIN_USERNAME?.trim()) {
      const link = new URL("/admin/reset-password", process.env.SITE_URL);
      if (link.protocol !== "https:" && !(process.env.NODE_ENV !== "production" && ["localhost", "127.0.0.1"].includes(link.hostname))) {
        throw new Error("Recovery requires an HTTPS SITE_URL");
      }
      const token = randomBytes(32).toString("hex");
      const hash = tokenHash(token);
      const { rows } = await pool.query(
        `UPDATE admin_users SET reset_token_hash = $1, reset_token_expires_at = NOW() + INTERVAL '15 minutes'
         WHERE username = $2 AND (reset_token_expires_at IS NULL OR reset_token_expires_at < NOW() + INTERVAL '14 minutes') RETURNING id`,
        [hash, username.trim()]
      );
      if (rows.length) {
        // Fragment keeps the token out of server access logs and Referer headers.
        link.hash = `token=${token}`;
        try {
          const email = passwordResetRequestEmail(link);
          await sendRecoveryEmail(email.subject, email.text, email.html);
        } catch {
          await pool.query("UPDATE admin_users SET reset_token_hash = NULL, reset_token_expires_at = NULL WHERE id = $1 AND reset_token_hash = $2", [rows[0].id, hash]);
          console.error("Admin password recovery email could not be delivered.");
        }
      }
    }
    res.json({ message });
  } catch {
    console.error("Admin password recovery request failed.");
    res.status(503).json({ error: "Password recovery is temporarily unavailable. Try again later." });
  }
});

router.post("/reset-password", recoveryLimiter, async (req, res) => {
  const { token, newPassword } = req.body;
  if (typeof token !== "string" || !/^[a-f0-9]{64}$/.test(token)) return res.status(400).json({ error: "Invalid or expired reset link. Request a new link." });
  if (!isStrongPassword(newPassword)) return res.status(400).json({ error: passwordRequirements });
  try {
    const hash = await bcrypt.hash(newPassword, 12);
    // One atomic update consumes the token, including concurrent submissions.
    const { rows } = await pool.query(
      `UPDATE admin_users SET password_hash = $1, session_version = session_version + 1,
       reset_token_hash = NULL, reset_token_expires_at = NULL
       WHERE reset_token_hash = $2 AND reset_token_expires_at > NOW() RETURNING id, username`,
      [hash, tokenHash(token)]
    );
    if (!rows.length) return res.status(400).json({ error: "Invalid or expired reset link. Request a new link." });
    req.user = rows[0];
    await logAudit(req, "auth.password.reset", "user", String(req.user.id));
    try {
      const email = passwordResetDoneEmail();
      await sendRecoveryEmail(email.subject, email.text, email.html);
    } catch { console.error("Password reset notification could not be delivered."); }
    res.json({ message: "Password reset. Sign in with your new password." });
  } catch {
    res.status(500).json({ error: "Unable to reset password. Try again later." });
  }
});

export default router;
