"use client";

import { useEffect, useRef, useState } from "react";
import { recordProgress } from "@/lib/reader-store";

const TARGET_ID = "story-body";

/**
 * Draws the reading-progress bar and saves how far the reader got, so the
 * home page can offer "pick up where you left off".
 */
export function ReadingTracker({ slug }: { slug: string }) {
  const [progress, setProgress] = useState(0);
  const latest = useRef(0);
  const saved = useRef(0);

  useEffect(() => {
    const target = document.getElementById(TARGET_ID);
    if (!target) return;

    let frame = 0;

    const measure = () => {
      frame = 0;
      const height = target.offsetHeight;
      if (height === 0) return;
      const read = window.scrollY + window.innerHeight - target.offsetTop;
      const value = Math.min(1, Math.max(0, read / height));
      latest.current = value;
      setProgress(value);
    };

    const onScroll = () => {
      if (frame === 0) frame = requestAnimationFrame(measure);
    };

    // Only touch localStorage every few seconds — scroll events are cheap,
    // JSON writes are not.
    const flush = () => {
      if (Math.abs(latest.current - saved.current) < 0.02) return;
      saved.current = latest.current;
      recordProgress(slug, latest.current);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    const interval = window.setInterval(flush, 3000);
    // Closing the tab or backgrounding it shouldn't lose the position.
    document.addEventListener("visibilitychange", flush);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      document.removeEventListener("visibilitychange", flush);
      window.clearInterval(interval);
      flush();
    };
  }, [slug]);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-60 h-[3px] bg-transparent"
    >
      <div
        className="h-full origin-left bg-accent transition-transform duration-150 ease-out"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  );
}
