/**
 * Stackable content blocks — the editable body of every page on the site.
 *
 * Stored as `content.blocks` on a `page_content` row, in display order. Every
 * public page reads the same shape, so one editor in Admin → Pages drives all
 * of them, and a brand-new page needs no code at all.
 *
 * Blocks are additive: a page that also has its own purpose-built content
 * (a category page's project grid, News' older subtitle/intro fields) keeps
 * rendering that too. Blocks never replace what a page already shows.
 */
export type PageBlock =
  | { type: "heading"; text: string }
  | { type: "text"; text: string }
  | { type: "image"; url: string; caption?: string }
  | { type: "gallery"; urls: string[]; caption?: string }
  | { type: "video"; url: string }
  | { type: "quote"; text: string; attribution?: string }
  | { type: "button"; label: string; url: string }
  | { type: "spacer"; size: "sm" | "md" | "lg" }
  | { type: "columns"; left: string; right: string };

export const BLOCK_TYPES: { type: PageBlock["type"]; label: string; hint: string }[] = [
  { type: "heading", label: "Heading", hint: "A section title" },
  { type: "text", label: "Text", hint: "A paragraph — blank lines start a new one" },
  { type: "quote", label: "Pull quote", hint: "An oversized line, optionally attributed" },
  { type: "image", label: "Image", hint: "One still, full width" },
  { type: "gallery", label: "Gallery", hint: "Two or more stills in a grid" },
  { type: "video", label: "Video", hint: "A YouTube link or an uploaded clip" },
  { type: "button", label: "Button", hint: "A link out, or to another page" },
  { type: "columns", label: "Two columns", hint: "Two paragraphs side by side" },
  { type: "spacer", label: "Spacer", hint: "Breathing room between sections" },
];

export function emptyBlock(type: PageBlock["type"]): PageBlock {
  switch (type) {
    case "heading":
      return { type: "heading", text: "" };
    case "text":
      return { type: "text", text: "" };
    case "image":
      return { type: "image", url: "", caption: "" };
    case "gallery":
      return { type: "gallery", urls: [], caption: "" };
    case "video":
      return { type: "video", url: "" };
    case "quote":
      return { type: "quote", text: "", attribution: "" };
    case "button":
      return { type: "button", label: "", url: "" };
    case "columns":
      return { type: "columns", left: "", right: "" };
    case "spacer":
      return { type: "spacer", size: "md" };
  }
}

/** True once a block has enough filled in to be worth rendering. */
export function isBlockFilled(block: PageBlock): boolean {
  switch (block.type) {
    case "heading":
    case "text":
    case "quote":
      return Boolean(block.text?.trim());
    case "image":
    case "video":
      return Boolean(block.url?.trim());
    case "gallery":
      return Boolean(block.urls?.some((url) => url?.trim()));
    case "button":
      return Boolean(block.label?.trim() && block.url?.trim());
    case "columns":
      return Boolean(block.left?.trim() || block.right?.trim());
    case "spacer":
      return true;
  }
}

/** Reads the block list off a page_content payload, whatever else it holds. */
export function readBlocks(content: unknown): PageBlock[] {
  const blocks = (content as { blocks?: unknown } | null | undefined)?.blocks;
  return Array.isArray(blocks) ? (blocks as PageBlock[]) : [];
}

const YOUTUBE_PATTERNS = [
  /youtu\.be\/([\w-]{6,})/,
  /\/shorts\/([\w-]{6,})/,
  /[?&]v=([\w-]{6,})/,
  /\/embed\/([\w-]{6,})/,
];

/** A video block accepts a YouTube link or a direct file URL. */
export function getYouTubeId(url?: string): string {
  if (!url) return "";
  for (const pattern of YOUTUBE_PATTERNS) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return "";
}
