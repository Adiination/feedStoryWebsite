"use client";

import { useState } from "react";
import { t, type Lang } from "@/lib/i18n";

export function ShareRow({
  title,
  url,
  lang,
}: {
  title: string;
  url: string;
  lang: Lang;
}) {
  const copy = t(lang).story;
  const [copied, setCopied] = useState(false);

  const share = async () => {
    // Native share sheet on mobile; clipboard everywhere else.
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        /* user dismissed the sheet */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      /* clipboard blocked — the links below still work */
    }
  };

  const encoded = encodeURIComponent(url);
  const text = encodeURIComponent(title);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" onClick={share} className="btn btn-ghost">
        <ShareIcon />
        {copied ? copy.linkCopied : copy.share}
      </button>
      <a
        className="pill"
        href={`https://twitter.com/intent/tweet?text=${text}&url=${encoded}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        X
      </a>
      <a
        className="pill"
        href={`https://api.whatsapp.com/send?text=${text}%20${encoded}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        WhatsApp
      </a>
      <a
        className="pill"
        href={`https://www.facebook.com/sharer/sharer.php?u=${encoded}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        Facebook
      </a>
    </div>
  );
}

function ShareIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" />
      <path d="M12 15V3m0 0L8 7m4-4 4 4" />
    </svg>
  );
}
