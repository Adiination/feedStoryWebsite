"use client";

import { useSyncExternalStore } from "react";
import {
  getReaderSnapshot,
  getServerReaderSnapshot,
  subscribeReader,
  type ReaderState,
} from "./reader-store";

const neverChanges = () => () => {};

/**
 * Bookmarks + history from localStorage.
 *
 * `ready` is false on the server and during hydration, then true — so callers
 * can hold off rendering personalised UI until the real values are in, without
 * ever producing markup that differs from what was hydrated.
 */
export function useReader(): ReaderState & { ready: boolean } {
  const state = useSyncExternalStore(
    subscribeReader,
    getReaderSnapshot,
    getServerReaderSnapshot,
  );

  // Reads false while rendering on the server, true on the client — the
  // standard hydration probe, and cheaper than an effect + setState.
  const ready = useSyncExternalStore(
    neverChanges,
    () => true,
    () => false,
  );

  return { ...state, ready };
}
