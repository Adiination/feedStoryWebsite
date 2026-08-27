import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { StoryCover } from "@/components/StoryCover";
import { isAuthenticated } from "@/lib/admin-auth";
import { getStoryById } from "@/lib/admin-store";
import { genreName } from "@/lib/genres";
import { renderStoryMarkdown } from "@/lib/render";
import { formatDate } from "@/lib/stories";

/**
 * Renders a draft with the real reading styles, so you can check a story
 * before publishing it. Uses the same markdown pipeline as the public page —
 * a preview that renders differently is worse than no preview.
 */
export default async function PreviewPage({
  params,
}: PageProps<"/admin/stories/[id]/preview">) {
  if (!(await isAuthenticated())) redirect("/admin/login");

  const { id } = await params;
  const story = await getStoryById(id);
  if (!story) notFound();

  const html = await renderStoryMarkdown(story.body);

  return (
    <div>
      <div className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur-md">
        <div className="shell flex h-14 flex-wrap items-center justify-between gap-3">
          <p className="text-xs tracking-widest text-muted uppercase">
            Preview {story.published ? "· live" : "· draft"}
          </p>
          <div className="flex gap-2">
            <Link href={`/admin/stories/${story.id}`} className="pill">
              ← Back to editor
            </Link>
            {story.published && (
              <Link
                href={`/${story.lang}/story/${story.slug}`}
                target="_blank"
                className="pill"
              >
                View live ↗
              </Link>
            )}
          </div>
        </div>
      </div>

      <article className="shell">
        <header className="border-b border-line py-10 md:py-14">
          <div className="grid gap-8 sm:grid-cols-[1fr_minmax(0,9rem)] sm:items-start sm:gap-12">
            <div>
              <h1 className="text-3xl leading-[1.1] sm:text-4xl lg:text-[3.25rem]">
                {story.title}
              </h1>
              <p className="mt-5 font-[family-name:var(--font-body)] text-lg text-ink-soft">
                {story.author}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-x-2.5 text-sm text-muted">
                <span className="font-medium text-accent">
                  {genreName(story.genre, story.lang)}
                </span>
                <span aria-hidden="true">·</span>
                <span>{story.readingMinutes} min</span>
                <span aria-hidden="true">·</span>
                <span>{story.wordCount.toLocaleString()} words</span>
                <span aria-hidden="true">·</span>
                <span>{formatDate(story.date, story.lang)}</span>
              </div>
            </div>
            <StoryCover
              story={story}
              lang={story.lang}
              className="order-first aspect-3/4 w-32 sm:order-none sm:w-full"
            />
          </div>
        </header>

        <div className="measure py-12 md:py-16">
          <div
            className="prose-story prose-story--lead"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </article>
    </div>
  );
}
