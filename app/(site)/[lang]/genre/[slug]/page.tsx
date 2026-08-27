import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/AdSlot";
import { StoryFeed } from "@/components/StoryFeed";
import { GENRES, getGenre } from "@/lib/genres";
import {
  DEFAULT_LANG,
  isLang,
  LOCALES,
  LOCALE_META,
  path,
  t,
  type Lang,
} from "@/lib/i18n";
import { site } from "@/lib/site";
import { getGenreCounts, getStoriesByGenre } from "@/lib/stories";

export function generateStaticParams() {
  return LOCALES.flatMap((lang) =>
    GENRES.map((genre) => ({ lang, slug: genre.slug })),
  );
}

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/genre/[slug]">): Promise<Metadata> {
  const { lang: raw, slug } = await params;
  if (!isLang(raw)) return { title: "Not found" };
  const lang: Lang = raw;

  const genre = getGenre(slug);
  if (!genre) return { title: "Category not found" };

  const count = (await getStoriesByGenre(lang, genre.slug)).length;
  const name = genre.name[lang];

  return {
    title: `${name} stories`,
    description: `${genre.blurb[lang]} ${count} ${t(lang).common.stories(count)}.`,
    alternates: {
      canonical: `/${lang}/genre/${genre.slug}`,
      languages: {
        ...Object.fromEntries(
          LOCALES.map((locale) => [
            LOCALE_META[locale].htmlLang,
            `/${locale}/genre/${genre.slug}`,
          ]),
        ),
        "x-default": `/${DEFAULT_LANG}/genre/${genre.slug}`,
      },
    },
    openGraph: {
      type: "website",
      title: `${name} · ${site.name}`,
      description: genre.blurb[lang],
      url: `${site.url}/${lang}/genre/${genre.slug}`,
      locale: LOCALE_META[lang].ogLocale,
    },
    other: { rating: "RTA-5042-1996-1400-1577-RTA" },
  };
}

export default async function GenrePage({
  params,
}: PageProps<"/[lang]/genre/[slug]">) {
  const { lang: raw, slug } = await params;
  if (!isLang(raw)) notFound();
  const lang: Lang = raw;

  const genre = getGenre(slug);
  if (!genre) notFound();

  const copy = t(lang);
  const [stories, counts] = await Promise.all([
    getStoriesByGenre(lang, genre.slug),
    getGenreCounts(lang),
  ]);
  const others = GENRES.filter((g) => g.slug !== genre.slug && counts[g.slug]);

  return (
    <div className="shell">
      <header
        className="relative overflow-hidden rounded-b-[var(--radius-card)] px-6 py-14 text-white md:px-12 md:py-20"
        style={{
          backgroundImage: `linear-gradient(135deg, ${genre.from}, ${genre.to})`,
        }}
      >
        <div
          className="absolute inset-0 opacity-[0.12] mix-blend-overlay"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, rgba(255,255,255,0.6) 0 1px, transparent 1px 5px)",
          }}
        />
        <div className="relative">
          <nav aria-label="Breadcrumb" className="text-xs text-white/70">
            <Link href={path(lang)} className="hover:text-white">
              {copy.nav.feed}
            </Link>
            <span className="mx-2" aria-hidden="true">
              /
            </span>
            <Link href={path(lang, "/genres")} className="hover:text-white">
              {copy.genres.title}
            </Link>
          </nav>

          <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl">
            {genre.name[lang]}
          </h1>
          <p className="mt-4 max-w-xl font-[family-name:var(--font-body)] text-lg leading-relaxed text-white/85">
            {genre.blurb[lang]}
          </p>
          <p className="mt-6 text-sm text-white/70">
            {stories.length} {copy.common.stories(stories.length)}
          </p>
        </div>
      </header>

      <div className="grid gap-12 py-12 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-14">
        <section>
          <StoryFeed stories={stories} lang={lang} />
        </section>

        <aside className="space-y-10 lg:sticky lg:top-24 lg:self-start">
          <AdSlot placement="sidebar" />

          {others.length > 0 && (
            <section className="card p-5">
              <h2 className="eyebrow">{copy.common.otherCategories}</h2>
              <ul className="mt-4 space-y-1">
                {others.map((other) => (
                  <li key={other.slug}>
                    <Link
                      href={path(lang, `/genre/${other.slug}`)}
                      className="flex items-baseline justify-between gap-3 py-1.5 text-sm text-ink-soft transition-colors hover:text-accent"
                    >
                      <span>{other.name[lang]}</span>
                      <span className="text-xs text-muted">
                        {counts[other.slug]}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
