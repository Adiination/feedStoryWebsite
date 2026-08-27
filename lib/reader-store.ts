"use client";

/**
 * Bookmarks + reading history, stored in the browser only.
 * No accounts, no server, no cookies — so nothing here needs consent banners
 * and nothing breaks if a reader arrives with a fresh browser.
 */

import { STORAGE_CHANGE_EVENT, STORAGE_KEYS } from "./storage-keys";

const BOOKMARKS_KEY = STORAGE_KEYS.bookmarks;
const HISTORY_KEY = STORAGE_KEYS.history;
const AGE_KEY = STORAGE_KEYS.ageConfirmed;
const CHANGE_EVENT = STORAGE_CHANGE_EVENT;
const HISTORY_LIMIT = 40;

export type HistoryEntry = {
  slug: string;
  /** 0–1, how far down the story the reader got. */
  progress: number;
  /** Epoch ms of the last time they read it. */
  updatedAt: number;
};

export type ReaderState = {
  bookmarks: string[];
  history: HistoryEntry[];
  /** Whether this browser has passed the 18+ gate. */
  ageConfirmed: boolean;
};

const EMPTY: ReaderState = {
  bookmarks: [],
  history: [],
  ageConfirmed: false,
};

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T) : fallback;
  } catch {
    // Private-mode Safari and quota-exceeded both land here. Degrade quietly.
    return fallback;
  }
}

function writeJSON(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    snapshotStale = true;
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    /* storage full or blocked — bookmarks just won't persist */
  }
}

export function readReaderState(): ReaderState {
  if (typeof window === "undefined") return EMPTY;
  const bookmarks = readJSON<string[]>(BOOKMARKS_KEY, []).filter(
    (slug): slug is string => typeof slug === "string",
  );
  const history = readJSON<HistoryEntry[]>(HISTORY_KEY, [])
    .filter(
      (entry): entry is HistoryEntry =>
        !!entry && typeof entry.slug === "string",
    )
    .map((entry) => ({
      slug: entry.slug,
      progress: Math.min(1, Math.max(0, Number(entry.progress) || 0)),
      updatedAt: Number(entry.updatedAt) || 0,
    }))
    .sort((a, b) => b.updatedAt - a.updatedAt);

  let ageConfirmed = false;
  try {
    ageConfirmed = window.localStorage.getItem(AGE_KEY) === "1";
  } catch {
    /* storage blocked — the gate simply shows again next visit */
  }

  return { bookmarks, history, ageConfirmed };
}

/* ------------------------- useSyncExternalStore glue ---------------------- */

// useSyncExternalStore compares snapshots by identity, so the same object has
// to come back until something actually writes.
let snapshot: ReaderState = EMPTY;
let snapshotStale = true;

export function getReaderSnapshot(): ReaderState {
  if (snapshotStale) {
    snapshot = readReaderState();
    snapshotStale = false;
  }
  return snapshot;
}

/** Server and first-paint value — always empty, so hydration always matches. */
export function getServerReaderSnapshot(): ReaderState {
  return EMPTY;
}

export function subscribeReader(listener: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => {
    snapshotStale = true;
    listener();
  };
  window.addEventListener(CHANGE_EVENT, handler);
  // Fires when another tab writes — keeps two open tabs in agreement.
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(CHANGE_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

/* -------------------------------- mutations ------------------------------- */

export function toggleBookmark(slug: string): boolean {
  const current = readReaderState().bookmarks;
  const next = current.includes(slug)
    ? current.filter((s) => s !== slug)
    : [slug, ...current];
  writeJSON(BOOKMARKS_KEY, next);
  return next.includes(slug);
}

export function removeBookmark(slug: string) {
  writeJSON(
    BOOKMARKS_KEY,
    readReaderState().bookmarks.filter((s) => s !== slug),
  );
}

export function clearBookmarks() {
  writeJSON(BOOKMARKS_KEY, []);
}

export function recordProgress(slug: string, progress: number) {
  const history = readReaderState().history;
  const clamped = Math.min(1, Math.max(0, progress));
  const existing = history.find((entry) => entry.slug === slug);

  // Never let progress go backwards — a reader scrolling up hasn't un-read it.
  const next: HistoryEntry = {
    slug,
    progress: Math.max(clamped, existing?.progress ?? 0),
    updatedAt: Date.now(),
  };

  writeJSON(HISTORY_KEY, [
    next,
    ...history.filter((entry) => entry.slug !== slug),
  ].slice(0, HISTORY_LIMIT));
}

export function removeFromHistory(slug: string) {
  writeJSON(
    HISTORY_KEY,
    readReaderState().history.filter((entry) => entry.slug !== slug),
  );
}

export function clearHistory() {
  writeJSON(HISTORY_KEY, []);
}

/** Records that the visitor confirmed they're 18+. */
export function confirmAge() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(AGE_KEY, "1");
    snapshotStale = true;
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    /* storage blocked — they'll see the gate again, which is the safe failure */
  }
}
