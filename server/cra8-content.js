/**
 * CRA8's launch content — the single source of truth shared by `seed.js`
 * (fresh databases) and `rebrand-cra8.js` (the DWINDIK → CRA8 migration).
 *
 * Every record here is real: the ten films are CRA8's founding slate, and each
 * one is credited for the craft CRA8 delivered on it, never framed as "CRA8
 * produced this film". See docs/CRA8-Creative-Direction-Final.md.
 */

const ytThumb = (id) => `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;

export const CRA8_PROJECTS = [
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
    id: "prophet-suddenly-4",
    title: "Prophet Suddenly 4: The Children's Ministry",
    category: "film",
    category_label: "Film",
    year: "2026",
    role: "Director of Photography, VFX Artist, Project Management, Chief Editor, Gaffer",
    description: "A gripping spiritual drama that follows Pastor Victor, a minister whose desire for greatness and ministry expansion leads him toward dangerous spiritual compromise.",
    synopsis: "Prophet Suddenly 4 follows Pastor Victor, a minister whose hunger for greatness and ministry expansion takes a dark turn after a trip to Tanzania — drawing him into a spiritual compromise that threatens everything and everyone around him.",
    thumbnail: ytThumb("UjlbcOR7CfI"),
    youtube_id: "UjlbcOR7CfI",
    producers: "The Winlos",
    status: "Now Streaming",
    sort_order: 10,
  },
];

/**
 * The hero circle: an opening clip cut from the slate, then the CRA8 logo.
 * `hero_image` is left empty so the site falls back to the logo in `public/CRA8.png`.
 */
export const CRA8_HERO = {
  brand_text: "CRA8",
  tagline: "Spiritual Drama",
  video_url: "/trillar-video.mp4",
  hero_image: "",
  hero_link: "",
};

export const CRA8_MENU_ITEMS = [
  { label: "Work", path: "/work", page_type: "page", sort_order: 1, visible: 1 },
  { label: "About", path: "/about", page_type: "page", sort_order: 2, visible: 1 },
  { label: "News", path: "/news", page_type: "page", sort_order: 3, visible: 1 },
];

/**
 * Deliberately minimal, in the spirit of proximitymedia.com and a24films.com:
 * work speaks first, About stays short. DWINDIK edits this directly in
 * Admin → About once he has the exact copy he wants — nothing here should
 * read as final, invented company lore.
 */
export const CRA8_ABOUT_CONTENT = {
  // A real photo of DWINDIK on set, not a slate movie-poster thumbnail — this
  // is a founder page, and the work already has its own home on /work.
  heroImage: "/dwindik/4.jpeg",
  title: "CRA8",
  subtitle: "Film Studio · Nigeria",
  bioIntro: "A film studio working in spiritual drama and thriller.",
  bioParagraphs: [],
  galleryImages: [],
  fullWidthImage: "",
  /** Founder credit — rendered near the foot of the About page, beside a portrait. */
  productionCompany: {
    name: "DWINDIK",
    description:
      "Founder of CRA8. Director of Photography, VFX Artist, and Editor across the studio's slate.",
    collaborator: "In collaboration with The Winlos Media Ministry",
  },
  portraitImage: "/dwindik/5.jpeg",
};

/**
 * Identity settings. Contact email and social links are deliberately empty:
 * CRA8's own address and handles are not confirmed yet, and the site hides
 * those blocks rather than showing a guessed one. Set them in Admin → Settings.
 */
export function cra8Settings() {
  return {
    contact_email: "",
    social_instagram: "",
    social_youtube: "",
    social_twitter: "",
    social_links: "[]",
    font_display: '"Heiti TC", "PingFang TC", "Microsoft JhengHei", sans-serif',
    font_body: '"Pragmatica", "Inter", "Helvetica Neue", Arial, sans-serif',
    copyright_text: `©${new Date().getFullYear()} CRA8. All rights reserved.`,
    site_title: "CRA8",
  };
}
