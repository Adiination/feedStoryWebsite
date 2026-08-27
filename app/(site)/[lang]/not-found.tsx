import Link from "next/link";
import { DEFAULT_LANG, path, t } from "@/lib/i18n";
import { getAllStories } from "@/lib/stories";
import { StoryCardCompact } from "@/components/StoryCard";

/**
 * 404 inside a locale (a bad story slug, a mistyped category). The locale isn't
 * available to not-found.tsx, so this renders in the default language.
 */
export default async function NotFound() {
  const lang = DEFAULT_LANG;
  const copy = t(lang);
  const suggestions = (await getAllStories(lang)).slice(0, 4);

  return (
    <div className="shell max-w-2xl py-20 text-center md:py-28">
      <p className="eyebrow">404</p>
      <h1 className="mt-4 text-4xl sm:text-5xl">{copy.notFound.title}</h1>
      <p className="mx-auto mt-5 max-w-md font-[family-name:var(--font-body)] text-lg leading-relaxed text-ink-soft">
        {copy.notFound.body}
      </p>

      <div className="mt-10 flex justify-center gap-3">
        <Link href={path(lang)} className="btn btn-primary">
          {copy.common.backToFeed}
        </Link>
        <Link href={path(lang, "/search")} className="btn btn-ghost">
          {copy.notFound.search}
        </Link>
      </div>

      {suggestions.length > 0 && (
        <div className="mt-14 grid gap-6 text-left sm:grid-cols-2">
          {suggestions.map((story) => (
            <StoryCardCompact key={story.slug} story={story} lang={lang} />
          ))}
        </div>
      )}
    </div>
  );
}
