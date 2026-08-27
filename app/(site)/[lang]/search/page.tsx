import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SearchView } from "@/components/SearchView";
import { DEFAULT_LANG, isLang, t, type Lang } from "@/lib/i18n";
import { getSearchIndex } from "@/lib/stories";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/search">): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang: Lang = isLang(raw) ? raw : DEFAULT_LANG;

  return {
    title: t(lang).search.title,
    description: t(lang).search.placeholder,
    alternates: { canonical: `/${lang}/search` },
    // Query-string result pages are thin duplicates of story pages.
    robots: { index: false, follow: true },
    other: { rating: "RTA-5042-1996-1400-1577-RTA" },
  };
}

export default async function SearchPage({
  params,
  searchParams,
}: PageProps<"/[lang]/search">) {
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();
  const lang: Lang = raw;

  const query = await searchParams;
  const rawQuery = query.q;
  const initialQuery = Array.isArray(rawQuery)
    ? (rawQuery[0] ?? "")
    : (rawQuery ?? "");

  const copy = t(lang).search;

  return (
    <div className="shell max-w-3xl py-12 md:py-16">
      <header className="mb-9">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h1 className="mt-3 text-4xl sm:text-5xl">{copy.title}</h1>
      </header>

      <SearchView
        index={await getSearchIndex(lang)}
        lang={lang}
        initialQuery={initialQuery}
      />
    </div>
  );
}
