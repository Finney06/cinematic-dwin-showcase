/**
 * DWINDIK → CRA8 rebrand migration.
 *
 * The public site reads its identity, menu and About copy from the database, so
 * transforming the code is only half the job: this script rewrites the rows the
 * previous personal-portfolio site left behind.
 *
 * Usage (from server/):
 *   npm run rebrand              # dry run — prints every change, writes nothing
 *   npm run rebrand -- --apply   # writes the changes
 *   npm run rebrand -- --apply --drop-legacy-projects   # also deletes projects
 *                                                       # that are not on the slate
 *
 * DATABASE_URL must point at the database you intend to migrate.
 */
import "dotenv/config";
import pool, { initPromise } from "./db.js";
import {
  CRA8_ABOUT_CONTENT,
  CRA8_HERO,
  CRA8_MENU_ITEMS,
  CRA8_PROJECTS,
  cra8Settings,
} from "./cra8-content.js";

const apply = process.argv.includes("--apply");
const dropLegacyProjects = process.argv.includes("--drop-legacy-projects");

const LEGACY_HERO_MEDIA = ["/dwindik/5.jpeg", "/dwindik/video1.mp4", "/dwindik/video.mp4"];
const isLegacy = (value) => {
  const normalised = (value || "").toLowerCase();
  return normalised.includes("dwindik") || normalised.includes("cre8te");
};

const changes = [];
const note = (message) => {
  changes.push(message);
  console.log(`  ${apply ? "✓" : "·"} ${message}`);
};

await initPromise;

console.log(`\n🎬  CRA8 rebrand — ${apply ? "APPLYING CHANGES" : "dry run (nothing is written)"}\n`);

// ─── 1. Hero content ─────────────────────────────────────────
const { rows: heroRows } = await pool.query("SELECT * FROM hero_content ORDER BY id LIMIT 1");
const hero = heroRows[0];

if (!hero) {
  note("hero_content: empty — inserting the CRA8 hero (opening clip + logo)");
  if (apply) {
    await pool.query(
      `INSERT INTO hero_content (brand_text, tagline, video_url, hero_image, hero_link)
       VALUES ($1, $2, $3, $4, $5)`,
      [CRA8_HERO.brand_text, CRA8_HERO.tagline, CRA8_HERO.video_url, CRA8_HERO.hero_image, CRA8_HERO.hero_link]
    );
  }
} else {
  const brandText = isLegacy(hero.brand_text) ? CRA8_HERO.brand_text : hero.brand_text;
  const tagline = isLegacy(hero.tagline) ? CRA8_HERO.tagline : hero.tagline;
  // The old opening clip is DWINDIK's; the old still is a personal portrait.
  // Clearing hero_image hands the circle to the CRA8 logo in public/CRA8.png.
  const videoUrl =
    LEGACY_HERO_MEDIA.includes(hero.video_url) || !hero.video_url
      ? CRA8_HERO.video_url
      : hero.video_url;
  const heroImage = LEGACY_HERO_MEDIA.includes(hero.hero_image) ? "" : hero.hero_image;

  if (
    brandText !== hero.brand_text ||
    tagline !== hero.tagline ||
    videoUrl !== hero.video_url ||
    heroImage !== hero.hero_image
  ) {
    note(
      `hero_content: brand_text "${hero.brand_text}" → "${brandText}", ` +
        `tagline "${hero.tagline}" → "${tagline}", video_url → ${videoUrl}, ` +
        `hero_image "${hero.hero_image}" → "${heroImage}" (empty = CRA8 logo)`
    );
    if (apply) {
      await pool.query(
        `UPDATE hero_content
            SET brand_text = $1, tagline = $2, video_url = $3, hero_image = $4,
                updated_at = CURRENT_TIMESTAMP
          WHERE id = $5`,
        [brandText, tagline, videoUrl, heroImage, hero.id]
      );
    }
  } else {
    console.log("  ○ hero_content already reads as CRA8");
  }
}

// ─── 2. Site settings ────────────────────────────────────────
const { rows: settingRows } = await pool.query("SELECT key, value FROM site_settings");
const settings = Object.fromEntries(settingRows.map((row) => [row.key, row.value]));
const cra8 = cra8Settings();

const settingUpdates = {};
for (const key of ["copyright_text", "site_title"]) {
  if (isLegacy(settings[key]) || !settings[key]) settingUpdates[key] = cra8[key];
}
// Personal contact details are cleared rather than guessed — CRA8 sets its own.
for (const key of ["contact_email", "social_instagram", "social_youtube", "social_twitter"]) {
  if (isLegacy(settings[key])) settingUpdates[key] = "";
}
if (isLegacy(settings.social_links)) settingUpdates.social_links = "[]";

for (const [key, value] of Object.entries(settingUpdates)) {
  note(`site_settings.${key}: "${settings[key] ?? ""}" → "${value}"`);
  if (apply) {
    await pool.query(
      `INSERT INTO site_settings (key, value) VALUES ($1, $2)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP`,
      [key, value]
    );
  }
}
if (!Object.keys(settingUpdates).length) console.log("  ○ site_settings already read as CRA8");

// ─── 3. Menu ─────────────────────────────────────────────────
const { rows: menuRows } = await pool.query("SELECT * FROM menu_items ORDER BY sort_order");
const menuPaths = menuRows.map((row) => row.path);
const hasCra8Menu = CRA8_MENU_ITEMS.every((item) => menuPaths.includes(item.path));

if (!hasCra8Menu) {
  note(
    `menu_items: replacing ${menuRows.length} personal-site entries ` +
      `(${menuPaths.join(", ") || "none"}) with ${CRA8_MENU_ITEMS.map((i) => i.path).join(", ")}`
  );
  if (apply) {
    await pool.query("DELETE FROM menu_items");
    for (const item of CRA8_MENU_ITEMS) {
      await pool.query(
        `INSERT INTO menu_items (label, path, page_type, sort_order, visible)
         VALUES ($1, $2, $3, $4, $5)`,
        [item.label, item.path, item.page_type, item.sort_order, item.visible]
      );
    }
  }
} else {
  console.log("  ○ menu_items already point at the CRA8 pages");
}

// ─── 4. About page ───────────────────────────────────────────
const { rows: aboutRows } = await pool.query("SELECT * FROM page_content WHERE page_slug = 'about'");
const about = aboutRows[0];
let aboutIsLegacy = true;

if (about) {
  try {
    const parsed = JSON.parse(about.content);
    aboutIsLegacy =
      isLegacy(parsed?.title) || isLegacy(parsed?.bioIntro) || isLegacy(parsed?.productionCompany?.name);
  } catch {
    aboutIsLegacy = true;
  }
}

if (aboutIsLegacy) {
  note("page_content.about: replacing personal bio with the CRA8 studio page");
  if (apply) {
    await pool.query(
      `INSERT INTO page_content (page_slug, title, content) VALUES ('about', 'About', $1)
       ON CONFLICT (page_slug) DO UPDATE
       SET title = 'About', content = EXCLUDED.content, updated_at = CURRENT_TIMESTAMP`,
      [JSON.stringify(CRA8_ABOUT_CONTENT)]
    );
  }
} else {
  console.log("  ○ page_content.about already reads as CRA8");
}

// ─── 5. Projects ─────────────────────────────────────────────
const { rows: projectRows } = await pool.query("SELECT id, title, category FROM projects");
const existingIds = new Set(projectRows.map((row) => row.id));
const slateIds = new Set(CRA8_PROJECTS.map((project) => project.id));

for (const project of CRA8_PROJECTS) {
  if (existingIds.has(project.id)) continue;
  note(`projects: adding missing slate title "${project.title}"`);
  if (apply) {
    await pool.query(
      `INSERT INTO projects
         (id, title, category, category_label, year, role, description, synopsis, thumbnail,
          youtube_id, director, producers, cast_info, status, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
       ON CONFLICT (id) DO NOTHING`,
      [
        project.id,
        project.title,
        project.category,
        project.category_label,
        project.year,
        project.role || "",
        project.description || "",
        project.synopsis || "",
        project.thumbnail || "",
        project.youtube_id || "",
        project.director || "",
        project.producers || "",
        project.cast_info || "",
        project.status || "",
        project.sort_order || 0,
      ]
    );
  }
}

const offSlate = projectRows.filter((row) => !slateIds.has(row.id));
if (offSlate.length) {
  console.log(
    `\n  ⚠️  ${offSlate.length} project(s) are not on the CRA8 slate ` +
      `(docs/CRA8-Creative-Direction.md removed them):`
  );
  offSlate.forEach((row) => console.log(`       ${row.id} — ${row.title} (${row.category})`));

  if (dropLegacyProjects) {
    note(`projects: deleting ${offSlate.length} off-slate project(s)`);
    if (apply) {
      await pool.query(
        `DELETE FROM projects WHERE id = ANY($1::varchar[])`,
        [offSlate.map((row) => row.id)]
      );
    }
  } else {
    console.log("       Left in place. Re-run with --drop-legacy-projects to remove them,");
    console.log("       or delete them individually in Admin → Projects.\n");
  }
}

// ─── Done ────────────────────────────────────────────────────
if (!changes.length) {
  console.log("\n  ✅ Nothing to do — the database already reads as CRA8.\n");
} else if (apply) {
  console.log(`\n  ✅ Applied ${changes.length} change(s).\n`);
  console.log("  Remaining manual step: set CRA8's contact email and social links");
  console.log("  in Admin → Settings — they are intentionally left blank.\n");
} else {
  console.log(`\n  ${changes.length} change(s) pending. Re-run with --apply to write them.\n`);
}

await pool.end();
