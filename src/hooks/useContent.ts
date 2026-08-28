import { useQuery } from "@tanstack/react-query";
import {
  ApiError,
  fetchArticle,
  fetchArticles,
  fetchCategories,
  fetchProjects,
  fetchProject,
  fetchLatestProjects,
  fetchHeroContent,
  fetchAboutContent,
  fetchPages,
  fetchServices,
  fetchSiteSettings,
  fetchMenuItems,
  fetchPageContent,
  fetchTeam,
} from "@/lib/api";

/**
 * Read hooks for the public site. Everything a visitor sees comes through one
 * of these — there is no hardcoded content behind them.
 *
 * A 404 is a real answer ("no such article"), so it is never retried; anything
 * else gets one retry in case the backend was waking up.
 */
const retryUnlessMissing = (failureCount: number, error: unknown) => {
  if (error instanceof ApiError && error.status === 404) return false;
  return failureCount < 1;
};

/**
 * Public reads are cached briefly — long enough that browsing the site doesn't
 * refetch the same slate on every page, short enough that an editor who saves a
 * change and opens the live site sees it. The admin overrides this entirely
 * (see `lib/adminQueries.ts`) and never serves stale data.
 */
const STABLE = { staleTime: 60 * 1000, retry: retryUnlessMissing } as const;

export function useProjects(category?: string) {
  return useQuery({
    queryKey: ["projects", category ?? "all"],
    queryFn: () => fetchProjects(category),
    ...STABLE,
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ["project", id],
    queryFn: () => fetchProject(id),
    enabled: !!id,
    ...STABLE,
  });
}

export function useLatestProjects(count = 5) {
  return useQuery({
    queryKey: ["latestProjects", count],
    queryFn: () => fetchLatestProjects(count),
    ...STABLE,
  });
}

export function useHeroContent() {
  return useQuery({ queryKey: ["heroContent"], queryFn: fetchHeroContent, ...STABLE });
}

export function useAboutContent() {
  return useQuery({ queryKey: ["aboutContent"], queryFn: fetchAboutContent, ...STABLE });
}

export function useSiteSettings() {
  return useQuery({ queryKey: ["siteSettings"], queryFn: fetchSiteSettings, ...STABLE });
}

export function useMenuItems(all = false) {
  return useQuery({ queryKey: ["menuItems", all], queryFn: () => fetchMenuItems(all), ...STABLE });
}

export function usePageContent(slug: string) {
  return useQuery({
    queryKey: ["pageContent", slug],
    queryFn: () => fetchPageContent(slug),
    enabled: !!slug,
    ...STABLE,
  });
}

/** Every published page, used by the router to tell a real URL from a 404. */
export function usePages() {
  return useQuery({ queryKey: ["pages"], queryFn: fetchPages, ...STABLE });
}

export function useCategories() {
  return useQuery({ queryKey: ["categories"], queryFn: fetchCategories, ...STABLE });
}

export function useArticles() {
  return useQuery({ queryKey: ["articles"], queryFn: fetchArticles, ...STABLE });
}

export function useArticle(slug: string) {
  return useQuery({
    queryKey: ["article", slug],
    queryFn: () => fetchArticle(slug),
    enabled: !!slug,
    ...STABLE,
  });
}

export function useServices() {
  return useQuery({ queryKey: ["services"], queryFn: fetchServices, ...STABLE });
}

export function useTeam() {
  return useQuery({ queryKey: ["team"], queryFn: fetchTeam, ...STABLE });
}
