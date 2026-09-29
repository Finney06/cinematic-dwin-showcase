import bcrypt from "bcryptjs";
import { isStrongPassword, passwordRequirements } from "./password.js";

// Serialize first-run initialization across server instances. Never reset an
// existing account or create a second account when environment values change.
export async function bootstrapAdmin(pool, env = process.env) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("LOCK TABLE admin_users IN EXCLUSIVE MODE");
    const { rows } = await client.query("SELECT id FROM admin_users LIMIT 1");
    if (!rows.length) {
      const username = env.ADMIN_USERNAME?.trim();
      if (!username || username.length > 255 || !isStrongPassword(env.ADMIN_PASSWORD)) {
        throw new Error(`Set ADMIN_USERNAME and a strong ADMIN_PASSWORD before first startup. ${passwordRequirements}`);
      }
      const hash = await bcrypt.hash(env.ADMIN_PASSWORD, 12);
      await client.query("INSERT INTO admin_users (username, password_hash) VALUES ($1, $2)", [username, hash]);
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
