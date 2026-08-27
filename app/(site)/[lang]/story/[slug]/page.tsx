import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/AdSlot";
import { BookmarkButton } from "@/components/BookmarkButton";
import { ReadingTracker } from "@/components/ReadingTracker";
import { ShareRow } from "@/components/ShareRow";
import { StoryCardCompact } from "@/components/StoryCard";
import { StoryCover } from "@/components/StoryCover";
import { genreName } from "@/lib/genres";
import { splitAfterParagraph } from "@/lib/html";
import { isLang, LOCALE_META, path, t, type Lang } from "@/lib/i18n";
import { site } from "@/lib/site";
import {
  formatDate,
  getEveryStoryRef,
  getRelatedStories,
  getStory,
  getTranslation,
} from "@/lib/stories";

export function generateStaticParams() {
  return getEveryStoryRef();
}

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/story/[slug]">): Promise<Metadata> {
  const { lang: raw, slug } = await params;
  if (!isLang(raw)) return { title: "Not found" };
  const lang: Lang = raw;

  const story = await getStory(lang, slug);
  if (!story) return { title: "Story not found" };

  const url = `${site.url}/${lang}/story/${story.slug}`;
  const translation = await getTranslation(story);

  return {
    title: story.title,
    description: story.excerpt,
    authors: [{ name: story.author }],
    keywords: [genreName(story.genre, lang), "erotic story", ...story.tags],
    alternates: {
      canonical: `/${lang}/story/${story.slug}`,
      languages: translation
        ? {
            [LOCALE_META[lang].htmlLang]: `/${lang}/story/${story.slug}`,
            [LOCALE_META[translation.lang].htmlLang]: `/${translation.lang}/story/${translation.slug}`,
          }
        : undefined,
    },
    openGraph: {
      type: "article",
      title: story.title,
      description: story.excerpt,
      url,
      publishedTime: story.date,
      authors: [story.author],
      tags: story.tags,
      locale: LOCALE_META[lang].ogLocale,
    },
    twitter: {
      card: "summary_large_image",
      title: story.title,
      description: story.excerpt,
    },
    other: { rating: "RTA-5042-1996-1400-1577-RTA" },
  };
}

export default async function StoryPage({
  params,
}: PageProps<"/[lang]/story/[slug]">) {
  const { lang: raw, slug } = await params;
  if (!isLang(raw)) notFound();
  const lang: Lang = raw;

  const story = await getStory(lang, slug);
  if (!story) notFound();

  const copy = t(lang);
  const [related, translation] = await Promise.all([
    getRelatedStories(story, 4),
    getTranslation(story),
  ]);
  // Six paragraphs in: the reader is committed, and the ad isn't the first
  // thing they meet after the drop cap.
  const { lead, rest } = splitAfterParagraph(story.html, 6);
  const url = `${site.url}/${lang}/story/${story.slug}`;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "ShortStory",
    headline: story.title,
    description: story.excerpt,
    datePublished: story.date,
    author: { "@type": "Person", name: story.author },
    publisher: { "@type": "Organization", name: site.name },
    genre: genreName(story.genre, lang),
    keywords: story.tags.join(", "),
    wordCount: story.wordCount,
    inLanguage: LOCALE_META[lang].htmlLang,
    isFamilyFriendly: false,
    isAccessibleForFree: true,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };

  return (
    <>
      <ReadingTracker slug={story.slug} />

      <article className="shell">
        {/* -------------------------------------------------------- masthead */}
        <header className="border-b border-line py-10 md:py-14">
          <nav aria-label="Breadcrumb" className="mb-6 text-xs text-muted">
            <Link
              href={path(lang)}
              className="transition-colors hover:text-accent"
            >
              {copy.nav.feed}
            </Link>
            <span className="mx-2" aria-hidden="true">
              /
            </span>
            <Link
              href={path(lang, `/genre/${story.genre}`)}
              className="transition-colors hover:text-accent"
            >
              {genreName(story.genre, lang)}
            </Link>
          </nav>

          <div className="grid gap-8 sm:grid-cols-[1fr_minmax(0,9rem)] sm:items-start sm:gap-12">
            <div>
              <h1 className="text-3xl leading-[1.1] sm:text-4xl lg:text-[3.25rem]">
                {story.title}
              </h1>

              <p className="mt-5 font-[family-name:var(--font-body)] text-lg text-ink-soft">
                {copy.common.by}{" "}
                <span className="font-semibold text-ink">{story.author}</span>
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm text-muted">
                <Link
                  href={path(lang, `/genre/${story.genre}`)}
                  className="font-medium text-accent transition-colors hover:text-accent-deep"
                >
                  {genreName(story.genre, lang)}
                </Link>
                <span aria-hidden="true">·</span>
                <span>{copy.common.minRead(story.readingMinutes)}</span>
                <span aria-hidden="true">·</span>
                <span>{copy.common.words(story.wordCount)}</span>
                <span aria-hidden="true">·</span>
                <time dateTime={story.date}>
                  {formatDate(story.date, lang)}
                </time>
              </div>

              {translation && (
                <Link
                  href={path(translation.lang, `/story/${translation.slug}`)}
                  hrefLang={LOCALE_META[translation.lang].htmlLang}
                  className="mt-5 inline-flex items-center gap-2 rounded-full border border-line bg-card px-3.5 py-2 text-sm text-ink-soft transition-colors hover:border-accent hover:text-accent"
                >
                  {copy.langSwitch.readIn(
                    LOCALE_META[translation.lang].label,
                  )}{" "}
                  →
                </Link>
              )}

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <BookmarkButton
                  slug={story.slug}
                  lang={lang}
                  variant="labelled"
                />
                <ShareRow title={story.title} url={url} lang={lang} />
              </div>
            </div>

            <StoryCover
              story={story}
              lang={lang}
              className="order-first aspect-3/4 w-32 sm:order-none sm:w-full"
            />
          </div>
        </header>

        {/* ----------------------------------------------------------- story */}
        <div className="measure py-12 md:py-16">
          {/* The progress bar measures this element, so it has to wrap the
              whole story — both halves and the ad between them. */}
          <div id="story-body">
            <div
              className="prose-story prose-story--lead"
              dangerouslySetInnerHTML={{ __html: lead }}
            />

            {rest && (
              <>
                <AdSlot placement="inArticle" className="my-12" />
                <div
                  className="prose-story"
                  dangerouslySetInnerHTML={{ __html: rest }}
                />
              </>
            )}
          </div>

          {/* ------------------------------------------------------- end matter */}
          <div className="mt-14 border-t border-line pt-8">
            <p className="eyebrow text-center">{copy.common.theEnd}</p>
            <p className="mt-4 text-center font-[family-name:var(--font-body)] text-lg text-ink-soft">
              {copy.common.thanksForReading} —{" "}
              <em className="text-ink">{story.title}</em> · {story.author}
            </p>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <BookmarkButton
                slug={story.slug}
                lang={lang}
                variant="labelled"
              />
              <Link
                href={path(lang, `/genre/${story.genre}`)}
                className="btn btn-ghost"
              >
                {copy.common.more(genreName(story.genre, lang))}
              </Link>
            </div>

            <div className="mt-7 flex justify-center">
              <ShareRow title={story.title} url={url} lang={lang} />
            </div>

            {story.tags.length > 0 && (
              <ul className="mt-9 flex flex-wrap justify-center gap-2">
                {story.tags.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-full bg-paper-deep px-3 py-1 text-xs text-muted"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <AdSlot placement="banner" className="mb-14" />

        {/* --------------------------------------------------------- read next */}
        {related.length > 0 && (
          <section
            aria-labelledby="readnext-heading"
            className="border-t border-line py-12"
          >
            <h2 id="readnext-heading" className="eyebrow">
              {copy.common.readNext}
            </h2>
            <div className="mt-7 grid gap-x-10 gap-y-7 sm:grid-cols-2">
              {related.map((item) => (
                <StoryCardCompact key={item.slug} story={item} lang={lang} />
              ))}
            </div>

            <div className="mt-10">
              <Link href={path(lang)} className="btn btn-primary">
                {copy.common.backToFeed}
              </Link>
            </div>
          </section>
        )}
      </article>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
    </>
  );
}
