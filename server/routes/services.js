import pool from "../db.js";
import { createCollectionRouter } from "../utils/collection.js";

/**
 * Services — what CRA8 does, in the studio's own words. `capabilities` is a
 * plain list of strings rendered as a credit-style column beside the copy.
 */
export default createCollectionRouter({
  table: "services",
  entity: "service",
  slugSource: "title",
  // A saved row is a live row — no draft state to explain.
  publishable: false,
  jsonColumns: ["capabilities"],
  order: "sort_order ASC, id ASC",
  columns: {
    slug: { type: "text", default: "" },
    title: { type: "text", default: "" },
    summary: { type: "text", default: "" },
    description: { type: "text", default: "" },
    image: { type: "text", default: "" },
    capabilities: { type: "json", default: [] },
    sort_order: { type: "int", default: 0 },
    published: { type: "bool", default: 1 },
  },
})(pool);
