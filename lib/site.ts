import { type Lang } from "./i18n";

/**
 * Single place to rebrand. `name` drives the wordmark, page titles, RSS feed
 * and share cards.
 */
export const site = {
  name: "Meri Vasna",
  /** Canonical origin. Set NEXT_PUBLIC_SITE_URL in production, no trailing slash. */
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(
    /\/$/,
    "",
  ),
  /** Where takedown notices, DMCA claims and submissions land. */
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL,
  social: { twitter: "" },
} as const;

export const siteMeta: Record<Lang, { tagline: string; description: string }> =
  {
    en: {
      tagline: "Erotic short fiction for adults.",
      description:
        "Explicit short stories written for grown-ups — free to read, no sign-up. Adults only: all characters are fictional and 18 or over.",
    },
    hi: {
      tagline: "Baalig logon ke liye erotic kahaniyan.",
      description:
        "Baalig logon ke liye likhi gayi bold Hindi kahaniyan — padhna free, koi sign-up nahi. Sirf 18+ ke liye; sabhi kirdaar kalpanik aur baalig hain.",
    },
  };

/* ------------------------------ advertising ------------------------------- */

/**
 * Adult traffic can't be monetised through Google AdSense — its program
 * policies prohibit sexually explicit content outright. These are the networks
 * that do accept it. Pick one, set the env vars, and every slot goes live.
 */
export type AdNetwork = "exoclick" | "juicyads" | "none";

const network = (process.env.NEXT_PUBLIC_AD_NETWORK ?? "none") as AdNetwork;

export const ads = {
  network: (["exoclick", "juicyads"] as const).includes(
    network as "exoclick" | "juicyads",
  )
    ? network
    : ("none" as AdNetwork),

  /**
   * Zone / ad-unit ids per placement. Create one zone per placement in your
   * network's dashboard and paste the ids here (via env, so they stay out of
   * the repo).
   */
  zones: {
    inFeed: process.env.NEXT_PUBLIC_AD_ZONE_IN_FEED ?? "",
    inArticle: process.env.NEXT_PUBLIC_AD_ZONE_IN_ARTICLE ?? "",
    sidebar: process.env.NEXT_PUBLIC_AD_ZONE_SIDEBAR ?? "",
    banner: process.env.NEXT_PUBLIC_AD_ZONE_BANNER ?? "",
  },
} as const;

export type AdPlacement = keyof typeof ads.zones;
