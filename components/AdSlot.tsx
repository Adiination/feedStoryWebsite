"use client";

import { useEffect, useRef } from "react";
import { ads, type AdPlacement } from "@/lib/site";

declare global {
  interface Window {
    AdProvider?: unknown[];
    adsbyjuicy?: unknown[];
  }
}

const FORMAT: Record<
  AdPlacement,
  { label: string; width: number; height: number }
> = {
  inFeed: { label: "In-feed", width: 728, height: 90 },
  inArticle: { label: "In-article", width: 300, height: 250 },
  sidebar: { label: "Sidebar", width: 300, height: 250 },
  banner: { label: "Banner", width: 728, height: 90 },
};

/**
 * One ad unit.
 *
 * Google AdSense prohibits sexually explicit content, so this targets the
 * networks that accept adult traffic instead. Set NEXT_PUBLIC_AD_NETWORK plus
 * the zone id for each placement and the slots go live; until then you get a
 * labelled placeholder in development and nothing at all in production.
 */
export function AdSlot({
  placement,
  className = "",
  label = "Advertisement",
}: {
  placement: AdPlacement;
  className?: string;
  label?: string;
}) {
  const spec = FORMAT[placement];
  const zone = ads.zones[placement];
  const network = ads.network;
  const live = network !== "none" && Boolean(zone);

  const ref = useRef<HTMLDivElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (!live || pushed.current) return;

    let frame = 0;
    let attempts = 0;

    // The container has to be laid out with a real width before the network
    // fills it, or it measures zero and gives up permanently.
    const fill = () => {
      if (pushed.current) return;
      const width = ref.current?.offsetWidth ?? 0;
      if (width === 0 && attempts++ < 20) {
        frame = requestAnimationFrame(fill);
        return;
      }
      if (width === 0) return;

      try {
        if (network === "exoclick") {
          (window.AdProvider = window.AdProvider || []).push({ serve: {} });
        } else if (network === "juicyads") {
          (window.adsbyjuicy = window.adsbyjuicy || []).push({
            adzone: Number(zone) || zone,
          });
        }
        pushed.current = true;
      } catch {
        /* blocked by an extension, or the loader script never arrived */
      }
    };

    frame = requestAnimationFrame(fill);
    return () => cancelAnimationFrame(frame);
  }, [live, network, zone]);

  if (!live) {
    if (process.env.NODE_ENV === "production") return null;
    return (
      <div
        className={`flex flex-col items-center justify-center gap-1 rounded-[var(--radius-card)] border border-dashed border-line bg-paper-deep/40 text-center ${className}`}
        style={{ minHeight: Math.min(spec.height, 250) }}
      >
        <span className="eyebrow">Ad slot · {spec.label}</span>
        <span className="text-xs text-muted">
          set NEXT_PUBLIC_AD_NETWORK + zone id
        </span>
      </div>
    );
  }

  return (
    <div ref={ref} className={className}>
      <span className="eyebrow mb-1.5 block text-[0.625rem]">{label}</span>

      {network === "exoclick" && (
        // ExoClick / magsrv serves into a class-tagged <ins>.
        <ins className="eas6a97888e2 block" data-zoneid={zone} />
      )}

      {network === "juicyads" && (
        <ins
          id={zone}
          className="block"
          data-width={spec.width}
          data-height={spec.height}
        />
      )}
    </div>
  );
}
