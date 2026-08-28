import type { MenuItem } from "@/lib/api";

/**
 * CRA8 brand identity.
 *
 * These values are owned by the codebase rather than by the CMS: they are the
 * company's identity, not editable page content. Everything else (projects,
 * hero media, page copy, contact details) comes from the admin panel and is
 * trusted as-is once saved — these are only the fallbacks shown when a CMS
 * field is genuinely empty (a fresh, unseeded database).
 */
export const BRAND = {
  name: "CRA8",
  tagline: "Spiritual Drama",
  siteTitle: "CRA8",
  /** The wordmark that takes the hero circle once the opening clip has run. */
  logo: "/CRA8.png",
  /**
   * Opening clip for the hero circle — a cut from the CRA8 slate, which plays
   * through before the logo takes over. Overridable in Admin → Hero, which also
   * accepts a YouTube link (watch, youtu.be or /shorts/, plus `?t=45` to open on
   * a given moment) if the clip should come from the channel instead of a file.
   */
  heroClip: "/trillar-video.mp4",
  /** Producing partner on the slate — CRA8 is credited for craft, not production. */
  collaborator: "The Winlos Media Ministry",
  get copyright() {
    return `©${new Date().getFullYear()} CRA8. All rights reserved.`;
  },
} as const;

/**
 * Menu shown when the CMS has no visible menu items (fresh database, or the
 * backend is unreachable). The live menu is still managed in Admin → Menu.
 */
export const DEFAULT_MENU: MenuItem[] = [
  { id: -1, label: "Work", path: "/work", page_type: "page", sort_order: 1, visible: 1 },
  { id: -2, label: "Services", path: "/services", page_type: "page", sort_order: 2, visible: 1 },
  { id: -3, label: "Journal", path: "/journal", page_type: "page", sort_order: 3, visible: 1 },
  { id: -4, label: "About", path: "/about", page_type: "page", sort_order: 4, visible: 1 },
  { id: -5, label: "Contact", path: "/contact", page_type: "page", sort_order: 5, visible: 1 },
];

/**
 * Trims a CMS string field, returning "" when it's empty/whitespace/null.
 * Callers pair this with `|| <default>` — the CMS value is trusted verbatim
 * whenever it's present. A database that still holds DWINDIK-era content is
 * fixed once, at the source, via `server/rebrand-cra8.js` — never by having
 * the render layer guess and override what an editor actually saved.
 */
export function orEmpty(value?: string | null): string {
  return (value ?? "").trim();
}
