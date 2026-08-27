import "dotenv/config";
import bcrypt from "bcryptjs";
import pool, { initPromise } from "./db.js";
import {
  CRA8_ABOUT_CONTENT,
  CRA8_HERO,
  CRA8_MENU_ITEMS,
  CRA8_PROJECTS,
  cra8Settings,
} from "./cra8-content.js";

await initPromise;

console.log("🌱  Seeding CRA8 CMS database...\n");

// ─── 1. Admin User ──────────────────────────────────────────
const username = process.env.ADMIN_USERNAME || "cra8";
const password = process.env.ADMIN_PASSWORD || "admin123";
const isProduction = process.env.NODE_ENV === "production";
const allowProdSeed = process.env.ALLOW_PROD_SEED === "true";

if (isProduction && !allowProdSeed) {
  throw new Error(
    "Refusing to run seed in production. Set ALLOW_PROD_SEED=true only for one-time controlled seeding."
  );
}

if (isProduction && (!process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD === "admin123")) {
  throw new Error("ADMIN_PASSWORD must be set to a strong value in production before running seed.");
}

if (password.length < 12) {
  console.warn("⚠️  ADMIN_PASSWORD is shorter than 12 characters. Use a stronger password.");
}

const res = await pool.query("SELECT * FROM admin_users WHERE username = $1", [username]);
const existingUser = res.rows[0];

if (!existingUser) {
  const hash = bcrypt.hashSync(password, 10);
  await pool.query("INSERT INTO admin_users (username, password_hash) VALUES ($1, $2)", [username, hash]);
  console.log(`  ✓ Admin user created: ${username}`);
} else {
  console.log(`  ○ Admin user already exists: ${username}`);
}

// ─── 2. Projects — the CRA8 slate ────────────────────────────
const insertProjectQuery = `
  INSERT INTO projects
    (id, title, category, category_label, year, role, description, synopsis, thumbnail, youtube_id, director, producers, cast_info, status, sort_order)
  VALUES
    ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
  ON CONFLICT (id) DO NOTHING
`;

for (const p of CRA8_PROJECTS) {
  await pool.query(insertProjectQuery, [
    p.id,
    p.title,
    p.category,
    p.category_label,
    p.year,
    p.role || "",
    p.description || "",
    p.synopsis || "",
    p.thumbnail || "",
    p.youtube_id || "",
    p.director || "",
    p.producers || "",
    p.cast_info || "",
    p.status || "",
    p.sort_order || 0,
  ]);
}
console.log(`  ✓ Seeded ${CRA8_PROJECTS.length} projects`);

// ─── 3. Menu Items ───────────────────────────────────────────
const existingMenuCountRes = await pool.query("SELECT COUNT(*) as count FROM menu_items");
const existingMenuCount = parseInt(existingMenuCountRes.rows[0].count, 10);

if (existingMenuCount === 0) {
  const insertMenuQuery = `
    INSERT INTO menu_items (label, path, page_type, sort_order, visible)
    VALUES ($1, $2, $3, $4, $5)
  `;
  for (const item of CRA8_MENU_ITEMS) {
    await pool.query(insertMenuQuery, [item.label, item.path, item.page_type, item.sort_order, item.visible]);
  }
  console.log(`  ✓ Seeded ${CRA8_MENU_ITEMS.length} menu items`);
} else {
  console.log(`  ○ Menu items already exist (${existingMenuCount})`);
}

// ─── 4. Hero Content ─────────────────────────────────────────
const existingHeroRes = await pool.query("SELECT COUNT(*) as count FROM hero_content");
if (parseInt(existingHeroRes.rows[0].count, 10) === 0) {
  await pool.query(
    `INSERT INTO hero_content (brand_text, tagline, video_url, hero_image, hero_link)
     VALUES ($1, $2, $3, $4, $5)`,
    [CRA8_HERO.brand_text, CRA8_HERO.tagline, CRA8_HERO.video_url, CRA8_HERO.hero_image, CRA8_HERO.hero_link]
  );
  console.log("  ✓ Seeded hero content");
} else {
  console.log("  ○ Hero content already exists");
}

// ─── 5. Site Settings ────────────────────────────────────────
const defaultSettings = cra8Settings();

const upsertSettingQuery = `
  INSERT INTO site_settings (key, value) VALUES ($1, $2)
  ON CONFLICT (key) DO NOTHING
`;
for (const [key, value] of Object.entries(defaultSettings)) {
  await pool.query(upsertSettingQuery, [key, value]);
}
await pool.query("UPDATE site_settings SET value = $1 WHERE key = 'font_display'", [defaultSettings.font_display]);
await pool.query("UPDATE site_settings SET value = $1 WHERE key = 'font_body'", [defaultSettings.font_body]);
console.log("  ✓ Seeded site settings");

// ─── 6. About Page Content ──────────────────────────────────
const existingAboutRes = await pool.query("SELECT * FROM page_content WHERE page_slug = 'about'");

if (!existingAboutRes.rows[0]) {
  await pool.query(
    "INSERT INTO page_content (page_slug, title, content) VALUES ('about', 'About', $1)",
    [JSON.stringify(CRA8_ABOUT_CONTENT)]
  );
  console.log("  ✓ Seeded about page content");
} else {
  console.log("  ○ About page content already exists");
}

console.log("\n  ✅ Database seeded successfully!\n");
console.log(`  Login credentials:`);
console.log(`    Username: ${username}`);
console.log(`    Password: ${password}\n`);
console.log("  Note: CRA8's contact email and social links are intentionally blank —");
console.log("  set them in Admin → Settings once confirmed.\n");
