import db from "../db.js";

export const logAudit = (req, action, entityType, entityId = "", details = {}) => {
  try {
    db.prepare(
      `INSERT INTO audit_logs (user_id, username, action, entity_type, entity_id, details, ip)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(
      req.user?.id || null,
      req.user?.username || "system",
      action,
      entityType,
      entityId,
      JSON.stringify(details || {}),
      req.ip || req.headers["x-forwarded-for"] || ""
    );
  } catch (error) {
    console.error("Failed to write audit log:", error);
  }
};
