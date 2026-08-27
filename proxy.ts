import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LANG, LOCALES } from "@/lib/i18n";

/**
 * Every page lives under /<lang>/…, so bare paths need a locale added.
 *
 * The choice is made from the Accept-Language header, which means a Hindi
 * speaker landing on the domain root gets the Hindi feed without an extra
 * click. Once redirected, the locale is in the URL and the switcher takes over.
 *
 * (In Next 16 this file is `proxy.ts` — `middleware.ts` is the deprecated name.)
 */
function pickLocale(request: NextRequest): string {
  const header = request.headers.get("accept-language") ?? "";

  const preferred = header
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { tag: tag.toLowerCase(), q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);

  for (const { tag } of preferred) {
    // "hi", "hi-in" and "hi-latn" all mean the Hindi edition.
    const base = tag.split("-")[0];
    if ((LOCALES as readonly string[]).includes(base)) return base;
  }

  return DEFAULT_LANG;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // The admin lives outside the localised tree — never prefix it.
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return NextResponse.next();
  }

  const hasLocale = LOCALES.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
  if (hasLocale) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = `/${pickLocale(request)}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Skip Next internals and the files that must stay at the domain root.
  matcher: [
    "/((?!_next|favicon.ico|icon.svg|robots.txt|sitemap.xml|ads.txt|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)",
  ],
};
