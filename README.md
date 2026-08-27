# Meri Vasna

A bilingual (English + Hinglish) adult short-fiction site. Next.js 16 App
Router, Tailwind CSS v4, stories authored as markdown files. Every page is
prerendered at build time, so it serves as static HTML — which is what you want
for search ranking and for ad fill rate.

```bash
npm install
cp .env.example .env.local   # then edit it
npm run dev                  # http://localhost:3000 → redirects to /en or /hi
npm run build
```

---

## Read this first: AdSense is not available to you

Google AdSense prohibits sexually explicit content in its program policies. An
adult site is rejected at review, or banned later if it slips through. There is
no configuration that changes this.

This project therefore targets adult ad networks instead — **ExoClick** and
**JuicyAds** are wired up, and adding another is about ten lines. Expect lower
CPMs than mainstream display advertising and plan volume accordingly.

Practical consequences worth knowing before you invest in traffic:

- **Google Search still indexes adult sites.** SEO is a real channel here; the
  sitemap, hreflang and structured data below all matter.
- **Google Analytics is allowed.** Only *advertising* has the content
  restriction. (None is installed — add one if you want it.)
- **Payment processors are stricter than ad networks.** If you ever add
  subscriptions, check Stripe's restricted-business list first — adult content
  is on it.
- **Social reach is limited.** Facebook and Instagram will not accept adult ads
  and often suppress organic links. Reddit and Twitter/X are the usual channels.

---

## Adding a story

Write it at **`/admin`** — see [The admin panel](#the-admin-panel) below. The
URL is built from the title and the language you pick:

```
English, "The Last Train Home"  →  /en/story/the-last-train-home
Hindi,   "Barish Wali Raat"     →  /hi/story/barish-wali-raat
```

`content/story-template.md` documents every field; they map 1:1 onto the admin
form. Markdown files are only used for seeding now.

```markdown
---
title: "Your Story Title"
author: "Pen Name"
genre: "romance"
tags: ["office", "slow-burn"]
date: "2026-08-25"
featured: false
excerpt: "One or two sentences that make someone click."
---

Your first paragraph gets the drop cap.

---

Three dashes alone on a line makes a scene break.
```

Only `title` and `genre` are required. Valid genres are the slugs in
`lib/genres.ts`: `romance`, `first-time`, `office`, `long-distance`,
`forbidden`, `married`, `fantasy`, `lgbtq`. Reading time and word count are
computed from your text.

Publishing refreshes the live site immediately — no rebuild, no redeploy.

### Linking the two languages

Write the same story in both folders and point them at each other with
`translationOf`, using the *other* file's slug. That produces the "Read in
Hindi" / "Read in English" button plus the `hreflang` pair Google needs. Set it
on both files. Stories without a translation are fine.

## The six placeholder stories

`content/stories/{en,hi}` currently hold non-explicit placeholder files —
atmospheric openings that stop before anything happens, each ending with a note
telling you to replace it. They exist so you can see the layout, covers, reading
times and category pages working with real prose in them. Delete them as you add
your own.

---

## The admin panel

Stories live in MongoDB and are written from `/admin`. Markdown files are now
only a seeding mechanism (see below).

```bash
cp .env.example .env.local     # fill in MONGODB_URI + ADMIN_PASSWORD
npm run dev
open http://localhost:3000/admin
```

### Setting it up

Two environment variables are all it needs:

```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/
MONGODB_DB=merivasna

ADMIN_PASSWORD=a-long-random-passphrase     # openssl rand -base64 24
ADMIN_SESSION_SECRET=...                    # openssl rand -hex 32 (optional)
```

Notes that matter:

- **`ADMIN_PASSWORD` is the entire security model.** One password, no accounts,
  no reset flow. Use a generated passphrase, not a word. Under 12 characters and
  the login page warns you. With it unset, `/admin` cannot be entered at all —
  that's the safe default, not a bug.
- `ADMIN_SESSION_SECRET` signs the session cookie. If you leave it blank it's
  derived from the password, which means changing the password signs you out
  everywhere. Setting it explicitly avoids that.
- Sessions last 7 days in an httpOnly cookie. Failed logins are throttled to 8
  per 10 minutes per IP, in memory — so a server restart clears the counter, and
  if you run several instances each has its own. Fine for one owner on one box;
  move it to the database if that changes.
- On MongoDB Atlas, add your server's IP under **Network Access** or nothing
  will connect. The dashboard tells you when that's the problem.

### What the admin does

| Route | |
| --- | --- |
| `/admin/login` | Password entry |
| `/admin` | Dashboard: counts, per-language totals, all stories with publish/unpublish/delete |
| `/admin/new` | Write a new story |
| `/admin/stories/[id]` | Edit |
| `/admin/stories/[id]/preview` | Read a draft with the real reading styles before publishing |

The editor writes the same markdown the site has always rendered — blank line
between paragraphs, `---` for a scene break. Word count and read time update as
you type, and the URL slug is generated from the title (override it if you
want). Leave **Published** unchecked to keep a draft: drafts are invisible on
the site and return 404, but you can still preview them.

**Featured** gives a story the hero slot on the feed. Setting it clears the flag
on the previous featured story in that language, so you can't end up with two.

Deleting is permanent — there's no trash — so it asks first.

### How publishing reaches the site

Every public page is prerendered as static HTML, which is what makes the site
fast and cheap to serve. Saving from the admin calls `revalidatePath("/", "layout")`,
which invalidates that HTML so the next request regenerates it from the
database. Verified end to end against a production build: publish → the story
is on the feed, on its own URL and in the sitemap within a second; delete → all
three go back to 404.

Invalidating the whole tree is heavier than targeting individual paths. That's
deliberate: this fires a few times a day at most, and a stale feed after
publishing is a far worse bug than an extra regeneration.

### Seeding from markdown

The markdown files in `content/stories/{en,hi}/` are the six placeholders. Push
them into the database with:

```bash
npm run seed              # skips anything already in the database
npm run seed -- --force   # overwrite with the file version
```

Matching is on (language, slug), so re-running is safe. After that, the files
are inert — the site reads only from MongoDB. Keep them around as examples or
delete them.

`content/story-template.md` still documents every field, which maps 1:1 onto the
admin form.

### Data model

Collection `stories`, one document per story per language:

```
{ slug, lang, title, author, genre, tags[], date, excerpt, body,
  featured, published, translationOf, wordCount, readingMinutes,
  createdAt, updatedAt }
```

`wordCount` and `readingMinutes` are computed on save, so read paths never
recompute them. Indexes are created automatically on first connection:
a **unique** index on `(lang, slug)` — which is what makes duplicate URLs
impossible, rather than a check-then-write race — plus two for feed and category
queries.

If Mongo is unreachable, public pages render as an empty site and log the error
instead of returning a 500. The admin, by contrast, shows you the connection
error — there you want to know.

---

## Content rules that protect the site

Enforced by you, not the code. Every ad network audits for these, and losing an
account over one story is not worth it:

- Every character is a **fictional adult, 18 or over** — no ambiguity.
- **No real or identifiable people**, including public figures.
- **Consent visible on the page.** Coercion can be a plot; it can't be endorsed.
- **Text only.** Adding photos or video makes you a producer under 18 U.S.C.
  § 2257 and the exemption on `/[lang]/2257` stops being true.

## Compliance pages (already written, need review)

| Page | What it covers |
| --- | --- |
| `/[lang]/about` | What you publish, content rules, submissions |
| `/[lang]/terms` | Age requirement, licence, prohibited use, liability |
| `/[lang]/privacy` | localStorage keys, ad-network cookies, minors |
| `/[lang]/2257` | Record-keeping exemption for text-only fiction |
| `/[lang]/dmca` | Takedown procedure and counter-notice |

They're templates. **Have a lawyer in your jurisdiction read them**, and note
that India's IT Rules treat obscene content differently from US law — if you're
operating from India, that's a conversation to have before launch, not after.

The 18+ gate is `components/AgeGate.tsx`. It's an overlay rather than a server
block on purpose: page content stays in the HTML so crawlers see a real page.
Hiding content from crawlers while showing it to users is cloaking, and Google
penalises it.

---

## Turning on ads

1. Open an account with an adult network (ExoClick, JuicyAds, TrafficJunky,
   Adsterra). Approval usually needs a live site with real content and working
   legal pages — which is why those ship here.
2. Create one zone per placement, then fill in `.env.local`:
   ```
   NEXT_PUBLIC_AD_NETWORK=exoclick
   NEXT_PUBLIC_AD_ZONE_IN_FEED=1234567
   NEXT_PUBLIC_AD_ZONE_IN_ARTICLE=1234568
   NEXT_PUBLIC_AD_ZONE_SIDEBAR=1234569
   NEXT_PUBLIC_AD_ZONE_BANNER=1234570
   ```
3. Paste your network's lines into `public/ads.txt` (it has commented examples).
   Without it you lose a large share of programmatic demand.

Until a network and zone are set, each slot renders a dashed placeholder in
development and **nothing** in production.

**To add another network:** add it to `AdNetwork` in `lib/site.ts`, load its
script in `components/AdNetworkScripts.tsx`, and render its embed tag in
`components/AdSlot.tsx`. Those three files are the whole integration.

Two placements are deliberately conservative: the in-article ad sits after the
sixth paragraph (`splitAfterParagraph(story.html, 6)` in the story page) and
feed ads sit after the 3rd and 9th cards. Nothing sits above the first
paragraph. Both are single constants if you want to push harder — just know that
ad-heavy layouts get flagged in network reviews.

## SEO plumbing (already wired)

- `app/sitemap.ts` — every story, category and legal page in both locales, with
  hreflang alternates on everything that exists in both
- `app/robots.ts` — allows everything except `/search` and `/library`
- `app/[lang]/feed.xml` — one RSS feed per language, carrying the RTA label
- `proxy.ts` — sends `/` to `/en` or `/hi` based on `Accept-Language`
- Per-story `ShortStory` JSON-LD with `isFamilyFriendly: false`
- Generated Open Graph share images per story and per locale
- RTA-5042 meta label on every page, which parental filters read
- Canonical + hreflang on every page

Set `NEXT_PUBLIC_SITE_URL` before deploying or all of it points at localhost.

## Rebranding

`lib/site.ts` holds the name, contact email and ad config. `lib/site.ts` → `siteMeta` holds the tagline and meta
description per language. The palette is the `@theme` block at the top of
`app/globals.css`; token names are semantic, so editing that one block re-skins
the whole site.

## Adding or changing a language

`lib/i18n.ts` is the whole of it: add the code to `LOCALES`, add an entry to
`LOCALE_META`, and add a dictionary. TypeScript will then list every string you
still owe. Create `content/stories/<code>/` and the routes generate themselves.

Hindi is romanised (Hinglish) and tagged `hi-Latn`, which is the correct BCP-47
tag for Hindi in Latin script. If you later want Devanagari, add it as a third
locale with a Devanagari webfont rather than mixing scripts in one locale.

## Project layout

```
app/(site)/[lang]/      the public site, locale-prefixed
app/(site)/[lang]/layout.tsx   root layout for the site
app/(admin)/admin/      the admin panel
app/(admin)/admin/layout.tsx   separate root layout — no site chrome
app/sitemap.ts          both locales
proxy.ts                / → /en or /hi; leaves /admin alone
components/             reader UI — covers, cards, age gate, ad slots
components/admin/       admin UI — login, dashboard rows, story editor
content/stories/en|hi/  seed markdown (not read at runtime)
scripts/seed.mjs        imports that markdown into MongoDB
lib/db.ts               Mongo client + indexes
lib/stories.ts          public reads (published only)
lib/admin-store.ts      admin reads/writes (drafts included)
lib/admin-auth.ts       password check, session cookie, rate limit
lib/admin-actions.ts    server actions: login, save, publish, delete
lib/render.ts           markdown → HTML, shared by page and preview
lib/i18n.ts             locales + every UI string
lib/site.ts             branding + ad network config
lib/genres.ts           categories + cover palettes, names per language
lib/reader-store.ts     localStorage: age gate, bookmarks, history
```

Two root layouts, one per route group: the site tree and the admin tree share
no chrome, so the admin has no age gate, no reader header and no ad scripts.

## Reader features

Bookmarks, reading progress and the age confirmation live in `localStorage` —
no accounts, no database, nothing to consent to. `/[lang]/library` shows saved
stories and history; the feed offers a "pick up where you left off" strip.
Search is client-side over a build-time JSON index, per language.

## Deploying

Any host that runs Next.js as a server (Vercel, Railway, Fly, a VPS). This is
**not** a static export any more — it needs a running server for the admin,
`proxy.ts` and on-demand revalidation.

Public pages are still prerendered and cached, so a CDN in front does nearly all
the work. `/[lang]/search` and everything under `/admin` are dynamic.

Set these in your host's environment: `MONGODB_URI`, `MONGODB_DB`,
`ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, `NEXT_PUBLIC_SITE_URL`,
`NEXT_PUBLIC_CONTACT_EMAIL`, and the ad variables when you have them.

```bash
npm run build && npm start
```

## Responsiveness

Audited for horizontal overflow at 320, 360, 390, 414, 768, 834, 1024, 1280,
1440 and 1920 px across ten pages — zero overflow at every width. The admin was
checked at 390 px too. If you add a wide element (a table, a long unbroken
string, a fixed-width embed), re-check 320 px first; that's where things break.

## Notes

- Cover art is generated from each story's category and slug — no image files to
  manage. `components/StoryCover.tsx` is the only place to change if you'd
  rather use real images.
- There's no comment system and no user accounts, by design. Both are moderation
  liabilities, and on an adult site a single piece of user-posted illegal content
  can end the whole project.
