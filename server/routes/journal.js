import pool from "../db.js";
import { createCollectionRouter } from "../utils/collection.js";

/**
 * Journal — CRA8's own writing: behind the scenes, director stories, creative
 * process, campaign launches, culture, studio news. `kicker` is the section
 * label shown above a title; it is free text so new sections need no code.
 *
 * Articles start unpublished (`published: 0`) so a half-written entry is never
 * live by accident.
 */
export default createCollectionRouter({
  table: "articles",
  entity: "article",
  slugSource: "title",
  jsonColumns: ["blocks"],
  // Newest first, with an editor-set order as the tie-breaker.
  order: "featured DESC, published_at DESC NULLS LAST, sort_order ASC, id DESC",
  columns: {
    slug: { type: "text", default: "" },
    title: { type: "text", default: "" },
    kicker: { type: "text", default: "" },
    excerpt: { type: "text", default: "" },
    cover_image: { type: "text", default: "" },
    author: { type: "text", default: "" },
    published_at: { type: "date", default: null },
    blocks: { type: "json", default: [] },
    featured: { type: "bool", default: 0 },
    sort_order: { type: "int", default: 0 },
    published: { type: "bool", default: 0 },
    seo_title: { type: "text", default: "" },
    seo_description: { type: "text", default: "" },
  },
})(pool);
