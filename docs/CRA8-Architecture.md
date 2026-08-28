# CRA8 — Architecture notes

For whoever maintains this after handover. The editor-facing guide is
[CRA8-CMS-Handbook.md](CRA8-CMS-Handbook.md).

## Principle

Nothing a visitor can see is written in the code. Every page reads its content
from the CMS and falls back to a CRA8 default only when the field is genuinely
empty. The one exception is `src/lib/brand.ts` — the company's identity (name,
logo, default menu), which is not editable content.

## Content model

Defined in `server/db.js`, which is also the migration path: it runs
`CREATE TABLE IF NOT EXISTS` plus a list of `ADD COLUMN IF NOT EXISTS`
statements on every boot, so deploying and restarting is the whole upgrade.
Append to the bottom of `ADD_COLUMNS`; never edit a line above it.

| Table | Purpose |
|---|---|
| `projects` | The slate. `category` points at `categories.slug`; `featured` marks the one that opens a page. |
| `categories` | Sections. Each row is a route, a project filter and a dropdown option. |
| `page_content` | One row per URL that isn't a collection item: copy, blocks, SEO, published. |
| `articles` | Journal entries. |
| `services` | The Services page list. |
| `team_members` | The About page grid. |
| `contact_messages` | Contact form submissions. |
| `menu_items` | Navigation, pointing at any of the above by path. |
| `hero_content`, `site_settings`, `audit_logs`, `admin_users` | As before. |

`backfill()` in `db.js` handles data that predates a schema change — lifting
categories out of `projects.category`, marking system pages, adding the new
sections to an existing menu. Each check is idempotent.

## Routing

`src/App.tsx`. Purpose-built pages have explicit routes; everything else lands
on `/:slug` → `src/pages/SlugPage.tsx`, which resolves against live CMS data:

1. a category → redirect to `/work?category=<slug>`
2. a published page → `GenericPage`
3. a menu item pointing there with no content row yet → `GenericPage`
4. otherwise → 404

Disciplines have no page of their own. `Work` is the single slate page and the
discipline is a `?category=` search param on it, so a project can never appear
in two competing places. Categories carry no `page_content` row either, and
never appear in `AdminPages.tsx`'s entry list — their label, description and
hero image are the `categories` table's own columns, edited solely in
`AdminCategories.tsx`. `Work.tsx` reads those fields directly for a filtered
view instead of calling `useCmsPage` a second time; `useCmsPage("work", …)` is
only ever the whole page's own copy, filter or not. Step 1 above exists purely
so the old `/film`-style URLs,
existing menu items and outside links keep resolving.

That is why a page created in the admin works with no deploy. Unpublished
content resolves to 404 so taking something offline hides it completely.

## Publishing model

Draft state exists in exactly three places: `projects.published`,
`articles.published`, and `page_content.published` for pages whose
`is_system` is 0. Everything else is live as soon as it is saved.

That was a deliberate reduction. Every table still carries a `published`
column, but services and team pass `publishable: false` to the collection
factory (public reads ignore the flag), and categories decide their own
visibility: `GET /api/categories` returns them all so their pages resolve, and
the site links to one only when `project_count > 0`. The rule to hold onto is
**publishing is for things you write over time** — adding a switch anywhere
else means another thing to forget, and a page that silently looks broken.

## The slate grid

`components/site/Slate.tsx` is the whole layout system: `SlateFeature`,
`SlateCard` (spans 8 / 6 / 4), `SlateSection` and `SlateGrid`, on a 12-column
bed with fixed gaps. Every thumbnail is 16:9; the type scale is a function of
the card's span and nothing else.

Two rhythms are built from it, in `lib/slate.ts`, both on the same page and
chosen by the `?category=` filter:

- **Unfiltered** — `pickFeature` opens the page, then `groupByCategory` deals
  each discipline as one lead (8 cols) plus standards (4 cols), numbered.
- **Filtered** — the feature, then half-width cards (6 cols), no numbering,
  more air; there is nothing to group, so the frames get the space instead.

Because the rules are positional, a project added in the admin inherits its
treatment. Hierarchy comes from two CMS fields only: `sort_order` and
`featured` (a single slot — the server retires the previous one on write).

## Images

`components/site/SmartImage.tsx` measures each picture against its frame on
load and crops it only when the shapes already agree; otherwise it shows the
picture whole over a blurred enlargement of itself. This is why the poster art
on the slate is never sliced. `MediaFrame` uses it for every fixed-size still.

## Undo / redo

`hooks/useEditHistory.tsx`. `EditHistoryProvider` wraps the admin and holds
whichever editor is on screen; each editor calls `useUndoRedo(state, setState)`
to publish its controls into the context, which `components/admin/UndoRedo.tsx`
renders inside `AdminHeader` on every screen. History is capped at ten steps,
edits within 500 ms collapse into one, and `reset(next)` — called on load and
on save — clears it so undo can't step back past the server's copy.

## Keeping the admin live

`lib/adminQueries.ts`. Admin screens spread `ADMIN_QUERY` (no stale reads,
refetch on focus); every mutation calls `invalidateContent(queryClient)`, which
invalidates everything. Content is cross-linked enough that per-key
invalidation means remembering every link, and one missed key looks exactly
like a broken screen. The data is small and there is one editor, so refreshing
everything is both cheaper to reason about and impossible to get wrong.

## The shared layer

Build new pages out of these rather than re-implementing them:

- `components/site/PageShell` — nav, transition, SEO, footer, gutters.
- `components/site/Masthead` — the oversized title, rule, lead and counter.
- `components/site/MediaFrame` — image / uploaded video / YouTube in one frame.
- `components/site/Reveal` — the site's single scroll reveal, wired to the
  per-section motion controls in Admin → Settings.
- `components/site/states` — `LoadingState`, `EmptyState`, `ErrorState`.
- `components/PageBlocks` — renders the stackable block list.
- `hooks/useCmsPage(slug, fallbackTitle)` — reads a `page_content` row into
  exactly what a page renders.

Admin screens use `components/admin/FormFields` and
`components/admin/BlockListEditor`.

## Adding a block type

One place: `src/lib/pageBlocks.ts` — add to the `PageBlock` union, `BLOCK_TYPES`,
`emptyBlock()` and `isBlockFilled()`. Then a case in `components/PageBlocks.tsx`
to render it and one in `components/admin/BlockListEditor.tsx` to edit it. It
becomes available on every page, journal entry and project at once.

## Adding a collection

Journal, Services and Team share one server implementation
(`server/utils/collection.js`) and one admin screen
(`components/admin/CollectionAdmin.tsx`). A new collection is:

1. A table in `db.js`.
2. A route file — see `server/routes/services.js`, about 25 lines of config.
3. Mount it twice in `server/index.js` (`/api/x` and `/api/admin/x`).
4. A fetcher in `lib/api.ts` and a hook in `hooks/useContent.ts`.
5. An admin screen that is a `<CollectionAdmin>` field schema — see
   `pages/admin/AdminServices.tsx`.

Column names in the collection factory come only from the config in code, never
from the request, so the interpolated identifiers can't be injected; values are
always bound parameters.

## Public vs admin API

Every collection router is mounted at both `/api/x` and `/api/admin/x`. Reads on
the public path return published records only. `?all=true` (lists) and
`?draft=true` (single items) return unpublished content and require a token.

`lib/api.ts` throws `ApiError` with a `status`, so pages can tell "this doesn't
exist" (404 → render the 404 page) from "the backend didn't answer" (→ render a
retry). Never collapse the two.

## SEO

Per page, from the CMS, via `components/site/Seo.tsx`: title, description,
canonical, Open Graph and Twitter tags. `index.html` carries the static defaults
for crawlers that don't run JavaScript. `/admin` is `noindex` and disallowed in
`robots.txt`.

`GET /sitemap.xml` on the backend is generated from live content, so a new page
is indexable with no extra step. It needs `SITE_URL` set on the backend to the
site's public origin, and a rewrite from the frontend domain to the backend —
in `vercel.json`:

```json
{ "source": "/sitemap.xml", "destination": "https://your-backend.onrender.com/sitemap.xml" }
```

## Environment

Backend, in addition to what the README lists:

- `SITE_URL` — public origin of the frontend, for the sitemap.

## Things worth knowing

- **Home is deliberately untouched.** `src/pages/Index.tsx` is a single
  non-scrolling hero screen and has its own tests.
- **The activity log has no UI.** `audit_logs` is still written on every write
  and readable at `/api/admin/audit`; it was removed from the dashboard because
  nobody acted on it. Keep the writes — they are the record of what happened.
- **Trailers are ambient; full films never are.** `ProjectDetail` autoplays
  `trailer_youtube_id` silently behind the title and only ever offers
  `youtube_id` as an on-demand player.
- **Legacy page fields still render.** Pages saved before the block editor
  (News, Internship) hold `subtitle`/`intro`/`body`/`sections`/`cta`;
  `components/site/LegacyPageFields.tsx` keeps showing them, and saving a page
  in the admin merges rather than replaces the content JSON.
