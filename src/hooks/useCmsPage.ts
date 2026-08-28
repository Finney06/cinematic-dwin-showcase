import { usePageContent } from "@/hooks/useContent";
import { readBlocks, type PageBlock } from "@/lib/pageBlocks";
import { isNotFound, type PageContent } from "@/lib/api";

export interface CmsPage {
  /** Heading to render. The CMS title wins; `fallbackTitle` covers a fresh DB. */
  title: string;
  /** Short lead paragraph under the masthead. */
  intro: string;
  /** Small wide-tracked label above the title. */
  eyebrow: string;
  blocks: PageBlock[];
  /** Whatever else the page's JSON holds — for page-specific fields. */
  content: Record<string, unknown>;
  seo: { title: string; description: string; image: string };
  /**
   * True once the page is confirmed unpublished — the request 404'd rather
   * than merely failing to reach the server. A page component with its own
   * route (Work, Services, Journal, Contact) uses this to render the site's
   * 404 page instead of quietly falling back to empty defaults, which is what
   * makes "Draft" in Admin → Pages actually take the page offline.
   */
  isUnpublished: boolean;
  published: boolean;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

const readString = (content: Record<string, unknown>, key: string) => {
  const value = content[key];
  return typeof value === "string" ? value.trim() : "";
};

/**
 * Reads one `page_content` row into the shape a page actually renders.
 *
 * Every field falls back only when the CMS value is genuinely empty, so a
 * fresh database still shows a complete page and an editor's saved value is
 * always used verbatim. Pages call this instead of touching the query directly,
 * which keeps the "what does the CMS control" answer in one place.
 */
export function useCmsPage(slug: string, fallbackTitle = ""): CmsPage {
  const { data, isLoading, isError, error, refetch } = usePageContent(slug);
  const page = data as PageContent | undefined;
  const content = (page?.content || {}) as Record<string, unknown>;

  return {
    title: (page?.title || "").trim() || fallbackTitle,
    intro: readString(content, "intro"),
    eyebrow: readString(content, "eyebrow") || readString(content, "subtitle"),
    blocks: readBlocks(content),
    content,
    seo: {
      title: (page?.seo_title || "").trim() || (page?.title || "").trim() || fallbackTitle,
      description: (page?.seo_description || "").trim() || readString(content, "intro"),
      image: (page?.seo_image || "").trim(),
    },
    published: page ? page.published !== 0 : true,
    isUnpublished: isNotFound(error),
    isLoading,
    isError,
    refetch: () => void refetch(),
  };
}
