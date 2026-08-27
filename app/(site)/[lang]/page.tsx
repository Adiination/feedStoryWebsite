import Link from "next/link";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/AdSlot";
import { ContinueReading } from "@/components/ContinueReading";
import { FeaturedStory, StoryCardCompact } from "@/components/StoryCard";
import { StoryFeed } from "@/components/StoryFeed";
import { GENRES } from "@/lib/genres";
import { isLang, path, t, type Lang } from "@/lib/i18n";
import { siteMeta } from "@/lib/site";
import { getAllStories, getFeaturedStory, getGenreCounts } from "@/lib/stories";

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();
  const lang: Lang = raw;

  const copy = t(lang);
  const [stories, featured, counts] = await Promise.all([
    getAllStories(lang),
    getFeaturedStory(lang),
    getGenreCounts(lang),
  ]);
  const feed = stories.filter((story) => story.slug !== featured?.slug);
  const longReads = [...stories]
    .sort((a, b) => b.wordCount - a.wordCount)
    .slice(0, 5);

  return (
    <div className="shell">
      {/* ---------------------------------------------------------------- hero */}
      <section className="border-b border-line py-12 md:py-16">
        <p className="eyebrow">{siteMeta[lang].tagline}</p>
        <h1 className="mt-3 max-w-3xl text-4xl leading-[1.08] sm:text-5xl lg:text-6xl">
          {copy.hero.titleLead}{" "}
          <span className="text-accent">{copy.hero.titleAccent}</span>
        </h1>
        <p className="mt-5 max-w-xl font-[family-name:var(--font-body)] text-lg leading-relaxed text-ink-soft">
          {copy.hero.subtitle} {copy.hero.storiesCounting(stories.length)}
        </p>

        <nav
          aria-label={copy.genres.title}
          className="no-scrollbar mt-7 flex gap-2 overflow-x-auto pb-1"
        >
          {GENRES.filter((genre) => counts[genre.slug]).map((genre) => (
            <Link
              key={genre.slug}
              href={path(lang, `/genre/${genre.slug}`)}
              className="pill"
            >
              {genre.name[lang]}
              <span className="text-muted">{counts[genre.slug]}</span>
            </Link>
          ))}
          <Link href={path(lang, "/genres")} className="pill">
            {copy.common.allCategories} →
          </Link>
        </nav>
      </section>

      {featured && (
        <section className="border-b border-line py-12 md:py-14">
          <FeaturedStory story={featured} lang={lang} />
        </section>
      )}

      <ContinueReading stories={stories} lang={lang} />

      {/* ------------------------------------------------------- feed + rail */}
      <div className="grid gap-12 py-12 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-14">
        <section aria-labelledby="latest-heading">
          <div className="flex items-baseline justify-between gap-4 border-b border-line pb-4">
            <h2
              id="latest-heading"
              className="font-[family-name:var(--font-display)] text-2xl"
            >
              {copy.common.latest}
            </h2>
            <Link
              href={path(lang, "/stories")}
              className="text-sm text-accent transition-colors hover:text-accent-deep"
            >
              {copy.common.fullArchive} →
            </Link>
          </div>

          <StoryFeed stories={feed} lang={lang} />
        </section>

        <aside className="space-y-10 lg:sticky lg:top-24 lg:self-start">
          <AdSlot placement="sidebar" />

          {longReads.length > 0 && (
            <section aria-labelledby="longreads-heading">
              <h2 id="longreads-heading" className="eyebrow">
                {copy.common.longest}
              </h2>
              <div className="mt-5 space-y-5">
                {longReads.map((story, index) => (
                  <StoryCardCompact
                    key={story.slug}
                    story={story}
                    lang={lang}
                    index={index}
                  />
                ))}
              </div>
            </section>
          )}

          <section aria-labelledby="browse-heading" className="card p-5">
            <h2 id="browse-heading" className="eyebrow">
              {copy.common.browseByCategory}
            </h2>
            <ul className="mt-4 space-y-1">
              {GENRES.map((genre) => (
                <li key={genre.slug}>
                  <Link
                    href={path(lang, `/genre/${genre.slug}`)}
                    className="flex items-baseline justify-between gap-3 py-1.5 text-sm text-ink-soft transition-colors hover:text-accent"
                  >
                    <span>{genre.name[lang]}</span>
                    <span className="text-xs text-muted">
                      {counts[genre.slug] ?? 0}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
