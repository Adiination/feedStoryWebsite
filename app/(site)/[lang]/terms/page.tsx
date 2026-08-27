import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalPage } from "@/components/LegalPage";
import { isLang, LOCALES, type Lang } from "@/lib/i18n";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export const metadata: Metadata = {
  title: "Terms of Use",
  description: `The rules for using ${site.name}.`,
  other: { rating: "RTA-5042-1996-1400-1577-RTA" },
};

export default async function TermsPage({ params }: PageProps<"/[lang]/terms">) {
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();
  const lang: Lang = raw;

  return (
    <LegalPage lang={lang} eyebrow="Legal" title="Terms of Use">
      <h2>1. Age requirement</h2>
      <p>
        This site publishes sexually explicit written fiction. You may not use it
        unless you are at least 18 years old, or the age of majority in your
        jurisdiction if that is higher. By continuing past the age confirmation
        you represent that you meet that requirement.
      </p>

      <h2>2. What this site is</h2>
      <p>
        {site.name} hosts written fiction only. There are no photographs, videos
        or other visual depictions of real people engaged in sexual conduct
        anywhere on this site.
      </p>
      <p>
        All characters in every story are fictional and are adults aged 18 or
        over. Any resemblance to real persons is coincidental.
      </p>

      <h2>3. Content standards</h2>
      <p>
        We do not publish, and will remove on discovery, material that depicts or
        appears to depict: minors in any sexual context; non-consensual acts
        presented approvingly; bestiality; or content that is illegal to
        distribute in the jurisdictions we operate in. This applies regardless of
        whether the material is fictional.
      </p>

      <h2>4. Your use of the site</h2>
      <p>You agree not to:</p>
      <ul>
        <li>reproduce or republish stories without the author&rsquo;s permission;</li>
        <li>scrape, mirror or bulk-download the site;</li>
        <li>attempt to bypass the age confirmation on another person&rsquo;s behalf;</li>
        <li>use the site anywhere its content is unlawful.</li>
      </ul>

      <h2>5. Intellectual property</h2>
      <p>
        Authors retain copyright in their stories. Publication here is a
        non-exclusive licence to display the work. If you believe your work has
        been posted without permission, see our{" "}
        <a href={`/${lang}/dmca`}>DMCA policy</a>.
      </p>

      <h2>6. Advertising</h2>
      <p>
        This site is funded by advertising. We do not control the content of
        third-party ads and do not endorse the products or services in them.
        Dealings with advertisers are between you and them.
      </p>

      <h2>7. No warranty</h2>
      <p>
        The site is provided as-is, without warranties of any kind. We do not
        guarantee that it will be available, accurate or uninterrupted.
      </p>

      <h2>8. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, we are not liable for indirect,
        incidental or consequential damages arising from your use of the site.
      </p>

      <h2>9. Changes</h2>
      <p>
        These terms may change. Continuing to use the site after a change means
        you accept the revised version.
      </p>

      <h2>10. Contact</h2>
      <p>
        Questions, complaints and takedown requests:{" "}
        <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>.
      </p>
    </LegalPage>
  );
}
