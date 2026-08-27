"use client";

import { useEffect } from "react";
import { t, type Lang } from "@/lib/i18n";
import { confirmAge } from "@/lib/reader-store";
import { useReader } from "@/lib/use-reader";
import { Ornament } from "./Ornament";

/**
 * 18+ confirmation overlay.
 *
 * Deliberately an overlay rather than a redirect or a server check: the page
 * content stays in the HTML, so search engines and ad-network crawlers still
 * see a real page instead of a gate. That's the standard arrangement for adult
 * sites — hiding content from crawlers while showing it to users is cloaking.
 */
export function AgeGate({
  lang,
  siteName,
}: {
  lang: Lang;
  siteName: string;
}) {
  const copy = t(lang).ageGate;
  const { ageConfirmed, ready } = useReader();
  const showing = ready && !ageConfirmed;

  useEffect(() => {
    if (!showing) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [showing]);

  if (!showing) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-gate-title"
      className="animate-fade-in fixed inset-0 z-100 grid place-items-center overflow-y-auto bg-paper/98 px-5 py-10 backdrop-blur-xl"
    >
      <div className="w-full max-w-md text-center">
        <div className="mb-7 flex items-center justify-center gap-2">
          <span className="font-[family-name:var(--font-display)] text-xl font-semibold">
            {siteName}
          </span>
          <Ornament className="size-3 text-accent" />
        </div>

        <span className="inline-block rounded-full border border-accent px-3 py-1 text-xs font-semibold tracking-widest text-accent">
          18+
        </span>

        <h1
          id="age-gate-title"
          className="mt-6 text-3xl leading-tight sm:text-4xl"
        >
          {copy.title}
        </h1>

        <p className="mt-5 font-[family-name:var(--font-body)] text-[1.0625rem] leading-relaxed text-ink-soft">
          {copy.body}
        </p>

        <div className="mt-9 flex flex-col gap-3">
          <button
            type="button"
            onClick={confirmAge}
            className="btn btn-primary w-full py-3.5 text-base"
          >
            {copy.confirm}
          </button>
          <a
            href="https://www.google.com"
            rel="noopener noreferrer"
            className="btn btn-ghost w-full py-3.5"
          >
            {copy.leave}
          </a>
        </div>

        <p className="mt-8 text-xs leading-relaxed text-muted">
          {copy.fineprint}
        </p>
      </div>
    </div>
  );
}
