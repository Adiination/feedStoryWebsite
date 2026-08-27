import { ImageResponse } from "next/og";
import { DEFAULT_LANG, isLang, LOCALES, type Lang } from "@/lib/i18n";
import { site, siteMeta } from "@/lib/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = site.name;

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: raw } = await params;
  const lang: Lang = isLang(raw) ? raw : DEFAULT_LANG;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 96px",
          backgroundImage: "linear-gradient(135deg, #131010, #3a1622)",
          color: "#f3ebe8",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            fontSize: 26,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "#8d7d7b",
          }}
        >
          {site.name}
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 22,
            fontSize: 90,
            lineHeight: 1.05,
            fontWeight: 600,
          }}
        >
          {lang === "hi" ? "Raat ke liye kahaniyan" : "Stories for after dark"}
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 30,
            fontSize: 32,
            color: "#c2b3af",
          }}
        >
          {siteMeta[lang].tagline}
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 44,
            alignItems: "center",
            justifyContent: "center",
            width: 78,
            height: 44,
            borderRadius: 22,
            border: "2px solid #e2536f",
            color: "#e2536f",
            fontSize: 24,
            fontWeight: 700,
          }}
        >
          18+
        </div>
      </div>
    ),
    size,
  );
}
