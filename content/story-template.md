# Story template

**The normal way to add a story is the admin panel at `/admin`.** These fields
map 1:1 onto that form, so this file doubles as the field reference.

Markdown files are only used for *seeding* the database — `npm run seed` imports
everything in `content/stories/<lang>/` into MongoDB, after which the site reads
only from the database. Use that if you'd rather draft in an editor:

- English → `content/stories/en/your-story-slug.md`
- Hindi (Hinglish) → `content/stories/hi/aapki-kahani-ka-slug.md`

The folder decides the language. The filename becomes the slug, so
`content/stories/hi/barish-wali-raat.md` → `/hi/story/barish-wali-raat`.

Then run `npm run seed` (or `npm run seed -- --force` to overwrite). Seeded
stories arrive **published**.

---8<--- copy from below this line ---8<---

---
title: "Your Story Title"
author: "Pen Name"
genre: "romance"
tags: ["one-word", "themes", "here"]
date: "2026-08-25"
featured: false
excerpt: "One or two sentences that make someone click. Shows up on the feed, in Google results and on the share card."
---

Your first paragraph. This one gets the big drop cap, so open with something
worth looking at.

Leave a blank line between paragraphs. Don't indent them.

---

Three dashes on their own line makes a scene break — the three gold dots.

You can use *italics*, **bold**, and > blockquotes.

---8<--- copy from above this line ---8<---

## Field reference

| Field           | Required | Notes                                                      |
| --------------- | -------- | ---------------------------------------------------------- |
| `title`         | yes      | Build fails without it                                     |
| `genre`         | yes      | Must be one of the slugs below, exactly                    |
| `author`        | no       | Defaults to "Anonymous"                                    |
| `date`          | no       | `YYYY-MM-DD`. Newest first in the feed                     |
| `tags`          | no       | Drives the "Read next" suggestions                         |
| `featured`      | no       | `true` puts it in the hero slot — one story per language    |
| `excerpt`       | no       | Auto-generated from your opening if you leave it out       |
| `translationOf` | no       | Slug of the same story in the other language (see below)   |

Valid `genre` values (from `lib/genres.ts`):

```
romance   first-time   office        long-distance
forbidden married      fantasy       lgbtq
```

Reading time and word count are counted from your text — don't set them.

## Linking a translation

If you write the same story in both languages, point them at each other with
`translationOf`. That produces the "Read in Hindi" / "Read in English" button on
the story page and the `hreflang` tags Google uses to serve the right version.

```
# content/stories/en/the-last-train-home.md
translationOf: "aakhri-train-ghar-ki"

# content/stories/hi/aakhri-train-ghar-ki.md
translationOf: "the-last-train-home"
```

Set it on both files. A story with no translation is fine — the button just
doesn't appear.

## Content rules

These are enforced by you, not by the code, and they are the difference between
a site that keeps its ad account and one that doesn't:

- **Every character is a fictional adult, 18 or over.** No exceptions, no
  ambiguity, no "she was almost eighteen".
- **No real or identifiable people.** No public figures.
- **Consent is visible on the page.** Coercion can be a plot; it can't be the
  thing the story approves of.
- **Text only.** Adding photos or video puts you under 18 U.S.C. § 2257 as a
  producer — see `app/[lang]/2257/page.tsx` before you go anywhere near that.
