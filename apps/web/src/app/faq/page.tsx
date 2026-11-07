import { PublicShell } from "@/components/public-shell";
import { FaqAccordion } from "@/components/faq-accordion";
import { en } from "@/lib/i18n/translations/en";

const SUPPORT_EMAIL = "bullandbear.journal@gmail.com";

const FAQ_ITEMS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => ({
  q: en[`faq.q${n}` as keyof typeof en] as string,
  a: en[`faq.a${n}` as keyof typeof en] as string,
}));

export default function FaqPage() {
  return (
    <PublicShell title={en["faq.title"]} subtitle={en["faq.subtitle"]}>
      <FaqAccordion
        items={FAQ_ITEMS}
        contactTitle={en["faq.contact.title"]}
        contactDescription={en["faq.contact.description"]}
        email={SUPPORT_EMAIL}
        labelCopy={en["faq.contact.copy"]}
        labelCopied={en["faq.contact.copied"]}
      />
    </PublicShell>
  );
}
