"use client";

import { t, type Lang } from "@/lib/i18n";
import { toggleBookmark } from "@/lib/reader-store";
import { useReader } from "@/lib/use-reader";

export function BookmarkButton({
  slug,
  lang,
  variant = "icon",
  className = "",
}: {
  slug: string;
  lang: Lang;
  variant?: "icon" | "labelled";
  className?: string;
}) {
  const copy = t(lang).story;
  const { bookmarks, ready } = useReader();
  const saved = ready && bookmarks.includes(slug);

  const handleClick = () => toggleBookmark(slug);

  if (variant === "labelled") {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={saved}
        className={`btn ${saved ? "btn-primary" : "btn-ghost"} ${className}`}
      >
        <BookmarkIcon filled={saved} />
        {saved ? copy.saved : copy.save}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={saved}
      aria-label={saved ? copy.removeBookmark : copy.save}
      title={saved ? copy.removeBookmark : copy.save}
      className={`relative z-10 grid size-9 shrink-0 place-items-center rounded-full border transition-colors ${
        saved
          ? "border-accent bg-accent text-white"
          : "border-line bg-card text-muted hover:border-ink-soft hover:text-ink"
      } ${className}`}
    >
      <BookmarkIcon filled={saved} />
    </button>
  );
}

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 3.8h12a1 1 0 0 1 1 1v15.4l-7-4.2-7 4.2V4.8a1 1 0 0 1 1-1Z" />
    </svg>
  );
}
