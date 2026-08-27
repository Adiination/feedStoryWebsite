"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LOCALES, LOCALE_META, t, type Lang } from "@/lib/i18n";

/**
 * Story slugs differ per language (`the-last-train-home` vs
 * `aakhri-train-ghar-ki`), so swapping the locale on a story URL would 404.
 * On those pages we send the reader to the other locale's feed instead, and the
 * story page itself offers a direct "read in X" link when a translation exists.
 */
function swapLocale(pathname: string, target: Lang): string {
  const segments = pathname.split("/").filter(Boolean);
  const rest = segments.slice(1);

  if (rest[0] === "story") return `/${target}`;
  return rest.length > 0 ? `/${target}/${rest.join("/")}` : `/${target}`;
}

export function LanguageSwitcher({ lang }: { lang: Lang }) {
  const pathname = usePathname();

  return (
    <div
      role="group"
      aria-label={t(lang).langSwitch.label}
      className="flex shrink-0 items-center gap-0.5 rounded-full border border-line bg-card p-0.5"
    >
      {LOCALES.map((locale) => {
        const active = locale === lang;
        return (
          <Link
            key={locale}
            href={swapLocale(pathname, locale)}
            hrefLang={LOCALE_META[locale].htmlLang}
            aria-current={active ? "true" : undefined}
            title={t(lang).langSwitch.readIn(LOCALE_META[locale].label)}
            className={`grid min-h-9 min-w-9 place-items-center rounded-full px-2.5 text-xs font-semibold transition-colors sm:min-h-7 sm:min-w-7 ${
              active ? "bg-accent text-white" : "text-muted hover:text-ink"
            }`}
          >
            {LOCALE_META[locale].short}
          </Link>
        );
      })}
    </div>
  );
}
