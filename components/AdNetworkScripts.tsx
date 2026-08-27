import Script from "next/script";
import { ads } from "@/lib/site";

/**
 * Loads the ad network's library once per page. Rendered from the root layout;
 * emits nothing when NEXT_PUBLIC_AD_NETWORK is unset.
 *
 * To add another network: add it to AdNetwork in lib/site.ts, load its script
 * here, and render its embed tag in components/AdSlot.tsx.
 */
export function AdNetworkScripts() {
  if (ads.network === "exoclick") {
    return (
      <Script
        id="exoclick-loader"
        src="https://a.magsrv.com/ad-provider.js"
        strategy="afterInteractive"
        async
      />
    );
  }

  if (ads.network === "juicyads") {
    return (
      <Script
        id="juicyads-loader"
        src="https://poweredby.jads.co/js/jads.js"
        strategy="afterInteractive"
        data-cfasync="false"
        async
      />
    );
  }

  return null;
}
