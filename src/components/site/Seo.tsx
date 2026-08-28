import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useSiteSettings } from "@/hooks/useContent";
import { BRAND, orEmpty } from "@/lib/brand";

interface SeoProps {
  /** Page name. Rendered as "<title> | CRA8" unless `absoluteTitle` is set. */
  title?: string;
  description?: string;
  /** Absolute or root-relative image URL for link previews. */
  image?: string;
  /** "article" for Journal entries and project pages, "website" elsewhere. */
  type?: "website" | "article";
  /** Use the title exactly as given, without the " | CRA8" suffix. */
  absoluteTitle?: boolean;
  /** Keep a draft or 404 out of search results. */
  noIndex?: boolean;
}

const upsertMeta = (selector: string, attribute: "name" | "property", key: string, content: string) => {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
};

const absoluteUrl = (value: string) => {
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  if (typeof window === "undefined") return value;
  return `${window.location.origin}${value.startsWith("/") ? "" : "/"}${value}`;
};

/**
 * Per-page document head. Every page passes what the CMS holds for it and
 * falls back to the site defaults, so an editor changing a page's SEO fields
 * in the admin is the only thing needed to change what search and social show.
 *
 * This is client-rendered, which crawlers that run JavaScript (Google, Bing)
 * read fine. `index.html` carries the static defaults for those that don't.
 */
const Seo = ({ title, description, image, type = "website", absoluteTitle, noIndex }: SeoProps) => {
  const { pathname } = useLocation();
  const { data: settings } = useSiteSettings();

  const siteName = orEmpty(settings?.site_title) || BRAND.siteTitle;
  const fallbackDescription =
    orEmpty(settings?.site_description) ||
    "CRA8 is a Nigerian film studio working in spiritual drama and thriller — cinematography, editing, visual effects and sound design.";

  const resolvedTitle = title
    ? absoluteTitle
      ? title
      : `${title} | ${siteName}`
    : `${siteName} — Film Studio`;
  const resolvedDescription = (description || "").trim() || fallbackDescription;
  const resolvedImage = absoluteUrl(image || orEmpty(settings?.social_share_image) || BRAND.logo);

  useEffect(() => {
    document.title = resolvedTitle;

    const canonical = typeof window === "undefined" ? "" : `${window.location.origin}${pathname}`;

    upsertMeta('meta[name="description"]', "name", "description", resolvedDescription);
    upsertMeta('meta[name="robots"]', "name", "robots", noIndex ? "noindex,nofollow" : "index,follow");

    upsertMeta('meta[property="og:title"]', "property", "og:title", resolvedTitle);
    upsertMeta('meta[property="og:description"]', "property", "og:description", resolvedDescription);
    upsertMeta('meta[property="og:type"]', "property", "og:type", type);
    upsertMeta('meta[property="og:site_name"]', "property", "og:site_name", siteName);
    if (canonical) upsertMeta('meta[property="og:url"]', "property", "og:url", canonical);
    if (resolvedImage) upsertMeta('meta[property="og:image"]', "property", "og:image", resolvedImage);

    upsertMeta('meta[name="twitter:card"]', "name", "twitter:card", "summary_large_image");
    upsertMeta('meta[name="twitter:title"]', "name", "twitter:title", resolvedTitle);
    upsertMeta('meta[name="twitter:description"]', "name", "twitter:description", resolvedDescription);
    if (resolvedImage) upsertMeta('meta[name="twitter:image"]', "name", "twitter:image", resolvedImage);

    if (canonical) {
      let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
      if (!link) {
        link = document.createElement("link");
        link.rel = "canonical";
        document.head.appendChild(link);
      }
      link.href = canonical;
    }
  }, [resolvedTitle, resolvedDescription, resolvedImage, type, siteName, pathname, noIndex]);

  return null;
};

export default Seo;
