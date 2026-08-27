import { ObjectId } from "mongodb";
import { storiesCollection, type StoryDoc } from "./db";
import { isLang, LOCALE_META, type Lang } from "./i18n";
import {
  buildExcerpt,
  countWords,
  readingMinutesFor,
  type StoryMeta,
} from "./stories";

/**
 * Admin-side reads and writes. Unlike lib/stories.ts these see drafts as well
 * as published work, and they throw on failure rather than degrading to an
 * empty list — in the admin you want to know the database is down.
 */

export type AdminStory = StoryMeta & { body: string; updatedAt: string };

export type StoryInput = {
  slug: string;
  lang: Lang;
  title: string;
  author: string;
  genre: string;
  tags: string[];
  date: string;
  excerpt: string;
  body: string;
  featured: boolean;
  published: boolean;
  translationOf: string;
};

function toAdminStory(doc: StoryDoc): AdminStory {
  return {
    id: String(doc._id),
    slug: doc.slug,
    lang: isLang(doc.lang) ? doc.lang : "en",
    title: doc.title,
    author: doc.author,
    genre: doc.genre,
    tags: doc.tags ?? [],
    date: doc.date,
    excerpt: doc.excerpt,
    body: doc.body,
    featured: Boolean(doc.featured),
    published: Boolean(doc.published),
    wordCount: doc.wordCount ?? 0,
    readingMinutes: doc.readingMinutes ?? 1,
    translationOf: doc.translationOf || undefined,
    updatedAt: (doc.updatedAt ?? doc.createdAt ?? new Date()).toISOString(),
  };
}

export async function listAllStories(): Promise<AdminStory[]> {
  const stories = await storiesCollection();
  const docs = await stories
    .find({})
    .sort({ updatedAt: -1 })
    .limit(500)
    .toArray();
  return docs.map(toAdminStory);
}

export async function getStoryById(id: string): Promise<AdminStory | null> {
  if (!ObjectId.isValid(id)) return null;
  const stories = await storiesCollection();
  const doc = await stories.findOne({ _id: new ObjectId(id) });
  return doc ? toAdminStory(doc) : null;
}

/** Derived fields are computed here so read paths never have to. */
function derive(input: StoryInput) {
  const wordCount = countWords(input.body);
  return {
    wordCount,
    readingMinutes: readingMinutesFor(wordCount),
    excerpt: input.excerpt.trim() || buildExcerpt(input.body),
  };
}

export class DuplicateSlugError extends Error {
  constructor(slug: string, lang: string) {
    const label = isLang(lang) ? LOCALE_META[lang].label : lang;
    super(
      `There is already a ${label} story at /${lang}/story/${slug}. Change the slug.`,
    );
    this.name = "DuplicateSlugError";
  }
}

function isDuplicateKey(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: number }).code === 11000
  );
}

export async function createStory(input: StoryInput): Promise<string> {
  const stories = await storiesCollection();
  const now = new Date();

  try {
    const result = await stories.insertOne({
      ...input,
      ...derive(input),
      translationOf: input.translationOf || undefined,
      createdAt: now,
      updatedAt: now,
    });
    return String(result.insertedId);
  } catch (error) {
    if (isDuplicateKey(error)) {
      throw new DuplicateSlugError(input.slug, input.lang);
    }
    throw error;
  }
}

export async function updateStory(
  id: string,
  input: StoryInput,
): Promise<void> {
  if (!ObjectId.isValid(id)) throw new Error("Unknown story.");
  const stories = await storiesCollection();

  try {
    const result = await stories.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...input,
          ...derive(input),
          translationOf: input.translationOf || undefined,
          updatedAt: new Date(),
        },
      },
    );
    if (result.matchedCount === 0) throw new Error("Unknown story.");
  } catch (error) {
    if (isDuplicateKey(error)) {
      throw new DuplicateSlugError(input.slug, input.lang);
    }
    throw error;
  }
}

export async function deleteStory(id: string): Promise<void> {
  if (!ObjectId.isValid(id)) throw new Error("Unknown story.");
  const stories = await storiesCollection();
  await stories.deleteOne({ _id: new ObjectId(id) });
}

/**
 * Only one story per language can hold the hero slot, so publishing a new
 * featured story clears the flag on the others.
 */
export async function clearOtherFeatured(
  lang: Lang,
  keepId: string,
): Promise<void> {
  if (!ObjectId.isValid(keepId)) return;
  const stories = await storiesCollection();
  await stories.updateMany(
    { lang, featured: true, _id: { $ne: new ObjectId(keepId) } },
    { $set: { featured: false, updatedAt: new Date() } },
  );
}

export async function countsByStatus(): Promise<{
  total: number;
  published: number;
  drafts: number;
  perLang: Record<string, { published: number; drafts: number }>;
}> {
  const all = await listAllStories();
  const perLang: Record<string, { published: number; drafts: number }> = {};

  for (const story of all) {
    perLang[story.lang] ??= { published: 0, drafts: 0 };
    if (story.published) perLang[story.lang].published += 1;
    else perLang[story.lang].drafts += 1;
  }

  return {
    total: all.length,
    published: all.filter((s) => s.published).length,
    drafts: all.filter((s) => !s.published).length,
    perLang,
  };
}
