import type {
  Article,
  CategoryData,
  ContactMessage,
  HeroContent,
  AboutContent,
  MenuItem,
  PageContent,
  ProjectData,
  Service,
  SiteSettings,
  TeamMember,
} from "./api";

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, "");

function getToken(): string | null {
  return localStorage.getItem("admin_token");
}

export function setToken(token: string) {
  localStorage.setItem("admin_token", token);
}

export function clearToken() {
  localStorage.removeItem("admin_token");
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

async function adminRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });

  if (res.status === 401) {
    clearToken();
    window.location.href = "/admin/login?reason=session-expired";
    throw new Error("Session expired");
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }

  return res.json();
}

// ─── Auth ────────────────────────────────────────────────────
export function login(username: string, password: string) {
  return adminRequest<{ token: string; user: { id: number; username: string } }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export function getMe() {
  return adminRequest<{ id: number; username: string }>("/auth/me");
}

export function changePassword(currentPassword: string, newPassword: string) {
  return adminRequest<{ message: string }>("/auth/change-password", {
    method: "PUT",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

// ─── Projects ────────────────────────────────────────────────
/** The admin list includes unpublished work; the public one never does. */
export function fetchAdminProjects(category?: string) {
  const params = new URLSearchParams({ all: "true" });
  if (category) params.set("category", category);
  return adminRequest<ProjectData[]>(`/admin/projects?${params}`);
}

export function fetchAdminProject(id: string) {
  return adminRequest<ProjectData>(`/admin/projects/${encodeURIComponent(id)}?draft=true`);
}

export function createProject(data: Partial<ProjectData>) {
  return adminRequest<ProjectData>("/admin/projects", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateProject(id: string, data: Partial<ProjectData>) {
  return adminRequest<ProjectData>(`/admin/projects/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteProject(id: string) {
  return adminRequest<{ message: string }>(`/admin/projects/${id}`, {
    method: "DELETE",
  });
}

export function reorderProjects(items: { id: string; sort_order: number }[]) {
  return adminRequest<{ message: string }>("/admin/projects/reorder", {
    method: "PUT",
    body: JSON.stringify({ items }),
  });
}

// ─── Content ─────────────────────────────────────────────────
export function updateAboutContent(content: AboutContent) {
  return adminRequest<{ message: string }>("/admin/content/about", {
    method: "PUT",
    body: JSON.stringify({ content }),
  });
}

export function updateHeroContent(data: Partial<HeroContent>) {
  return adminRequest<{ message: string }>("/admin/content/hero", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function updateSettings(settings: Partial<SiteSettings>) {
  return adminRequest<{ message: string }>("/admin/content/settings", {
    method: "PUT",
    body: JSON.stringify(settings),
  });
}

export function updatePageContent(
  slug: string,
  data: Partial<Omit<PageContent, "page_slug" | "published" | "is_system" | "updated_at">> & {
    published?: boolean | number;
  }
) {
  return adminRequest<PageContent>(`/admin/content/page/${encodeURIComponent(slug)}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// ─── Pages ───────────────────────────────────────────────────
export function fetchAdminPages() {
  return adminRequest<PageContent[]>("/admin/content/pages?all=true");
}

export function fetchAdminPage(slug: string) {
  return adminRequest<PageContent>(`/admin/content/page/${encodeURIComponent(slug)}?draft=true`);
}

export function createPage(data: {
  title: string;
  slug: string;
  published?: boolean;
  addToMenu?: boolean;
  content?: Record<string, unknown>;
}) {
  return adminRequest<PageContent>("/admin/content/pages", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function deletePage(slug: string) {
  return adminRequest<{ message: string }>(`/admin/content/page/${encodeURIComponent(slug)}`, {
    method: "DELETE",
  });
}

// ─── Categories ──────────────────────────────────────────────
export function fetchAdminCategories() {
  return adminRequest<CategoryData[]>("/admin/categories?all=true");
}

export function createCategory(data: Partial<CategoryData>) {
  return adminRequest<CategoryData>("/admin/categories", { method: "POST", body: JSON.stringify(data) });
}

export function updateCategory(id: number, data: Partial<CategoryData>) {
  return adminRequest<CategoryData>(`/admin/categories/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export function deleteCategory(id: number) {
  return adminRequest<{ message: string }>(`/admin/categories/${id}`, { method: "DELETE" });
}

export function reorderCategories(items: { id: number; sort_order: number }[]) {
  return adminRequest<{ message: string }>("/admin/categories/reorder", {
    method: "PUT",
    body: JSON.stringify({ items }),
  });
}

/**
 * Journal, Services and Team share one server implementation, so they share
 * one client too — `collection` is the API path segment.
 */
type CollectionName = "journal" | "services" | "team";

export function fetchCollection<T>(collection: CollectionName) {
  return adminRequest<T[]>(`/admin/${collection}?all=true`);
}

export function createCollectionItem<T>(collection: CollectionName, data: Partial<T>) {
  return adminRequest<T>(`/admin/${collection}`, { method: "POST", body: JSON.stringify(data) });
}

export function updateCollectionItem<T>(collection: CollectionName, id: number, data: Partial<T>) {
  return adminRequest<T>(`/admin/${collection}/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export function deleteCollectionItem(collection: CollectionName, id: number) {
  return adminRequest<{ message: string }>(`/admin/${collection}/${id}`, { method: "DELETE" });
}

export function reorderCollection(collection: CollectionName, items: { id: number; sort_order: number }[]) {
  return adminRequest<{ message: string }>(`/admin/${collection}/reorder`, {
    method: "PUT",
    body: JSON.stringify({ items }),
  });
}

export const fetchAdminArticles = () => fetchCollection<Article>("journal");
export const fetchAdminServices = () => fetchCollection<Service>("services");
export const fetchAdminTeam = () => fetchCollection<TeamMember>("team");

// ─── Messages ────────────────────────────────────────────────
export function fetchMessages() {
  return adminRequest<{ messages: ContactMessage[]; unread: number }>("/admin/contact");
}

export function updateMessageStatus(id: number, status: ContactMessage["status"]) {
  return adminRequest<ContactMessage>(`/admin/contact/${id}`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
}

export function deleteMessage(id: number) {
  return adminRequest<{ message: string }>(`/admin/contact/${id}`, { method: "DELETE" });
}

// ─── Menu ────────────────────────────────────────────────────
export function createMenuItem(data: Partial<MenuItem>) {
  return adminRequest<MenuItem>("/admin/menu", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateMenuItem(id: number, data: Partial<MenuItem>) {
  return adminRequest<MenuItem>(`/admin/menu/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteMenuItem(id: number) {
  return adminRequest<{ message: string }>(`/admin/menu/${id}`, {
    method: "DELETE",
  });
}

export function reorderMenuItems(items: { id: number; sort_order: number }[]) {
  return adminRequest<{ message: string }>("/admin/menu/reorder", {
    method: "PUT",
    body: JSON.stringify({ items }),
  });
}

// ─── Upload ──────────────────────────────────────────────────
export async function uploadFile(file: File): Promise<{ url: string }> {
  const token = getToken();
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/admin/upload`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Upload failed" }));
    throw new Error(error.error || "Upload failed");
  }

  return res.json();
}
