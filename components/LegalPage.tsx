import type { ReactNode } from "react";
import type { Lang } from "@/lib/i18n";

/**
 * Shared shell for the legal pages. The bodies stay in English in both locales
 * — that's normal for terms and takedown policies, and a loose translation of a
 * legal document creates more problems than it solves.
 */
export function LegalPage({
  lang,
  eyebrow,
  title,
  updated,
  children,
}: {
  lang: Lang;
  eyebrow: string;
  title: string;
  updated?: string;
  children: ReactNode;
}) {
  return (
    <div className="shell max-w-2xl py-12 md:py-16">
      <header>
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-3 text-4xl sm:text-5xl">{title}</h1>
        <p className="mt-4 text-sm text-muted">
          Template text — have a lawyer in your jurisdiction review it before you
          launch.
          {updated ? ` Last updated ${updated}.` : ""}
        </p>
        {lang !== "en" && (
          <p className="mt-3 rounded-[var(--radius-card)] border border-line bg-card px-4 py-3 text-sm text-ink-soft">
            Ye kanooni page English mein hai. / This page is provided in English.
          </p>
        )}
      </header>

      <div className="prose-story mt-10">{children}</div>
    </div>
  );
}
