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
  stills?: string[];
  director?: string;
  producers?: string;
  cast?: string;
  watchUrl?: string;
}

export const projects: Project[] = [
  // ── FILM ──
  {
    id: "echoes-of-light",
    title: "Echoes of Light",
    category: "film",
    categoryLabel: "Film",
    year: "2025",
    role: "Director / Cinematographer",
    description:
      "A contemplative short film exploring memory and loss through the interplay of light and shadow. Shot on 35mm across remote coastal landscapes.",
    thumbnail: "/dwindik/1.jpeg",
    director: "Dwindik",
    producers: "Cre8te Studios",
    cast: "Ensemble cast",
  },
  {
    id: "the-quiet-hours",
    title: "The Quiet Hours",
    category: "film",
    categoryLabel: "Film",
    year: "2024",
    role: "Director",
    description:
      "An intimate portrait of solitude in the modern city. Premiered at the Berlin International Film Festival.",
    thumbnail: "/dwindik/2.jpeg",
    director: "Dwindik",
    producers: "Cre8te Studios",
  },
  {
    id: "beneath-still-water",
    title: "Beneath Still Water",
    category: "film",
    categoryLabel: "Film",
    year: "2023",
    role: "Director / Writer",
    description:
      "A psychological drama set in the Scottish Highlands. Selected for Cannes Court Métrage.",
    thumbnail: "/dwindik/3.jpeg",
    director: "Dwindik",
    producers: "Cre8te Studios, Highland Films",
  },

  // ── TELEVISION ──
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
    director: "Dwindik",
    producers: "Cre8te Studios, StreamVision",
  },
  {
    id: "inner-city",
    title: "Inner City",
    category: "television",
    categoryLabel: "Television",
    year: "2024",
    role: "Director",
    description:
      "Urban drama series following interconnected stories in a rapidly gentrifying neighbourhood.",
    thumbnail: "/dwindik/1.jpeg",
    director: "Dwindik",
    producers: "Cre8te Studios",
  },

  // ── NONFICTION ──
  {
    id: "still-here",
    title: "Still Here",
    category: "nonfiction",
    categoryLabel: "Nonfiction",
    year: "2025",
    role: "Director / Producer",
    description:
      "A documentary examining resilience and community rebuilding after natural disasters.",
    thumbnail: "/dwindik/3.jpeg",
    director: "Dwindik",
    producers: "Cre8te Studios, DocLight",
  },
  {
    id: "unwritten-rules",
    title: "Unwritten Rules",
    category: "nonfiction",
    categoryLabel: "Nonfiction",
    year: "2024",
    role: "Director",
    description:
      "An exploration of unspoken social codes across different cultures. Featured at Sundance.",
    thumbnail: "/dwindik/2.jpeg",
    director: "Dwindik",
    producers: "Cre8te Studios",
  },

  // ── AUDIO ──
  {
    id: "in-frame",
    title: "In Frame",
    category: "audio",
    categoryLabel: "Audio",
    year: "2025",
    role: "Creator / Host",
    description:
      "A podcast series exploring the craft of visual storytelling with filmmakers and cinematographers.",
    thumbnail: "/dwindik/4.jpeg",
    director: "Dwindik",
  },
  {
    id: "soundscape-sessions",
    title: "Soundscape Sessions",
    category: "audio",
    categoryLabel: "Audio",
    year: "2024",
    role: "Creator / Producer",
    description:
      "Immersive audio experiences blending field recordings with narrative storytelling.",
    thumbnail: "/dwindik/1.jpeg",
    director: "Dwindik",
  },

  // ── MUSIC ──
  {
    id: "void-resonance",
    title: "Void / Resonance",
    category: "music",
    categoryLabel: "Music",
    year: "2025",
    role: "Director",
    description:
      "Official music video for KAEL. A single-take descent into abstraction and rhythm.",
    thumbnail: "/dwindik/2.jpeg",
    director: "Dwindik",
  },
  {
    id: "pulse",
    title: "Pulse",
    category: "music",
    categoryLabel: "Music",
    year: "2024",
    role: "Director / VFX",
    description:
      "A visual experiment blending practical effects with digital compositing for artist Sova.",
    thumbnail: "/dwindik/3.jpeg",
    director: "Dwindik",
  },
  {
    id: "after-dark",
    title: "After Dark",
    category: "music",
    categoryLabel: "Music",
    year: "2023",
    role: "Director",
    description:
      "Nocturnal Tokyo through the lens of movement and neon. For electronic duo Onyx.",
    thumbnail: "/dwindik/4.jpeg",
    director: "Dwindik",
  },
];

export const getProjectsByCategory = (category: ProjectCategory) =>
  projects.filter((p) => p.category === category);

export const getProjectById = (id: string) =>
  projects.find((p) => p.id === id);

export const categories: { key: ProjectCategory; label: string }[] = [
  { key: "film", label: "Film" },
  { key: "television", label: "Television" },
  { key: "nonfiction", label: "Nonfiction" },
  { key: "audio", label: "Audio" },
  { key: "music", label: "Music" },
];
