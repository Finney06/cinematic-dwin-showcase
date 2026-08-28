import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import { logAudit } from "./audit.js";

/**
 * Builds a full CRUD + reorder + publish router for one content collection.
 *
 * Journal articles, services and team members are the same shape of thing —
 * an ordered, publishable list of records with a slug — so they share one
 * implementation instead of three near-identical route files. A new collection
 * is a config object (see routes/journal.js), not another 200 lines.
 *
 * Column names are only ever taken from the `columns` config in code, never
 * from the request, so the interpolated identifiers here can't be injected.
 * Values always travel as bound parameters.
 */
export function createCollectionRouter({
  table,
  entity,
  columns,
  jsonColumns = [],
  order = "sort_order ASC, id ASC",
  slugSource = "title",
  /**
   * Whether records have a draft state. True for things written over time
   * (journal entries); false for plain lists (services, team) where saving a
   * row is the same act as publishing it — one less control to explain.
   */
  publishable = true,
}) {
  const router = Router();
  const columnNames = Object.keys(columns);
  const jsonSet = new Set(jsonColumns);

  const parseRow = (row) => {
    if (!row) return row;
    const parsed = { ...row };
    for (const key of jsonColumns) {
      parsed[key] = safeParseJson(row[key], Array.isArray(columns[key]?.default) ? [] : {});
    }
    return parsed;
  };

  /** Normalises one incoming field to what the column expects. */
  const coerce = (name, value) => {
    const spec = columns[name];
    if (jsonSet.has(name)) return JSON.stringify(value ?? spec.default ?? []);
    if (spec.type === "int") return Number.isFinite(Number(value)) ? Number(value) : spec.default ?? 0;
    if (spec.type === "bool") return (value === undefined || value === null ? spec.default : value) ? 1 : 0;
    if (spec.type === "date") return value ? String(value).slice(0, 10) : null;
    return value === undefined || value === null ? spec.default ?? "" : String(value);
  };

  const uniqueSlug = async (pool, desired, ignoreId) => {
    const base = slugify(desired) || entity;
    let candidate = base;
    for (let attempt = 2; attempt < 200; attempt += 1) {
      const { rows } = await pool.query(
        `SELECT id FROM ${table} WHERE slug = $1 ${ignoreId ? "AND id <> $2" : ""} LIMIT 1`,
        ignoreId ? [candidate, ignoreId] : [candidate]
      );
      if (!rows.length) return candidate;
      candidate = `${base}-${attempt}`;
    }
    return `${base}-${Date.now()}`;
  };

  return (pool) => {
    // ─── PUBLIC ────────────────────────────────────────────────
    // `?all=true` is the admin view (drafts included) and needs a token; the
    // public list only ever returns published records.
    router.get("/", (req, res, next) => (req.query.all === "true" ? authMiddleware(req, res, next) : next()), async (req, res) => {
      try {
        const includeDrafts = !publishable || req.query.all === "true";
        const { rows } = await pool.query(
          `SELECT * FROM ${table} ${includeDrafts ? "" : "WHERE published = 1"} ORDER BY ${order}`
        );
        res.json(rows.map(parseRow));
      } catch (error) {
        console.error(`GET /${entity} failed:`, error);
        res.status(500).json({ error: "Internal server error" });
      }
    });

    router.get("/:slug", async (req, res) => {
      try {
        const { rows } = await pool.query(`SELECT * FROM ${table} WHERE slug = $1`, [req.params.slug]);
        const row = rows[0];
        if (!row) return res.status(404).json({ error: `${entity} not found` });
        if (publishable && !row.published) return res.status(404).json({ error: `${entity} not found` });
        res.json(parseRow(row));
      } catch (error) {
        console.error(`GET /${entity}/:slug failed:`, error);
        res.status(500).json({ error: "Internal server error" });
      }
    });

    // ─── ADMIN ─────────────────────────────────────────────────
    router.post("/", authMiddleware, async (req, res) => {
      try {
        const slug = await uniqueSlug(pool, req.body.slug || req.body[slugSource] || "", null);
        const { rows: maxRows } = await pool.query(`SELECT MAX(sort_order) AS max_order FROM ${table}`);
        const sortOrder = (maxRows[0]?.max_order || 0) + 1;

        const names = ["slug", ...columnNames.filter((c) => c !== "slug" && c !== "sort_order"), "sort_order"];
        const values = names.map((name) =>
          name === "slug" ? slug : name === "sort_order" ? sortOrder : coerce(name, req.body[name])
        );
        const placeholders = names.map((_, i) => `$${i + 1}`).join(", ");

        const { rows } = await pool.query(
          `INSERT INTO ${table} (${names.join(", ")}) VALUES (${placeholders}) RETURNING *`,
          values
        );
        await logAudit(req, `${entity}.create`, entity, slug, { title: rows[0].title || rows[0].name || slug });
        res.status(201).json(parseRow(rows[0]));
      } catch (error) {
        console.error(`POST /${entity} failed:`, error);
        res.status(500).json({ error: "Internal server error" });
      }
    });

    // Declared before `/:id` so "reorder" is never read as an id.
    router.put("/reorder", authMiddleware, async (req, res) => {
      const { items } = req.body;
      if (!Array.isArray(items)) return res.status(400).json({ error: "Items array required" });

      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        for (const item of items) {
          await client.query(`UPDATE ${table} SET sort_order = $1 WHERE id = $2`, [
            Number(item.sort_order) || 0,
            item.id,
          ]);
        }
        await client.query("COMMIT");
        await logAudit(req, `${entity}.reorder`, entity, "bulk", { count: items.length });
        res.json({ message: "Reordered successfully" });
      } catch (error) {
        await client.query("ROLLBACK");
        console.error(`PUT /${entity}/reorder failed:`, error);
        res.status(500).json({ error: "Internal server error" });
      } finally {
        client.release();
      }
    });

    router.put("/:id", authMiddleware, async (req, res) => {
      try {
        const { rows: existingRows } = await pool.query(`SELECT * FROM ${table} WHERE id = $1`, [req.params.id]);
        const existing = existingRows[0];
        if (!existing) return res.status(404).json({ error: `${entity} not found` });

        // Only the fields actually sent are touched — a partial save (the
        // publish toggle, say) never blanks out the rest of the record.
        const patch = {};
        for (const name of columnNames) {
          if (name === "slug") continue;
          if (req.body[name] !== undefined) patch[name] = coerce(name, req.body[name]);
        }
        // An empty URL field means "leave it alone", not "rename to nothing" —
        // a blank slug would otherwise be regenerated and break every old link.
        if (req.body.slug !== undefined) {
          const desired = slugify(req.body.slug);
          if (desired && desired !== existing.slug) {
            patch.slug = await uniqueSlug(pool, desired, existing.id);
          }
        }

        const names = Object.keys(patch);
        if (!names.length) return res.json(parseRow(existing));

        const assignments = names.map((name, i) => `${name} = $${i + 1}`).join(", ");
        const { rows } = await pool.query(
          `UPDATE ${table} SET ${assignments}, updated_at = CURRENT_TIMESTAMP WHERE id = $${names.length + 1} RETURNING *`,
          [...names.map((name) => patch[name]), req.params.id]
        );

        await logAudit(req, `${entity}.update`, entity, String(existing.slug), {
          title: rows[0].title || rows[0].name || existing.slug,
          fields: names,
        });
        res.json(parseRow(rows[0]));
      } catch (error) {
        console.error(`PUT /${entity}/:id failed:`, error);
        res.status(500).json({ error: "Internal server error" });
      }
    });

    router.delete("/:id", authMiddleware, async (req, res) => {
      try {
        const { rows } = await pool.query(`SELECT * FROM ${table} WHERE id = $1`, [req.params.id]);
        const existing = rows[0];
        if (!existing) return res.status(404).json({ error: `${entity} not found` });

        await pool.query(`DELETE FROM ${table} WHERE id = $1`, [req.params.id]);
        await logAudit(req, `${entity}.delete`, entity, String(existing.slug), {
          title: existing.title || existing.name || existing.slug,
        });
        res.json({ message: `${entity} deleted` });
      } catch (error) {
        console.error(`DELETE /${entity}/:id failed:`, error);
        res.status(500).json({ error: "Internal server error" });
      }
    });

    return router;
  };
}

export function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

/** Content columns hold JSON as text; a corrupt value must not 500 the page. */
export function safeParseJson(value, fallback) {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "object") return value;
  try {
    const parsed = JSON.parse(value);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}
