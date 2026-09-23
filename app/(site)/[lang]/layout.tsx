import type { Metadata, Viewport } from "next";
import { Fraunces, Inter, Source_Serif_4 } from "next/font/google";
import { notFound } from "next/navigation";
import { AdNetworkScripts } from "@/components/AdNetworkScripts";
import { AgeGate } from "@/components/AgeGate";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import {
  DEFAULT_LANG,
  isLang,
  LOCALES,
  LOCALE_META,
  type Lang,
} from "@/lib/i18n";
import { site, siteMeta } from "@/lib/site";
import "../../globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-source-serif",
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

/**
 * Re-read the database at most once a minute per page.
 *
 * Publishing from the admin calls revalidatePath, which updates the cache
 * immediately — but that only reaches the instance that served the request,
 * and it does not survive a restart or redeploy, at which point pages revert
 * to the HTML generated at build time. Without an expiry those pages are
 * cached forever, so a story published after the build can silently vanish.
 *
 * This is the safety net: even if revalidatePath never lands, every page
 * re-reads the database within 60 seconds. Must be a literal — Next requires
 * the value to be statically analysable.
 */
export const revalidate = 60;

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang: Lang = isLang(raw) ? raw : DEFAULT_LANG;
  const meta = siteMeta[lang];

  return {
    metadataBase: new URL(site.url),
    title: {
      default: `${site.name} — ${meta.tagline}`,
      template: `%s · ${site.name}`,
    },
    description: meta.description,
    applicationName: site.name,
    openGraph: {
      type: "website",
      siteName: site.name,
      title: `${site.name} — ${meta.tagline}`,
      description: meta.description,
      url: `${site.url}/${lang}`,
      locale: LOCALE_META[lang].ogLocale,
    },
    twitter: {
      card: "summary_large_image",
      site: site.social.twitter || undefined,
    },
    alternates: {
      canonical: `/${lang}`,
      languages: {
        ...Object.fromEntries(
          LOCALES.map((locale) => [
            LOCALE_META[locale].htmlLang,
            `/${locale}`,
          ]),
        ),
        "x-default": `/${DEFAULT_LANG}`,
      },
      types: { "application/rss+xml": `${site.url}/${lang}/feed.xml` },
    },
    robots: { index: true, follow: true },
    other: {
      // RTA is the voluntary adult-content label that parental filters read.
      rating: "RTA-5042-1996-1400-1577-RTA",
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#131010",
  colorScheme: "dark",
};

export default async function RootLayout({
  children,
  params,
}: LayoutProps<"/[lang]">) {
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();
  const lang: Lang = raw;

  const siteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    url: `${site.url}/${lang}`,
    description: siteMeta[lang].description,
    inLanguage: LOCALE_META[lang].htmlLang,
    isFamilyFriendly: false,
    potentialAction: {
      "@type": "SearchAction",
      target: `${site.url}/${lang}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html
      lang={LOCALE_META[lang].htmlLang}
      className={`${fraunces.variable} ${sourceSerif.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="relative flex min-h-full flex-col">
        <Header lang={lang} />
        <main className="relative z-1 flex-1">{children}</main>
        <Footer lang={lang} />

        <AgeGate lang={lang} siteName={site.name} />

        <script
          type="application/ld+json"
          // Static, build-time JSON — no user input reaches this string.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteSchema) }}
        />

        <AdNetworkScripts />
      </body>
    </html>
  );
}
