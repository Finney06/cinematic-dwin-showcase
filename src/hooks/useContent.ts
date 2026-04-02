import { useQuery } from "@tanstack/react-query";
import {
  fetchProjects,
  fetchProject,
  fetchLatestProjects,
  fetchHeroContent,
  fetchAboutContent,
  fetchSiteSettings,
  fetchMenuItems,
} from "@/lib/api";

export function useProjects(category?: string) {
  return useQuery({
    queryKey: ["projects", category],
    queryFn: () => fetchProjects(category),
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ["project", id],
    queryFn: () => fetchProject(id),
    enabled: !!id,
  });
}

export function useLatestProjects(count = 5) {
  return useQuery({
    queryKey: ["latestProjects", count],
    queryFn: () => fetchLatestProjects(count),
  });
}

export function useHeroContent() {
  return useQuery({
    queryKey: ["heroContent"],
    queryFn: fetchHeroContent,
  });
}

export function useAboutContent() {
  return useQuery({
    queryKey: ["aboutContent"],
    queryFn: fetchAboutContent,
  });
}

export function useSiteSettings() {
  return useQuery({
    queryKey: ["siteSettings"],
    queryFn: fetchSiteSettings,
  });
}

export function useMenuItems(all = false) {
  return useQuery({
    queryKey: ["menuItems", all],
    queryFn: () => fetchMenuItems(all),
  });
}
