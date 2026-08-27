/**
 * Browser storage keys, in one place.
 *
 * Kept out of reader-store.ts (which is "use client") so the privacy page can
 * import them too — that page has to list exactly what we put on a reader's
 * device, and a hand-copied list drifts out of date the moment a key changes.
 */
const PREFIX = "merivasna";

export const STORAGE_KEYS = {
  bookmarks: `${PREFIX}:bookmarks:v1`,
  history: `${PREFIX}:history:v1`,
  ageConfirmed: `${PREFIX}:age-confirmed:v1`,
} as const;

/** Same-tab change notification, so open pages stay in sync. */
export const STORAGE_CHANGE_EVENT = `${PREFIX}:change`;
