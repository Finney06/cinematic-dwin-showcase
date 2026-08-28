---
title: "CRA8 Website — Client Handover"
subtitle: "What you own, where it lives, and how to run it"
date: "August 2026"
---

# CRA8 Website — Client Handover

This document is for CRA8 (DWINDIK). It explains, in plain language, what has
been built, where everything lives, how to manage the site day to day, and what
to keep an eye on. A separate **Developer Handover** covers the technical detail
for any engineer who works on the code later.

---

## 1. What you have

A complete, live website for CRA8 with a built-in content management system
(the "admin"). Every word, image, video, project, page and menu link a visitor
sees is edited by you from the admin — no developer is needed to change content
or to add new pages.

**Public site:** the CRA8 website visitors see.
**Admin portal:** `‹your-site›/admin` — your private editor, hidden from search
engines.

The full editor's guide is **CRA8 — Managing the Site** (`CRA8-CMS-Handbook`).
Read that first; it covers projects, categories, the journal, services, team,
pages, the menu, settings and messages.

---

## 2. Where everything lives

| Piece | Service | What it is |
|---|---|---|
| The public website | **Vercel** | Hosts and serves the site to visitors. Free (Hobby) plan. |
| The admin & content engine ("backend") | **Render** | Runs the server that stores and serves your content. Currently the free plan. |
| The content database | **Managed Postgres** (via Render) | Holds every project, page, message and setting. |
| Uploaded images & video | **Cloudinary or S3/R2** (object storage) | Where media you upload is kept and served from. |
| The source code | **GitHub** — `Finney06/cinematic-dwin-showcase` | The master copy of the code. Deploys happen automatically from here. |
| The domain name | *(your registrar)* | The address people type. Points at Vercel. |

You should have **owner or admin access to each of these accounts** in your own
name. See the handover checklist at the end.

---

## 3. Logging in and managing the site

1. Go to `‹your-site›/admin`.
2. Sign in with your admin username and password.
3. Edit anything from the sidebar. **Saving publishes it** — except projects,
   journal entries and pages you create yourself, which have a draft switch.

Key day-to-day tasks, all in the handbook:

- **Add a film or music video** — Projects → New Project.
- **Write a journal post** — Journal → New Entry (save as draft, preview, then publish).
- **Add a new page** (e.g. a press kit) — Pages → New Page. No developer needed.
- **Change contact details, social links, fonts, motion** — Settings.
- **Read enquiries from the contact form** — Messages. These are stored in the
  admin, not emailed, so the form never breaks.

**Undo/redo** (↺ ↻ or ⌘Z) is on every editing screen and steps back through your
last ten changes on that screen.

---

## 4. Running costs

The site launches entirely on **free tiers**. You will only pay for things as
CRA8 grows:

| Item | Now | Later (when you outgrow free) |
|---|---|---|
| Domain name | ~₦25,000/year (already partly funded) | same |
| Website hosting (Vercel) | Free | ~$20/mo only if traffic is very high |
| Backend (Render) | Free | **$7/mo** for the site to respond instantly at all hours |
| Database (Render Postgres) | Free | ~$7/mo for a larger, permanent database |
| Media storage (Cloudinary) | Free | pay-as-you-grow once you store a lot of video |

**The one caveat on the free plan:** the backend "sleeps" after about 15 minutes
of no visitors, so the first visitor after a quiet spell waits roughly 50
seconds for it to wake. A small external "pinger" (cron-job.org) keeps it awake
during daytime hours to reduce this. Upgrading Render to the **$7/mo Starter
plan** removes the wait completely and is the recommended first upgrade.

> **Free database warning:** a free Render Postgres database is deleted after 90
> days. Keeping it requires either upgrading it to a paid plan or taking regular
> backups. This has already caught the site out once. Treat it as a priority.

---

## 5. What is included

- The full public site, responsive, in light and dark mode.
- The admin portal with undo/redo, drag-to-reorder, media upload, and the
  ability to create new pages.
- Per-page SEO (search and social sharing), an automatic sitemap, and a
  cinematic video-led home screen.
- The founding slate of 10 real projects, loaded with real trailers and artwork.
- Two written guides (this document set) and the in-admin structure that makes
  the site self-explanatory.

## 6. What is not included (future phases)

- **Online shop / merch** — deliberately deferred, separately scoped (Phase 2).
- **Careers / jobs page, membership** — deferred to a later phase.
- **A custom email service for the contact form** — not needed; messages live in
  the admin. Add later if you want auto-replies.
- Ongoing maintenance, feature work and support are **not** covered by the build
  and would be a separate arrangement.

---

## 7. Your responsibilities from here

- **Keep account access.** Don't lose the logins in section 2.
- **Set a strong admin password** and don't share the single admin login widely.
- **Watch the database.** Upgrade it or back it up before day 90.
- **Decide on the $7/mo Render upgrade** if the wake-up delay bothers you.
- **Renew the domain** every year.
- **Keep media reasonable.** Upload the best version you have; the system
  compresses it. Very large video libraries will eventually cost storage money.

---

## 8. Handover checklist

Confirm you have received and can log in to each of these **in your own name**:

- [ ] GitHub — access to the `cinematic-dwin-showcase` repository
- [ ] Vercel — the website project, as owner or team member
- [ ] Render — the `dwindik-website` backend service
- [ ] The Postgres database — connection details and a first backup
- [ ] Cloudinary (or S3/R2) — the media storage account
- [ ] The domain registrar account
- [ ] cron-job.org — the keep-alive monitor (or a note that it exists)
- [ ] The admin portal — your username and a password you have changed
- [ ] Both handover documents and the CMS Handbook

---

## 9. Who to contact

- **Content, day-to-day site management:** you, using the CMS Handbook.
- **Something broken, code changes, new features:** the developer
  (Finney Osajere), or any engineer given the Developer Handover.
- **A page shows "Coming soon" or "Couldn't load…":** see *If something looks
  wrong* at the end of the CMS Handbook — most of these are normal empty states
  or a sleeping backend, not lost content.
