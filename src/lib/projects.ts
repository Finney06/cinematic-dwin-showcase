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

const placeholderDescriptions: Record<ProjectCategory, string> = {
  films:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  commercials:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  "music-videos":
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi.",
};

export const projects: Project[] = [
  {
    id: "echoes-of-light",
    title: "Echoes of Light",
    category: "films",
    categoryLabel: "Film",
    year: "2025",
    role: "Director / Cinematographer",
    description: placeholderDescriptions.films,
    thumbnail: "/placeholder.svg",
  },
  {
    id: "the-quiet-hours",
    title: "The Quiet Hours",
    category: "films",
    categoryLabel: "Film",
    year: "2024",
    role: "Director",
    description: placeholderDescriptions.films,
    thumbnail: "/placeholder.svg",
  },
  {
    id: "beneath-still-water",
    title: "Beneath Still Water",
    category: "films",
    categoryLabel: "Film",
    year: "2023",
    role: "Director / Writer",
    description: placeholderDescriptions.films,
    thumbnail: "/placeholder.svg",
  },
  {
    id: "noir-meridian",
    title: "Noir Meridian",
    category: "commercials",
    categoryLabel: "Commercial",
    year: "2025",
    role: "Director",
    description: placeholderDescriptions.commercials,
    thumbnail: "/placeholder.svg",
  },
  {
    id: "atlas-motors",
    title: "Atlas Motors",
    category: "commercials",
    categoryLabel: "Commercial",
    year: "2024",
    role: "Director / Creative Director",
    description: placeholderDescriptions.commercials,
    thumbnail: "/placeholder.svg",
  },
  {
    id: "void-resonance",
    title: "Void / Resonance",
    category: "music-videos",
    categoryLabel: "Music Video",
    year: "2025",
    role: "Director",
    description: placeholderDescriptions["music-videos"],
    thumbnail: "/placeholder.svg",
  },
  {
    id: "pulse",
    title: "Pulse",
    category: "music-videos",
    categoryLabel: "Music Video",
    year: "2024",
    role: "Director / VFX",
    description: placeholderDescriptions["music-videos"],
    thumbnail: "/placeholder.svg",
  },
  {
    id: "after-dark",
    title: "After Dark",
    category: "music-videos",
    categoryLabel: "Music Video",
    year: "2023",
    role: "Director",
    description: placeholderDescriptions["music-videos"],
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
