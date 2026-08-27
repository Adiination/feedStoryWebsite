"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { GENRES, genreName } from "@/lib/genres";
import { path, t, type Lang } from "@/lib/i18n";
import type { SearchDoc } from "@/lib/stories";

/** Cheap relevance score — the whole index is a few kilobytes, so no library. */
function score(doc: SearchDoc, terms: string[], lang: Lang): number {
  const title = doc.title.toLowerCase();
  const author = doc.author.toLowerCase();
  const genre = genreName(doc.genre, lang).toLowerCase();
  const tags = doc.tags.join(" ").toLowerCase();
  const excerpt = doc.excerpt.toLowerCase();

  let total = 0;

  for (const term of terms) {
    let hit = 0;
    if (title.startsWith(term)) hit += 14;
    else if (title.includes(term)) hit += 10;
    if (author.includes(term)) hit += 7;
    if (genre.includes(term)) hit += 5;
    if (tags.includes(term)) hit += 4;
    if (excerpt.includes(term)) hit += 2;
    // Every term has to land somewhere, otherwise it isn't a match.
    if (hit === 0) return 0;
    total += hit;
  }

  return total;
}

export function SearchView({
  index,
  lang,
  initialQuery = "",
}: {
  index: SearchDoc[];
  lang: Lang;
  initialQuery?: string;
}) {
  const copy = t(lang).search;
  const common = t(lang).common;
  const [query, setQuery] = useState(initialQuery);

  const terms = useMemo(
    () =>
      query
        .toLowerCase()
        .split(/\s+/)
        .map((term) => term.trim())
        .filter(Boolean),
    [query],
  );

  const results = useMemo(() => {
    if (terms.length === 0) return [];
    return index
      .map((doc) => ({ doc, value: score(doc, terms, lang) }))
      .filter((entry) => entry.value > 0)
      .sort((a, b) => b.value - a.value)
      .map((entry) => entry.doc);
  }, [index, terms, lang]);

  const searching = terms.length > 0;

  return (
    <div>
      <div className="relative">
        <span className="pointer-events-none absolute top-1/2 left-5 -translate-y-1/2 text-muted">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
        </span>

        <input
          type="search"
          value={query}
          autoFocus
          onChange={(event) => setQuery(event.target.value)}
          placeholder={copy.placeholder}
          aria-label={copy.inputLabel}
          className="w-full rounded-full border border-line bg-card py-4 pr-5 pl-13 font-[family-name:var(--font-body)] text-lg text-ink placeholder:text-muted focus:border-ink-soft focus:outline-none"
        />
      </div>

      {!searching && (
        <div className="mt-10">
          <h2 className="eyebrow">{copy.orStartWith}</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {GENRES.map((genre) => (
              <Link
                key={genre.slug}
                href={path(lang, `/genre/${genre.slug}`)}
                className="pill"
              >
                {genre.name[lang]}
              </Link>
            ))}
          </div>
        </div>
      )}

      {searching && (
        <div className="mt-8">
          <p className="text-sm text-muted" role="status" aria-live="polite">
            {results.length === 0
              ? copy.noResults
              : copy.resultCount(results.length)}
          </p>

          <ul className="mt-2 divide-y divide-line-soft">
            {results.map((doc) => (
              <li key={doc.slug}>
                <Link
                  href={path(lang, `/story/${doc.slug}`)}
                  className="group block py-6"
                >
                  <p className="flex items-center gap-2 text-xs text-muted">
                    <span className="font-medium text-accent">
                      {genreName(doc.genre, lang)}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{common.minRead(doc.readingMinutes)}</span>
                  </p>
                  <h3 className="mt-1.5 font-[family-name:var(--font-display)] text-xl font-semibold transition-colors group-hover:text-accent">
                    {doc.title}
                  </h3>
                  <p className="mt-1 text-sm text-ink-soft">
                    {common.by} {doc.author}
                  </p>
                  <p className="clamp-2 mt-2 font-[family-name:var(--font-body)] text-[0.975rem] leading-relaxed text-ink-soft">
                    {doc.excerpt}
                  </p>
                </Link>
              </li>
            ))}
          </ul>

          {results.length === 0 && (
            <p className="mt-4 font-[family-name:var(--font-body)] text-ink-soft">
              {copy.noResultsHint}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
