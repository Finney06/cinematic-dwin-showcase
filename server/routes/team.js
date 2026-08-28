import pool from "../db.js";
import { createCollectionRouter } from "../utils/collection.js";

/**
 * Team members — the About page's grid. Empty by design until CRA8 has people
 * to list; the About page simply omits the section while this is empty.
 */
export default createCollectionRouter({
  table: "team_members",
  entity: "team member",
  slugSource: "name",
  // A saved row is a live row — no draft state to explain.
  publishable: false,
  jsonColumns: ["links"],
  order: "sort_order ASC, id ASC",
  columns: {
    slug: { type: "text", default: "" },
    name: { type: "text", default: "" },
    role: { type: "text", default: "" },
    bio: { type: "text", default: "" },
    image: { type: "text", default: "" },
    links: { type: "json", default: [] },
    sort_order: { type: "int", default: 0 },
    published: { type: "bool", default: 1 },
  },
})(pool);
