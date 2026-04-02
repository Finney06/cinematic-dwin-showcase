export type ProjectCategory = "film" | "television" | "nonfiction" | "audio" | "music";

export interface Project {
  id: string;
  title: string;
  category: ProjectCategory;
  categoryLabel: string;
  year: string;
  role: string;
  description: string;
  thumbnail: string;
  youtubeId?: string;
  stills?: string[];
  director?: string;
  producers?: string;
  cast?: string;
  synopsis?: string;
  status?: string;
}

/** Helper — YouTube max-res thumbnail from a video ID */
const ytThumb = (id: string) =>
  `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;

export const projects: Project[] = [
  // ═══════════════════════════════════════
  //  FILM
  // ═══════════════════════════════════════
  {
    id: "prophet-suddenly-1",
    title: "Prophet Suddenly",
    category: "film",
    categoryLabel: "Film",
    year: "2023",
    role: "Director of Photography, Cinematographer, Editor, VFX Artist, Lighting",
    description:
      "A gripping spiritual drama that follows Michael, a man driven by an intense desire for fame and success in ministry, and the cost of ambition without God.",
    synopsis:
      "Prophet Suddenly is a gripping spiritual drama by The Winlos Media Ministry that follows Michael, a man driven by an intense desire for fame and success in ministry. As he pursues power through questionable means, he drifts away from his faith and unknowingly invites dark forces into his life. What begins as a rise to prominence soon turns into a tragic unraveling, revealing the cost of ambition without God. The film delivers a powerful message about humility, patience, and the dangers of seeking glory outside of true divine calling.",
    thumbnail: ytThumb("QIoUmnSkOXE"),
    youtubeId: "QIoUmnSkOXE",
    producers: "Winlos Studios",
    status: "Now Streaming on YouTube",
  },
  {
    id: "prophet-suddenly-2",
    title: "Prophet Suddenly 2: Helpers of God",
    category: "film",
    categoryLabel: "Film",
    year: "2024",
    role: "Director of Photography, Chief Editor, Sound Design, VFX Artist, Gaffer",
    description:
      "Daniel leaves Nigeria for Ghana in search of deeper spiritual purpose — only to become entangled in a system built on deception and staged miracles.",
    synopsis:
      "Prophet Suddenly 2: Helpers of God follows Daniel, a minister who leaves Nigeria for Ghana in search of deeper spiritual purpose. There, he joins a popular but controversial prophet and becomes entangled in a system built on deception and staged miracles. As hidden scandals and corruption begin to surface, Daniel is forced to confront the truth and choose between loyalty and integrity. The film delivers a powerful warning about the dangers of blind devotion and compromised faith.",
    thumbnail: ytThumb("lb9YjxjWOyU"),
    youtubeId: "lb9YjxjWOyU",
    producers: "The Winlos Studio",
    status: "Now Streaming",
  },
  {
    id: "holy-scam",
    title: "Holy Scam",
    category: "film",
    categoryLabel: "Film",
    year: "2024",
    role: "Director of Photography, Chief Editor, VFX, Lighting",
    description:
      "A provocative short film exploring the thin line between faith and fraud in modern ministry.",
    thumbnail: ytThumb("3RxAESE5yoQ"),
    youtubeId: "3RxAESE5yoQ",
    status: "Now Streaming",
  },
  {
    id: "love-in-the-guest-room",
    title: "Love in the Guest Room",
    category: "film",
    categoryLabel: "Film",
    year: "2025",
    role: "DOP, Lighting, VFX, Chief Editor, Gaffer",
    description:
      "Two struggling couples are brought together for a marriage intervention that forces honest conversation, vulnerability, and a journey toward healing.",
    synopsis:
      "Love in the Guest Room is a Nigerian Christian drama that follows two struggling couples brought together under unusual circumstances for a marriage intervention. As they are forced into honest conversations without distractions, deep-seated issues, past trauma, and misunderstandings come to light. Through emotional confrontations, prayer, and vulnerability, the couples begin a journey toward healing, restoration, and renewed commitment to their marriages.",
    thumbnail: ytThumb("FKe3cVTo4Fs"),
    youtubeId: "FKe3cVTo4Fs",
    producers: "Winlos Studio",
    status: "Now Streaming",
  },
  {
    id: "prophet-suddenly-3",
    title: "Prophet Suddenly 3",
    category: "film",
    categoryLabel: "Film",
    year: "2025",
    role: "Director of Photography, VFX Artist, Production Manager, Chief Editor, Gaffer",
    description:
      "James Edu, a gifted music minister, watches his life and ministry crumble as his obsession with wealth and recognition pulls him away from his calling.",
    synopsis:
      "Prophet Suddenly 3 is a powerful spiritual drama that follows James Edu, a gifted music minister whose rise to fame is overshadowed by his growing obsession with wealth and recognition. As he drifts from his divine calling and ignores wise counsel, his life and ministry begin to crumble. What starts as a promising journey ends in loss and obscurity, delivering a sobering message about the cost of compromise, pride, and losing alignment with God.",
    thumbnail: ytThumb("m2BNiZWbV50"),
    youtubeId: "m2BNiZWbV50",
    producers: "Winlos Studio",
    status: "Now Streaming",
  },
  {
    id: "spirituals-1",
    title: "Spirituals",
    category: "film",
    categoryLabel: "Film",
    year: "2025",
    role: "DOP, Gaffer, VFX Artist",
    description:
      "A couple facing repeated pregnancy losses discovers the unseen spiritual battles behind their suffering — and fights back through faith.",
    synopsis:
      "Spirituals 1 is a Nigerian Christian drama that follows a couple facing repeated pregnancy losses linked to unseen spiritual battles. As they struggle with pain and confusion, they turn to prayer and faith, leading to a powerful breakthrough and victory over darkness.",
    thumbnail: ytThumb("wbexvRPd0Go"),
    youtubeId: "wbexvRPd0Go",
    producers: "The Winlos Studio",
    status: "Now Streaming",
  },
  {
    id: "spirituals-2",
    title: "Spirituals 2",
    category: "film",
    categoryLabel: "Film",
    year: "2025",
    role: "DOP, Gaffer, VFX Artist",
    description:
      "A family unknowingly invites a deadly spiritual covenant into their home when they welcome a mysterious house help.",
    synopsis:
      "Spirituals 2 tells the story of a family unknowingly entangled in a deadly spiritual covenant after welcoming a mysterious house help into their home. As strange events unfold, they must rely on faith and prayer to uncover the truth and fight for their survival.",
    thumbnail: ytThumb("QafCUG04yGs"),
    youtubeId: "QafCUG04yGs",
    producers: "The Winlos Studio",
    status: "Now Streaming",
  },
  {
    id: "spirituals-3",
    title: "Spirituals 3",
    category: "film",
    categoryLabel: "Film",
    year: "2026",
    role: "DOP, Gaffer, VFX Artist",
    description:
      "Inare's life is plagued by repeated failures caused by ancestral spiritual influences — until she confronts the past and finds freedom.",
    synopsis:
      "Spirituals 3 follows Enare, a young woman whose life is plagued by repeated failures caused by ancestral spiritual influences. Through faith, prayer, and revelation, she confronts the past and finds freedom from the forces holding her back.",
    thumbnail: ytThumb("pRPFMJXefv0"),
    youtubeId: "pRPFMJXefv0",
    producers: "The Winlos Studio",
    status: "Now Streaming",
  },
  {
    id: "spirituals-4",
    title: "Spirituals 4",
    category: "film",
    categoryLabel: "Film",
    year: "2026",
    role: "DOP, Gaffer, VFX Artist",
    description:
      "A young girl's life takes a dark turn after receiving a mysterious doll tied to occult practices — igniting a battle between darkness and faith.",
    synopsis:
      "Spirituals 4 centers on a young girl whose life takes a dark turn after receiving a mysterious doll tied to occult practices. As danger grows within her family, a battle between darkness and faith unfolds, leading to a powerful moment of deliverance and redemption.",
    thumbnail: ytThumb("y41jI31M-3Y"),
    youtubeId: "y41jI31M-3Y",
    producers: "The Winlos Studio",
    status: "Now Streaming",
  },

  // ═══════════════════════════════════════
  //  TELEVISION  (placeholder — awaiting content)
  // ═══════════════════════════════════════
  {
    id: "the-distance",
    title: "The Distance",
    category: "television",
    categoryLabel: "Television",
    year: "2025",
    role: "Director / Showrunner",
    description:
      "A six-part limited series exploring the lives of long-distance runners across three continents.",
    thumbnail: "/dwindik/4.jpeg",
    producers: "Cre8te Studios",
    status: "Coming Soon",
  },

  // ═══════════════════════════════════════
  //  NONFICTION  (placeholder — awaiting content)
  // ═══════════════════════════════════════
  {
    id: "still-here",
    title: "Still Here",
    category: "nonfiction",
    categoryLabel: "Nonfiction",
    year: "2025",
    role: "Director / Producer",
    description:
      "A documentary examining resilience and community rebuilding in post-industrial communities.",
    thumbnail: "/dwindik/3.jpeg",
    producers: "Cre8te Studios",
    status: "Coming Soon",
  },

  // ═══════════════════════════════════════
  //  AUDIO  (placeholder — awaiting content)
  // ═══════════════════════════════════════
  {
    id: "in-frame",
    title: "In Frame",
    category: "audio",
    categoryLabel: "Audio",
    year: "2025",
    role: "Creator / Host",
    description:
      "A podcast exploring the craft of visual storytelling — conversations with filmmakers and visual artists.",
    thumbnail: "/dwindik/4.jpeg",
    status: "Coming Soon",
  },

  // ═══════════════════════════════════════
  //  MUSIC
  // ═══════════════════════════════════════
  {
    id: "story-of-my-life",
    title: "Story of My Life",
    category: "music",
    categoryLabel: "Music",
    year: "2025",
    role: "Artist / Director / Music Video ",
    description:
      "Official music video and soundtrack single from Prophet Suddenly 3. A collaboration between The Winlos and Dwindik.",
    thumbnail: ytThumb("cGXFnDloUCg"),
    youtubeId: "cGXFnDloUCg",
    producers: "The Winlos x Dwindik",
    status: "Out Now",
  },
];

export const getProjectsByCategory = (category: ProjectCategory) =>
  projects.filter((p) => p.category === category);

export const getProjectById = (id: string) =>
  projects.find((p) => p.id === id);

export const getLatestProjects = (count: number = 5) =>
  [...projects]
    .sort((a, b) => parseInt(b.year) - parseInt(a.year))
    .slice(0, count);

export const categories: { key: ProjectCategory; label: string }[] = [
  { key: "film", label: "Film" },
  { key: "television", label: "Television" },
  { key: "nonfiction", label: "Nonfiction" },
  { key: "audio", label: "Audio" },
  { key: "music", label: "Music" },
];
