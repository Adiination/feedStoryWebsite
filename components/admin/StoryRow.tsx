import Link from "next/link";
import { togglePublishedAction } from "@/lib/admin-actions";
import { DeleteStoryButton } from "./DeleteStoryButton";
import type { AdminStory } from "@/lib/admin-store";
import { genreName } from "@/lib/genres";
import { LOCALE_META } from "@/lib/i18n";

export function StoryRow({ story }: { story: AdminStory }) {
  return (
    <article className="flex flex-wrap items-center gap-x-4 gap-y-3 py-4">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-2 py-0.5 text-[0.625rem] font-semibold tracking-wide uppercase ${
              story.published
                ? "bg-forest/25 text-ink"
                : "bg-paper-deep text-muted"
            }`}
          >
            {story.published ? "Live" : "Draft"}
          </span>
          {story.featured && (
            <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[0.625rem] font-semibold tracking-wide text-accent-deep uppercase">
              Featured
            </span>
          )}
          <span className="text-xs text-muted">
            {LOCALE_META[story.lang].short} ·{" "}
            {genreName(story.genre, story.lang)} · {story.readingMinutes} min ·{" "}
            {story.date}
          </span>
        </div>

        <h2 className="mt-1.5 truncate font-[family-name:var(--font-display)] text-lg font-semibold">
          <Link
            href={`/admin/stories/${story.id}`}
            className="transition-colors hover:text-accent"
          >
            {story.title}
          </Link>
        </h2>
        <p className="truncate text-xs text-muted">
          /{story.lang}/story/{story.slug}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Link href={`/admin/stories/${story.id}`} className="pill">
          Edit
        </Link>

        <form action={togglePublishedAction}>
          <input type="hidden" name="id" value={story.id} />
          <input type="hidden" name="next" value={story.published ? "0" : "1"} />
          <button type="submit" className="pill">
            {story.published ? "Unpublish" : "Publish"}
          </button>
        </form>

        <DeleteStoryButton id={story.id} title={story.title} />
      </div>
    </article>
  );
}
