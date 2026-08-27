import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StoryCover } from "@/components/StoryCover";
import { GENRES } from "@/lib/genres";
import {
  DEFAULT_LANG,
  isLang,
  LOCALES,
  LOCALE_META,
  path,
  t,
  type Lang,
} from "@/lib/i18n";
import { getAllStories, getGenreCounts } from "@/lib/stories";

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/genres">): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang: Lang = isLang(raw) ? raw : DEFAULT_LANG;

  return {
    title: t(lang).genres.title,
    description: t(lang).genres.subtitle,
    alternates: {
      canonical: `/${lang}/genres`,
      languages: {
        ...Object.fromEntries(
          LOCALES.map((locale) => [
            LOCALE_META[locale].htmlLang,
            `/${locale}/genres`,
          ]),
        ),
        "x-default": `/${DEFAULT_LANG}/genres`,
      },
    },
    other: { rating: "RTA-5042-1996-1400-1577-RTA" },
  };
}

export default async function GenresPage({
  params,
}: PageProps<"/[lang]/genres">) {
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();
  const lang: Lang = raw;

  const copy = t(lang);
  const [counts, allStories] = await Promise.all([
    getGenreCounts(lang),
    getAllStories(lang),
  ]);

  // One query, grouped in memory — a query per category would be 8 round trips.
  const storiesByGenre = allStories.reduce<Record<string, typeof allStories>>(
    (acc, story) => {
      (acc[story.genre] ??= []).push(story);
      return acc;
    },
    {},
  );

  return (
    <div className="shell py-12 md:py-16">
      <header className="border-b border-line pb-10">
        <p className="eyebrow">{copy.genres.eyebrow}</p>
        <h1 className="mt-3 text-4xl sm:text-5xl">{copy.genres.title}</h1>
        <p className="mt-4 max-w-xl font-[family-name:var(--font-body)] text-lg leading-relaxed text-ink-soft">
          {copy.genres.subtitle}
        </p>
      </header>

      <div className="mt-12 grid gap-x-10 gap-y-12 sm:grid-cols-2">
        {GENRES.map((genre) => {
          const stories = storiesByGenre[genre.slug] ?? [];
          const count = counts[genre.slug] ?? 0;

          return (
            <section key={genre.slug}>
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="text-2xl">
                  <Link
                    href={path(lang, `/genre/${genre.slug}`)}
                    className="transition-colors hover:text-accent"
                  >
                    {genre.name[lang]}
                  </Link>
                </h2>
                <span className="text-xs text-muted">
                  {count} {copy.common.stories(count)}
                </span>
              </div>

              <p className="mt-2 max-w-md font-[family-name:var(--font-body)] leading-relaxed text-ink-soft">
                {genre.blurb[lang]}
              </p>

              {stories.length > 0 && (
                <div className="mt-5 flex gap-3">
                  {stories.slice(0, 3).map((story) => (
                    <Link
                      key={story.slug}
                      href={path(lang, `/story/${story.slug}`)}
                      className="w-20 transition-transform duration-300 hover:-translate-y-1"
                      title={story.title}
                    >
                      <StoryCover
                        story={story}
                        lang={lang}
                        className="aspect-3/4"
                        showAuthor={false}
                      />
                    </Link>
                  ))}
                </div>
              )}

              <Link
                href={path(lang, `/genre/${genre.slug}`)}
                className="mt-5 inline-block text-sm text-accent transition-colors hover:text-accent-deep"
              >
                {copy.common.browseCategory(genre.name[lang])} →
              </Link>
            </section>
          );
        })}
      </div>
    </div>
  );
}
