"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { path, t, type Lang } from "@/lib/i18n";
import { site } from "@/lib/site";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Ornament } from "./Ornament";

function isActive(pathname: string, href: string) {
  if (href.split("/").filter(Boolean).length === 1) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Header({ lang }: { lang: Lang }) {
  const pathname = usePathname();
  const nav = t(lang).nav;
  const search = t(lang).search;

  // Store *where* the sheet was opened rather than a boolean, so navigating
  // closes it for free — no effect chasing the route.
  const [openedAt, setOpenedAt] = useState<string | null>(null);
  const open = openedAt === pathname;

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const items = [
    { href: path(lang), label: nav.feed },
    { href: path(lang, "/genres"), label: nav.categories },
    { href: path(lang, "/library"), label: nav.library },
    { href: path(lang, "/about"), label: nav.about },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-paper/85 backdrop-blur-md">
      <div className="shell flex h-16 items-center justify-between gap-3 md:h-18">
        <Link
          href={path(lang)}
          className="group flex shrink-0 items-baseline gap-1.5 font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight whitespace-nowrap text-ink sm:text-[1.35rem]"
        >
          {site.name}
          <Ornament className="size-3 text-accent transition-transform duration-500 group-hover:rotate-90" />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(pathname, item.href) ? "page" : undefined}
              className={`relative rounded-full px-3.5 py-2 text-sm transition-colors ${
                isActive(pathname, item.href)
                  ? "text-ink"
                  : "text-ink-soft hover:text-accent"
              }`}
            >
              {item.label}
              {isActive(pathname, item.href) && (
                <span className="absolute inset-x-3.5 -bottom-0.5 h-px bg-accent" />
              )}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher lang={lang} />

          <Link
            href={path(lang, "/search")}
            aria-label={search.openLabel}
            className="grid size-10 place-items-center rounded-full text-ink-soft transition-colors hover:bg-paper-deep hover:text-ink"
          >
            <SearchIcon />
          </Link>

          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpenedAt(open ? null : pathname)}
            className="grid size-10 place-items-center rounded-full text-ink-soft transition-colors hover:bg-paper-deep hover:text-ink md:hidden"
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-line bg-paper md:hidden">
          <div className="shell flex flex-col py-2">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`border-b border-line-soft py-3.5 font-[family-name:var(--font-display)] text-lg last:border-0 ${
                  isActive(pathname, item.href) ? "text-accent" : "text-ink"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}

function SearchIcon() {
  return (
    <svg
      width="16"
      height="16"
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
  );
}

function MenuIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
