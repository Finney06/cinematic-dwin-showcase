/**
 * Dates come from the CMS as `YYYY-MM-DD` (or null). Format them for display
 * without ever throwing on a blank or malformed value — a bad date should cost
 * a dateline, not the page.
 */
export function formatDate(value?: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

/** Machine-readable form for <time dateTime>. */
export function isoDate(value?: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}
