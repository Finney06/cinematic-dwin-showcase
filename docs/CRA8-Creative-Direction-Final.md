# CRA8 — Creative Direction

The art-direction layer for CRA8's website. Read alongside `CRA8-Build-Spec.md`
(pages, admin, technical scope) — that one covers *what* gets built, this one
covers *how it should feel* and *what real content it's built around*.

---

## Positioning

CRA8 is a production company built on an established body of real work —
not a startup with nothing behind it. The site should make that immediately
felt: **"these people tell stories,"** not "these people built an agency
website." The target is a caliber that would hold its own on Awwwards — not
because the award is the goal, but because that standard of restraint is
what actually produces the feeling CRA8 needs.

**Genre identity:** reading CRA8's real body of work together, it is
honestly a **spiritual drama and thriller studio** — faith, temptation,
spiritual consequence, minister and prophet narratives, told with real
craft. This is a sharp, ownable position, not a generic "premium creative
studio." Lean into it rather than diluting it into something broader.

## The medium is motion, not photography

DWINDIK is a filmmaker; CRA8's dominant medium is video — trailers, edited
footage, motion — never stills photography standing in for it. Every
design decision should default to video first.

## Visual language — grounded in DWINDIK's actual work, not invented

Pulled directly from real Prophet Suddenly 4 trailer footage:

- **Lighting shifts scene to scene, deliberately** — cool blue rim-light on
  intense close-ups, warm amber/red in dialogue, purple-magenta bokeh
  behind emotional beats, full blue-monochrome on insert/detail shots.
  Color temperature is used as an emotional tool, not one flat "dark mode"
  look.
- **On-screen credit typography** is small-caps, wide-tracked, thin serif,
  white over a dark shallow-focus background — a real, usable reference
  for the site's own display type.
- **Shot range swings between extremes** — raw emotional close-ups against
  wide, architecturally clean establishing shots (drone passes, modern
  interiors). That intimacy-versus-scale contrast should shape how the
  site paces its own sections.
- **Production design reads upscale and confident**, never
  budget-constrained. The site should carry the same confidence.

## Visual style

Minimal. Cinematic. Confident. Slightly futuristic in feel — premium
creative technology, not sci-fi, not corporate template.

## The rules

- Cut visible information hard. Every section carries **one** clear focal
  point — never competing cards, never a features grid, never generic
  icons standing in for "what we do."
- Whitespace is a deliberate choice, not leftover space.
- Typography carries meaning copy would otherwise carry — oversized
  titles, wide breathing room, minimal supporting text, the type itself
  reading as art direction.
- Motion is felt, not noticed: smooth fades, parallax depth, scroll-driven
  reveals, soft scaling, magnetic hover states. Every motion choice is
  intentional.
- **Both a light and a dark mode — not permanently dark.** Dark can be the
  default (it suits cinematic footage), but light mode is a real,
  equally art-directed alternative, not an inverted afterthought. Either
  way, color and light should feel like they come from the footage
  itself, not from UI decoration.
- No stock icon rows, no generic gradients, no template "features grid,"
  nothing that could read as a WordPress theme.

## Layout as a sequence, not a stack

Don't stack sections like a brochure (hero → about → services → contact).
Build it as a sequence of moments, the way a well-cut trailer is paced: a
full-screen cinematic open, a massive-type statement, one project given
real room to breathe before the next, an asymmetric editorial beat, a slow
scroll-driven reveal. Each scroll should feel like the next cut in
something considered.

## Section-by-section direction

- **Home** opens on video, not a photo — a hero cut from DWINDIK's
  strongest existing work.
- **Work** is not a card grid — paced like a slate: one project filling
  real space at a time, trailer or key footage doing the talking, credits
  kept minimal beside it.
- **Project detail:** show the trailer where one is confirmed to exist
  (ambient/looping treatment appropriate for a short trailer). Where no
  trailer is confirmed, show a static thumbnail with a clear "Watch full
  film" link out to YouTube — **never autoplay a multi-hour film as
  ambient background footage.**
- **About** is founder-led for now — just DWINDIK, presented with the
  weight a real studio gets: a strong moment (video or portrait), a short
  direct statement of what CRA8 is building toward, nothing that reads
  like corporate copy. The team-grid admin feature exists and is ready the
  moment CRA8 has a second person to add — not populated with empty seats
  today.
- **Contact** stays radically simple — a large emailable line of type, not
  a boxed form with visible validation chrome.
- **News and the admin panel** are the one place plain, information-dense
  UI is correct — a tool for DWINDIK's team, not an art piece.

## Credit and ownership policy

Several of CRA8's real projects are produced under **The Winlos Media
Ministry**, not CRA8. That's fine: every project is presented as
**DWINDIK's individual craft credit** (Director of Photography, VFX
Artist, Editor, Gaffer, Production Manager, etc. — whichever roles are
real for that project), never framed as "CRA8 produced this film." This
policy applies to the entire slate, consistently.

---

## The founding slate — 10 real projects, zero placeholders

| Project | Year | DWINDIK's role | Full film ID | Trailer ID |
|---|---|---|---|---|
| Prophet Suddenly | 2023 | DOP, Cinematographer, Editor, VFX Artist, Lighting | `QIoUmnSkOXE` | unconfirmed |
| Prophet Suddenly 2: Helpers of God | 2024 | DOP, Chief Editor, Sound Design, VFX Artist, Gaffer | `lb9YjxjWOyU` | unconfirmed |
| Holy Scam | 2024 | DOP, Chief Editor, VFX, Lighting | `3RxAESE5yoQ` | unconfirmed |
| Love in the Guest Room | 2025 | DOP, Lighting, VFX, Chief Editor, Gaffer | `FKe3cVTo4Fs` | unconfirmed |
| Prophet Suddenly 3 | 2025 | DOP, VFX Artist, Production Manager, Chief Editor, Gaffer | `m2BNiZWbV50` | unconfirmed |
| Spirituals | 2025 | DOP, Gaffer, VFX Artist | `wbexvRPd0Go` | unconfirmed |
| Spirituals 2 | 2025 | DOP, Gaffer, VFX Artist | `QafCUG04yGs` | unconfirmed |
| Spirituals 3 | 2026 | DOP, Gaffer, VFX Artist | `pRPFMJXefv0` | unconfirmed |
| Spirituals 4 | 2026 | DOP, Gaffer, VFX Artist | `y41jI31M-3Y` | unconfirmed |
| Prophet Suddenly 4: The Children's Ministry | 2026 | DOP, VFX Artist, Project Management, Chief Editor, Gaffer | `UjlbcOR7CfI` | `dtjsc_MhWgc` ✅ |

Where a trailer ID is unconfirmed, project pages default to the
static-thumbnail-plus-"Watch full film"-link treatment — correct and safe,
not a placeholder. Filling in a trailer ID later upgrades that one project
to the ambient treatment with no rebuild needed.

### Prophet Suddenly 4 — full content record

| Field | Value |
|---|---|
| id | `prophet-suddenly-4` |
| title | Prophet Suddenly 4: The Children's Ministry |
| category / label | film / Film |
| year | 2026 |
| role | Director of Photography, VFX Artist, Project Management, Chief Editor, Gaffer |
| youtube_id | `UjlbcOR7CfI` |
| trailer_youtube_id | `dtjsc_MhWgc` |
| thumbnail | `https://img.youtube.com/vi/UjlbcOR7CfI/maxresdefault.jpg` |
| status | Now Streaming |
| description | A gripping spiritual drama that follows Pastor Victor, a minister whose desire for greatness and ministry expansion leads him toward dangerous spiritual compromise. |
| synopsis | Prophet Suddenly 4 follows Pastor Victor, a minister whose hunger for greatness and ministry expansion takes a dark turn after a trip to Tanzania — drawing him into a spiritual compromise that threatens everything and everyone around him. |
| sort_order | 10 |

All ten records — including the nine already on DWINDIK's personal site —
are ready to seed directly; see `server/seed.js` in this repository.
