import type { QueryClient } from "@tanstack/react-query";

/**
 * Query behaviour for the admin.
 *
 * The admin is the one place where stale data is actively harmful: if Dwindik
 * adds a category and the project editor's dropdown hasn't noticed, the tool
 * looks broken. So admin screens never serve from cache without revalidating,
 * and refresh whenever the tab is focused again.
 */
export const ADMIN_QUERY = {
  staleTime: 0,
  refetchOnMount: "always",
  refetchOnWindowFocus: true,
} as const;

/**
 * Refresh everything after a write.
 *
 * Content is cross-linked — a project changes a category's count, which changes
 * the site's navigation, which changes what the Pages editor lists — so
 * invalidating individual keys means remembering every one of those links, and
 * one forgotten key shows up as a screen that silently won't update. The data
 * here is small and there is exactly one editor, so refreshing everything is
 * both cheaper to reason about and impossible to get wrong.
 */
export function invalidateContent(queryClient: QueryClient) {
  return queryClient.invalidateQueries();
}
