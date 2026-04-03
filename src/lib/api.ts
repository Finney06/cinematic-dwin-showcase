const API_BASE = "/api";

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }

  return res.json();
}

// ─── Projects ────────────────────────────────────────────────
export interface ProjectData {
  id: string;
  title: string;
  category: string;
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

export function fetchProjects(category?: string): Promise<ProjectData[]> {
  const params = category ? `?category=${category}` : "";
  return request(`/projects${params}`);
}

export function fetchProject(id: string): Promise<ProjectData> {
  return request(`/projects/${id}`);
}

export function fetchLatestProjects(count = 5): Promise<ProjectData[]> {
  return request(`/projects/latest?count=${count}`);
}

// ─── Content ─────────────────────────────────────────────────
export interface HeroContent {
  id?: number;
  brand_text: string;
  tagline: string;
  video_url: string;
  hero_image: string;
  hero_link: string;
}

export interface AboutContent {
  heroImage: string;
  title: string;
  subtitle: string;
  bioIntro: string;
  bioParagraphs: string[];
  galleryImages: string[];
  craftQuote: string;
  craftSkills: { title: string; description: string }[];
  fullWidthImage: string;
  productionCompany: {
    name: string;
    description: string;
    collaborator: string;
  };
  portraitImage: string;
  sections?: { heading: string; body: string }[];
  cta?: { label: string; url: string };
}

export interface SiteSettings {
  contact_email: string;
  social_instagram: string;
  social_youtube: string;
  social_twitter: string;
  social_links?: string;
  font_display?: string;
  font_body?: string;
  copyright_text: string;
  site_title: string;
  [key: string]: string;
}

export interface MenuItem {
  id: number;
  label: string;
  path: string;
  page_type: string;
  sort_order: number;
  visible: number;
}

export interface AuditLog {
  id: number;
  username: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: Record<string, unknown>;
  ip: string;
  created_at: string;
}

export function fetchHeroContent(): Promise<HeroContent> {
  return request("/content/hero");
}

export function fetchAboutContent(): Promise<{ page_slug: string; title: string; content: AboutContent }> {
  return request("/content/about");
}

export function fetchSiteSettings(): Promise<SiteSettings> {
  return request("/content/settings");
}

export function fetchMenuItems(all = false): Promise<MenuItem[]> {
  return request(`/menu${all ? "?all=true" : ""}`);
}

export function fetchPageContent(slug: string): Promise<{ page_slug: string; title: string; content: Record<string, unknown> }> {
  return request(`/content/page/${slug}`);
}

export function fetchAuditLogs(limit = 20): Promise<AuditLog[]> {
  const token = localStorage.getItem("admin_token");
  return request(`/admin/audit?limit=${limit}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}
