export type ProjectCategory = "films" | "commercials" | "music-videos";

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
}

export const projects: Project[] = [
  {
    id: "echoes-of-light",
    title: "Echoes of Light",
    category: "films",
    categoryLabel: "Film",
    year: "2025",
    role: "Director / Cinematographer",
    description: "A contemplative short film exploring memory and loss through the interplay of light and shadow. Shot on 35mm across remote coastal landscapes.",
    thumbnail: "/placeholder.svg",
  },
  {
    id: "the-quiet-hours",
    title: "The Quiet Hours",
    category: "films",
    categoryLabel: "Film",
    year: "2024",
    role: "Director",
    description: "An intimate portrait of solitude in the modern city. Premiered at the Berlin International Film Festival.",
    thumbnail: "/placeholder.svg",
  },
  {
    id: "beneath-still-water",
    title: "Beneath Still Water",
    category: "films",
    categoryLabel: "Film",
    year: "2023",
    role: "Director / Writer",
    description: "A psychological drama set in the Scottish Highlands. Selected for Cannes Court Métrage.",
    thumbnail: "/placeholder.svg",
  },
  {
    id: "noir-meridian",
    title: "Noir Meridian",
    category: "commercials",
    categoryLabel: "Commercial",
    year: "2025",
    role: "Director",
    description: "A luxury fragrance campaign for Meridian. Cinematic storytelling meets high fashion in monochrome.",
    thumbnail: "/placeholder.svg",
  },
  {
    id: "atlas-motors",
    title: "Atlas Motors",
    category: "commercials",
    categoryLabel: "Commercial",
    year: "2024",
    role: "Director / Creative Director",
    description: "Global launch campaign for Atlas Motors' electric flagship. Shot across three continents.",
    thumbnail: "/placeholder.svg",
  },
  {
    id: "void-resonance",
    title: "Void / Resonance",
    category: "music-videos",
    categoryLabel: "Music Video",
    year: "2025",
    role: "Director",
    description: "Official music video for KAEL. A single-take descent into abstraction and rhythm.",
    thumbnail: "/placeholder.svg",
  },
  {
    id: "pulse",
    title: "Pulse",
    category: "music-videos",
    categoryLabel: "Music Video",
    year: "2024",
    role: "Director / VFX",
    description: "A visual experiment blending practical effects with digital compositing for artist Sova.",
    thumbnail: "/placeholder.svg",
  },
  {
    id: "after-dark",
    title: "After Dark",
    category: "music-videos",
    categoryLabel: "Music Video",
    year: "2023",
    role: "Director",
    description: "Nocturnal Tokyo through the lens of movement and neon. For electronic duo Onyx.",
    thumbnail: "/placeholder.svg",
  },
];

export const getProjectsByCategory = (category: ProjectCategory) =>
  projects.filter((p) => p.category === category);

export const getProjectById = (id: string) =>
  projects.find((p) => p.id === id);

export const categories: { key: ProjectCategory; label: string }[] = [
  { key: "films", label: "Films" },
  { key: "commercials", label: "Commercials" },
  { key: "music-videos", label: "Music Videos" },
];
