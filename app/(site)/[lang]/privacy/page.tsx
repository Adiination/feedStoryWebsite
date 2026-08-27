import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalPage } from "@/components/LegalPage";
import { isLang, LOCALES, type Lang } from "@/lib/i18n";
import { ads, site } from "@/lib/site";
import { STORAGE_KEYS } from "@/lib/storage-keys";

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export const metadata: Metadata = {
  title: "Privacy & cookies",
  description: `How ${site.name} handles data, cookies and advertising.`,
  other: { rating: "RTA-5042-1996-1400-1577-RTA" },
};

export default async function PrivacyPage({
  params,
}: PageProps<"/[lang]/privacy">) {
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();
  const lang: Lang = raw;

  return (
    <LegalPage lang={lang} eyebrow="Legal" title="Privacy & cookies">
      <p>
        {site.name} is a reading site. There are no accounts, so we do not collect
        your name, email address or payment details — there is nothing here to
        sign into or pay for.
      </p>

      <h2>What we store on your device</h2>
      <p>
        Three things are kept in your browser&rsquo;s local storage and never sent
        anywhere:
      </p>
      <ul>
        {/* Read from the source of truth so this list can't drift out of date. */}
        <li>
          <code>{STORAGE_KEYS.ageConfirmed}</code> — so the 18+ prompt only
          appears once;
        </li>
        <li>
          <code>{STORAGE_KEYS.bookmarks}</code> — the stories you saved;
        </li>
        <li>
          <code>{STORAGE_KEYS.history}</code> — which stories you started and
          how far you got.
        </li>
      </ul>
      <p>
        We cannot read any of it. Clearing your browser data deletes all three,
        and you can clear the last two yourself from the{" "}
        <a href={`/${lang}/library`}>My Library</a> page.
      </p>

      <h2>Advertising</h2>
      <p>
        This site is funded by advertising served through an adult advertising
        network
        {ads.network !== "none" ? ` (currently ${ads.network})` : ""}. Ad networks
        and their partners commonly set cookies or use device identifiers to
        limit how often you see the same ad, to measure clicks, and to select ads
        based on your previous browsing.
      </p>
      <p>
        We do not pass any information about you to advertisers, because we do not
        have any. However, an ad network can observe your IP address, approximate
        location, device and browser when it serves an ad — as any third party
        loading content into a page can.
      </p>
      <p>
        <strong>Replace this paragraph with your network&rsquo;s own privacy
        link</strong> once you have chosen one, and name it explicitly. Most
        networks require this, and reviewers check for it.
      </p>
      <p>
        You can block advertising cookies in your browser settings or with an
        extension. Doing so does not restrict access to any story on this site.
      </p>

      <h2>Analytics</h2>
      <p>
        This site ships with no analytics of its own. If you add a provider, name
        it here along with what it collects and how long it retains it.
      </p>

      <h2>Third-party links</h2>
      <p>
        Share buttons open X, WhatsApp and Facebook in a new tab. Once you are on
        their site their privacy policy applies, not ours. Be aware that sharing
        a link from an adult site to a social network reveals your interest in it
        to that network.
      </p>

      <h2>Children</h2>
      <p>
        This site is not intended for anyone under 18 and we do not knowingly
        collect information from minors. If you believe a minor has used this
        site, contact us.
      </p>

      <h2>Your rights</h2>
      <p>
        Because we hold no personal data about you, there is nothing for us to
        export or erase on request. For anything relating to advertising cookies,
        contact the ad network directly.
      </p>

      <h2>Contact</h2>
      <p>
        <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>
      </p>
    </LegalPage>
  );
}
