import { Router } from "express";
import pool from "../db.js";

/**
 * A sitemap built from live CMS data, so a page created in the admin is
 * discoverable by search engines without anyone regenerating anything.
 *
 * Set SITE_URL on the backend to the site's public origin (e.g.
 * https://cra8.studio) — the sitemap needs absolute URLs and the API has no
 * other way to know where the frontend is served from.
 */
const router = Router();

const escapeXml = (value) =>
  String(value).replace(/[<>&'"]/g, (char) => `&${{ "<": "lt", ">": "gt", "&": "amp", "'": "apos", '"': "quot" }[char]};`);

router.get("/", async (req, res) => {
  const siteUrl = (process.env.SITE_URL || "").replace(/\/$/, "");
  if (!siteUrl) {
    return res.status(503).type("text/plain").send("SITE_URL is not configured on the server.");
  }

  try {
    const [pages, categories, projects, articles] = await Promise.all([
      pool.query("SELECT page_slug, updated_at FROM page_content WHERE published = 1"),
      pool.query("SELECT slug, updated_at FROM categories WHERE published = 1"),
      pool.query("SELECT id, updated_at FROM projects WHERE published = 1"),
      pool.query("SELECT slug, updated_at FROM articles WHERE published = 1"),
    ]);

    const entries = [
      { loc: "/", priority: "1.0" },
      ...pages.rows
        .filter((row) => row.page_slug !== "home")
        .map((row) => ({ loc: `/${row.page_slug}`, lastmod: row.updated_at, priority: "0.8" })),
      ...categories.rows.map((row) => ({ loc: `/${row.slug}`, lastmod: row.updated_at, priority: "0.7" })),
      ...projects.rows.map((row) => ({ loc: `/work/${row.id}`, lastmod: row.updated_at, priority: "0.7" })),
      ...articles.rows.map((row) => ({ loc: `/journal/${row.slug}`, lastmod: row.updated_at, priority: "0.6" })),
    ];

    // A category and a page can share a slug in principle; only list each once.
    const seen = new Set();
    const unique = entries.filter((entry) => !seen.has(entry.loc) && seen.add(entry.loc));

    const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${unique
  .map(
    (entry) => `  <url>
    <loc>${escapeXml(siteUrl + entry.loc)}</loc>${
      entry.lastmod ? `\n    <lastmod>${new Date(entry.lastmod).toISOString().slice(0, 10)}</lastmod>` : ""
    }
    <priority>${entry.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

    res.type("application/xml").send(body);
  } catch (error) {
    console.error("GET /sitemap.xml failed:", error);
    res.status(500).type("text/plain").send("Could not build the sitemap.");
  }
});

export default router;
