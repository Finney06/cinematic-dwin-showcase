import jwt from "jsonwebtoken";
import pool from "../db.js";

const jwtIssuer = process.env.JWT_ISSUER || "dwindik-cms";
const jwtAudience = process.env.JWT_AUDIENCE || "dwindik-admin";

export async function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: jwtIssuer,
      audience: jwtAudience,
      algorithms: ["HS256"],
    });
    if (!Number.isInteger(decoded.id) || !Number.isInteger(decoded.sessionVersion)) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
    const { rows } = await pool.query("SELECT session_version FROM admin_users WHERE id = $1", [decoded.id]);
    if (!rows[0] || rows[0].session_version !== decoded.sessionVersion) {
      return res.status(401).json({ error: "Session expired. Please sign in again." });
    }
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
