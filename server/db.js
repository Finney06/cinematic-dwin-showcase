import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const initDB = async () => {
  try {
    await pool.query(`
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

      CREATE TABLE IF NOT EXISTS hero_content (
        id SERIAL PRIMARY KEY,
        brand_text VARCHAR(255) DEFAULT 'DWINDIK',
        tagline VARCHAR(255) DEFAULT 'Cre8te',
        video_url VARCHAR(255) DEFAULT '/dwindik/video1.mp4',
        hero_image VARCHAR(255) DEFAULT '/dwindik/5.jpeg',
        hero_link VARCHAR(255) DEFAULT 'https://youtu.be/mPAZSvF5usk?si=IxaXZFE0nJZw0ypt',
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
    `);
    console.log("✅ Database initialized successfully");
  } catch (error) {
    if (process.env.DATABASE_URL) {
       console.error("❌ Error initializing database:", error);
    } else {
       console.error("❌ DATABASE_URL is not set.");
    }
  }
};

export const initPromise = initDB();

export default pool;
