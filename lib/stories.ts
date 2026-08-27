import { cache } from "react";
import { isDbConfigured, storiesCollection, type StoryDoc } from "./db";
import { renderStoryMarkdown } from "./render";
import { isLang, LOCALES, type Lang } from "./i18n";

const WORDS_PER_MINUTE = 225;

export type StoryMeta = {
  id: string;
  slug: string;
  lang: Lang;
  title: string;
  author: string;
  genre: string;
  tags: string[];
  /** ISO date string (YYYY-MM-DD) */
  date: string;
  excerpt: string;
  featured: boolean;
  published: boolean;
  readingMinutes: number;
  wordCount: number;
  /** Slug of the same story in the other language, if there is one. */
  translationOf?: string;
};

export type Story = StoryMeta & { html: string; body: string };

/* ----------------------------- text utilities ----------------------------- */

export function stripMarkdown(input: string): string {
  return input
    .replace(/```[\s\S]*?```/g, "")
    .replace(/!\[[^\]]*]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)]\([^)]*\)/g, "$1")
    .replace(/[*_`>#]/g, "")
    .replace(/^\s*[-–—]{3,}\s*$/gm, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function countWords(body: string): number {
  return stripMarkdown(body).split(/\s+/).filter(Boolean).length;
}

export function readingMinutesFor(wordCount: number): number {
  return Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE));
}

export function buildExcerpt(body: string, limit = 190): string {
  const flat = stripMarkdown(body);
  if (flat.length <= limit) return flat;
  const cut = flat.slice(0, limit);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : limit).replace(/[,.;:!?—-]$/, "")}…`;
}

/** URL-safe slug. Hinglish titles are Latin script already, so this is enough. */
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/* -------------------------------- mapping --------------------------------- */

function toMeta(doc: StoryDoc): StoryMeta {
  return {
    id: doc._id ? String(doc._id) : "",
    slug: doc.slug,
    lang: isLang(doc.lang) ? doc.lang : "en",
    title: doc.title,
    author: doc.author,
    genre: doc.genre,
    tags: doc.tags ?? [],
    date: doc.date,
    excerpt: doc.excerpt,
    featured: Boolean(doc.featured),
    published: Boolean(doc.published),
    wordCount: doc.wordCount ?? 0,
    readingMinutes: doc.readingMinutes ?? 1,
    translationOf: doc.translationOf || undefined,
  };
}

/* ------------------------------ public reads ------------------------------ */

/**
 * All published stories for a locale, newest first.
 *
 * Wrapped in React's `cache` so a page that asks for the feed, the counts and
 * the sidebar list hits the database once per request, not three times. A build
 * or page render must never *fail* because Mongo is unreachable — an empty site
 * with a warning in the log beats a 500.
 */
export const getAllStories = cache(
  async (lang: Lang): Promise<StoryMeta[]> => {
    if (!isDbConfigured) return [];
    try {
      const stories = await storiesCollection();
      const docs = await stories
        .find({ lang, published: true })
        .sort({ date: -1, slug: 1 })
        .toArray();
      return docs.map(toMeta);
    } catch (error) {
      console.error("[stories] read failed:", error);
      return [];
    }
  },
);

export async function getAllSlugs(lang: Lang): Promise<string[]> {
  return (await getAllStories(lang)).map((story) => story.slug);
}

/** Every (lang, slug) pair — for generateStaticParams and the sitemap. */
export async function getEveryStoryRef(): Promise<
  { lang: Lang; slug: string }[]
> {
  const perLocale = await Promise.all(
    LOCALES.map(async (lang) =>
      (await getAllSlugs(lang)).map((slug) => ({ lang, slug })),
    ),
  );
  return perLocale.flat();
}

export async function getStory(
  lang: Lang,
  slug: string,
): Promise<Story | null> {
  if (!isDbConfigured) return null;
  try {
    const stories = await storiesCollection();
    const doc = await stories.findOne({ lang, slug, published: true });
    if (!doc) return null;
    return {
      ...toMeta(doc),
      body: doc.body,
      html: await renderStoryMarkdown(doc.body),
    };
  } catch (error) {
    console.error("[stories] read failed:", error);
    return null;
  }
}

export async function getStoriesByGenre(
  lang: Lang,
  genreSlug: string,
): Promise<StoryMeta[]> {
  return (await getAllStories(lang)).filter(
    (story) => story.genre === genreSlug,
  );
}

export async function getFeaturedStory(lang: Lang): Promise<StoryMeta | null> {
  const stories = await getAllStories(lang);
  return stories.find((story) => story.featured) ?? stories[0] ?? null;
}

export async function getGenreCounts(
  lang: Lang,
): Promise<Record<string, number>> {
  return (await getAllStories(lang)).reduce<Record<string, number>>(
    (acc, story) => {
      acc[story.genre] = (acc[story.genre] ?? 0) + 1;
      return acc;
    },
    {},
  );
}

/** Same category first, then shared tags, then anything recent. */
export async function getRelatedStories(
  story: StoryMeta,
  limit = 3,
): Promise<StoryMeta[]> {
  const others = (await getAllStories(story.lang)).filter(
    (candidate) => candidate.slug !== story.slug,
  );

  return others
    .map((candidate) => {
      const sharedTags = candidate.tags.filter((tag) =>
        story.tags.includes(tag),
      ).length;
      return {
        candidate,
        score: (candidate.genre === story.genre ? 10 : 0) + sharedTags * 2,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.candidate);
}

/**
 * The same story in the other locale, if the author linked them with
 * `translationOf`. Used for hreflang and the "read in <language>" link.
 */
export async function getTranslation(
  story: StoryMeta,
): Promise<StoryMeta | null> {
  for (const other of LOCALES.filter((locale) => locale !== story.lang)) {
    const candidates = await getAllStories(other);
    const match = candidates.find(
      (candidate) =>
        candidate.translationOf === story.slug ||
        (story.translationOf && candidate.slug === story.translationOf),
    );
    if (match) return match;
  }
  return null;
}

export type SearchDoc = Pick<
  StoryMeta,
  "slug" | "title" | "author" | "genre" | "tags" | "excerpt" | "readingMinutes"
>;

/** Small JSON payload shipped to the client for instant search. */
export async function getSearchIndex(lang: Lang): Promise<SearchDoc[]> {
  return (await getAllStories(lang)).map(
    ({ slug, title, author, genre, tags, excerpt, readingMinutes }) => ({
      slug,
      title,
      author,
      genre,
      tags,
      excerpt,
      readingMinutes,
    }),
  );
}

export function formatDate(iso: string, lang: Lang): string {
  const date = new Date(`${iso}T00:00:00Z`);
  return date.toLocaleDateString(lang === "hi" ? "en-IN" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}
