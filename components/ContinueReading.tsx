"use client";

import Link from "next/link";
import { genreName } from "@/lib/genres";
import { path, t, type Lang } from "@/lib/i18n";
import type { StoryMeta } from "@/lib/stories";
import { useReader } from "@/lib/use-reader";

/**
 * "Pick up where you left off" strip. Renders nothing until we've read
 * localStorage, and nothing at all for first-time visitors.
 */
export function ContinueReading({
  stories,
  lang,
}: {
  stories: StoryMeta[];
  lang: Lang;
}) {
  const copy = t(lang).common;
  const { history, ready } = useReader();
  if (!ready) return null;

  const bySlug = new Map(stories.map((story) => [story.slug, story]));

  const inProgress = history
    .filter((entry) => entry.progress > 0.02 && entry.progress < 0.92)
    .map((entry) => ({ entry, story: bySlug.get(entry.slug) }))
    .filter((item): item is { entry: typeof item.entry; story: StoryMeta } =>
      Boolean(item.story),
    )
    .slice(0, 3);

  if (inProgress.length === 0) return null;

  return (
    <section aria-labelledby="continue-heading" className="mt-12">
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <h2 id="continue-heading" className="eyebrow">
          {copy.continueReading}
        </h2>
        <Link
          href={path(lang, "/library")}
          className="text-xs text-accent transition-colors hover:text-accent-deep"
        >
          {copy.myLibrary} →
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {inProgress.map(({ entry, story }) => (
          <Link
            key={story.slug}
            href={path(lang, `/story/${story.slug}`)}
            className="card group flex flex-col gap-3 p-4 transition-colors hover:border-line"
          >
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-[0.6875rem] font-medium tracking-wide text-accent uppercase">
                {genreName(story.genre, lang)}
              </span>
              <span className="text-[0.6875rem] text-muted">
                {copy.percentRead(Math.round(entry.progress * 100))}
              </span>
            </div>

            <h3 className="clamp-2 font-[family-name:var(--font-display)] text-[1.0625rem] leading-snug font-semibold transition-colors group-hover:text-accent">
              {story.title}
            </h3>

            <div className="mt-auto h-1 overflow-hidden rounded-full bg-paper-deep">
              <div
                className="h-full rounded-full bg-accent"
                style={{ width: `${Math.max(4, entry.progress * 100)}%` }}
              />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
