import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * Tables. Everything here is `IF NOT EXISTS`, so this runs safely on every
 * boot against a live database — it never drops or rewrites existing data.
 *
 * The content model, in one place:
 *
 *   projects        the slate. Each row belongs to a `categories.slug`.
 *   categories      the category pages (/film, /television, …). Adding a row
 *                   here creates a working page + route with no code change.
 *   page_content    one row per URL that isn't a collection item — copy, the
 *                   stackable block list, SEO, and the published flag. System
 *                   pages (work, about, services, journal, contact) live here
 *                   too so their headings and SEO stay editable.
 *   articles        Journal entries (/journal/:slug).
 *   services        the Services page's editable list.
 *   team_members    the About page's team grid.
 *   contact_messages   submissions from the Contact form.
 *   menu_items      navigation. Points at any of the above by path.
 */
const CREATE_TABLES = `
  CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(255) PRIMARY KEY,
    title TEXT NOT NULL,
    category VARCHAR(255) NOT NULL,
    category_label VARCHAR(255) NOT NULL,
    year VARCHAR(255) NOT NULL,
    role TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    synopsis TEXT DEFAULT '',
    thumbnail TEXT NOT NULL DEFAULT '',
    youtube_id VARCHAR(255) DEFAULT '',
    director VARCHAR(255) DEFAULT '',
    producers TEXT DEFAULT '',
    cast_info TEXT DEFAULT '',
    status VARCHAR(255) DEFAULT '',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(255) UNIQUE NOT NULL,
    label VARCHAR(255) NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    hero_image TEXT NOT NULL DEFAULT '',
    sort_order INTEGER DEFAULT 0,
    published INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS menu_items (
    id SERIAL PRIMARY KEY,
    label VARCHAR(255) NOT NULL,
    path VARCHAR(255) NOT NULL,
    page_type VARCHAR(255) NOT NULL DEFAULT 'category',
    sort_order INTEGER DEFAULT 0,
    visible INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS page_content (
    id SERIAL PRIMARY KEY,
    page_slug VARCHAR(255) UNIQUE NOT NULL,
    title TEXT NOT NULL DEFAULT '',
    content TEXT NOT NULL DEFAULT '{}',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS articles (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(255) UNIQUE NOT NULL,
    title TEXT NOT NULL DEFAULT '',
    kicker VARCHAR(255) NOT NULL DEFAULT '',
    excerpt TEXT NOT NULL DEFAULT '',
    cover_image TEXT NOT NULL DEFAULT '',
    author VARCHAR(255) NOT NULL DEFAULT '',
    published_at DATE,
    blocks TEXT NOT NULL DEFAULT '[]',
    featured INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    published INTEGER DEFAULT 0,
    seo_title TEXT NOT NULL DEFAULT '',
    seo_description TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(255) UNIQUE NOT NULL,
    title TEXT NOT NULL DEFAULT '',
    summary TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    image TEXT NOT NULL DEFAULT '',
    capabilities TEXT NOT NULL DEFAULT '[]',
    sort_order INTEGER DEFAULT 0,
    published INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS team_members (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL DEFAULT '',
    role VARCHAR(255) NOT NULL DEFAULT '',
    bio TEXT NOT NULL DEFAULT '',
    image TEXT NOT NULL DEFAULT '',
    links TEXT NOT NULL DEFAULT '[]',
    sort_order INTEGER DEFAULT 0,
    published INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS contact_messages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL DEFAULT '',
    email VARCHAR(255) NOT NULL DEFAULT '',
    topic VARCHAR(255) NOT NULL DEFAULT '',
    message TEXT NOT NULL DEFAULT '',
    status VARCHAR(32) NOT NULL DEFAULT 'new',
    ip VARCHAR(255) NOT NULL DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS hero_content (
    id SERIAL PRIMARY KEY,
    brand_text VARCHAR(255) DEFAULT 'CRA8',
    tagline VARCHAR(255) DEFAULT 'Spiritual Drama',
    video_url VARCHAR(255) DEFAULT '/trillar-video.mp4',
    hero_image VARCHAR(255) DEFAULT '',
    hero_link VARCHAR(255) DEFAULT '',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS site_settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(255) UNIQUE NOT NULL,
    value TEXT NOT NULL DEFAULT '',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    username VARCHAR(255),
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(255) NOT NULL,
    entity_id VARCHAR(255),
    details TEXT NOT NULL DEFAULT '{}',
    ip VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

/**
 * Columns added after the first release. `ADD COLUMN IF NOT EXISTS` makes each
 * one a no-op on a database that already has it, so this is the whole upgrade
 * path: deploy, restart, done. Add to the bottom of the list, never edit a
 * line above it.
 */
const ADD_COLUMNS = [
  // Pages gained publishing + SEO of their own.
  `ALTER TABLE page_content ADD COLUMN IF NOT EXISTS published INTEGER DEFAULT 1`,
  `ALTER TABLE page_content ADD COLUMN IF NOT EXISTS is_system INTEGER DEFAULT 0`,
  `ALTER TABLE page_content ADD COLUMN IF NOT EXISTS seo_title TEXT NOT NULL DEFAULT ''`,
  `ALTER TABLE page_content ADD COLUMN IF NOT EXISTS seo_description TEXT NOT NULL DEFAULT ''`,
  `ALTER TABLE page_content ADD COLUMN IF NOT EXISTS seo_image TEXT NOT NULL DEFAULT ''`,
  `ALTER TABLE page_content ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`,
  // Projects gained a trailer, a gallery, free-form credits and publishing.
  `ALTER TABLE projects ADD COLUMN IF NOT EXISTS published INTEGER DEFAULT 1`,
  `ALTER TABLE projects ADD COLUMN IF NOT EXISTS trailer_youtube_id VARCHAR(255) NOT NULL DEFAULT ''`,
  `ALTER TABLE projects ADD COLUMN IF NOT EXISTS logline TEXT NOT NULL DEFAULT ''`,
  `ALTER TABLE projects ADD COLUMN IF NOT EXISTS credits TEXT NOT NULL DEFAULT '[]'`,
  `ALTER TABLE projects ADD COLUMN IF NOT EXISTS gallery TEXT NOT NULL DEFAULT '[]'`,
  `ALTER TABLE projects ADD COLUMN IF NOT EXISTS blocks TEXT NOT NULL DEFAULT '[]'`,
  `ALTER TABLE projects ADD COLUMN IF NOT EXISTS seo_description TEXT NOT NULL DEFAULT ''`,
  // The one project that opens Work and its own category page.
  `ALTER TABLE projects ADD COLUMN IF NOT EXISTS featured INTEGER DEFAULT 0`,
];

const CREATE_INDEXES = [
  `CREATE INDEX IF NOT EXISTS idx_projects_category ON projects (category)`,
  `CREATE INDEX IF NOT EXISTS idx_projects_sort ON projects (sort_order)`,
  `CREATE INDEX IF NOT EXISTS idx_articles_published ON articles (published)`,
  `CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages (status)`,
];

/**
 * One-time data backfills for databases that predate a schema change. Each one
 * checks first and does nothing on a database that's already current, so this
 * is safe to run on every boot.
 */
const backfill = async () => {
  // Categories used to be implied by `projects.category` and by menu items of
  // type "category". Lift them into the real table the first time this runs so
  // an existing site keeps every section it already had.
  const { rows: existing } = await pool.query("SELECT COUNT(*)::int AS count FROM categories");
  if (existing[0].count === 0) {
    const { rows: derived } = await pool.query(`
      SELECT DISTINCT ON (slug) slug, label FROM (
        SELECT p.category AS slug, MIN(p.category_label) AS label
          FROM projects p WHERE p.category <> '' GROUP BY p.category
        UNION ALL
        SELECT regexp_replace(m.path, '^/', '') AS slug, m.label
          FROM menu_items m WHERE m.page_type = 'category' AND m.path <> '/'
      ) AS sources WHERE slug <> '' ORDER BY slug
    `);

    for (const [index, row] of derived.entries()) {
      await pool.query(
        `INSERT INTO categories (slug, label, sort_order, published)
         VALUES ($1, $2, $3, 1) ON CONFLICT (slug) DO NOTHING`,
        [row.slug, row.label || row.slug, index + 1]
      );
    }
    if (derived.length) console.log(`  ↳ Backfilled ${derived.length} categories from existing content`);
  }

  // Mark the pages the app renders with its own layout, so the admin knows not
  // to offer Delete on them.
  await pool.query(
    `UPDATE page_content SET is_system = 1
     WHERE page_slug IN ('home', 'work', 'about', 'services', 'journal', 'contact') AND is_system = 0`
  );

  // Services, Journal and Contact are new sections. On a site that already has
  // a menu, add the ones that aren't in it yet so the pages are reachable;
  // they can be hidden or reordered in Admin → Menu like anything else. A site
  // with no menu at all is a fresh install and gets its menu from seed.js.
  const { rows: menuCount } = await pool.query("SELECT COUNT(*)::int AS count FROM menu_items");
  if (menuCount[0].count > 0) {
    const newSections = [
      { label: "Services", path: "/services" },
      { label: "Journal", path: "/journal" },
      { label: "Contact", path: "/contact" },
    ];
    for (const section of newSections) {
      const { rows: existing } = await pool.query("SELECT id FROM menu_items WHERE path = $1", [section.path]);
      if (existing.length) continue;
      const { rows: maxRows } = await pool.query("SELECT MAX(sort_order) AS max_order FROM menu_items");
      await pool.query(
        "INSERT INTO menu_items (label, path, page_type, sort_order, visible) VALUES ($1, $2, 'page', $3, 1)",
        [section.label, section.path, (maxRows[0]?.max_order || 0) + 1]
      );
      console.log(`  ↳ Added ${section.path} to the menu`);
    }
  }
};

const initDB = async () => {
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL is not set.");
    return;
  }

  try {
    await pool.query(CREATE_TABLES);
    for (const statement of [...ADD_COLUMNS, ...CREATE_INDEXES]) {
      await pool.query(statement);
    }
    await backfill();
    console.log("✅ Database initialized successfully");
  } catch (error) {
    console.error("❌ Error initializing database:", error);
  }
};

export const initPromise = initDB();

export default pool;
