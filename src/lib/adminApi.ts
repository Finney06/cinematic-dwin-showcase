import type { ProjectData, HeroContent, AboutContent, SiteSettings, MenuItem } from "./api";

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

export function updatePageContent(slug: string, data: { title?: string; content?: Record<string, unknown> }) {
  return adminRequest<{ message: string }>(`/admin/content/page/${slug}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
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
