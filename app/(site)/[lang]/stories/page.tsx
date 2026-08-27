import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { genreName } from "@/lib/genres";
import {
  DEFAULT_LANG,
  isLang,
  LOCALES,
  LOCALE_META,
  path,
  t,
  type Lang,
} from "@/lib/i18n";
import { formatDate, getAllStories, type StoryMeta } from "@/lib/stories";

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/stories">): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang: Lang = isLang(raw) ? raw : DEFAULT_LANG;
  const count = (await getAllStories(lang)).length;

  return {
    title: t(lang).archive.title,
    description: t(lang).archive.subtitle(count),
    alternates: {
      canonical: `/${lang}/stories`,
      languages: {
        ...Object.fromEntries(
          LOCALES.map((locale) => [
            LOCALE_META[locale].htmlLang,
            `/${locale}/stories`,
          ]),
        ),
        "x-default": `/${DEFAULT_LANG}/stories`,
      },
    },
    other: { rating: "RTA-5042-1996-1400-1577-RTA" },
  };
}

function monthLabel(iso: string, lang: Lang): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString(
    lang === "hi" ? "en-IN" : "en-US",
    { month: "long", year: "numeric", timeZone: "UTC" },
  );
}

export default async function StoriesPage({
  params,
}: PageProps<"/[lang]/stories">) {
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();
  const lang: Lang = raw;

  const copy = t(lang);
  const stories = await getAllStories(lang);

  // Group by month so the archive reads like a table of contents.
  const groups = stories.reduce<{ label: string; items: StoryMeta[] }[]>(
    (acc, story) => {
      const label = monthLabel(story.date, lang);
      const last = acc.at(-1);
      if (last && last.label === label) last.items.push(story);
      else acc.push({ label, items: [story] });
      return acc;
    },
    [],
  );

  return (
    <div className="shell max-w-3xl py-12 md:py-16">
      <header className="border-b border-line pb-9">
        <p className="eyebrow">{copy.archive.eyebrow}</p>
        <h1 className="mt-3 text-4xl sm:text-5xl">{copy.archive.title}</h1>
        <p className="mt-4 font-[family-name:var(--font-body)] text-lg leading-relaxed text-ink-soft">
          {copy.archive.subtitle(stories.length)}
        </p>
      </header>

      {groups.map((group) => (
        <section key={group.label} className="mt-12">
          <h2 className="eyebrow">{group.label}</h2>
          <ul className="mt-4 divide-y divide-line-soft">
            {group.items.map((story) => (
              <li key={story.slug}>
                <Link
                  href={path(lang, `/story/${story.slug}`)}
                  className="group flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-4"
                >
                  <span className="min-w-0 flex-1">
                    <span className="font-[family-name:var(--font-display)] text-lg font-semibold transition-colors group-hover:text-accent">
                      {story.title}
                    </span>
                    <span className="ml-2 text-sm text-ink-soft">
                      {story.author}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs text-muted">
                    {genreName(story.genre, lang)} ·{" "}
                    {copy.common.minRead(story.readingMinutes)} ·{" "}
                    <time dateTime={story.date}>
                      {formatDate(story.date, lang)}
                    </time>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
