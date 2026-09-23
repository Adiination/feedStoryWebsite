import type { MetadataRoute } from "next";
import { GENRES } from "@/lib/genres";
import { DEFAULT_LANG, LOCALES, LOCALE_META } from "@/lib/i18n";
import { site } from "@/lib/site";
import { getAllStories, getStoriesByGenre } from "@/lib/stories";

/** hreflang alternates for a path that exists in every locale. */
function alternates(subpath: string) {
  return {
    languages: {
      ...Object.fromEntries(
        LOCALES.map((locale) => [
          LOCALE_META[locale].htmlLang,
          `${site.url}/${locale}${subpath}`,
        ]),
      ),
      "x-default": `${site.url}/${DEFAULT_LANG}${subpath}`,
    },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  for (const lang of LOCALES) {
    const stories = await getAllStories(lang);
    const newest = stories[0]?.date ?? "2026-01-01";
    const base = `${site.url}/${lang}`;

    entries.push(
      {
        url: base,
        lastModified: newest,
        changeFrequency: "daily",
        priority: 1,
        alternates: alternates(""),
      },
      {
        url: `${base}/stories`,
        lastModified: newest,
        changeFrequency: "daily",
        priority: 0.8,
        alternates: alternates("/stories"),
      },
      {
        url: `${base}/genres`,
        lastModified: newest,
        changeFrequency: "weekly",
        priority: 0.7,
        alternates: alternates("/genres"),
      },
    );

    for (const genre of GENRES) {
      const inGenre = await getStoriesByGenre(lang, genre.slug);
      entries.push({
        url: `${base}/genre/${genre.slug}`,
        lastModified: inGenre[0]?.date ?? newest,
        changeFrequency: "weekly",
        priority: 0.7,
        alternates: alternates(`/genre/${genre.slug}`),
      });
    }

    // Story slugs are locale-specific, so these get no hreflang alternates
    // unless the author linked a translation — the story page emits those in
    // its own <head>, where Google reads them just as happily.
    for (const story of stories) {
      entries.push({
        url: `${base}/story/${story.slug}`,
        lastModified: story.date,
        changeFrequency: "yearly",
        priority: 0.9,
      });
    }

    for (const page of ["/about", "/terms", "/privacy", "/2257", "/dmca"]) {
      entries.push({
        url: `${base}${page}`,
        changeFrequency: "yearly",
        priority: 0.3,
      });
    }
  }

  return entries;
}

// Prerendered, but re-read hourly so newly published stories get indexed.
export const revalidate = 3600;
