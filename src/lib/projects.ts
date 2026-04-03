export type ProjectCategory = "film" | "television" | "nonfiction" | "audio" | "music" | "commercials" | "news" | "internship";

export interface Project {
  id: string;
  title: string;
  category: ProjectCategory;
  category_label: string;
  year: string;
  role: string;
  description: string;
  synopsis: string;
  thumbnail: string;
  youtube_id: string;
  director: string;
  producers: string;
  cast_info: string;
  status: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export const categories: { key: ProjectCategory; label: string }[] = [
  { key: "film", label: "Film" },
  { key: "television", label: "Television" },
  { key: "nonfiction", label: "Nonfiction" },
  { key: "audio", label: "Audio" },
  { key: "music", label: "Music" },
  { key: "commercials", label: "Commercials" },
  { key: "news", label: "News" },
  { key: "internship", label: "Internship" },
];
