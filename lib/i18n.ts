export const LOCALES = ["en", "hi"] as const;
export type Lang = (typeof LOCALES)[number];
export const DEFAULT_LANG: Lang = "en";

export function isLang(value: string): value is Lang {
  return (LOCALES as readonly string[]).includes(value);
}

/** Prefix a path with its locale: path("hi", "/genres") → "/hi/genres" */
export function path(lang: Lang, subpath = ""): string {
  const clean = subpath === "/" ? "" : subpath;
  return `/${lang}${clean}`;
}

export const LOCALE_META: Record<
  Lang,
  {
    /** Name shown in the language switcher */
    label: string;
    short: string;
    /** BCP-47 tag for <html lang> and hreflang. Romanised Hindi is hi-Latn. */
    htmlLang: string;
    ogLocale: string;
  }
> = {
  en: {
    label: "English",
    short: "EN",
    htmlLang: "en",
    ogLocale: "en_US",
  },
  hi: {
    label: "Hindi",
    short: "HI",
    htmlLang: "hi-Latn",
    ogLocale: "hi_IN",
  },
};

type Dictionary = {
  nav: { feed: string; categories: string; library: string; about: string };
  hero: {
    eyebrow: string;
    titleLead: string;
    titleAccent: string;
    subtitle: string;
    storiesCounting: (n: number) => string;
  };
  common: {
    editorsPick: string;
    stories: (n: number) => string;
    minRead: (n: number) => string;
    words: (n: number) => string;
    by: string;
    readFor: (n: number) => string;
    more: (label: string) => string;
    allCategories: string;
    otherCategories: string;
    browseCategory: (label: string) => string;
    nothingHere: string;
    nothingHereBody: string;
    backToFeed: string;
    readNext: string;
    latest: string;
    fullArchive: string;
    longest: string;
    browseByCategory: string;
    theEnd: string;
    thanksForReading: string;
    continueReading: string;
    percentRead: (n: number) => string;
    myLibrary: string;
    startReading: string;
  };
  story: {
    save: string;
    saved: string;
    removeBookmark: string;
    share: string;
    linkCopied: string;
  };
  search: {
    title: string;
    eyebrow: string;
    placeholder: string;
    inputLabel: string;
    openLabel: string;
    orStartWith: string;
    noResults: string;
    noResultsHint: string;
    resultCount: (n: number) => string;
  };
  library: {
    title: string;
    eyebrow: string;
    subtitle: string;
    savedTab: string;
    historyTab: string;
    clearAll: string;
    loading: string;
    emptySavedTitle: string;
    emptySavedBody: string;
    emptyHistoryTitle: string;
    emptyHistoryBody: string;
    localOnly: string;
    removeSaved: string;
    removeHistory: string;
  };
  genres: { title: string; eyebrow: string; subtitle: string };
  archive: { title: string; eyebrow: string; subtitle: (n: number) => string };
  ageGate: {
    title: string;
    body: string;
    confirm: string;
    leave: string;
    fineprint: string;
  };
  footer: {
    browse: string;
    site: string;
    legal: string;
    rights: string;
    tagline: string;
  };
  notFound: { title: string; body: string; search: string };
  langSwitch: { label: string; readIn: (label: string) => string };
};

const en: Dictionary = {
  nav: {
    feed: "Feed",
    categories: "Categories",
    library: "My Library",
    about: "About",
  },
  hero: {
    eyebrow: "Erotic fiction for adults",
    titleLead: "Stories for",
    titleAccent: "after dark.",
    subtitle:
      "Explicit short fiction written for grown-ups. Free to read, no sign-up, no clutter.",
    storiesCounting: (n) => `${n} stories and counting.`,
  },
  common: {
    editorsPick: "Editor's pick",
    stories: (n) => (n === 1 ? "story" : "stories"),
    minRead: (n) => `${n} min read`,
    words: (n) => `${n.toLocaleString("en-US")} words`,
    by: "by",
    readFor: (n) => `Read · ${n} min`,
    more: (label) => `More ${label.toLowerCase()}`,
    allCategories: "All categories",
    otherCategories: "Other categories",
    browseCategory: (label) => `Browse ${label.toLowerCase()}`,
    nothingHere: "Nothing here yet.",
    nothingHereBody: "New stories are added regularly — try another category.",
    backToFeed: "Back to the feed",
    readNext: "Read next",
    latest: "Latest stories",
    fullArchive: "Full archive",
    longest: "Settle in — the long ones",
    browseByCategory: "Browse by category",
    theEnd: "The end",
    thanksForReading: "Thanks for reading",
    continueReading: "Pick up where you left off",
    percentRead: (n) => `${n}% read`,
    myLibrary: "My library",
    startReading: "Start reading",
  },
  story: {
    save: "Save for later",
    saved: "Saved to library",
    removeBookmark: "Remove bookmark",
    share: "Share",
    linkCopied: "Link copied",
  },
  search: {
    title: "Find a story",
    eyebrow: "Search",
    placeholder: "Title, author, category or theme…",
    inputLabel: "Search stories",
    openLabel: "Open search",
    orStartWith: "Or start with a category",
    noResults: "No stories match that.",
    noResultsHint: "Try a category name, an author, or a single word.",
    resultCount: (n) => `${n} ${n === 1 ? "story" : "stories"}`,
  },
  library: {
    title: "My Library",
    eyebrow: "Yours only",
    subtitle:
      "Bookmarks and reading progress, stored in this browser. No account, no sync, nothing sent to a server.",
    savedTab: "Saved",
    historyTab: "Recently read",
    clearAll: "Clear all",
    loading: "Loading your library…",
    emptySavedTitle: "Nothing saved yet",
    emptySavedBody:
      "Tap the bookmark on any story and it'll wait for you here.",
    emptyHistoryTitle: "Nothing read yet",
    emptyHistoryBody:
      "Start a story and this becomes your shelf of half-finished nights.",
    localOnly:
      "Your library lives in this browser only — nothing is uploaded anywhere.",
    removeSaved: "Remove from saved",
    removeHistory: "Remove from history",
  },
  genres: {
    title: "Categories",
    eyebrow: "Browse",
    subtitle: "Pick a mood. Every story here is about consenting adults.",
  },
  archive: {
    title: "All stories",
    eyebrow: "Archive",
    subtitle: (n) => `${n} stories, newest first.`,
  },
  ageGate: {
    title: "Are you 18 or older?",
    body: "This site contains sexually explicit written fiction intended for adults only. By entering you confirm that you are of legal age in your country and that you wish to view adult material.",
    confirm: "Yes, I am 18 or older",
    leave: "No, take me away",
    fineprint:
      "All characters depicted are fictional adults aged 18 or over. This site hosts written fiction only.",
  },
  footer: {
    browse: "Browse",
    site: "Site",
    legal: "Legal",
    rights: "Stories remain the property of their authors.",
    tagline: "Written fiction. Adults only.",
  },
  notFound: {
    title: "This page has been misfiled",
    body: "Nothing lives at that address.",
    search: "Search",
  },
  langSwitch: {
    label: "Language",
    readIn: (label) => `Read in ${label}`,
  },
};

const hi: Dictionary = {
  nav: {
    feed: "Feed",
    categories: "Category",
    library: "Meri Library",
    about: "Hamare Baare Mein",
  },
  hero: {
    eyebrow: "Baalig logon ke liye erotic kahaniyan",
    titleLead: "Raat ke liye",
    titleAccent: "kahaniyan.",
    subtitle:
      "Baalig logon ke liye likhi gayi bold kahaniyan. Padhna free hai, koi sign-up nahi.",
    storiesCounting: (n) => `${n} kahaniyan, aur bhi aa rahi hain.`,
  },
  common: {
    editorsPick: "Chuni hui kahani",
    stories: (n) => (n === 1 ? "kahani" : "kahaniyan"),
    minRead: (n) => `${n} min`,
    words: (n) => `${n.toLocaleString("en-IN")} shabd`,
    by: "Lekhak:",
    readFor: (n) => `Padhein · ${n} min`,
    more: (label) => `Aur ${label}`,
    allCategories: "Sabhi category",
    otherCategories: "Anya category",
    browseCategory: (label) => `${label} dekhein`,
    nothingHere: "Abhi yahan kuch nahi hai.",
    nothingHereBody: "Nayi kahaniyan roz aati hain — koi doosri category dekhein.",
    backToFeed: "Feed par wapas",
    readNext: "Aage padhein",
    latest: "Nayi kahaniyan",
    fullArchive: "Poora archive",
    longest: "Lambi kahaniyan",
    browseByCategory: "Category se dekhein",
    theEnd: "Samapt",
    thanksForReading: "Padhne ke liye dhanyavaad",
    continueReading: "Jahan chhoda tha wahin se",
    percentRead: (n) => `${n}% padha`,
    myLibrary: "Meri library",
    startReading: "Padhna shuru karein",
  },
  story: {
    save: "Baad ke liye save karein",
    saved: "Library mein save hai",
    removeBookmark: "Save hataayein",
    share: "Share karein",
    linkCopied: "Link copy ho gaya",
  },
  search: {
    title: "Kahani dhundein",
    eyebrow: "Search",
    placeholder: "Title, lekhak, category ya theme…",
    inputLabel: "Kahani dhundein",
    openLabel: "Search kholein",
    orStartWith: "Ya kisi category se shuru karein",
    noResults: "Is se milti koi kahani nahi hai.",
    noResultsHint: "Koi category ka naam, lekhak, ya ek shabd try karein.",
    resultCount: (n) => `${n} ${n === 1 ? "kahani" : "kahaniyan"}`,
  },
  library: {
    title: "Meri Library",
    eyebrow: "Sirf aapki",
    subtitle:
      "Aapke save kiye kahaniyan aur reading progress isi browser mein rehte hain. Koi account nahi, kuch server par nahi jaata.",
    savedTab: "Save kiye",
    historyTab: "Haal mein padhi",
    clearAll: "Sab hataayein",
    loading: "Aapki library load ho rahi hai…",
    emptySavedTitle: "Abhi kuch save nahi kiya",
    emptySavedBody:
      "Kisi bhi kahani par bookmark dabaayein, wo yahan mil jaayegi.",
    emptyHistoryTitle: "Abhi kuch padha nahi",
    emptyHistoryBody:
      "Koi kahani shuru karein, phir aapki adhoori raatein yahan dikhengi.",
    localOnly:
      "Aapki library sirf is browser mein hai — kahin upload nahi hoti.",
    removeSaved: "Save se hataayein",
    removeHistory: "History se hataayein",
  },
  genres: {
    title: "Category",
    eyebrow: "Browse",
    subtitle:
      "Apna mood chunein. Yahan har kahani baalig aur sehmat logon ki hai.",
  },
  archive: {
    title: "Sabhi kahaniyan",
    eyebrow: "Archive",
    subtitle: (n) => `${n} kahaniyan, nayi pehle.`,
  },
  ageGate: {
    title: "Kya aap 18 saal se bade hain?",
    body: "Is website par sirf baalig logon ke liye likhi gayi bold kahaniyan hain. Andar aane ka matlab hai ki aap apne desh ke kanoon ke hisaab se baalig hain aur ye content dekhna chahte hain.",
    confirm: "Haan, main 18+ hoon",
    leave: "Nahi, mujhe le jaayein",
    fineprint:
      "Sabhi kirdaar kalpanik hain aur 18 saal se bade hain. Yahan sirf likhi hui kahaniyan hain.",
  },
  footer: {
    browse: "Browse",
    site: "Site",
    legal: "Kanooni",
    rights: "Kahaniyan unke lekhak ki hain.",
    tagline: "Likhi hui kahaniyan. Sirf baalig logon ke liye.",
  },
  notFound: {
    title: "Ye page nahi mila",
    body: "Is address par kuch nahi hai.",
    search: "Search",
  },
  langSwitch: {
    label: "Bhasha",
    readIn: (label) => `${label} mein padhein`,
  },
};

const DICT: Record<Lang, Dictionary> = { en, hi };

export function t(lang: Lang): Dictionary {
  return DICT[lang];
}
