"use client";

import Link from "next/link";
import { useState } from "react";
import { genreName } from "@/lib/genres";
import { path, t, type Lang } from "@/lib/i18n";
import {
  clearBookmarks,
  clearHistory,
  removeBookmark,
  removeFromHistory,
} from "@/lib/reader-store";
import type { StoryMeta } from "@/lib/stories";
import { useReader } from "@/lib/use-reader";
import { StoryCover } from "./StoryCover";

type Tab = "saved" | "history";

export function LibraryView({
  stories,
  lang,
}: {
  stories: StoryMeta[];
  lang: Lang;
}) {
  const copy = t(lang).library;
  const { bookmarks, history, ready } = useReader();
  const [tab, setTab] = useState<Tab>("saved");

  const bySlug = new Map(stories.map((story) => [story.slug, story]));
  const resolve = (slug: string) => bySlug.get(slug);

  const saved = bookmarks
    .map(resolve)
    .filter((story): story is StoryMeta => Boolean(story));

  const read = history
    .map((entry) => {
      const story = resolve(entry.slug);
      return story ? { story, entry } : null;
    })
    .filter(
      (item): item is { story: StoryMeta; entry: (typeof history)[number] } =>
        Boolean(item),
    );

  if (!ready) {
    return (
      <div className="py-16 text-center text-sm text-muted">{copy.loading}</div>
    );
  }

  const items = tab === "saved" ? saved : read;

  return (
    <div>
      <div className="flex items-center justify-between gap-4 border-b border-line pb-3">
        <div className="flex gap-1">
          <TabButton
            active={tab === "saved"}
            onClick={() => setTab("saved")}
            label={copy.savedTab}
            count={saved.length}
          />
          <TabButton
            active={tab === "history"}
            onClick={() => setTab("history")}
            label={copy.historyTab}
            count={read.length}
          />
        </div>

        {items.length > 0 && (
          <button
            type="button"
            onClick={() => (tab === "saved" ? clearBookmarks() : clearHistory())}
            className="text-xs text-muted transition-colors hover:text-accent"
          >
            {copy.clearAll}
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <EmptyState tab={tab} lang={lang} />
      ) : (
        <ul className="divide-y divide-line-soft">
          {tab === "saved"
            ? saved.map((story) => (
                <li key={story.slug}>
                  <Row
                    story={story}
                    lang={lang}
                    onRemove={() => removeBookmark(story.slug)}
                    removeLabel={copy.removeSaved}
                  />
                </li>
              ))
            : read.map(({ story, entry }) => (
                <li key={story.slug}>
                  <Row
                    story={story}
                    lang={lang}
                    progress={entry.progress}
                    onRemove={() => removeFromHistory(story.slug)}
                    removeLabel={copy.removeHistory}
                  />
                </li>
              ))}
        </ul>
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full px-4 py-2 text-sm transition-colors ${
        active
          ? "bg-accent text-white"
          : "text-ink-soft hover:bg-paper-deep hover:text-ink"
      }`}
    >
      {label}
      <span className={active ? "ml-2 text-white/70" : "ml-2 text-muted"}>
        {count}
      </span>
    </button>
  );
}

function Row({
  story,
  lang,
  progress,
  onRemove,
  removeLabel,
}: {
  story: StoryMeta;
  lang: Lang;
  progress?: number;
  onRemove: () => void;
  removeLabel: string;
}) {
  const common = t(lang).common;
  const href = path(lang, `/story/${story.slug}`);

  return (
    <article className="group flex items-center gap-4 py-5">
      <Link href={href} className="w-14 shrink-0">
        <StoryCover
          story={story}
          lang={lang}
          className="aspect-3/4"
          showAuthor={false}
        />
      </Link>

      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted">
          <span className="font-medium text-accent">
            {genreName(story.genre, lang)}
          </span>
          {" · "}
          {common.minRead(story.readingMinutes)}
          {typeof progress === "number" &&
            ` · ${common.percentRead(Math.round(progress * 100))}`}
        </p>
        <h2 className="mt-1 text-lg leading-snug">
          <Link href={href} className="transition-colors group-hover:text-accent">
            {story.title}
          </Link>
        </h2>
        <p className="mt-0.5 text-sm text-ink-soft">
          {common.by} {story.author}
        </p>

        {typeof progress === "number" && (
          <div className="mt-2.5 h-1 max-w-48 overflow-hidden rounded-full bg-paper-deep">
            <div
              className="h-full rounded-full bg-accent"
              style={{ width: `${Math.max(3, progress * 100)}%` }}
            />
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onRemove}
        aria-label={removeLabel}
        title={removeLabel}
        className="grid size-9 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-paper-deep hover:text-accent"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
    </article>
  );
}

function EmptyState({ tab, lang }: { tab: Tab; lang: Lang }) {
  const copy = t(lang).library;

  return (
    <div className="py-20 text-center">
      <p className="font-[family-name:var(--font-display)] text-2xl text-ink">
        {tab === "saved" ? copy.emptySavedTitle : copy.emptyHistoryTitle}
      </p>
      <p className="mx-auto mt-3 max-w-sm font-[family-name:var(--font-body)] leading-relaxed text-ink-soft">
        {tab === "saved" ? copy.emptySavedBody : copy.emptyHistoryBody}
      </p>
      <Link href={path(lang)} className="btn btn-primary mt-7">
        {t(lang).common.startReading}
      </Link>
      <p className="mt-8 text-xs text-muted">{copy.localOnly}</p>
    </div>
  );
}
