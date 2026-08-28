import type { PageBlock } from "@/lib/pageBlocks";

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, "");

/**
 * An API failure the UI can branch on. `status === 404` means "this doesn't
 * exist" (render a 404 page); `status === 0` means the request never reached
 * the backend (render a retryable error, not a 404 — the content may be fine).
 */
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export const isNotFound = (error: unknown) => error instanceof ApiError && error.status === 404;

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${endpoint}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
  } catch {
    throw new ApiError("Could not reach the server. Check your connection and try again.", 0);
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "Request failed" }));
    throw new ApiError(body.error || `HTTP ${res.status}`, res.status);
  }

  return res.json();
}

// ─── Content model ───────────────────────────────────────────
/**
 * Everything the site renders comes from one of these shapes. They mirror the
 * database tables one-to-one — see `server/db.js` for the schema and how the
 * pieces relate.
 */

/** A URL with editable copy: a system page (/work, /about…) or a custom one. */
export interface PageContent {
  page_slug: string;
  title: string;
  content: Record<string, unknown>;
  /** 0 hides the page from the public site without deleting it. */
  published: number;
  /** 1 for pages the app renders with its own layout — these can't be deleted. */
  is_system: number;
  seo_title: string;
  seo_description: string;
  seo_image: string;
  updated_at?: string | null;
}

/** A section of the slate. Its slug is both the project filter and the URL. */
export interface CategoryData {
  id: number;
  slug: string;
  label: string;
  description: string;
  hero_image: string;
  sort_order: number;
  published: number;
  /** Published projects filed under this category. */
  project_count?: number;
}

/** A Journal entry at /journal/:slug. */
export interface Article {
  id: number;
  slug: string;
  title: string;
  /** Section label above the title — "Behind the Scenes", "Culture", … */
  kicker: string;
  excerpt: string;
  cover_image: string;
  author: string;
  published_at: string | null;
  blocks: PageBlock[];
  featured: number;
  sort_order: number;
  published: number;
  seo_title: string;
  seo_description: string;
  created_at?: string;
  updated_at?: string;
}

/** One entry on the Services page. */
export interface Service {
  id: number;
  slug: string;
  title: string;
  summary: string;
  description: string;
  image: string;
  capabilities: string[];
  sort_order: number;
  published: number;
}

/** One person in the About page's team grid. */
export interface TeamMember {
  id: number;
  slug: string;
  name: string;
  role: string;
  bio: string;
  image: string;
  links: { label: string; url: string }[];
  sort_order: number;
  published: number;
}

/** A Contact form submission, read in Admin → Messages. */
export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  topic: string;
  message: string;
  status: "new" | "read" | "archived";
  created_at: string;
}

// ─── Projects ────────────────────────────────────────────────
/** One line of a project's credit block — the role and who did it. */
export interface ProjectCredit {
  role: string;
  name: string;
}

export interface ProjectData {
  id: string;
  title: string;
  category: string;
  category_label: string;
  year: string;
  role: string;
  description: string;
  synopsis: string;
  /** One-sentence hook, shown under the title on the project page. */
  logline: string;
  thumbnail: string;
  youtube_id: string;
  /** Short trailer, played ambiently. Empty means "link out to the full film". */
  trailer_youtube_id: string;
  director: string;
  producers: string;
  cast_info: string;
  status: string;
  /** Free-form credits — any role, added in the project editor. */
  credits: ProjectCredit[];
  /** Stills, shown as a gallery below the synopsis. */
  gallery: string[];
  /** The same stackable blocks every page uses, for anything extra. */
  blocks: PageBlock[];
  seo_description: string;
  published: number;
  /** The single project that opens Work and its own category page. */
  featured: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export function fetchProjects(category?: string): Promise<ProjectData[]> {
  const params = category ? `?category=${encodeURIComponent(category)}` : "";
  return request(`/projects${params}`);
}

export function fetchProject(id: string): Promise<ProjectData> {
  return request(`/projects/${encodeURIComponent(id)}`);
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
  /** "flow" | "halo" | "off" — which light treatment plays behind the circle. */
  hero_atmosphere?: string;
  /** Brightness multiplier for that treatment's glow, as a string (e.g. "1.4"). */
  hero_atmosphere_intensity?: string;
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
  animation_enabled?: string;
  animation_preset?: string;
  animation_speed?: string;
  animation_section_page_transition?: string;
  animation_section_page_transition_profile?: string;
  animation_section_page_transition_duration?: string;
  animation_section_page_transition_delay?: string;
  animation_section_page_transition_distance?: string;
  animation_section_category_pages?: string;
  animation_section_category_pages_profile?: string;
  animation_section_category_pages_duration?: string;
  animation_section_category_pages_delay?: string;
  animation_section_category_pages_distance?: string;
  animation_section_navbar?: string;
  animation_section_navbar_profile?: string;
  animation_section_navbar_duration?: string;
  animation_section_navbar_delay?: string;
  animation_section_navbar_distance?: string;
  animation_section_footer?: string;
  animation_section_footer_profile?: string;
  animation_section_footer_duration?: string;
  animation_section_footer_delay?: string;
  animation_section_footer_distance?: string;
  animation_section_home_hero?: string;
  animation_section_home_hero_profile?: string;
  animation_section_home_hero_duration?: string;
  animation_section_home_hero_delay?: string;
  animation_section_home_hero_distance?: string;
  animation_section_project_detail?: string;
  animation_section_project_detail_profile?: string;
  animation_section_project_detail_duration?: string;
  animation_section_project_detail_delay?: string;
  animation_section_project_detail_distance?: string;
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

export function fetchHeroContent(): Promise<HeroContent> {
  return request("/content/hero");
}

export function fetchAboutContent(): Promise<Omit<PageContent, "content"> & { content: AboutContent }> {
  return request("/content/about");
}

export function fetchSiteSettings(): Promise<SiteSettings> {
  return request("/content/settings");
}

export function fetchMenuItems(all = false): Promise<MenuItem[]> {
  return request(`/menu${all ? "?all=true" : ""}`);
}

export function fetchPageContent(slug: string): Promise<PageContent> {
  return request(`/content/page/${encodeURIComponent(slug)}`);
}

export function fetchPages(): Promise<PageContent[]> {
  return request("/content/pages");
}

// ─── Categories ──────────────────────────────────────────────
export function fetchCategories(): Promise<CategoryData[]> {
  return request("/categories");
}

// ─── Journal ─────────────────────────────────────────────────
export function fetchArticles(): Promise<Article[]> {
  return request("/journal");
}

export function fetchArticle(slug: string): Promise<Article> {
  return request(`/journal/${encodeURIComponent(slug)}`);
}

// ─── Services ────────────────────────────────────────────────
export function fetchServices(): Promise<Service[]> {
  return request("/services");
}

// ─── Team ────────────────────────────────────────────────────
export function fetchTeam(): Promise<TeamMember[]> {
  return request("/team");
}

// ─── Contact ─────────────────────────────────────────────────
export function submitContactMessage(payload: {
  name: string;
  email: string;
  topic: string;
  message: string;
  /** Honeypot — always sent empty by the real form. */
  company?: string;
}): Promise<{ message: string }> {
  return request("/contact", { method: "POST", body: JSON.stringify(payload) });
}
