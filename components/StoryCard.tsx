import Link from "next/link";
import { genreName } from "@/lib/genres";
import { path, t, type Lang } from "@/lib/i18n";
import { formatDate, type StoryMeta } from "@/lib/stories";
import { BookmarkButton } from "./BookmarkButton";
import { StoryCover } from "./StoryCover";

export function StoryMetaLine({
  story,
  lang,
  showDate = true,
}: {
  story: StoryMeta;
  lang: Lang;
  showDate?: boolean;
}) {
  const copy = t(lang).common;

  return (
    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
      <span className="font-medium text-accent">
        {genreName(story.genre, lang)}
      </span>
      <span aria-hidden="true">·</span>
      <span>{copy.minRead(story.readingMinutes)}</span>
      {showDate && (
        <>
          <span aria-hidden="true">·</span>
          <time dateTime={story.date}>{formatDate(story.date, lang)}</time>
        </>
      )}
    </p>
  );
}

/** Standard feed row: cover on the left, everything else on the right. */
export function StoryCard({
  story,
  lang,
}: {
  story: StoryMeta;
  lang: Lang;
}) {
  const copy = t(lang).common;
  const href = path(lang, `/story/${story.slug}`);

  return (
    <article className="group relative flex gap-4 py-7 sm:gap-6">
      <Link
        href={href}
        className="w-[5.5rem] shrink-0 transition-transform duration-300 ease-[var(--ease-out-soft)] group-hover:-translate-y-0.5 sm:w-28"
      >
        <StoryCover story={story} lang={lang} className="aspect-3/4" showAuthor={false} />
      </Link>

      <div className="min-w-0 flex-1">
        <StoryMetaLine story={story} lang={lang} />

        <h2 className="mt-1.5 text-xl leading-snug sm:text-[1.4rem]">
          <Link href={href} className="transition-colors group-hover:text-accent">
            {story.title}
          </Link>
        </h2>

        <p className="mt-1 text-sm text-ink-soft">
          {copy.by} <span className="font-medium">{story.author}</span>
        </p>

        <p className="clamp-2 mt-2.5 font-[family-name:var(--font-body)] text-[0.975rem] leading-relaxed text-ink-soft sm:clamp-3">
          {story.excerpt}
        </p>

        <div className="mt-3.5 flex items-center gap-2">
          <BookmarkButton slug={story.slug} lang={lang} />
          {story.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-paper-deep px-2.5 py-1 text-[0.6875rem] text-muted"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

/** Small row for sidebars and "read next" lists. */
export function StoryCardCompact({
  story,
  lang,
  index,
}: {
  story: StoryMeta;
  lang: Lang;
  index?: number;
}) {
  const copy = t(lang).common;
  const href = path(lang, `/story/${story.slug}`);

  return (
    <article className="group relative flex items-center gap-3.5">
      {typeof index === "number" && (
        <span className="w-5 shrink-0 font-[family-name:var(--font-display)] text-lg text-line">
          {index + 1}
        </span>
      )}
      <Link href={href} className="w-11 shrink-0">
        <StoryCover story={story} lang={lang} className="aspect-3/4" showAuthor={false} />
      </Link>
      <div className="min-w-0">
        <h3 className="clamp-2 text-[0.9375rem] leading-snug">
          <Link href={href} className="transition-colors group-hover:text-accent">
            {story.title}
          </Link>
        </h3>
        <p className="mt-0.5 text-xs text-muted">
          {genreName(story.genre, lang)} · {copy.minRead(story.readingMinutes)}
        </p>
      </div>
    </article>
  );
}

/** Hero treatment for the featured story at the top of the feed. */
export function FeaturedStory({
  story,
  lang,
}: {
  story: StoryMeta;
  lang: Lang;
}) {
  const copy = t(lang).common;
  const href = path(lang, `/story/${story.slug}`);

  return (
    <article className="group relative grid items-center gap-7 sm:grid-cols-[minmax(0,11rem)_1fr] sm:gap-9 lg:grid-cols-[minmax(0,13rem)_1fr]">
      <Link
        href={href}
        className="block max-w-[11rem] transition-transform duration-500 ease-[var(--ease-out-soft)] group-hover:-translate-y-1 sm:max-w-none"
      >
        <StoryCover story={story} lang={lang} className="aspect-3/4" />
      </Link>

      <div>
        <p className="eyebrow text-accent">{copy.editorsPick}</p>
        <h2 className="mt-2.5 text-3xl leading-[1.12] sm:text-4xl lg:text-[2.75rem]">
          <Link href={href} className="transition-colors group-hover:text-accent">
            {story.title}
          </Link>
        </h2>
        <p className="mt-3 text-sm text-ink-soft">
          {copy.by} <span className="font-medium">{story.author}</span>
        </p>
        <p className="mt-4 max-w-xl font-[family-name:var(--font-body)] text-lg leading-relaxed text-ink-soft">
          {story.excerpt}
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link href={href} className="btn btn-primary">
            {copy.readFor(story.readingMinutes)}
          </Link>
          <BookmarkButton slug={story.slug} lang={lang} />
          <Link
            href={path(lang, `/genre/${story.genre}`)}
            className="pill relative z-10"
          >
            {copy.more(genreName(story.genre, lang))}
          </Link>
        </div>
      </div>
    </article>
  );
}
