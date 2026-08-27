import { genreName, genrePalette } from "@/lib/genres";
import type { Lang } from "@/lib/i18n";

type CoverStory = {
  slug: string;
  title: string;
  author: string;
  genre: string;
};

/** Stable per-slug number so a story's cover never changes between builds. */
function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/**
 * Typographic cover art generated from the story's genre + slug.
 * Sizes itself entirely in container units (cqi), so the same component works
 * at 90px in the feed and 400px in the hero with no size props to keep in sync.
 */
export function StoryCover({
  story,
  lang,
  className = "",
  showAuthor = true,
}: {
  story: CoverStory;
  lang: Lang;
  className?: string;
  showAuthor?: boolean;
}) {
  const { from, to } = genrePalette(story.genre);
  const seed = hash(story.slug);
  const angle = 145 + (seed % 55);
  const blobX = 60 + (seed % 30);
  const blobY = 70 + ((seed >> 3) % 25);

  return (
    <div
      aria-hidden="true"
      className={`relative overflow-hidden rounded-[0.4rem] ring-1 ring-white/12 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.8)] ${className}`}
      style={{
        containerType: "inline-size",
        backgroundImage: `radial-gradient(circle at ${blobX}% ${blobY}%, ${to}, transparent 62%), linear-gradient(${angle}deg, ${from}, ${to})`,
        backgroundColor: from,
      }}
    >
      {/* book-spine shading down the left edge */}
      <div
        className="absolute inset-y-0 left-0 w-[5cqi]"
        style={{
          background:
            "linear-gradient(to right, rgba(0,0,0,0.28), rgba(0,0,0,0.04) 60%, rgba(255,255,255,0.08))",
        }}
      />
      {/* woven paper texture */}
      <div
        className="absolute inset-0 opacity-[0.14] mix-blend-overlay"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, rgba(255,255,255,0.5) 0 1px, transparent 1px 4px), repeating-linear-gradient(-45deg, rgba(0,0,0,0.4) 0 1px, transparent 1px 5px)",
        }}
      />
      {/* inset keyline */}
      <div className="absolute inset-[5.5cqi] rounded-[0.15rem] border border-white/25" />

      <div className="relative flex h-full flex-col justify-between p-[10cqi] text-white">
        <span
          className="font-medium uppercase"
          style={{
            fontSize: "4.6cqi",
            letterSpacing: "0.22em",
            color: "rgba(255,255,255,0.68)",
          }}
        >
          {genreName(story.genre, lang)}
        </span>

        <h3
          className="font-[family-name:var(--font-display)] font-semibold"
          style={{
            fontSize: "10.5cqi",
            lineHeight: 1.12,
            letterSpacing: "-0.015em",
            textWrap: "balance",
            textShadow: "0 1px 12px rgba(0,0,0,0.28)",
          }}
        >
          {story.title}
        </h3>

        <div>
          <div className="mb-[3.5cqi] h-px w-[26cqi] bg-white/40" />
          {showAuthor && (
            <span
              className="block"
              style={{
                fontSize: "4.4cqi",
                letterSpacing: "0.06em",
                color: "rgba(255,255,255,0.78)",
              }}
            >
              {story.author}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
