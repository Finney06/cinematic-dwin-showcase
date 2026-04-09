import pool from "../db.js";

export const logAudit = async (req, action, entityType, entityId = "", details = {}) => {
  try {
    const query = `
      INSERT INTO audit_logs (user_id, username, action, entity_type, entity_id, details, ip)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;
    const values = [
      req.user?.id || null,
      req.user?.username || "system",
      action,
      entityType,
      entityId,
      JSON.stringify(details || {}),
      req.ip || req.headers["x-forwarded-for"] || ""
    ];
    await pool.query(query, values);
  } catch (error) {
    console.error("Failed to write audit log:", error);
  }
};
