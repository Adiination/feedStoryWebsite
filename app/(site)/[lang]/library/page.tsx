import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LibraryView } from "@/components/LibraryView";
import { DEFAULT_LANG, isLang, LOCALES, t, type Lang } from "@/lib/i18n";
import { getAllStories } from "@/lib/stories";

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/library">): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang: Lang = isLang(raw) ? raw : DEFAULT_LANG;

  return {
    title: t(lang).library.title,
    description: t(lang).library.subtitle,
    alternates: { canonical: `/${lang}/library` },
    robots: { index: false, follow: true },
    other: { rating: "RTA-5042-1996-1400-1577-RTA" },
  };
}

export default async function LibraryPage({
  params,
}: PageProps<"/[lang]/library">) {
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();
  const lang: Lang = raw;

  const copy = t(lang).library;

  return (
    <div className="shell max-w-3xl py-12 md:py-16">
      <header className="mb-9">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h1 className="mt-3 text-4xl sm:text-5xl">{copy.title}</h1>
        <p className="mt-4 max-w-xl font-[family-name:var(--font-body)] text-lg leading-relaxed text-ink-soft">
          {copy.subtitle}
        </p>
      </header>

      <LibraryView stories={await getAllStories(lang)} lang={lang} />
    </div>
  );
}
