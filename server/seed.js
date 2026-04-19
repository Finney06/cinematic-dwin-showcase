import "dotenv/config";
import bcrypt from "bcryptjs";
import pool, { initPromise } from "./db.js";

await initPromise;

console.log("🌱  Seeding Dwindik CMS database...\n");

// ─── 1. Admin User ──────────────────────────────────────────
const username = process.env.ADMIN_USERNAME || "dwindik";
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

// ─── 2. Projects ─────────────────────────────────────────────
const ytThumb = (id) => `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;

const projects = [
  {
    id: "prophet-suddenly-1",
    title: "Prophet Suddenly",
    category: "film",
    category_label: "Film",
    year: "2023",
    role: "Director of Photography, Cinematographer, Editor, VFX Artist, Lighting",
    description: "A gripping spiritual drama that follows Michael, a man driven by an intense desire for fame and success in ministry, and the cost of ambition without God.",
    synopsis: "Prophet Suddenly is a gripping spiritual drama by The Winlos Media Ministry that follows Michael, a man driven by an intense desire for fame and success in ministry. As he pursues power through questionable means, he drifts away from his faith and unknowingly invites dark forces into his life. What begins as a rise to prominence soon turns into a tragic unraveling, revealing the cost of ambition without God. The film delivers a powerful message about humility, patience, and the dangers of seeking glory outside of true divine calling.",
    thumbnail: ytThumb("QIoUmnSkOXE"),
    youtube_id: "QIoUmnSkOXE",
    producers: "Winlos Studios",
    status: "Now Streaming on YouTube",
    sort_order: 1,
  },
  {
    id: "prophet-suddenly-2",
    title: "Prophet Suddenly 2: Helpers of God",
    category: "film",
    category_label: "Film",
    year: "2024",
    role: "Director of Photography, Chief Editor, Sound Design, VFX Artist, Gaffer",
    description: "Daniel leaves Nigeria for Ghana in search of deeper spiritual purpose — only to become entangled in a system built on deception and staged miracles.",
    synopsis: "Prophet Suddenly 2: Helpers of God follows Daniel, a minister who leaves Nigeria for Ghana in search of deeper spiritual purpose. There, he joins a popular but controversial prophet and becomes entangled in a system built on deception and staged miracles. As hidden scandals and corruption begin to surface, Daniel is forced to confront the truth and choose between loyalty and integrity. The film delivers a powerful warning about the dangers of blind devotion and compromised faith.",
    thumbnail: ytThumb("lb9YjxjWOyU"),
    youtube_id: "lb9YjxjWOyU",
    producers: "The Winlos Studio",
    status: "Now Streaming",
    sort_order: 2,
  },
  {
    id: "holy-scam",
    title: "Holy Scam",
    category: "film",
    category_label: "Film",
    year: "2024",
    role: "Director of Photography, Chief Editor, VFX, Lighting",
    description: "A provocative short film exploring the thin line between faith and fraud in modern ministry.",
    thumbnail: ytThumb("3RxAESE5yoQ"),
    youtube_id: "3RxAESE5yoQ",
    status: "Now Streaming",
    sort_order: 3,
  },
  {
    id: "love-in-the-guest-room",
    title: "Love in the Guest Room",
    category: "film",
    category_label: "Film",
    year: "2025",
    role: "DOP, Lighting, VFX, Chief Editor, Gaffer",
    description: "Two struggling couples are brought together for a marriage intervention that forces honest conversation, vulnerability, and a journey toward healing.",
    synopsis: "Love in the Guest Room is a Nigerian Christian drama that follows two struggling couples brought together under unusual circumstances for a marriage intervention. As they are forced into honest conversations without distractions, deep-seated issues, past trauma, and misunderstandings come to light. Through emotional confrontations, prayer, and vulnerability, the couples begin a journey toward healing, restoration, and renewed commitment to their marriages.",
    thumbnail: ytThumb("FKe3cVTo4Fs"),
    youtube_id: "FKe3cVTo4Fs",
    producers: "Winlos Studio",
    status: "Now Streaming",
    sort_order: 4,
  },
  {
    id: "prophet-suddenly-3",
    title: "Prophet Suddenly 3",
    category: "film",
    category_label: "Film",
    year: "2025",
    role: "Director of Photography, VFX Artist, Production Manager, Chief Editor, Gaffer",
    description: "James Edu, a gifted music minister, watches his life and ministry crumble as his obsession with wealth and recognition pulls him away from his calling.",
    synopsis: "Prophet Suddenly 3 is a powerful spiritual drama that follows James Edu, a gifted music minister whose rise to fame is overshadowed by his growing obsession with wealth and recognition. As he drifts from his divine calling and ignores wise counsel, his life and ministry begin to crumble. What starts as a promising journey ends in loss and obscurity, delivering a sobering message about the cost of compromise, pride, and losing alignment with God.",
    thumbnail: ytThumb("m2BNiZWbV50"),
    youtube_id: "m2BNiZWbV50",
    producers: "Winlos Studio",
    status: "Now Streaming",
    sort_order: 5,
  },
  {
    id: "spirituals-1",
    title: "Spirituals",
    category: "film",
    category_label: "Film",
    year: "2025",
    role: "DOP, Gaffer, VFX Artist",
    description: "A couple facing repeated pregnancy losses discovers the unseen spiritual battles behind their suffering — and fights back through faith.",
    synopsis: "Spirituals 1 is a Nigerian Christian drama that follows a couple facing repeated pregnancy losses linked to unseen spiritual battles. As they struggle with pain and confusion, they turn to prayer and faith, leading to a powerful breakthrough and victory over darkness.",
    thumbnail: ytThumb("wbexvRPd0Go"),
    youtube_id: "wbexvRPd0Go",
    producers: "The Winlos Studio",
    status: "Now Streaming",
    sort_order: 6,
  },
  {
    id: "spirituals-2",
    title: "Spirituals 2",
    category: "film",
    category_label: "Film",
    year: "2025",
    role: "DOP, Gaffer, VFX Artist",
    description: "A family unknowingly invites a deadly spiritual covenant into their home when they welcome a mysterious house help.",
    synopsis: "Spirituals 2 tells the story of a family unknowingly entangled in a deadly spiritual covenant after welcoming a mysterious house help into their home. As strange events unfold, they must rely on faith and prayer to uncover the truth and fight for their survival.",
    thumbnail: ytThumb("QafCUG04yGs"),
    youtube_id: "QafCUG04yGs",
    producers: "The Winlos Studio",
    status: "Now Streaming",
    sort_order: 7,
  },
  {
    id: "spirituals-3",
    title: "Spirituals 3",
    category: "film",
    category_label: "Film",
    year: "2026",
    role: "DOP, Gaffer, VFX Artist",
    description: "Inare's life is plagued by repeated failures caused by ancestral spiritual influences — until she confronts the past and finds freedom.",
    synopsis: "Spirituals 3 follows Inare, a young woman whose life is plagued by repeated failures caused by ancestral spiritual influences. Through faith, prayer, and revelation, she confronts the past and finds freedom from the forces holding her back.",
    thumbnail: ytThumb("pRPFMJXefv0"),
    youtube_id: "pRPFMJXefv0",
    producers: "The Winlos Studio",
    status: "Now Streaming",
    sort_order: 8,
  },
  {
    id: "spirituals-4",
    title: "Spirituals 4",
    category: "film",
    category_label: "Film",
    year: "2026",
    role: "DOP, Gaffer, VFX Artist",
    description: "A young girl's life takes a dark turn after receiving a mysterious doll tied to occult practices — igniting a battle between darkness and faith.",
    synopsis: "Spirituals 4 centers on a young girl whose life takes a dark turn after receiving a mysterious doll tied to occult practices. As danger grows within her family, a battle between darkness and faith unfolds, leading to a powerful moment of deliverance and redemption.",
    thumbnail: ytThumb("y41jI31M-3Y"),
    youtube_id: "y41jI31M-3Y",
    producers: "The Winlos Studio",
    status: "Now Streaming",
    sort_order: 9,
  },
  {
    id: "the-distance",
    title: "The Distance",
    category: "television",
    category_label: "Television",
    year: "2025",
    role: "Director / Showrunner",
    description: "A six-part limited series exploring the lives of long-distance runners across three continents.",
    thumbnail: "/dwindik/4.jpeg",
    producers: "Cre8te Studios",
    status: "Coming Soon",
    sort_order: 1,
  },
  {
    id: "still-here",
    title: "Still Here",
    category: "nonfiction",
    category_label: "Nonfiction",
    year: "2025",
    role: "Director / Producer",
    description: "A documentary examining resilience and community rebuilding in post-industrial communities.",
    thumbnail: "/dwindik/3.jpeg",
    producers: "Cre8te Studios",
    status: "Coming Soon",
    sort_order: 1,
  },
  {
    id: "in-frame",
    title: "In Frame",
    category: "audio",
    category_label: "Audio",
    year: "2025",
    role: "Creator / Host",
    description: "A podcast exploring the craft of visual storytelling — conversations with filmmakers and visual artists.",
    thumbnail: "/dwindik/4.jpeg",
    status: "Coming Soon",
    sort_order: 1,
  },
  {
    id: "story-of-my-life",
    title: "Story of My Life",
    category: "music",
    category_label: "Music",
    year: "2025",
    role: "Artist / Director / Music Video",
    description: "Official music video and soundtrack single from Prophet Suddenly 3. A collaboration between The Winlos and Dwindik.",
    thumbnail: ytThumb("cGXFnDloUCg"),
    youtube_id: "cGXFnDloUCg",
    producers: "The Winlos x Dwindik",
    status: "Out Now",
    sort_order: 1,
  },
];

const insertProjectQuery = `
  INSERT INTO projects
    (id, title, category, category_label, year, role, description, synopsis, thumbnail, youtube_id, director, producers, cast_info, status, sort_order)
  VALUES
    ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
  ON CONFLICT (id) DO NOTHING
`;

for (const p of projects) {
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
console.log(`  ✓ Seeded ${projects.length} projects`);

// ─── 3. Menu Items ───────────────────────────────────────────
const menuItems = [
  { label: "Film", path: "/film", page_type: "category", sort_order: 1, visible: 1 },
  { label: "Music", path: "/music", page_type: "category", sort_order: 2, visible: 1 },
  { label: "Television", path: "/television", page_type: "category", sort_order: 3, visible: 1 },
  { label: "Commercials", path: "/commercials", page_type: "category", sort_order: 4, visible: 1 },
  { label: "About", path: "/about", page_type: "page", sort_order: 5, visible: 1 },
  { label: "Nonfiction", path: "/nonfiction", page_type: "category", sort_order: 6, visible: 1 },
  { label: "Audio", path: "/audio", page_type: "category", sort_order: 7, visible: 1 },
  { label: "News", path: "/news", page_type: "page", sort_order: 8, visible: 1 },
  { label: "Internship", path: "/internship", page_type: "page", sort_order: 9, visible: 1 },
];

const existingMenuCountRes = await pool.query("SELECT COUNT(*) as count FROM menu_items");
const existingMenuCount = parseInt(existingMenuCountRes.rows[0].count, 10);

if (existingMenuCount === 0) {
  const insertMenuQuery = `
    INSERT INTO menu_items (label, path, page_type, sort_order, visible)
    VALUES ($1, $2, $3, $4, $5)
  `;
  for (const item of menuItems) {
    await pool.query(insertMenuQuery, [item.label, item.path, item.page_type, item.sort_order, item.visible]);
  }
  console.log(`  ✓ Seeded ${menuItems.length} menu items`);
} else {
  console.log(`  ○ Menu items already exist (${existingMenuCount})`);
}

// ─── 4. Hero Content ─────────────────────────────────────────
const existingHeroRes = await pool.query("SELECT COUNT(*) as count FROM hero_content");
if (parseInt(existingHeroRes.rows[0].count, 10) === 0) {
  await pool.query(`
    INSERT INTO hero_content (brand_text, tagline, video_url, hero_image, hero_link)
    VALUES ('DWINDIK', 'Cre8te', '/dwindik/video1.mp4', '/dwindik/5.jpeg', 'https://youtu.be/mPAZSvF5usk?si=IxaXZFE0nJZw0ypt')
  `);
  console.log("  ✓ Seeded hero content");
} else {
  console.log("  ○ Hero content already exists");
}

// ─── 5. Site Settings ────────────────────────────────────────
const defaultSettings = {
  contact_email: "hello@dwindik.com",
  social_instagram: "https://www.instagram.com/dwin_dik/",
  social_youtube: "https://www.youtube.com/@Dwin_dik",
  social_twitter: "https://twitter.com/dwindik",
  social_links: JSON.stringify([
    { label: "Instagram", url: "https://www.instagram.com/dwin_dik/" },
    { label: "YouTube", url: "https://www.youtube.com/@Dwin_dik" },
    { label: "Twitter", url: "https://twitter.com/dwindik" },
  ]),
  font_display: '"Pragmatica", "Helvetica Neue", Arial, sans-serif',
  font_body: '"Heiti TC", "PingFang TC", "Microsoft JhengHei", sans-serif',
  copyright_text: "©2026 Dwindik. All rights reserved.",
  site_title: "Dwindik",
};

const upsertSettingQuery = `
  INSERT INTO site_settings (key, value) VALUES ($1, $2)
  ON CONFLICT (key) DO NOTHING
`;
for (const [key, value] of Object.entries(defaultSettings)) {
  await pool.query(upsertSettingQuery, [key, value]);
}
console.log("  ✓ Seeded site settings");

// ─── 6. About Page Content ──────────────────────────────────
const existingAboutRes = await pool.query("SELECT * FROM page_content WHERE page_slug = 'about'");
const existingAbout = existingAboutRes.rows[0];

if (!existingAbout) {
  const aboutContent = {
    heroImage: "/dwindik/1.jpeg",
    title: "Dwindik",
    subtitle: "Director of Photography · Visual Storyteller",
    bioIntro:
      "Dwindik is a Nigerian-based Director of Photography, visual effects artist, and editor. Through his production company Cre8te, his work bridges the worlds of faith-driven storytelling and cinematic craft.",
    bioParagraphs: [
      "With a deep passion for visual storytelling, Dwindik — through Cre8te — has served as the creative backbone behind some of the most impactful productions in collaboration with The Winlos Studio, working across direction of photography, cinematography, lighting, editing, VFX, and sound design.",
      'His filmography includes the acclaimed Prophet Suddenly trilogy, the Spirituals series, Holy Scam, and Love in the Guest Room — all streaming on YouTube and reaching audiences across Africa and the diaspora. Every project is built on a foundation of purpose: stories that challenge, convict, and inspire.',
      "Beyond the camera, Dwindik brings a meticulous eye to post-production — shaping each frame through colour grading, visual effects, and sound design to create an immersive viewing experience. His approach is rooted in the belief that film is not just entertainment — it is ministry, and every frame carries weight.",
    ],
    galleryImages: ["/dwindik/2.jpeg", "/dwindik/3.jpeg"],
    craftQuote:
      "Every frame is intentional. I don't just capture moments — I shape them. Light, movement, colour — they all serve the story. And the story always has to matter.",
    craftSkills: [
      {
        title: "Cinematography & Lighting",
        description:
          "Crafting mood and atmosphere through natural and controlled lighting setups. From intimate dialogue scenes to sweeping exteriors, every shot is designed to serve the emotional arc of the story.",
      },
      {
        title: "Editing & Post-Production",
        description:
          "Shaping raw footage into polished narratives through meticulous editing, colour grading, and pacing. Post-production is where the story finds its final voice.",
      },
      {
        title: "Visual Effects",
        description:
          "Seamlessly blending practical and digital elements to enhance the visual world of each film — from subtle compositing to atmospheric enhancements.",
      },
      {
        title: "Sound Design",
        description:
          "Building immersive soundscapes that deepen the emotional impact of each scene. Sound is not an afterthought — it is an integral layer of the storytelling.",
      },
    ],
    fullWidthImage: "/dwindik/4.jpeg",
    productionCompany: {
      name: "Cre8te",
      description:
        "Cre8te is Dwindik's production company — a creative studio dedicated to visual storytelling, cinematography, and post-production. Based in Nigeria, reaching the world.",
      collaborator: "In collaboration with The Winlos Studio",
    },
    portraitImage: "/dwindik/5.jpeg",
  };

  await pool.query(
    "INSERT INTO page_content (page_slug, title, content) VALUES ('about', 'About', $1)",
    [JSON.stringify(aboutContent)]
  );
  console.log("  ✓ Seeded about page content");
} else {
  console.log("  ○ About page content already exists");
}

console.log("\n  ✅ Database seeded successfully!\n");
console.log(`  Login credentials:`);
console.log(`    Username: ${username}`);
console.log(`    Password: ${password}\n`);
