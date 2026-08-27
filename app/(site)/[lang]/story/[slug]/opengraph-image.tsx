import { ImageResponse } from "next/og";
import { genreName, genrePalette } from "@/lib/genres";
import { DEFAULT_LANG, isLang, type Lang } from "@/lib/i18n";
import { site } from "@/lib/site";
import { getAllStories, getEveryStoryRef } from "@/lib/stories";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Story cover";

export function generateStaticParams() {
  return getEveryStoryRef();
}

export default async function Image({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang: raw, slug } = await params;
  const lang: Lang = isLang(raw) ? raw : DEFAULT_LANG;

  const story = (await getAllStories(lang)).find((item) => item.slug === slug);
  const palette = genrePalette(story?.genre ?? "");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "68px 80px",
          backgroundImage: `linear-gradient(135deg, ${palette.from}, ${palette.to})`,
          color: "#fff",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 26,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.72)",
          }}
        >
          {genreName(story?.genre ?? "", lang)}
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: story && story.title.length > 34 ? 74 : 92,
              lineHeight: 1.08,
              fontWeight: 600,
              maxWidth: 960,
            }}
          >
            {story?.title ?? site.name}
          </div>
          {story && (
            <div
              style={{
                display: "flex",
                marginTop: 26,
                fontSize: 34,
                color: "rgba(255,255,255,0.82)",
              }}
            >
              {`by ${story.author} · ${story.readingMinutes} min read`}
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 28,
            letterSpacing: 2,
            color: "rgba(255,255,255,0.75)",
          }}
        >
          <span style={{ display: "flex" }}>{site.name}</span>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 66,
              height: 38,
              borderRadius: 19,
              border: "2px solid rgba(255,255,255,0.7)",
              fontSize: 22,
              fontWeight: 700,
            }}
          >
            18+
          </span>
        </div>
      </div>
    ),
    size,
  );
}
