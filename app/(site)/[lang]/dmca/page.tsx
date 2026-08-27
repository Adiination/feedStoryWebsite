import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalPage } from "@/components/LegalPage";
import { isLang, LOCALES, type Lang } from "@/lib/i18n";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export const metadata: Metadata = {
  title: "DMCA & Takedowns",
  description: "How to report copyright infringement or request removal.",
  other: { rating: "RTA-5042-1996-1400-1577-RTA" },
};

export default async function DmcaPage({ params }: PageProps<"/[lang]/dmca">) {
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();
  const lang: Lang = raw;

  return (
    <LegalPage lang={lang} eyebrow="Legal" title="DMCA & Takedowns">
      <p>
        We respond to properly submitted copyright notices and to removal
        requests from people depicted or identified in published material.
      </p>

      <h2>Reporting copyright infringement</h2>
      <p>
        Send a notice to{" "}
        <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a> with the
        subject line &ldquo;DMCA Notice&rdquo;, including:
      </p>
      <ol>
        <li>your physical or electronic signature;</li>
        <li>identification of the copyrighted work you claim was infringed;</li>
        <li>
          the exact URL on this site of the material you want removed, so we can
          find it;
        </li>
        <li>your name, address, telephone number and email address;</li>
        <li>
          a statement that you have a good-faith belief the use is not authorised
          by the copyright owner, its agent, or the law;
        </li>
        <li>
          a statement, under penalty of perjury, that the information in your
          notice is accurate and that you are the owner or authorised to act on
          the owner&rsquo;s behalf.
        </li>
      </ol>
      <p>
        Incomplete notices slow things down. We aim to action valid notices
        within five business days.
      </p>

      <h2>Counter-notice</h2>
      <p>
        If your work was removed and you believe that was a mistake or a
        misidentification, you may send a counter-notice to the same address with
        your signature, identification of the removed material and its former
        location, a statement under penalty of perjury that you have a good-faith
        belief it was removed in error, and your contact details including
        consent to jurisdiction.
      </p>

      <h2>Right to be removed</h2>
      <p>
        Separately from copyright: if you are identifiable in any story on this
        site and want it taken down, email us and it comes down. You do not need
        to explain why, and you do not need a lawyer to ask.
      </p>

      <h2>Repeat infringers</h2>
      <p>
        Contributors who repeatedly post infringing material lose the ability to
        publish here.
      </p>
    </LegalPage>
  );
}
