"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { saveStoryAction, type ActionState } from "@/lib/admin-actions";
import { GENRES } from "@/lib/genres";
import { LOCALES, LOCALE_META } from "@/lib/i18n";
import type { AdminStory } from "@/lib/admin-store";

const WORDS_PER_MINUTE = 225;

/** Mirror of lib/stories.ts slugify, for the live URL preview. */
function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function Field({
  label,
  hint,
  htmlFor,
  children,
}: {
  label: string;
  hint?: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="eyebrow mb-2 block">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
    </div>
  );
}

const inputClass =
  "w-full rounded-[var(--radius-card)] border border-line bg-card px-3.5 py-2.5 text-ink placeholder:text-muted focus:border-accent focus:outline-none";

export function StoryForm({ story }: { story?: AdminStory }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    saveStoryAction,
    undefined,
  );

  const [title, setTitle] = useState(story?.title ?? "");
  const [slug, setSlug] = useState(story?.slug ?? "");
  const [lang, setLang] = useState(story?.lang ?? "en");
  const [body, setBody] = useState(story?.body ?? "");

  const effectiveSlug = slugify(slug || title);

  const stats = useMemo(() => {
    const words = body
      .replace(/```[\s\S]*?```/g, "")
      .replace(/[*_`>#]/g, "")
      .split(/\s+/)
      .filter(Boolean).length;
    return { words, minutes: Math.max(1, Math.round(words / WORDS_PER_MINUTE)) };
  }, [body]);

  return (
    <form action={action} className="grid gap-8 lg:grid-cols-[1fr_20rem]">
      {story && <input type="hidden" name="id" value={story.id} />}

      {/* ------------------------------------------------------------ body */}
      <div className="space-y-5">
        <Field label="Title" htmlFor="title">
          <input
            id="title"
            name="title"
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Aakhri Train Ghar Ki"
            className={`${inputClass} font-[family-name:var(--font-display)] text-xl`}
          />
        </Field>

        <Field
          label="URL slug"
          htmlFor="slug"
          hint={
            effectiveSlug
              ? `/${lang}/story/${effectiveSlug}`
              : "Generated from the title if left blank."
          }
        >
          <input
            id="slug"
            name="slug"
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
            placeholder={slugify(title) || "auto-from-title"}
            className={inputClass}
          />
        </Field>

        <Field
          label="Story"
          htmlFor="body"
          hint={`Markdown. Blank line between paragraphs; three dashes alone on a line makes a scene break. ${stats.words.toLocaleString()} words · ~${stats.minutes} min read.`}
        >
          <textarea
            id="body"
            name="body"
            required
            rows={26}
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder={"First paragraph gets the drop cap.\n\nNext paragraph.\n\n---\n\nAfter a scene break."}
            className={`${inputClass} resize-y font-[family-name:var(--font-body)] text-base leading-relaxed`}
          />
        </Field>

        <Field
          label="Excerpt"
          htmlFor="excerpt"
          hint="Shown on the feed, in Google results and on share cards. Left blank, it's generated from your opening lines."
        >
          <textarea
            id="excerpt"
            name="excerpt"
            rows={3}
            defaultValue={story?.excerpt ?? ""}
            className={`${inputClass} resize-y`}
          />
        </Field>
      </div>

      {/* ----------------------------------------------------------- sidebar */}
      <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
        <div className="card space-y-4 p-5">
          {state?.error && (
            <p
              role="alert"
              className="rounded-[var(--radius-card)] border border-accent/50 bg-accent-wash px-3 py-2.5 text-sm text-ink"
            >
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="btn btn-primary w-full py-3 disabled:opacity-60"
          >
            {pending ? "Saving…" : story ? "Save changes" : "Create story"}
          </button>

          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              name="published"
              defaultChecked={story?.published ?? false}
              className="mt-0.5 size-4 accent-[var(--color-accent)]"
            />
            <span>
              <span className="font-medium text-ink">Published</span>
              <span className="mt-0.5 block text-xs text-muted">
                Unchecked keeps it a draft — invisible on the site.
              </span>
            </span>
          </label>

          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={story?.featured ?? false}
              className="mt-0.5 size-4 accent-[var(--color-accent)]"
            />
            <span>
              <span className="font-medium text-ink">Featured</span>
              <span className="mt-0.5 block text-xs text-muted">
                Takes the hero slot. Unsets the previous one in this language.
              </span>
            </span>
          </label>

          {story && (
            <div className="flex flex-wrap gap-2 border-t border-line-soft pt-4">
              <Link
                href={`/admin/stories/${story.id}/preview`}
                className="pill"
              >
                Preview
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
          )}
        </div>

        <div className="card space-y-5 p-5">
          <Field label="Language" htmlFor="lang">
            <select
              id="lang"
              name="lang"
              value={lang}
              onChange={(event) =>
                setLang(event.target.value as (typeof LOCALES)[number])
              }
              className={inputClass}
            >
              {LOCALES.map((locale) => (
                <option key={locale} value={locale}>
                  {LOCALE_META[locale].label} ({locale})
                </option>
              ))}
            </select>
          </Field>

          <Field label="Category" htmlFor="genre">
            <select
              id="genre"
              name="genre"
              required
              defaultValue={story?.genre ?? ""}
              className={inputClass}
            >
              <option value="" disabled>
                Choose…
              </option>
              {GENRES.map((genre) => (
                <option key={genre.slug} value={genre.slug}>
                  {genre.name.en}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Author" htmlFor="author">
            <input
              id="author"
              name="author"
              defaultValue={story?.author ?? ""}
              placeholder="Anonymous"
              className={inputClass}
            />
          </Field>

          <Field label="Date" htmlFor="date" hint="Controls feed order.">
            <input
              id="date"
              name="date"
              type="date"
              defaultValue={story?.date ?? new Date().toISOString().slice(0, 10)}
              className={inputClass}
            />
          </Field>

          <Field
            label="Tags"
            htmlFor="tags"
            hint="Comma separated. Drives the 'read next' suggestions."
          >
            <input
              id="tags"
              name="tags"
              defaultValue={story?.tags.join(", ") ?? ""}
              placeholder="office, slow-burn"
              className={inputClass}
            />
          </Field>

          <Field
            label="Translation of"
            htmlFor="translationOf"
            hint="Slug of the same story in the other language. Set it on both stories to link them."
          >
            <input
              id="translationOf"
              name="translationOf"
              defaultValue={story?.translationOf ?? ""}
              placeholder="the-last-train-home"
              className={inputClass}
            />
          </Field>
        </div>

        <p className="px-1 text-xs leading-relaxed text-muted">
          All characters must be fictional adults aged 18 or over. No real or
          identifiable people.
        </p>
      </aside>
    </form>
  );
}
