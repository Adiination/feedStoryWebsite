import type { MetadataRoute } from "next";
import { LOCALES } from "@/lib/i18n";
import { site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          // Thin duplicates of story pages.
          ...LOCALES.map((lang) => `/${lang}/search`),
          ...LOCALES.map((lang) => `/${lang}/library`),
        ],
      },
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
