# CRA8 — Managing the Site

Everything on the CRA8 website is edited from the admin portal at **`/admin`**.
No part of the public site is written into the code: projects, categories,
images, videos, credits, services, journal entries, team members, page copy,
navigation, contact details and how pages appear in search and when shared all
come from the admin. Adding a whole new page needs no developer.

This is the guide to doing all of that.

---

## The idea in one minute

The site is built from six kinds of content. Each one has its own screen in the
admin sidebar.

| What it is | Where it lives on the site | Admin screen |
|---|---|---|
| **Projects** — films and music videos, with credits and media | `/work`, their own section, and their own page | Projects |
| **Categories** — the filters on Work | `/work`, as filters | Categories |
| **Journal** — behind the scenes, director stories, culture, news | `/journal` | Journal |
| **Services** — what CRA8 does | `/services` | Services |
| **Team** — people | the About page | Team |
| **Pages** — everything else, including new ones you create | `/about`, `/contact`, `/press-kit`, … | Pages |

Two rules apply everywhere:

- **Saving puts it on the site.** The only exceptions are the three kinds of
  content you write over time — see Publishing below.
- **Deleting is permanent; unpublishing is not.** If you want something off the
  site but might want it back, unpublish it or hide it.

---

## Publishing

Publishing exists only where you'd genuinely start something and finish it
later. Everywhere else, saving is publishing — there is no second step to
remember.

| Content | Has a draft state? |
|---|---|
| **Projects** | Yes — a film can be added before it's announced |
| **Journal entries** | Yes — written over days |
| **Pages you create** | Yes — built before they launch |
| Built-in pages (Work, Services, Journal, Contact, About) | No — always part of the site |
| Categories | No — see below |
| Services, Team | No — saving adds it to the page |

Where there is a draft state, the switch is on the right of each row in the
list, and repeated as a toggle inside the editor. Green means live. Drafts are
completely invisible: their web address returns "not found", so an unfinished
page can never be stumbled upon.

**Categories look after themselves.** A section joins the site's navigation the
moment it holds a published project, and drops out again when it doesn't — so
Music appears the day you publish the first music video, with nothing to switch
on. Its page always works if you link to it directly.

**The menu is separate from publishing.** Hiding a link in Menu takes it out of
the navigation; it does not unpublish the page.

## Ordering and the featured project

Drag the **≡** handle on the left of any row.

- **Journal, Services, Team, Categories** — drag anywhere in the list.
- **Projects** — pick a single category first (the chips above the list). The
  order you set is exactly the order the slate renders in.

One project can be marked **Featured** (the ★ in the projects list, or the
toggle in its editor). That project opens the Work page, full width, with its
title over the image. Turning it on for a new project
retires the last one, so there is only ever one. If nothing is featured, the
first project in order opens the page.

## Undo and redo

Every editing screen has **↺ ↻** in its top-right corner, and ⌘Z / ⇧⌘Z work
too. They step back through the last ten changes you made on that screen. Saving
— or opening a different record — starts the history fresh, so undo can never
reach back past something already saved.

---

## Projects

**Projects → New Project.**

| Field | What it does |
|---|---|
| Title, Year, Status | The headline details. Status is free text — "Now Streaming", "In Post", anything. |
| Category | Which section of the slate it's filed under. Managed in Categories. |
| CRA8 credits | The crafts CRA8 delivered — shown beside the title everywhere. |
| Logline | One sentence, set large at the top of the project page. |
| Short description / Synopsis | The short one is used where space is tight; the synopsis is the full piece. |
| Full film (YouTube) | Paste any YouTube link. Becomes the on-page player and the "Watch the full film" link. |
| **Trailer (YouTube)** | Optional, and **only ever a short trailer**. A trailer plays silently behind the title. With no trailer, the still image holds the frame instead. Never put a full-length film here. |
| Thumbnail | The key image. The button under the YouTube field grabs the video's own thumbnail. |
| Stills | Extra images, shown as a gallery. |
| Credits | Director, Producers and Cast have their own fields; **Other credits** takes any role at all — colourist, first AD, composer. |
| Extra content | Content blocks (below), for anything else the project needs. |

## Work — the only place the slate lives

There is one page for CRA8's output, and a filter bar across the top of it.
Film is one of the filters, alongside Music and anything else you add. There
are no separate discipline pages to keep in step.

- **All** shows the whole archive, grouped by discipline, each group headed and
  numbered.
- **Choosing a filter** shows just that discipline, in larger frames with more
  space around them.

Each filter is a real web address — `/work?category=film` — so a filtered view
can be bookmarked, shared and found in search. The older addresses (`/film`
and the rest) redirect onto it, so nothing already linked or bookmarked breaks.

A project only ever needs its **Category** set. It then appears under All, inside
that discipline's group, and under that discipline's filter. There is nothing to
add in two places and no way for the two to disagree.

## Categories

**Categories** are those disciplines. One row does three jobs at once: it's the
option in a project's Category dropdown, it's a filter on Work, and it's a
headed group under All.

- Adding "Documentary" here is the whole job — the filter appears as soon as
  there's a published project in it.
- **Renaming the URL changes its filter address**, so old bookmarks to the
  previous one stop working. Rename deliberately.
- A category holding projects can't be deleted — move the projects first, or
  leave it in place.
- A category with no published work isn't offered as a filter, so an empty
  section never shows up as a dead end.
- Each one can still have its own heading copy and hero image, edited in
  **Pages** — it shows when that filter is chosen.

## Journal

**Journal → New Entry.** The *Section* field is the label above the title —
"Behind the Scenes", "Director Stories", "Creative Process", "Campaign
Launches", "Culture", "CR8 News". Type a new one and it becomes a filter on the
Journal index automatically; there is no fixed list to maintain.

- *Standfirst* is the one- or two-sentence summary used on the index and in link
  previews.
- **Feature this entry** promotes it to the lead slot at the top of `/journal`.
- Entries start as drafts. Write, save, read it back on the site with the
  preview link, then publish.

## Services and Team

Both are simple ordered lists.

- **Services** — each entry gets a title, a one-line summary set large, a longer
  description, an optional image, and a list of capabilities rendered like
  on-screen credits.
- **Team** — the About page's grid. **It stays hidden while it's empty**, so
  there are never empty seats on the page. Add one person and the section
  appears.

## Pages

**Pages** lists every address on the site: the built-in pages, every category,
and every custom page. Selecting one lets you edit:

- **Heading** — the oversized title at the top.
- **Lead paragraph** — the line under the rule.
- **Page content** — content blocks (below).
- **How this page appears when shared** — the title, description and image
  shown in a Google search result or a shared link. Leave them blank and the
  page falls back to its heading and lead.

The Contact page has two extras: a switch to turn the enquiry form off entirely,
and the list of enquiry types shown as buttons on it.

**Film, Music and the other sections don't appear in this list.** They aren't
pages — they're filters on Work — and Admin → Categories is their one editor:
label, description, hero image. There's a shortcut link straight there from
the bottom of the Pages list.

### Creating a new page

**Pages → + New Page.** Give it a title and an address (e.g. `press-kit` →
`cra8.com/press-kit`), choose whether it joins the menu, and create it. It uses
the site's existing design automatically — same typography, same motion, same
navigation and footer. Build it out of content blocks, then publish.

Custom pages can be deleted. Built-in pages and categories cannot.

---

## Content blocks

Blocks are how every page, journal entry and project builds its body. Stack them
in any order; drag with **↑ ↓**, remove with **×**.

| Block | Use it for |
|---|---|
| Heading | A section title |
| Text | A paragraph. Leave a blank line to start a new one. |
| Pull quote | An oversized line, optionally attributed |
| Image | One still, full width, with an optional caption |
| Gallery | Two or more stills in a grid |
| Video | A YouTube link or an uploaded clip |
| Button | A link out, or to another page on the site (start it with `/`) |
| Two columns | Two paragraphs side by side |
| Spacer | Breathing room between sections |

Anything left empty simply doesn't render, so a half-filled block never leaves a
gap on the live page.

## Images and video

Every image field takes a drag-and-drop upload, or a pasted URL. Uploads are
compressed and converted automatically — just drop in the best version you have.

**You don't have to crop anything.** Every frame on the site is the same shape
(16:9, the shape a YouTube thumbnail already is). A picture that's a different
shape is shown whole, over a soft blurred copy of itself, so nothing important
is ever sliced off. Posters with the title along the bottom are safe.

---

## Menu, Settings and Messages

- **Menu** — the site's navigation. Drag to reorder, use the switch to hide an
  item without deleting it. A menu item can point anywhere, including a page you
  created.
- **Settings** — site title, the fallback description and share image used for
  search results, contact email, phone, studio location, social links, fonts and
  the motion controls. The contact email is what appears as the big line of type
  on the Contact page; leave it blank and the site hides those links rather than
  showing a guessed address.
- **Messages** — every enquiry sent through the Contact page. They're stored
  here rather than emailed, so the form keeps working without depending on an
  email service that could lapse. Unread count shows in the sidebar. Reply by
  email opens your own mail app with the address filled in.

## The dashboard

Deliberately short. It shows unread enquiries, anything left as a draft, the
three things you most often start, and what you edited last. That's all — a
count nobody acts on is just something else to read.

## About

**About** has its own richer editor — hero image, studio statement, extra
sections, the founder credit and portrait. The team grid on that page comes from
the **Team** screen.

---

## If something looks wrong

- **A page says "Coming soon"** — it has no published content yet. That's the
  normal empty state, not a fault.
- **A page 404s that shouldn't** — check it's published in Pages, and that its
  category (if it is one) is visible.
- **Changes aren't showing** — the site caches content for a few minutes.
  Refresh the page; if it still looks stale, hard-refresh.
- **"Couldn't load…" with a Try again button** — the backend didn't answer. That
  is a connection problem, not lost content; the content is still there.
- **Nothing saves and you're bounced to the login screen** — your session
  expired. Sign in again; unsaved changes will warn you before you leave a page.
