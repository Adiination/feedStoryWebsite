import Link from "next/link";
import { GENRES } from "@/lib/genres";
import { path, t, type Lang } from "@/lib/i18n";
import { site, siteMeta } from "@/lib/site";
import { Ornament } from "./Ornament";

export function Footer({ lang }: { lang: Lang }) {
  const copy = t(lang).footer;
  const nav = t(lang).nav;

  return (
    <footer className="relative z-1 mt-24 border-t border-line bg-paper-deep/40">
      <div className="shell grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <Link
            href={path(lang)}
            className="flex items-baseline gap-1.5 font-[family-name:var(--font-display)] text-xl font-semibold text-ink"
          >
            {site.name}
            <Ornament className="size-3 text-accent" />
          </Link>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-soft">
            {siteMeta[lang].description}
          </p>
          <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-line px-3 py-1 text-xs text-muted">
            <span className="font-semibold text-accent">18+</span>
            {copy.tagline}
          </p>
        </div>

        <div>
          <h2 className="eyebrow">{copy.browse}</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {GENRES.slice(0, 6).map((genre) => (
              <li key={genre.slug}>
                <Link
                  href={path(lang, `/genre/${genre.slug}`)}
                  className="text-ink-soft transition-colors hover:text-accent"
                >
                  {genre.name[lang]}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href={path(lang, "/genres")}
                className="text-accent transition-colors hover:text-accent-deep"
              >
                {t(lang).common.allCategories} →
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="eyebrow">{copy.site}</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {[
              { href: path(lang, "/library"), label: nav.library },
              { href: path(lang, "/search"), label: t(lang).search.eyebrow },
              { href: path(lang, "/about"), label: nav.about },
              { href: path(lang, "/feed.xml"), label: "RSS" },
            ].map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-ink-soft transition-colors hover:text-accent"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <h2 className="eyebrow mt-7">{copy.legal}</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {[
              { href: path(lang, "/terms"), label: "Terms" },
              { href: path(lang, "/privacy"), label: "Privacy" },
              { href: path(lang, "/2257"), label: "18 U.S.C. 2257" },
              { href: path(lang, "/dmca"), label: "DMCA" },
            ].map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-ink-soft transition-colors hover:text-accent"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-line/70">
        <div className="shell flex flex-col gap-2 py-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.name}. {copy.rights}
          </p>
          <p>{t(lang).ageGate.fineprint}</p>
        </div>
      </div>
    </footer>
  );
}
