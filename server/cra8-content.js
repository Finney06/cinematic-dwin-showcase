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
  { label: "Services", path: "/services", page_type: "page", sort_order: 2, visible: 1 },
  { label: "Journal", path: "/journal", page_type: "page", sort_order: 3, visible: 1 },
  { label: "About", path: "/about", page_type: "page", sort_order: 4, visible: 1 },
  { label: "Contact", path: "/contact", page_type: "page", sort_order: 5, visible: 1 },
];

/**
 * The slate's sections. Only Film is published at launch because it's the only
 * one with work in it — the rest are ready to switch on in Admin → Categories
 * the day CRA8 has a title to put in them, no code change needed.
 */
export const CRA8_CATEGORIES = [
  { slug: "film", label: "Film", description: "Feature and short-form spiritual drama.", published: 1 },
  { slug: "television", label: "Television", description: "", published: 0 },
  { slug: "nonfiction", label: "Nonfiction", description: "", published: 0 },
  { slug: "music", label: "Music", description: "", published: 0 },
  { slug: "commercials", label: "Commercials", description: "", published: 0 },
  { slug: "audio", label: "Audio", description: "", published: 0 },
];

/**
 * What CRA8 actually delivers, in the roles credited across the real slate.
 * Every line here is editable in Admin → Services; nothing is invented beyond
 * the crafts DWINDIK is genuinely credited for.
 */
export const CRA8_SERVICES = [
  {
    slug: "cinematography",
    title: "Cinematography",
    summary: "Camera and lighting built around the story, not around the kit.",
    description:
      "Director of photography and gaffer work across CRA8's slate — colour temperature used as an emotional tool, close-ups held against clean, wide establishing frames.",
    capabilities: ["Director of Photography", "Lighting design", "Gaffer", "Camera operation"],
  },
  {
    slug: "editing",
    title: "Editing",
    summary: "Pacing a film the way a trailer is cut — one beat at a time.",
    description:
      "Chief editor on features and shorts, from assembly through final picture lock.",
    capabilities: ["Chief editor", "Assembly & rough cut", "Picture lock", "Trailer cutting"],
  },
  {
    slug: "visual-effects",
    title: "Visual Effects",
    summary: "Effects that stay inside the world of the film.",
    description:
      "Spiritual drama asks for effects that read as real. Compositing, clean-up and set extension built to disappear.",
    capabilities: ["Compositing", "Clean-up & rig removal", "Set extension", "Colour grading"],
  },
  {
    slug: "sound-design",
    title: "Sound Design",
    summary: "The half of the image you hear.",
    description: "Sound design and post audio, credited across the studio's feature work.",
    capabilities: ["Sound design", "Dialogue edit", "Post mix"],
  },
  {
    slug: "production",
    title: "Production",
    summary: "Getting a shoot from a schedule to a delivered film.",
    description: "Production and project management on multi-week feature shoots.",
    capabilities: ["Production management", "Scheduling", "On-set supervision"],
  },
];

/**
 * The Journal's opening entry.
 *
 * Every fact here comes from CRA8's own record — the slate in this file and
 * docs/CRA8-Creative-Direction-Final.md — because the Journal is CRA8's voice,
 * and inventing behind-the-scenes stories on the studio's behalf would put
 * words in DWINDIK's mouth. It exists so the page launches with something real
 * on it and so the shape of an entry is obvious; edit it or delete it freely.
 */
export const CRA8_JOURNAL = [
  {
    slug: "the-slate-so-far",
    title: "The slate so far",
    kicker: "CR8 News",
    excerpt:
      "Ten films, three years, and the crafts CRA8 was credited for on each one — the body of work this studio is built on.",
    author: "CRA8",
    published: 1,
    featured: 1,
    seo_description:
      "The ten films on CRA8's founding slate, and the crafts the studio was credited for on each.",
    blocks: [
      {
        type: "text",
        text: "CRA8 is a film studio working in spiritual drama and thriller. Faith, temptation and consequence — told with real craft, shot and finished in Nigeria.\n\nThe studio's founding slate runs to ten titles made between 2023 and 2026, most of them produced under The Winlos Media Ministry. On every one of them CRA8 is credited for the craft it actually delivered, never for producing the film: director of photography, chief editor, VFX artist, gaffer, sound design, production management.",
      },
      {
        type: "quote",
        text: "Colour temperature is used as an emotional tool, not one flat look.",
      },
      {
        type: "text",
        text: "That is the thread through the whole slate. Cool blue rim-light on the close-ups, warm amber through the dialogue, full monochrome on the inserts — the lighting carries the scene before a line is spoken.\n\nEvery title, with its full credits, is on the Work page.",
      },
      { type: "button", label: "See the slate", url: "/work" },
    ],
  },
];

/**
 * Placeholder team. These exist only so the client can see how the "The Studio"
 * grid on the About page looks with people in it — every name, role, bio and
 * portrait here is a stand-in. Replace or delete them in Admin → Team; the
 * section hides itself again once the list is empty.
 */
export const CRA8_TEAM = [
  {
    slug: "placeholder-founder",
    name: "Name Surname",
    role: "Founder & Creative Director",
    bio: "Placeholder bio — one or two sentences on what this person does at CRA8 and the work they're known for. Swap this out in Admin → Team.",
    image: "/placeholder-portrait.svg",
    links: [{ label: "Instagram", url: "https://instagram.com" }],
  },
  {
    slug: "placeholder-producer",
    name: "Name Surname",
    role: "Producer",
    bio: "Placeholder bio — a short line about this person's role on the slate. Replace with the real team member.",
    image: "/placeholder-portrait.svg",
    links: [],
  },
  {
    slug: "placeholder-post",
    name: "Name Surname",
    role: "Head of Post",
    bio: "Placeholder bio — editing, colour and finishing across CRA8's films. Edit or remove this entry in the admin.",
    image: "/placeholder-portrait.svg",
    links: [],
  },
  {
    slug: "placeholder-cinematographer",
    name: "Name Surname",
    role: "Cinematographer",
    bio: "Placeholder bio — this is only here to show the grid layout. Add the real people and delete the placeholders.",
    image: "/placeholder-portrait.svg",
    links: [],
  },
];

/**
 * Opening copy for the pages the site renders with its own layout. Each is a
 * `page_content` row, so all of it is editable in Admin → Pages — these are
 * only the words the site launches with.
 */
export const CRA8_SYSTEM_PAGES = [
  {
    slug: "work",
    title: "Work",
    seo_description: "The CRA8 slate — every film, with craft credits.",
    content: {
      blocks: [
        {
          type: "text",
          text: "Spiritual drama and thriller, shot, cut and finished in Nigeria. Each title lists the craft CRA8 delivered on it.",
        },
      ],
    },
  },
  {
    slug: "services",
    title: "Services",
    seo_description: "Cinematography, editing, visual effects, sound design and production from CRA8.",
    content: {
      intro:
        "The crafts CRA8 is credited for across its own slate, available to other productions. Whole projects or a single department.",
      blocks: [],
    },
  },
  {
    slug: "journal",
    title: "Journal",
    seo_description: "Behind the scenes, director stories, creative process and studio news from CRA8.",
    content: {
      intro:
        "Behind the scenes, director stories, creative process and studio news — written from inside the work.",
      blocks: [],
    },
  },
  {
    slug: "contact",
    title: "Contact",
    seo_description: "Get in touch with CRA8 about a production, press, or an internship.",
    content: {
      intro: "For production enquiries, press, or an internship — write to us.",
      formEnabled: true,
      topics: ["General", "Work with us", "Press", "Internship"],
      blocks: [],
    },
  },
];

/**
 * A clean, neutral placeholder — a text hero and a one-line statement, nothing
 * more. Only /work is populated for launch; the About page (and every other
 * non-Work page) is the client's to write. Nothing here should read as final,
 * invented company lore, and there is no placeholder imagery: optional sections
 * (founder, gallery, extra sections) only render once they have real content.
 */
export const CRA8_ABOUT_CONTENT = {
  heroImage: "",
  title: "CRA8",
  subtitle: "Film Studio · Nigeria",
  bioIntro: "CRA8 is a film studio based in Nigeria.",
  bioParagraphs: [],
  galleryImages: [],
  fullWidthImage: "",
  /** Founder credit — left empty; fill it in from Admin → About and the section appears. */
  productionCompany: {
    name: "",
    description: "",
    collaborator: "",
  },
  portraitImage: "",
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
