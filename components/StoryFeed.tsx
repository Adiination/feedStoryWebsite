import { Fragment } from "react";
import { t, type Lang } from "@/lib/i18n";
import type { StoryMeta } from "@/lib/stories";
import { AdSlot } from "./AdSlot";
import { StoryCard } from "./StoryCard";

/**
 * The feed list. Ads are interleaved after the 3rd and 9th stories — spaced far
 * enough apart that content still dominates the page, which every ad network's
 * review process checks for.
 */
export function StoryFeed({
  stories,
  lang,
  adAfter = [2, 8],
}: {
  stories: StoryMeta[];
  lang: Lang;
  adAfter?: number[];
}) {
  const copy = t(lang).common;

  if (stories.length === 0) {
    return (
      <div className="card px-6 py-14 text-center">
        <p className="font-[family-name:var(--font-display)] text-xl text-ink">
          {copy.nothingHere}
        </p>
        <p className="mt-2 text-sm text-ink-soft">{copy.nothingHereBody}</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-line-soft">
      {stories.map((story, index) => (
        <Fragment key={story.slug}>
          <StoryCard story={story} lang={lang} />
          {adAfter.includes(index) && index < stories.length - 1 && (
            <AdSlot placement="inFeed" className="my-7" />
          )}
        </Fragment>
      ))}
    </div>
  );
}
