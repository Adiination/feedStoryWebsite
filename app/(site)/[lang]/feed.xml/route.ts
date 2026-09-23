import { genreName } from "@/lib/genres";
import { DEFAULT_LANG, isLang, LOCALES, type Lang } from "@/lib/i18n";
import { site, siteMeta } from "@/lib/site";
import { getAllStories } from "@/lib/stories";

// Prerendered, but re-read hourly so new stories reach subscribers.
export const revalidate = 3600;

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET(
  _request: Request,
  context: RouteContext<"/[lang]/feed.xml">,
) {
  const { lang: raw } = await context.params;
  const lang: Lang = isLang(raw) ? raw : DEFAULT_LANG;

  const stories = await getAllStories(lang);
  const updated = stories[0]?.date;
  const base = `${site.url}/${lang}`;

  const items = stories
    .map((story) => {
      const url = `${base}/story/${story.slug}`;
      return `    <item>
      <title>${escapeXml(story.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(`${story.date}T09:00:00Z`).toUTCString()}</pubDate>
      <dc:creator>${escapeXml(story.author)}</dc:creator>
      <category>${escapeXml(genreName(story.genre, lang))}</category>
      <description>${escapeXml(story.excerpt)}</description>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escapeXml(site.name)}</title>
    <link>${base}</link>
    <description>${escapeXml(siteMeta[lang].description)}</description>
    <language>${lang}</language>
    <rating>RTA-5042-1996-1400-1577-RTA</rating>${
      updated
        ? `\n    <lastBuildDate>${new Date(`${updated}T09:00:00Z`).toUTCString()}</lastBuildDate>`
        : ""
    }
    <atom:link href="${base}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
