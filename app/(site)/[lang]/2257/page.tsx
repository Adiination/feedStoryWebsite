import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalPage } from "@/components/LegalPage";
import { isLang, LOCALES, type Lang } from "@/lib/i18n";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export const metadata: Metadata = {
  title: "18 U.S.C. 2257 Statement",
  description: "Record-keeping requirements compliance statement.",
  other: { rating: "RTA-5042-1996-1400-1577-RTA" },
};

export default async function RecordKeepingPage({
  params,
}: PageProps<"/[lang]/2257">) {
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();
  const lang: Lang = raw;

  return (
    <LegalPage
      lang={lang}
      eyebrow="Legal"
      title="18 U.S.C. 2257 Statement"
    >
      <h2>Exemption statement</h2>
      <p>
        The record-keeping requirements of 18 U.S.C. § 2257 and 28 C.F.R. Part 75
        apply to producers of <strong>visual depictions</strong> of actual
        sexually explicit conduct.
      </p>
      <p>
        All content published on {site.name} consists solely of written works of
        fiction. This site contains no photographs, film, video, digital images
        or other visual depictions of actual human beings engaged in sexual
        conduct. Accordingly, the requirements of 18 U.S.C. § 2257 do not apply
        to any material on this site.
      </p>

      <h2>Characters are fictional adults</h2>
      <p>
        Every character appearing in any story on this site is entirely fictional
        and is represented as being 18 years of age or older at the time of the
        conduct described. No story depicts, and none may depict, a real person.
      </p>

      <h2>Reporting</h2>
      <p>
        If you believe any material on this site depicts a real identifiable
        person without consent, or involves a minor in any way, report it
        immediately to{" "}
        <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>. Reports
        of this kind are actioned ahead of everything else and the material is
        removed while we investigate.
      </p>

      <h2>If you add images</h2>
      <p>
        <strong>Important:</strong> this exemption holds only while the site
        remains text-only. If you begin publishing photographs or video of real
        people, § 2257 applies to you as a producer and this page must be
        replaced with a full compliance statement naming a custodian of records
        and a physical address. Get legal advice before that point.
      </p>
    </LegalPage>
  );
}
