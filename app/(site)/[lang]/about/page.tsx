import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  DEFAULT_LANG,
  isLang,
  LOCALES,
  LOCALE_META,
  path,
  t,
  type Lang,
} from "@/lib/i18n";
import { site } from "@/lib/site";
import { getAllStories } from "@/lib/stories";

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/about">): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang: Lang = isLang(raw) ? raw : DEFAULT_LANG;

  return {
    title: t(lang).nav.about,
    description: `What ${site.name} publishes, our content rules, and how to submit a story.`,
    alternates: {
      canonical: `/${lang}/about`,
      languages: {
        ...Object.fromEntries(
          LOCALES.map((locale) => [
            LOCALE_META[locale].htmlLang,
            `/${locale}/about`,
          ]),
        ),
        "x-default": `/${DEFAULT_LANG}/about`,
      },
    },
    other: { rating: "RTA-5042-1996-1400-1577-RTA" },
  };
}

export default async function AboutPage({
  params,
}: PageProps<"/[lang]/about">) {
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();
  const lang: Lang = raw;

  const copy = t(lang);
  const [enStories, hiStories] = await Promise.all([
    getAllStories("en"),
    getAllStories("hi"),
  ]);
  const enCount = enStories.length;
  const hiCount = hiStories.length;

  return (
    <div className="shell max-w-2xl py-12 md:py-16">
      <header>
        <p className="eyebrow">{copy.nav.about}</p>
        <h1 className="mt-3 text-4xl sm:text-5xl">
          Erotic fiction, written properly
        </h1>
      </header>

      <div className="prose-story mt-10">
        <p>
          {site.name} publishes explicit short fiction for adults, in English
          and in Hindi. {enCount} English and {hiCount} Hindi stories so far.
          Every story is free, nothing is gated, and there is no account to
          create.
        </p>

        <h2>Our rules for what we publish</h2>
        <p>These are not negotiable, and they are not only about taste:</p>
        <ul>
          <li>
            <strong>Every character is an adult.</strong> All characters are
            fictional and 18 or over. Anything that reads otherwise is rejected.
          </li>
          <li>
            <strong>Consent is on the page.</strong> Coercion can exist as a
            plot, but never as something the story endorses.
          </li>
          <li>
            <strong>No real people.</strong> No public figures, no identifiable
            private individuals.
          </li>
          <li>
            <strong>Text only.</strong> No photographs or video — see our{" "}
            <Link href={path(lang, "/2257")}>2257 statement</Link>.
          </li>
        </ul>

        <h2>How it&rsquo;s paid for</h2>
        <p>
          Advertising, and nothing else. We keep ads out of the middle of a
          sentence and off the first screen of a story, because an ad in the
          wrong place costs a reader more than it earns us.
        </p>

        <h2>Submissions</h2>
        <p>
          We read submissions between 1,500 and 6,000 words in any of our{" "}
          <Link href={path(lang, "/genres")}>categories</Link>, in English or
          Hinglish. Send the full text in the body of an email — no attachments.
          Include a line confirming the work is yours and that all characters
          are adults.
        </p>
        <p>
          Rights are non-exclusive; you keep everything. We do not publish work
          that is generated rather than written.
        </p>

        <h2>Contact</h2>
        <p>
          Submissions, corrections and takedown requests all go to{" "}
          <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>.
        </p>
      </div>

      <div className="mt-12 flex flex-wrap gap-3">
        <Link href={path(lang)} className="btn btn-primary">
          {copy.common.startReading}
        </Link>
        <Link href={path(lang, "/privacy")} className="btn btn-ghost">
          Privacy &amp; cookies
        </Link>
      </div>
    </div>
  );
}
