import type { Lang } from "./i18n";

export type Genre = {
  slug: string;
  /** Display name per locale. */
  name: Record<Lang, string>;
  /** Category-page intro, also used as its meta description. */
  blurb: Record<Lang, string>;
  /** Cover-art gradient. Both stops must stay dark enough for white text. */
  from: string;
  to: string;
};

/**
 * Every category is framed around consenting adults. If you add more, keep it
 * that way — ad networks and payment processors both audit category names, and
 * anything that reads as underage or non-consensual will get the site dropped.
 */
export const GENRES: Genre[] = [
  {
    slug: "romance",
    name: { en: "Romance", hi: "Romance" },
    blurb: {
      en: "Slow build, real feeling. Two adults who mean it.",
      hi: "Dheere-dheere badhta pyaar. Do baalig log, sachchi feeling.",
    },
    from: "#7d1f3a",
    to: "#c0506d",
  },
  {
    slug: "first-time",
    name: { en: "First Time", hi: "Pehli Baar" },
    blurb: {
      en: "Nerves, honesty and adults discovering something new together.",
      hi: "Ghabrahat, sachchai, aur do baalig log kuch naya khojte hue.",
    },
    from: "#4a2350",
    to: "#8a4f8f",
  },
  {
    slug: "office",
    name: { en: "Office Affairs", hi: "Office Romance" },
    blurb: {
      en: "Late meetings, locked doors and colleagues who should know better.",
      hi: "Der raat ki meeting, band darwaze, aur colleagues jo sambhal nahi paate.",
    },
    from: "#1f3348",
    to: "#3f6d87",
  },
  {
    slug: "long-distance",
    name: { en: "Long Distance", hi: "Long Distance" },
    blurb: {
      en: "Months of waiting, and one weekend to make up for all of it.",
      hi: "Mahinon ka intezaar, aur ek weekend jo sab poora kar de.",
    },
    from: "#24304f",
    to: "#4f5f96",
  },
  {
    slug: "forbidden",
    name: { en: "Forbidden Love", hi: "Chhupa Pyaar" },
    blurb: {
      en: "Secret, complicated, and worth the trouble. Adults keeping a secret.",
      hi: "Chhupa, uljha hua, phir bhi keemti. Do baalig log, ek raaz.",
    },
    from: "#4a1520",
    to: "#97313f",
  },
  {
    slug: "married",
    name: { en: "Married Life", hi: "Shaadi Ke Baad" },
    blurb: {
      en: "Years in, and still finding new ways to want each other.",
      hi: "Saalon baad bhi ek doosre ko chaahne ke naye tareeke.",
    },
    from: "#5a2d15",
    to: "#a5643a",
  },
  {
    slug: "fantasy",
    name: { en: "Fantasy & Roleplay", hi: "Fantasy" },
    blurb: {
      en: "Scenarios agreed in advance and enjoyed on purpose.",
      hi: "Pehle se tay kiye gaye scenario, jaan-boojh kar enjoy kiye gaye.",
    },
    from: "#3a1b52",
    to: "#7b45a5",
  },
  {
    slug: "lgbtq",
    name: { en: "LGBTQ+", hi: "LGBTQ+" },
    blurb: {
      en: "Queer desire, written with the same care as everything else here.",
      hi: "Queer pyaar aur chaahat, utni hi care se likhi gayi.",
    },
    from: "#2d2a5e",
    to: "#6b4f9e",
  },
];

const BY_SLUG = new Map(GENRES.map((g) => [g.slug, g]));

export function getGenre(slug: string): Genre | undefined {
  return BY_SLUG.get(slug);
}

/** Falls back to a neutral palette so an unknown frontmatter value can't break a page. */
export function genrePalette(slug: string): { from: string; to: string } {
  const genre = BY_SLUG.get(slug);
  return genre
    ? { from: genre.from, to: genre.to }
    : { from: "#2e2429", to: "#6b545c" };
}

export function genreName(slug: string, lang: Lang): string {
  return BY_SLUG.get(slug)?.name[lang] ?? slug;
}
